"""Selector validation for frozen Batch 1 eight Documents (no Fact generation)."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch1_selectors import (  # noqa: E402
    FIXTURES,
    SelectorFixture,
    validate_batch1_selectors,
    validate_location,
    run_negative_fixtures,
)


class Batch1SelectorValidationTest(unittest.TestCase):
    def test_batch1_selectors_and_negatives(self) -> None:
        summary = validate_batch1_selectors()
        self.assertEqual(summary["documents"], 8)
        self.assertEqual(summary["selectors_validated"], 11)
        self.assertEqual(summary["observations_generated"], 0)
        self.assertEqual(summary["financial_facts_generated"], 0)
        self.assertEqual(len(summary["negative_fixtures"]), 11)
        by_issuer = {}
        for row in summary["results"]:
            by_issuer.setdefault(row["issuer"], []).append(row["selector"])
        self.assertEqual(by_issuer["lasertec"], ["actual_revenue", "full_year_forecast"])
        self.assertEqual(by_issuer["kawasaki_heavy"], ["actual_revenue", "full_year_forecast"])
        self.assertEqual(by_issuer["screen_holdings"], ["review_only"])
        lasertec_fy = next(
            row for row in summary["results"] if row["issuer"] == "lasertec" and row["selector"] == "full_year_forecast"
        )
        self.assertEqual(lasertec_fy["location_model"], "page_table_row")
        self.assertEqual(lasertec_fy["pages"], [1])
        self.assertEqual(lasertec_fy["row"], "通期")
        kawasaki_fy = next(
            row for row in summary["results"] if row["issuer"] == "kawasaki_heavy" and row["selector"] == "full_year_forecast"
        )
        self.assertEqual(kawasaki_fy["accounting_basis"], "IFRS")
        screen = next(row for row in summary["results"] if row["issuer"] == "screen_holdings")
        self.assertFalse(screen["numeric_fact_allowed"])
        self.assertEqual(screen["measure_kind"], "review_only")

    def test_negative_fixtures_independent(self) -> None:
        results = run_negative_fixtures()
        self.assertEqual(
            {row["case"] for row in results},
            {
                "multiple_ambiguous_match",
                "missing_label",
                "missing_evidence",
                "unit_mismatch",
                "period_mismatch",
                "wrong_page",
                "wrong_section",
                "wrong_table",
                "wrong_row",
                "hash_mismatch",
                "scope_mismatch",
            },
        )

    def test_ordered_regex_is_not_required_for_lasertec_forecast(self) -> None:
        # Regression: PDF extract places 通期 before the section header.
        page = (
            "売上高 百万円\n通期 000\n1.2026年6月期の連結業績\n"
            "3.2027年6月期の連結業績予想(2026年7月1日~2027年6月30日)"
        )
        fixture = FIXTURES["lasertec"][1]
        self.assertEqual(validate_location([page], fixture), [1])
        with self.assertRaises(ValueError):
            validate_location(
                [page],
                SelectorFixture(
                    name="bad",
                    location_model="page_table_row",
                    section="2027年6月期の連結業績予想",
                    table="売上高",
                    row="通期",
                    unit="百万円",
                    period="2027年6月期",
                    measure_kind="company_forecast",
                    period_basis="full_year",
                    expected_pages=(2,),
                ),
            )


if __name__ == "__main__":
    unittest.main()
