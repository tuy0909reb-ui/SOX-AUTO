"""CLI for recording and updating investment hypotheses."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import DEFAULT_COMPARE_SET, PROTOCOL_VERSION
from portfolio.db import connect, init_db, utc_now_iso

VALID_STATUS = {
    "open",
    "monitoring",
    "confirmed",
    "rejected",
    "inconclusive",
    "superseded",
}
VALID_HORIZON = {"1M", "3M", "6M", "1Y", "3Y", "custom"}


def _parse_code_list(raw: str) -> list[str]:
    """Accept JSON array or comma-separated codes (Windows-CLI friendly)."""
    raw = raw.strip()
    if raw.startswith("["):
        data = json.loads(raw)
        if not isinstance(data, list) or not all(isinstance(x, str) for x in data):
            raise SystemExit("Expected JSON array of strings")
        return data
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    if not parts:
        raise SystemExit("Expected comma-separated asset codes or JSON array")
    return parts


def add_hypothesis(
    *,
    db_path: str | None,
    as_of_date: str,
    title: str,
    thesis: str,
    rationale: str | None,
    expected_ranking: list[str],
    compare_set: list[str],
    horizon: str,
    horizon_end: str | None,
    status: str = "open",
) -> int:
    if horizon not in VALID_HORIZON:
        raise SystemExit(f"horizon must be one of {sorted(VALID_HORIZON)}")
    if status not in VALID_STATUS:
        raise SystemExit(f"status must be one of {sorted(VALID_STATUS)}")
    if horizon == "custom" and not horizon_end:
        raise SystemExit("horizon=custom requires --horizon-end")

    init_db(db_path)
    conn = connect(db_path)
    now = utc_now_iso()
    try:
        cur = conn.execute(
            """
            INSERT INTO hypothesis(
              as_of_date, title, thesis, rationale,
              expected_ranking, compare_set, horizon, horizon_end,
              status, protocol_version, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                as_of_date,
                title,
                thesis,
                rationale,
                json.dumps(expected_ranking, ensure_ascii=False),
                json.dumps(compare_set, ensure_ascii=False),
                horizon,
                horizon_end,
                status,
                PROTOCOL_VERSION,
                now,
                now,
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def update_hypothesis(
    *,
    db_path: str | None,
    hypothesis_id: int,
    status: str | None = None,
    outcome_summary: str | None = None,
    actual_ranking: list[str] | None = None,
    linked_review_run_id: int | None = None,
) -> None:
    init_db(db_path)
    conn = connect(db_path)
    try:
        row = conn.execute(
            "SELECT * FROM hypothesis WHERE hypothesis_id = ?",
            (hypothesis_id,),
        ).fetchone()
        if row is None:
            raise SystemExit(f"hypothesis_id={hypothesis_id} not found")

        new_status = status or row["status"]
        if new_status not in VALID_STATUS:
            raise SystemExit(f"status must be one of {sorted(VALID_STATUS)}")

        conn.execute(
            """
            UPDATE hypothesis SET
              status = ?,
              outcome_summary = COALESCE(?, outcome_summary),
              actual_ranking = COALESCE(?, actual_ranking),
              linked_review_run_id = COALESCE(?, linked_review_run_id),
              updated_at = ?
            WHERE hypothesis_id = ?
            """,
            (
                new_status,
                outcome_summary,
                json.dumps(actual_ranking, ensure_ascii=False) if actual_ranking is not None else None,
                linked_review_run_id,
                utc_now_iso(),
                hypothesis_id,
            ),
        )
        conn.commit()
    finally:
        conn.close()


def supersede_hypothesis(
    *,
    db_path: str | None,
    old_id: int,
    as_of_date: str,
    title: str,
    thesis: str,
    rationale: str | None,
    expected_ranking: list[str],
    compare_set: list[str],
    horizon: str,
    horizon_end: str | None,
) -> int:
    """Mark old hypothesis superseded and insert a replacement (preserves history)."""
    update_hypothesis(db_path=db_path, hypothesis_id=old_id, status="superseded")
    return add_hypothesis(
        db_path=db_path,
        as_of_date=as_of_date,
        title=title,
        thesis=thesis,
        rationale=rationale,
        expected_ranking=expected_ranking,
        compare_set=compare_set,
        horizon=horizon,
        horizon_end=horizon_end,
        status="open",
    )


def list_hypotheses(db_path: str | None, status: str | None = None) -> list[dict]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM hypothesis WHERE status = ? ORDER BY as_of_date DESC, hypothesis_id DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM hypothesis ORDER BY as_of_date DESC, hypothesis_id DESC"
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

    parser = argparse.ArgumentParser(description="Manage investment hypotheses")
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    sub = parser.add_subparsers(dest="cmd", required=False)

    p_add = sub.add_parser("add", help="Record a new hypothesis")
    p_add.add_argument("--as-of", required=True, dest="as_of_date")
    p_add.add_argument("--title", required=True)
    p_add.add_argument("--thesis", required=True)
    p_add.add_argument("--rationale", default=None)
    p_add.add_argument(
        "--expected-ranking",
        required=True,
        help="Comma-separated or JSON array, e.g. MEGA10_PROXY,FNGS,QQQ,SOXX",
    )
    p_add.add_argument(
        "--compare-set",
        default=",".join(DEFAULT_COMPARE_SET),
        help="Comma-separated or JSON array of asset codes",
    )
    p_add.add_argument("--horizon", required=True, choices=sorted(VALID_HORIZON))
    p_add.add_argument("--horizon-end", default=None)
    p_add.add_argument("--status", default="open", choices=sorted(VALID_STATUS))

    p_upd = sub.add_parser("update", help="Update verification status / outcome")
    p_upd.add_argument("--id", type=int, required=True, dest="hypothesis_id")
    p_upd.add_argument("--status", default=None, choices=sorted(VALID_STATUS))
    p_upd.add_argument("--outcome", default=None, dest="outcome_summary")
    p_upd.add_argument("--actual-ranking", default=None)
    p_upd.add_argument("--review-run-id", type=int, default=None)

    p_sup = sub.add_parser("supersede", help="Supersede old hypothesis with a new one")
    p_sup.add_argument("--old-id", type=int, required=True)
    p_sup.add_argument("--as-of", required=True, dest="as_of_date")
    p_sup.add_argument("--title", required=True)
    p_sup.add_argument("--thesis", required=True)
    p_sup.add_argument("--rationale", default=None)
    p_sup.add_argument("--expected-ranking", required=True)
    p_sup.add_argument("--compare-set", default=",".join(DEFAULT_COMPARE_SET))
    p_sup.add_argument("--horizon", required=True, choices=sorted(VALID_HORIZON))
    p_sup.add_argument("--horizon-end", default=None)

    p_list = sub.add_parser("list", help="List hypotheses")
    p_list.add_argument("--status", default=None, choices=sorted(VALID_STATUS))

    args = parser.parse_args()
    maybe_exit_on_version(args)
    if not args.cmd:
        parser.error("command required (unless --version)")

    with cli_runtime("hypothesis_cli"):
        if args.cmd == "add":
            hid = add_hypothesis(
                db_path=args.db,
                as_of_date=args.as_of_date,
                title=args.title,
                thesis=args.thesis,
                rationale=args.rationale,
                expected_ranking=_parse_code_list(args.expected_ranking),
                compare_set=_parse_code_list(args.compare_set),
                horizon=args.horizon,
                horizon_end=args.horizon_end,
                status=args.status,
            )
            print(f"Created hypothesis_id={hid}")
        elif args.cmd == "update":
            actual = (
                _parse_code_list(args.actual_ranking) if args.actual_ranking else None
            )
            update_hypothesis(
                db_path=args.db,
                hypothesis_id=args.hypothesis_id,
                status=args.status,
                outcome_summary=args.outcome_summary,
                actual_ranking=actual,
                linked_review_run_id=args.review_run_id,
            )
            print(f"Updated hypothesis_id={args.hypothesis_id}")
        elif args.cmd == "supersede":
            hid = supersede_hypothesis(
                db_path=args.db,
                old_id=args.old_id,
                as_of_date=args.as_of_date,
                title=args.title,
                thesis=args.thesis,
                rationale=args.rationale,
                expected_ranking=_parse_code_list(args.expected_ranking),
                compare_set=_parse_code_list(args.compare_set),
                horizon=args.horizon,
                horizon_end=args.horizon_end,
            )
            print(f"Superseded {args.old_id} -> new hypothesis_id={hid}")
        elif args.cmd == "list":
            rows = list_hypotheses(args.db, status=args.status)
            if not rows:
                print("(none)")
                return
            for r in rows:
                print(
                    f"#{r['hypothesis_id']} {r['as_of_date']} [{r['status']}] "
                    f"{r['title']} horizon={r['horizon']} "
                    f"expected={r['expected_ranking']}"
                )


if __name__ == "__main__":
    main()
