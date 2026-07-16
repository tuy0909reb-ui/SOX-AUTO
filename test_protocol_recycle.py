import unittest

import pandas as pd

from backtest_protocol_recycle import (
    decide_sell,
    simulate_recycle,
)


class SellDecisionTests(unittest.TestCase):
    def test_short_phase_take_profit_at_10pct(self):
        day = pd.Timestamp("2024-06-05")
        self.assertEqual(decide_sell(day, 30, 10.0), "take_profit_short")
        self.assertIsNone(decide_sell(day, 30, 9.5))

    def test_medium_phase_lower_target(self):
        day = pd.Timestamp("2024-06-05")
        self.assertEqual(decide_sell(day, 200, 8.0), "take_profit_medium")
        self.assertIsNone(decide_sell(day, 200, 7.0))

    def test_long_phase_lowest_target(self):
        day = pd.Timestamp("2024-06-05")
        self.assertEqual(decide_sell(day, 500, 6.0), "take_profit_long")

    def test_seasonal_window_sells_with_small_gain(self):
        day = pd.Timestamp("2024-07-25")  # 07-20〜07-31 の売り窓
        self.assertEqual(decide_sell(day, 30, 4.0), "seasonal_window")
        self.assertIsNone(decide_sell(day, 30, 2.0))

    def test_sell_week_sells_with_small_gain(self):
        # ISO week 27 は WEEK_ANOMALY で SELL
        day = pd.Timestamp.fromisocalendar(2024, 27, 3)
        self.assertEqual(decide_sell(day, 30, 3.5), "sell_week")


class RecycleSimulationTests(unittest.TestCase):
    def _frame(self, signal_dates, exec_map):
        index = pd.to_datetime(sorted(exec_map))
        return pd.DataFrame(
            {
                "protocol_buy_signal": [d in signal_dates for d in index],
                "estimated_execution_date_jst": [
                    pd.Timestamp(exec_map[d]) for d in index
                ],
                "buy_reason": [
                    "radar_normal_-8" if d in signal_dates else None
                    for d in index
                ],
            },
            index=index,
        )

    def test_buy_then_take_profit_and_recycle(self):
        dates = pd.to_datetime(
            ["2024-01-10", "2024-01-11", "2024-01-12", "2024-01-15"]
        )
        signal = {pd.Timestamp("2024-01-10")}
        exec_map = {d: d for d in dates}
        exec_map[pd.Timestamp("2024-01-10")] = pd.Timestamp("2024-01-12")
        frame = self._frame(signal, exec_map)
        prices = pd.Series([100.0, 105.0, 105.0, 117.0], index=dates)

        trades, equity = simulate_recycle(frame, prices, capital_jpy=1_000_000)

        self.assertEqual(len(trades), 1)
        row = trades.iloc[0]
        self.assertEqual(row["sell_reason"], "take_profit_short")
        self.assertEqual(row["buy_date"], "2024-01-12")
        self.assertGreater(row["net_profit_jpy"], 0)
        self.assertGreater(equity.iloc[-1], 1_000_000)

    def test_no_signal_keeps_full_cash(self):
        dates = pd.to_datetime(["2024-01-10", "2024-01-11"])
        frame = self._frame(set(), {d: d for d in dates})
        prices = pd.Series([100.0, 130.0], index=dates)

        trades, equity = simulate_recycle(frame, prices, capital_jpy=500_000)

        self.assertTrue(trades.empty)
        self.assertEqual(equity.iloc[-1], 500_000)

    def test_defense_force_exit_sells_at_25pct_drop(self):
        dates = pd.to_datetime(
            ["2024-01-10", "2024-01-11", "2024-01-12", "2024-01-15"]
        )
        signal = {pd.Timestamp("2024-01-10")}
        exec_map = {d: d for d in dates}
        exec_map[pd.Timestamp("2024-01-10")] = pd.Timestamp("2024-01-12")
        frame = self._frame(signal, exec_map)
        prices = pd.Series([100.0, 105.0, 105.0, 72.0], index=dates)
        defense = pd.DataFrame(
            {
                "defense_force_exit": [False, False, False, True],
            },
            index=dates,
        )

        trades, _ = simulate_recycle(
            frame, prices, capital_jpy=1_000_000, defense_daily=defense
        )

        self.assertEqual(len(trades), 1)
        self.assertEqual(trades.iloc[0]["sell_reason"], "defense_drop_25pct")
        self.assertLess(trades.iloc[0]["return_pct"], 0)


if __name__ == "__main__":
    unittest.main()
