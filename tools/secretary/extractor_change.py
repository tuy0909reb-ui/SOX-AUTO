"""AI編集秘書 — Extractor（Phase2C-6：Change分類）。

仕様: docs/specs/extractor_phase2c6.md

公開インターフェース:
    Extractor.extract_changes(messages) -> list[Change]

行わないこと:
    Decision / Idea / Backlog 分類、role 更新、
    AIMessage / ParsedDocument / content / metadata の変更、
    AI利用、Markdown解析、要約
"""

from __future__ import annotations

import uuid

from .models.ai_message import AIMessage
from .models.change import Change

# Rule0: 明示ラベル（最優先）
_RULE0_LABELS = (
    "変更:",
    "Change:",
    "更新:",
    "修正内容:",
)

# Rule1: 変更表現
_RULE1_EXPRESSIONS = (
    "修正する",
    "変更する",
    "更新する",
    "差し替える",
    "書き換える",
    "入れ替える",
    "改訂する",
    "調整する",
)

# Rule2: 除外語句（veto）
_RULE2_EXCLUSIONS = (
    "案",
    "候補",
    "可能性",
    "検討",
    "予定",
    "アイデア",
)


class Extractor:
    """Phase2C-6: Change 分類のみを担当する。"""

    def extract_changes(self, messages: list[AIMessage]) -> list[Change]:
        """list[AIMessage] から Change を Rule Engine で分類して返す。

        AIMessage は変更しない。
        """
        self._require_messages(messages)

        changes: list[Change] = []
        for message in messages:
            if self._is_change(message.content):
                changes.append(self._to_change(message))
        return changes

    def _require_messages(self, messages: list[AIMessage]) -> None:
        if messages is None:
            raise ValueError("extract_changes contract violated: messages is None")
        if not isinstance(messages, list):
            raise ValueError("extract_changes contract violated: messages is not a list")
        for index, message in enumerate(messages):
            if message is None:
                raise ValueError(
                    f"extract_changes contract violated: messages[{index}] is None"
                )
            if not isinstance(message, AIMessage):
                raise ValueError(
                    f"extract_changes contract violated: "
                    f"messages[{index}] is not AIMessage"
                )
            if message.content is None:
                raise ValueError(
                    f"extract_changes contract violated: "
                    f"messages[{index}].content is None"
                )

    def _is_change(self, content: str) -> bool:
        """Rule0 → Rule2 → Rule1 → Rule3。

        Rule0 は最優先で Change。
        Rule2 は Rule1 に対する veto。
        """
        # Rule0（最優先）
        if any(label in content for label in _RULE0_LABELS):
            return True

        # Rule1
        rule1_match = any(expr in content for expr in _RULE1_EXPRESSIONS)

        # Rule2（除外：veto）
        if any(word in content for word in _RULE2_EXCLUSIONS):
            return False

        if rule1_match:
            return True

        # Rule3（最終）
        return False

    def _to_change(self, message: AIMessage) -> Change:
        return Change(
            id=f"CHG-{uuid.uuid4().hex[:12]}",
            document_id=message.document_id,
            message_id=message.id,
            content=message.content,
            metadata={},
        )
