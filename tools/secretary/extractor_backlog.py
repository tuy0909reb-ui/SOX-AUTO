"""AI編集秘書 — Extractor（Phase2C-5：Backlog分類）。

仕様: docs/specs/extractor_phase2c5.md

公開インターフェース:
    Extractor.extract_backlogs(messages) -> list[Backlog]

行わないこと:
    Decision / Idea / Change 分類、role 更新、
    AIMessage / ParsedDocument / content / metadata の変更、
    AI利用、Markdown解析、要約
"""

from __future__ import annotations

import uuid

from .models.ai_message import AIMessage
from .models.backlog import Backlog

# Rule0: 明示ラベル（最優先）
_RULE0_LABELS = (
    "Backlog:",
    "TODO:",
    "タスク:",
)

# Rule1: 未実施・TODO表現
_RULE1_EXPRESSIONS = (
    "やる",
    "対応する",
    "実装する",
    "追加する",
    "修正する",
    "作成する",
    "確認する",
    "調査する",
    "対応予定",
    "TODO",
)

# Rule2: 除外語句（veto）
_RULE2_EXCLUSIONS = (
    "完了",
    "対応済み",
    "実施済み",
    "決定",
    "決定事項",
    "確定",
)


class Extractor:
    """Phase2C-5: Backlog 分類のみを担当する。"""

    def extract_backlogs(self, messages: list[AIMessage]) -> list[Backlog]:
        """list[AIMessage] から Backlog を Rule Engine で分類して返す。

        AIMessage は変更しない。
        """
        self._require_messages(messages)

        backlogs: list[Backlog] = []
        for message in messages:
            if self._is_backlog(message.content):
                backlogs.append(self._to_backlog(message))
        return backlogs

    def _require_messages(self, messages: list[AIMessage]) -> None:
        if messages is None:
            raise ValueError("extract_backlogs contract violated: messages is None")
        if not isinstance(messages, list):
            raise ValueError("extract_backlogs contract violated: messages is not a list")
        for index, message in enumerate(messages):
            if message is None:
                raise ValueError(
                    f"extract_backlogs contract violated: messages[{index}] is None"
                )
            if not isinstance(message, AIMessage):
                raise ValueError(
                    f"extract_backlogs contract violated: "
                    f"messages[{index}] is not AIMessage"
                )
            if message.content is None:
                raise ValueError(
                    f"extract_backlogs contract violated: "
                    f"messages[{index}].content is None"
                )

    def _is_backlog(self, content: str) -> bool:
        """Rule0 → Rule2 → Rule1 → Rule3。

        Rule0 は最優先で Backlog。
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

    def _to_backlog(self, message: AIMessage) -> Backlog:
        return Backlog(
            id=f"BLG-{uuid.uuid4().hex[:12]}",
            document_id=message.document_id,
            message_id=message.id,
            content=message.content,
            metadata={},
        )
