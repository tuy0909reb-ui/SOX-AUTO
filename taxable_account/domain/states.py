"""Canonical enums aligned with taxable_account_state.schema.json."""

from __future__ import annotations

from enum import Enum


class RegimeState(str, Enum):
    GROWTH_ACTIVE = "GROWTH_ACTIVE"
    EXIT_PENDING = "EXIT_PENDING"
    SWING_ACTIVE = "SWING_ACTIVE"
    REENTRY_PENDING = "REENTRY_PENDING"


class PositionState(str, Enum):
    WAIT = "WAIT"
    WATCH = "WATCH"
    ENTRY_READY = "ENTRY_READY"
    POSITION_ACTIVE = "POSITION_ACTIVE"
    EXIT = "EXIT"
    REENTRY_WAIT = "REENTRY_WAIT"


class Asset(str, Enum):
    NOMURA_WORLD_SEMI = "NOMURA_WORLD_SEMI"
    NIKKEI_LEV_1570 = "NIKKEI_LEV_1570"
    SEMI_282A = "SEMI_282A"
    CASH = "CASH"


class RiskStatus(str, Enum):
    NA = "N/A"
    ACTIVE = "ACTIVE"
    TRIGGERED = "TRIGGERED"
    CANCELLED = "CANCELLED"


class ExitReason(str, Enum):
    TIME = "TIME"
    ABNORMAL = "ABNORMAL"
    ALERT_FLATTEN = "ALERT_FLATTEN"
    STOP_TRIGGERED = "STOP_TRIGGERED"
    MANUAL = "MANUAL"
    TRANSFER = "TRANSFER"


class SelectionReason(str, Enum):
    GROWTH_DEFAULT = "growth_default"
    CRASH_15 = "crash_15"
    SEMI_SIGNAL = "semi_signal"
    FLAT = "flat"
    TRANSITIONAL = "transitional"


ASSET_DISPLAY = {
    Asset.NOMURA_WORLD_SEMI: "野村世界半導体株投資",
    Asset.NIKKEI_LEV_1570: "1570",
    Asset.SEMI_282A: "282A",
    Asset.CASH: "CASH",
}

HOLD_DAYS = {
    Asset.NIKKEI_LEV_1570: 20,
    Asset.SEMI_282A: 15,
    Asset.NOMURA_WORLD_SEMI: None,
    Asset.CASH: None,
}

STOP_PCT_1570 = 0.15
