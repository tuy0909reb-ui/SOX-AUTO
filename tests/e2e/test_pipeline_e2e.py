"""Phase5-0 E2E：抽出 → Writer → Output → 保存 パイプライン契約確認。

仕様: docs/specs/e2e_test_phase5_0.md
"""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

import pytest

from secretary.file_writer import FileWriter
from secretary.models.ai_message import AIMessage
from secretary.models.destination import Destination, DestinationResult
from secretary.models.output_request import OutputRequest
from secretary.orchestrator import run
from secretary.output import Output
from secretary.writer import Writer
from secretary.extractor_orchestrator import ExtractorOrchestrator
from secretary.destination_router import DestinationRouter
from secretary.connectors.git_connector import GitConnector
from secretary.connectors.notion_connector import NotionConnector
from secretary.connectors.slack_connector import SlackConnector
from secretary.connectors.discord_connector import DiscordConnector

from tests.fixtures.messages import make_ai_message
from tests.fixtures.paths import make_local_output_path, make_unwritable_path


def _expected_markdown(messages: list[AIMessage]) -> str:
    extract_result = ExtractorOrchestrator().extract(messages)
    writer_output = Writer().write(extract_result)
    return Output().render(writer_output)


class TestCase1LocalSaveSuccess:
    def test_local_save_success(self, tmp_path: Path) -> None:
        messages = [make_ai_message("決定: E2Eローカル保存を確認する")]
        out_path = make_local_output_path(tmp_path)
        expected = _expected_markdown(messages)

        original_write = FileWriter.write
        with patch.object(FileWriter, "write", autospec=True) as mocked_write:
            mocked_write.side_effect = original_write
            result = run(
                messages=messages,
                destination=Destination.LOCAL,
                path=out_path,
            )

        mocked_write.assert_called_once()
        assert out_path.exists()
        saved = out_path.read_text(encoding="utf-8")
        assert saved == expected
        assert isinstance(result, DestinationResult)
        assert result.destination is Destination.LOCAL
        assert result.result == out_path


class TestCase2ConnectorDelegation:
    @pytest.mark.parametrize(
        ("destination", "connector_cls"),
        [
            (Destination.GIT, GitConnector),
            (Destination.NOTION, NotionConnector),
            (Destination.SLACK, SlackConnector),
            (Destination.DISCORD, DiscordConnector),
        ],
    )
    def test_connector_not_implemented_propagates(
        self,
        destination: Destination,
        connector_cls: type,
    ) -> None:
        messages = [make_ai_message("決定: Connector委譲を確認する")]

        original_send = connector_cls.send
        with patch.object(connector_cls, "send", autospec=True) as mocked_send:
            mocked_send.side_effect = original_send
            with pytest.raises(NotImplementedError):
                run(messages=messages, destination=destination)

        mocked_send.assert_called_once()
        request = mocked_send.call_args.args[1]
        assert isinstance(request, OutputRequest)


class TestCase3ErrorPropagation:
    def test_oserror_propagates_without_correction(self, tmp_path: Path) -> None:
        messages = [make_ai_message("決定: エラー伝播を確認する")]
        bad_path = make_unwritable_path(tmp_path)

        with pytest.raises(OSError):
            run(
                messages=messages,
                destination=Destination.LOCAL,
                path=bad_path,
            )


class TestCase4OutputRequestImmutability:
    def test_output_request_content_matches_render(self, tmp_path: Path) -> None:
        messages = [make_ai_message("決定: OutputRequest不変性を確認する")]
        out_path = make_local_output_path(tmp_path, "immutable.md")
        rendered: list[str] = []
        captured: dict[str, str] = {}

        original_render = Output.render
        original_route = DestinationRouter.route

        def render_wrapper(self: Output, writer_output: object) -> str:
            markdown = original_render(self, writer_output)
            rendered.append(markdown)
            return markdown

        def route_wrapper(
            self: DestinationRouter,
            request: OutputRequest,
            destination: Destination,
            path: Path | None = None,
        ) -> DestinationResult:
            captured["content"] = request.content
            return original_route(self, request, destination, path=path)

        with (
            patch.object(Output, "render", render_wrapper),
            patch.object(DestinationRouter, "route", route_wrapper),
        ):
            run(
                messages=messages,
                destination=Destination.LOCAL,
                path=out_path,
            )

        assert len(rendered) == 1
        assert captured["content"] == rendered[0]
        assert out_path.read_text(encoding="utf-8") == rendered[0]


class TestCase5OrchestratorCallOrder:
    def test_call_order(self, tmp_path: Path) -> None:
        messages = [make_ai_message("決定: 呼び出し順序を確認する")]
        out_path = make_local_output_path(tmp_path, "order.md")
        order: list[str] = []

        original_extract = ExtractorOrchestrator.extract
        original_write = Writer.write
        original_render = Output.render
        original_route = DestinationRouter.route
        original_output_request = OutputRequest

        def extract_wrapper(self: ExtractorOrchestrator, msgs: list[AIMessage]):
            order.append("Extractor")
            return original_extract(self, msgs)

        def write_wrapper(self: Writer, result: object):
            order.append("Writer.write")
            return original_write(self, result)

        def render_wrapper(self: Output, writer_output: object) -> str:
            order.append("Output.render")
            return original_render(self, writer_output)

        def output_request_factory(*, content: str) -> OutputRequest:
            order.append("OutputRequest")
            return original_output_request(content=content)

        def route_wrapper(
            self: DestinationRouter,
            request: OutputRequest,
            destination: Destination,
            path: Path | None = None,
        ) -> DestinationResult:
            order.append("DestinationRouter.route")
            return original_route(self, request, destination, path=path)

        with (
            patch.object(ExtractorOrchestrator, "extract", extract_wrapper),
            patch.object(Writer, "write", write_wrapper),
            patch.object(Output, "render", render_wrapper),
            patch(
                "secretary.orchestrator.OutputRequest",
                side_effect=output_request_factory,
            ),
            patch.object(DestinationRouter, "route", route_wrapper),
        ):
            run(
                messages=messages,
                destination=Destination.LOCAL,
                path=out_path,
            )

        assert order == [
            "Extractor",
            "Writer.write",
            "Output.render",
            "OutputRequest",
            "DestinationRouter.route",
        ]
