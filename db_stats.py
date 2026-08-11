"""管理者向け: Database statistics for ops overview (read-only)."""

from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import DEFAULT_HISTORY_START
from portfolio.cli_support import (
    add_version_flag,
    cli_runtime,
    maybe_exit_on_version,
    resolve_db,
)
from portfolio.db import connect, init_db


def run_db_stats(db_path: str | None = None, history_start: str = DEFAULT_HISTORY_START) -> list[str]:
    path = resolve_db(db_path)
    lines: list[str] = []
    if not path.is_file():
        return [f"DB missing: {path}"]

    init_db(path)
    conn = connect(path)
    try:
        size = path.stat().st_size
        mtime = datetime.fromtimestamp(path.stat().st_mtime).isoformat(sep=" ", timespec="seconds")
        lines.append(f"DB path: {path}")
        lines.append(f"DB size: {size:,} bytes ({size / 1024:.1f} KiB)")
        lines.append(f"DB file mtime: {mtime}")

        asset_n = conn.execute(
            "SELECT COUNT(*) AS n FROM asset WHERE is_active = 1"
        ).fetchone()["n"]
        lines.append(f"Active assets: {asset_n}")

        # Trading days = distinct dates in market_daily
        trading_days = conn.execute(
            "SELECT COUNT(DISTINCT date) AS n FROM market_daily"
        ).fetchone()["n"]
        lines.append(f"Trading days in market_daily: {trading_days}")

        # Approximate calendar business days span using min/max
        span = conn.execute(
            "SELECT MIN(date) AS a, MAX(date) AS b FROM market_daily"
        ).fetchone()
        lines.append(f"Global span: {span['a']} -> {span['b']}")

        lines.append("Per-asset history / coverage:")
        lines.append(
            f"(coverage vs requested history_start={history_start}; "
            "missing_days ~ calendar weekdays in span minus observed rows)"
        )

        import pandas as pd

        for row in conn.execute(
            """
            SELECT a.code, a.is_active,
                   MIN(m.date) AS start_d, MAX(m.date) AS end_d,
                   COUNT(m.date) AS n
            FROM asset a
            LEFT JOIN market_daily m ON m.asset_id = a.asset_id AND m.price IS NOT NULL
            GROUP BY a.asset_id
            ORDER BY a.code
            """
        ):
            code = row["code"]
            n = int(row["n"] or 0)
            start_d, end_d = row["start_d"], row["end_d"]
            if not start_d or not end_d or n == 0:
                lines.append(f"  {code}: no data")
                continue
            # weekday count in [max(history_start, start), end]
            cov_start = max(history_start, start_d)
            bdays = len(pd.bdate_range(cov_start, end_d))
            # observed rows in that window
            aid = conn.execute(
                "SELECT asset_id FROM asset WHERE code = ?", (code,)
            ).fetchone()["asset_id"]
            obs = conn.execute(
                """
                SELECT COUNT(*) AS n FROM market_daily
                WHERE asset_id = ? AND date >= ? AND date <= ? AND price IS NOT NULL
                """,
                (aid, cov_start, end_d),
            ).fetchone()["n"]
            missing = max(0, bdays - int(obs))
            cov = (int(obs) / bdays * 100.0) if bdays else 0.0
            lines.append(
                f"  {code}: {start_d} -> {end_d} rows={n} "
                f"missing~{missing} coverage~{cov:.1f}%"
            )

        last_collect = conn.execute(
            "SELECT MAX(collected_at) AS t FROM market_daily"
        ).fetchone()["t"]
        lines.append(f"Last collected_at (market_daily): {last_collect}")
    finally:
        conn.close()
    return lines


def main() -> None:
    parser = argparse.ArgumentParser(description="Portfolio DB statistics")
    parser.add_argument("--db", default=None)
    parser.add_argument("--history-start", default=DEFAULT_HISTORY_START)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("db_stats"):
        print("\n".join(run_db_stats(args.db, history_start=args.history_start)))


if __name__ == "__main__":
    main()
