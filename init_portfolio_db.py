"""Initialize portfolio.db (schema + asset seed)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.db import connect, init_db


def main() -> None:
    from portfolio.cli_support import (
        add_version_flag,
        cli_runtime,
        maybe_exit_on_version,
    )

    parser = argparse.ArgumentParser(description="Initialize portfolio judgment DB")
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("init_portfolio_db"):
        path = init_db(args.db)
        conn = connect(path)
        try:
            assets = conn.execute(
                "SELECT code, asset_class, currency, vendor FROM asset ORDER BY asset_id"
            ).fetchall()
            meta = dict(conn.execute("SELECT key, value FROM meta").fetchall())
        finally:
            conn.close()

        print(f"DB: {path}")
        print(f"purpose: {meta.get('purpose')}")
        print(f"schema_version: {meta.get('schema_version')}")
        print("assets:")
        for a in assets:
            print(
                f"  {a['code']:<18} {a['asset_class']:<12} "
                f"{a['currency']} ({a['vendor']})"
            )


if __name__ == "__main__":
    main()
