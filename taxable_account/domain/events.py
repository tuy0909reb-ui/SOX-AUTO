"""Domain events. Events are not stored inside TaxableAccountState."""

from __future__ import annotations

from enum import Enum


class DomainEvent(str, Enum):
    # Regime / market
    ALERT_ON = "ALERT_ON"
    ALERT_OFF = "ALERT_OFF"
    TRANSFER_COMPLETE = "TRANSFER_COMPLETE"
    RECOVERY_COMPLETE = "RECOVERY_COMPLETE"

    # Position lifecycle
    REGIME_ENTER_SWING = "REGIME_ENTER_SWING"
    REGIME_ENTER_GROWTH = "REGIME_ENTER_GROWTH"
    SIGNAL_ENTRY_AVAILABLE = "SIGNAL_ENTRY_AVAILABLE"
    ENTRY_FILLED = "ENTRY_FILLED"
    TIME_EXIT_DUE = "TIME_EXIT_DUE"
    ABNORMAL_EXIT = "ABNORMAL_EXIT"
    ALERT_FLATTEN = "ALERT_FLATTEN"
    STOP_TRIGGERED = "STOP_TRIGGERED"
    EXIT_FILLED = "EXIT_FILLED"
    REENTRY_SIGNAL = "REENTRY_SIGNAL"
    SIGNAL_LOST = "SIGNAL_LOST"
    # Internal only — not a Human Trade Report field (HTR Port v1.0)
    DELAYED_FILL_RECOVERY = "DELAYED_FILL_RECOVERY"
