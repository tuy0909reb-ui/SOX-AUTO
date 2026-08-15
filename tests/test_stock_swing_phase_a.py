"""Phase A Fact collection guardrails; no network access required."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "stock_swing" / "build_kessan_phase_a.py"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


class KessanPhaseAFactTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = Path(tempfile.mkdtemp(prefix="kessan-phase-a-"))
        self.ledger = self.temp / "kessan_ledger.csv"
        shutil.copy2(LEDGER, self.ledger)
        self.before_hash = hashlib.sha256(self.ledger.read_bytes()).hexdigest()
        self.output = self.temp / "facts"
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "--ledger", str(self.ledger), "--output", str(self.output), "--replace-output"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, msg=result.stderr)

    def tearDown(self) -> None:
        shutil.rmtree(self.temp, ignore_errors=True)

    def test_preserves_raw_ledger_and_records_hash(self) -> None:
        self.assertEqual(self.before_hash, hashlib.sha256(self.ledger.read_bytes()).hexdigest())
        manifest = json.loads((self.output / "raw_external" / "gemini_kessan_ledger_manifest.json").read_text(encoding="utf-8"))
        rows = load_jsonl(self.output / "raw_external" / "gemini_kessan_ledger_rows.jsonl")
        self.assertEqual(manifest["content_sha256"], self.before_hash)
        self.assertEqual(manifest["row_count"], 103)
        self.assertEqual(rows[0]["raw_row_id"], 1)
        self.assertIn("銘柄コード", rows[0]["columns"])

    def test_locks_only_the_14_security_universe(self) -> None:
        master = load_jsonl(self.output / "facts" / "security_master.jsonl")
        ids = {row["security_id"] for row in master}
        self.assertEqual(len(master), 14)
        self.assertEqual(ids, {"5803", "285A", "6857", "6146", "6920", "4062", "6525", "5801", "8035", "7735", "3436", "7011", "7012", "8306"})
        listing = {row["security_id"]: row["listing_start"] for row in master}
        self.assertEqual(listing["285A"], "2024-12-18")
        self.assertEqual(listing["6525"], "2023-10-25")

    def test_distinguishes_raw_seeded_and_uninvestigated_universe_members(self) -> None:
        inventory = {row["security_id"]: row for row in load_jsonl(self.output / "facts" / "event_inventory.jsonl")}
        for code in ("5803", "6146", "6920", "6525", "5801", "7012"):
            self.assertEqual(inventory[code]["inventory_status"], "not_investigated")
            self.assertEqual(inventory[code]["raw_ledger_event_candidates"], 0)
        self.assertEqual(inventory["6857"]["inventory_status"], "raw_seeded")

    def test_does_not_infer_event_time_or_reconcile_by_date(self) -> None:
        events = load_jsonl(self.output / "facts" / "earnings_event.jsonl")
        exact_date_event = next(event for event in events if event["security_id"] == "6857")
        self.assertIsNone(exact_date_event["announcement_time"])
        self.assertEqual(exact_date_event["timestamp_quality"], "date_only")
        self.assertEqual((self.output / "facts" / "reconciliation.jsonl").read_text(encoding="utf-8"), "")

    def test_keeps_analysis_out_of_fact_schemas(self) -> None:
        schemas = (self.output / "schemas").glob("*.schema.json")
        forbidden = {"win_rate", "expectancy", "ranking", "recommendation", "trade_rule", "position"}
        for path in schemas:
            text = path.read_text(encoding="utf-8").lower()
            self.assertFalse(any(term in text for term in forbidden), path.name)


if __name__ == "__main__":
    unittest.main()
