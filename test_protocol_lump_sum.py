import math
import unittest

import pandas as pd

from backtest_protocol_lump_sum import (
    build_protocol_frame,
    simulate_lump_sum_cohorts,
)


class ProtocolLumpSumTests(unittest.TestCase):
    def _panel_row(
        self,
        signal_date,
        week_phase="HOLD",
        buy_line=-0.08,
        crash_zone=False,
        vix=15.0,
        buy_allowed=True,
    ):
        return pd.DataFrame(
            {
                "date": [signal_date],
                "order_date_jst": [signal_date + pd.Timedelta(days=1)],
                "estimated_execution_date_jst": [
                    signal_date + pd.Timedelta(days=2)
                ],
                "week_phase": [week_phase],
                "buy_line": [buy_line],
                "crash_zone": [crash_zone],
                "vix": [vix],
                "buy_allowed": [buy_allowed],
            }
        )

    def test_radar_minus_8_buys_without_buy_week(self):
        signal_date = pd.Timestamp("2024-03-04")
        panel = self._panel_row(signal_date, week_phase="HOLD")
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [-8.5]}
        )

        frame = build_protocol_frame(panel, radar)

        self.assertTrue(frame.iloc[0]["protocol_buy_signal"])
        self.assertEqual(frame.iloc[0]["buy_reason"], "radar_normal_-8")

    def test_radar_minus_12_is_strong_buy_priority(self):
        signal_date = pd.Timestamp("2024-03-04")
        panel = self._panel_row(
            signal_date, week_phase="SELL", crash_zone=True, vix=25.0
        )
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [-13.0]}
        )

        frame = build_protocol_frame(panel, radar)

        self.assertEqual(frame.iloc[0]["buy_reason"], "radar_strong_-12")

    def test_event_buy_when_vix_high_and_below_buy_line(self):
        signal_date = pd.Timestamp("2024-03-04")
        panel = self._panel_row(
            signal_date,
            week_phase="SELL",
            buy_line=-0.06,
            crash_zone=True,
            vix=22.0,
        )
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [-7.0]}
        )

        frame = build_protocol_frame(panel, radar)

        self.assertTrue(frame.iloc[0]["is_my_bottom"])
        self.assertEqual(frame.iloc[0]["buy_reason"], "event_vix_and_bottom")

    def test_buy_week_alone_is_not_entry(self):
        signal_date = pd.Timestamp("2024-03-04")
        panel = self._panel_row(signal_date, week_phase="BUY", buy_line=-0.10)
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [-2.0]}
        )

        frame = build_protocol_frame(panel, radar)

        self.assertFalse(frame.iloc[0]["protocol_buy_signal"])

    def test_seasonal_cycle_buy_on_first_window_day(self):
        signal_date = pd.Timestamp("2024-02-12")
        panel = self._panel_row(signal_date)
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [3.0]}
        )
        sox = pd.Series(
            [5000.0] * 260,
            index=pd.bdate_range("2023-01-01", periods=260),
        )

        frame = build_protocol_frame(panel, radar, sox_close=sox)

        self.assertTrue(frame.iloc[0]["protocol_buy_signal"])
        self.assertEqual(frame.iloc[0]["buy_reason"], "seasonal_cycle_1")

    def test_defense_blocks_buy_below_falling_200ma(self):
        dates = pd.bdate_range("2023-01-01", periods=260)
        signal_date = dates[-1]
        panel = self._panel_row(signal_date)
        radar = pd.DataFrame(
            {"date": [signal_date], "total_return_pct": [-10.0]}
        )
        sox = pd.Series(range(260, 0, -1), index=dates, dtype=float)

        frame = build_protocol_frame(panel, radar, sox_close=sox)

        self.assertTrue(bool(frame.iloc[0]["defense_block_buy"]))
        self.assertFalse(frame.iloc[0]["protocol_buy_signal"])

    def test_january_cohort_and_taxable_sale(self):
        signal_date = pd.Timestamp("2024-01-10")
        protocol = build_protocol_frame(
            self._panel_row(signal_date),
            pd.DataFrame({"date": [signal_date], "total_return_pct": [-11.0]}),
        )
        prices = pd.Series(
            [100.0, 105.0, 111.0],
            index=pd.to_datetime(["2024-01-12", "2024-01-15", "2024-01-16"]),
        )

        results = simulate_lump_sum_cohorts(protocol, prices, [2024])
        result = results.iloc[0]
        expected_profit = 13_500_000 * 0.11
        expected_tax = math.floor(expected_profit * 0.20315)

        self.assertEqual(result["status"], "sold")
        self.assertEqual(result["observation_start"], "2024-01-01")
        self.assertAlmostEqual(result["gross_profit_jpy"], expected_profit)
        self.assertEqual(result["estimated_tax_jpy"], expected_tax)


if __name__ == "__main__":
    unittest.main()
