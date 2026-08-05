"""MarketCondition — Detection output consumed by Runtime."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any, Optional

from taxable_account.domain.models import MarketSignals


@dataclass(frozen=True)
class MarketCondition:
    as_of: date
    signals: MarketSignals
    alert_on: bool
    prices: dict[str, float] = field(default_factory=dict)
    # optional marks for risk / pnl
    notes: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "as_of": self.as_of.isoformat(),
            "alert_on": self.alert_on,
            "signals": self.signals.to_dict(),
            "prices": dict(self.prices),
            "notes": list(self.notes),
        }

    def price_of(self, key: str) -> Optional[float]:
        v = self.prices.get(key)
        return float(v) if v is not None else None
