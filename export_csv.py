"""管理者向け: Export portfolio tables to CSV under logs/portfolio/exports/."""

from __future__ import annotations

import argparse
import csv
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
from portfolio.db import connect, init_db

EXPORT_DIR = Path("logs/portfolio/exports")

ALLOWED_TABLES = {
    "meta",
    "asset",
    "market_daily",
    "fx_daily",
    "hypothesis",
    "hypothesis_review",
    "holdings_snapshot",
    "rebalance_event",
    "review_run",
    "review_metric",
}


def export_table(table: str, db_path: str | None = None) -> Path:
    if table not in ALLOWED_TABLES:
        raise SystemExit(
            f"Unknown or disallowed table {table!r}. Allowed: {sorted(ALLOWED_TABLES)}"
        )
    path = resolve_db(db_path)
    if not path.is_file():
        raise SystemExit(f"DB not found: {path}")

    init_db(path)
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    out = EXPORT_DIR / f"{table}.csv"

    conn = connect(path)
    try:
        cur = conn.execute(f"SELECT * FROM {table}")  # table whitelisted
        cols = [d[0] for d in cur.description]
        rows = cur.fetchall()
    finally:
        conn.close()

    with out.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in rows:
            w.writerow([r[c] for c in cols])

    print(f"Exported {len(rows)} rows -> {out}")
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Export portfolio table to CSV")
    parser.add_argument(
        "table",
        nargs="?",
        default=None,
        help="Table name (e.g. market_daily)",
    )
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)
    if not args.table:
        parser.error("table required (unless --version)")

    with cli_runtime("export_csv"):
        export_table(args.table, args.db)


if __name__ == "__main__":
    main()
