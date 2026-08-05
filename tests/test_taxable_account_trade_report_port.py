"""Human Trade Report Port / Fact Journal v1.0 — Implementation CR tests."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.decision import asset_selection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.hold_days import business_hold_days
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.port import TradeReportPort


def _swing_watch(eng: TaxableAccountEngine, *, crash: bool = True) -> None:
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(
        MarketSignals(dd15_ma200=True, crash_15=crash, semi_signal=not crash)
    )


def _ready_1570(eng: TaxableAccountEngine) -> None:
    _swing_watch(eng, crash=True)
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))
    assert eng.state.position_state == PositionState.ENTRY_READY


def test_entry_ready_buy_report_fills(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=12.0,
        )
    )
    assert r.accepted
    assert DomainEvent.ENTRY_FILLED.value in r.events
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    assert eng.state.entry_date == date(2024, 8, 1)
    assert eng.state.entry_price == 1000.0
    assert eng.state.risk_control.status == RiskStatus.ACTIVE
    lines = (tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 1
    row = json.loads(lines[0])
    assert row["validation_result"] == "ACCEPTED"
    assert row["routed_event"] == "ENTRY_FILLED"
    assert row["quantity"] == 12.0
    assert "quantity" in row


def test_quantity_journaled_without_affecting_position_risk_time(tmp_path: Path):
    """quantity is Trade Fact only — not Position / Risk / Time Exit control."""
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=9999.0,
        )
    )
    assert r.accepted
    assert eng.state.entry_price == 1000.0
    assert eng.state.entry_date == date(2024, 8, 1)
    assert eng.state.risk_control.stop_price == 850.0
    assert eng.state.max_hold_business_days == 20
    # State has no quantity field / no units control from Fact
    assert not hasattr(eng.state, "quantity")
    row = json.loads((tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip())
    assert row["quantity"] == 9999.0


def test_reject_non_positive_quantity(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=0.0,
        )
    )
    assert not r.accepted
    assert r.error == "quantity_must_be_positive_when_provided"
    row = json.loads((tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip())
    assert row["validation_result"] == "REJECTED"
    assert row["quantity"] == 0.0


def test_watch_delayed_recovery_to_active(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_watch(eng, crash=True)
    assert eng.state.position_state == PositionState.WATCH
    # lose opportunity without fill
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))
    eng.on_event(DomainEvent.SIGNAL_LOST)
    assert eng.state.position_state == PositionState.WATCH
    assert eng.state.signal_date is None

    calls = {"select": 0}

    def wrapped_select(*a, **k):
        calls["select"] += 1
        return asset_selection.select_asset(*a, **k)

    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    with patch.object(asset_selection, "select_asset", side_effect=wrapped_select):
        # also patch engine's imported select_asset
        with patch("taxable_account.engine.select_asset", side_effect=wrapped_select):
            r = port.submit(
                TradeReportRequest(
                    asset=Asset.NIKKEI_LEV_1570,
                    side=TradeSide.BUY,
                    trade_date=date(2024, 8, 1),
                    trade_price=1000.0,
                    confirm_flag=True,
                )
            )
    assert r.accepted
    assert DomainEvent.DELAYED_FILL_RECOVERY.value in r.events
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    assert eng.state.held_asset == Asset.NIKKEI_LEV_1570
    assert eng.state.entry_date == date(2024, 8, 1)
    # Recovery must not invoke Selection
    assert calls["select"] == 0


def test_past_trade_date_drives_time_and_risk(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_watch(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    trade_d = date(2024, 1, 10)
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=trade_d,
            trade_price=2000.0,
            confirm_flag=True,
        )
    )
    assert r.accepted
    assert eng.state.entry_date == trade_d
    assert eng.state.entry_price == 2000.0
    assert eng.state.risk_control.stop_price == 1700.0
    assert eng.state.max_hold_business_days == 20
    # hold days from trade_date, not report day
    as_of = date(2024, 2, 7)
    assert business_hold_days(trade_d, as_of) == 20


def test_reject_without_confirm(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=False,
        )
    )
    assert not r.accepted
    assert r.error == "confirm_flag_required"
    assert eng.state.position_state == PositionState.ENTRY_READY
    row = json.loads((tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip())
    assert row["validation_result"] == "REJECTED"


def test_reject_growth_buy(tmp_path: Path):
    eng = TaxableAccountEngine()
    assert eng.state.regime_state == RegimeState.GROWTH_ACTIVE
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
        )
    )
    assert not r.accepted
    assert r.error == "growth_regime_buy_forbidden"


def test_reject_active_buy(tmp_path: Path):
    eng = TaxableAccountEngine()
    _ready_1570(eng)
    eng.on_event(
        DomainEvent.ENTRY_FILLED,
        fill_asset=Asset.NIKKEI_LEV_1570,
        fill_price=1000.0,
        fill_date=date(2024, 8, 1),
    )
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 2),
            trade_price=1100.0,
            confirm_flag=True,
        )
    )
    assert not r.accepted
    assert r.error == "already_position_active"


def test_no_direct_watch_to_active_without_recovery_event():
    """WATCH cannot ENTRY_FILLED directly — TransitionError."""
    eng = TaxableAccountEngine()
    _swing_watch(eng)
    try:
        eng.on_event(
            DomainEvent.ENTRY_FILLED,
            fill_asset=Asset.NIKKEI_LEV_1570,
            fill_price=1000.0,
            fill_date=date(2024, 8, 1),
        )
        raised = False
    except Exception:
        raised = True
    assert raised
    assert eng.state.position_state == PositionState.WATCH


def test_delayed_recovery_does_not_call_entry_possible(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_watch(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    with patch("taxable_account.engine.entry_possible") as ep:
        r = port.submit(
            TradeReportRequest(
                asset=Asset.SEMI_282A,
                side=TradeSide.BUY,
                trade_date=date(2024, 8, 5),
                trade_price=200.0,
                confirm_flag=True,
            )
        )
        assert r.accepted
        ep.assert_not_called()
    assert eng.state.held_asset == Asset.SEMI_282A
    assert eng.state.risk_control.status == RiskStatus.NA
