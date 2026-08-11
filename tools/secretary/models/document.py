"""共通基盤モデル: Document。

仕様: docs/specs/ai_secretary_data_model.md
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Document:
    """すべての入力を抽象化した共通ドキュメント。"""

    id: str
    source: str
    title: str
    body: str
    metadata: dict = field(default_factory=dict)
