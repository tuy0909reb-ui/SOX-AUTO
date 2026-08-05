"""
1570 Position Risk Control — separate object from position_state.

stop_price = entry_price * 0.85
Statuses: N/A | ACTIVE | TRIGGERED | CANCELLED
"""

from __future__ import annotations

from taxable_account.domain.models import RiskControlState, TransitionError
from taxable_account.domain.states import STOP_PCT_1570, Asset, RiskStatus


def arm_stop(entry_price: float, stop_pct: float = STOP_PCT_1570) -> RiskControlState:
    if entry_price <= 0:
        raise TransitionError("entry_price must be positive to arm risk stop")
    return RiskControlState(
        enabled=True,
        stop_pct=stop_pct,
        stop_price=entry_price * (1.0 - stop_pct),
        status=RiskStatus.ACTIVE,
    )


def trigger_stop(risk: RiskControlState) -> RiskControlState:
    if not risk.enabled or risk.status != RiskStatus.ACTIVE:
        raise TransitionError(f"Cannot trigger risk stop from status={risk.status.value}")
    return RiskControlState(
        enabled=True,
        stop_pct=risk.stop_pct,
        stop_price=risk.stop_price,
        status=RiskStatus.TRIGGERED,
    )


def cancel_stop(risk: RiskControlState) -> RiskControlState:
    if risk.status == RiskStatus.NA:
        return RiskControlState.inactive()
    return RiskControlState(
        enabled=False,
        stop_pct=risk.stop_pct,
        stop_price=risk.stop_price,
        status=RiskStatus.CANCELLED,
    )


def reset_risk() -> RiskControlState:
    return RiskControlState.inactive()


def should_arm_for(asset: Asset) -> bool:
    return asset == Asset.NIKKEI_LEV_1570


def is_stop_breached(last_price: float, risk: RiskControlState) -> bool:
    """Helper for future market ticks; not wired to live feeds in Phase 3."""
    if risk.status != RiskStatus.ACTIVE or risk.stop_price is None:
        return False
    return last_price <= risk.stop_price
