"""Destination / DestinationResult。

仕様: docs/specs/destination_router_phase4_2.md（Phase4-2 Version 1.0）
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
from typing import Any


class Destination(Enum):
    LOCAL = auto()
    GIT = auto()
    NOTION = auto()
    SLACK = auto()
    DISCORD = auto()


@dataclass
class DestinationResult:
    """DestinationRouter の実行結果を保持する共通モデル。"""

    destination: Destination
    result: Any
