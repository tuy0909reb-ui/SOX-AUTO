"""CLI to record human hypothesis reviews (judgment verification, not prices)."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from hypothesis_cli import _parse_code_list
from portfolio.db import connect, init_db, utc_now_iso

VALID_RESULTS = {"validated", "partially_validated", "invalidated"}


def add_hypothesis_review(
    *,
    db_path: str | None,
    hypothesis_id: int,
    review_date: str,
    actual_ranking: list[str],
    result: str,
    comment: str | None = None,
) -> int:
    if result not in VALID_RESULTS:
        raise SystemExit(f"result must be one of {sorted(VALID_RESULTS)}")

    init_db(db_path)
    conn = connect(db_path)
    try:
        hyp = conn.execute(
            "SELECT hypothesis_id FROM hypothesis WHERE hypothesis_id = ?",
            (hypothesis_id,),
        ).fetchone()
        if hyp is None:
            raise SystemExit(f"hypothesis_id={hypothesis_id} not found")

        cur = conn.execute(
            """
            INSERT INTO hypothesis_review(
              hypothesis_id, review_date, actual_ranking, result, comment, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                hypothesis_id,
                review_date,
                json.dumps(actual_ranking, ensure_ascii=False),
                result,
                comment,
                utc_now_iso(),
            ),
        )
        conn.commit()
        return int(cur.lastrowid)
    finally:
        conn.close()


def list_hypothesis_reviews(
    db_path: str | None,
    hypothesis_id: int | None = None,
) -> list[dict]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        if hypothesis_id is not None:
            rows = conn.execute(
                """
                SELECT * FROM hypothesis_review
                WHERE hypothesis_id = ?
                ORDER BY review_date DESC, review_id DESC
                """,
                (hypothesis_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM hypothesis_review
                ORDER BY review_date DESC, review_id DESC
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

    parser = argparse.ArgumentParser(
        description="Record human reviews of investment hypotheses"
    )
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    sub = parser.add_subparsers(dest="cmd", required=False)

    p_add = sub.add_parser("add", help="Register a hypothesis review")
    p_add.add_argument("--hypothesis-id", type=int, required=True)
    p_add.add_argument("--review-date", required=True)
    p_add.add_argument(
        "--actual-ranking",
        required=True,
        help="Comma-separated or JSON array, e.g. FNGS,SOXX,MEGA10_PROXY,QQQ",
    )
    p_add.add_argument(
        "--result",
        required=True,
        choices=sorted(VALID_RESULTS),
    )
    p_add.add_argument("--comment", default=None)

    p_list = sub.add_parser("list", help="List hypothesis reviews")
    p_list.add_argument("--hypothesis-id", type=int, default=None)

    args = parser.parse_args()
    maybe_exit_on_version(args)
    if not args.cmd:
        parser.error("command required (unless --version)")

    with cli_runtime("hypothesis_review_cli"):
        if args.cmd == "add":
            rid = add_hypothesis_review(
                db_path=args.db,
                hypothesis_id=args.hypothesis_id,
                review_date=args.review_date,
                actual_ranking=_parse_code_list(args.actual_ranking),
                result=args.result,
                comment=args.comment,
            )
            print(f"Created hypothesis_review review_id={rid}")
        elif args.cmd == "list":
            rows = list_hypothesis_reviews(
                args.db, hypothesis_id=args.hypothesis_id
            )
            if not rows:
                print("(none)")
                return
            for r in rows:
                print(
                    f"#{r['review_id']} hyp={r['hypothesis_id']} "
                    f"{r['review_date']} [{r['result']}] "
                    f"actual={r['actual_ranking']}"
                )
                if r.get("comment"):
                    print(f"  comment: {r['comment']}")


if __name__ == "__main__":
    main()
