"""Discord Trade Report Input Adapter — transport only.

Maps Discord slash/confirm fields → TradeReportRequest → TradeReportPort.
Aliases resolve via Asset Registry (not local hardcode).
No Entry/Exit judgment. No Internal Event names. No State writes.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Optional
from uuid import uuid4

from taxable_account.domain.asset_registry import (
    DEFAULT_ASSET_REGISTRY,
    AssetRegistry,
)
from taxable_account.domain.models import TaxableAccountState
from taxable_account.domain.states import Asset
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.port import TradeReportPort, TradeReportResult

SOURCE_DISCORD = "DISCORD"


def parse_trade_date(raw: str) -> date:
    """HI input dates → date. Accepts YYYYMMDD or YYYY-MM-DD. Fact schema unchanged."""
    text = (raw or "").strip()
    if not text:
        raise ValueError("trade_date_required")
    if len(text) == 8 and text.isdigit():
        return date(int(text[0:4]), int(text[4:6]), int(text[6:8]))
    return date.fromisoformat(text[:10])


@dataclass(frozen=True)
class DiscordTradeDraft:
    """Pending Fact before Human confirm (confirm_flag still false)."""

    report_id: str
    asset: Asset
    side: TradeSide
    trade_date: date
    trade_price: float
    quantity: float
    operator_id: str

    def preview_text(self, state: Optional[TaxableAccountState] = None) -> str:
        from taxable_account.view.human_display import format_trade_draft_preview

        held = state.held_asset if state is not None else None
        return format_trade_draft_preview(
            side=self.side,
            asset=self.asset,
            trade_date=self.trade_date.isoformat(),
            trade_price=self.trade_price,
            quantity=self.quantity,
            report_id=self.report_id,
            held_asset=held,
        )


class DiscordTradeInputAdapter:
    """Thin adapter: authorize → draft → confirm → Port.submit."""

    def __init__(
        self,
        port: TradeReportPort,
        *,
        allowed_operator_ids: Optional[Iterable[str]] = None,
        registry: Optional[AssetRegistry] = None,
    ) -> None:
        self.port = port
        self.registry = registry or getattr(port, "registry", None) or DEFAULT_ASSET_REGISTRY
        self._allowed = {str(x).strip() for x in (allowed_operator_ids or []) if str(x).strip()}
        self._pending: dict[str, DiscordTradeDraft] = {}

    def is_authorized(self, operator_id: str) -> bool:
        if not self._allowed:
            return False
        return str(operator_id) in self._allowed

    def parse_asset(self, raw: str) -> Asset:
        return self.registry.resolve(raw)

    def parse_side(self, raw: str) -> TradeSide:
        return TradeSide(raw.strip().upper())

    def create_draft(
        self,
        *,
        operator_id: str,
        asset: str,
        side: str,
        trade_date: str,
        trade_price: float,
        quantity: float,
        report_id: Optional[str] = None,
    ) -> DiscordTradeDraft:
        if not self.is_authorized(operator_id):
            raise PermissionError("discord_operator_not_authorized")
        rid = report_id or str(uuid4())
        if rid in self._pending:
            raise ValueError("duplicate_pending_report_id")
        draft = DiscordTradeDraft(
            report_id=rid,
            asset=self.parse_asset(asset),
            side=self.parse_side(side),
            trade_date=parse_trade_date(trade_date),
            trade_price=float(trade_price),
            quantity=float(quantity),
            operator_id=str(operator_id),
        )
        self._pending[rid] = draft
        return draft

    def cancel_draft(self, report_id: str, operator_id: str) -> bool:
        draft = self._pending.get(report_id)
        if draft is None:
            return False
        if draft.operator_id != str(operator_id):
            raise PermissionError("discord_operator_mismatch")
        del self._pending[report_id]
        return True

    def confirm_and_submit(self, report_id: str, operator_id: str) -> TradeReportResult:
        """Human confirm → Fact with confirm_flag=True → existing Port."""
        if not self.is_authorized(operator_id):
            raise PermissionError("discord_operator_not_authorized")
        draft = self._pending.get(report_id)
        if draft is None:
            raise KeyError("unknown_or_expired_report_id")
        if draft.operator_id != str(operator_id):
            raise PermissionError("discord_operator_mismatch")

        request = TradeReportRequest(
            asset=draft.asset,
            side=draft.side,
            trade_date=draft.trade_date,
            trade_price=draft.trade_price,
            quantity=draft.quantity,
            confirm_flag=True,
            source=SOURCE_DISCORD,
            report_id=draft.report_id,
        )
        result = self.port.submit(request)
        # Consume pending whether accepted or rejected (id already journaled).
        self._pending.pop(report_id, None)
        return result
