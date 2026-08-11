"""AI編集秘書 — Output（Phase3-2：Output接続）。

仕様: docs/specs/output_phase3_2.md

公開インターフェース:
    Output.render(writer_output: WriterOutput) -> str

行わないこと:
    Rule判定・分類・AI利用・要約・加工・
    Document生成・ファイル出力・保存処理・外部連携
"""

from __future__ import annotations

from .models.writer_output import WriterOutput


class Output:
    """WriterOutput を Markdown 文字列へ整形する接続処理のみを担当する。"""

    def render(self, writer_output: WriterOutput) -> str:
        """WriterOutput の各フィールドを Markdown テンプレートへ対応付けて返す。"""
        if writer_output is None:
            raise ValueError("Output.render contract violated: writer_output is None")
        if not isinstance(writer_output, WriterOutput):
            raise ValueError(
                "Output.render contract violated: writer_output is not WriterOutput"
            )

        sections = [
            self._section("Decisions", writer_output.decisions),
            self._section("Ideas", writer_output.ideas),
            self._section("Backlogs", writer_output.backlogs),
            self._section("Changes", writer_output.changes),
        ]
        return "\n\n".join(sections) + "\n"

    def _section(self, title: str, items: list) -> str:
        lines = [f"# {title}"]
        for item in items:
            lines.append(f"- {item.content}")
        return "\n".join(lines)
