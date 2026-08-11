"""Parser専用コンテナ: ParsedDocument。

Document と list[AIMessage] を保持するのみ。
ロジックは持たない。
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .ai_message import AIMessage
from .document import Document


@dataclass
class ParsedDocument:
    """Parser が返す共通コンテナ。保持のみ。"""

    document: Document
    messages: list[AIMessage] = field(default_factory=list)
