"""Routing Policy handlers — Fact → existing Domain Events (no Protocol judgment).

SWING_POSITION: ENTRY_FILLED / EXIT_FILLED / Delayed Recovery
GROWTH_REGIME:  TRANSFER_COMPLETE / RECOVERY_COMPLETE (existing Regime path)
"""

from __future__ import annotations

from typing import Optional, Protocol

from taxable_account.domain.asset_registry import AssetRegistry, RoutingPolicy
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import TaxableAccountState, TransitionError
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.facts import TradeReportRequest, TradeSide

_WATCH_LIKE = (PositionState.WATCH, PositionState.REENTRY_WAIT)


class RoutingHandler(Protocol):
    def validate(self, request: TradeReportRequest, account: TaxableAccountState) -> Optional[str]:
        ...

    def route(
        self,
        request: TradeReportRequest,
        account: TaxableAccountState,
        engine: TaxableAccountEngine,
    ) -> tuple[str, list[str]]:
        ...


class SwingPositionRouting:
    """Swing Sleeve → Position SM (existing ENTRY/EXIT paths)."""

    def validate(self, request: TradeReportRequest, account: TaxableAccountState) -> Optional[str]:
        if request.side == TradeSide.BUY:
            if account.position_state == PositionState.POSITION_ACTIVE:
                return "already_position_active"
            if account.position_state == PositionState.EXIT:
                return "exit_in_progress"
            if account.regime_state == RegimeState.GROWTH_ACTIVE:
                return "growth_regime_buy_forbidden"
            if account.regime_state == RegimeState.EXIT_PENDING:
                return "exit_pending_buy_forbidden"
            return None

        if account.position_state not in (PositionState.POSITION_ACTIVE, PositionState.EXIT):
            return "sell_state_mismatch"
        if account.held_asset != request.asset:
            return "sell_asset_mismatch"
        return None

    def route(
        self,
        request: TradeReportRequest,
        account: TaxableAccountState,
        engine: TaxableAccountEngine,
    ) -> tuple[str, list[str]]:
        if request.side == TradeSide.BUY:
            return self._route_buy(request, account, engine)
        return self._route_sell(request, account, engine)

    def _route_buy(
        self,
        request: TradeReportRequest,
        account: TaxableAccountState,
        engine: TaxableAccountEngine,
    ) -> tuple[str, list[str]]:
        events: list[str] = []

        if (
            account.position_state == PositionState.ENTRY_READY
            and account.asset == request.asset
        ):
            engine.on_event(
                DomainEvent.ENTRY_FILLED,
                fill_asset=request.asset,
                fill_price=float(request.trade_price),
                fill_date=request.trade_date,
            )
            events.append(DomainEvent.ENTRY_FILLED.value)
            return DomainEvent.ENTRY_FILLED.value, events

        if (
            account.regime_state == RegimeState.SWING_ACTIVE
            and account.held_asset == Asset.CASH
            and account.position_state in _WATCH_LIKE
        ):
            engine.on_event(
                DomainEvent.DELAYED_FILL_RECOVERY,
                fill_asset=request.asset,
                fill_price=float(request.trade_price),
                fill_date=request.trade_date,
                signal_date=account.signal_date or request.trade_date,
            )
            events.append(DomainEvent.DELAYED_FILL_RECOVERY.value)
            events.append(DomainEvent.ENTRY_FILLED.value)
            return DomainEvent.DELAYED_FILL_RECOVERY.value, events

        if account.position_state == PositionState.ENTRY_READY:
            raise TransitionError("entry_ready_asset_mismatch")
        raise TransitionError("no_valid_buy_route")

    def _route_sell(
        self,
        request: TradeReportRequest,
        account: TaxableAccountState,
        engine: TaxableAccountEngine,
    ) -> tuple[str, list[str]]:
        events: list[str] = []

        if account.position_state == PositionState.EXIT:
            engine.on_event(
                DomainEvent.EXIT_FILLED,
                fill_price=float(request.trade_price),
                fill_date=request.trade_date,
            )
            events.append(DomainEvent.EXIT_FILLED.value)
            return DomainEvent.EXIT_FILLED.value, events

        if account.position_state == PositionState.POSITION_ACTIVE:
            engine.on_event(DomainEvent.ABNORMAL_EXIT)
            events.append(DomainEvent.ABNORMAL_EXIT.value)
            engine.on_event(
                DomainEvent.EXIT_FILLED,
                fill_price=float(request.trade_price),
                fill_date=request.trade_date,
            )
            events.append(DomainEvent.EXIT_FILLED.value)
            return DomainEvent.EXIT_FILLED.value, events

        raise TransitionError("no_valid_sell_route")


class GrowthRegimeRouting:
    """Growth Sleeve → existing Regime events (not Swing ENTRY/EXIT SM)."""

    def validate(self, request: TradeReportRequest, account: TaxableAccountState) -> Optional[str]:
        if request.side == TradeSide.BUY:
            if account.regime_state == RegimeState.REENTRY_PENDING:
                return None
            if account.regime_state == RegimeState.GROWTH_ACTIVE:
                return "growth_already_active"
            return "no_valid_growth_buy_route"

        # SELL = Human confirms transfer out of Growth product
        if account.regime_state != RegimeState.EXIT_PENDING:
            return "growth_sell_requires_exit_pending"
        if account.held_asset != request.asset:
            return "sell_asset_mismatch"
        return None

    def route(
        self,
        request: TradeReportRequest,
        account: TaxableAccountState,
        engine: TaxableAccountEngine,
    ) -> tuple[str, list[str]]:
        events: list[str] = []

        if request.side == TradeSide.BUY:
            if account.regime_state != RegimeState.REENTRY_PENDING:
                raise TransitionError("no_valid_growth_buy_route")
            engine.on_event(DomainEvent.RECOVERY_COMPLETE)
            events.append(DomainEvent.RECOVERY_COMPLETE.value)
            return DomainEvent.RECOVERY_COMPLETE.value, events

        if account.regime_state != RegimeState.EXIT_PENDING:
            raise TransitionError("growth_sell_requires_exit_pending")
        if account.held_asset != request.asset:
            raise TransitionError("sell_asset_mismatch")
        engine.on_event(DomainEvent.TRANSFER_COMPLETE)
        events.append(DomainEvent.TRANSFER_COMPLETE.value)
        return DomainEvent.TRANSFER_COMPLETE.value, events


def handler_for(policy: RoutingPolicy) -> RoutingHandler:
    if policy == RoutingPolicy.SWING_POSITION:
        return SwingPositionRouting()
    if policy == RoutingPolicy.GROWTH_REGIME:
        return GrowthRegimeRouting()
    raise TransitionError(f"unsupported_routing_policy:{policy.value}")


def resolve_policy(
    registry: AssetRegistry,
    asset: Asset,
) -> tuple[Optional[str], Optional[RoutingPolicy]]:
    """Return (reject_reason, policy). reject_reason set when not tradeable."""
    rec = registry.get(asset)
    if rec is None:
        return "asset_not_registered", None
    if not rec.active:
        return "asset_inactive", None
    if rec.routing_policy == RoutingPolicy.NONE:
        return "asset_not_tradeable", None
    return None, rec.routing_policy
