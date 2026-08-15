"""Regression guardrails for the deliberately limited Financial Fact sample."""
from __future__ import annotations

import hashlib
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
FACTS = PHASE_A / "facts"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
PERIOD_BASIS = {
    "Q1_standalone", "Q2_standalone", "Q3_standalone",
    "Q1_cumulative", "Q2_cumulative", "Q3_cumulative",
    "full_year", "forecast_only", "revision_only", "other", "unknown",
}


def load(name: str) -> list[dict]:
    return [
        json.loads(line) for line in (FACTS / name).read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


class FinancialFactSampleTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.observations = load("financial_observation_sample.jsonl")
        cls.sources = load("financial_observation_source_sample.jsonl")
        cls.reconciliation = load("financial_observation_reconciliation_sample.jsonl")
        cls.revisions = load("guidance_revision_observation_sample.jsonl")
        cls.official = load("official_earnings_event.jsonl")

    def test_immutable_inputs_and_official_population_preserved(self) -> None:
        self.assertEqual(hashlib.sha256(LEDGER.read_bytes()).hexdigest(), EXPECTED_LEDGER_SHA)
        self.assertEqual(len(self.official), 345)
        self.assertEqual(len({row["event_id"] for row in self.official}), 345)

    def test_sample_is_limited_and_has_one_or_more_actuals_per_security(self) -> None:
        self.assertEqual({row["security_id"] for row in self.observations}, {"6857", "8035", "285A", "3436", "7011", "8306"})
        self.assertEqual(len({row["event_id"] for row in self.observations}), 7)
        self.assertLessEqual(len({row["event_id"] for row in self.observations}), 12)
        self.assertEqual(
            {row["security_id"] for row in self.observations if row["measure_kind"] == "actual"},
            {"6857", "8035", "285A", "3436", "7011", "8306"},
        )

    def test_required_provenance_is_traceable_and_source_bytes_are_hashed(self) -> None:
        required = {
            "source_id", "provider", "url", "retrieved_at", "content_hash",
            "source_priority", "document_type", "local_snapshot_path",
        }
        for source in self.sources:
            self.assertTrue(required <= source.keys())
            self.assertEqual(len(source["content_hash"]), 64)
            self.assertIn(source["document_type"], {"earnings_release", "forecast_revision"})
            snapshot = ROOT / source["local_snapshot_path"]
            self.assertTrue(snapshot.is_file())
            self.assertEqual(
                hashlib.sha256(snapshot.read_bytes()).hexdigest(),
                source["content_hash"],
            )
            self.assertEqual(len(source["pdf_text_sha256"]), 64)
        source_ids = {row["source_id"] for row in self.sources}
        self.assertTrue(all(row["source_id"] in source_ids for row in self.observations))
        self.assertEqual(len({row["observation_id"] for row in self.observations}), len(self.observations))

    def test_release_revision_and_review_documents_remain_distinct(self) -> None:
        revision = next(row for row in self.sources if row["document_type"] == "forecast_revision")
        release = next(row for row in self.sources if row["event_id"] == revision["event_id"] and row["document_type"] == "earnings_release")
        self.assertNotEqual(revision["source_document_id"], release["source_document_id"])
        self.assertEqual(revision["event_id"], release["event_id"])
        review = next(row for row in self.sources if row["observation_policy"] == "review_only_no_auto_merge")
        self.assertFalse(any(row["event_id"] == review["event_id"] for row in self.observations))

    def test_only_evidence_backed_revision_has_prior_and_revised_links(self) -> None:
        self.assertEqual(len(self.revisions), 5)
        for revision in self.revisions:
            self.assertEqual(revision["event_id"], "official-event-a070ef6d36cb5a3eb162648400b027c7")
            self.assertEqual(revision["direction_normalized"], "up")
            self.assertNotEqual(
                revision["prior_forecast_observation_id"],
                revision["revised_forecast_observation_id"],
            )

    def test_period_basis_uses_source_shape_not_full_year_default(self) -> None:
        self.assertTrue(all(row["period_basis"] in PERIOD_BASIS for row in self.observations))
        sumco_forecasts = [
            row for row in self.observations
            if row["security_id"] == "3436" and row["measure_kind"] == "company_forecast"
        ]
        self.assertTrue(sumco_forecasts)
        self.assertEqual({row["period_basis"] for row in sumco_forecasts}, {"Q3_cumulative"})
        deferred = next(row for row in self.sources if row["observation_policy"] == "deferred_outlook_no_company_forecast")
        self.assertFalse(any(row["event_id"] == deferred["event_id"] and row["measure_kind"] == "company_forecast" for row in self.observations))

    def test_mufg_target_is_not_company_forecast(self) -> None:
        targets = [row for row in self.observations if row["security_id"] == "8306" and row["metric_name"] == "net_income_target"]
        self.assertEqual(len(targets), 1)
        self.assertEqual(targets[0]["measure_kind"], "other")
        self.assertEqual(targets[0]["quality_status"], "not_company_forecast")
        self.assertEqual(targets[0]["raw_value_text"], "27,000 億円")
        self.assertEqual(targets[0]["unit_code"], "JPY_million")
        self.assertEqual(targets[0]["value_numeric"], 2700000)
        self.assertEqual(targets[0]["value_conversion_rule_id"], "JPY_oku_to_million_v1")

    def test_fiscal_and_as_of_fields_never_invent_intraday_values(self) -> None:
        official_by_id = {row["event_id"]: row for row in self.official}
        for row in self.observations:
            self.assertEqual(
                row["event_fiscal_period_end"],
                official_by_id[row["event_id"]]["fiscal_period_end"],
            )
            if row["measure_kind"] == "actual":
                self.assertEqual(row["fiscal_period_end"], row["event_fiscal_period_end"])
            self.assertIsNone(row["as_of_timestamp"])
            self.assertEqual(row["as_of_date"], official_by_id[row["event_id"]]["announcement_date"])
        self.assertEqual({
            row["fiscal_period_end"] for row in self.observations
            if row["security_id"] == "3436" and row["measure_kind"] == "company_forecast"
        }, {"2026-09-30"})

    def test_financial_reconciliation_is_separate_and_never_parses_gemini(self) -> None:
        self.assertEqual(len(self.reconciliation), len(self.observations))
        self.assertTrue(all(row["match_status"] == "official_only" for row in self.reconciliation))
        self.assertTrue(all(
            row["gemini_raw_row_id"] is None and row["gemini_value_text"] is None
            for row in self.reconciliation
        ))

    def test_local_pdf_extraction_metadata_and_special_cases_are_explicit(self) -> None:
        self.assertTrue(all(
            row["extraction_method"] == "local_pdf_text_template_v1"
            and len(row["value_conversion_rule_id"]) > 0
            and row["source_page"] >= 1
            for row in self.observations
        ))
        deferred_actuals = [
            row for row in self.observations
            if row["event_id"] == "official-event-ed132c223977592c8cbfdd61e2f599f0"
        ]
        self.assertEqual(len(deferred_actuals), 5)
        self.assertTrue(all(row["measure_kind"] == "actual" for row in deferred_actuals))


if __name__ == "__main__":
    unittest.main()
