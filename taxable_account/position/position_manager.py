"""Position state transition engine (DETAILED-SPEC §4)."""

from __future__ import annotations

from datetime import date
from typing import Optional

from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import TaxableAccountState, TransitionError
from taxable_account.domain.states import (
    HOLD_DAYS,
    Asset,
    ExitReason,
    PositionState,
    RegimeState,
    RiskStatus,
)
from taxable_account.position import risk_control as rc


_EXIT_EVENTS = {
    DomainEvent.TIME_EXIT_DUE: ExitReason.TIME,
    DomainEvent.ABNORMAL_EXIT: ExitReason.ABNORMAL,
    DomainEvent.ALERT_FLATTEN: ExitReason.ALERT_FLATTEN,
    DomainEvent.STOP_TRIGGERED: ExitReason.STOP_TRIGGERED,
}


def apply_position_event(
    account: TaxableAccountState,
    event: DomainEvent,
    *,
    fill_asset: Optional[Asset] = None,
    fill_price: Optional[float] = None,
    fill_date: Optional[date] = None,
    signal_date: Optional[date] = None,
) -> TaxableAccountState:
    ps = account.position_state

    if event == DomainEvent.REGIME_ENTER_SWING:
        if ps != PositionState.WAIT:
            raise TransitionError(f"REGIME_ENTER_SWING only from WAIT, got {ps.value}")
        account.position_state = PositionState.WATCH
        account.held_asset = Asset.CASH
        account.signal_date = None
        account.touch()
        return account

    if event == DomainEvent.REGIME_ENTER_GROWTH:
        if ps not in (PositionState.WATCH, PositionState.REENTRY_WAIT, PositionState.WAIT):
            raise TransitionError(f"REGIME_ENTER_GROWTH invalid from {ps.value}")
        account.position_state = PositionState.WAIT
        account.held_asset = Asset.NOMURA_WORLD_SEMI
        account.signal_date = None
        account.risk_control = rc.reset_risk()
        account.touch()
        return account

    if event == DomainEvent.SIGNAL_ENTRY_AVAILABLE:
        if ps not in (PositionState.WATCH, PositionState.REENTRY_WAIT):
            raise TransitionError(f"SIGNAL_ENTRY_AVAILABLE invalid from {ps.value}")
        if account.asset in (Asset.CASH,):
            raise TransitionError("SIGNAL_ENTRY_AVAILABLE requires non-CASH selected asset")
        account.position_state = PositionState.ENTRY_READY
        # Timing model SIGNAL_DETECTED → ENTRY_READY: record condition date
        account.signal_date = signal_date or date.today()
        account.touch()
        return account

    if event == DomainEvent.REENTRY_SIGNAL:
        if ps != PositionState.REENTRY_WAIT:
            raise TransitionError(f"REENTRY_SIGNAL only from REENTRY_WAIT, got {ps.value}")
        if account.asset == Asset.CASH:
            raise TransitionError("REENTRY_SIGNAL requires non-CASH selected asset")
        account.position_state = PositionState.ENTRY_READY
        account.signal_date = signal_date or date.today()
        account.touch()
        return account

    if event == DomainEvent.ENTRY_FILLED:
        if ps != PositionState.ENTRY_READY:
            raise TransitionError(f"ENTRY_FILLED only from ENTRY_READY, got {ps.value}")
        asset = fill_asset or account.asset
        if asset == Asset.CASH:
            raise TransitionError("Cannot fill CASH entry")
        if fill_price is None or fill_price <= 0:
            raise TransitionError("ENTRY_FILLED requires positive fill_price")
        account.position_state = PositionState.POSITION_ACTIVE
        account.held_asset = asset
        account.entry_price = float(fill_price)
        account.entry_date = fill_date or date.today()
        # signal_date preserved (condition day ≠ purchase day allowed)
        account.exit_date = None
        account.exit_price = None
        account.exit_reason = None
        account.max_hold_business_days = HOLD_DAYS.get(asset)
        if rc.should_arm_for(asset):
            account.risk_control = rc.arm_stop(account.entry_price)
        else:
            account.risk_control = rc.reset_risk()
        account.touch()
        return account

    if event == DomainEvent.SIGNAL_LOST:
        if ps != PositionState.ENTRY_READY:
            raise TransitionError(f"SIGNAL_LOST only from ENTRY_READY, got {ps.value}")
        if account.regime_state == RegimeState.GROWTH_ACTIVE:
            account.position_state = PositionState.WAIT
        else:
            account.position_state = PositionState.WATCH
        account.signal_date = None
        account.touch()
        return account

    if event == DomainEvent.DELAYED_FILL_RECOVERY:
        # Internal recovery only — not a new Entry judgment.
        # Preserves invariant: ENTRY_FILLED only from ENTRY_READY.
        if account.regime_state != RegimeState.SWING_ACTIVE:
            raise TransitionError(
                f"DELAYED_FILL_RECOVERY requires SWING_ACTIVE, got {account.regime_state.value}"
            )
        if account.held_asset != Asset.CASH:
            raise TransitionError("DELAYED_FILL_RECOVERY requires held_asset=CASH")
        if ps not in (PositionState.WATCH, PositionState.REENTRY_WAIT):
            raise TransitionError(
                f"DELAYED_FILL_RECOVERY only from WATCH/REENTRY_WAIT, got {ps.value}"
            )
        asset = fill_asset
        if asset is None or asset not in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A):
            raise TransitionError("DELAYED_FILL_RECOVERY requires swing fill_asset")
        if fill_price is None or fill_price <= 0:
            raise TransitionError("DELAYED_FILL_RECOVERY requires positive fill_price")
        if fill_date is None:
            raise TransitionError("DELAYED_FILL_RECOVERY requires fill_date (actual trade date)")

        # Technical READY restoration — no Selection / Sensor re-evaluation
        account.position_state = PositionState.ENTRY_READY
        account.asset = asset
        account.signal_date = signal_date or fill_date
        account.touch()
        return apply_position_event(
            account,
            DomainEvent.ENTRY_FILLED,
            fill_asset=asset,
            fill_price=fill_price,
            fill_date=fill_date,
            signal_date=account.signal_date,
        )

    if event in _EXIT_EVENTS:
        if ps != PositionState.POSITION_ACTIVE:
            raise TransitionError(f"{event.value} only from POSITION_ACTIVE, got {ps.value}")
        if event == DomainEvent.STOP_TRIGGERED:
            account.risk_control = rc.trigger_stop(account.risk_control)
        elif account.risk_control.status == RiskStatus.ACTIVE:
            account.risk_control = rc.cancel_stop(account.risk_control)
        account.position_state = PositionState.EXIT
        account.exit_reason = _EXIT_EVENTS[event]
        account.touch()
        return account

    if event == DomainEvent.EXIT_FILLED:
        if ps != PositionState.EXIT:
            raise TransitionError(f"EXIT_FILLED only from EXIT, got {ps.value}")
        reason = account.exit_reason
        account.exit_price = fill_price
        account.exit_date = fill_date or date.today()
        account.held_asset = Asset.CASH
        account.entry_price = None
        account.entry_date = None
        account.signal_date = None
        account.max_hold_business_days = None
        account.risk_control = rc.reset_risk()

        if reason == ExitReason.STOP_TRIGGERED and account.regime_state == RegimeState.SWING_ACTIVE:
            account.position_state = PositionState.REENTRY_WAIT
        elif account.regime_state == RegimeState.GROWTH_ACTIVE:
            account.position_state = PositionState.WAIT
            account.held_asset = Asset.NOMURA_WORLD_SEMI
        elif account.regime_state == RegimeState.REENTRY_PENDING:
            account.position_state = PositionState.WAIT
        else:
            account.position_state = PositionState.WATCH

        account.touch()
        return account

    raise TransitionError(f"Unsupported position event: {event.value}")
