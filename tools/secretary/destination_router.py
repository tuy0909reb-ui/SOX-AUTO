"""AI編集秘書 — DestinationRouter（Phase4-2 / Phase4-4 Integration）。

仕様:
    docs/specs/destination_router_phase4_2.md
    docs/specs/integration_phase4_4.md

公開インターフェース:
    DestinationRouter.route(request, destination, path=None) -> DestinationResult

行わないこと:
    Markdown生成・加工、保存処理本体、外部API実装、
    保存先の自動推測、ファイル名決定、モデル再解釈
"""

from __future__ import annotations

from pathlib import Path

from .connectors.discord_connector import DiscordConnector
from .connectors.git_connector import GitConnector
from .connectors.notion_connector import NotionConnector
from .connectors.slack_connector import SlackConnector
from .file_writer import FileWriter
from .models.connector_result import ConnectorResult
from .models.destination import Destination, DestinationResult
from .models.output_request import OutputRequest


class DestinationRouter:
    """保存先の選択と Writer / Connector への処理委譲のみを担当する。"""

    def __init__(self) -> None:
        self._file_writer = FileWriter()
        self._git = GitConnector()
        self._notion = NotionConnector()
        self._slack = SlackConnector()
        self._discord = DiscordConnector()

    def route(
        self,
        request: OutputRequest,
        destination: Destination,
        path: Path | None = None,
    ) -> DestinationResult:
        """Destination に応じて Writer / Connector へ委譲し結果を返却する。

        LOCAL の場合、FileWriter への委譲に必要な path を受け取る。
        """
        if request is None:
            raise ValueError("DestinationRouter.route contract violated: request is None")
        if not isinstance(request, OutputRequest):
            raise ValueError(
                "DestinationRouter.route contract violated: request is not OutputRequest"
            )
        if destination is None:
            raise ValueError(
                "DestinationRouter.route contract violated: destination is None"
            )
        if not isinstance(destination, Destination):
            raise ValueError(
                "DestinationRouter.route contract violated: "
                "destination is not Destination"
            )

        if destination is Destination.LOCAL:
            if path is None:
                raise ValueError(
                    "DestinationRouter.route contract violated: "
                    "path is required for Destination.LOCAL"
                )
            result = self._file_writer.write(request, path)
            return DestinationResult(destination=destination, result=result)

        if destination is Destination.GIT:
            return self._to_destination_result(destination, self._git.send(request))

        if destination is Destination.NOTION:
            return self._to_destination_result(destination, self._notion.send(request))

        if destination is Destination.SLACK:
            return self._to_destination_result(destination, self._slack.send(request))

        if destination is Destination.DISCORD:
            return self._to_destination_result(destination, self._discord.send(request))

        raise ValueError(f"unsupported destination: {destination}")

    def _to_destination_result(
        self,
        destination: Destination,
        connector_result: ConnectorResult,
    ) -> DestinationResult:
        return DestinationResult(
            destination=destination,
            result=connector_result.result,
        )
