"""共通基盤モデル: AIMessage。

仕様: docs/specs/ai_secretary_data_model.md
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class AIMessage:
    """Document内の1件の発言。"""

    id: str
    document_id: str
    role: str
    speaker: str
    content: str
    timestamp: str
    metadata: dict = field(default_factory=dict)
