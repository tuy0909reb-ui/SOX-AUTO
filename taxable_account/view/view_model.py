"""
TaxableAccountViewModel — operational projection (schema 2.1).

Maps TaxableAccountState (+ runtime marks) into a one-screen ops model.
Does not invent trading rules. Discord must project this DTO only.
Reference numbers are derived only from State fields + caller-supplied marks.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any, Optional, Union

from taxable_account.domain.models import TaxableAccountState
from taxable_account.domain.states import (
    ASSET_DISPLAY,
    Asset,
    ExitReason,
    PositionState,
    RegimeState,
    RiskStatus,
    SelectionReason,
)
from taxable_account.view.human_display import next_operation

from taxable_account.position.hold_days import business_hold_days

SCHEMA_VERSION = "2.1"

DECISION_MAINTAIN = "MAINTAIN"
DECISION_HOLD = "HOLD"
DECISION_EXIT = "EXIT"
DECISION_ENTRY_READY = "ENTRY_READY"
DECISION_REENTRY_WAIT = "REENTRY_WAIT"
DECISION_TRANSFER = "TRANSFER"
DECISION_WAIT = "WAIT"

DateLike = Union[date, str, None]


def _parse_as_of(as_of: DateLike) -> Optional[date]:
    if as_of is None:
        return None
    if isinstance(as_of, date):
        return as_of
    return date.fromisoformat(str(as_of)[:10])


def _display_position_state(state: TaxableAccountState) -> str:
    if (
        state.position_state == PositionState.POSITION_ACTIVE
        and state.held_asset == Asset.NIKKEI_LEV_1570
        and state.risk_control.status == RiskStatus.ACTIVE
    ):
        return "RISK_CONTROL_ACTIVE"
    return state.position_state.value


def _current_asset(state: TaxableAccountState) -> Asset:
    if state.held_asset != Asset.CASH:
        return state.held_asset
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return Asset.NOMURA_WORLD_SEMI
    return state.asset


def _decision(state: TaxableAccountState) -> str:
    if state.regime_state == RegimeState.EXIT_PENDING:
        return DECISION_TRANSFER
    if state.risk_control.status == RiskStatus.TRIGGERED or state.position_state == PositionState.EXIT:
        return DECISION_EXIT
    if state.position_state == PositionState.REENTRY_WAIT:
        return DECISION_REENTRY_WAIT
    if state.position_state == PositionState.ENTRY_READY:
        return DECISION_ENTRY_READY
    if state.position_state == PositionState.POSITION_ACTIVE:
        return DECISION_HOLD
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return DECISION_MAINTAIN
    return DECISION_WAIT


def _decision_reasons(state: TaxableAccountState) -> list[str]:
    reasons: list[str] = []
    regime = state.regime_state
    pos = state.position_state
    sig = state.signals

    if regime == RegimeState.GROWTH_ACTIVE and not state.alert_on:
        reasons.append("Growth Phase継続")
    if state.alert_on or sig.dd15_ma200:
        if regime in (RegimeState.EXIT_PENDING, RegimeState.SWING_ACTIVE):
            reasons.append("Growth警戒によりSwingへ移行")
        elif regime == RegimeState.GROWTH_ACTIVE and state.alert_on:
            reasons.append("Growth警戒によりSwingへ移行")
    if regime == RegimeState.EXIT_PENDING:
        reasons.append("Growth撤退・Swing移管処理中")
    if regime == RegimeState.SWING_ACTIVE:
        if sig.crash_15 or state.selection_reason == SelectionReason.CRASH_15:
            reasons.append("暴落反発フェイズ")
        elif sig.semi_signal or state.selection_reason == SelectionReason.SEMI_SIGNAL:
            reasons.append("半導体Swingフェイズ")
        elif state.selection_reason == SelectionReason.FLAT:
            reasons.append("Swing条件未成立（CASH）")
    if regime == RegimeState.REENTRY_PENDING:
        if sig.recovery_model_b_met:
            reasons.append("Growth復帰条件を充足")
        else:
            days = int(sig.recovery_b_days or 0)
            reasons.append(f"Growth復帰条件の確認中（{days}/20）")
    if (
        state.held_asset == Asset.NIKKEI_LEV_1570
        and state.risk_control.status == RiskStatus.ACTIVE
    ):
        reasons.append("保有中Risk Stop監視")
    if state.risk_control.status == RiskStatus.TRIGGERED:
        reasons.append("1570 Risk Stop発動")
    if pos == PositionState.REENTRY_WAIT:
        reasons.append("Exit後・再評価待ち")
    if pos == PositionState.ENTRY_READY:
        if state.asset == Asset.NIKKEI_LEV_1570:
            reasons.append("1570 Entry可能")
        elif state.asset == Asset.SEMI_282A:
            reasons.append("282A Entry可能")

    seen: set[str] = set()
    out: list[str] = []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            out.append(r)
    if not out:
        out.append("状態監視")
    return out


def _infer_previous_asset(
    state: TaxableAccountState,
    previous_asset: Optional[Asset],
) -> Asset:
    if previous_asset is not None:
        return previous_asset
    if state.position_state in (PositionState.POSITION_ACTIVE, PositionState.EXIT):
        if state.held_asset in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A):
            return Asset.CASH
        if state.held_asset == Asset.NOMURA_WORLD_SEMI:
            return Asset.NOMURA_WORLD_SEMI
    if state.position_state == PositionState.REENTRY_WAIT:
        if state.exit_reason == ExitReason.STOP_TRIGGERED:
            return Asset.NIKKEI_LEV_1570
        if state.exit_reason == ExitReason.TIME:
            # Freeze time-exit may be 1570 or 282A; prefer selected swing asset if set
            if state.asset in (Asset.NIKKEI_LEV_1570, Asset.SEMI_282A):
                return state.asset
            return Asset.NIKKEI_LEV_1570
        if state.exit_reason == ExitReason.TRANSFER:
            return Asset.NOMURA_WORLD_SEMI
        return Asset.CASH
    if state.regime_state == RegimeState.EXIT_PENDING:
        return Asset.NOMURA_WORLD_SEMI
    if state.regime_state == RegimeState.REENTRY_PENDING:
        return Asset.CASH
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return Asset.NOMURA_WORLD_SEMI
    return Asset.CASH


def _capital_flow_reason(state: TaxableAccountState) -> str:
    if state.regime_state == RegimeState.GROWTH_ACTIVE and not state.alert_on:
        return "Growth Phase継続"
    if state.regime_state == RegimeState.EXIT_PENDING:
        return "Growth警戒によりSwingへ移行"
    if state.regime_state == RegimeState.REENTRY_PENDING:
        if state.signals.recovery_model_b_met:
            return "Growth復帰条件を充足"
        return "Growth復帰条件の確認中"
    if state.position_state == PositionState.REENTRY_WAIT:
        if state.regime_state == RegimeState.SWING_ACTIVE:
            return "Freeze Re-evaluation"
        return "Growth復帰条件の確認中"
    if state.signals.crash_15 or state.selection_reason == SelectionReason.CRASH_15:
        return "暴落反発フェイズ"
    if state.signals.semi_signal or state.selection_reason == SelectionReason.SEMI_SIGNAL:
        return "半導体Swingフェイズ"
    if state.regime_state == RegimeState.SWING_ACTIVE:
        return "Swing Flat / 条件待ち"
    return "状態監視"


def _next_candidate_label(state: TaxableAccountState) -> str:
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    if state.regime_state == RegimeState.EXIT_PENDING:
        if state.signals.crash_15:
            return ASSET_DISPLAY[Asset.NIKKEI_LEV_1570]
        if state.signals.semi_signal:
            return ASSET_DISPLAY[Asset.SEMI_282A]
        return "Swing（1570 / 282A / CASH）"
    if state.regime_state == RegimeState.REENTRY_PENDING:
        return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    if state.position_state == PositionState.REENTRY_WAIT:
        if state.regime_state == RegimeState.SWING_ACTIVE:
            if state.signals.crash_15:
                return ASSET_DISPLAY[Asset.NIKKEI_LEV_1570]
            if state.signals.semi_signal:
                return ASSET_DISPLAY[Asset.SEMI_282A]
            return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
        return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    if state.position_state == PositionState.POSITION_ACTIVE:
        if state.held_asset == Asset.NIKKEI_LEV_1570:
            return "Freeze Re-evaluation"
        if state.held_asset == Asset.SEMI_282A:
            return "Existing Exit / Flat"
        return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    if state.selection_reason == SelectionReason.CRASH_15 or state.signals.crash_15:
        return ASSET_DISPLAY[Asset.NIKKEI_LEV_1570]
    if state.selection_reason == SelectionReason.SEMI_SIGNAL or state.signals.semi_signal:
        return ASSET_DISPLAY[Asset.SEMI_282A]
    if state.regime_state == RegimeState.SWING_ACTIVE:
        return ASSET_DISPLAY[Asset.CASH]
    return ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]


def _capital_flow(
    state: TaxableAccountState,
    *,
    previous_asset: Optional[Asset],
) -> dict[str, Any]:
    held = state.held_asset
    regime = state.regime_state
    prev = _infer_previous_asset(state, previous_asset)
    cur_asset = _current_asset(state)
    if regime == RegimeState.GROWTH_ACTIVE and held == Asset.NOMURA_WORLD_SEMI:
        current_label = "野村保有"
    elif regime == RegimeState.EXIT_PENDING:
        current_label = "野村撤退処理中"
    elif held == Asset.CASH:
        current_label = "CASH"
    else:
        current_label = ASSET_DISPLAY[held]

    next_dest = _next_candidate_label(state)
    reason = _capital_flow_reason(state)

    steps: list[dict[str, str]] = [{"label": current_label, "status": "current"}]
    if regime == RegimeState.GROWTH_ACTIVE:
        steps.append({"label": "警戒発生でSwing移行", "status": "candidate"})
    elif regime == RegimeState.EXIT_PENDING:
        steps.append({"label": "Swing移行", "status": "active"})
    elif regime == RegimeState.SWING_ACTIVE:
        steps.append({"label": "Swing運用中", "status": "active"})
    else:
        steps.append({"label": "野村再投入（Growth復帰）", "status": "active"})

    swing_candidates = [
        {
            "when": "暴落反発フェイズ",
            "asset_code": Asset.NIKKEI_LEV_1570.value,
            "asset_display": ASSET_DISPLAY[Asset.NIKKEI_LEV_1570],
            "active": regime == RegimeState.SWING_ACTIVE
            and (
                state.selection_reason == SelectionReason.CRASH_15
                or state.signals.crash_15
            ),
        },
        {
            "when": "半導体Swingフェイズ",
            "asset_code": Asset.SEMI_282A.value,
            "asset_display": ASSET_DISPLAY[Asset.SEMI_282A],
            "active": regime == RegimeState.SWING_ACTIVE
            and state.selection_reason == SelectionReason.SEMI_SIGNAL
            and not state.signals.crash_15,
        },
        {
            "when": "条件なし",
            "asset_code": Asset.CASH.value,
            "asset_display": ASSET_DISPLAY[Asset.CASH],
            "active": regime == RegimeState.SWING_ACTIVE
            and state.selection_reason in (SelectionReason.FLAT, SelectionReason.TRANSITIONAL),
        },
    ]

    if held == Asset.CASH:
        current_asset_disp = "CASH"
    elif held == Asset.NOMURA_WORLD_SEMI:
        current_asset_disp = ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI]
    else:
        current_asset_disp = ASSET_DISPLAY[held]

    return {
        # Phase 5.1 canonical capital-flow fields
        "current_asset": current_asset_disp,
        "previous_asset": ASSET_DISPLAY[prev],
        "next_candidate": next_dest,
        "reason": reason,
        # retained narrative helpers (display only)
        "current": current_label,
        "current_asset_code": held.value if held != Asset.CASH else cur_asset.value,
        "steps": steps,
        "swing_candidates": swing_candidates,
        "next_destination": next_dest,
    }


def _entry_timing(state: TaxableAccountState) -> dict[str, Any]:
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return {
            "asset_code": Asset.NOMURA_WORLD_SEMI.value,
            "asset_display": ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI],
            "status": "N/A",
            "reason": "Growth維持（新規Swing Entry対象外）",
        }
    if state.regime_state == RegimeState.EXIT_PENDING:
        return {
            "asset_code": Asset.CASH.value,
            "asset_display": ASSET_DISPLAY[Asset.CASH],
            "status": "WAIT",
            "reason": "移管完了待ち",
        }
    if state.regime_state == RegimeState.REENTRY_PENDING:
        return {
            "asset_code": Asset.NOMURA_WORLD_SEMI.value,
            "asset_display": ASSET_DISPLAY[Asset.NOMURA_WORLD_SEMI],
            "status": "WAIT",
            "reason": "Growth復帰条件の確認中",
        }
    if state.position_state == PositionState.POSITION_ACTIVE:
        return {
            "asset_code": state.held_asset.value,
            "asset_display": ASSET_DISPLAY[state.held_asset],
            "status": "N/A",
            "reason": "保有中（追加Entryなし）",
        }
    if state.position_state == PositionState.ENTRY_READY and state.asset != Asset.CASH:
        reason = "暴落反発フェイズ" if state.asset == Asset.NIKKEI_LEV_1570 else "半導体Swingフェイズ"
        return {
            "asset_code": state.asset.value,
            "asset_display": ASSET_DISPLAY[state.asset],
            "status": "ENTRY_READY",
            "reason": reason,
        }
    if state.signals.crash_15:
        reason = "暴落反発フェイズ（投入待ち）"
        code = Asset.NIKKEI_LEV_1570
    elif state.signals.semi_signal:
        reason = "半導体Swingフェイズ（投入待ち）"
        code = Asset.SEMI_282A
    else:
        reason = "条件未成立"
        code = Asset.CASH
    if state.position_state == PositionState.REENTRY_WAIT and code != Asset.CASH:
        reason = f"再評価: {reason}"
    return {
        "asset_code": code.value,
        "asset_display": ASSET_DISPLAY[code],
        "status": "WAIT",
        "reason": reason,
    }


def _entry_status(
    state: TaxableAccountState,
    entry_timing: dict[str, Any],
    *,
    as_of: Optional[date],
) -> dict[str, Any]:
    """Entry timing projection: signal_date (condition) vs entry_date (purchase)."""
    if state.position_state == PositionState.POSITION_ACTIVE:
        status = "FILLED"
        status_label = "購入済み"
    elif state.position_state == PositionState.ENTRY_READY:
        status = "READY"
        status_label = "投入待ち"
    elif state.position_state == PositionState.EXIT:
        status = "WAIT"
        status_label = "Exit処理中"
    else:
        status = "WAIT"
        status_label = "待機"

    hold_days = None
    max_hold = state.max_hold_business_days
    time_status = "N/A"
    if (
        state.position_state == PositionState.POSITION_ACTIVE
        and state.entry_date is not None
        and as_of is not None
        and max_hold is not None
    ):
        hold_days = business_hold_days(state.entry_date, as_of)
        time_status = "MONITORING"

    return {
        "status": status,
        "status_label": status_label,
        "candidate": entry_timing["asset_display"],
        "blocking_reason": entry_timing["reason"],
        "signal_date": None if state.signal_date is None else state.signal_date.isoformat(),
        "entry_date": None if state.entry_date is None else state.entry_date.isoformat(),
        "current_holding_days": hold_days,
        "max_hold_business_days": max_hold,
        "time_exit_status": time_status,
    }


def _next_action(state: TaxableAccountState) -> str:
    return next_operation(state)



def _reference_block(
    state: TaxableAccountState,
    *,
    current_price: Optional[float],
    high_price: Optional[float],
    as_of: Optional[date],
) -> dict[str, Any]:
    entry_price = state.entry_price
    pnl = None
    if current_price is not None and entry_price is not None and entry_price != 0:
        pnl = current_price / entry_price - 1.0

    holding_days = None
    if state.entry_date is not None and as_of is not None:
        holding_days = (as_of - state.entry_date).days

    dd_high = None
    if high_price is not None and current_price is not None and high_price != 0:
        dd_high = current_price / high_price - 1.0

    return {
        "entry_date": None if state.entry_date is None else state.entry_date.isoformat(),
        "entry_price": entry_price,
        "current_price": current_price,
        "pnl_pct": pnl,
        "holding_days": holding_days,
        "drawdown_from_high_pct": dd_high,
    }


def _risk_block(
    state: TaxableAccountState,
    *,
    current_price: Optional[float],
) -> dict[str, Any]:
    applicable = (
        state.held_asset == Asset.NIKKEI_LEV_1570
        and state.risk_control.enabled
        and state.risk_control.status != RiskStatus.NA
    )
    stop_price = state.risk_control.stop_price if applicable else None
    distance = None
    if applicable and stop_price is not None and current_price is not None and current_price != 0:
        distance = (current_price - stop_price) / current_price
    return {
        "applicable": applicable,
        "formula": "Entry × 0.85" if applicable else None,
        "stop_pct": state.risk_control.stop_pct if applicable else None,
        "stop_price": stop_price,
        "status": state.risk_control.status.value if applicable else RiskStatus.NA.value,
        "distance_pct": distance,
    }


def _position_block(
    state: TaxableAccountState,
    *,
    current_price: Optional[float],
) -> Optional[dict[str, Any]]:
    holding = state.position_state in (PositionState.POSITION_ACTIVE, PositionState.EXIT)
    if not holding or state.held_asset == Asset.CASH:
        return None

    ret = None
    if current_price is not None and state.entry_price is not None:
        ret = current_price / state.entry_price - 1.0

    risk_stop = None
    if state.held_asset == Asset.NIKKEI_LEV_1570 and state.risk_control.enabled:
        risk_stop = {
            "formula": "Entry × 0.85",
            "stop_pct": state.risk_control.stop_pct,
            "stop_price": state.risk_control.stop_price,
            "status": state.risk_control.status.value,
        }

    return {
        "asset_code": state.held_asset.value,
        "asset_display": ASSET_DISPLAY[state.held_asset],
        "entry_date": None if state.entry_date is None else state.entry_date.isoformat(),
        "entry_price": state.entry_price,
        "current_price": current_price,
        "return_pct": ret,
        "position_state": _display_position_state(state),
        "risk_stop": risk_stop,
    }


def _signal_label(state: TaxableAccountState) -> Optional[str]:
    if state.selection_reason == SelectionReason.CRASH_15 or state.signals.crash_15:
        return "crash_15"
    if state.selection_reason == SelectionReason.SEMI_SIGNAL or state.signals.semi_signal:
        return "semi_signal"
    return None


def project_view_model(
    state: TaxableAccountState,
    *,
    current_price: Optional[float] = None,
    high_price: Optional[float] = None,
    as_of: DateLike = None,
    previous_asset: Optional[Asset] = None,
) -> dict[str, Any]:
    """
    Pure projection. Optional marks (current_price / high_price / as_of / previous_asset)
    must be supplied by runtime from existing market/state data — not computed in Discord.
    """
    asset = _current_asset(state)
    decision = _decision(state)
    reasons = _decision_reasons(state)
    as_of_d = _parse_as_of(as_of)
    entry_timing = _entry_timing(state)
    capital_flow = _capital_flow(state, previous_asset=previous_asset)

    # Growth display: use mark for Nomura when held
    mark = current_price
    if mark is None and state.held_asset == Asset.NOMURA_WORLD_SEMI:
        mark = current_price

    return {
        "schema_version": SCHEMA_VERSION,
        "as_of": (as_of_d.isoformat() if as_of_d else datetime.now(timezone.utc).date().isoformat()),
        "current_state": {
            "regime": state.regime_state.value,
            "asset": {
                "code": asset.value,
                "display_name": ASSET_DISPLAY[asset],
            },
            "position_state": _display_position_state(state),
            "decision": decision,
        },
        "decision_reason": {
            "primary": reasons[0],
            "details": reasons,
        },
        "signal": _signal_label(state),
        "capital_flow": capital_flow,
        "entry_timing": entry_timing,
        "entry_status": _entry_status(state, entry_timing, as_of=as_of_d),
        "reference": _reference_block(
            state, current_price=mark, high_price=high_price, as_of=as_of_d
        ),
        "risk": _risk_block(state, current_price=mark),
        "next_action": _next_action(state),
        "position": _position_block(state, current_price=mark),
    }


def render_ops_text(view_model: dict[str, Any]) -> str:
    """Plain-text one-screen ops view (projection only)."""
    cs = view_model["current_state"]
    dr = view_model["decision_reason"]
    cf = view_model["capital_flow"]
    es = view_model["entry_status"]
    ref = view_model["reference"]
    risk = view_model["risk"]
    pos = view_model.get("position")
    signal = view_model.get("signal")

    decision_disp = "HOLD" if cs["decision"] == "MAINTAIN" else cs["decision"]
    state_disp = "MAINTAIN" if cs["decision"] == "MAINTAIN" else cs["position_state"]

    lines = [
        "特定口座 運用判断",
        "",
        "運用フェイズ:",
        state_disp,
        "",
        "現在ポジション:",
        cs["asset"]["display_name"],
        "",
        "現在判断:",
        decision_disp,
    ]
    if signal:
        lines += ["", "Signal:", signal]
    lines += [
        "",
        "資金移動フロー:",
        f"Previous: {cf['previous_asset']}",
        f"Current: {cf['current_asset']}",
        f"Next: {cf['next_candidate']}",
        f"Reason: {cf['reason']}",
        "",
        "Entry状態:",
        es.get("status_label", es["status"]),
        f"条件成立: {es.get('signal_date') or '—'}",
        f"Entry: {es.get('entry_date') or '—'}",
        f"Candidate: {es['candidate']}",
        f"Reason: {es['blocking_reason'] or es['status']}",
        "",
        "次の操作:",
        view_model.get("next_action", ""),
        "",
        "Reference:",
        f"Entry Date: {ref.get('entry_date')}",
        f"Entry: {ref.get('entry_price')}",
        f"Current: {ref.get('current_price')}",
        f"P/L: {_pct(ref.get('pnl_pct'))}",
        (
            f"Holding: {es['current_holding_days']} / {es['max_hold_business_days']}営業日"
            if es.get("current_holding_days") is not None and es.get("max_hold_business_days") is not None
            else f"Holding: {ref.get('holding_days')} days"
        ),
        f"High DD: {_pct(ref.get('drawdown_from_high_pct'))}",
    ]
    if risk.get("applicable"):
        lines += [
            "",
            "Risk:",
            f"Risk Stop: {risk.get('stop_price')} (-15%)",
            f"Distance: {_pct(risk.get('distance_pct'))}",
            f"Status: {risk.get('status')}",
        ]

    # section markers for tests / grepping
    lines += [
        "",
        "[Current State]",
        f"  {state_disp} / {cs['regime']}",
        "[Decision Reason]",
        f"  {dr['primary']}",
        "[Capital Flow]",
        f"  {cf['previous_asset']} → {cf['current_asset']} → {cf['next_candidate']}",
        "[Entry Timing]",
        f"  {es['status']} {es['candidate']}",
        "[Position]",
        "  （非保有）" if pos is None else f"  {pos['asset_display']}",
        "[Reference]",
        f"  P/L {_pct(ref.get('pnl_pct'))}",
    ]
    return "\n".join(lines) + "\n"


def _pct(v: Optional[float]) -> str:
    if v is None:
        return "n/a"
    return f"{v * 100:+.2f}%"
