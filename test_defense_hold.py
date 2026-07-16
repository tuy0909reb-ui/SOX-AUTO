import math
import unittest

import pandas as pd

from backtest_defense_hold import (
    build_reentry_condition,
    simulate_defense_hold,
)


class DefenseHoldTests(unittest.TestCase):
    def _defense(self, dates, force_days=(), recovery_days=()):
        force_days = set(pd.to_datetime(force_days))
        recovery_days = set(pd.to_datetime(recovery_days))
        return pd.DataFrame(
            {
                "defense_sox_drop_pct": [
                    10.0 if day in recovery_days else 30.0 for day in dates
                ],
                "defense_sox_close": [
                    110.0 if day in recovery_days else 90.0 for day in dates
                ],
                "defense_ma_200": [100.0] * len(dates),
                "defense_ma_trend_20d": [
                    1.0 if day in recovery_days else -1.0 for day in dates
                ],
                "defense_force_exit": [
                    day in force_days for day in dates
                ],
            },
            index=dates,
        )

    def test_reentry_requires_all_three_conditions(self):
        dates = pd.date_range("2024-01-01", periods=3)
        defense = self._defense(dates, recovery_days=[dates[1]])
        condition = build_reentry_condition(defense)

        self.assertFalse(condition.iloc[0])
        self.assertTrue(condition.iloc[1])

    def test_buys_day_after_confirmation_streak(self):
        dates = pd.bdate_range("2024-01-01", periods=7)
        defense = self._defense(
            dates,
            force_days=[dates[1]],
            recovery_days=[dates[2], dates[3], dates[4]],
        )
        prices = pd.Series([100, 80, 82, 84, 86, 88, 90], index=dates)

        transactions, _, _ = simulate_defense_hold(
            prices,
            defense,
            start_date=dates[0],
            confirmation_days=2,
            capital_jpy=1_000,
        )

        self.assertEqual(
            transactions["action"].tolist(), ["buy", "sell", "buy"]
        )
        self.assertEqual(
            transactions.iloc[-1]["date"], dates[4].date().isoformat()
        )
        self.assertEqual(
            transactions.iloc[-1]["reason"], "recovery_confirmed_2d"
        )

    def test_defense_sale_taxes_only_profit(self):
        dates = pd.bdate_range("2024-01-01", periods=3)
        defense = self._defense(dates, force_days=[dates[1]])
        prices = pd.Series([100.0, 125.0, 120.0], index=dates)

        transactions, _, state = simulate_defense_hold(
            prices,
            defense,
            start_date=dates[0],
            confirmation_days=2,
            capital_jpy=1_000,
        )

        sale = transactions[transactions["action"] == "sell"].iloc[0]
        expected_tax = math.floor(250 * 0.20315)
        self.assertEqual(sale["tax_jpy"], expected_tax)
        self.assertEqual(state["final_equity_jpy"], 1_250 - expected_tax)

    def test_rejects_nonpositive_confirmation_days(self):
        dates = pd.bdate_range("2024-01-01", periods=2)
        with self.assertRaises(ValueError):
            simulate_defense_hold(
                pd.Series([100.0, 101.0], index=dates),
                self._defense(dates),
                confirmation_days=0,
            )


if __name__ == "__main__":
    unittest.main()
