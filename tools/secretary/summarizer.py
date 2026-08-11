"""AI編集秘書 — 要約器。

責務:
    抽出結果から Daily Summary などを生成する。
    抽出・書込み・外部連携は行わない。
"""

from __future__ import annotations

from typing import Any


def summarize(extracted: Any) -> Any:
    """抽出結果から要約（テンプレート構造）を返す予定。

    今回はテンプレート骨格のみ。実生成は実装しない。
    """
    raise NotImplementedError("summarizer.summarize is skeleton-only (Phase1)")


def daily_summary_template() -> dict[str, str]:
    """Daily Summary の空テンプレート。

    今回はキー枠のみ。中身の生成ロジックは持たない。
    """
    return {
        "title": "Daily Summary",
        "date": "",
        "decisions": "",
        "ideas": "",
        "backlog": "",
        "changes": "",
        "notes": "",
    }
