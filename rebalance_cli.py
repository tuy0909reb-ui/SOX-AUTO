"""CLI to record Mega (or other) rebalance / constituent-change events."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import PROTOCOL_VERSION
from portfolio.db import connect, init_db, utc_now_iso


def add_rebalance_event(
    *,
    db_path: str | None,
    event_date: str,
    asset_code: str,
    event_type: str,
    before_json: str | None = None,
    after_json: str | None = None,
    diff_json: str | None = None,
    source: str | None = None,
) -> int:
    init_db(db_path)
    conn = connect(db_path)
    try:
        cur = conn.execute(
            """
            INSERT INTO rebalance_event(
              event_date, asset_code, event_type,
              before_json, after_json, diff_json,
              source, protocol_version, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                event_date,
                asset_code,
                event_type,
                before_json,
                after_json,
                diff_json,
                source,
                PROTOCOL_VERSION,
                utc_now_iso(),
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def main() -> None:
    from portfolio.cli_support import (
        add_version_flag,
        cli_runtime,
        maybe_exit_on_version,
    )

    parser = argparse.ArgumentParser(description="Record rebalance / constituent events")
    parser.add_argument("--db", default=None)
    parser.add_argument("--event-date", default=None)
    parser.add_argument("--asset-code", default="MEGA10_OFFICIAL")
    parser.add_argument(
        "--event-type",
        default=None,
        choices=["constituent_change", "weight_rebalance", "other"],
    )
    parser.add_argument("--before-json", default=None)
    parser.add_argument("--after-json", default=None)
    parser.add_argument("--diff-json", default=None)
    parser.add_argument("--source", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)
    if not args.event_date or not args.event_type:
        parser.error("--event-date and --event-type are required (unless --version)")

    with cli_runtime("rebalance_cli"):
        eid = add_rebalance_event(
            db_path=args.db,
            event_date=args.event_date,
            asset_code=args.asset_code,
            event_type=args.event_type,
            before_json=args.before_json,
            after_json=args.after_json,
            diff_json=args.diff_json,
            source=args.source,
        )
        print(f"Created rebalance_event id={eid}")


if __name__ == "__main__":
    main()
