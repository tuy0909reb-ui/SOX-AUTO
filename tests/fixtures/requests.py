"""OutputRequest テストデータ生成。"""

from __future__ import annotations

from secretary.models.output_request import OutputRequest


def make_output_request(content: str = "# Decisions\n\n- test\n") -> OutputRequest:
    """テスト用 OutputRequest を生成する。"""
    return OutputRequest(content=content)
