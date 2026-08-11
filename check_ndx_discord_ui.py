"""Discord frontend v1.1 手動確認観点のオフライン検証。

Live Discord は不要。run/retry/skip・Alert規則・Log・Watch List を確認する。
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ndx_discord_bot import EveningView, MorningView
from ndx_discord_ui import (
    build_alert_embed,
    build_evening_embed,
    build_log_content,
    build_morning_embed,
    build_skip_log_content,
    build_watch_list_embed,
    should_send_alert,
)
from ndx_ops import load_watch_list, project_for_ui, run_for_ui


def _hold_view(phase: str = "am") -> dict:
    return project_for_ui(
        {
            "phase": phase,
            "decision": "HOLD",
            "final_decision": "HOLD",
            "rsi": 63.2,
            "rsi_ok": False,
            "purchase_ratio_pct": 8.4,
            "purchase_ok": True,
            "ndx_drop": -1.8,
            "nq_safe": False,
        }
    )


def _go_view(phase: str = "pm") -> dict:
    return project_for_ui(
        {
            "phase": phase,
            "decision": "GO",
            "final_decision": "GO",
            "rsi": 72.0,
            "rsi_ok": True,
            "purchase_ratio_pct": 3.1,
            "purchase_ok": True,
            "ndx_drop": -2.5,
            "nq_safe": True,
        }
    )


def _candidate_view(phase: str = "am") -> dict:
    return project_for_ui(
        {
            "phase": phase,
            "decision": "GO候補",
            "final_decision": "GO候補",
            "rsi": 71.0,
            "rsi_ok": True,
            "purchase_ratio_pct": 2.5,
            "purchase_ok": True,
            "ndx_drop": None,
            "nq_safe": False,
        }
    )


def check_button_ids() -> None:
    morning = MorningView()
    evening = EveningView()
    morning_ids = {c.custom_id for c in morning.children}
    evening_ids = {c.custom_id for c in evening.children}
    assert morning_ids == {"morning_run", "morning_retry", "morning_skip"}
    assert evening_ids == {"evening_run", "evening_retry", "evening_skip"}
    print("OK button custom_id")


def check_alert_rules() -> None:
    hold = _hold_view()
    go = _go_view()
    cand = _candidate_view()
    assert should_send_alert(hold) is False
    assert should_send_alert(go) is True
    assert should_send_alert(cand) is False
    assert hold["ui_label"] == "Normal"
    assert go["ui_label"] == "SELL"
    assert cand["ui_label"] == "GO候補"
    # Alert embed は SELL 用に構築できる
    alert = build_alert_embed(go)
    assert "SELL" in alert.title
    names = {f.name for f in alert.fields}
    assert {"Protocol", "Target", "判定", "RSI", "52週高値乖離", "含み益", "売却条件"} <= names
    print("OK alert rules (HOLD/候補GO no, GO yes)")


def check_embeds() -> None:
    morning = build_morning_embed(_hold_view("am"))
    evening = build_evening_embed(_go_view("pm"))
    assert morning.title == "📊 Morning Check"
    assert evening.title == "📊 Evening Check"
    m_fields = {f.name: f.value for f in morning.fields}
    e_fields = {f.name: f.value for f in evening.fields}
    assert m_fields["Protocol"] == "NASDAQ100 Sell Protocol"
    assert m_fields["Target"] == "SBI・NASDAQ100"
    assert m_fields["次回"] == "Evening"
    assert e_fields["次回"] == "Morning"
    assert "Normal" in m_fields["判定"]
    assert "SELL" in e_fields["判定"]
    assert "☒ Futures" in m_fields["売却条件"]  # AM fixed unchecked
    assert "☑ Futures" in e_fields["売却条件"]
    print("OK morning/evening embeds")


def check_log() -> None:
    log = build_log_content(_hold_view("am"), phase="am")
    assert "Morning" in log
    assert "HOLD" in log
    assert "RSI" in log
    assert "乖離" in log
    assert "含み益" in log
    assert "次回 Evening" in log
    skip_am = build_skip_log_content(phase="am")
    skip_pm = build_skip_log_content(phase="pm")
    assert skip_am.endswith("Morning Skip") or "Morning Skip" in skip_am
    assert skip_pm.endswith("Evening Skip") or "Evening Skip" in skip_pm
    print("OK log / skip wording")


def check_watch_list() -> None:
    rows = load_watch_list()
    assert rows, "watch_list_v1.md から行を読めない"
    for key in ("id", "name", "role", "status"):
        assert key in rows[0]
    embed = build_watch_list_embed(rows)
    assert embed.title == "Watch List"
    assert "nasdaq100" in (embed.description or "")
    assert "protocol_input" in (embed.description or "")
    print(f"OK watch list ({len(rows)} rows)")


def check_run_for_ui_inactive() -> None:
    """active=False ならプロトコル非実行・状態非更新でスキップ情報。"""
    with patch("ndx_ops.load_config", return_value={"active": False, "completed_at": "2026-01-01"}):
        with patch("ndx_ops.run_phase") as mock_run:
            view = run_for_ui("am")
            mock_run.assert_not_called()
    assert view.get("inactive") is True
    assert view.get("skipped") is True
    assert should_send_alert(view) is False
    print("OK run_for_ui inactive skip (no protocol call)")


def check_run_for_ui_notify_false() -> None:
    """active=True なら run_phase(..., notify=False)。"""
    fake = {
        "phase": "am",
        "decision": "HOLD",
        "final_decision": "HOLD",
        "rsi": 50.0,
        "rsi_ok": False,
        "purchase_ratio_pct": 1.0,
        "purchase_ok": False,
    }
    with patch("ndx_ops.load_config", return_value={"active": True}):
        with patch("ndx_ops.run_phase", return_value=fake) as mock_run:
            view = run_for_ui("am")
            mock_run.assert_called_once()
            kwargs = mock_run.call_args.kwargs
            assert kwargs.get("notify") is False
    assert view["ui_label"] == "Normal"
    assert view["ui_alert"] is False
    print("OK run_for_ui notify=False")


def main() -> None:
    check_button_ids()
    check_alert_rules()
    check_embeds()
    check_log()
    check_watch_list()
    check_run_for_ui_inactive()
    check_run_for_ui_notify_false()
    print("\nAll manual-check criteria PASS")


if __name__ == "__main__":
    main()
