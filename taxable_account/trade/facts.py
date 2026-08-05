"""Trade Fact models — external contract for Human / Broker reports."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from taxable_account.domain.states import Asset


class TradeSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class TradeFact:
    """Append-only journal record (accepted or rejected)."""

    report_id: str
    asset: Asset
    side: TradeSide
    trade_date: date
    trade_price: float
    reported_at: datetime
    source: str
    confirm_flag: bool
    validation_result: str  # ACCEPTED | REJECTED
    routed_event: Optional[str] = None
    reject_reason: Optional[str] = None
    quantity: Optional[float] = None  # optional reservation; unused in v1.0
    signal_date: Optional[date] = None
    regime_at_report: Optional[str] = None
    position_before: Optional[str] = None
    position_after: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "report_id": self.report_id,
            "asset": self.asset.value,
            "side": self.side.value,
            "trade_date": self.trade_date.isoformat(),
            "trade_price": self.trade_price,
            "reported_at": self.reported_at.isoformat(),
            "source": self.source,
            "confirm_flag": self.confirm_flag,
            "validation_result": self.validation_result,
            "routed_event": self.routed_event,
            "reject_reason": self.reject_reason,
            "quantity": self.quantity,
            "signal_date": None if self.signal_date is None else self.signal_date.isoformat(),
            "regime_at_report": self.regime_at_report,
            "position_before": self.position_before,
            "position_after": self.position_after,
        }


@dataclass
class TradeReportRequest:
    """Human / Broker inbound Trade Fact (no internal event names)."""

    asset: Asset
    side: TradeSide
    trade_date: date
    trade_price: float
    confirm_flag: bool
    quantity: Optional[float] = None
    source: str = "HUMAN_CLI"
    report_id: Optional[str] = None
    reported_at: datetime = field(default_factory=_utc_now)

    def ensure_id(self) -> str:
        if self.report_id:
            return self.report_id
        self.report_id = str(uuid4())
        return self.report_id
