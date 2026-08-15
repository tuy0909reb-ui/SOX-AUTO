"""Identity-resolution guardrails for the Fact-only reconciliation pass."""
from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))
import improve_earnings_reconciliation as reconciliation  # noqa: E402


class EarningsReconciliationQualityTest(unittest.TestCase):
    def test_normalizes_only_explicit_gemini_basis(self) -> None:
        basis, _, reason = reconciliation.normalize_gemini_basis({
            "四半期区分": "Q2",
            "対象会計期間": "2024/04/01～2024/09/30 (2025年3月期第2四半期累計)",
        })
        self.assertEqual(basis, "Q2_cumulative")
        self.assertEqual(reason, "explicit cumulative label")
        ambiguous, _, _ = reconciliation.normalize_gemini_basis({
            "四半期区分": "Q1",
            "対象会計期間": "2024/04/01～2024/06/30",
        })
        self.assertEqual(ambiguous, "unknown")

    def test_uses_composite_identity_not_date_only(self) -> None:
        event = {
            "event_id": "official-1",
            "security_id": "5803",
            "announcement_date": "2024-08-08",
            "fiscal_period_end": "2024-06-30",
            "period_basis": "Q1_cumulative",
            "timestamp_quality": "date_only",
        }
        raw = {
            "raw_row_id": 1,
            "security_id": "5803",
            "announcement_date": "2024-08-08",
            "fiscal_period_end": "2024-06-30",
            "period_basis": "unknown",
            "scope_status": "in_scope",
            "document_id": None,
        }
        with tempfile.TemporaryDirectory() as temp:
            with mock.patch.object(reconciliation, "PHASE_A", Path(temp)):
                rows = reconciliation.reconcile([raw], [event])
        self.assertEqual(rows[0]["match_status"], "gemini_only")
        self.assertEqual(rows[1]["match_status"], "official_only")

    def test_document_identity_groups_multiple_provenance_rows(self) -> None:
        event = {
            "event_id": "official-1",
            "security_id": "6857",
            "announcement_date": "2020-04-24",
            "fiscal_period_end": "2020-03-31",
            "period_basis": "full_year",
            "timestamp_quality": "date_only",
        }
        raw = {
            "raw_row_id": 4,
            "security_id": "6857",
            "announcement_date": "2020-04-24",
            "fiscal_period_end": "2020-06-30",
            "period_basis": "forecast_only",
            "scope_status": "in_scope",
            "document_id": "140120200407490530",
        }
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            facts = root / "facts"
            facts.mkdir()
            documents = [
                {"event_id": "official-1", "url": f"https://www2.jpx.co.jp/disc/68570/{raw['document_id']}.pdf"},
                {"event_id": "official-1", "url": f"https://irbank.net/6857/{raw['document_id']}"},
            ]
            (facts / "earnings_event_document.jsonl").write_text(
                "\n".join(__import__("json").dumps(item) for item in documents) + "\n",
                encoding="utf-8",
            )
            with mock.patch.object(reconciliation, "PHASE_A", root):
                rows = reconciliation.reconcile([raw], [event])
        self.assertEqual(rows[0]["match_status"], "candidate")
        self.assertIn("forecast", rows[0]["resolution_reason"])

    def test_preserves_event_id_when_date_is_corrected(self) -> None:
        event = {
            "event_id": "stable-event-id",
            "security_id": "5803",
            "announcement_date": "2020-04-01",
            "announcement_time": None,
            "timestamp_quality": "date_only",
            "period_basis": "full_year",
        }
        document = {
            "event_id": "stable-event-id",
            "url": "https://irbank.net/5803/140120200401488523",
        }
        with mock.patch.object(
            reconciliation, "fetch_detail_date", return_value=("2020-06-10", "2020年6月10日 15時00分")
        ):
            events, resolutions = reconciliation.enrich_event_dates(
                [event], [document], fetch_dates=True
            )
        self.assertEqual(events[0]["event_id"], "stable-event-id")
        self.assertEqual(events[0]["announcement_date"], "2020-06-10")
        self.assertIsNone(events[0]["announcement_time"])
        self.assertEqual(events[0]["timestamp_quality"], "date_only")
        self.assertTrue(resolutions[0]["event_id_preserved"])


if __name__ == "__main__":
    unittest.main()
