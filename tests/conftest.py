"""共通 pytest fixture（Phase5-1 Test Infrastructure）。

tools/ への import は pytest.ini の pythonpath で解決する。
ここにはテスト補助 fixture のみを置く（本番コードへ影響しない）。
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock

import pytest

from secretary.models.ai_message import AIMessage
from secretary.models.output_request import OutputRequest

from tests.fixtures.connectors import make_mock_connector
from tests.fixtures.messages import make_ai_message
from tests.fixtures.paths import make_local_output_path, make_unwritable_path
from tests.fixtures.requests import make_output_request


@pytest.fixture
def sample_messages() -> list[AIMessage]:
    """代表的な AIMessage リスト。"""
    return [make_ai_message("決定: テスト用メッセージ")]


@pytest.fixture
def local_output_path(tmp_path: Path) -> Path:
    """LOCAL 保存用の一時 Path。"""
    return make_local_output_path(tmp_path)


@pytest.fixture
def unwritable_output_path(tmp_path: Path) -> Path:
    """FileWriter が OSError となる Path。"""
    return make_unwritable_path(tmp_path)


@pytest.fixture
def sample_output_request() -> OutputRequest:
    """代表的な OutputRequest。"""
    return make_output_request()


@pytest.fixture
def mock_connector() -> MagicMock:
    """E2E 補助用 Mock Connector（既定: NotImplementedError）。"""
    return make_mock_connector()
