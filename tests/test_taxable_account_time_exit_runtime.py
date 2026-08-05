"""TIME_EXIT_DUE Runtime connection — existing spec wiring only (no rule change)."""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, ExitReason, PositionState, RiskStatus
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.hold_days import business_hold_days, time_exit_due
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime


def _mc(
    d: date,
    *,
    alert: bool = True,
    crash: bool = False,
    semi: bool = False,
    prices: dict | None = None,
) -> MarketCondition:
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


def _bdays(start: date, n: int) -> list[date]:
    """n business days starting at start (inclusive)."""
    idx = pd.bdate_range(start, periods=n)
    return [ts.date() for ts in idx]


def test_business_hold_days_matches_busday_count():
    entry = date(2024, 1, 2)  # Tue
    assert business_hold_days(entry, entry) == 0
    assert business_hold_days(entry, date(2024, 1, 3)) == 1
    assert business_hold_days(entry, date(2024, 1, 30)) == int(
        np.busday_count(entry, date(2024, 1, 30))
    )


def test_engine_time_exit_due_sets_exit_reason_time():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=date(2024, 1, 2),
    )
    assert eng.state.max_hold_business_days == 20
    eng.on_event(DomainEvent.TIME_EXIT_DUE)
    assert eng.state.position_state == PositionState.EXIT
    assert eng.state.exit_reason == ExitReason.TIME
    eng.on_event(DomainEvent.EXIT_FILLED, fill_price=1050.0, fill_date=date(2024, 1, 30))
    assert eng.state.position_state == PositionState.WATCH
    assert eng.state.exit_reason == ExitReason.TIME


def test_runtime_1570_time_exit_at_20_business_days():
    # days[0]=Growth, days[1]=Entry, days[21]=hold 20 → TIME_EXIT
    days = _bdays(date(2024, 1, 2), 22)
    entry_d = days[1]
    pre_d = days[20]
    due_d = days[21]
    assert business_hold_days(entry_d, pre_d) == 19
    assert business_hold_days(entry_d, due_d) == 20

    conds = {days[0]: _mc(days[0], alert=False)}
    for d in days[1:]:
        # stay in swing with crash; price above stop
        conds[d] = _mc(
            d,
            alert=True,
            crash=True,
            prices={
                "NOMURA_WORLD_SEMI": 90.0,
                "NIKKEI_LEV_1570": 1000.0,
                "SEMI_282A": 200.0,
            },
        )
    rt = TaxableAccountRuntime(ScriptedDetection(conds), config=RuntimeConfig())
    rt.step(days[0])
    r_entry = rt.step(entry_d)
    assert "ENTRY_FILLED" in r_entry.events
    assert rt.state.held_asset == Asset.NIKKEI_LEV_1570
    assert rt.state.entry_date == entry_d
    assert rt.state.max_hold_business_days == 20
    assert r_entry.time_exit is not None
    assert r_entry.time_exit["time_exit_status"] == "MONITORING"

    for d in days[2:20]:
        r = rt.step(d)
        assert "TIME_EXIT_DUE" not in r.events

    r_pre = rt.step(pre_d)
    assert "TIME_EXIT_DUE" not in r_pre.events
    assert r_pre.time_exit["current_holding_days"] == 19
    assert r_pre.time_exit["max_hold_business_days"] == 20
    assert r_pre.time_exit["time_exit_status"] == "MONITORING"

    r_due = rt.step(due_d)
    assert "TIME_EXIT_DUE" in r_due.events
    assert "EXIT_FILLED" in r_due.events
    assert "STOP_TRIGGERED" not in r_due.events
    assert rt.state.exit_reason == ExitReason.TIME
    assert rt.state.position_state == PositionState.WATCH
    assert rt.state.held_asset == Asset.CASH
    assert r_due.time_exit["time_exit_status"] == "TRIGGERED"
    assert r_due.time_exit["current_holding_days"] == 20
    assert r_due.time_exit["max_hold_business_days"] == 20


def test_runtime_282a_time_exit_at_15_business_days():
    # days[0]=Growth, days[1]=Entry, days[16]=hold 15 → TIME_EXIT
    days = _bdays(date(2024, 2, 1), 17)
    entry_d = days[1]
    pre_d = days[15]
    due_d = days[16]
    assert business_hold_days(entry_d, pre_d) == 14
    assert business_hold_days(entry_d, due_d) == 15

    conds = {days[0]: _mc(days[0], alert=False)}
    for d in days[1:]:
        conds[d] = _mc(
            d,
            alert=True,
            crash=False,
            semi=True,
            prices={
                "NOMURA_WORLD_SEMI": 90.0,
                "NIKKEI_LEV_1570": 1000.0,
                "SEMI_282A": 200.0,
            },
        )
    rt = TaxableAccountRuntime(ScriptedDetection(conds), config=RuntimeConfig())
    rt.step(days[0])
    r_entry = rt.step(entry_d)
    assert "ENTRY_FILLED" in r_entry.events
    assert rt.state.held_asset == Asset.SEMI_282A
    assert rt.state.max_hold_business_days == 15
    assert rt.state.risk_control.status == RiskStatus.NA

    for d in days[2:15]:
        r = rt.step(d)
        assert "TIME_EXIT_DUE" not in r.events

    r_pre = rt.step(pre_d)
    assert "TIME_EXIT_DUE" not in r_pre.events
    assert r_pre.time_exit["current_holding_days"] == 14

    r_due = rt.step(due_d)
    assert "TIME_EXIT_DUE" in r_due.events
    assert "EXIT_FILLED" in r_due.events
    assert rt.state.exit_reason == ExitReason.TIME
    assert rt.state.position_state == PositionState.WATCH
    assert r_due.time_exit["time_exit_status"] == "TRIGGERED"
    assert r_due.time_exit["max_hold_business_days"] == 15


def test_time_exit_does_not_override_risk_stop():
    """Stop path remains primary when breached; Time Exit must not replace it."""
    d0 = date(2024, 3, 1)
    d1 = date(2024, 3, 4)
    d2 = date(2024, 3, 5)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180},
            ),
            d2: _mc(
                d2,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 840, "SEMI_282A": 180},
            ),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig())
    rt.step(d0)
    rt.step(d1)
    r2 = rt.step(d2)
    assert "STOP_TRIGGERED" in r2.events
    assert "TIME_EXIT_DUE" not in r2.events
    assert rt.state.exit_reason == ExitReason.STOP_TRIGGERED
    assert rt.state.position_state == PositionState.REENTRY_WAIT


def test_time_exit_due_helper_respects_max_hold():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, semi_signal=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.SEMI_282A,
        fill_price=200.0,
        fill_date=date(2024, 5, 1),
    )
    assert time_exit_due(eng.state, date(2024, 5, 1)) is False
    assert business_hold_days(date(2024, 5, 1), date(2024, 5, 21)) == 14
    assert time_exit_due(eng.state, date(2024, 5, 21)) is False
    due = date(2024, 5, 22)
    assert business_hold_days(date(2024, 5, 1), due) == 15
    assert time_exit_due(eng.state, due) is True
