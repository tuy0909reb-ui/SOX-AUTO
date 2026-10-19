"""Unit tests for silicon-cycle shared materials + watch cadence."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path
from unittest.mock import patch

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SC = ROOT / "scripts" / "silicon_cycle"
if str(SC) not in sys.path:
    sys.path.insert(0, str(SC))

import materials  # noqa: E402
import messages  # noqa: E402
import watch_state  # noqa: E402
import webhook_config  # noqa: E402


def _synthetic_series(
    *,
    start: str = "2024-01-02",
    n: int = 260,
    start_px: float = 100.0,
    drift: float = 0.001,
) -> pd.Series:
    idx = pd.bdate_range(start=start, periods=n)
    values = [start_px]
    for _ in range(1, n):
        values.append(values[-1] * (1.0 + drift))
    return pd.Series(values, index=idx, dtype=float)


class SiliconCycleMaterialsTests(unittest.TestCase):
    def test_schema_and_price_block_no_network(self):
        as_of = date(2025, 1, 15)
        sox = _synthetic_series(drift=0.002)
        spy = _synthetic_series(drift=0.001, start_px=200.0)
        payload = materials.build_materials(
            as_of=as_of,
            sox=sox,
            spy=spy,
            fetch_legacy=False,
            wsts_3m_minus=False,
            tsmc_yoy_pct=25.0,
        )
        self.assertEqual(payload["schema"], "silicon_cycle_materials_v1")
        self.assertEqual(payload["layer"], "Review_materials")
        self.assertIn("price", payload)
        self.assertIsNotNone(payload["price"].get("ma200"))
        self.assertEqual(len(payload["price"]["vs_sp500"]), 3)
        self.assertIn("watch_hint", payload)
        self.assertIn("footer", payload)
        self.assertNotIn("一括推奨", json.dumps(payload, ensure_ascii=False))
        self.assertEqual(payload["legacy_compat"]["sensor_lights"]["wsts"], "GREEN")
        self.assertEqual(payload["legacy_compat"]["sensor_lights"]["tsmc_yoy"], "GREEN")
        md = materials.render_materials_md(payload)
        self.assertIn("Human判断欄", md)
        self.assertIn("材料のみ", md)

    def test_watch_hint_elevated_on_drawdown(self):
        as_of = date(2025, 6, 1)
        idx = pd.bdate_range(start="2024-01-02", periods=280)
        # Rise then crash >15% from 250d high
        values = []
        px = 100.0
        for i in range(280):
            if i < 200:
                px *= 1.003
            else:
                px *= 0.985
            values.append(px)
        sox = pd.Series(values, index=idx, dtype=float)
        spy = _synthetic_series(n=280, drift=0.001)
        payload = materials.build_materials(
            as_of=as_of,
            sox=sox,
            spy=spy,
            fetch_legacy=False,
            wsts_gap="skip_wsts",
            tsmc_gap="skip_tsmc",
        )
        self.assertTrue(payload["watch_hint"]["elevated"])
        self.assertTrue(
            any("drop_from_high" in r for r in payload["watch_hint"]["reasons"])
        )

    def test_legacy_lights_red(self):
        as_of = date(2025, 1, 15)
        sox = _synthetic_series()
        spy = _synthetic_series(start_px=200.0)
        payload = materials.build_materials(
            as_of=as_of,
            sox=sox,
            spy=spy,
            fetch_legacy=False,
            wsts_3m_minus=True,
            tsmc_yoy_pct=5.0,
        )
        lights = payload["legacy_compat"]["sensor_lights"]
        self.assertEqual(lights["wsts"], "RED")
        self.assertEqual(lights["tsmc_yoy"], "RED")


class WatchStateTests(unittest.TestCase):
    def test_cadence_normal_and_elevated(self):
        self.assertTrue(watch_state.should_notify_today(date(2026, 11, 1), "normal"))
        self.assertFalse(watch_state.should_notify_today(date(2026, 11, 2), "normal"))
        # 2026-11-02 is Monday
        self.assertTrue(watch_state.should_notify_today(date(2026, 11, 2), "elevated"))
        self.assertFalse(watch_state.should_notify_today(date(2026, 11, 3), "elevated"))

    def test_human_force_elevated_mode(self):
        state = watch_state.default_state()
        state["human_force_elevated"] = True
        mode = watch_state.resolve_mode(state, watch_hint_elevated=False)
        self.assertEqual(mode, "elevated")

    def test_sent_idempotency(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "watch.json"
            with patch.object(watch_state, "STATE_PATH", path):
                state = watch_state.default_state()
                as_of = date(2026, 11, 1)
                self.assertFalse(watch_state.already_sent(state, as_of, "normal"))
                state = watch_state.mark_sent(state, as_of, "normal")
                watch_state.save_state(state)
                loaded = watch_state.load_state()
                self.assertTrue(watch_state.already_sent(loaded, as_of, "normal"))


class MessageAndWebhookTests(unittest.TestCase):
    def test_message_order_and_no_recommendation(self):
        as_of = date(2025, 1, 15)
        payload = materials.build_materials(
            as_of=as_of,
            sox=_synthetic_series(),
            spy=_synthetic_series(start_px=200.0),
            fetch_legacy=False,
            wsts_3m_minus=False,
            tsmc_yoy_pct=20.0,
        )
        text = messages.format_watch_message(
            payload, mode="normal", plan_year=2027, why="通常モード月次確認"
        )
        self.assertIn("今見る理由", text)
        self.assertIn("材料サマリ", text)
        self.assertIn("年次③との関係", text)
        self.assertIn("データ欠落", text)
        self.assertIn("材料のみ", text)
        self.assertNotIn("一括を推奨", text)

    def test_webhook_no_fallback_to_legacy_env(self):
        with patch.dict(
            "os.environ",
            {
                "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/1/abc",
                "NISA_ANNUAL_DISCORD_WEBHOOK": "https://discord.com/api/webhooks/2/def",
                "SILICON_CYCLE_DISCORD_WEBHOOK": "",
            },
            clear=False,
        ):
            with patch.object(webhook_config, "WEBHOOK_FILE", Path("/nonexistent/x.json")):
                self.assertIsNone(webhook_config.resolve_silicon_cycle_webhook_url())


class CycleGateWriteTests(unittest.TestCase):
    def test_write_cycle_gate_updates_pointer(self):
        sys.path.insert(0, str(ROOT / "scripts" / "nisa_annual"))
        # Import after path setup
        import build_cycle_gate as bcg  # noqa: E402

        as_of = date(2026, 10, 17)
        payload = materials.build_materials(
            as_of=as_of,
            sox=_synthetic_series(n=300),
            spy=_synthetic_series(n=300, start_px=200.0),
            fetch_legacy=False,
            wsts_3m_minus=False,
            tsmc_yoy_pct=30.0,
        )
        with tempfile.TemporaryDirectory() as tmp:
            tmp_root = Path(tmp)
            with patch.object(bcg, "ROOT", tmp_root):
                written = bcg.write_cycle_gate(
                    plan_year=2027, as_of=as_of, payload=payload
                )
                md = tmp_root / written["cycle_gate_md"]
                js = tmp_root / written["cycle_gate_json"]
                self.assertTrue(md.is_file())
                self.assertTrue(js.is_file())
                pointer = json.loads(
                    (tmp_root / "data" / "nisa" / "annual" / "latest" / "pointer.json").read_text(
                        encoding="utf-8"
                    )
                )
                self.assertIn("cycle_gate", pointer)
                body = md.read_text(encoding="utf-8")
                self.assertIn("③シリコンサイクルゲート", body)
                self.assertIn("材料のみ", body)


if __name__ == "__main__":
    unittest.main()
