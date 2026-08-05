"""
Minimal orchestration glue (Phase 3 foundation).

Wires Regime + Asset Selection + Position without Legacy imports.
Not a live runtime activator.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from taxable_account.decision.asset_selection import entry_possible, select_asset
from taxable_account.decision.regime import apply_regime_event
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState
from taxable_account.position.position_manager import apply_position_event
from taxable_account.state.state_store import InMemoryStateStore


def _sync_selection(account: TaxableAccountState) -> None:
    sel = select_asset(account.regime_state, account.signals)
    account.asset = sel.asset
    account.selection_reason = sel.reason


def _flat_watchlike(account: TaxableAccountState) -> bool:
    return account.position_state in (
        PositionState.WATCH,
        PositionState.REENTRY_WAIT,
    )


class TaxableAccountEngine:
    def __init__(self, store: Optional[InMemoryStateStore] = None) -> None:
        self.store = store or InMemoryStateStore()

    @property
    def state(self) -> TaxableAccountState:
        return self.store.state

    def set_signals(self, signals: MarketSignals) -> TaxableAccountState:
        self.store.update_signals(signals)
        return self.state

    def on_event(
        self,
        event: DomainEvent,
        *,
        fill_asset: Optional[Asset] = None,
        fill_price: Optional[float] = None,
        fill_date: Optional[date] = None,
        signal_date: Optional[date] = None,
    ) -> TaxableAccountState:
        account = self.state

        # Regime-level events
        if event in (
            DomainEvent.ALERT_ON,
            DomainEvent.ALERT_OFF,
            DomainEvent.TRANSFER_COMPLETE,
            DomainEvent.RECOVERY_COMPLETE,
        ):
            apply_regime_event(account, event)
            _sync_selection(account)

            if event == DomainEvent.TRANSFER_COMPLETE:
                apply_position_event(account, DomainEvent.REGIME_ENTER_SWING)
            elif event == DomainEvent.RECOVERY_COMPLETE:
                apply_position_event(account, DomainEvent.REGIME_ENTER_GROWTH)
            elif event == DomainEvent.ALERT_OFF and account.regime_state == RegimeState.REENTRY_PENDING:
                if account.position_state == PositionState.POSITION_ACTIVE:
                    apply_position_event(account, DomainEvent.ALERT_FLATTEN)
            return account

        # Selection + entry readiness helper
        if event == DomainEvent.SIGNAL_ENTRY_AVAILABLE:
            _sync_selection(account)
            if not entry_possible(
                account.regime_state,
                account.asset,
                _flat_watchlike(account),
                account.signals,
            ):
                return account
            return apply_position_event(
                account, event, signal_date=signal_date or fill_date
            )

        if event == DomainEvent.REENTRY_SIGNAL:
            _sync_selection(account)
            if not entry_possible(
                account.regime_state,
                account.asset,
                _flat_watchlike(account),
                account.signals,
            ):
                return account
            return apply_position_event(
                account, event, signal_date=signal_date or fill_date
            )

        # Internal delayed fill recovery — must NOT re-run Selection / Sensors
        if event == DomainEvent.DELAYED_FILL_RECOVERY:
            return apply_position_event(
                account,
                event,
                fill_asset=fill_asset,
                fill_price=fill_price,
                fill_date=fill_date,
                signal_date=signal_date,
            )

        return apply_position_event(
            account,
            event,
            fill_asset=fill_asset,
            fill_price=fill_price,
            fill_date=fill_date,
            signal_date=signal_date,
        )
