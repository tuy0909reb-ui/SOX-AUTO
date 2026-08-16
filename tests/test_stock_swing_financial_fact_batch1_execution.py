"""Acceptance checks for the authorized frozen Batch 1 extraction."""
from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from run_financial_fact_batch1 import OUTPUT, run_once  # noqa: E402
from validate_financial_fact_pilot import validate_observation_document_traceability  # noqa: E402


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


class Batch1ExecutionTest(unittest.TestCase):
    def test_frozen_batch1_extracts_only_validated_numeric_selectors(self) -> None:
        summary = run_once()
        self.assertEqual(summary["documents"], 8)
        self.assertEqual(summary["events"], 8)
        self.assertEqual(summary["observations_generated"], 10)
        self.assertEqual(summary["financial_facts_generated"], 10)
        self.assertEqual(summary["review_only_numeric_facts"], 0)

        observations = load(OUTPUT / "financial_observation.jsonl")
        evidence = load(OUTPUT / "selector_evidence_location.jsonl")
        outcomes = load(OUTPUT / "document_outcome.jsonl")
        self.assertEqual(len(observations), 10)
        self.assertEqual(len(evidence), 10)
        self.assertEqual({row["security_id"] for row in observations} - {"4062", "5801", "5803", "6146", "6525", "6920", "7012"}, set())
        self.assertFalse(any(row["security_id"] == "7735" for row in observations))
        self.assertEqual(outcomes, [{
            "document_id": "doc-520d79d15d665c72ad87fd20f69b611e",
            "event_id": "official-event-bac0d4c94f1f5746aaacec4968d090a4",
            "outcome": "review_only_no_auto_merge",
            "quality_status": "confirmed",
        }])

        lasertec = next(row for row in evidence if row["document_id"] == "doc-150bfd73a7b85dbda7b054921cddcc1c" and row["row"] == "通期")
        self.assertEqual((lasertec["page"], lasertec["table"], lasertec["period_marker"]), (1, "売上高", "2027年6月期"))
        kawasaki = next(row for row in evidence if row["document_id"] == "doc-458f162127c354b9b8b80a5416d3fa54" and row["row"] == "通期")
        self.assertEqual((kawasaki["page"], kawasaki["table"], kawasaki["accounting_basis"]), (1, "売上収益", "IFRS"))
        self.assertTrue(all(row["source_unit_raw"] == "百万円" for row in observations))
        self.assertTrue(all(row["consolidation"] == "consolidated" for row in observations))
        self.assertTrue(all(row["quality_status"] == "confirmed" for row in observations))
        validate_observation_document_traceability(
            OUTPUT,
            OUTPUT / "financial_observation.jsonl",
            OUTPUT / "financial_observation_source_link.jsonl",
            require_document_source_links=True,
        )


if __name__ == "__main__":
    unittest.main()
