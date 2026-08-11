"""AI編集秘書 — Connector（Phase4-3：抽象インターフェース）。

仕様: docs/specs/connector_phase4_3.md

公開インターフェース:
    Connector.send(request: OutputRequest) -> ConnectorResult

行わないこと:
    Markdown生成・加工、保存先判定、File保存、
    AI / Rule 処理、モデル再解釈、内容補正
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from .models.connector_result import ConnectorResult
from .models.output_request import OutputRequest


class Connector(ABC):
    """外部サービス接続の共通インターフェース。"""

    @abstractmethod
    def send(self, request: OutputRequest) -> ConnectorResult:
        """OutputRequest を外部サービスへ送信し ConnectorResult を返却する。"""
        ...
