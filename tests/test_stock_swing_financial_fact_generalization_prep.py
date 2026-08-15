"""Pilot-preparation contracts for Financial Fact generalization."""
from __future__ import annotations

import hashlib
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
FACTS = PHASE_A / "facts"
SCHEMAS = PHASE_A / "schemas"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from financial_fact_contract import REVISION_DIRECTIONS, financial_fact_schemas  # noqa: E402
from prepare_financial_fact_pilot import inventory_rows  # noqa: E402
from validate_financial_fact_pilot import validate_observation_document_traceability  # noqa: E402


def load(name: str) -> list[dict]:
    return [
        json.loads(line) for line in (FACTS / name).read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


class FinancialFactGeneralizationPreparationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.contracts = financial_fact_schemas()
        cls.observations = load("financial_observation_sample.jsonl")
        cls.canonical_observations = load("financial_observation.jsonl")
        cls.sources = load("financial_observation_source_sample.jsonl")
        cls.inventory = load("financial_document_inventory.jsonl")
        cls.repairs = load("official_event_axis_repair.jsonl")
        cls.document_links = load("financial_document_link.jsonl")
        cls.observation_links = load("financial_observation_source_link.jsonl")
        cls.migrations = load("financial_observation_taxonomy_migration.jsonl")
        cls.official = load("official_earnings_event.jsonl")

    def test_canonical_schema_is_the_single_fact_contract(self) -> None:
        for name, contract in self.contracts.items():
            stored = json.loads((SCHEMAS / f"{name}.schema.json").read_text(encoding="utf-8"))
            self.assertEqual(stored, contract)
        self.assertFalse((SCHEMAS / "financial_observation_sample.schema.json").exists())
        observation_required = set(self.contracts["financial_observation"]["required"])
        self.assertTrue(all(set(row) == observation_required for row in self.observations))
        self.assertEqual(self.canonical_observations, self.observations)

    def test_event_and_financial_reconciliation_are_separate(self) -> None:
        self.assertTrue((FACTS / "event_reconciliation.jsonl").is_file())
        self.assertTrue((FACTS / "financial_observation_reconciliation.jsonl").is_file())
        schema = self.contracts["financial_observation_reconciliation"]
        required = set(schema["required"])
        fanout_rows = [
            {field: None for field in required},
            {field: None for field in required},
        ]
        for index, row in enumerate(fanout_rows):
            row.update({
                "reconciliation_id": f"fanout-{index}",
                "observation_id": f"observation-{index}",
                "event_id": "event-1",
                "gemini_raw_row_id": 99,
                "match_status": "candidate",
                "difference_note": "Fixture proves one raw row may link to N observations.",
            })
        self.assertEqual({row["gemini_raw_row_id"] for row in fanout_rows}, {99})
        self.assertEqual(len({row["observation_id"] for row in fanout_rows}), 2)

    def test_document_inventory_has_hashes_revision_and_date_only_time(self) -> None:
        self.assertEqual(len(self.inventory), 10)
        self.assertEqual(sum(row["document_type"] == "forecast_revision" for row in self.inventory), 1)
        for row in self.inventory:
            self.assertIn(row["document_type"], self.contracts["financial_document_inventory"]["properties"]["document_type"]["enum"])
            self.assertEqual(row["timestamp_quality"], "date_only")
            self.assertIsNone(row["publication_time"])
            snapshot = ROOT / row["local_snapshot_path"]
            self.assertEqual(hashlib.sha256(snapshot.read_bytes()).hexdigest(), row["content_hash"])

    def test_duplicate_document_detection_uses_content_hash(self) -> None:
        source = dict(self.sources[0])
        duplicate = dict(source)
        duplicate["source_document_id"] = "duplicate-document"
        duplicate["url"] = "https://example.invalid/mirror.pdf"
        event = next(row for row in self.official if row["event_id"] == source["event_id"])
        rows = inventory_rows([source, duplicate], {event["event_id"]: event})
        self.assertTrue(all(row["duplicate_group_id"] for row in rows))
        self.assertEqual(rows[0]["duplicate_group_id"], rows[1]["duplicate_group_id"])

    def test_observation_has_document_as_of_and_table_evidence(self) -> None:
        for row in self.observations:
            self.assertEqual(row["as_of_date"], row["document_publication_date"])
            self.assertIsNone(row["as_of_timestamp"])
            self.assertEqual(row["document_timestamp_quality"], "date_only")
            self.assertGreaterEqual(row["source_page"], 1)
            self.assertTrue(row["source_table"])
            self.assertIn(row["consolidation_evidence_text"], {"連結", "unknown"})
            self.assertIn(row["accounting_standard_evidence_text"], {"IFRS", "日本基準", "米国基準", "unknown"})
        self.assertEqual(len(self.observation_links), len(self.canonical_observations))
        inventory_documents = {row["document_id"] for row in self.inventory}
        self.assertTrue(all(row["document_id"] in inventory_documents for row in self.observation_links))
        self.assertEqual({row["link_type"] for row in self.document_links}, {"companion_revision_of", "review_completion_of"})

    def test_revision_mixed_is_canonical_and_event_null_is_preserved(self) -> None:
        self.assertEqual(REVISION_DIRECTIONS, ("up", "down", "unchanged", "mixed", "unknown"))
        self.assertEqual(self.migrations, [])
        repair = next(row for row in self.repairs if row["field_name"] == "fiscal_period_end")
        self.assertEqual(repair["repaired_value"], "2025-03-31")
        self.assertEqual(repair["repair_method"], "official_pdf_covered_period_v1")
        known_null = next(
            row for row in self.official
            if row["event_id"] == "official-event-7d68553c9dc55def9581a5b845e6555f"
        )
        self.assertIsNone(known_null["fiscal_period_end"])

    def test_pilot_taxonomy_extensions_are_backward_compatible(self) -> None:
        observation_schema = self.contracts["financial_observation"]
        for field in ("forecast_scope", "guidance_status", "revision_relation"):
            self.assertIn(field, observation_schema["properties"])
        self.assertIn("management_target", observation_schema["properties"]["measure_kind"]["enum"])
        self.assertIn("review_value", observation_schema["properties"]["measure_kind"]["enum"])
        # Existing V002 rows stay immutable evidence; reclassification needs a migration record.
        self.assertTrue(all(row["measure_kind"] != "management_target" for row in self.canonical_observations))

    def test_no_canonical_observation_is_isolated_from_document_evidence(self) -> None:
        validate_observation_document_traceability(FACTS)

    def test_immutable_gemini_and_existing_snapshots_are_preserved(self) -> None:
        self.assertEqual(hashlib.sha256(LEDGER.read_bytes()).hexdigest(), EXPECTED_LEDGER_SHA)
        for source in self.sources:
            snapshot = ROOT / source["local_snapshot_path"]
            self.assertTrue(snapshot.is_file())
            self.assertEqual(hashlib.sha256(snapshot.read_bytes()).hexdigest(), source["content_hash"])


if __name__ == "__main__":
    unittest.main()
