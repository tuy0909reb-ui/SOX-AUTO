"""
Phase 5.1 — ViewModel reference numbers & Discord display (no trading rule changes).
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState, SelectionReason
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.risk_control import arm_stop
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model, render_ops_text

VM_KEYS = {
    "schema_version",
    "as_of",
    "current_state",
    "decision_reason",
    "signal",
    "capital_flow",
    "entry_timing",
    "entry_status",
    "reference",
    "risk",
    "next_action",
    "position",
}

DISCORD_FIELDS = {
    "命令",
    "司令判断",
    "作戦理由",
    "戦力状況",
}


def _mc(d, *, alert, crash=False, semi=False, prices=None):
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=alert,
            crash_15=crash,
            semi_signal=semi and not crash,
            recovery_model_b_met=not alert,
            recovery_b_days=20 if not alert else 0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


def test_schema_2_1_keys():
    vm = project_view_model(TaxableAccountState())
    assert vm["schema_version"] == "2.1"
    assert set(vm.keys()) == VM_KEYS
    for k in ("current_asset", "previous_asset", "next_candidate", "reason"):
        assert k in vm["capital_flow"]
    for k in ("entry_price", "current_price", "pnl_pct", "holding_days", "drawdown_from_high_pct"):
        assert k in vm["reference"]
    for k in (
        "status",
        "status_label",
        "candidate",
        "blocking_reason",
        "signal_date",
        "entry_date",
        "current_holding_days",
        "max_hold_business_days",
        "time_exit_status",
    ):
        assert k in vm["entry_status"]


def test_scenario1_normal_growth_reference():
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        position_state=PositionState.WAIT,
        asset=Asset.NOMURA_WORLD_SEMI,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        selection_reason=SelectionReason.GROWTH_DEFAULT,
        entry_date=date(2023, 1, 4),
        entry_price=100.0,
        alert_on=False,
    )
    vm = project_view_model(
        st,
        current_price=112.0,
        high_price=120.0,
        as_of=date(2024, 1, 5),
    )
    assert vm["current_state"]["decision"] == "MAINTAIN"
    assert "野村" in vm["current_state"]["asset"]["display_name"]
    assert vm["capital_flow"]["current_asset"] == "野村世界半導体株投資"
    assert vm["reference"]["pnl_pct"] == pytest.approx(0.12)
    assert vm["reference"]["holding_days"] == (date(2024, 1, 5) - date(2023, 1, 4)).days
    assert vm["reference"]["drawdown_from_high_pct"] == pytest.approx(112 / 120 - 1)
    assert vm["next_action"] == "待機（介入不要）"
    disc = project_discord_payload(vm, state=st)
    names = {f["name"] for f in disc.embed["fields"]}
    assert names == DISCORD_FIELDS
    assert disc.embed["fields"][0]["value"] == "待機（介入不要）"
    assert "防衛維持" in disc.content
    assert "世界半導体株投資" in disc.content


def test_scenario2_alert_on_capital_flow():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=False, semi_signal=True))
    vm = project_view_model(eng.state)
    assert vm["current_state"]["decision"] == "TRANSFER"
    assert "Swing" in vm["capital_flow"]["reason"] or "警戒" in vm["capital_flow"]["reason"]
    assert "Swing" in vm["capital_flow"]["next_candidate"] or "282A" in vm["capital_flow"]["next_candidate"]


def test_scenario3_crash15_entry_ready():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.CRASH_15,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
    )
    vm = project_view_model(st)
    assert vm["capital_flow"]["next_candidate"] == "1570"
    assert vm["entry_status"]["status"] == "READY"
    assert vm["entry_status"]["candidate"] == "1570"
    assert "暴落反発" in (vm["entry_status"]["blocking_reason"] or "") or "暴落反発" in vm["entry_timing"]["reason"]
    assert vm["signal"] == "crash_15"


def test_scenario4_1570_holding_risk_and_reference():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.NIKKEI_LEV_1570,
        selection_reason=SelectionReason.CRASH_15,
        entry_date=date(2024, 2, 2),
        entry_price=1000.0,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
        risk_control=arm_stop(1000.0),
    )
    vm = project_view_model(st, current_price=960.0, as_of=date(2024, 2, 12))
    assert vm["current_state"]["decision"] == "HOLD"
    assert vm["reference"]["entry_price"] == 1000.0
    assert vm["reference"]["current_price"] == 960.0
    assert vm["reference"]["pnl_pct"] == pytest.approx(-0.04)
    assert vm["reference"]["holding_days"] == 10
    assert vm["risk"]["applicable"] is True
    assert vm["risk"]["stop_price"] == pytest.approx(850.0)
    assert vm["risk"]["distance_pct"] == pytest.approx((960 - 850) / 960)
    assert vm["capital_flow"]["previous_asset"] == "CASH"
    assert vm["capital_flow"]["current_asset"] == "1570"
    assert "待機（介入不要）" in vm["next_action"]
    text = render_ops_text(vm)
    assert "Risk Stop" in text
    disc = project_discord_payload(vm, state=st)
    force = next(f for f in disc.embed["fields"] if f["name"] == "戦力状況")
    assert force["value"] == "1570"
    assert next(f for f in disc.embed["fields"] if f["name"] == "司令判断")["value"] == "前線維持"


def test_scenario5_1570_stop_exit_reentry_wait():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
    eng.on_event(DomainEvent.STOP_TRIGGERED)
    assert eng.state.position_state.value == "EXIT" or eng.state.risk_control.status.value == "TRIGGERED"
    vm_exit = project_view_model(eng.state, current_price=840.0)
    assert vm_exit["current_state"]["decision"] == "EXIT"
    eng.on_event(DomainEvent.EXIT_FILLED, fill_price=840.0)
    vm = project_view_model(eng.state)
    assert vm["current_state"]["decision"] == "REENTRY_WAIT"
    assert vm["capital_flow"]["current_asset"] == "CASH"
    assert vm["capital_flow"]["previous_asset"] == "1570"


def test_scenario6_282a_holding_semi_signal():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        asset=Asset.SEMI_282A,
        held_asset=Asset.SEMI_282A,
        selection_reason=SelectionReason.SEMI_SIGNAL,
        entry_date=date(2024, 6, 3),
        entry_price=200.0,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, semi_signal=True),
    )
    vm = project_view_model(st, current_price=210.0, as_of=date(2024, 6, 10))
    assert vm["signal"] == "semi_signal"
    assert vm["current_state"]["asset"]["display_name"] == "282A"
    assert vm["reference"]["pnl_pct"] == pytest.approx(0.05)
    assert "待機（介入不要）" in vm["next_action"]
    assert vm["risk"]["applicable"] is False
    disc = project_discord_payload(vm, state=st)
    assert "前線維持" in disc.content or "282A" in disc.content


def test_scenario7_recovery_nomura_candidate():
    st = TaxableAccountState(
        regime_state=RegimeState.REENTRY_PENDING,
        position_state=PositionState.WAIT,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.TRANSITIONAL,
        alert_on=False,
        signals=MarketSignals(recovery_model_b_met=False, recovery_b_days=8),
    )
    vm = project_view_model(st)
    assert vm["capital_flow"]["next_candidate"] == "野村世界半導体株投資"
    assert "Growth復帰" in vm["capital_flow"]["reason"]
    assert vm["entry_status"]["status"] == "WAIT"
    assert vm["entry_status"]["candidate"] == "野村世界半導体株投資"
    assert "Growth復帰" in vm["entry_status"]["blocking_reason"]


def test_discord_field_priority_and_no_judgment():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        entry_price=1000.0,
        entry_date=date(2024, 1, 2),
        risk_control=arm_stop(1000.0),
        signals=MarketSignals(crash_15=True, dd15_ma200=True),
        selection_reason=SelectionReason.CRASH_15,
    )
    vm = project_view_model(st, current_price=900.0, as_of=date(2024, 1, 10))
    disc = project_discord_payload(vm, dry_run=True, state=st)
    names = [f["name"] for f in disc.embed["fields"]]
    assert names == [
        "命令",
        "司令判断",
        "作戦理由",
        "戦力状況",
    ]
    assert set(names) == DISCORD_FIELDS
    assert disc.embed["title"] == "【大要塞｜特定口座】"
    src = Path(project_discord_payload.__code__.co_filename).read_text(encoding="utf-8")
    assert "select_asset" not in src
    assert "compute_crash" not in src


def test_runtime_passes_as_of_into_reference():
    d0, d1 = date(2024, 7, 1), date(2024, 7, 2)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={
                    "NOMURA_WORLD_SEMI": 90.0,
                    "NIKKEI_LEV_1570": 1000.0,
                    "SEMI_282A": 180.0,
                },
            ),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig())
    rt.step(d0)
    r1 = rt.step(d1)
    assert r1.view_model["schema_version"] == "2.1"
    assert r1.view_model["reference"]["entry_price"] == pytest.approx(1000.0)
    assert r1.view_model["as_of"] == "2024-07-02"
