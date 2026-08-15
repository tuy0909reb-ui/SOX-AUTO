"""Official earnings-event Fact collection guardrails."""
from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = ROOT / "scripts" / "stock_swing"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"

import sys

sys.path.insert(0, str(SCRIPT_DIR))
import collect_official_earnings_events as collector  # noqa: E402


FIXTURE_TDNET = """
<html><body>
<a title="2024年3月期第1四半期決算短信〔日本基準〕(連結)" href="/5803/140120230809538873">8/10</a>
<a title="2024年3月期第2四半期決算短信〔日本基準〕(連結)" href="/5803/140120231107581045">11/8</a>
<a title="2024年3月期第3四半期決算短信〔日本基準〕(連結)" href="/5803/140120230208503478">2/9</a>
<a title="2024年3月期決算短信〔日本基準〕(連結)" href="/5803/140120230511567157">5/12</a>
<a title="自己株式の取得に関するお知らせ" href="/5803/140120230511999999">5/12</a>
</body></html>
"""

FIXTURE_STOCK = """
<html><body>
<a title="適時開示（TDNET）" href="/E01334/tdnet">適時</a>
<a title="5803 フジクラ | 2024年3月期決算短信〔日本基準〕(連結)（2023/05/12 15:00提出）" href="/5803/140120230511567157">x</a>
</body></html>
"""


class OfficialEarningsCollectorTest(unittest.TestCase):
    def test_ledger_sha_constant(self) -> None:
        self.assertEqual(hashlib.sha256(LEDGER.read_bytes()).hexdigest(), EXPECTED_SHA)

    def test_parse_tanshin_only(self) -> None:
        rows = collector.parse_tanshin_from_tdnet(FIXTURE_TDNET, "5803")
        self.assertEqual(len(rows), 4)
        self.assertTrue(all("決算短信" in row["title"] for row in rows))
        full = next(row for row in rows if row["period_basis"] == "full_year")
        self.assertEqual(full["fiscal_period_end"], "2024-03-31")
        self.assertEqual(full["accounting_standard"], "JGAAP")
        self.assertEqual(full["consolidation"], "consolidated")

    def test_does_not_mark_secondary_time_as_datetime_confirmed(self) -> None:
        with mock.patch.object(collector, "fetch", side_effect=[FIXTURE_STOCK, FIXTURE_TDNET]):
            with mock.patch.object(collector, "head_ok", return_value=False):
                result = collector.collect_security("5803", as_of="2026-08-15", verify_jpx=False)
        self.assertGreaterEqual(len(result["events"]), 1)
        for event in result["events"]:
            self.assertNotEqual(event["timestamp_quality"], "datetime_confirmed")
            self.assertIsNone(event["announcement_time"])
            self.assertEqual(event["timestamp_quality"], "date_only")

    def test_reconciliation_forbids_date_only_match(self) -> None:
        official = [{
            "event_id": "o1",
            "security_id": "6857",
            "announcement_date": "2020-04-24",
            "fiscal_period_end": "2020-03-31",
            "period_basis": "full_year",
            "title": "x",
        }]
        phase_a = [{
            "raw_row_id": 3,
            "security_id": "6857",
            "announcement_date": "2020-04-24",
            "period_end": None,
            "period_basis": None,
            "fiscal_period_raw": "",
            "official_document_url": "",
        }]
        rows = collector.reconcile(official, phase_a, [])
        self.assertTrue(any(row["match_status"] == "unmatched" for row in rows))
        self.assertTrue(any("Date-only" in (row["difference_note"] or "") for row in rows))

    def test_duplicate_doc_ids_collapse(self) -> None:
        html = FIXTURE_TDNET + FIXTURE_TDNET
        rows = collector.parse_tanshin_from_tdnet(html, "5803")
        ids = [row["doc_id"] for row in rows]
        self.assertEqual(len(ids), len(set(ids)))


if __name__ == "__main__":
    unittest.main()
