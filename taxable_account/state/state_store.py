"""In-memory TaxableAccountState store — foundation only (no persistence IO)."""

from __future__ import annotations

from copy import deepcopy
from typing import Optional

from taxable_account.decision.asset_selection import select_asset
from taxable_account.domain.models import MarketSignals, TaxableAccountState
from taxable_account.domain.states import RegimeState


class InMemoryStateStore:
    def __init__(self, initial: Optional[TaxableAccountState] = None) -> None:
        self._state = initial or TaxableAccountState()

    @property
    def state(self) -> TaxableAccountState:
        return self._state

    def get(self) -> TaxableAccountState:
        return self._state

    def set(self, state: TaxableAccountState) -> None:
        self._state = state
        self._state.touch()

    def update_signals(self, signals: MarketSignals) -> TaxableAccountState:
        self._state.signals = signals
        self._state.alert_on = bool(signals.dd15_ma200)
        sel = select_asset(self._state.regime_state, signals)
        self._state.asset = sel.asset
        self._state.selection_reason = sel.reason
        self._state.touch()
        return self._state

    def snapshot(self) -> dict:
        return deepcopy(self._state.to_dict())

    def bootstrap_growth(self) -> TaxableAccountState:
        self._state = TaxableAccountState(regime_state=RegimeState.GROWTH_ACTIVE)
        return self._state
