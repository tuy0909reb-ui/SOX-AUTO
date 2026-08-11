"""AI編集秘書 — Writer（Phase3-1：Writer統合）。

仕様: docs/specs/writer_phase3_1.md

公開インターフェース:
    Writer.write(result: ExtractResult) -> WriterOutput

行わないこと:
    Rule判定・分類・AI利用・要約・加工・Markdown生成・
    ファイル出力・Document更新・Output接続・外部連携
"""

from __future__ import annotations

from .models.extract_result import ExtractResult
from .models.writer_output import WriterOutput


class Writer:
    """ExtractResult を WriterOutput へ対応付ける統合処理のみを担当する。"""

    def write(self, result: ExtractResult) -> WriterOutput:
        """ExtractResult の各フィールドを未加工のまま WriterOutput へ格納する。"""
        if result is None:
            raise ValueError("Writer.write contract violated: result is None")
        if not isinstance(result, ExtractResult):
            raise ValueError("Writer.write contract violated: result is not ExtractResult")

        return WriterOutput(
            decisions=result.decisions,
            ideas=result.ideas,
            backlogs=result.backlogs,
            changes=result.changes,
        )
