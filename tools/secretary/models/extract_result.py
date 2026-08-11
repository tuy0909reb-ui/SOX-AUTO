"""共通データモデル: ExtractResult。

仕様: docs/specs/extract_result_model.md（Phase2D-0 Version 1.0）
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .backlog import Backlog
from .change import Change
from .decision import Decision
from .idea import Idea


@dataclass
class ExtractResult:
    """Phase2C 分類結果を未加工のまま保持するコンテナ。"""

    decisions: list[Decision] = field(default_factory=list)
    ideas: list[Idea] = field(default_factory=list)
    backlogs: list[Backlog] = field(default_factory=list)
    changes: list[Change] = field(default_factory=list)
