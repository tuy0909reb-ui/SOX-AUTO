"""Acceptance checks for approved frozen 285A Batch 2 extraction."""
from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from run_financial_fact_batch2 import OUTPUT, run_once  # noqa: E402
from validate_financial_fact_pilot import validate_observation_document_traceability  # noqa: E402


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


class Batch2ExecutionTest(unittest.TestCase):
    def test_approved_285a_selectors_emit_two_additive_facts(self) -> None:
        summary = run_once()
        self.assertEqual(summary["events"], 1)
        self.assertEqual(summary["documents"], 1)
        self.assertEqual(summary["validated_selectors"], 2)
        self.assertEqual(summary["observations_generated"], 2)
        self.assertEqual(summary["financial_facts_generated"], 2)
        self.assertEqual(summary["reconciliation_rows"], 2)
        self.assertEqual(summary["failures"], 0)
        self.assertFalse(summary["gemini_used_as_input"])
        self.assertTrue(summary["execution_authorized_by_request"])
        self.assertFalse(summary["commit_authorized"])

        observations = load(OUTPUT / "financial_observation.jsonl")
        evidence = load(OUTPUT / "selector_evidence_location.jsonl")
        reconciliation = load(OUTPUT / "financial_observation_reconciliation.jsonl")
        self.assertEqual(len(observations), 2)
        self.assertEqual(len(evidence), 2)
        self.assertEqual(len(reconciliation), 2)

        emitted = {
            (row["measure_kind"], row["period_basis"]): (
                row["value_numeric"],
                row["fiscal_period_end"],
                row["source_page"],
            )
            for row in observations
        }
        self.assertEqual(
            emitted,
            {
                ("actual", "Q1_cumulative"): (1_767_117, "2026-06-30", 1),
                ("company_forecast", "Q2_cumulative"): (4_157_117, "2026-09-30", 2),
            },
        )
        self.assertTrue(all(row["source_document_id"] == "doc-f770b766ffff525fb1d4ac3879967278" for row in observations))
        self.assertTrue(all(row["unit_code"] == "JPY_million" for row in observations))
        self.assertTrue(all(row["accounting_standard"] == "IFRS" for row in observations))
        self.assertTrue(all(row["consolidation"] == "consolidated" for row in observations))
        self.assertTrue(all(not row["table_end_used"] for row in evidence))
        self.assertTrue(all(row["match_status"] == "official_only" for row in reconciliation))
        self.assertTrue(all(row["gemini_raw_row_id"] is None for row in reconciliation))
        validate_observation_document_traceability(
            OUTPUT,
            OUTPUT / "financial_observation.jsonl",
            OUTPUT / "financial_observation_source_link.jsonl",
            require_document_source_links=True,
        )


if __name__ == "__main__":
    unittest.main()
