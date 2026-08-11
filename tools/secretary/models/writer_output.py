"""Writer Core 出力モデル: WriterOutput。

仕様: docs/specs/writer_phase3_0.md（Phase3-0 Version 1.0）
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .backlog import Backlog
from .change import Change
from .decision import Decision
from .idea import Idea


@dataclass
class WriterOutput:
    """Writerフェーズで使用する出力保持モデル。"""

    decisions: list[Decision] = field(default_factory=list)
    ideas: list[Idea] = field(default_factory=list)
    backlogs: list[Backlog] = field(default_factory=list)
    changes: list[Change] = field(default_factory=list)
