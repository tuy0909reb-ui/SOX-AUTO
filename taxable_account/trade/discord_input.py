"""Discord Trade Report Input Adapter — transport only.

Maps Discord slash/confirm fields → TradeReportRequest → TradeReportPort.
No Entry/Exit judgment. No Internal Event names. No State writes.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Iterable, Optional
from uuid import uuid4

from taxable_account.domain.states import Asset
from taxable_account.trade.facts import TradeReportRequest, TradeSide
from taxable_account.trade.port import TradeReportPort, TradeReportResult

SOURCE_DISCORD = "DISCORD"

_ASSET_ALIASES = {
    "1570": Asset.NIKKEI_LEV_1570,
    "NIKKEI_LEV_1570": Asset.NIKKEI_LEV_1570,
    "282A": Asset.SEMI_282A,
    "SEMI_282A": Asset.SEMI_282A,
    "NOMURA": Asset.NOMURA_WORLD_SEMI,
    "NOMURA_WORLD_SEMI": Asset.NOMURA_WORLD_SEMI,
    "CASH": Asset.CASH,
}


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

    def preview_text(self) -> str:
        return (
            f"Trade Report draft\n"
            f"report_id={self.report_id}\n"
            f"side={self.side.value} asset={self.asset.value}\n"
            f"trade_date={self.trade_date.isoformat()} "
            f"trade_price={self.trade_price} quantity={self.quantity}\n"
            f"source={SOURCE_DISCORD}\n"
            f"Confirm to submit Fact (not a Protocol command)."
        )


class DiscordTradeInputAdapter:
    """Thin adapter: authorize → draft → confirm → Port.submit."""

    def __init__(
        self,
        port: TradeReportPort,
        *,
        allowed_operator_ids: Optional[Iterable[str]] = None,
    ) -> None:
        self.port = port
        self._allowed = {str(x).strip() for x in (allowed_operator_ids or []) if str(x).strip()}
        self._pending: dict[str, DiscordTradeDraft] = {}

    def is_authorized(self, operator_id: str) -> bool:
        if not self._allowed:
            return False
        return str(operator_id) in self._allowed

    def parse_asset(self, raw: str) -> Asset:
        key = raw.strip().upper().replace(" ", "_")
        if key in _ASSET_ALIASES:
            return _ASSET_ALIASES[key]
        return Asset(key)

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
            trade_date=date.fromisoformat(trade_date),
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
