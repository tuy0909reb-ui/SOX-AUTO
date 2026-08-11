"""AI編集秘書 — パーサ（Phase2B-3）。

責務:
    UTF-8 Markdown を読み込み Document を生成し、
    Document.body を機械的に分割して AIMessage 一覧を付与し、
    ParsedDocument を完成させる。

行わないこと:
    意味解析、Markdown構文解析、見出し・コードブロック解析、
    Decision / Idea / Backlog / Change、AI / 外部連携、ファイル更新
"""

from __future__ import annotations

import uuid
from pathlib import Path

from .models.ai_message import AIMessage
from .models.document import Document
from .models.parsed_document import ParsedDocument

PARSER_VERSION = "2B-3"
SOURCE_MARKDOWN = "Markdown"
SUPPORTED_SOURCE_TYPE = "Markdown"
ROLE_UNKNOWN = "UNKNOWN"


class Parser:
    """入力を共通データ（ParsedDocument）へ変換する。"""

    def parse(
        self,
        source: object,
        *,
        source_type: str | None = None,
    ) -> ParsedDocument:
        """UTF-8 Markdown パスを読み、AIMessage 付き ParsedDocument を返す。

        Phase2B-3:
            source はローカル Markdown パス。
            source_type は \"Markdown\" のみ対応。
            body は空行区切りで機械的に分割する（意味解析なし）。
        """
        if source_type != SUPPORTED_SOURCE_TYPE:
            raise ValueError(
                f"unsupported source_type: {source_type!r} "
                f"(supports {SUPPORTED_SOURCE_TYPE!r} only)"
            )
        if not isinstance(source, (str, Path)):
            raise TypeError(
                "source must be a filesystem path (str or Path) for Markdown"
            )

        path = Path(source)
        doc_metadata: dict = {
            "filepath": str(path),
            "encoding": "utf-8",
            "parser_version": PARSER_VERSION,
        }

        try:
            body = path.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Markdown file not found: {path}") from exc
        except UnicodeDecodeError as exc:
            raise ValueError(
                f"cannot build ParsedDocument: failed to read as UTF-8: {path}"
            ) from exc
        except OSError as exc:
            raise OSError(
                f"cannot build ParsedDocument: failed to read: {path}"
            ) from exc

        document = Document(
            id=f"DOC-{uuid.uuid4().hex[:12]}",
            source=SOURCE_MARKDOWN,
            title=path.stem,
            body=body,
            metadata=doc_metadata,
        )
        messages = self._messages_from_body(document)
        return ParsedDocument(document=document, messages=messages)

    def _messages_from_body(self, document: Document) -> list[AIMessage]:
        """Document.body を空行（\\n\\n）で機械的分割し AIMessage を生成する。"""
        parts = document.body.split("\n\n")
        messages: list[AIMessage] = []
        for index, content in enumerate(parts):
            messages.append(
                AIMessage(
                    id=f"MSG-{uuid.uuid4().hex[:12]}",
                    document_id=document.id,
                    role=ROLE_UNKNOWN,
                    speaker="",
                    content=content,
                    timestamp="",
                    metadata={"message_index": index},
                )
            )
        return messages
