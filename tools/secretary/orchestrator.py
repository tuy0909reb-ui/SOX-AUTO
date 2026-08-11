"""AI編集秘書 — オーケストレータ。

責務:
    処理全体の制御と、各モジュールの呼び出し順序の定義。
    ビジネスロジック・抽出・要約・書込み・保存の実体は持たない。

仕様: docs/specs/orchestrator_integration_phase4_5.md
"""

from __future__ import annotations

from pathlib import Path

from .destination_router import DestinationRouter
from .extractor_orchestrator import ExtractorOrchestrator
from .models.ai_message import AIMessage
from .models.destination import Destination, DestinationResult
from .models.output_request import OutputRequest
from .output import Output
from .writer import Writer


def run(
    messages: list[AIMessage],
    destination: Destination,
    path: Path | None = None,
) -> DestinationResult:
    """抽出 → Writer → Output → OutputRequest → DestinationRouter を順に呼び出す。

    Phase4-5: 既存コンポーネントの制御のみを担当する。
    """
    extract_result = ExtractorOrchestrator().extract(messages)
    writer_output = Writer().write(extract_result)
    markdown = Output().render(writer_output)
    request = OutputRequest(content=markdown)
    result = DestinationRouter().route(
        request=request,
        destination=destination,
        path=path,
    )
    return result
