"""Regime state transition engine (DETAILED-SPEC §2)."""

from __future__ import annotations

from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import TaxableAccountState, TransitionError
from taxable_account.domain.states import RegimeState

# (from_state, event) -> to_state
_REGIME_TRANSITIONS: dict[tuple[RegimeState, DomainEvent], RegimeState] = {
    (RegimeState.GROWTH_ACTIVE, DomainEvent.ALERT_ON): RegimeState.EXIT_PENDING,
    (RegimeState.EXIT_PENDING, DomainEvent.TRANSFER_COMPLETE): RegimeState.SWING_ACTIVE,
    (RegimeState.EXIT_PENDING, DomainEvent.ALERT_OFF): RegimeState.REENTRY_PENDING,
    (RegimeState.SWING_ACTIVE, DomainEvent.ALERT_OFF): RegimeState.REENTRY_PENDING,
    (RegimeState.REENTRY_PENDING, DomainEvent.RECOVERY_COMPLETE): RegimeState.GROWTH_ACTIVE,
    (RegimeState.REENTRY_PENDING, DomainEvent.ALERT_ON): RegimeState.EXIT_PENDING,
}

_FORBIDDEN_DIRECT: set[tuple[RegimeState, RegimeState]] = {
    (RegimeState.GROWTH_ACTIVE, RegimeState.SWING_ACTIVE),
    (RegimeState.SWING_ACTIVE, RegimeState.GROWTH_ACTIVE),
    (RegimeState.GROWTH_ACTIVE, RegimeState.REENTRY_PENDING),
    (RegimeState.EXIT_PENDING, RegimeState.GROWTH_ACTIVE),
}


def can_transition(state: RegimeState, event: DomainEvent) -> bool:
    return (state, event) in _REGIME_TRANSITIONS


def next_regime(state: RegimeState, event: DomainEvent) -> RegimeState:
    key = (state, event)
    if key not in _REGIME_TRANSITIONS:
        raise TransitionError(f"Forbidden or undefined regime transition: {state.value} + {event.value}")
    return _REGIME_TRANSITIONS[key]


def apply_regime_event(account: TaxableAccountState, event: DomainEvent) -> TaxableAccountState:
    """Apply a regime-level event. Mutates and returns the same account object."""
    nxt = next_regime(account.regime_state, event)
    if (account.regime_state, nxt) in _FORBIDDEN_DIRECT:
        raise TransitionError(f"Forbidden direct regime jump: {account.regime_state.value} -> {nxt.value}")

    prev = account.regime_state
    account.regime_state = nxt

    if event == DomainEvent.ALERT_ON:
        account.alert_on = True
        account.transfer_completed = False
    elif event == DomainEvent.ALERT_OFF:
        account.alert_on = False
    elif event == DomainEvent.TRANSFER_COMPLETE:
        account.transfer_completed = True
        account.alert_on = True
    elif event == DomainEvent.RECOVERY_COMPLETE:
        account.alert_on = False
        account.transfer_completed = False

    # Side-effect hooks for position coupling are handled by position_manager
    # callers; regime engine only owns regime_state + alert flags.
    _ = prev
    account.touch()
    return account
