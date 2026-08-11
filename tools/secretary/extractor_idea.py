"""AI編集秘書 — Extractor（Phase2C-4：Idea分類）。

仕様: docs/specs/extractor_phase2c4.md

公開インターフェース:
    Extractor.extract_ideas(messages) -> list[Idea]

行わないこと:
    Decision / Backlog / Change 分類、role 更新、
    AIMessage / ParsedDocument / content / metadata の変更、
    AI利用、Markdown解析、要約
"""

from __future__ import annotations

import uuid

from .models.ai_message import AIMessage
from .models.idea import Idea

# Rule0: 明示ラベル（最優先）
_RULE0_LABELS = (
    "アイデア:",
    "Idea:",
    "提案:",
)

# Rule1: アイデア表現（〜 は任意の前方文字列として部分一致）
_RULE1_EXPRESSIONS = (
    "してはどうか",
    "できるかもしれない",
    "という案がある",
    "の可能性がある",
    "を検討したい",
    "を考えている",
)

# Rule2: 除外語句（veto）
_RULE2_EXCLUSIONS = (
    "決定",
    "決定事項",
    "確定",
    "採用する",
    "実施する",
)


class Extractor:
    """Phase2C-4: Idea 分類のみを担当する。"""

    def extract_ideas(self, messages: list[AIMessage]) -> list[Idea]:
        """list[AIMessage] から Idea を Rule Engine で分類して返す。

        AIMessage は変更しない。
        """
        self._require_messages(messages)

        ideas: list[Idea] = []
        for message in messages:
            if self._is_idea(message.content):
                ideas.append(self._to_idea(message))
        return ideas

    def _require_messages(self, messages: list[AIMessage]) -> None:
        if messages is None:
            raise ValueError("extract_ideas contract violated: messages is None")
        if not isinstance(messages, list):
            raise ValueError("extract_ideas contract violated: messages is not a list")
        for index, message in enumerate(messages):
            if message is None:
                raise ValueError(
                    f"extract_ideas contract violated: messages[{index}] is None"
                )
            if not isinstance(message, AIMessage):
                raise ValueError(
                    f"extract_ideas contract violated: "
                    f"messages[{index}] is not AIMessage"
                )
            if message.content is None:
                raise ValueError(
                    f"extract_ideas contract violated: "
                    f"messages[{index}].content is None"
                )

    def _is_idea(self, content: str) -> bool:
        """Rule0 → Rule2 → Rule1 → Rule3。

        Rule0 は最優先で Idea。
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

    def _to_idea(self, message: AIMessage) -> Idea:
        return Idea(
            id=f"IDEA-{uuid.uuid4().hex[:12]}",
            document_id=message.document_id,
            message_id=message.id,
            content=message.content,
            metadata={},
        )
