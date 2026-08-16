"""Acceptance checks for Architect-approved Batch 3 extraction."""
from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from run_financial_fact_batch3 import OUTPUT, run_once  # noqa: E402
from validate_financial_fact_pilot import validate_observation_document_traceability  # noqa: E402


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


class Batch3ExecutionTest(unittest.TestCase):
    def test_approved_selectors_emit_three_additive_observations(self) -> None:
        summary = run_once()
        self.assertEqual(summary["events"], 2)
        self.assertEqual(summary["documents"], 2)
        self.assertEqual(summary["validated_selectors"], 3)
        self.assertEqual(summary["observations_generated"], 3)
        self.assertEqual(summary["financial_facts_generated"], 3)
        self.assertEqual(summary["reconciliation_rows"], 3)
        self.assertEqual(summary["failures"], 0)
        self.assertFalse(summary["gemini_used_as_input"])
        self.assertFalse(summary["v002_mutated"])
        self.assertEqual(summary["revised_forecast_v002_relation"], "additive_non_merge")
        self.assertTrue(summary["execution_authorized_by_request"])
        self.assertFalse(summary["commit_authorized"])

        observations = load(OUTPUT / "financial_observation.jsonl")
        evidence = load(OUTPUT / "selector_evidence_location.jsonl")
        reconciliation = load(OUTPUT / "financial_observation_reconciliation.jsonl")
        self.assertEqual(len(observations), 3)
        self.assertEqual(len(evidence), 3)
        self.assertEqual(len(reconciliation), 3)
        self.assertEqual(
            {
                (row["security_id"], row["measure_kind"], row["period_basis"]): (
                    row["value_numeric"], row["fiscal_period_end"], row["source_page"]
                )
                for row in observations
            },
            {
                ("7011", "actual", "Q1_cumulative"): (1_194_203, "2026-06-30", 1),
                ("8035", "actual", "Q2_cumulative"): (1_121_626, "2024-09-30", 5),
                ("8035", "revised_forecast", "full_year"): (2_400_000, "2025-03-31", 5),
            },
        )
        revised = next(row for row in observations if row["measure_kind"] == "revised_forecast")
        self.assertEqual(revised["revision_relation"], "in_document")
        self.assertEqual(revised["guidance_status"], "revised")
        self.assertTrue(all(row["match_status"] == "official_only" for row in reconciliation))
        self.assertTrue(all(row["gemini_raw_row_id"] is None for row in reconciliation))
        self.assertTrue(all(not row["table_end_used"] for row in evidence))
        validate_observation_document_traceability(
            OUTPUT,
            OUTPUT / "financial_observation.jsonl",
            OUTPUT / "financial_observation_source_link.jsonl",
            require_document_source_links=True,
        )


if __name__ == "__main__":
    unittest.main()
