# -*- coding: utf-8 -*-
"""FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0 — Human Display Evidence tests."""

from __future__ import annotations

import ast
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
    evidence_swing_hold_monitor,
    format_fortress_text,
    format_input_failure_message,
    format_trade_result_message,
    map_state_to_fortress,
    map_trade_result_to_fortress,
)
from taxable_account.view.view_model import project_view_model

PKG_VIEW = ROOT / "taxable_account" / "view"


def _names(disc) -> list[str]:
    return [f["name"] for f in disc.embed["fields"]]


def _assert_no_banned(text: str) -> None:
    for tok in BANNED_OPERATOR_TOKENS:
        assert tok not in text, tok
    for bad in ("購入報告", "売却報告", "市場撤退", "ERROR:"):
        assert bad not in text, bad


# --- A. 主表示回帰 ---


def test_main_skeleton_order_and_no_detail_label_when_empty():
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        asset=Asset.NOMURA_WORLD_SEMI,
    )
    d = map_state_to_fortress(st)
    assert d.detail is None
    text = format_fortress_text(d)
    assert text.startswith(HEADER)
    assert "詳細:" not in text
    assert [n for n, _ in d.as_fields()] == list(FORTRESS_FIELD_ORDER)
    disc = project_discord_payload(project_view_model(st), state=st)
    assert _names(disc) == list(FORTRESS_FIELD_ORDER)
    _assert_no_banned(disc.content)


# --- B. Evidence 状態別 ---


def test_growth_hold_and_waiting_no_evidence():
    growth = map_state_to_fortress(
        TaxableAccountState(
            regime_state=RegimeState.GROWTH_ACTIVE,
            held_asset=Asset.NOMURA_WORLD_SEMI,
            alert_on=True,
        )
    )
    assert growth.detail is None
    waiting = map_state_to_fortress(
        TaxableAccountState(
            regime_state=RegimeState.SWING_ACTIVE,
            position_state=PositionState.WAIT,
            held_asset=Asset.CASH,
            asset=Asset.CASH,
            alert_on=True,
        )
    )
    assert waiting.detail is None


def test_swing_hold_peacetime_no_evidence_dashboard():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        entry_date=date(2024, 2, 2),
        entry_price=1000.0,
        max_hold_business_days=20,
        risk_control=arm_stop(1000.0),
        alert_on=True,
    )
    d = map_state_to_fortress(st, as_of=date(2024, 2, 12), include_hold_evidence=False)
    assert d.detail is None
    disc = project_discord_payload(
        project_view_model(st, as_of=date(2024, 2, 12)),
        state=st,
    )
    assert "詳細" not in _names(disc)


def test_swing_hold_1570_monitor_evidence_risk_then_time():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        entry_date=date(2024, 2, 2),
        entry_price=1000.0,
        max_hold_business_days=20,
        risk_control=arm_stop(1000.0),
        alert_on=True,
    )
    detail = evidence_swing_hold_monitor(st, as_of=date(2024, 2, 12))
    assert detail is not None
    lines = detail.splitlines()
    assert lines[0].startswith("Risk Stop:")
    assert "Time Exit:" in detail
    assert "850" in detail or "850.0" in detail or "850" in lines[0]
    d = map_state_to_fortress(st, as_of=date(2024, 2, 12), include_hold_evidence=True)
    assert d.detail == detail
    _assert_no_banned(format_fortress_text(d))


def test_swing_hold_282a_time_exit_only():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.SEMI_282A,
        asset=Asset.SEMI_282A,
        entry_date=date(2024, 6, 3),
        entry_price=200.0,
        max_hold_business_days=15,
        alert_on=True,
        signals=MarketSignals(semi_signal=True),
        selection_reason=SelectionReason.SEMI_SIGNAL,
    )
    detail = evidence_swing_hold_monitor(st, as_of=date(2024, 6, 10))
    assert detail is not None
    assert detail.startswith("Time Exit:")
    assert "Risk Stop" not in detail
    assert "P/L" not in detail


def test_entry_ready_evidence_three_plus_alert():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.NIKKEI_LEV_1570,
        held_asset=Asset.CASH,
        signal_date=date(2026, 8, 7),
        selection_reason=SelectionReason.CRASH_15,
        alert_on=True,
        signals=MarketSignals(dd15_ma200=True, crash_15=True),
    )
    d = map_state_to_fortress(st)
    assert d.detail is not None
    assert "投入局面: 暴落反発" in d.detail
    assert "投入状態: 未保有・投入待ち" in d.detail
    assert "条件成立日: 2026年8月7日" in d.detail
    assert "警戒局面: 継続" in d.detail
    text = format_fortress_text(d)
    assert "詳細:" in text
    _assert_no_banned(text)
    disc = project_discord_payload(project_view_model(st), state=st)
    assert _names(disc) == list(FORTRESS_FIELD_ORDER) + ["詳細"]


def test_entry_ready_omits_signal_date_when_missing():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.ENTRY_READY,
        asset=Asset.SEMI_282A,
        held_asset=Asset.CASH,
        signal_date=None,
        alert_on=False,
        signals=MarketSignals(semi_signal=True),
        selection_reason=SelectionReason.SEMI_SIGNAL,
    )
    d = map_state_to_fortress(st)
    assert "投入局面: 半導体Swing" in (d.detail or "")
    assert "条件成立日" not in (d.detail or "")
    assert "警戒局面" not in (d.detail or "")


def test_recovery_ready_evidence_only_met():
    ready = map_state_to_fortress(
        TaxableAccountState(
            regime_state=RegimeState.REENTRY_PENDING,
            held_asset=Asset.CASH,
            signals=MarketSignals(recovery_model_b_met=True, recovery_b_days=20),
        )
    )
    assert ready.detail == "復帰条件: 成立"
    pending = map_state_to_fortress(
        TaxableAccountState(
            regime_state=RegimeState.REENTRY_PENDING,
            held_asset=Asset.CASH,
            signals=MarketSignals(recovery_model_b_met=False, recovery_b_days=8),
        )
    )
    assert pending.judgment == "警戒監視"
    assert pending.detail is None


def test_sell_ready_target_asset():
    st = TaxableAccountState(
        regime_state=RegimeState.EXIT_PENDING,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        alert_on=True,
    )
    d = map_state_to_fortress(st)
    assert d.command == "世界半導体株投資売却"
    assert d.detail == "対象銘柄: 世界半導体株投資"
    swing = map_state_to_fortress(
        TaxableAccountState(
            regime_state=RegimeState.SWING_ACTIVE,
            position_state=PositionState.EXIT,
            held_asset=Asset.NIKKEI_LEV_1570,
            asset=Asset.NIKKEI_LEV_1570,
            alert_on=True,
        )
    )
    assert swing.command == "1570売却"
    assert swing.detail == "対象銘柄: 1570"


def test_trade_result_evidence_and_reject():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        alert_on=True,
    )
    fact = TradeFact(
        report_id="r1",
        asset=Asset.NIKKEI_LEV_1570,
        side=TradeSide.BUY,
        trade_date=date(2026, 8, 7),
        trade_price=1000.0,
        reported_at=datetime(2026, 8, 7, tzinfo=timezone.utc),
        source="DISCORD",
        confirm_flag=True,
        validation_result="ACCEPTED",
        quantity=10.0,
    )
    ok = map_trade_result_to_fortress(
        accepted=True, fact=fact, state=st, include_trade_evidence=True
    )
    assert ok.detail is not None
    assert "約定日: 2026年8月7日" in ok.detail
    assert "約定価格: 1000" in ok.detail
    assert "数量: 10" in ok.detail
    msg = format_trade_result_message(
        accepted=True, fact=fact, events=("ENTRY_FILLED",), error=None, state=st
    )
    assert "ENTRY_FILLED" not in msg
    assert "詳細:" in msg
    reject = map_trade_result_to_fortress(
        accepted=False, fact=fact, state=st, error="already_position_active"
    )
    assert "現在保有: 1570" in (reject.detail or "")
    assert "already_position_active" not in (reject.detail or "")
    _assert_no_banned(format_fortress_text(reject))


def test_error_evidence_human():
    st = TaxableAccountState(regime_state=RegimeState.GROWTH_ACTIVE)
    msg = format_input_failure_message(st, exc=ValueError("discord_operator_not_authorized"))
    assert "詳細:" in msg
    assert "ERROR:" not in msg
    assert "discord_operator_not_authorized" not in msg
    _assert_no_banned(msg)


# --- C / D. Token + no new sensor acquisition ---


def test_human_display_module_has_no_new_market_sensors():
    src = (PKG_VIEW / "human_display.py").read_text(encoding="utf-8")
    for banned in ("SOX DD", "RSI14", "MA200", "compute_crash", "select_asset"):
        assert banned not in src
    tree = ast.parse(src)
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module:
            imports.append(node.module)
    assert not any("detection" in m or "sensor" in m for m in imports)


def test_discord_adapter_does_not_enable_hold_evidence_by_default():
    src = (PKG_VIEW / "discord_adapter.py").read_text(encoding="utf-8")
    assert "include_hold_evidence=False" in src
