"""AI編集秘書 — 更新データ生成。

責務:
    更新対象データを生成する（Decision Log / Change Log / Backlog /
    Cursor Task など）。
    実際のファイル書込みは writer の責務。外部API呼び出しは行わない。
"""

from __future__ import annotations

from typing import Any


def build_updates(extracted: Any, summary: Any = None) -> Any:
    """更新対象データの構造を組み立てる予定。

    今回は生成処理なし（骨格のみ）。
    """
    raise NotImplementedError("updater.build_updates is skeleton-only (Phase1)")
