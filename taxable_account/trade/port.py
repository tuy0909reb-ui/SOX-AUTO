"""
Trade Fact Input Port — validate + route to Domain Events.

Does not re-run Selection / Detection / Sensors.
DELAYED_FILL_RECOVERY is internal only (never a Human field).

quantity is validated/stored as Trade Fact only — never passed into
Position / Risk / Time Exit / Selection paths.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Optional, Union

from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import TransitionError
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.facts import TradeFact, TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal

PathLike = Union[str, Path]

_SWING_ASSETS = (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A)
_WATCH_LIKE = (PositionState.WATCH, PositionState.REENTRY_WAIT)


@dataclass(frozen=True)
class TradeReportResult:
    accepted: bool
    fact: TradeFact
    events: tuple[str, ...] = ()
    error: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "accepted": self.accepted,
            "events": list(self.events),
            "error": self.error,
            "fact": self.fact.to_dict(),
        }


class TradeReportPort:
    """External Fact boundary for Human / Broker trade reports."""

    def __init__(
        self,
        engine: TaxableAccountEngine,
        journal: TradeFactJournal,
    ) -> None:
        self.engine = engine
        self.journal = journal

    def submit(self, request: TradeReportRequest) -> TradeReportResult:
        request.ensure_id()
        account = self.engine.state
        position_before = account.position_state.value

        base_kwargs = dict(
            report_id=request.report_id or "",
            asset=request.asset,
            side=request.side,
            trade_date=request.trade_date,
            trade_price=float(request.trade_price),
            reported_at=request.reported_at,
            source=request.source,
            confirm_flag=bool(request.confirm_flag),
            quantity=request.quantity,
            signal_date=account.signal_date,
            regime_at_report=account.regime_state.value,
            position_before=position_before,
        )

        # --- validation ---
        reject = self._validate(request, account)
        if reject is not None:
            fact = TradeFact(
                **base_kwargs,
                validation_result="REJECTED",
                routed_event=None,
                reject_reason=reject,
                position_after=self.engine.state.position_state.value,
            )
            self.journal.append(fact)
            return TradeReportResult(accepted=False, fact=fact, error=reject)

        # --- routing (BUY v1.0) ---
        try:
            if request.side == TradeSide.SELL:
                raise TransitionError("SELL routing not implemented in HTR Port v1.0")

            routed, events = self._route_buy(request, account)
        except TransitionError as exc:
            fact = TradeFact(
                **base_kwargs,
                validation_result="REJECTED",
                routed_event=None,
                reject_reason=str(exc),
                position_after=self.engine.state.position_state.value,
            )
            self.journal.append(fact)
            return TradeReportResult(accepted=False, fact=fact, error=str(exc))

        accepted_kwargs = dict(base_kwargs)
        accepted_kwargs["signal_date"] = (
            self.engine.state.signal_date or account.signal_date or request.trade_date
        )
        fact = TradeFact(
            **accepted_kwargs,
            validation_result="ACCEPTED",
            routed_event=routed,
            reject_reason=None,
            position_after=self.engine.state.position_state.value,
        )
        self.journal.append(fact)
        return TradeReportResult(accepted=True, fact=fact, events=tuple(events))

    def _validate(self, request: TradeReportRequest, account) -> Optional[str]:
        if request.side not in (TradeSide.BUY, TradeSide.SELL):
            return "invalid_side"
        if not request.confirm_flag:
            return "confirm_flag_required"
        if request.trade_price is None or float(request.trade_price) <= 0:
            return "trade_price_must_be_positive"
        if request.quantity is not None and float(request.quantity) <= 0:
            return "quantity_must_be_positive_when_provided"
        if request.trade_date is None:
            return "trade_date_required"
        # today substitution forbidden — past and today allowed; future rejected
        if request.trade_date > date.today():
            return "trade_date_in_future_forbidden"
        if request.side == TradeSide.SELL:
            return "sell_not_implemented_v1"
        if account.position_state == PositionState.POSITION_ACTIVE:
            return "already_position_active"
        if account.position_state == PositionState.EXIT:
            return "exit_in_progress"
        if account.regime_state == RegimeState.GROWTH_ACTIVE:
            return "growth_regime_buy_forbidden"
        if account.regime_state == RegimeState.EXIT_PENDING:
            return "exit_pending_buy_forbidden"
        if request.asset not in _SWING_ASSETS:
            return "asset_not_swing_sleeve"
        return None

    def _route_buy(
        self,
        request: TradeReportRequest,
        account,
    ) -> tuple[str, list[str]]:
        events: list[str] = []

        # Case A — open opportunity
        if (
            account.position_state == PositionState.ENTRY_READY
            and account.asset == request.asset
        ):
            self.engine.on_event(
                DomainEvent.ENTRY_FILLED,
                fill_asset=request.asset,
                fill_price=float(request.trade_price),
                fill_date=request.trade_date,
            )
            events.append(DomainEvent.ENTRY_FILLED.value)
            return DomainEvent.ENTRY_FILLED.value, events

        # Case B — delayed fill recovery (internal)
        if (
            account.regime_state == RegimeState.SWING_ACTIVE
            and account.held_asset == Asset.CASH
            and account.position_state in _WATCH_LIKE
            and request.asset in _SWING_ASSETS
        ):
            self.engine.on_event(
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


def default_journal_path(state_file: Optional[PathLike] = None) -> Path:
    if state_file is not None:
        p = Path(state_file)
        return p.parent / "taxable_trade_facts.jsonl"
    return Path("data/ops/taxable_trade_facts.jsonl")
