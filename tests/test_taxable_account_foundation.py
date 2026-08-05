"""Phase 3 foundation tests — Legacy-independent."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import pytest

from taxable_account.decision.asset_selection import select_asset
from taxable_account.decision.regime import apply_regime_event, can_transition
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, TaxableAccountState, TransitionError
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus, SelectionReason
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.risk_control import arm_stop
from taxable_account.view.view_model import project_view_model


def test_no_legacy_imports():
    import taxable_account.engine as eng
    import taxable_account.decision.regime as reg
    import taxable_account.position.position_manager as pm

    for mod in (eng, reg, pm):
        src = Path(mod.__file__).read_text(encoding="utf-8")
        assert "sox_" not in src
        assert "ndx_" not in src
        assert "run_longterm" not in src
        assert "run_swing" not in src


def test_regime_happy_path():
    s = TaxableAccountState()
    apply_regime_event(s, DomainEvent.ALERT_ON)
    assert s.regime_state == RegimeState.EXIT_PENDING
    apply_regime_event(s, DomainEvent.TRANSFER_COMPLETE)
    assert s.regime_state == RegimeState.SWING_ACTIVE
    apply_regime_event(s, DomainEvent.ALERT_OFF)
    assert s.regime_state == RegimeState.REENTRY_PENDING
    apply_regime_event(s, DomainEvent.RECOVERY_COMPLETE)
    assert s.regime_state == RegimeState.GROWTH_ACTIVE


def test_regime_forbidden_direct_swing():
    s = TaxableAccountState()
    assert not can_transition(RegimeState.GROWTH_ACTIVE, DomainEvent.TRANSFER_COMPLETE)
    with pytest.raises(TransitionError):
        apply_regime_event(s, DomainEvent.TRANSFER_COMPLETE)


def test_asset_selection_priority():
    swing = RegimeState.SWING_ACTIVE
    both = MarketSignals(crash_15=True, semi_signal=True, dd15_ma200=True)
    r = select_asset(swing, both)
    assert r.asset == Asset.NIKKEI_LEV_1570
    assert r.reason == SelectionReason.CRASH_15

    semi = MarketSignals(crash_15=False, semi_signal=True, dd15_ma200=True)
    r2 = select_asset(swing, semi)
    assert r2.asset == Asset.SEMI_282A

    growth = select_asset(RegimeState.GROWTH_ACTIVE, MarketSignals())
    assert growth.asset == Asset.NOMURA_WORLD_SEMI


def test_risk_control_separated_from_position_enum():
    risk = arm_stop(1000.0)
    assert risk.status == RiskStatus.ACTIVE
    assert risk.stop_price == pytest.approx(850.0)
    # position state enum must not include RISK_CONTROL_ACTIVE
    assert "RISK_CONTROL_ACTIVE" not in {p.value for p in PositionState}


def test_engine_1570_stop_flow():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    assert eng.state.position_state == PositionState.WATCH

    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    assert eng.state.position_state == PositionState.ENTRY_READY
    assert eng.state.asset == Asset.NIKKEI_LEV_1570

    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=2000.0,
    )
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    assert eng.state.risk_control.status == RiskStatus.ACTIVE
    assert eng.state.risk_control.stop_price == pytest.approx(1700.0)

    eng.on_event(DomainEvent.STOP_TRIGGERED)
    assert eng.state.risk_control.status == RiskStatus.TRIGGERED
    assert eng.state.position_state == PositionState.EXIT

    eng.on_event(DomainEvent.EXIT_FILLED, fill_price=1690.0)
    assert eng.state.position_state == PositionState.REENTRY_WAIT
    assert eng.state.held_asset == Asset.CASH
    assert eng.state.risk_control.status == RiskStatus.NA


def test_state_to_dict_schema_keys():
    d = TaxableAccountState().to_dict()
    for key in (
        "schema_version",
        "regime_state",
        "position_state",
        "asset",
        "held_asset",
        "risk_control",
        "signals",
        "alert_on",
    ):
        assert key in d
    assert d["schema_version"] == "1.0"
    assert d["risk_control"]["status"] == "N/A"


def test_view_model_projection():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
    vm = project_view_model(eng.state, current_price=980.0)
    assert vm["schema_version"] == "2.1"
    assert vm["current_state"]["decision"] == "HOLD"
    assert vm["current_state"]["position_state"] == "RISK_CONTROL_ACTIVE"
    assert vm["position"]["risk_stop"]["stop_price"] == pytest.approx(850.0)
    assert vm["risk"]["stop_price"] == pytest.approx(850.0)
    assert "1570 Risk Stop ACTIVE" in vm["decision_reason"]["details"]
