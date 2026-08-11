"""Smoke tests for portfolio DB schema and judgment helpers (no network)."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

import pandas as pd

from portfolio.db import connect, get_asset_map, init_db, upsert_market_daily
from portfolio.metrics import rank_by_metric, ranking_match_score
from hypothesis_cli import add_hypothesis, list_hypotheses, update_hypothesis
from holdings_cli import list_holdings, upsert_holding
from portfolio.review_common import evaluate_hypothesis, load_price_frame


class PortfolioDbTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.db = str(Path(self.tmp.name) / "portfolio.db")
        init_db(self.db)

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_seed_assets_include_mega_three(self) -> None:
        conn = connect(self.db)
        try:
            assets = get_asset_map(conn)
        finally:
            conn.close()
        for code in (
            "MEGA10_PROXY",
            "MEGA10_OFFICIAL",
            "MEGA10_FUND",
            "SOXX",
            "FNGS",
            "QQQ",
        ):
            self.assertIn(code, assets)

    def test_hypothesis_lifecycle(self) -> None:
        hid = add_hypothesis(
            db_path=self.db,
            as_of_date="2026-07-01",
            title="Mega dominates peers",
            thesis="MEGA10_PROXY leads FNGS/QQQ/SOXX over 3M",
            rationale="AI mega-cap concentration",
            expected_ranking=["MEGA10_PROXY", "FNGS", "QQQ", "SOXX"],
            compare_set=["MEGA10_PROXY", "FNGS", "QQQ", "SOXX"],
            horizon="3M",
            horizon_end=None,
        )
        rows = list_hypotheses(self.db, status="open")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["hypothesis_id"], hid)

        update_hypothesis(
            db_path=self.db,
            hypothesis_id=hid,
            status="confirmed",
            actual_ranking=["MEGA10_PROXY", "QQQ", "FNGS", "SOXX"],
            outcome_summary="top pick correct",
        )
        rows = list_hypotheses(self.db, status="confirmed")
        self.assertEqual(len(rows), 1)
        self.assertEqual(json.loads(rows[0]["actual_ranking"])[0], "MEGA10_PROXY")

    def test_holdings_position_id(self) -> None:
        upsert_holding(
            db_path=self.db,
            as_of_date="2026-07-15",
            position_id="nisa_growth_mega",
            cost_jpy=1_200_000,
            value_jpy=1_250_000,
            hypothesis_id=None,
        )
        upsert_holding(
            db_path=self.db,
            as_of_date="2026-07-15",
            position_id="tokutei_mega",
            cost_jpy=6_500_000,
            value_jpy=6_800_000,
        )
        rows = list_holdings(self.db, as_of="2026-07-15")
        self.assertEqual(len(rows), 2)
        ids = {r["position_id"] for r in rows}
        self.assertEqual(ids, {"nisa_growth_mega", "tokutei_mega"})
        # Same account can hold two positions conceptually via different ids
        mega_rows = [r for r in rows if r["asset_code"] == "MEGA10_FUND"]
        self.assertEqual(len(mega_rows), 2)

    def test_hypothesis_eval_from_prices(self) -> None:
        conn = connect(self.db)
        assets = get_asset_map(conn)
        # Synthetic rising series with different slopes
        dates = pd.bdate_range("2026-01-01", periods=60)
        series = {
            "MEGA10_PROXY": [100 + i * 1.5 for i in range(len(dates))],
            "FNGS": [100 + i * 1.0 for i in range(len(dates))],
            "QQQ": [100 + i * 0.7 for i in range(len(dates))],
            "SOXX": [100 + i * 0.3 for i in range(len(dates))],
        }
        for code, prices in series.items():
            for dt, px in zip(dates, prices):
                upsert_market_daily(
                    conn,
                    date=dt.strftime("%Y-%m-%d"),
                    asset_id=assets[code],
                    price=float(px),
                    source="test",
                )
        conn.commit()
        conn.close()

        eval_end = dates[-1].strftime("%Y-%m-%d")
        hid = add_hypothesis(
            db_path=self.db,
            as_of_date="2026-01-02",
            title="proxy wins",
            thesis="proxy #1",
            rationale="synthetic",
            expected_ranking=["MEGA10_PROXY", "FNGS", "QQQ", "SOXX"],
            compare_set=["MEGA10_PROXY", "FNGS", "QQQ", "SOXX"],
            horizon="custom",
            horizon_end=eval_end,
        )
        df = load_price_frame(self.db, ["MEGA10_PROXY", "FNGS", "QQQ", "SOXX"])
        h = list_hypotheses(self.db)[0]
        ev = evaluate_hypothesis(h, df, eval_end)
        self.assertEqual(ev["hypothesis_id"], hid)
        self.assertEqual(ev["actual_ranking"][0], "MEGA10_PROXY")
        self.assertTrue(ev["matured"])
        self.assertEqual(ev["suggested_status"], "confirmed")

    def test_ranking_helpers(self) -> None:
        per = {
            "A": {"ret": 0.1},
            "B": {"ret": 0.2},
            "C": {"ret": -0.1},
        }
        self.assertEqual(rank_by_metric(per), ["B", "A", "C"])
        score = ranking_match_score(["B", "A", "C"], ["B", "A", "C"])
        self.assertAlmostEqual(score, 1.0)

    def test_hypothesis_review_table(self) -> None:
        from hypothesis_cli import add_hypothesis
        from hypothesis_review_cli import add_hypothesis_review, list_hypothesis_reviews
        from portfolio.review_common import classify_hypothesis_result, format_ranking_chain

        hid = add_hypothesis(
            db_path=self.db,
            as_of_date="2026-07-01",
            title="SOXX leads",
            thesis="SOXX > FNGS > MEGA > QQQ",
            rationale="cycle rebound",
            expected_ranking=["SOXX", "FNGS", "MEGA10_PROXY", "QQQ"],
            compare_set=["SOXX", "FNGS", "MEGA10_PROXY", "QQQ"],
            horizon="3M",
            horizon_end=None,
        )
        rid = add_hypothesis_review(
            db_path=self.db,
            hypothesis_id=hid,
            review_date="2026-09-30",
            actual_ranking=["FNGS", "SOXX", "MEGA10_PROXY", "QQQ"],
            result="partially_validated",
            comment="AI ok, SOX weaker",
        )
        rows = list_hypothesis_reviews(self.db, hypothesis_id=hid)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["review_id"], rid)
        self.assertEqual(rows[0]["result"], "partially_validated")
        self.assertEqual(
            format_ranking_chain(["SOXX", "FNGS", "MEGA10_PROXY", "QQQ"]),
            "SOXX > FNGS > MEGA10_PROXY > QQQ",
        )
        self.assertEqual(
            classify_hypothesis_result(
                ["SOXX", "FNGS", "MEGA10_PROXY", "QQQ"],
                ["FNGS", "SOXX", "MEGA10_PROXY", "QQQ"],
            ),
            "partially_validated",
        )
        self.assertEqual(
            classify_hypothesis_result(
                ["A", "B", "C"],
                ["A", "B", "C"],
            ),
            "validated",
        )

    def test_resolve_fetch_window_backfill_and_append(self) -> None:
        from collect_market_daily import resolve_fetch_window

        # Empty DB -> full history from 2022
        self.assertEqual(
            resolve_fetch_window(
                history_start="2022-01-01",
                history_end="2026-07-17",
                earliest=None,
                latest=None,
            ),
            ("2022-01-01", "2026-07-17"),
        )
        # DB starts 2023 -> backfill missing 2022 (full span; IGNORE skips dupes)
        self.assertEqual(
            resolve_fetch_window(
                history_start="2022-01-01",
                history_end="2026-07-17",
                earliest="2023-01-01",
                latest="2026-07-16",
            ),
            ("2022-01-01", "2026-07-17"),
        )
        # History already covers 2022 -> append only
        self.assertEqual(
            resolve_fetch_window(
                history_start="2022-01-01",
                history_end="2026-07-17",
                earliest="2022-01-01",
                latest="2026-07-16",
            ),
            ("2026-07-16", "2026-07-17"),
        )
        # Already current
        self.assertIsNone(
            resolve_fetch_window(
                history_start="2022-01-01",
                history_end="2026-07-16",
                earliest="2022-01-01",
                latest="2026-07-16",
            )
        )

    def test_intersection_peer_metrics(self) -> None:
        import pandas as pd
        from portfolio.review_common import compute_peer_metrics

        idx = pd.bdate_range("2022-01-03", periods=10)
        df = pd.DataFrame(
            {
                "A": [10 + i for i in range(10)],
                # B starts later -> intersection shrinks, B stays in peer set
                "B": [None, None, None, 11, 12, 13, 14, 15, 16, 17],
            },
            index=idx,
        )
        peer = compute_peer_metrics(
            df, ["A", "B"], "2022-01-01", "2022-12-31", mode="intersection"
        )
        self.assertEqual(peer["mode"], "intersection")
        self.assertEqual(peer["n_obs"], 7)
        self.assertEqual(peer["compare_start"], idx[3].strftime("%Y-%m-%d"))
        self.assertEqual(peer["compare_end"], idx[-1].strftime("%Y-%m-%d"))
        self.assertIn("intersection", peer["compare_reason"])
        self.assertIn("A", peer["metrics"])
        self.assertIn("B", peer["metrics"])
        self.assertEqual(peer["availability"]["B"]["n"], 7)

        cal = compute_peer_metrics(
            df, ["A", "B", "C"], "2022-01-01", "2022-12-31", mode="calendar"
        )
        self.assertEqual(cal["mode"], "calendar")
        self.assertIn("C", cal["excluded_codes"])
        self.assertIn("A", cal["active_codes"])
        self.assertIn("B", cal["active_codes"])
        self.assertIn("calendar", cal["compare_reason"])


if __name__ == "__main__":
    unittest.main()
