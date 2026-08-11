"""Asset Registry / Routing Policy — Port dispatch and Growth Fact coverage."""

from __future__ import annotations

import inspect
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.domain.asset_registry import (
    DEFAULT_ASSET_REGISTRY,
    AssetRecord,
    AssetRegistry,
    AssetType,
    RoutingPolicy,
    Sleeve,
)
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.discord_input import DiscordTradeInputAdapter
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.port import TradeReportPort
from taxable_account.trade import routing as routing_mod


def _swing_ready(eng: TaxableAccountEngine) -> None:
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True, semi_signal=False))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=date(2024, 8, 1))


def test_registry_seed_routing_policies():
    assert (
        DEFAULT_ASSET_REGISTRY.routing_policy_for(Asset.NIKKEI_LEV_1570)
        == RoutingPolicy.SWING_POSITION
    )
    assert (
        DEFAULT_ASSET_REGISTRY.routing_policy_for(Asset.SEMI_282A)
        == RoutingPolicy.SWING_POSITION
    )
    assert (
        DEFAULT_ASSET_REGISTRY.routing_policy_for(Asset.NOMURA_WORLD_SEMI)
        == RoutingPolicy.GROWTH_REGIME
    )
    assert DEFAULT_ASSET_REGISTRY.routing_policy_for(Asset.CASH) == RoutingPolicy.NONE


def test_registry_alias_resolution():
    assert DEFAULT_ASSET_REGISTRY.resolve("1570") == Asset.NIKKEI_LEV_1570
    assert DEFAULT_ASSET_REGISTRY.resolve("282A") == Asset.SEMI_282A
    assert DEFAULT_ASSET_REGISTRY.resolve("NOMURA") == Asset.NOMURA_WORLD_SEMI
    assert DEFAULT_ASSET_REGISTRY.resolve("野村世界半導体株投資") == Asset.NOMURA_WORLD_SEMI
    assert DEFAULT_ASSET_REGISTRY.resolve("世界半導体株投資") == Asset.NOMURA_WORLD_SEMI
    assert DEFAULT_ASSET_REGISTRY.resolve("野村") == Asset.NOMURA_WORLD_SEMI


def test_port_swing_via_registry_dispatch(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_ready(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=1.0,
        )
    )
    assert r.accepted
    assert eng.state.position_state == PositionState.POSITION_ACTIVE


def test_port_reject_unregistered_asset(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_ready(eng)
    # Isolated registry without 1570 — proves lookup gate, not asset-name if.
    registry = AssetRegistry(
        [
            AssetRecord(
                asset_id=Asset.SEMI_282A,
                aliases=("282A",),
                sleeve=Sleeve.SWING,
                routing_policy=RoutingPolicy.SWING_POSITION,
                asset_type=AssetType.ETF,
            ),
            AssetRecord(
                asset_id=Asset.CASH,
                aliases=("CASH",),
                sleeve=Sleeve.CASH,
                routing_policy=RoutingPolicy.NONE,
                asset_type=AssetType.CASH,
            ),
        ]
    )
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"), registry=registry)
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NIKKEI_LEV_1570,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1000.0,
            confirm_flag=True,
            quantity=1.0,
        )
    )
    assert not r.accepted
    assert r.error == "asset_not_registered"


def test_port_reject_cash_not_tradeable(tmp_path: Path):
    eng = TaxableAccountEngine()
    _swing_ready(eng)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.CASH,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=1.0,
            confirm_flag=True,
            quantity=1.0,
        )
    )
    assert not r.accepted
    assert r.error == "asset_not_tradeable"


def test_growth_sell_transfer_complete(tmp_path: Path):
    eng = TaxableAccountEngine()
    assert eng.state.regime_state == RegimeState.GROWTH_ACTIVE
    eng.on_event(DomainEvent.ALERT_ON)
    assert eng.state.regime_state == RegimeState.EXIT_PENDING
    assert eng.state.held_asset == Asset.NOMURA_WORLD_SEMI

    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NOMURA_WORLD_SEMI,
            side=TradeSide.SELL,
            trade_date=date(2024, 8, 1),
            trade_price=100.0,
            confirm_flag=True,
            quantity=10.0,
        )
    )
    assert r.accepted
    assert DomainEvent.TRANSFER_COMPLETE.value in r.events
    assert eng.state.regime_state == RegimeState.SWING_ACTIVE
    assert eng.state.position_state == PositionState.WATCH
    assert eng.state.held_asset == Asset.CASH
    row = json.loads((tmp_path / "facts.jsonl").read_text(encoding="utf-8").strip())
    assert row["routed_event"] == "TRANSFER_COMPLETE"
    assert row["side"] == "SELL"


def test_growth_buy_recovery_complete(tmp_path: Path):
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.on_event(DomainEvent.ALERT_OFF)
    assert eng.state.regime_state == RegimeState.REENTRY_PENDING

    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NOMURA_WORLD_SEMI,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 15),
            trade_price=110.0,
            confirm_flag=True,
            quantity=5.0,
        )
    )
    assert r.accepted
    assert DomainEvent.RECOVERY_COMPLETE.value in r.events
    assert eng.state.regime_state == RegimeState.GROWTH_ACTIVE
    assert eng.state.position_state == PositionState.WAIT
    assert eng.state.held_asset == Asset.NOMURA_WORLD_SEMI


def test_growth_buy_while_active_rejected(tmp_path: Path):
    eng = TaxableAccountEngine()
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NOMURA_WORLD_SEMI,
            side=TradeSide.BUY,
            trade_date=date(2024, 8, 1),
            trade_price=100.0,
            confirm_flag=True,
            quantity=1.0,
        )
    )
    assert not r.accepted
    assert r.error == "growth_already_active"


def test_growth_sell_without_exit_pending_rejected(tmp_path: Path):
    eng = TaxableAccountEngine()
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    r = port.submit(
        TradeReportRequest(
            asset=Asset.NOMURA_WORLD_SEMI,
            side=TradeSide.SELL,
            trade_date=date(2024, 8, 1),
            trade_price=100.0,
            confirm_flag=True,
            quantity=1.0,
        )
    )
    assert not r.accepted
    assert r.error == "growth_sell_requires_exit_pending"


def test_discord_alias_via_registry(tmp_path: Path):
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    port = TradeReportPort(eng, TradeFactJournal(tmp_path / "facts.jsonl"))
    ad = DiscordTradeInputAdapter(port, allowed_operator_ids=("42",))
    draft = ad.create_draft(
        operator_id="42",
        asset="NOMURA",
        side="SELL",
        trade_date="2024-08-01",
        trade_price=100.0,
        quantity=1.0,
    )
    assert draft.asset == Asset.NOMURA_WORLD_SEMI
    result = ad.confirm_and_submit(draft.report_id, "42")
    assert result.accepted


def test_port_has_no_per_asset_hardcode_branch():
    import taxable_account.trade.port as port_mod

    src = inspect.getsource(port_mod)
    assert "NIKKEI_LEV_1570" not in src
    assert "SEMI_282A" not in src
    assert "NOMURA_WORLD_SEMI" not in src
    assert "_SWING_ASSETS" not in src
    assert "resolve_policy" in src
    assert "handler_for" in src


def test_routing_module_exports_policies():
    assert hasattr(routing_mod, "SwingPositionRouting")
    assert hasattr(routing_mod, "GrowthRegimeRouting")
