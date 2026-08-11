"""AI編集秘書 — Extractor（Phase2C-1 / Phase2C-2）。

Phase2C-1:
    assign_roles(parsed) -> ParsedDocument
    AIMessage.role の Rule-based 判定

Phase2C-2:
    extract(parsed) -> list[AIMessage]
    HUMAN / ASSISTANT の抽出対象選別のみ

行わないこと（Phase2C-2 extract）:
    Decision / Idea / Backlog / Change 分類、role 更新、
    content / metadata / Document / ParsedDocument の変更、
    AI利用、Markdown解析、要約
"""

from __future__ import annotations

from dataclasses import replace

from .models.ai_message import AIMessage
from .models.parsed_document import ParsedDocument

ROLE_UNKNOWN = "UNKNOWN"
ROLE_HUMAN = "HUMAN"
ROLE_ASSISTANT = "ASSISTANT"
ROLE_SYSTEM = "SYSTEM"

_HUMAN_PREFIXES = (
    "User:",
    "ユーザー:",
    "Human:",
)

_ASSISTANT_PREFIXES = (
    "ChatGPT:",
    "Gemini:",
    "Claude:",
    "Cursor:",
    "Copilot:",
    "Assistant:",
)

_SYSTEM_PREFIXES = (
    "System:",
    "SYSTEM:",
)


class Extractor:
    """role 判定（Phase2C-1）と抽出対象選別（Phase2C-2）を提供する。"""

    def assign_roles(self, parsed: ParsedDocument) -> ParsedDocument:
        """Phase2C-1: AIMessage.role を Rule-based で更新した ParsedDocument を返す。"""
        self._require_parsed(parsed)

        updated: list[AIMessage] = []
        for message in parsed.messages:
            new_role = self._decide_role(message)
            if new_role == message.role:
                updated.append(message)
            else:
                updated.append(replace(message, role=new_role))

        return ParsedDocument(document=parsed.document, messages=updated)

    def extract(self, parsed: ParsedDocument) -> list[AIMessage]:
        """Phase2C-2: HUMAN / ASSISTANT の AIMessage 参照一覧を返す。

        ParsedDocument / AIMessage は変更しない。
        """
        self._require_parsed(parsed)

        selected: list[AIMessage] = []
        for message in parsed.messages:
            # Rule0
            if message.role == ROLE_HUMAN:
                selected.append(message)
                continue
            # Rule1
            if message.role == ROLE_ASSISTANT:
                selected.append(message)
                continue
            # Rule2: UNKNOWN → 抽出しない
            # Rule3: SYSTEM → 抽出しない
        return selected

    def _require_parsed(self, parsed: ParsedDocument) -> None:
        if parsed is None:
            raise ValueError("ParsedDocument contract violated: parsed is None")
        if parsed.document is None:
            raise ValueError("ParsedDocument contract violated: document is missing")
        if parsed.messages is None:
            raise ValueError("ParsedDocument contract violated: messages is missing")

    def _decide_role(self, message: AIMessage) -> str:
        """Phase2C-1 Rule0〜Rule5。"""
        if message.role != ROLE_UNKNOWN:
            return message.role

        if "role_hint" in message.metadata:
            return message.metadata["role_hint"]

        content = message.content

        if any(content.startswith(prefix) for prefix in _HUMAN_PREFIXES):
            return ROLE_HUMAN

        if any(content.startswith(prefix) for prefix in _ASSISTANT_PREFIXES):
            return ROLE_ASSISTANT

        if any(content.startswith(prefix) for prefix in _SYSTEM_PREFIXES):
            return ROLE_SYSTEM

        return ROLE_UNKNOWN
