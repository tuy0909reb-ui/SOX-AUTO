"""Validation checks for frozen 285A Batch 2 selectors; no Fact generation."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch2_selectors import (  # noqa: E402
    EXPECTED_DOCUMENT_ID,
    EXPECTED_PDF_SHA,
    EXPECTED_SCOPE_SHA,
    validate_batch2_selectors,
)


EXPECTED_NEGATIVE_CASES = {
    "wrong_section",
    "multiple_section",
    "missing_header_map",
    "ifrs_non_gaap_ambiguity",
    "wrong_period_row",
    "multiple_period_rows",
    "wrong_column",
    "multiple_amount_candidates",
    "missing_amount",
    "missing_percentage",
    "amount_percent_row_mismatch",
    "unit_mismatch",
    "period_mismatch",
    "wrong_page",
    "scope_mismatch",
    "hash_mismatch",
    "table_end_not_used_as_proof",
    "non_gaap_amount_not_ifrs",
    "no_oku_yen_conversion",
    "substring_only_forbidden",
}


class Batch2SelectorValidationTest(unittest.TestCase):
    def test_frozen_285a_selectors_pass_without_generating_facts(self) -> None:
        summary = validate_batch2_selectors()

        self.assertEqual(summary["overall"], "PASS")
        self.assertEqual(summary["selector_a_implementation"], "PASS")
        self.assertEqual(summary["selector_a_positive_validation"], "PASS")
        self.assertEqual(summary["selector_a_negative_validation"], "PASS")
        self.assertEqual(summary["selector_b"], "RUN")
        self.assertEqual(summary["selector_b_status"], "PASS")
        self.assertEqual(summary["scope"]["scope_sha_status"], "UNCHANGED")
        self.assertEqual(summary["scope"]["scope_sha256"], EXPECTED_SCOPE_SHA)
        self.assertEqual(summary["scope"]["candidate_document_id"], EXPECTED_DOCUMENT_ID)
        self.assertEqual(summary["scope"]["pdf_hash_status"], "PASS")
        self.assertEqual(summary["scope"]["pdf_sha256"], EXPECTED_PDF_SHA)
        self.assertEqual(summary["observations_generated"], 0)
        self.assertEqual(summary["financial_facts_generated"], 0)
        self.assertFalse(summary["execution_authorized"])
        self.assertFalse(summary["commit_authorized"])

        actual, forecast = summary["results"]
        self.assertEqual(
            (actual["page"], actual["measure_kind"], actual["period_basis"], actual["matched_value_text"]),
            (1, "actual", "Q1_cumulative", "1,767,117 百万円"),
        )
        self.assertFalse(actual["column_evidence"]["table_end_used"])
        self.assertEqual(
            (forecast["page"], forecast["measure_kind"], forecast["period_basis"], forecast["matched_value_text"]),
            (2, "company_forecast", "Q2_cumulative", "4,157,117 百万円"),
        )
        self.assertFalse(forecast["column_evidence"]["table_end_used"])

    def test_negative_cases_fail_closed(self) -> None:
        summary = validate_batch2_selectors()
        cases = summary["negative_cases"]
        # Selector A and Selector B each contribute one full negative suite.
        self.assertEqual(len(cases), len(EXPECTED_NEGATIVE_CASES) * 2)
        self.assertEqual({row["case"] for row in cases}, EXPECTED_NEGATIVE_CASES)
        self.assertTrue(all(row["result"] == "fail_closed" for row in cases))


if __name__ == "__main__":
    unittest.main()
