import os
import unittest
from unittest.mock import Mock, patch

import pandas as pd

import build_backtest_data
import silicon_protocol
import sox_utils


class ProtocolUtilityTests(unittest.TestCase):
    def test_fetch_with_retry_retries_empty_data(self):
        history = pd.DataFrame({"Close": [100.0]})
        ticker = Mock()
        ticker.history.side_effect = [pd.DataFrame(), history]

        with (
            patch.object(sox_utils.yf, "Ticker", return_value=ticker),
            patch.object(sox_utils.time, "sleep"),
        ):
            result = sox_utils.fetch_with_retry("^SOX", attempts=2, delay=0)

        self.assertIs(result, history)
        self.assertEqual(ticker.history.call_count, 2)

    def test_fetch_with_retry_rejects_zero_attempts(self):
        with self.assertRaisesRegex(ValueError, "attempts"):
            sox_utils.fetch_with_retry("^SOX", attempts=0)

    def test_send_discord_skips_when_webhook_is_missing(self):
        with (
            patch.dict(os.environ, {"DISCORD_WEBHOOK_URL": ""}),
            patch.object(sox_utils.requests, "post") as post,
        ):
            sent = sox_utils.send_discord("message")

        self.assertFalse(sent)
        post.assert_not_called()


class SiliconProtocolTests(unittest.TestCase):
    def test_market_data_failure_becomes_data_error_values(self):
        with patch.object(
            silicon_protocol,
            "fetch_with_retry",
            side_effect=RuntimeError("temporary failure"),
        ):
            result = silicon_protocol.get_silicon_cycle_data()

        self.assertEqual(
            result,
            {
                "SOX_HIGH": None,
                "SOX_CLOSE": None,
                "200MA_NOW": None,
                "200MA_TREND": None,
            },
        )


class BacktestDataTests(unittest.TestCase):
    def test_build_panel_creates_expected_columns(self):
        idx = pd.bdate_range("2024-01-02", periods=40)
        sox = pd.Series(range(100, 140), index=idx, dtype=float)
        vix = pd.Series(18.0, index=idx)
        nasdaq = pd.Series(15000.0, index=idx)
        jpy = pd.Series(110.0, index=idx)
        nq_f = pd.Series(range(14900, 14940), index=idx, dtype=float)

        panel = build_backtest_data.build_panel(sox, vix, nasdaq, jpy, nq_f)

        self.assertGreater(len(panel), 0)
        self.assertIn("week_phase", panel.columns)
        self.assertIn("fwd_return_5d_pct", panel.columns)
        self.assertIn("buy_calendar_allowed", panel.columns)
        self.assertIn("previous_futures_available", panel.columns)
        self.assertIn("buy_allowed", panel.columns)
        self.assertIn("estimated_execution_date_jst", panel.columns)
        self.assertIn("nq_f_previous_close", panel.columns)
        self.assertTrue(set(panel["week_phase"].unique()).issubset({"HOLD", "BUY", "SELL"}))
        first = panel.iloc[0]
        source_position = idx.get_loc(pd.Timestamp(first["date"]))
        self.assertEqual(first["nq_f_previous_close"], nq_f.iloc[source_position - 1])

    def test_friday_and_day_before_japan_holiday_block_buying(self):
        holidays = {2024: build_backtest_data.japan_holidays(2024)}

        friday_allowed, friday_reason = build_backtest_data._buy_calendar_status(
            pd.Timestamp("2024-01-12").date(), holidays
        )
        pre_holiday_allowed, pre_holiday_reason = (
            build_backtest_data._buy_calendar_status(
                pd.Timestamp("2024-02-22").date(), holidays
            )
        )

        self.assertFalse(friday_allowed)
        self.assertEqual(friday_reason, "friday")
        self.assertFalse(pre_holiday_allowed)
        self.assertEqual(pre_holiday_reason, "before_japan_holiday")

    def test_daily_1000_yen_constant_price_breaks_even_and_resets_yearly(self):
        idx = pd.to_datetime(
            ["2024-12-27", "2024-12-30", "2025-01-02", "2025-01-03"]
        )
        sox = pd.Series(100.0, index=idx)
        jpy = pd.Series(150.0, index=idx)

        daily = build_backtest_data.simulate_daily_1000_yen(sox, jpy)
        annual = build_backtest_data.summarize_annual_results(daily)

        self.assertEqual(len(daily), 4)
        self.assertTrue(daily.iloc[1]["sold_at_year_end"])
        self.assertEqual(daily.iloc[2]["cumulative_investment_jpy"], 1000.0)
        self.assertEqual(daily.iloc[2]["market_value_jpy"], 1000.0)
        self.assertTrue((annual["profit_loss_jpy"] == 0.0).all())
        self.assertTrue((annual["return_pct"] == 0.0).all())

    def test_daily_1000_yen_rejects_non_positive_investment(self):
        idx = pd.to_datetime(["2024-01-02"])
        series = pd.Series(100.0, index=idx)

        with self.assertRaisesRegex(ValueError, "positive"):
            build_backtest_data.simulate_daily_1000_yen(
                series, series, daily_investment_jpy=0
            )

    def test_weekly_summary_finds_declining_week_as_worst(self):
        idx = pd.to_datetime(
            [
                "2024-01-02",
                "2024-01-03",
                "2024-01-04",
                "2024-01-08",
                "2024-01-09",
                "2024-01-10",
            ]
        )
        sox = pd.Series([100.0, 105.0, 110.0, 110.0, 90.0, 80.0], index=idx)
        jpy = pd.Series(100.0, index=idx)

        daily = build_backtest_data.simulate_daily_1000_yen(sox, jpy)
        weekly = build_backtest_data.summarize_weekly_results(daily)
        worst = weekly.nsmallest(1, "account_return_pct").iloc[0]

        self.assertEqual(worst["week_start"], "2024-01-08")
        self.assertLess(worst["account_return_pct"], 0)
        self.assertLess(worst["market_pnl_jpy"], 0)


if __name__ == "__main__":
    unittest.main()
