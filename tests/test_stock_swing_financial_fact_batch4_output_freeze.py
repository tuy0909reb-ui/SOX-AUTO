"""Integrity checks for the Batch 4 immutable output-freeze manifest."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "stock_swing"))

from validate_financial_fact_batch4_output_freeze import (  # noqa: E402
    EXPECTED_MANIFEST_SHA,
    validate_batch4_output_freeze,
)


class Batch4OutputFreezeTest(unittest.TestCase):
    def test_frozen_output_manifest_and_references_are_intact(self) -> None:
        summary = validate_batch4_output_freeze()

        self.assertEqual(summary["manifest_sha256"], EXPECTED_MANIFEST_SHA)
        self.assertEqual(
            summary["scope_sha256"],
            "c27f20e039d58604b809d63dea11a272bb36ce121c9c41aa19ff4c5495f6b1a2",
        )
        self.assertEqual(summary["output_file_count"], 9)
        self.assertEqual(summary["output_digests"], "PASS")
        self.assertEqual(summary["implementation_digests"], "PASS")
        self.assertEqual(summary["record_digests"], "PASS")
        self.assertEqual(summary["provenance"], "PASS")
        self.assertEqual(summary["namespace_boundaries"], "PASS")
        self.assertFalse(summary["commit_authorized"])


if __name__ == "__main__":
    unittest.main()
