"""
TaxableAccountRuntime — Detection → Decision → State → Position/Risk → ViewModel.

State is the Single Source of Truth. Discord receives ViewModel projection only.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Any, Optional

from taxable_account.decision.asset_selection import (
    entry_possible,
    select_asset,
    swing_entry_signal_active,
)
from taxable_account.detection.market_condition import MarketCondition
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus
from taxable_account.engine import TaxableAccountEngine
from taxable_account.position.hold_days import business_hold_days, time_exit_due, time_exit_snapshot
from taxable_account.position.risk_control import is_stop_breached
from taxable_account.view.discord_adapter import DiscordProjection, project_discord_payload
from taxable_account.view.view_model import project_view_model


@dataclass
class RuntimeConfig:
    auto_transfer: bool = True  # paper: EXIT_PENDING → TRANSFER_COMPLETE same step
    auto_fill: bool = True  # paper: ENTRY_READY → ENTRY_FILLED same step
    auto_exit_fill: bool = True  # paper: EXIT → EXIT_FILLED same step
    discord_dry_run: bool = True


@dataclass
class StepResult:
    as_of: date
    state: dict[str, Any]
    view_model: dict[str, Any]
    discord: DiscordProjection
    events: list[str] = field(default_factory=list)
    condition: Optional[dict[str, Any]] = None
    # Runtime hold / Time Exit projection (Discord display wiring is separate)
    time_exit: Optional[dict[str, Any]] = None


class TaxableAccountRuntime:
    def __init__(
        self,
        detection: Any,
        *,
        config: Optional[RuntimeConfig] = None,
        engine: Optional[TaxableAccountEngine] = None,
    ) -> None:
        """detection: object with condition_on(as_of) -> MarketCondition."""
        self.detection = detection
        self.config = config or RuntimeConfig()
        self.engine = engine or TaxableAccountEngine()
        self._prev_alert: Optional[bool] = None
        self._history: list[StepResult] = []

    @property
    def state(self):
        return self.engine.state

    def step(self, as_of: date | str) -> StepResult:
        events: list[str] = []
        cond = self.detection.condition_on(as_of)
        account = self.engine.set_signals(cond.signals)
        # Keep alert_on aligned with Model B alert series (not raw dd15 alone)
        account.alert_on = cond.alert_on

        prev = self._prev_alert
        cur = cond.alert_on

        if prev is None:
            # bootstrap: if starting already in alert, enter swing path
            if cur:
                self.engine.on_event(DomainEvent.ALERT_ON)
                events.append(DomainEvent.ALERT_ON.value)
                if self.config.auto_transfer:
                    self.engine.on_event(DomainEvent.TRANSFER_COMPLETE)
                    events.append(DomainEvent.TRANSFER_COMPLETE.value)
        else:
            if (not prev) and cur:
                self.engine.on_event(DomainEvent.ALERT_ON)
                events.append(DomainEvent.ALERT_ON.value)
                if self.config.auto_transfer:
                    self.engine.on_event(DomainEvent.TRANSFER_COMPLETE)
                    events.append(DomainEvent.TRANSFER_COMPLETE.value)
            elif prev and (not cur):
                self.engine.on_event(DomainEvent.ALERT_OFF)
                events.append(DomainEvent.ALERT_OFF.value)
                if self.state.position_state == PositionState.EXIT and self.config.auto_exit_fill:
                    px = self._mark_price(cond)
                    self.engine.on_event(
                        DomainEvent.EXIT_FILLED, fill_price=px, fill_date=cond.as_of
                    )
                    events.append(DomainEvent.EXIT_FILLED.value)
                self.engine.on_event(DomainEvent.RECOVERY_COMPLETE)
                events.append(DomainEvent.RECOVERY_COMPLETE.value)

        self._prev_alert = cur
        account = self.state
        sel = select_asset(account.regime_state, account.signals)
        account.asset = sel.asset
        account.selection_reason = sel.reason

        # Snapshot hold metrics before exit events clear entry_date / max_hold
        hold_snap = self._hold_snapshot_pre_exit(cond.as_of)

        # Risk monitoring before Time Exit / new entries (Stop takes precedence)
        self._maybe_trigger_stop(cond, events)

        # Spec Time Exit (DETAILED-SPEC §4 / Swing Freeze) — existing TIME_EXIT_DUE path
        self._maybe_trigger_time_exit(cond, events)

        # Entry path
        self._maybe_enter(cond, events)

        # Complete pending exits
        account = self.state
        if account.position_state == PositionState.EXIT and self.config.auto_exit_fill:
            px = self._mark_price(cond)
            self.engine.on_event(DomainEvent.EXIT_FILLED, fill_price=px, fill_date=cond.as_of)
            events.append(DomainEvent.EXIT_FILLED.value)

        account = self.state
        mark = self._mark_price(cond)
        # Display marks only — no decision logic (Phase 5.1 reference numbers)
        vm = project_view_model(account, current_price=mark, as_of=cond.as_of)
        discord = project_discord_payload(vm, dry_run=self.config.discord_dry_run)
        time_exit = self._finalize_time_exit_info(hold_snap, events, cond.as_of)

        result = StepResult(
            as_of=cond.as_of,
            state=account.to_dict(),
            view_model=vm,
            discord=discord,
            events=events,
            condition=cond.to_dict(),
            time_exit=time_exit,
        )
        self._history.append(result)
        return result

    def run(self, dates: list[date | str]) -> list[StepResult]:
        return [self.step(d) for d in dates]

    def _mark_price(self, cond: MarketCondition) -> Optional[float]:
        held = self.state.held_asset
        if held == Asset.CASH:
            return None
        return cond.price_of(held.value)

    def _maybe_trigger_stop(self, cond: MarketCondition, events: list[str]) -> None:
        account = self.state
        if account.position_state != PositionState.POSITION_ACTIVE:
            return
        if account.held_asset != Asset.NIKKEI_LEV_1570:
            return
        if account.risk_control.status != RiskStatus.ACTIVE:
            return
        px = cond.price_of(Asset.NIKKEI_LEV_1570.value)
        if px is None:
            return
        if is_stop_breached(px, account.risk_control):
            self.engine.on_event(DomainEvent.STOP_TRIGGERED)
            events.append(DomainEvent.STOP_TRIGGERED.value)

    def _maybe_trigger_time_exit(self, cond: MarketCondition, events: list[str]) -> None:
        """Fire TIME_EXIT_DUE via existing Position engine when max hold reached."""
        account = self.state
        if account.position_state != PositionState.POSITION_ACTIVE:
            return
        if not time_exit_due(account, cond.as_of):
            return
        self.engine.on_event(DomainEvent.TIME_EXIT_DUE)
        events.append(DomainEvent.TIME_EXIT_DUE.value)

    def _hold_snapshot_pre_exit(self, as_of: date) -> dict[str, Any]:
        account = self.state
        if (
            account.position_state == PositionState.POSITION_ACTIVE
            and account.entry_date is not None
            and account.max_hold_business_days is not None
            and account.held_asset in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A)
        ):
            return {
                "current_holding_days": business_hold_days(account.entry_date, as_of),
                "max_hold_business_days": account.max_hold_business_days,
            }
        return {
            "current_holding_days": None,
            "max_hold_business_days": account.max_hold_business_days,
        }

    def _finalize_time_exit_info(
        self,
        hold_snap: dict[str, Any],
        events: list[str],
        as_of: date,
    ) -> dict[str, Any]:
        if DomainEvent.TIME_EXIT_DUE.value in events:
            return {
                "current_holding_days": hold_snap.get("current_holding_days"),
                "max_hold_business_days": hold_snap.get("max_hold_business_days"),
                "time_exit_status": "TRIGGERED",
            }
        return time_exit_snapshot(self.state, as_of, triggered=False)

    def _maybe_enter(self, cond: MarketCondition, events: list[str]) -> None:
        account = self.state
        if account.regime_state != RegimeState.SWING_ACTIVE:
            if account.position_state == PositionState.ENTRY_READY:
                self.engine.on_event(DomainEvent.SIGNAL_LOST)
                events.append(DomainEvent.SIGNAL_LOST.value)
            return

        # ENTRY_READY: drop signal_date if condition gone; else optional delayed fill
        if account.position_state == PositionState.ENTRY_READY:
            if not swing_entry_signal_active(account.asset, account.signals):
                self.engine.on_event(DomainEvent.SIGNAL_LOST)
                events.append(DomainEvent.SIGNAL_LOST.value)
                account = self.state
            else:
                if self.config.auto_fill:
                    self._fill_entry(cond, events)
                return

        flat = account.position_state in (PositionState.WATCH, PositionState.REENTRY_WAIT)
        if not flat:
            return

        if not entry_possible(account.regime_state, account.asset, True, account.signals):
            return

        if account.position_state == PositionState.REENTRY_WAIT:
            self.engine.on_event(DomainEvent.REENTRY_SIGNAL, signal_date=cond.as_of)
            events.append(DomainEvent.REENTRY_SIGNAL.value)
        else:
            self.engine.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE, signal_date=cond.as_of)
            events.append(DomainEvent.SIGNAL_ENTRY_AVAILABLE.value)

        if self.config.auto_fill and self.state.position_state == PositionState.ENTRY_READY:
            self._fill_entry(cond, events)

    def _fill_entry(self, cond: MarketCondition, events: list[str]) -> None:
        asset = self.state.asset
        px = cond.price_of(asset.value)
        if px is None or asset == Asset.CASH:
            return
        self.engine.on_event(
            DomainEvent.ENTRY_FILLED,
            fill_asset=asset,
            fill_price=px,
            fill_date=cond.as_of,
        )
        events.append(DomainEvent.ENTRY_FILLED.value)
