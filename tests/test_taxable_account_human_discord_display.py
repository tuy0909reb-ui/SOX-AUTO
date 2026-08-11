# -*- coding: utf-8 -*-
"""FORTRESS Taxable Human Display — Discord HI layer tests."""

from __future__ import annotations

import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.domain.models import MarketSignals, TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState, SelectionReason
from taxable_account.position.risk_control import arm_stop
from taxable_account.trade.facts import TradeFact, TradeSide
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.human_display import (
    BANNED_OPERATOR_TOKENS,
    FORTRESS_FIELD_ORDER,
    HEADER,
    contains_banned_token,
    format_trade_draft_preview,
    format_trade_result_message,
    map_error_to_fortress,
    map_state_to_fortress,
    next_operation,
    outcome_from_events,
)
from taxable_account.view.view_model import project_view_model


def _field_map(disc) -> dict[str, str]:
    return {f["name"]: f["value"] for f in disc.embed["fields"]}


def _assert_skeleton(disc) -> None:
    names = [f["name"] for f in disc.embed["fields"] if f["name"] != "詳細"]
    assert names == list(FORTRESS_FIELD_ORDER)
    assert disc.embed["title"] == HEADER
    assert disc.content.startswith(HEADER)
    blob = disc.content + "".join(f["name"] + f["value"] for f in disc.embed["fields"])
    for tok in BANNED_OPERATOR_TOKENS:
        assert tok not in blob, tok


def _assert_hi_readable(fm: dict[str, str]) -> None:
    """Human Interface Test: 5-second criteria (structure)."""
    assert fm["命令"]
    assert fm["司令判断"]
    assert fm["作戦理由"]
    assert fm["戦力状況"]


# --- Functional + HI mapping ---


def test_growth_hold():
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
        alert_on=False,
    )
    d = map_state_to_fortress(st)
    assert d.command == "待機（介入不要）"
    assert d.judgment == "防衛維持"
    assert d.reason == "成長方針を継続"
    assert d.force == "世界半導体株投資"
    disc = project_discord_payload(project_view_model(st), state=st)
    _assert_skeleton(disc)
    fm = _field_map(disc)
    assert fm["命令"] == "待機（介入不要）"
    assert fm["司令判断"] == "防衛維持"
    _assert_hi_readable(fm)


def test_swing_hold():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
        selection_reason=SelectionReason.CRASH_15,
        risk_control=arm_stop(1000.0),
    )
    d = map_state_to_fortress(st)
    assert d.command == "待機（介入不要）"
    assert d.judgment == "前線維持"
    assert d.reason == "Exit条件監視中"
    assert d.force == "1570"
    disc = project_discord_payload(project_view_model(st), state=st)
    _assert_skeleton(disc)
    _assert_hi_readable(_field_map(disc))


def test_wait():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.WAIT,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True),
    )
    d = map_state_to_fortress(st)
    assert d.command == "待機（条件確認）"
    assert d.judgment == "警戒監視"
    assert d.reason == "投入条件待ち"
    assert d.force == "予備戦力（現金）"


def test_buy_ready():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.CRASH_15,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
    )
    d = map_state_to_fortress(st)
    assert d.command == "1570購入"
    assert d.judgment == "出撃準備"
    assert d.reason == "投入条件成立"
    assert d.force == "予備戦力（現金）"
    disc = project_discord_payload(project_view_model(st), state=st)
    _assert_skeleton(disc)
    assert _field_map(disc)["命令"] == "1570購入"
    assert "CASH" not in disc.content


def test_reentry_pending_ready():
    st = TaxableAccountState(
        regime_state=RegimeState.REENTRY_PENDING,
        position_state=PositionState.WAIT,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        alert_on=False,
        signals=MarketSignals(recovery_model_b_met=True, recovery_b_days=20),
    )
    d = map_state_to_fortress(st)
    assert d.command == "世界半導体株投資 購入"
    assert d.judgment == "帰投準備"
    assert d.reason == "復帰条件成立"
    assert d.force == "予備戦力（現金）"


def test_reentry_pending_waiting():
    st = TaxableAccountState(
        regime_state=RegimeState.REENTRY_PENDING,
        position_state=PositionState.WAIT,
        asset=Asset.CASH,
        held_asset=Asset.CASH,
        alert_on=False,
        signals=MarketSignals(recovery_model_b_met=False, recovery_b_days=8),
    )
    d = map_state_to_fortress(st)
    assert d.command == "待機（条件確認）"
    assert d.judgment == "警戒監視"


def test_sell_ready_growth():
    st = TaxableAccountState(
        regime_state=RegimeState.EXIT_PENDING,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
        alert_on=True,
    )
    d = map_state_to_fortress(st)
    assert d.command == "世界半導体株投資売却"
    assert d.judgment == "撤退準備"
    assert d.reason == "運用局面変更"
    assert d.force == "予備戦力（現金）"


def test_sell_ready_swing():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.EXIT,
        held_asset=Asset.SEMI_282A,
        asset=Asset.SEMI_282A,
        alert_on=True,
    )
    d = map_state_to_fortress(st)
    assert d.command == "282A売却"
    assert d.judgment == "撤退準備"
    assert d.reason == "運用局面変更"
    assert d.force == "予備戦力（現金）"


def _fact(side: TradeSide, asset: Asset = Asset.NIKKEI_LEV_1570) -> TradeFact:
    return TradeFact(
        report_id="r1",
        asset=asset,
        side=side,
        trade_date=date(2024, 3, 5),
        trade_price=1000.0,
        reported_at=datetime(2024, 3, 5, tzinfo=timezone.utc),
        source="DISCORD",
        confirm_flag=True,
        validation_result="ACCEPTED",
        quantity=10.0,
    )


def test_buy_accept():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        alert_on=True,
    )
    msg = format_trade_result_message(
        accepted=True,
        fact=_fact(TradeSide.BUY),
        events=("ENTRY_FILLED",),
        error=None,
        state=st,
    )
    assert HEADER in msg
    assert "買い反映完了" in msg
    assert "保有開始" in msg
    assert "ENTRY_FILLED" not in msg
    assert not contains_banned_token(msg)


def test_sell_accept():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.WAIT,
        held_asset=Asset.CASH,
        asset=Asset.CASH,
        alert_on=True,
    )
    msg = format_trade_result_message(
        accepted=True,
        fact=_fact(TradeSide.SELL),
        events=("EXIT_FILLED",),
        error=None,
        state=st,
    )
    assert "売り反映完了" in msg
    assert "保有終了" in msg
    assert "EXIT_FILLED" not in msg
    assert "予備戦力（現金）" in msg


def test_buy_reject():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        alert_on=True,
    )
    msg = format_trade_result_message(
        accepted=False,
        fact=_fact(TradeSide.BUY),
        events=(),
        error="already_position_active",
        state=st,
    )
    assert "報告不受理" in msg
    assert "待機（再確認）" in msg
    assert "現在状態と不一致" in msg
    assert "1570" in msg
    assert "already_position_active" not in msg
    assert "ENTRY_FILLED" not in msg


def test_sell_reject():
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
        alert_on=False,
    )
    msg = format_trade_result_message(
        accepted=False,
        fact=_fact(TradeSide.SELL, Asset.NOMURA_WORLD_SEMI),
        events=(),
        error="growth_sell_requires_exit_pending",
        state=st,
    )
    assert "報告不受理" in msg
    assert "世界半導体株投資" in msg
    assert "BUY" not in msg and "SELL" not in msg


def test_error_display():
    st = TaxableAccountState(regime_state=RegimeState.GROWTH_ACTIVE, alert_on=False)
    d = map_error_to_fortress(st, message="webhook timeout")
    assert d.command == "待機（再確認）"
    assert d.judgment == "要確認"
    assert d.detail == "webhook timeout"
    disc = project_discord_payload(project_view_model(st), state=st, error_message="webhook timeout")
    names = [f["name"] for f in disc.embed["fields"]]
    assert names[:4] == list(FORTRESS_FIELD_ORDER)
    assert "詳細" in names
    assert "webhook timeout" in _field_map(disc)["詳細"]


def test_discord_fallback_without_state():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.CASH,
        selection_reason=SelectionReason.CRASH_15,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
    )
    disc = project_discord_payload(project_view_model(st))
    _assert_skeleton(disc)
    assert "出撃準備" in _field_map(disc)["司令判断"]


def test_draft_preview_japanese():
    text = format_trade_draft_preview(
        side=TradeSide.SELL,
        asset=Asset.NOMURA_WORLD_SEMI,
        trade_date="20240102",
        trade_price=100.0,
        quantity=1.0,
        report_id="abc",
        held_asset=Asset.NOMURA_WORLD_SEMI,
    )
    assert HEADER in text
    assert "売却対象:" in text
    assert "現在保有:" in text
    assert "世界半導体株投資" in text
    assert "約定内容:" in text
    assert "価格: 100" in text
    assert "日付: 2024年1月2日" in text
    assert "数量: 1" in text
    assert "確認する" in text
    assert "Confirm" not in text
    assert not contains_banned_token(text)


def test_draft_preview_buy_contrasts_target_and_holdings():
    text = format_trade_draft_preview(
        side=TradeSide.BUY,
        asset=Asset.NIKKEI_LEV_1570,
        trade_date="20260807",
        trade_price=1000.0,
        quantity=10.0,
        report_id="b1",
        held_asset=Asset.CASH,
    )
    assert "購入対象:" in text
    assert "1570" in text
    assert "現在保有:" in text
    assert "予備戦力（現金）" in text
    assert "CASH" not in text


def test_input_error_and_cancel_fortress():
    from taxable_account.view.human_display import (
        format_cancel_message,
        format_input_failure_message,
    )

    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
    )
    err = format_input_failure_message(st, exc=ValueError("discord_operator_not_authorized"))
    assert HEADER in err
    assert "報告処理停止" in err
    assert "待機（再確認）" in err
    assert "discord_operator_not_authorized" not in err
    cancel = format_cancel_message(st)
    assert "報告取消" in cancel
    assert "待機（介入不要）" in cancel


def test_outcome_from_events_human():
    assert outcome_from_events(("ENTRY_FILLED",)) == "買い反映完了"
    assert contains_banned_token("ENTRY_FILLED")
    assert not contains_banned_token(outcome_from_events(("ENTRY_FILLED",)))


def test_view_model_next_action_is_command():
    st = TaxableAccountState(regime_state=RegimeState.GROWTH_ACTIVE, alert_on=False)
    vm = project_view_model(st)
    assert vm["next_action"] == "待機（介入不要）"
    assert next_operation(st) == "待機（介入不要）"
    assert "dd15_ma200" not in vm["next_action"]


def test_reject_jp_no_buy_sell_english():
    from taxable_account.view.human_display import _REJECT_JP

    for code, msg in _REJECT_JP.items():
        assert "BUY" not in msg and "SELL" not in msg, (code, msg)
