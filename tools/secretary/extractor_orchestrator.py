"""AI編集秘書 — ExtractorOrchestrator（Phase2D-1：Extractor統合）。

仕様: docs/specs/extractor_phase2d1.md

公開インターフェース:
    ExtractorOrchestrator.extract(messages) -> ExtractResult

行わないこと:
    Rule判定・分類・AI利用・加工・変換・重複排除・
    優先順位付け・要約・ログ生成・独自バリデーション
"""

from __future__ import annotations

from .extractor_backlog import Extractor as BacklogExtractor
from .extractor_change import Extractor as ChangeExtractor
from .extractor_decision import Extractor as DecisionExtractor
from .extractor_idea import Extractor as IdeaExtractor
from .models.ai_message import AIMessage
from .models.extract_result import ExtractResult


class ExtractorOrchestrator:
    """Phase2C-3〜C-6 分類器の呼び出しと結果統合のみを担当する。"""

    def __init__(self) -> None:
        self._decision_extractor = DecisionExtractor()
        self._idea_extractor = IdeaExtractor()
        self._backlog_extractor = BacklogExtractor()
        self._change_extractor = ChangeExtractor()

    def extract(self, messages: list[AIMessage]) -> ExtractResult:
        """分類器を固定順で呼び出し、結果を未加工のまま ExtractResult に格納する。"""
        decisions = self._decision_extractor.extract_decisions(messages)
        ideas = self._idea_extractor.extract_ideas(messages)
        backlogs = self._backlog_extractor.extract_backlogs(messages)
        changes = self._change_extractor.extract_changes(messages)

        return ExtractResult(
            decisions=decisions,
            ideas=ideas,
            backlogs=backlogs,
            changes=changes,
        )
