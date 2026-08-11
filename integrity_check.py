"""管理者向け: SQLite PRAGMA integrity_check (read-only)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.cli_support import (
    add_version_flag,
    cli_runtime,
    maybe_exit_on_version,
    resolve_db,
)
from portfolio.db import connect


def run_integrity_check(db_path: str | None = None) -> str:
    path = resolve_db(db_path)
    if not path.is_file():
        print("FAIL")
        print(f"DB missing: {path}")
        return "FAIL"
    conn = connect(path)
    try:
        rows = conn.execute("PRAGMA integrity_check").fetchall()
        messages = [r[0] for r in rows]
    finally:
        conn.close()

    if messages == ["ok"]:
        print("OK")
        return "OK"
    print("FAIL")
    for m in messages:
        print(m)
    return "FAIL"


def main() -> None:
    parser = argparse.ArgumentParser(description="SQLite integrity_check")
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("integrity_check"):
        status = run_integrity_check(args.db)
        raise SystemExit(0 if status == "OK" else 1)


if __name__ == "__main__":
    main()
