"""AIMessage テストデータ生成。"""

from __future__ import annotations

from secretary.models.ai_message import AIMessage


def make_ai_message(
    content: str,
    *,
    message_id: str = "MSG-test-1",
    document_id: str = "DOC-test-1",
    role: str = "HUMAN",
    speaker: str = "",
    timestamp: str = "",
    metadata: dict | None = None,
) -> AIMessage:
    """テスト用 AIMessage を生成する。"""
    return AIMessage(
        id=message_id,
        document_id=document_id,
        role=role,
        speaker=speaker,
        content=content,
        timestamp=timestamp,
        metadata={} if metadata is None else metadata,
    )
