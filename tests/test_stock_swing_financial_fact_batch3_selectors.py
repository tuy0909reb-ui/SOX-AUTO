"""Acceptance checks for frozen Batch 3 selector validation only."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch3_selectors import (  # noqa: E402
    EXPECTED_SCOPE_SHA,
    SELECTORS,
    validate_batch3_selectors,
)


class Batch3SelectorValidationTest(unittest.TestCase):
    def test_all_frozen_selectors_pass_without_fact_emission(self) -> None:
        summary = validate_batch3_selectors()
        self.assertEqual(summary["scope_status"], "FROZEN")
        self.assertEqual(summary["scope_sha256"], EXPECTED_SCOPE_SHA)
        self.assertEqual(summary["baseline"], "PASS")
        self.assertEqual(summary["pdf"], "PASS")
        # Architect approval authorizes extraction, not Fact acceptance.
        self.assertEqual(summary["overall"], "PASS")
        self.assertTrue(summary["cursor_review_recorded"])
        self.assertEqual(
            summary["cursor_review_verdict"],
            "RECORDED",
        )
        self.assertTrue(summary["architect_validation_pass"])
        self.assertEqual(
            summary["revision_semantics"]["result"], "VERIFIED_NON_EQUIVALENT_NO_MERGE"
        )
        self.assertFalse(summary["revision_semantics"]["merge_replace_alias"])
        self.assertEqual(set(summary["selectors"]), {selector.selector_id for selector in SELECTORS})
        self.assertTrue(
            all(row["implementation"] == "PASS" for row in summary["selectors"].values())
        )
        self.assertTrue(
            all(row["positive_validation"] == "PASS" for row in summary["selectors"].values())
        )
        self.assertTrue(
            all(row["negative_validation"] == "PASS" for row in summary["selectors"].values())
        )
        self.assertTrue(all(row["column_evidence"]["table_end_used"] is False for row in summary["results"]))
        self.assertEqual(summary["observations_generated"], 0)
        self.assertEqual(summary["financial_facts_generated"], 0)
        self.assertFalse(summary["execution_authorized"])
        self.assertFalse(summary["commit_authorized"])

    def test_all_required_negative_cases_fail_closed(self) -> None:
        summary = validate_batch3_selectors()
        expected = {
            "multiple_match", "missing_evidence", "missing_label", "wrong_page",
            "wrong_section", "wrong_row", "wrong_period", "wrong_unit",
            "wrong_accounting_basis", "actual_forecast_ambiguity",
            "original_revision_ambiguity", "ifrs_non_gaap_ambiguity",
            "multiple_numeric_candidates", "table_end_dependency",
            "scope_mismatch", "hash_mismatch", "blank_cover_candidate",
            "oku_yen_candidate", "increase_decrease_candidate", "multiple_section",
        }
        self.assertEqual({row["case"] for row in summary["negative_cases"]}, expected)
        self.assertEqual(
            len(summary["negative_cases"]),
            (len(expected) - 1) * len(SELECTORS) + 2,
        )
        self.assertTrue(all(row["result"] == "fail_closed" for row in summary["negative_cases"]))


if __name__ == "__main__":
    unittest.main()
