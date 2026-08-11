"""CLI for position-level holdings snapshots."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import KNOWN_POSITIONS
from portfolio.db import connect, init_db, utc_now_iso

KNOWN_BY_ID = {p["position_id"]: p for p in KNOWN_POSITIONS}


def upsert_holding(
    *,
    db_path: str | None,
    as_of_date: str,
    position_id: str,
    account: str | None = None,
    position_label: str | None = None,
    asset_code: str | None = None,
    cost_jpy: float | None = None,
    value_jpy: float | None = None,
    units: float | None = None,
    unit_cost_jpy: float | None = None,
    pnl_jpy: float | None = None,
    pnl_pct: float | None = None,
    hypothesis_id: int | None = None,
    note: str | None = None,
) -> None:
    known = KNOWN_BY_ID.get(position_id)
    account = account or (known["account"] if known else None)
    asset_code = asset_code or (known["asset_code"] if known else None)
    position_label = position_label or (known["position_label"] if known else None)

    if not account:
        raise SystemExit("--account required for unknown position_id")
    if not asset_code:
        raise SystemExit("--asset-code required for unknown position_id")

    if pnl_jpy is None and cost_jpy is not None and value_jpy is not None:
        pnl_jpy = value_jpy - cost_jpy
    if pnl_pct is None and cost_jpy and value_jpy is not None and cost_jpy != 0:
        pnl_pct = (value_jpy - cost_jpy) / cost_jpy

    init_db(db_path)
    conn = connect(db_path)
    try:
        conn.execute(
            """
            INSERT INTO holdings_snapshot(
              as_of_date, account, position_id, position_label, asset_code,
              cost_jpy, value_jpy, units, unit_cost_jpy, pnl_jpy, pnl_pct,
              hypothesis_id, note, protocol_version, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(as_of_date, position_id) DO UPDATE SET
              account = excluded.account,
              position_label = excluded.position_label,
              asset_code = excluded.asset_code,
              cost_jpy = excluded.cost_jpy,
              value_jpy = excluded.value_jpy,
              units = excluded.units,
              unit_cost_jpy = excluded.unit_cost_jpy,
              pnl_jpy = excluded.pnl_jpy,
              pnl_pct = excluded.pnl_pct,
              hypothesis_id = excluded.hypothesis_id,
              note = excluded.note,
              protocol_version = excluded.protocol_version,
              created_at = excluded.created_at
            """,
            (
                as_of_date,
                account,
                position_id,
                position_label,
                asset_code,
                cost_jpy,
                value_jpy,
                units,
                unit_cost_jpy,
                pnl_jpy,
                pnl_pct,
                hypothesis_id,
                note,
                PROTOCOL_VERSION,
                utc_now_iso(),
            ),
        )
        conn.commit()
    finally:
        conn.close()


def import_csv(
    db_path: str | None,
    csv_path: str,
    *,
    dry_run: bool = False,
) -> int:
    """CSV columns: as_of_date,position_id[,account,asset_code,cost_jpy,value_jpy,...]"""
    from portfolio.cli_support import validate_holdings_csv

    rows = validate_holdings_csv(csv_path)
    if dry_run:
        print(f"DRY-RUN: validated {len(rows)} holdings rows; DB NOT written")
        return len(rows)

    n = 0
    for row in rows:
        def fnum(key: str) -> float | None:
            v = row.get(key)
            if v is None or str(v).strip() == "":
                return None
            return float(str(v).replace(",", ""))

        upsert_holding(
            db_path=db_path,
            as_of_date=row["as_of_date"],
            position_id=row["position_id"],
            account=(row.get("account") or "").strip() or None,
            position_label=(row.get("position_label") or "").strip() or None,
            asset_code=(row.get("asset_code") or "").strip() or None,
            cost_jpy=fnum("cost_jpy"),
            value_jpy=fnum("value_jpy"),
            units=fnum("units"),
            unit_cost_jpy=fnum("unit_cost_jpy"),
            pnl_jpy=fnum("pnl_jpy"),
            pnl_pct=fnum("pnl_pct"),
            hypothesis_id=int(row["hypothesis_id"]) if row.get("hypothesis_id") else None,
            note=(row.get("note") or "").strip() or None,
        )
        n += 1
    return n


def list_holdings(db_path: str | None, as_of: str | None = None) -> list[dict]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        if as_of:
            rows = conn.execute(
                """
                SELECT * FROM holdings_snapshot
                WHERE as_of_date = ?
                ORDER BY position_id
                """,
                (as_of,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM holdings_snapshot
                ORDER BY as_of_date DESC, position_id
                """
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def main() -> None:
    from portfolio.cli_support import (
        add_version_flag,
        cli_runtime,
        maybe_exit_on_version,
    )

    parser = argparse.ArgumentParser(description="Manage position-level holdings snapshots")
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    sub = parser.add_subparsers(dest="cmd", required=False)

    p_add = sub.add_parser("add", help="Upsert one position snapshot")
    p_add.add_argument("--as-of", required=True, dest="as_of_date")
    p_add.add_argument("--position-id", required=True)
    p_add.add_argument("--account", default=None)
    p_add.add_argument("--position-label", default=None)
    p_add.add_argument("--asset-code", default=None)
    p_add.add_argument("--cost-jpy", type=float, default=None)
    p_add.add_argument("--value-jpy", type=float, default=None)
    p_add.add_argument("--units", type=float, default=None)
    p_add.add_argument("--unit-cost-jpy", type=float, default=None)
    p_add.add_argument("--pnl-jpy", type=float, default=None)
    p_add.add_argument("--pnl-pct", type=float, default=None)
    p_add.add_argument("--hypothesis-id", type=int, default=None)
    p_add.add_argument("--note", default=None)

    p_csv = sub.add_parser("import-csv", help="Import snapshots from CSV")
    p_csv.add_argument("csv_path")
    p_csv.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate CSV and count rows without writing",
    )

    p_list = sub.add_parser("list", help="List snapshots")
    p_list.add_argument("--as-of", default=None)

    sub.add_parser("known-positions", help="Show seeded position_id catalog")

    args = parser.parse_args()
    maybe_exit_on_version(args)
    if not args.cmd:
        parser.error("command required (unless --version)")

    with cli_runtime("holdings_cli"):
        if args.cmd == "add":
            upsert_holding(
                db_path=args.db,
                as_of_date=args.as_of_date,
                position_id=args.position_id,
                account=args.account,
                position_label=args.position_label,
                asset_code=args.asset_code,
                cost_jpy=args.cost_jpy,
                value_jpy=args.value_jpy,
                units=args.units,
                unit_cost_jpy=args.unit_cost_jpy,
                pnl_jpy=args.pnl_jpy,
                pnl_pct=args.pnl_pct,
                hypothesis_id=args.hypothesis_id,
                note=args.note,
            )
            print(f"Upserted {args.position_id} @ {args.as_of_date}")
        elif args.cmd == "import-csv":
            n = import_csv(args.db, args.csv_path, dry_run=args.dry_run)
            print(f"{'Would import' if args.dry_run else 'Imported'} {n} rows")
        elif args.cmd == "list":
            rows = list_holdings(args.db, as_of=args.as_of)
            if not rows:
                print("(none)")
                return
            for r in rows:
                print(
                    f"{r['as_of_date']} {r['position_id']} acct={r['account']} "
                    f"asset={r['asset_code']} value={r['value_jpy']} cost={r['cost_jpy']} "
                    f"pnl={r['pnl_jpy']} hyp={r['hypothesis_id']}"
                )
        elif args.cmd == "known-positions":
            print(json.dumps(KNOWN_POSITIONS, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
