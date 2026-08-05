"""Persistent domain models (schema-aligned)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any, Optional

from taxable_account.domain.states import (
    STOP_PCT_1570,
    Asset,
    ExitReason,
    PositionState,
    RegimeState,
    RiskStatus,
    SelectionReason,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True)
class MarketSignals:
    """Market Detection outputs only (no decisions)."""

    dd15_ma200: bool = False
    crash_15: bool = False
    semi_signal: bool = False
    recovery_model_b_met: bool = False
    recovery_b_days: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "dd15_ma200": self.dd15_ma200,
            "crash_15": self.crash_15,
            "semi_signal": self.semi_signal,
            "recovery_model_b_met": self.recovery_model_b_met,
            "recovery_b_days": int(self.recovery_b_days),
        }


@dataclass
class RiskControlState:
    """1570 Position Risk Control — separated from position_state enum."""

    enabled: bool = False
    stop_pct: float = STOP_PCT_1570
    stop_price: Optional[float] = None
    status: RiskStatus = RiskStatus.NA

    def to_dict(self) -> dict[str, Any]:
        return {
            "enabled": self.enabled,
            "stop_pct": self.stop_pct,
            "stop_price": self.stop_price,
            "status": self.status.value,
        }

    @classmethod
    def inactive(cls) -> "RiskControlState":
        return cls(enabled=False, stop_pct=STOP_PCT_1570, stop_price=None, status=RiskStatus.NA)


@dataclass
class TaxableAccountState:
    """Single Source of Truth — persistent fields."""

    schema_version: str = "1.0"
    updated_at: datetime = field(default_factory=_utc_now)
    regime_state: RegimeState = RegimeState.GROWTH_ACTIVE
    position_state: PositionState = PositionState.WAIT
    asset: Asset = Asset.NOMURA_WORLD_SEMI
    held_asset: Asset = Asset.NOMURA_WORLD_SEMI
    selection_reason: Optional[SelectionReason] = SelectionReason.GROWTH_DEFAULT
    signal_date: Optional[date] = None
    entry_date: Optional[date] = None
    entry_price: Optional[float] = None
    exit_date: Optional[date] = None
    exit_price: Optional[float] = None
    exit_reason: Optional[ExitReason] = None
    max_hold_business_days: Optional[int] = None
    alert_on: bool = False
    transfer_completed: bool = False
    signals: MarketSignals = field(default_factory=MarketSignals)
    risk_control: RiskControlState = field(default_factory=RiskControlState.inactive)

    def touch(self) -> None:
        self.updated_at = _utc_now()

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "updated_at": self.updated_at.isoformat(),
            "regime_state": self.regime_state.value,
            "position_state": self.position_state.value,
            "asset": self.asset.value,
            "held_asset": self.held_asset.value,
            "selection_reason": None
            if self.selection_reason is None
            else self.selection_reason.value,
            "signal_date": None if self.signal_date is None else self.signal_date.isoformat(),
            "entry_date": None if self.entry_date is None else self.entry_date.isoformat(),
            "entry_price": self.entry_price,
            "exit_date": None if self.exit_date is None else self.exit_date.isoformat(),
            "exit_price": self.exit_price,
            "exit_reason": None if self.exit_reason is None else self.exit_reason.value,
            "max_hold_business_days": self.max_hold_business_days,
            "alert_on": self.alert_on,
            "transfer_completed": self.transfer_completed,
            "signals": self.signals.to_dict(),
            "risk_control": self.risk_control.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "TaxableAccountState":
        """Restore SoT from persisted JSON (ops readiness — no schema change)."""
        sig = data.get("signals") or {}
        rc = data.get("risk_control") or {}
        sel = data.get("selection_reason")
        exr = data.get("exit_reason")
        updated = data.get("updated_at")
        if isinstance(updated, str):
            updated_at = datetime.fromisoformat(updated.replace("Z", "+00:00"))
        else:
            updated_at = _utc_now()

        def _d(key: str) -> Optional[date]:
            v = data.get(key)
            if v is None or v == "":
                return None
            return date.fromisoformat(str(v)[:10])

        return cls(
            schema_version=str(data.get("schema_version", "1.0")),
            updated_at=updated_at,
            regime_state=RegimeState(data["regime_state"]),
            position_state=PositionState(data["position_state"]),
            asset=Asset(data["asset"]),
            held_asset=Asset(data["held_asset"]),
            selection_reason=None if sel is None else SelectionReason(sel),
            signal_date=_d("signal_date"),
            entry_date=_d("entry_date"),
            entry_price=data.get("entry_price"),
            exit_date=_d("exit_date"),
            exit_price=data.get("exit_price"),
            exit_reason=None if exr is None else ExitReason(exr),
            max_hold_business_days=data.get("max_hold_business_days"),
            alert_on=bool(data.get("alert_on", False)),
            transfer_completed=bool(data.get("transfer_completed", False)),
            signals=MarketSignals(
                dd15_ma200=bool(sig.get("dd15_ma200", False)),
                crash_15=bool(sig.get("crash_15", False)),
                semi_signal=bool(sig.get("semi_signal", False)),
                recovery_model_b_met=bool(sig.get("recovery_model_b_met", False)),
                recovery_b_days=int(sig.get("recovery_b_days", 0) or 0),
            ),
            risk_control=RiskControlState(
                enabled=bool(rc.get("enabled", False)),
                stop_pct=float(rc.get("stop_pct", STOP_PCT_1570)),
                stop_price=rc.get("stop_price"),
                status=RiskStatus(rc.get("status", RiskStatus.NA.value)),
            ),
        )


class TransitionError(Exception):
    """Illegal or unsupported state transition."""


@dataclass(frozen=True)
class SelectionResult:
    asset: Asset
    reason: SelectionReason
