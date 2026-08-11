"""AI編集秘書 — FileWriter（Phase4-1：ローカル保存）。

仕様: docs/specs/file_writer_phase4_1.md

公開インターフェース:
    FileWriter.write(request: OutputRequest, path: Path) -> Path

行わないこと:
    Markdown生成・加工、保存先選択、ファイル名決定、
    外部サービス連携、モデル再解釈、AI / Rule 処理
"""

from __future__ import annotations

from pathlib import Path

from .models.output_request import OutputRequest


class FileWriter:
    """OutputRequest.content をローカルファイルへ保存する処理のみを担当する。"""

    def write(self, request: OutputRequest, path: Path) -> Path:
        """request.content を UTF-8 で path へ保存し、保存した Path を返却する。"""
        if request is None:
            raise ValueError("FileWriter.write contract violated: request is None")
        if not isinstance(request, OutputRequest):
            raise ValueError(
                "FileWriter.write contract violated: request is not OutputRequest"
            )
        if path is None:
            raise ValueError("FileWriter.write contract violated: path is None")

        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(request.content, encoding="utf-8")
        return target
