"""Live State Alignment CR-1.0 — Case A/B (HTR before Position completion)."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.runtime.session import (
    RuntimeConfig,
    TaxableAccountRuntime,
    live_ops_runtime_config,
)
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.port import TradeReportPort


def _mc(d: date, *, alert: bool, crash: bool = False, prices: dict | None = None) -> MarketCondition:
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=alert,
            crash_15=crash,
            semi_signal=False,
            recovery_model_b_met=(not alert),
            recovery_b_days=0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


def test_live_ops_config_disables_position_auto_complete():
    cfg = live_ops_runtime_config()
    assert cfg.auto_transfer is False
    assert cfg.auto_exit_fill is False
    assert cfg.auto_fill is False


def test_case_b_exit_pending_without_trade_report_keeps_position():
    """Case B: Decision EXIT_PENDING, no Human report → Position/regime not completed."""
    d0 = date(2024, 6, 3)
    d1 = date(2024, 6, 4)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True),
        }
    )
    rt = TaxableAccountRuntime(src, config=live_ops_runtime_config())
    rt.step(d0)
    assert rt.state.regime_state == RegimeState.GROWTH_ACTIVE
    assert rt.state.held_asset == Asset.NOMURA_WORLD_SEMI

    r1 = rt.step(d1)
    assert rt.state.regime_state == RegimeState.EXIT_PENDING
    assert rt.state.held_asset == Asset.NOMURA_WORLD_SEMI
    assert DomainEvent.TRANSFER_COMPLETE.value not in r1.events
    assert rt.state.position_state != PositionState.EXIT


def test_case_a_trade_report_then_position_updates(tmp_path: Path):
    """Case A: EXIT_PENDING + HTR SELL → Trade Fact then TRANSFER_COMPLETE / Position sync."""
    d0 = date(2024, 6, 3)
    d1 = date(2024, 6, 4)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True),
        }
    )
    eng = TaxableAccountEngine()
    rt = TaxableAccountRuntime(src, config=live_ops_runtime_config(), engine=eng)
    rt.step(d0)
    rt.step(d1)
    assert eng.state.regime_state == RegimeState.EXIT_PENDING

    journal_path = tmp_path / "facts.jsonl"
    port = TradeReportPort(eng, TradeFactJournal(journal_path))
    result = port.submit(
        TradeReportRequest(
            asset=Asset.NOMURA_WORLD_SEMI,
            side=TradeSide.SELL,
            trade_date=d1,
            trade_price=99.0,
            confirm_flag=True,
            quantity=10.0,
        )
    )
    assert result.accepted
    assert DomainEvent.TRANSFER_COMPLETE.value in result.events
    assert eng.state.regime_state == RegimeState.SWING_ACTIVE
    assert eng.state.held_asset == Asset.CASH
    row = json.loads(journal_path.read_text(encoding="utf-8").strip())
    assert row["validation_result"] == "ACCEPTED"
    assert row["routed_event"] == "TRANSFER_COMPLETE"


def test_live_config_exit_not_auto_filled_after_stop():
    """Live: STOP → EXIT stays until HTR (no auto_exit_fill)."""
    d0 = date(2024, 7, 1)
    d1 = date(2024, 7, 2)
    d2 = date(2024, 7, 3)
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
                    "SEMI_282A": 200.0,
                },
            ),
            d2: _mc(
                d2,
                alert=True,
                crash=True,
                prices={
                    "NOMURA_WORLD_SEMI": 90.0,
                    "NIKKEI_LEV_1570": 840.0,  # below 15% stop from 1000
                    "SEMI_282A": 200.0,
                },
            ),
        }
    )
    # Paper-style entry fill, then Live-style exit (no auto_exit_fill)
    rt = TaxableAccountRuntime(
        src,
        config=RuntimeConfig(
            auto_transfer=True,
            auto_fill=True,
            auto_exit_fill=False,
            discord_dry_run=True,
        ),
    )
    rt.step(d0)
    rt.step(d1)
    assert rt.state.position_state == PositionState.POSITION_ACTIVE
    assert rt.state.held_asset == Asset.NIKKEI_LEV_1570
    r2 = rt.step(d2)
    assert rt.state.position_state == PositionState.EXIT
    assert DomainEvent.EXIT_FILLED.value not in r2.events
    assert rt.state.exit_price is None


def test_paper_simulation_auto_transfer_still_works():
    """Paper/Replay: Simulation auto_transfer retained."""
    d0 = date(2024, 6, 3)
    d1 = date(2024, 6, 4)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True),
        }
    )
    rt = TaxableAccountRuntime(
        src,
        config=RuntimeConfig(auto_transfer=True, auto_fill=False, auto_exit_fill=True),
    )
    rt.step(d0)
    r1 = rt.step(d1)
    assert DomainEvent.TRANSFER_COMPLETE.value in r1.events
    assert rt.state.regime_state == RegimeState.SWING_ACTIVE
