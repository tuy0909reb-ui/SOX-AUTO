"""
Phase 5 — Operational View & Runtime Connection scenario tests.

No new trading rules. ViewModel projects State; Discord projects ViewModel.
"""

from __future__ import annotations

import ast
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
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus, SelectionReason
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.risk_control import arm_stop
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model, render_ops_text

PKG = ROOT / "taxable_account"
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


def _mc(
    d: date,
    *,
    alert: bool,
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
            recovery_b_days=20 if not alert else 0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


# ---------------------------------------------------------------------------
# Phase 5-1 — ViewModel shape / one-screen readability
# ---------------------------------------------------------------------------

def test_viewmodel_v2_required_sections():
    vm = project_view_model(TaxableAccountState())
    assert vm["schema_version"] == "2.1"
    assert set(vm.keys()) == VM_KEYS
    text = render_ops_text(vm)
    for header in (
        "[Current State]",
        "[Decision Reason]",
        "[Capital Flow]",
        "[Entry Timing]",
        "[Position]",
        "[Reference]",
    ):
        assert header in text


def test_scenario_growth_maintain_display():
    """野村保有 → 維持判断."""
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        position_state=PositionState.WAIT,
        asset=Asset.NOMURA_WORLD_SEMI,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        selection_reason=SelectionReason.GROWTH_DEFAULT,
        alert_on=False,
    )
    vm = project_view_model(st, current_price=110.0)
    assert vm["current_state"]["regime"] == "GROWTH_ACTIVE"
    assert vm["current_state"]["asset"]["display_name"] == "野村世界半導体株投資"
    assert vm["current_state"]["decision"] == "MAINTAIN"
    assert "Growth Phase継続" in vm["decision_reason"]["details"]
    assert vm["capital_flow"]["current"] == "野村保有"
    assert vm["entry_timing"]["status"] == "N/A"
    assert vm["position"] is None  # Growth WAIT is not a marked swing position
    text = render_ops_text(vm)
    assert "MAINTAIN" in text
    assert "野村" in text


def test_scenario_crash_shows_1570_candidate():
    """野村撤退後 → 1570候補."""
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    # EXIT_PENDING before transfer
    assert eng.state.regime_state == RegimeState.EXIT_PENDING
    vm_exit = project_view_model(eng.state)
    assert vm_exit["current_state"]["decision"] == "TRANSFER"
    assert any("警戒" in x or "Swing" in x for x in vm_exit["decision_reason"]["details"])

    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.state.asset = Asset.NIKKEI_LEV_1570
    eng.state.selection_reason = SelectionReason.CRASH_15
    eng.state.position_state = PositionState.WATCH
    vm = project_view_model(eng.state)
    assert vm["current_state"]["regime"] == "SWING_ACTIVE"
    active = [c for c in vm["capital_flow"]["swing_candidates"] if c["active"]]
    assert len(active) == 1
    assert active[0]["asset_display"] == "1570"
    assert vm["capital_flow"]["next_destination"] == "1570"
    assert "暴落反発フェイズ" in vm["decision_reason"]["details"]


def test_scenario_swing_hold_and_risk_display():
    """1570保有 → 継続 / Risk状態."""
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
    vm = project_view_model(st, current_price=960.0)
    assert vm["current_state"]["decision"] == "HOLD"
    assert vm["current_state"]["position_state"] == "RISK_CONTROL_ACTIVE"
    assert vm["position"] is not None
    assert vm["position"]["risk_stop"]["formula"] == "Entry × 0.85"
    assert vm["position"]["risk_stop"]["stop_price"] == pytest.approx(850.0)
    assert vm["position"]["risk_stop"]["status"] == "ACTIVE"
    assert vm["position"]["return_pct"] == pytest.approx(-0.04)
    assert "保有中Risk Stop監視" in vm["decision_reason"]["details"]


def test_scenario_swing_282a_switch_display():
    """semi_signal → 282A切替判断表示."""
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.SEMI_282A,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.SEMI_SIGNAL,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, semi_signal=True),
    )
    vm = project_view_model(st)
    assert vm["current_state"]["decision"] == "ENTRY_READY"
    assert vm["entry_timing"]["status"] == "ENTRY_READY"
    assert vm["entry_timing"]["asset_display"] == "282A"
    assert vm["entry_timing"]["reason"] == "半導体Swingフェイズ"
    assert vm["entry_status"]["status"] == "READY"
    assert vm["capital_flow"]["next_destination"] == "282A"


def test_scenario_recovery_nomura_reentry_display():
    """Swing終了 → 野村再投入条件."""
    st = TaxableAccountState(
        regime_state=RegimeState.REENTRY_PENDING,
        position_state=PositionState.WAIT,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.TRANSITIONAL,
        alert_on=False,
        signals=MarketSignals(recovery_model_b_met=False, recovery_b_days=12),
    )
    vm = project_view_model(st)
    assert vm["current_state"]["regime"] == "REENTRY_PENDING"
    assert vm["current_state"]["decision"] == "WAIT"
    assert any("Growth復帰" in x for x in vm["decision_reason"]["details"])
    assert vm["capital_flow"]["next_destination"] == "野村世界半導体株投資"
    assert "Growth復帰" in vm["entry_timing"]["reason"]


def test_entry_timing_wait_when_conditions_absent():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.WATCH,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.FLAT,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True),
    )
    vm = project_view_model(st)
    assert vm["entry_timing"]["status"] == "WAIT"
    assert vm["entry_timing"]["reason"] == "条件未成立"
    assert vm["capital_flow"]["next_destination"] == "CASH"


def test_exit_then_reentry_candidates_visible():
    """Exit後の再投入先候補が表示可能."""
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
    eng.on_event(DomainEvent.STOP_TRIGGERED)
    eng.on_event(DomainEvent.EXIT_FILLED, fill_price=840.0)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.state.asset = Asset.NIKKEI_LEV_1570
    eng.state.selection_reason = SelectionReason.CRASH_15
    vm = project_view_model(eng.state)
    assert vm["current_state"]["decision"] == "REENTRY_WAIT"
    assert vm["position"] is None
    cands = {c["asset_display"]: c["when"] for c in vm["capital_flow"]["swing_candidates"]}
    assert cands["1570"] == "暴落反発フェイズ"
    assert cands["282A"] == "半導体Swingフェイズ"
    assert cands["CASH"] == "条件なし"


# ---------------------------------------------------------------------------
# Phase 5-2 — Runtime connection integrity
# ---------------------------------------------------------------------------

def test_runtime_connects_to_viewmodel_and_discord():
    d0, d1 = date(2024, 5, 1), date(2024, 5, 2)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=True),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig(discord_dry_run=True))
    rt.step(d0)
    r1 = rt.step(d1)
    assert set(r1.view_model.keys()) == VM_KEYS
    assert r1.discord.dry_run is True
    assert "【大要塞｜特定口座】" in r1.discord.content
    assert "待機" in r1.discord.content or "防衛維持" in r1.discord.content or "撤退準備" in r1.discord.content
    names = {f["name"] for f in r1.discord.embed["fields"]}
    assert names == {
        "命令",
        "司令判断",
        "作戦理由",
        "戦力状況",
    }


def test_viewmodel_uses_state_only_no_engine_import():
    src = (PKG / "view" / "view_model.py").read_text(encoding="utf-8")
    assert "TaxableAccountEngine" not in src
    assert "select_asset" not in src
    assert "compute_crash" not in src
    assert "sox_" not in src


def test_discord_has_no_judgment_ast():
    tree = ast.parse((PKG / "view" / "discord_adapter.py").read_text(encoding="utf-8"))
    banned = {"select_asset", "apply_regime_event", "compute_dd15_ma200", "arm_stop"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            assert node.id not in banned
        if isinstance(node, ast.Attribute):
            assert node.attr not in banned


def test_no_legacy_in_ops_and_view():
    banned = ("sox_protocol", "ndx_sell", "run_longterm", "run_swing", "discord_morning")
    for path in list((PKG / "view").rglob("*.py")) + list((PKG / "ops").rglob("*.py")):
        text = path.read_text(encoding="utf-8")
        for b in banned:
            assert b not in text, f"{path} has {b}"


def test_decision_is_state_label_not_sensor_dump():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.WATCH,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
        selection_reason=SelectionReason.CRASH_15,
        alert_on=True,
    )
    vm = project_view_model(st)
    # reasons are judgment phrases; VM must not expose a raw signals dict section
    assert "signals" not in vm
    assert "dd15_ma200: True" not in render_ops_text(vm)
    assert "暴落反発フェイズ" in vm["decision_reason"]["details"]
