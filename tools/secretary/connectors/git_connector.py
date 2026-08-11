"""GitConnector（Phase4-3 プレースホルダ）。

仕様: docs/specs/connector_phase4_3.md
"""

from __future__ import annotations

from ..connector import Connector
from ..models.connector_result import ConnectorResult
from ..models.output_request import OutputRequest


class GitConnector(Connector):
    """Git への外部接続（未実装）。"""

    def send(self, request: OutputRequest) -> ConnectorResult:
        raise NotImplementedError("GitConnector is not implemented")
