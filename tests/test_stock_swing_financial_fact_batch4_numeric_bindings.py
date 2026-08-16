"""Local fail-closed checks for Batch 4 numeric binding only."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch4_numeric_bindings import (  # noqa: E402
    BINDINGS,
    EXPECTED_SCOPE_SHA,
    validate_batch4_numeric_bindings,
)


class Batch4NumericBindingTest(unittest.TestCase):
    def test_three_revenue_bindings_pass_without_fact_emission(self) -> None:
        summary = validate_batch4_numeric_bindings(write_log=False)

        self.assertEqual(summary["overall"], "PASS")
        self.assertEqual(summary["scope_sha256"], EXPECTED_SCOPE_SHA)
        self.assertEqual(summary["binding_count"], 3)
        self.assertEqual(
            {row["event_id"] for row in summary["results"]},
            {binding.event_id for binding in BINDINGS},
        )
        self.assertTrue(all(row["implementation"] == "PASS" for row in summary["results"]))
        self.assertTrue(
            all(
                row["numeric_binding"]["revenue_column_index"] == 0
                and row["numeric_binding"]["candidate_count"] == 1
                and row["numeric_binding"]["numeric_binding_only"] is True
                for row in summary["results"]
            )
        )
        self.assertEqual(summary["observations_generated"], 0)
        self.assertEqual(summary["financial_facts_generated"], 0)
        self.assertFalse(summary["fact_extraction_authorized"])
        self.assertFalse(summary["event_sot_mutated"])
        self.assertFalse(summary["gemini_input"])

    def test_required_numeric_negative_cases_fail_closed(self) -> None:
        summary = validate_batch4_numeric_bindings(write_log=False)
        required = {
            "wrong_column",
            "prior_year_row",
            "forecast_row",
            "duplicate_numeric_candidate",
            "period_mismatch",
            "actual_row_mismatch",
            "document_mismatch",
            "malformed_numeric_candidate",
        }
        self.assertEqual({row["case"] for row in summary["negative_cases"]}, required)
        self.assertEqual(len(summary["negative_cases"]), len(BINDINGS) * len(required))
        self.assertTrue(
            all(row["result"] == "fail_closed" for row in summary["negative_cases"])
        )


if __name__ == "__main__":
    unittest.main()
