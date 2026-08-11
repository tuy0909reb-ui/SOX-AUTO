"""業務モデル: Decision。

仕様: docs/specs/ai_secretary_data_model.md（Phase2A Version 1.3）
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Decision:
    """決定事項として分類された本文を保持する。"""

    id: str
    document_id: str
    message_id: str
    content: str
    metadata: dict = field(default_factory=dict)
