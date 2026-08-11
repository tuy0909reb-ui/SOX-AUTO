"""FORTRESS Taxable — Human Display Mapping + Evidence Layer (View / Discord only).

Authority:
- docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md
- docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0.md

Maps Internal State → 作戦表示 (+ optional 詳細). Does NOT decide regime / selection / fills.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, Optional, Union

from taxable_account.domain.models import TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus
from taxable_account.position.hold_days import business_hold_days
from taxable_account.trade.facts import TradeFact, TradeSide

HEADER = "【大要塞｜特定口座】"

FORTRESS_FIELD_ORDER = ("命令", "司令判断", "作戦理由", "戦力状況")

BANNED_OPERATOR_TOKENS = (
    "dd15_ma200",
    "crash_15",
    "semi_signal",
    "Model B",
    "ENTRY_FILLED",
    "EXIT_FILLED",
    "DELAYED_FILL_RECOVERY",
    "ABNORMAL_EXIT",
    "TRANSFER_COMPLETE",
    "RECOVERY_COMPLETE",
    "GROWTH_ACTIVE",
    "SWING_ACTIVE",
    "EXIT_PENDING",
    "REENTRY_PENDING",
    "POSITION_ACTIVE",
    "CASH",
    "VERIFY",
    "Confirm",
    "ERROR:",
)

_REJECT_JP = {
    "confirm_flag_required": "確認操作が必要です",
    "quantity_required": "数量の入力が必要です",
    "already_position_active": "すでに保有中のため買い報告できません",
    "growth_regime_buy_forbidden": "Growth運用中のためSwingの買い報告はできません",
    "sell_state_mismatch": "現在の状態では売り報告できません",
    "sell_asset_mismatch": "売り報告の対象が保有資産と一致しません",
    "asset_not_registered": "未登録の資産です",
    "growth_already_active": "すでにGrowth保有中です",
    "growth_sell_requires_exit_pending": "Growthの売り報告は移管待ちのときのみ可能です",
    "no_valid_buy_route": "現在買い報告できる経路がありません",
    "no_valid_sell_route": "現在売り報告できる経路がありません",
}


@dataclass(frozen=True)
class FortressDisplay:
    """Peacetime Human Display (4 fields). Optional detail for anomaly only."""

    command: str
    judgment: str
    reason: str
    force: str
    detail: Optional[str] = None

    def as_fields(self) -> list[tuple[str, str]]:
        fields = [
            ("命令", self.command),
            ("司令判断", self.judgment),
            ("作戦理由", self.reason),
            ("戦力状況", self.force),
        ]
        if self.detail:
            fields.append(("詳細", self.detail))
        return fields


def asset_short(asset: Asset) -> str:
    if asset == Asset.NOMURA_WORLD_SEMI:
        return "世界半導体株投資"
    if asset == Asset.NIKKEI_LEV_1570:
        return "1570"
    if asset == Asset.SEMI_282A:
        return "282A"
    if asset == Asset.CASH:
        return "予備戦力（現金）"
    return asset.value


def force_status(state: TaxableAccountState) -> str:
    """戦力状況 — holdings / cash reserve (Human labels only)."""
    if state.held_asset == Asset.NOMURA_WORLD_SEMI:
        return "世界半導体株投資"
    if state.held_asset == Asset.NIKKEI_LEV_1570:
        return "1570"
    if state.held_asset == Asset.SEMI_282A:
        return "282A"
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return "世界半導体株投資"
    return "予備戦力（現金）"


def _target_asset_label(state: TaxableAccountState) -> str:
    """Label for buy/sell report target (not always held_asset)."""
    if state.regime_state == RegimeState.EXIT_PENDING:
        return "世界半導体株投資"
    if state.regime_state == RegimeState.REENTRY_PENDING:
        return "世界半導体株投資"
    if state.position_state == PositionState.EXIT:
        return asset_short(state.held_asset) if state.held_asset != Asset.CASH else asset_short(state.asset)
    if state.position_state == PositionState.ENTRY_READY:
        return asset_short(state.asset)
    if state.held_asset != Asset.CASH:
        return asset_short(state.held_asset)
    return asset_short(state.asset)


def _join_evidence(lines: list[str]) -> Optional[str]:
    cleaned = [ln.strip() for ln in lines if ln and str(ln).strip()]
    return "\n".join(cleaned) if cleaned else None


def _entry_phase_human(state: TaxableAccountState) -> str:
    if state.asset == Asset.NIKKEI_LEV_1570 or state.signals.crash_15:
        return "暴落反発"
    if state.asset == Asset.SEMI_282A or state.signals.semi_signal:
        return "半導体Swing"
    return "投入局面"


def evidence_entry_ready(state: TaxableAccountState) -> str:
    """Evidence-1.0 §3.3 — required for Entry Ready."""
    lines = [
        f"投入局面: {_entry_phase_human(state)}",
        "投入状態: 未保有・投入待ち",
    ]
    if state.signal_date is not None:
        lines.append(f"条件成立日: {format_trade_date_human(state.signal_date)}")
    if state.alert_on:
        lines.append("警戒局面: 継続")
    return "\n".join(lines)


def evidence_sell_ready(state: TaxableAccountState) -> str:
    return f"対象銘柄: {_target_asset_label(state)}"


def evidence_recovery_ready() -> str:
    return "復帰条件: 成立"


def evidence_reject(state: TaxableAccountState, error: Optional[str]) -> str:
    return _join_evidence(
        [
            reject_detail_jp(error),
            f"現在保有: {force_status(state)}",
        ]
    ) or reject_detail_jp(error)


def evidence_trade_result(fact: TradeFact) -> str:
    return "\n".join(
        [
            f"約定日: {format_trade_date_human(fact.trade_date)}",
            f"約定価格: {fact.trade_price}",
            f"数量: {fact.quantity}",
        ]
    )


def evidence_swing_hold_monitor(
    state: TaxableAccountState,
    *,
    as_of: Optional[date] = None,
) -> Optional[str]:
    """必要時のみ。平時ダッシュボードでは呼ばない（Evidence-1.0 §3.2）。

    1570: Risk Stop 第一、Time Exit 第二（最大2行）。
    282A: Time Exit のみ。
    """
    if state.position_state != PositionState.POSITION_ACTIVE:
        return None
    lines: list[str] = []
    if state.held_asset == Asset.NIKKEI_LEV_1570:
        rc = state.risk_control
        if (
            rc.enabled
            and rc.stop_price is not None
            and rc.status in (RiskStatus.ACTIVE, RiskStatus.TRIGGERED)
        ):
            stop = rc.stop_price
            stop_s = f"{stop:g}" if isinstance(stop, float) else str(stop)
            lines.append(f"Risk Stop: {stop_s}（-15%）")
        if state.max_hold_business_days is not None:
            if state.entry_date is not None and as_of is not None:
                cur = business_hold_days(state.entry_date, as_of)
                lines.append(
                    f"Time Exit: 保有日数 {cur} / {state.max_hold_business_days}"
                )
            else:
                lines.append(f"Time Exit: 上限 {state.max_hold_business_days}営業日")
        return _join_evidence(lines[:2])
    if state.held_asset == Asset.SEMI_282A:
        if state.max_hold_business_days is None:
            return None
        if state.entry_date is not None and as_of is not None:
            cur = business_hold_days(state.entry_date, as_of)
            return f"Time Exit: 保有日数 {cur} / {state.max_hold_business_days}"
        return f"Time Exit: 上限 {state.max_hold_business_days}営業日"
    return None


def map_state_to_fortress(
    state: TaxableAccountState,
    *,
    as_of: Optional[date] = None,
    include_hold_evidence: bool = False,
) -> FortressDisplay:
    """Internal State → FORTRESS作戦表示 + Evidence-1.0 detail（必要な状態のみ）。"""
    # Entry Ready
    if state.position_state == PositionState.ENTRY_READY:
        target = _target_asset_label(state)
        return FortressDisplay(
            command=f"{target}購入",
            judgment="出撃準備",
            reason="投入条件成立",
            force="予備戦力（現金）",
            detail=evidence_entry_ready(state),
        )

    # Sell Ready — Swing Exit / Risk Triggered
    if state.risk_control.status == RiskStatus.TRIGGERED or state.position_state == PositionState.EXIT:
        target = _target_asset_label(state)
        return FortressDisplay(
            command=f"{target}売却",
            judgment="撤退準備",
            reason="運用局面変更",
            force="予備戦力（現金）",
            detail=evidence_sell_ready(state),
        )

    # Sell Ready — Growth transfer
    if state.regime_state == RegimeState.EXIT_PENDING:
        return FortressDisplay(
            command="世界半導体株投資売却",
            judgment="撤退準備",
            reason="運用局面変更",
            force="予備戦力（現金）",
            detail="対象銘柄: 世界半導体株投資",
        )

    # Growth Recovery (conditions met only)
    if state.regime_state == RegimeState.REENTRY_PENDING and state.signals.recovery_model_b_met:
        return FortressDisplay(
            command="世界半導体株投資 購入",
            judgment="帰投準備",
            reason="復帰条件成立",
            force="予備戦力（現金）",
            detail=evidence_recovery_ready(),
        )

    # Swing HOLD — peacetime detail none; optional monitor evidence
    if state.position_state == PositionState.POSITION_ACTIVE:
        detail = None
        if include_hold_evidence:
            detail = evidence_swing_hold_monitor(state, as_of=as_of)
        return FortressDisplay(
            command="待機（介入不要）",
            judgment="前線維持",
            reason="Exit条件監視中",
            force=force_status(state),
            detail=detail,
        )

    # Growth HOLD / Maintain — Evidence none
    if state.regime_state == RegimeState.GROWTH_ACTIVE:
        return FortressDisplay(
            command="待機（介入不要）",
            judgment="防衛維持",
            reason="成長方針を継続",
            force="世界半導体株投資",
        )

    # Waiting — Evidence none
    reason = "投入条件待ち"
    if state.position_state == PositionState.REENTRY_WAIT:
        reason = "Exit後の再評価"
    return FortressDisplay(
        command="待機（条件確認）",
        judgment="警戒監視",
        reason=reason,
        force="予備戦力（現金）",
    )


def map_trade_result_to_fortress(
    *,
    accepted: bool,
    fact: TradeFact,
    state: TaxableAccountState,
    error: Optional[str] = None,
    include_trade_evidence: bool = False,
) -> FortressDisplay:
    """BUY/SELL result → same 4-field skeleton. Internal event names never shown."""
    if not accepted:
        return FortressDisplay(
            command="待機（再確認）",
            judgment="報告不受理",
            reason="現在状態と不一致",
            force=force_status(state),
            detail=evidence_reject(state, error),
        )

    detail = evidence_trade_result(fact) if include_trade_evidence else None
    if fact.side == TradeSide.BUY:
        return FortressDisplay(
            command="待機（介入不要）",
            judgment="買い反映完了",
            reason="保有開始",
            force=force_status(state),
            detail=detail,
        )

    return FortressDisplay(
        command="待機（介入不要）",
        judgment="売り反映完了",
        reason="保有終了",
        force=force_status(state),
        detail=detail,
    )


def map_error_to_fortress(
    state: Optional[TaxableAccountState] = None,
    *,
    message: str = "運用表示の確認が必要です",
) -> FortressDisplay:
    force = force_status(state) if state is not None else "現在状態を確認"
    return FortressDisplay(
        command="待機（再確認）",
        judgment="要確認",
        reason="表示異常",
        force=force,
        detail=message,
    )


def map_view_model_to_fortress(view_model: dict[str, Any]) -> FortressDisplay:
    """Fallback when TaxableAccountState is unavailable.

    Prefers ViewModel next_action (already mapped from State via next_operation)
    so Runtime can call project_discord_payload(vm) without Logic changes.
    """
    cs = view_model.get("current_state") or {}
    decision = cs.get("decision") or ""
    regime = cs.get("regime") or ""
    pos = cs.get("position_state") or ""
    asset_name = ((cs.get("asset") or {}).get("display_name")) or ""
    asset_name = str(asset_name).replace("野村世界半導体株投資", "世界半導体株投資")
    if asset_name == "CASH":
        asset_name = "予備戦力（現金）"
    na = str(view_model.get("next_action") or "")

    def _vm_entry_evidence() -> str:
        es = view_model.get("entry_status") or {}
        et = view_model.get("entry_timing") or {}
        blob = str(et.get("reason") or es.get("blocking_reason") or "") + str(
            es.get("candidate") or asset_name
        )
        if "暴落" in blob or "1570" in blob:
            phase = "暴落反発"
        elif "半導体" in blob or "282A" in blob:
            phase = "半導体Swing"
        else:
            phase = "投入局面"
        lines = [f"投入局面: {phase}", "投入状態: 未保有・投入待ち"]
        sd = es.get("signal_date")
        if sd:
            lines.append(f"条件成立日: {format_trade_date_human(str(sd))}")
        return "\n".join(lines)

    # Commands already produced by map_state_to_fortress via ViewModel
    if na in ("世界半導体株投資 購入", "世界半導体株投資 購入報告"):
        return FortressDisplay(
            command="世界半導体株投資 購入",
            judgment="帰投準備",
            reason="復帰条件成立",
            force="予備戦力（現金）",
            detail=evidence_recovery_ready(),
        )
    if (na.endswith("購入") or na.endswith("購入報告")) and not na.startswith("待機"):
        cmd = na[: -len("報告")] if na.endswith("購入報告") else na
        return FortressDisplay(
            command=cmd,
            judgment="出撃準備",
            reason="投入条件成立",
            force="予備戦力（現金）",
            detail=_vm_entry_evidence(),
        )
    if na.endswith("売却") or na.endswith("売却報告"):
        cmd = na[: -len("報告")] if na.endswith("売却報告") else na
        target = cmd[: -len("売却")] if cmd.endswith("売却") else (asset_name or "対象銘柄")
        return FortressDisplay(
            command=cmd,
            judgment="撤退準備",
            reason="運用局面変更",
            force="予備戦力（現金）",
            detail=f"対象銘柄: {target}",
        )
    if na == "待機（介入不要）":
        if decision == "HOLD" or pos in ("POSITION_ACTIVE", "RISK_CONTROL_ACTIVE"):
            force = asset_name if asset_name and asset_name != "予備戦力（現金）" else "保有銘柄"
            return FortressDisplay(
                command=na,
                judgment="前線維持",
                reason="Exit条件監視中",
                force=force,
            )
        return FortressDisplay(
            command=na,
            judgment="防衛維持",
            reason="成長方針を継続",
            force="世界半導体株投資",
        )
    if na == "待機（条件確認）":
        reason = "Exit後の再評価" if decision == "REENTRY_WAIT" or pos == "REENTRY_WAIT" else "投入条件待ち"
        return FortressDisplay(
            command=na,
            judgment="警戒監視",
            reason=reason,
            force="予備戦力（現金）",
        )

    # Decision-key fallback (older / partial ViewModels)
    if decision == "ENTRY_READY" or pos == "ENTRY_READY":
        target = asset_name if asset_name and asset_name != "予備戦力（現金）" else "対象銘柄"
        return FortressDisplay(
            command=f"{target}購入",
            judgment="出撃準備",
            reason="投入条件成立",
            force="予備戦力（現金）",
            detail=_vm_entry_evidence(),
        )
    if decision in ("EXIT", "TRANSFER") or pos == "EXIT" or regime == "EXIT_PENDING":
        target = "世界半導体株投資" if decision == "TRANSFER" or regime == "EXIT_PENDING" else (asset_name or "対象銘柄")
        return FortressDisplay(
            command=f"{target}売却",
            judgment="撤退準備",
            reason="運用局面変更",
            force="予備戦力（現金）",
            detail=f"対象銘柄: {target}",
        )
    if decision == "HOLD" or pos in ("POSITION_ACTIVE", "RISK_CONTROL_ACTIVE"):
        force = asset_name if asset_name and asset_name != "予備戦力（現金）" else "保有銘柄"
        return FortressDisplay(
            command="待機（介入不要）",
            judgment="前線維持",
            reason="Exit条件監視中",
            force=force,
        )
    if decision == "MAINTAIN" or regime == "GROWTH_ACTIVE":
        return FortressDisplay(
            command="待機（介入不要）",
            judgment="防衛維持",
            reason="成長方針を継続",
            force="世界半導体株投資",
        )
    reason = "Exit後の再評価" if decision == "REENTRY_WAIT" or pos == "REENTRY_WAIT" else "投入条件待ち"
    return FortressDisplay(
        command="待機（条件確認）",
        judgment="警戒監視",
        reason=reason,
        force="予備戦力（現金）",
    )


def format_fortress_text(display: FortressDisplay) -> str:
    lines = [
        HEADER,
        "",
        "命令:",
        display.command,
        "",
        "司令判断:",
        display.judgment,
        "",
        "作戦理由:",
        display.reason,
        "",
        "戦力状況:",
        display.force,
    ]
    if display.detail:
        lines.extend(["", "詳細:", display.detail])
    return "\n".join(lines)


def next_operation(state: TaxableAccountState) -> str:
    """ViewModel next_action compatibility — 命令 text only."""
    return map_state_to_fortress(state).command


def reject_detail_jp(code: Optional[str]) -> str:
    if not code:
        return "拒否されました"
    return _REJECT_JP.get(code, "拒否されました")


def reject_jp(code: Optional[str]) -> str:
    return reject_detail_jp(code)


def format_trade_date_human(trade_date: Union[date, str]) -> str:
    """Human date label for preview/result. Accepts date or ISO / YYYYMMDD string."""
    if isinstance(trade_date, date):
        d = trade_date
    else:
        text = str(trade_date).strip()
        if len(text) == 8 and text.isdigit():
            d = date(int(text[:4]), int(text[4:6]), int(text[6:8]))
        else:
            d = date.fromisoformat(text[:10])
    return f"{d.year}年{d.month}月{d.day}日"


def format_trade_draft_preview(
    *,
    side: TradeSide,
    asset: Asset,
    trade_date: str,
    trade_price: float,
    quantity: float,
    report_id: str,
    held_asset: Optional[Asset] = None,
) -> str:
    """Confirm-flow draft (not peacetime dashboard). Japanese operator surface.

    Sell/Buy Preview: 対象と現在保有を対比し、誤報告を防ぐ（Logic非変更）。
    """
    del report_id  # not shown on Human surface
    side_label = "買い" if side == TradeSide.BUY else "売り"
    date_h = format_trade_date_human(trade_date)
    target = asset_short(asset)
    if held_asset is not None:
        held_label = (
            "予備戦力（現金）"
            if held_asset == Asset.CASH
            else asset_short(held_asset)
        )
        force = held_label
    else:
        held_label = None
        force = target
    target_label = "購入対象" if side == TradeSide.BUY else "売却対象"
    detail_lines = [
        f"{target_label}:",
        target,
        "",
        "現在保有:",
        held_label if held_label is not None else "（未取得）",
        "",
        "約定内容:",
        f"価格: {trade_price}",
        f"日付: {date_h}",
        f"数量: {quantity}",
        "",
        "「確認する」で事実として記録します（命令ではありません）。",
    ]
    return (
        f"{HEADER}\n"
        f"\n"
        f"命令:\n"
        f"{'購入の確認' if side == TradeSide.BUY else '売却の確認'}\n"
        f"\n"
        f"司令判断:\n"
        f"確認待ち\n"
        f"\n"
        f"作戦理由:\n"
        f"{side_label} {target} / {date_h} / 数量 {quantity}\n"
        f"\n"
        f"戦力状況:\n"
        f"{force}\n"
        f"\n"
        f"詳細:\n"
        f"{chr(10).join(detail_lines)}"
    )


def map_input_failure_to_fortress(
    state: Optional[TaxableAccountState] = None,
    *,
    reason: str = "入力内容を確認してください",
    detail: Optional[str] = None,
) -> FortressDisplay:
    force = force_status(state) if state is not None else "現在保有を確認"
    return FortressDisplay(
        command="待機（再確認）",
        judgment="報告処理停止",
        reason=reason,
        force=force,
        detail=detail,
    )


def map_cancel_to_fortress(state: Optional[TaxableAccountState] = None) -> FortressDisplay:
    force = force_status(state) if state is not None else "現在保有を確認"
    return FortressDisplay(
        command="待機（介入不要）",
        judgment="報告取消",
        reason="入力を取り消しました",
        force=force,
    )


def format_input_failure_message(
    state: Optional[TaxableAccountState] = None,
    *,
    exc: Optional[BaseException] = None,
    reason: Optional[str] = None,
) -> str:
    """HI error surface — never echo raw exception types / internal codes as primary text."""
    detail = None
    human_reason = reason or "入力内容を確認してください"
    if exc is not None:
        raw = str(exc).strip()
        mapped = {
            "discord_operator_not_authorized": "操作権限がありません",
            "discord_operator_mismatch": "この下書きの操作者ではありません",
            "duplicate_pending_report_id": "同じ報告が処理中です",
            "unknown_or_expired_report_id": "下書きが見つかりません",
            "empty_asset_alias": "銘柄を選択してください",
        }
        if raw in mapped:
            human_reason = mapped[raw]
        elif raw.startswith("unknown_asset_alias") or "alias" in raw.lower():
            human_reason = "銘柄を確認してください"
            detail = "選択肢から銘柄を選んでください"
        elif "trade_date" in raw or "isoformat" in raw.lower() or "invalid" in raw.lower():
            human_reason = "約定日の形式を確認してください"
            detail = "YYYYMMDD または YYYY-MM-DD"
        else:
            # Do not surface raw exception body as 作戦理由
            detail = "入力値を見直して再度お試しください"
    # Evidence-1.0 Error: 詳細は必須（対処可能な短い日本語）
    if detail is None:
        detail = human_reason
    return format_fortress_text(
        map_input_failure_to_fortress(state, reason=human_reason, detail=detail)
    )


def format_cancel_message(state: Optional[TaxableAccountState] = None) -> str:
    return format_fortress_text(map_cancel_to_fortress(state))


def format_trade_result_message(
    *,
    accepted: bool,
    fact: TradeFact,
    events: tuple[str, ...],
    error: Optional[str],
    state: TaxableAccountState,
) -> str:
    del events  # Internal event names must never appear on Human surface
    # Confirm 結果は検証文脈 → 約定 Evidence を付与（内部イベント名は出さない）
    display = map_trade_result_to_fortress(
        accepted=accepted,
        fact=fact,
        state=state,
        error=error,
        include_trade_evidence=bool(accepted),
    )
    return format_fortress_text(display)


def contains_banned_token(text: str) -> bool:
    return any(tok in text for tok in BANNED_OPERATOR_TOKENS)


# --- Legacy helpers kept only where ViewModel / older imports still reference ---

def phase_label(state: TaxableAccountState) -> str:
    """Deprecated for Human surface; returns 司令判断 for compatibility."""
    return map_state_to_fortress(state).judgment


def decision_sentence(state: TaxableAccountState) -> str:
    """Deprecated for Human surface; returns 司令判断."""
    return map_state_to_fortress(state).judgment


def decision_reason_sentence(state: TaxableAccountState) -> str:
    return map_state_to_fortress(state).reason


def position_label(state: TaxableAccountState) -> str:
    return force_status(state)


def outcome_from_events(events: tuple[str, ...] | list[str]) -> str:
    """Never returns internal event names — Human outcome labels only."""
    if not events:
        return "状態に変更はありません"
    if "RECOVERY_COMPLETE" in events or "ENTRY_FILLED" in events or "DELAYED_FILL_RECOVERY" in events:
        return "買い反映完了"
    if "TRANSFER_COMPLETE" in events or "EXIT_FILLED" in events or "ABNORMAL_EXIT" in events:
        return "売り反映完了"
    return "取引報告を反映しました"
