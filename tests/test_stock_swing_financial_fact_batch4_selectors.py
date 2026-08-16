"""Local fail-closed checks for Batch 4 selector design only."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch4_selectors import (  # noqa: E402
    SELECTORS,
    validate_batch4_selectors,
)


class Batch4SelectorValidationTest(unittest.TestCase):
    def test_three_document_bound_selectors_pass_without_fact_emission(self) -> None:
        summary = validate_batch4_selectors(write_log=False)

        self.assertEqual(summary["overall"], "PASS")
        self.assertEqual(summary["selector_count"], 3)
        self.assertEqual({row["event_id"] for row in summary["results"]}, {
            selector.event_id for selector in SELECTORS
        })
        self.assertTrue(all(row["implementation"] == "PASS" for row in summary["results"]))
        self.assertTrue(all(row["positive_validation"] == "PASS" for row in summary["results"]))
        self.assertTrue(all(row["location"]["numeric_value_read"] is False for row in summary["results"]))
        self.assertEqual(summary["observations_generated"], 0)
        self.assertEqual(summary["financial_facts_generated"], 0)
        self.assertFalse(summary["fact_scope_proposal_authorized"])
        self.assertFalse(summary["fact_extraction_authorized"])
        self.assertFalse(summary["event_sot_mutated"])
        self.assertFalse(summary["gemini_input"])

    def test_required_negative_cases_fail_closed_for_every_selector(self) -> None:
        summary = validate_batch4_selectors(write_log=False)
        required = {
            "period_mismatch",
            "row_mismatch",
            "document_mismatch",
            "candidate_multiple",
            "page1_false_positive",
            "forecast_exclusion",
            "actual_row_non_unique",
            "wrong_page",
        }

        self.assertEqual(
            {row["case"] for row in summary["negative_cases"]},
            required,
        )
        self.assertEqual(len(summary["negative_cases"]), len(SELECTORS) * len(required))
        self.assertTrue(
            all(row["result"] == "fail_closed" for row in summary["negative_cases"])
        )


if __name__ == "__main__":
    unittest.main()
