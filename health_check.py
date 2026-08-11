"""管理者向け: Database health check (read-only). No schema changes."""

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
from portfolio.db import connect, init_db


def run_health_check(db_path: str | None = None) -> tuple[str, list[str]]:
    """Return (PASS|WARNING|FAIL, detail lines)."""
    lines: list[str] = []
    warnings: list[str] = []
    fails: list[str] = []

    path = resolve_db(db_path)
    if not path.is_file():
        fails.append(f"DB missing: {path}")
        lines.append(f"FAIL: DB missing: {path}")
        return "FAIL", lines

    init_db(path)
    conn = connect(path)
    try:
        meta = dict(conn.execute("SELECT key, value FROM meta").fetchall())
        schema = meta.get("schema_version", "unknown")
        lines.append(f"schema_version: {schema}")
        if schema != "2":
            warnings.append(f"unexpected schema_version={schema} (expected 2)")

        asset_n = conn.execute("SELECT COUNT(*) AS n FROM asset").fetchone()["n"]
        market_n = conn.execute("SELECT COUNT(*) AS n FROM market_daily").fetchone()["n"]
        hold_n = conn.execute("SELECT COUNT(*) AS n FROM holdings_snapshot").fetchone()["n"]
        hyp_n = conn.execute("SELECT COUNT(*) AS n FROM hypothesis").fetchone()["n"]
        hrev_n = conn.execute("SELECT COUNT(*) AS n FROM hypothesis_review").fetchone()["n"]
        lines.append(f"asset count: {asset_n}")
        lines.append(f"market_daily count: {market_n}")
        lines.append(f"holdings_snapshot count: {hold_n}")
        lines.append(f"hypothesis count: {hyp_n}")
        lines.append(f"hypothesis_review count: {hrev_n}")

        if asset_n < 6:
            warnings.append(f"asset count {asset_n} < 6 seeded peers")
        if market_n == 0:
            warnings.append("market_daily is empty (run collect_market_daily.py)")

        last = conn.execute("SELECT MAX(date) AS d FROM market_daily").fetchone()["d"]
        lines.append(f"last market_daily date: {last}")
        if not last:
            warnings.append("no last market_daily date")

        lines.append("latest date by asset:")
        for row in conn.execute(
            """
            SELECT a.code, MAX(m.date) AS latest, COUNT(m.date) AS n
            FROM asset a
            LEFT JOIN market_daily m ON m.asset_id = a.asset_id
            GROUP BY a.code
            ORDER BY a.code
            """
        ):
            lines.append(f"  {row['code']}: latest={row['latest']} rows={row['n']}")

        dups = conn.execute(
            """
            SELECT date, asset_id, COUNT(*) AS n
            FROM market_daily
            GROUP BY date, asset_id
            HAVING n > 1
            """
        ).fetchall()
        lines.append(f"PRIMARY KEY duplicates (market_daily): {len(dups)}")
        if dups:
            fails.append(f"market_daily PK duplicates: {len(dups)}")

        fx_dups = conn.execute(
            "SELECT date, COUNT(*) AS n FROM fx_daily GROUP BY date HAVING n > 1"
        ).fetchall()
        lines.append(f"PRIMARY KEY duplicates (fx_daily): {len(fx_dups)}")
        if fx_dups:
            fails.append(f"fx_daily PK duplicates: {len(fx_dups)}")

        null_price = conn.execute(
            "SELECT COUNT(*) AS n FROM market_daily WHERE price IS NULL"
        ).fetchone()["n"]
        null_date = conn.execute(
            "SELECT COUNT(*) AS n FROM market_daily WHERE date IS NULL OR date = ''"
        ).fetchone()["n"]
        lines.append(f"NULL price rows: {null_price}")
        lines.append(f"NULL/empty date rows: {null_date}")
        if null_date:
            fails.append("market_daily has NULL/empty dates")
        if null_price:
            warnings.append(f"market_daily NULL price rows={null_price}")

        lines.append("source breakdown (market_daily):")
        for row in conn.execute(
            """
            SELECT source, COUNT(*) AS n, MIN(date) AS a, MAX(date) AS b
            FROM market_daily
            GROUP BY source
            ORDER BY n DESC
            """
        ):
            lines.append(f"  {row['source']}: n={row['n']} {row['a']}->{row['b']}")
            if row["source"] and "synthetic" in str(row["source"]).lower():
                warnings.append(f"synthetic source present: {row['source']}")

    finally:
        conn.close()

    for w in warnings:
        lines.append(f"WARNING: {w}")
    for f in fails:
        lines.append(f"FAIL: {f}")

    if fails:
        status = "FAIL"
    elif warnings:
        status = "WARNING"
    else:
        status = "PASS"
    lines.append(status)
    return status, lines


def main() -> None:
    parser = argparse.ArgumentParser(description="Portfolio DB health check")
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("health_check"):
        status, lines = run_health_check(args.db)
        print("\n".join(lines))
        raise SystemExit(0 if status != "FAIL" else 1)


if __name__ == "__main__":
    main()
