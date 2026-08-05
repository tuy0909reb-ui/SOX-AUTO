"""signal_date SoT — Entry condition day vs purchase day (no rule change)."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, ExitReason, PositionState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.hold_days import business_hold_days
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.view.view_model import project_view_model


def _mc(d, *, alert=True, crash=False, semi=False, prices=None):
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=alert,
            crash_15=crash,
            semi_signal=semi and not crash,
            recovery_model_b_met=not alert,
            recovery_b_days=0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 90.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


def test_signal_date_set_on_entry_ready_preserved_on_fill():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))
    assert eng.state.position_state == PositionState.ENTRY_READY
    assert eng.state.signal_date == date(2024, 8, 1)
    assert eng.state.entry_date is None

    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=date(2024, 8, 3),
    )
    assert eng.state.signal_date == date(2024, 8, 1)
    assert eng.state.entry_date == date(2024, 8, 3)
    assert eng.state.max_hold_business_days == 20


def test_signal_lost_clears_signal_date_reestablish_is_new():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))
    eng.on_event(DomainEvent.SIGNAL_LOST)
    assert eng.state.signal_date is None
    assert eng.state.position_state == PositionState.WATCH

    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 5))
    assert eng.state.signal_date == date(2024, 8, 5)


def test_time_exit_uses_entry_date_not_signal_date():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 1, 2))
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=date(2024, 1, 10),
    )
    # 20 bd from entry 1/10, not from signal 1/2
    assert business_hold_days(date(2024, 1, 10), date(2024, 2, 7)) == 20
    assert business_hold_days(date(2024, 1, 2), date(2024, 2, 7)) > 20

    days = [ts.date() for ts in pd.bdate_range("2024-01-02", periods=40)]
    # build runtime with delayed fill
    conds = {days[0]: _mc(days[0], alert=False)}
    for d in days[1:]:
        conds[d] = _mc(d, alert=True, crash=True)
    rt = TaxableAccountRuntime(
        ScriptedDetection(conds),
        config=RuntimeConfig(auto_fill=False),
    )
    rt.step(days[0])
    r_sig = rt.step(days[1])
    assert "SIGNAL_ENTRY_AVAILABLE" in r_sig.events
    assert rt.state.signal_date == days[1]
    assert rt.state.position_state == PositionState.ENTRY_READY

    # fill later
    fill_d = days[3]
    rt.engine.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=fill_d,
    )
    assert rt.state.entry_date == fill_d
    assert rt.state.signal_date == days[1]

    # step until time exit from entry_date
    due = None
    for d in days[4:]:
        r = rt.step(d)
        if "TIME_EXIT_DUE" in r.events:
            due = d
            break
    assert due is not None
    assert business_hold_days(fill_d, due) == 20
    assert rt.state.exit_reason == ExitReason.TIME


def test_runtime_signal_lost_when_condition_drops():
    d0 = date(2024, 6, 3)
    d1 = date(2024, 6, 4)
    d2 = date(2024, 6, 5)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=True),
            d2: _mc(d2, alert=True, crash=False, semi=False),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig(auto_fill=False))
    rt.step(d0)
    r1 = rt.step(d1)
    assert rt.state.position_state == PositionState.ENTRY_READY
    assert rt.state.signal_date == d1
    r2 = rt.step(d2)
    assert "SIGNAL_LOST" in r2.events
    assert rt.state.signal_date is None
    assert rt.state.position_state == PositionState.WATCH


def test_viewmodel_and_discord_distinguish_signal_and_entry():
    from taxable_account.domain.models import TaxableAccountState
    from taxable_account.domain.states import RegimeState, SelectionReason
    from taxable_account.view.discord_adapter import project_discord_payload

    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.CASH,
        signal_date=date(2024, 8, 1),
        selection_reason=SelectionReason.CRASH_15,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
        alert_on=True,
    )
    vm = project_view_model(st, as_of=date(2024, 8, 3))
    assert vm["entry_status"]["status"] == "READY"
    assert vm["entry_status"]["status_label"] == "投入待ち"
    assert vm["entry_status"]["signal_date"] == "2024-08-01"
    assert vm["entry_status"]["entry_date"] is None
    disc = project_discord_payload(vm, dry_run=True)
    entry_field = next(f for f in disc.embed["fields"] if f["name"] == "Entry状態")
    assert "投入待ち" in entry_field["value"]
    assert "2024-08-01" in entry_field["value"]
    assert "未投入" in entry_field["value"]

    st.position_state = PositionState.POSITION_ACTIVE
    st.held_asset = Asset.NIKKEI_LEV_1570
    st.entry_date = date(2024, 8, 3)
    st.entry_price = 1000.0
    st.max_hold_business_days = 20
    vm2 = project_view_model(st, current_price=1100.0, as_of=date(2024, 8, 10))
    assert vm2["entry_status"]["status"] == "FILLED"
    assert vm2["entry_status"]["signal_date"] == "2024-08-01"
    assert vm2["entry_status"]["entry_date"] == "2024-08-03"
    assert vm2["entry_status"]["current_holding_days"] == business_hold_days(
        date(2024, 8, 3), date(2024, 8, 10)
    )
    hold_field = next(
        f for f in project_discord_payload(vm2, dry_run=True).embed["fields"] if f["name"] == "保有期間 / Exit監視"
    )
    assert "/ 20営業日" in hold_field["value"]
