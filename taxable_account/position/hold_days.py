"""
Business-day hold counting for Time Exit (DETAILED-SPEC §4 / Swing Freeze).

hold_business_days = np.busday_count(entry_date, as_of)
  — entry day = 0; matches swing backtest index delta (i - entry_i).
TIME_EXIT_DUE when hold_business_days >= max_hold_business_days.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

import numpy as np

from taxable_account.domain.models import TaxableAccountState
from taxable_account.domain.states import Asset, PositionState


def business_hold_days(entry_date: date, as_of: date) -> int:
    """Weekday count from entry (inclusive start semantics of busday_count end-exclusive)."""
    if as_of < entry_date:
        return 0
    return int(np.busday_count(entry_date, as_of))


def time_exit_due(account: TaxableAccountState, as_of: date) -> bool:
    """True when POSITION_ACTIVE swing sleeve has reached max hold business days."""
    if account.position_state != PositionState.POSITION_ACTIVE:
        return False
    if account.held_asset not in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A):
        return False
    max_hold = account.max_hold_business_days
    if max_hold is None or max_hold < 1:
        return False
    if account.entry_date is None:
        return False
    return business_hold_days(account.entry_date, as_of) >= int(max_hold)


def time_exit_snapshot(
    account: TaxableAccountState,
    as_of: date,
    *,
    triggered: bool = False,
) -> dict[str, Optional[object]]:
    """
    Runtime-facing hold / Time Exit status for ops / future Discord projection.

    time_exit_status:
      N/A | MONITORING | TRIGGERED
    """
    max_hold = account.max_hold_business_days
    holding = (
        account.position_state == PositionState.POSITION_ACTIVE
        and account.held_asset in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A)
        and account.entry_date is not None
        and max_hold is not None
    )
    if triggered:
        days = (
            business_hold_days(account.entry_date, as_of)
            if account.entry_date is not None
            else None
        )
        # After EXIT_FILLED, max_hold may already be cleared — keep last known from arg path
        return {
            "current_holding_days": days,
            "max_hold_business_days": max_hold,
            "time_exit_status": "TRIGGERED",
        }
    if not holding:
        return {
            "current_holding_days": None,
            "max_hold_business_days": max_hold,
            "time_exit_status": "N/A",
        }
    days = business_hold_days(account.entry_date, as_of)  # type: ignore[arg-type]
    return {
        "current_holding_days": days,
        "max_hold_business_days": max_hold,
        "time_exit_status": "MONITORING",
    }
