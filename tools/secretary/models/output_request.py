"""I/O Core 保存要求モデル: OutputRequest。

仕様: docs/specs/output_request_phase4_0.md（Phase4-0 Version 1.0）
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class OutputRequest:
    """Markdown成果物を未加工のまま保持する保存要求モデル。"""

    content: str
