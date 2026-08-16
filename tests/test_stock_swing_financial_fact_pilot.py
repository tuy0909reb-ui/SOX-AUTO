"""Acceptance checks for the fixed five-case Financial Fact Pilot."""
from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
PILOT = FACTS / "financial_fact_pilot_001"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from run_financial_fact_pilot import (  # noqa: E402
    adapter_for_document,
    document_adapters,
    normalize_unit,
    normalized_pages,
    observation,
)
from validate_financial_fact_pilot import validate_observation_document_traceability  # noqa: E402
from validate_financial_fact_batch1_adapter_coverage import registry as batch1_registry  # noqa: E402


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


class FinancialFactPilotTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.scope = json.loads((FACTS / "financial_fact_pilot_scope.json").read_text(encoding="utf-8"))
        cls.inventory = {row["document_id"]: row for row in load(FACTS / "financial_document_inventory.jsonl")}
        cls.observations = load(PILOT / "financial_observation.jsonl")
        cls.links = load(PILOT / "financial_observation_source_link.jsonl")
        cls.outcomes = load(PILOT / "document_outcome.jsonl")
        cls.guidance = load(FACTS / "financial_guidance_status.jsonl")
        cls.repair_evidence = load(PILOT / "official_event_axis_repair_evidence.jsonl")
        cls.reconciliation = load(PILOT / "financial_observation_reconciliation.jsonl")

    def test_fixed_boundary_and_adapter_separation(self) -> None:
        self.assertEqual(len(document_adapters()), 7)
        self.assertTrue(self.scope["fan_out_forbidden"])
        self.assertTrue(self.scope["full_collection_forbidden"])
        self.assertTrue(all(row["event_id"] in self.scope["event_ids"] for row in self.observations))
        scoped = [row for row in self.inventory.values() if row["url"] in self.scope["document_urls"]]
        self.assertEqual(len(scoped), 7)
        self.assertTrue(all(row.get("document_role") and row.get("observation_policy") and row.get("issuer") for row in scoped))

    def test_observation_document_source_snapshot_traceability(self) -> None:
        validate_observation_document_traceability(
            FACTS,
            PILOT / "financial_observation.jsonl",
            PILOT / "financial_observation_source_link.jsonl",
            require_document_source_links=True,
        )
        primary = {row["observation_id"]: row for row in self.links}
        self.assertEqual(set(primary), {row["observation_id"] for row in self.observations})
        for observation in self.observations:
            link = primary[observation["observation_id"]]
            document = self.inventory[link["document_id"]]
            self.assertEqual(link["source_id"], observation["source_id"])
            self.assertEqual(document["event_id"], observation["event_id"])
            snapshot = ROOT / document["local_snapshot_path"]
            self.assertTrue(snapshot.is_file())
            self.assertEqual(hashlib.sha256(snapshot.read_bytes()).hexdigest(), document["content_hash"])
            self.assertTrue(link["evidence_text"])

    def test_taxonomy_and_guidance_are_source_proved(self) -> None:
        kinds = {row["measure_kind"] for row in self.observations}
        self.assertEqual(kinds, {"actual", "company_forecast", "prior_forecast", "revised_forecast", "management_target"})
        target = next(row for row in self.observations if row["measure_kind"] == "management_target")
        self.assertEqual((target["value_numeric"], target["source_unit_raw"], target["value_conversion_rule_id"]), (2700000, "億円", "JPY_oku_to_million_v1"))
        next_quarter = next(row for row in self.observations if row["forecast_scope"] == "next_quarter")
        self.assertEqual((next_quarter["measure_kind"], next_quarter["period_basis"]), ("company_forecast", "Q3_cumulative"))
        revisions = [row for row in self.observations if row["revision_relation"] == "companion_document"]
        self.assertEqual({row["measure_kind"] for row in revisions}, {"prior_forecast", "revised_forecast"})
        h1 = next(row for row in self.observations if row["security_id"] == "8035" and row["measure_kind"] == "company_forecast")
        self.assertEqual((h1["period_basis"], h1["forecast_scope"]), ("Q2_cumulative", "interim"))
        self.assertEqual("deferred", self.guidance[0]["guidance_status"])
        newly_disclosed = next(row for row in self.observations if row["security_id"] == "3436" and row["measure_kind"] == "company_forecast")
        self.assertEqual(newly_disclosed["revision_relation"], "newly_disclosed")
        self.assertIn("review_only_no_auto_merge", {row["outcome"] for row in self.outcomes})

    def test_7011_repair_stays_additive_and_reconciliation_is_separate(self) -> None:
        repairs = load(FACTS / "official_event_axis_repair.jsonl")
        repair = next(row for row in repairs if row["event_id"] == "official-event-7d68553c9dc55def9581a5b845e6555f")
        self.assertEqual(repair["repaired_value"], "2025-03-31")
        event = next(row for row in load(FACTS / "official_earnings_event.jsonl") if row["event_id"] == repair["event_id"])
        self.assertIsNone(event["fiscal_period_end"])
        self.assertEqual(self.repair_evidence[0]["repair_id"], repair["repair_id"])
        self.assertIn(self.repair_evidence[0]["document_id"], self.inventory)
        self.assertEqual(self.repair_evidence[0]["source_id"], repair["repair_source_id"])
        self.assertTrue(all(row["match_status"] == "official_only" for row in self.reconciliation))
        self.assertTrue(all(row["gemini_raw_row_id"] is None for row in self.reconciliation))
        self.assertEqual(hashlib.sha256(LEDGER.read_bytes()).hexdigest(), EXPECTED_LEDGER_SHA)

    def test_negative_inputs_fail_closed(self) -> None:
        registry = {
            (adapter.issuer, adapter.document_type, adapter.document_role, adapter.observation_policy): adapter
            for adapter in document_adapters()
        }
        document = next(row for row in self.inventory.values() if row["security_id"] == "3436")
        with self.assertRaisesRegex(ValueError, "No Inventory-selected adapter"):
            adapter_for_document({**document, "document_role": "unknown"}, registry)
        with self.assertRaisesRegex(ValueError, "unit_unverified"):
            normalize_unit("1", "unknown")
        adapter = next(adapter for adapter in document_adapters() if adapter.issuer == "sumco")
        selector = replace(adapter.selectors[0], period_basis="unknown_period")
        event = next(row for row in load(FACTS / "official_earnings_event.jsonl") if row["event_id"] == document["event_id"])
        with self.assertRaisesRegex(ValueError, "unknown period_basis"):
            observation(document, event, selector, normalized_pages(ROOT / document["local_snapshot_path"]), adapter)
        with tempfile.TemporaryDirectory() as temporary:
            temp = Path(temporary)
            (temp / "financial_document_inventory.jsonl").write_text(
                (FACTS / "financial_document_inventory.jsonl").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            (temp / "financial_observation.jsonl").write_text(
                (PILOT / "financial_observation.jsonl").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            (temp / "financial_observation_source_link.jsonl").write_text(
                (PILOT / "financial_observation_source_link.jsonl").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ValueError, "document/source relation is absent"):
                validate_observation_document_traceability(temp, require_document_source_links=True)

    def test_batch1_frozen_profiles_are_coverage_dispatchable_only(self) -> None:
        scope = json.loads((FACTS / "financial_fact_fanout_batch1_scope.json").read_text(encoding="utf-8"))
        legacy = FACTS / "financial_fact_batch1_scope.json"
        self.assertEqual(
            hashlib.sha256((FACTS / "financial_fact_fanout_batch1_scope.json").read_bytes()).hexdigest(),
            hashlib.sha256(legacy.read_bytes()).hexdigest(),
        )
        for document in scope["documents"]:
            adapter = adapter_for_document(document, batch1_registry())
            self.assertEqual(adapter.selectors, ())
        with self.assertRaisesRegex(ValueError, "No Inventory-selected adapter"):
            adapter_for_document({**scope["documents"][0], "document_type": "unsupported"}, batch1_registry())
            (temp / "financial_document_source_link.jsonl").write_text(
                (FACTS / "financial_document_source_link.jsonl").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            inventory = load(temp / "financial_document_inventory.jsonl")
            pilot_document_ids = {row["source_document_id"] for row in self.observations}
            for row in inventory:
                if row["document_id"] in pilot_document_ids:
                    row["content_hash"] = "0" * 64
                    break
            (temp / "financial_document_inventory.jsonl").write_text(
                "".join(json.dumps(row) + "\n" for row in inventory), encoding="utf-8"
            )
            with self.assertRaisesRegex(ValueError, "hash mismatch"):
                validate_observation_document_traceability(temp, require_document_source_links=True)
            (temp / "financial_document_inventory.jsonl").write_text(
                (FACTS / "financial_document_inventory.jsonl").read_text(encoding="utf-8"),
                encoding="utf-8",
            )
            (temp / "financial_observation_source_link.jsonl").write_text("", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "exactly one primary"):
                validate_observation_document_traceability(temp, require_document_source_links=True)


if __name__ == "__main__":
    unittest.main()
