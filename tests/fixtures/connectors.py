"""Mock Connector 生成（E2E 補助用途のみ）。"""

from __future__ import annotations

from unittest.mock import MagicMock

from secretary.connector import Connector


def make_mock_connector(
    *,
    side_effect: Exception | None = None,
) -> MagicMock:
    """Connector.send を監視・制御できる Mock を返す。

    既定では Phase4-3 プレースホルダと同様に NotImplementedError を送出する。
    """
    connector = MagicMock(spec=Connector)
    if side_effect is None:
        connector.send.side_effect = NotImplementedError(
            "Mock Connector: not implemented (test only)"
        )
    else:
        connector.send.side_effect = side_effect
    return connector
