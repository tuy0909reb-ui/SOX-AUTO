"""Execution checks for the authorized frozen Batch 4 Fact scope."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from run_financial_fact_batch4 import run_once  # noqa: E402


class Batch4ExtractionExecutionTest(unittest.TestCase):
    def test_frozen_scope_emits_only_three_authorized_actual_revenue_facts(self) -> None:
        summary = run_once()

        self.assertEqual(summary["scope_sha_status"], "UNCHANGED")
        self.assertEqual(summary["document_hash_status"], "PASS")
        self.assertEqual(summary["event_identity_status"], "PASS")
        self.assertEqual(summary["selector_status"], "PASS")
        self.assertEqual(summary["numeric_binding_status"], "PASS")
        self.assertEqual(summary["events"], 3)
        self.assertEqual(summary["documents"], 3)
        self.assertEqual(summary["observations_generated"], 3)
        self.assertEqual(summary["financial_facts_generated"], 3)
        self.assertEqual(summary["reconciliation_rows"], 3)
        self.assertFalse(summary["gemini_used_as_input"])
        self.assertFalse(summary["v002_mutated"])
        self.assertFalse(summary["event_sot_mutated"])
        self.assertFalse(summary["acceptance_authorized"])
        self.assertFalse(summary["commit_authorized"])


if __name__ == "__main__":
    unittest.main()
