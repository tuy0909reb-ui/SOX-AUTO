"""NDX sell protocol v2 — Phase 1 unit tests (spec verification only)."""

from __future__ import annotations

import unittest
from unittest.mock import patch

from ndx_sell_protocol import (
    apply_nq_brake,
    build_view_model,
    evaluate_morning_decision,
    format_discord_message,
    format_report,
    purchase_ratio_pct,
)
from ndx_discord_ui import (
    build_evening_embed,
    build_log_content,
    build_morning_embed,
)


def _snap(**kw):
    base = {
        "purchase_ratio_pct": 3.0,
        "rsi": 72.0,
        "macd_dead_cross": True,
        "ndx_close": 100.0,
        "ma20": 101.0,
    }
    base.update(kw)
    return base


class TestPurchaseRatio(unittest.TestCase):
    def test_below_2(self):
        self.assertLess(purchase_ratio_pct(10_199.0), 2.0)
        d, r = evaluate_morning_decision(_snap(purchase_ratio_pct=1.99))
        self.assertEqual(d, "HOLD")
        self.assertIn("購入比", r)

    def test_exactly_2(self):
        self.assertAlmostEqual(purchase_ratio_pct(10_200.0), 2.0)
        d, _ = evaluate_morning_decision(_snap(purchase_ratio_pct=2.0))
        self.assertNotEqual(d, "HOLD")  # proceeds past Step1 (may HOLD later)

    def test_above_2(self):
        self.assertGreater(purchase_ratio_pct(10_300.0), 2.0)
        d, _ = evaluate_morning_decision(
            _snap(purchase_ratio_pct=2.01, rsi=70.0, macd_dead_cross=True, ndx_close=99, ma20=100)
        )
        self.assertEqual(d, "GO")


class TestRSI(unittest.TestCase):
    def test_69_9(self):
        d, r = evaluate_morning_decision(_snap(rsi=69.9))
        self.assertEqual(d, "HOLD")
        self.assertIn("RSI", r)

    def test_70(self):
        d, _ = evaluate_morning_decision(
            _snap(rsi=70.0, macd_dead_cross=True, ndx_close=99, ma20=100)
        )
        self.assertEqual(d, "GO")

    def test_above_70(self):
        d, _ = evaluate_morning_decision(
            _snap(rsi=70.1, macd_dead_cross=True, ndx_close=101, ma20=100)
        )
        self.assertEqual(d, "GO候補")


class TestMACD(unittest.TestCase):
    def test_dead_cross_true(self):
        d, _ = evaluate_morning_decision(
            _snap(macd_dead_cross=True, ndx_close=99, ma20=100)
        )
        self.assertEqual(d, "GO")

    def test_dead_cross_false(self):
        d, r = evaluate_morning_decision(_snap(macd_dead_cross=False))
        self.assertEqual(d, "HOLD")
        self.assertIn("MACD", r)


class TestMA20(unittest.TestCase):
    def test_above(self):
        d, r = evaluate_morning_decision(_snap(ndx_close=101.0, ma20=100.0))
        self.assertEqual(d, "GO候補")
        self.assertIn("MA20維持", r)

    def test_equal(self):
        d, r = evaluate_morning_decision(_snap(ndx_close=100.0, ma20=100.0))
        self.assertEqual(d, "GO")
        self.assertIn("MA20割れ", r)

    def test_below(self):
        d, _ = evaluate_morning_decision(_snap(ndx_close=99.0, ma20=100.0))
        self.assertEqual(d, "GO")


class TestNQBrake(unittest.TestCase):
    def test_minus_0_99_keeps(self):
        self.assertEqual(apply_nq_brake("GO", -0.99)[0], "GO")
        self.assertEqual(apply_nq_brake("GO候補", -0.99)[0], "GO候補")
        self.assertEqual(apply_nq_brake("HOLD", -0.99)[0], "HOLD")

    def test_minus_1_00_hold(self):
        self.assertEqual(apply_nq_brake("GO", -1.00)[0], "HOLD")
        self.assertEqual(apply_nq_brake("GO候補", -1.00)[0], "HOLD")

    def test_minus_1_01_hold(self):
        self.assertEqual(apply_nq_brake("GO", -1.01)[0], "HOLD")
        self.assertIn("ギャップダウン回避", apply_nq_brake("GO", -1.01)[1])


class TestBuildViewModelFields(unittest.TestCase):
    def _fake_snapshot(self):
        return {
            "nav": 10245.0,
            "nav_date": "2026-07-28",
            "purchase_ratio_pct": 2.45,
            "purchase_ok": True,
            "ndx_close": 28000.0,
            "ndx_date": "2026-07-25",
            "rsi": 72.0,
            "rsi_ok": True,
            "macd": 1.0,
            "macd_signal": 0.5,
            "macd_dead_cross": True,
            "ma20": 27900.0,
            "above_ma20": True,
            "nq_pct": -0.2,
            "nq_safe": True,
            "protocol_version": "2.0.0",
        }

    def test_am_fields(self):
        with patch("ndx_sell_protocol.collect_snapshot", return_value=self._fake_snapshot()):
            view = build_view_model("am")
        for key in (
            "nav",
            "nav_date",
            "purchase_ratio_pct",
            "rsi",
            "macd",
            "ma20",
            "decision",
            "stop_reason",
        ):
            self.assertIn(key, view)
            self.assertIsNotNone(view[key])
        self.assertEqual(view["phase"], "am")
        self.assertEqual(view["decision"], "GO候補")

    def test_pm_fields_include_nq(self):
        with patch("ndx_sell_protocol.collect_snapshot", return_value=self._fake_snapshot()):
            view = build_view_model("pm")
        self.assertIn("nq_pct", view)
        self.assertIn("nq_ok", view)
        self.assertIn("final_decision", view)
        self.assertIn("reason", view)
        self.assertEqual(view["final_decision"], "GO候補")  # NQ -0.2 > -1


class TestDisplayConsistency(unittest.TestCase):
    """Phase 3: same ViewModel → console / discord text / embeds / log."""

    def setUp(self):
        self.am = {
            "phase": "am",
            "nav": 10245.0,
            "nav_date": "2026-07-28",
            "purchase_ratio_pct": 2.45,
            "purchase_ok": True,
            "ndx_close": 28000.0,
            "rsi": 72.0,
            "rsi_ok": True,
            "macd": 1.0,
            "macd_signal": 0.5,
            "macd_dead_cross": True,
            "ma20": 27900.0,
            "above_ma20": True,
            "nq_pct": -0.2,
            "nq_ok": True,
            "decision": "GO候補",
            "final_decision": "GO候補",
            "morning_decision": "GO候補",
            "stop_reason": "MA20維持中",
            "reason": "MA20維持中",
        }
        self.pm = dict(self.am)
        self.pm["phase"] = "pm"
        self.pm["reason"] = "MA20維持中 / NQ先物-0.20%>-1%（朝判定維持）"

    def test_am_no_nq_in_surfaces(self):
        console = format_report(self.am)
        discord = format_discord_message(self.am)
        embed = build_morning_embed(self.am)
        log = build_log_content(self.am, phase="am")
        for text in (console, discord, log):
            self.assertIn("10245", text.replace(",", ""))
            self.assertIn("2026-07-28", text)
            self.assertNotIn("NQ先物", text)
        self.assertFalse(any(f.name == "NQ先物" for f in embed.fields))
        self.assertTrue(any(f.name == "基準価額日付" for f in embed.fields))

    def test_pm_has_nq_in_surfaces(self):
        console = format_report(self.pm)
        discord = format_discord_message(self.pm)
        embed = build_evening_embed(self.pm)
        log = build_log_content(self.pm, phase="pm")
        for text in (console, discord, log):
            self.assertIn("NQ", text)
        self.assertTrue(any(f.name == "NQ先物" for f in embed.fields))


class TestRegressionNoLegacy(unittest.TestCase):
    def test_source_has_no_legacy(self):
        import pathlib

        files = [
            "ndx_sell_protocol.py",
            "ndx_ops.py",
            "ndx_discord_ui.py",
            "ndx_discord_bot.py",
        ]
        banned = [
            "morning_state",
            "cond1",
            "UNDERWATER",
            "NK=F",
            "is_climax",
            "run_am",
            "run_pm",
            "ndx_drop",
            "DEFAULT_COST",
        ]
        root = pathlib.Path(__file__).resolve().parent
        for name in files:
            text = (root / name).read_text(encoding="utf-8")
            for bad in banned:
                self.assertNotIn(bad, text, f"{name} still contains {bad}")
            # candidate as state management — allow only if not state JSON path
            self.assertNotIn("MORNING_STATE", text)
            self.assertNotIn("save_morning_state", text)


if __name__ == "__main__":
    unittest.main()
