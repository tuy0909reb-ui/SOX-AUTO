"""一時保存 Path テストデータ生成。"""

from __future__ import annotations

from pathlib import Path


def make_local_output_path(tmp_path: Path, name: str = "result.md") -> Path:
    """LOCAL 保存用の出力 Path を生成する（親ディレクトリは未作成でも可）。"""
    return tmp_path / "out" / name


def make_unwritable_path(tmp_path: Path, name: str = "cannot_write.md") -> Path:
    """FileWriter が OSError を起こす Path を生成する。

    ファイルをディレクトリとして mkdir しようとするため失敗する。
    """
    blocker = tmp_path / "blocker"
    blocker.write_text("not a directory", encoding="utf-8")
    return blocker / name
