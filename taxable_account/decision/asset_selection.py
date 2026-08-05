"""
Asset Selection engine — independent from Regime transition code paths.

Spec (DETAILED-SPEC §3):
  GROWTH_ACTIVE     -> NOMURA_WORLD_SEMI
  EXIT_PENDING      -> CASH (transitional)
  REENTRY_PENDING   -> CASH
  SWING_ACTIVE      -> crash_15: 1570; else semi_signal: 282A; else CASH

Swing sleeve priority (exclusive): 1570 > 282A > CASH
Growth is regime-gated (not ranked under swing signals).
"""

from __future__ import annotations

from taxable_account.domain.models import MarketSignals, SelectionResult
from taxable_account.domain.states import Asset, RegimeState, SelectionReason


def select_asset(regime: RegimeState, signals: MarketSignals) -> SelectionResult:
    if regime == RegimeState.GROWTH_ACTIVE:
        return SelectionResult(Asset.NOMURA_WORLD_SEMI, SelectionReason.GROWTH_DEFAULT)

    if regime in (RegimeState.EXIT_PENDING, RegimeState.REENTRY_PENDING):
        return SelectionResult(Asset.CASH, SelectionReason.TRANSITIONAL)

    if regime == RegimeState.SWING_ACTIVE:
        if signals.crash_15:
            return SelectionResult(Asset.NIKKEI_LEV_1570, SelectionReason.CRASH_15)
        if signals.semi_signal:
            return SelectionResult(Asset.SEMI_282A, SelectionReason.SEMI_SIGNAL)
        return SelectionResult(Asset.CASH, SelectionReason.FLAT)

    return SelectionResult(Asset.CASH, SelectionReason.FLAT)


def swing_entry_signal_active(selected: Asset, signals: MarketSignals) -> bool:
    """Whether Swing Entry condition for selected asset is currently true (no position gate)."""
    if selected == Asset.NIKKEI_LEV_1570:
        return bool(signals.crash_15)
    if selected == Asset.SEMI_282A:
        return bool(signals.semi_signal) and not bool(signals.crash_15)
    return False


def entry_possible(
    regime: RegimeState,
    selected: Asset,
    position_is_flat_watchlike: bool,
    signals: MarketSignals,
) -> bool:
    """Whether ENTRY_READY is allowed for the selected asset."""
    if selected == Asset.CASH:
        return False
    if selected == Asset.NOMURA_WORLD_SEMI:
        return regime == RegimeState.GROWTH_ACTIVE
    if selected in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A):
        return (
            regime == RegimeState.SWING_ACTIVE
            and position_is_flat_watchlike
            and swing_entry_signal_active(selected, signals)
        )
    return False
