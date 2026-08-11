"""ConnectorResult。

仕様: docs/specs/connector_phase4_3.md（Phase4-3 Version 1.0）
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .destination import Destination


@dataclass
class ConnectorResult:
    """Connector の実行結果を保持する共通モデル。"""

    destination: Destination
    result: Any
