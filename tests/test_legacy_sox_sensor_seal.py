"""Unit tests for Legacy SOX sensor seal gate (Discord block only)."""

from __future__ import annotations

import json
import os
import unittest
from pathlib import Path
from unittest.mock import patch

import legacy_sox_sensor_seal as seal


class LegacySoxSensorSealTests(unittest.TestCase):
    def test_sealed_status_from_repo_file(self):
        self.assertTrue(seal.is_sealed())
        self.assertFalse(seal.allow_legacy_sox_discord())

    def test_env_override_forces_active(self):
        with patch.dict(os.environ, {"LEGACY_SOX_SENSOR_SEAL": "active"}):
            self.assertFalse(seal.is_sealed())
            self.assertTrue(seal.allow_legacy_sox_discord())

    def test_send_discord_if_allowed_blocks_when_sealed(self):
        calls: list[str] = []

        def fake_send(message: str) -> bool:
            calls.append(message)
            return True

        with patch.dict(os.environ, {"LEGACY_SOX_SENSOR_SEAL": "sealed"}):
            ok = seal.send_discord_if_allowed(
                "hello", context="unit", send_fn=fake_send
            )
        self.assertFalse(ok)
        self.assertEqual(calls, [])

    def test_send_discord_if_allowed_passes_when_active(self):
        calls: list[str] = []

        def fake_send(message: str) -> bool:
            calls.append(message)
            return True

        with patch.dict(os.environ, {"LEGACY_SOX_SENSOR_SEAL": "active"}):
            ok = seal.send_discord_if_allowed(
                "hello", context="unit", send_fn=fake_send
            )
        self.assertTrue(ok)
        self.assertEqual(calls, ["hello"])

    def test_seal_file_documents_inventory(self):
        data = json.loads(Path(seal.SEAL_FILE).read_text(encoding="utf-8"))
        self.assertEqual(data["status"], "SEALED")
        protocols = data["inventory"]["protocols"]
        self.assertIn("silicon_protocol.py", protocols)
        self.assertIn("sox_protocol.py", protocols)


if __name__ == "__main__":
    unittest.main()
