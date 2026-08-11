"""
Trade Fact Input Port — validate + route via Asset Registry / Routing Policy.

Does not re-run Selection / Detection / Sensors.
Internal events (DELAYED_FILL_RECOVERY, ABNORMAL_EXIT) are never Human fields.

quantity is validated/stored as Trade Fact only — never passed into
Position / Risk / Time Exit / Selection paths.

Dispatch:
  asset → Registry lookup → routing_policy → policy handler
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any, Optional, Union

from taxable_account.domain.asset_registry import (
    DEFAULT_ASSET_REGISTRY,
    AssetRegistry,
)
from taxable_account.domain.models import TransitionError
from taxable_account.engine import TaxableAccountEngine
from taxable_account.trade.facts import TradeFact, TradeReportRequest, TradeSide
from taxable_account.trade.journal import TradeFactJournal
from taxable_account.trade.routing import handler_for, resolve_policy

PathLike = Union[str, Path]


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
    """External Fact boundary for Human / Broker trade reports (BUY + SELL)."""

    def __init__(
        self,
        engine: TaxableAccountEngine,
        journal: TradeFactJournal,
        registry: Optional[AssetRegistry] = None,
    ) -> None:
        self.engine = engine
        self.journal = journal
        self.registry = registry or DEFAULT_ASSET_REGISTRY

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

        try:
            _, policy = resolve_policy(self.registry, request.asset)
            assert policy is not None  # validated above
            handler = handler_for(policy)
            routed, events = handler.route(request, account, self.engine)
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
        if request.quantity is None:
            return "quantity_required"
        if float(request.quantity) <= 0:
            return "quantity_must_be_positive"
        if request.trade_date is None:
            return "trade_date_required"
        if request.trade_date > date.today():
            return "trade_date_in_future_forbidden"
        if request.report_id and self.journal.has_report_id(request.report_id):
            return "duplicate_report_id"

        reject, policy = resolve_policy(self.registry, request.asset)
        if reject is not None:
            return reject

        handler = handler_for(policy)  # type: ignore[arg-type]
        return handler.validate(request, account)


def default_journal_path(state_file: Optional[PathLike] = None) -> Path:
    if state_file is not None:
        p = Path(state_file)
        return p.parent / "taxable_trade_facts.jsonl"
    return Path("data/ops/taxable_trade_facts.jsonl")
