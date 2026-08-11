"""AI編集秘書 — Extractor（Phase2C-3：Decision分類）。

仕様: docs/specs/extractor_phase2c3.md

公開インターフェース:
    Extractor.extract_decisions(messages) -> list[Decision]

行わないこと:
    Idea / Backlog / Change 分類、role 更新、
    AIMessage / ParsedDocument / content / metadata の変更、
    AI利用、Markdown解析、要約
"""

from __future__ import annotations

import uuid

from .models.ai_message import AIMessage
from .models.decision import Decision

# Rule0: 明示ラベル（最優先）
_RULE0_LABELS = (
    "決定:",
    "決定事項:",
    "Decision:",
)

# Rule1: 断定表現（〜 は任意の前方文字列として部分一致）
_RULE1_EXPRESSIONS = (
    "とする",
    "に決定する",
    "を採用する",
    "を実施する",
)

# Rule2: 除外語句
_RULE2_EXCLUSIONS = (
    "検討",
    "予定",
    "案",
    "候補",
    "可能性",
    "アイデア",
)


class Extractor:
    """Phase2C-3: Decision 分類のみを担当する。"""

    def extract_decisions(self, messages: list[AIMessage]) -> list[Decision]:
        """list[AIMessage] から Decision を Rule Engine で分類して返す。

        AIMessage は変更しない。
        """
        self._require_messages(messages)

        decisions: list[Decision] = []
        for message in messages:
            if self._is_decision(message.content):
                decisions.append(self._to_decision(message))
        return decisions

    def _require_messages(self, messages: list[AIMessage]) -> None:
        if messages is None:
            raise ValueError("extract_decisions contract violated: messages is None")
        if not isinstance(messages, list):
            raise ValueError("extract_decisions contract violated: messages is not a list")
        for index, message in enumerate(messages):
            if message is None:
                raise ValueError(
                    f"extract_decisions contract violated: messages[{index}] is None"
                )
            if not isinstance(message, AIMessage):
                raise ValueError(
                    f"extract_decisions contract violated: "
                    f"messages[{index}] is not AIMessage"
                )
            if message.content is None:
                raise ValueError(
                    f"extract_decisions contract violated: "
                    f"messages[{index}].content is None"
                )

    def _is_decision(self, content: str) -> bool:
        """Rule0 → Rule1 → Rule2 → Rule3。

        Rule0 は最優先で Decision。
        Rule1 に一致しても Rule2 の除外語句があれば Decision としない。
        """
        # Rule0（最優先）
        if any(label in content for label in _RULE0_LABELS):
            return True

        # Rule1
        rule1_match = any(expr in content for expr in _RULE1_EXPRESSIONS)

        # Rule2（除外）
        if any(word in content for word in _RULE2_EXCLUSIONS):
            return False

        if rule1_match:
            return True

        # Rule3（最終）
        return False

    def _to_decision(self, message: AIMessage) -> Decision:
        return Decision(
            id=f"DEC-{uuid.uuid4().hex[:12]}",
            document_id=message.document_id,
            message_id=message.id,
            content=message.content,
            metadata={},
        )
