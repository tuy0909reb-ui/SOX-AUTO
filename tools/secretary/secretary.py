"""AI編集秘書 — CLIエントリポイント。

責務:
    ユーザーからの起動口（CLI）のみを担う。
    実処理は orchestrator へ委譲する。ビジネスロジックは持たない。
"""

from __future__ import annotations


def main(argv: list[str] | None = None) -> int:
    """CLI入口。引数を受け取り orchestrator を呼び出す予定。

    今回は骨格のみ。実処理は実装しない。
    """
    raise NotImplementedError("secretary CLI is skeleton-only (Phase1)")


if __name__ == "__main__":
    raise SystemExit(main())
