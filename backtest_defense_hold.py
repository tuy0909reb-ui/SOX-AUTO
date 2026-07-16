"""防衛売却と確認後再投入だけを行う低回転SOXバックテスト。

初回投入後は短期利確・季節窓・週次アノマリーで売らない。
250日高値から25%以上下落した場合だけ全売却し、次の条件を指定営業日数
連続で満たした翌営業日に全額再投入する。

1. 250日高値からの下落率が25%未満
2. SOX終値が200日移動平均を上回る
3. 200日移動平均の20営業日変化が0以上
"""

from __future__ import annotations

import argparse
import json
import math
import os
from datetime import datetime

import pandas as pd

from backtest_protocol_lump_sum import build_defense_columns


DEFAULT_CAPITAL_JPY = 13_500_000.0
DEFAULT_TAX_RATE = 0.20315
DEFAULT_START_DATE = "2006-02-15"


def build_reentry_condition(defense: pd.DataFrame) -> pd.Series:
    """防衛解除後の構造的な回復条件を返す。"""
    required = {
        "defense_sox_drop_pct",
        "defense_sox_close",
        "defense_ma_200",
        "defense_ma_trend_20d",
    }
    missing = required - set(defense.columns)
    if missing:
        raise ValueError(f"defense columns missing: {sorted(missing)}")

    return (
        (defense["defense_sox_drop_pct"] < 25.0)
        & (defense["defense_sox_close"] > defense["defense_ma_200"])
        & (defense["defense_ma_trend_20d"] >= 0)
    ).fillna(False)


def simulate_defense_hold(
    price_jpy: pd.Series,
    defense: pd.DataFrame,
    start_date: str | pd.Timestamp = DEFAULT_START_DATE,
    confirmation_days: int = 20,
    capital_jpy: float = DEFAULT_CAPITAL_JPY,
    tax_rate: float = DEFAULT_TAX_RATE,
) -> tuple[pd.DataFrame, pd.Series, dict]:
    """防衛売却・確認後再投入の取引、資産推移、期末状態を返す。"""
    if confirmation_days <= 0:
        raise ValueError("confirmation_days must be positive")
    if capital_jpy <= 0:
        raise ValueError("capital_jpy must be positive")
    if not 0 <= tax_rate <= 1:
        raise ValueError("tax_rate must be between 0 and 1")

    prices = price_jpy.dropna().copy()
    prices.index = pd.to_datetime(prices.index).tz_localize(None).normalize()
    prices = prices[~prices.index.duplicated(keep="last")].sort_index()
    prices = prices[prices.index >= pd.Timestamp(start_date)]
    if prices.empty:
        return pd.DataFrame(), pd.Series(dtype=float), {}

    defense = defense.reindex(prices.index)
    reentry_ok = build_reentry_condition(defense)

    cash = capital_jpy
    units = 0.0
    cost = 0.0
    buy_date: pd.Timestamp | None = None
    recovery_streak = 0
    pending_reentry = False
    transactions: list[dict] = []
    equity: dict[pd.Timestamp, float] = {}

    for position, day in enumerate(prices.index):
        price = float(prices.loc[day])

        if position == 0:
            units = cash / price
            cost = cash
            cash = 0.0
            buy_date = day
            transactions.append(
                {
                    "date": day.date().isoformat(),
                    "action": "buy",
                    "reason": "initial_deployment",
                    "price_jpy_proxy": price,
                    "cash_flow_jpy": cost,
                    "tax_jpy": 0,
                }
            )

        if (
            units > 0
            and day in defense.index
            and bool(defense.loc[day, "defense_force_exit"])
        ):
            proceeds = units * price
            gross_profit = proceeds - cost
            tax = math.floor(max(gross_profit, 0) * tax_rate)
            cash = proceeds - tax
            transactions.append(
                {
                    "date": day.date().isoformat(),
                    "action": "sell",
                    "reason": "defense_drop_25pct",
                    "price_jpy_proxy": price,
                    "cash_flow_jpy": cash,
                    "gross_profit_jpy": gross_profit,
                    "tax_jpy": tax,
                    "holding_days": int((day - buy_date).days),
                }
            )
            units = 0.0
            cost = 0.0
            buy_date = None
            recovery_streak = 0
            pending_reentry = False

        if units == 0:
            # 前営業日までに確認済みなら本日再投入する。防衛ラインへ
            # 再突入していた場合は注文を取り消し、確認をやり直す。
            if pending_reentry and not bool(
                defense.loc[day, "defense_force_exit"]
            ):
                units = cash / price
                cost = cash
                cash = 0.0
                buy_date = day
                transactions.append(
                    {
                        "date": day.date().isoformat(),
                        "action": "buy",
                        "reason": f"recovery_confirmed_{confirmation_days}d",
                        "price_jpy_proxy": price,
                        "cash_flow_jpy": cost,
                        "tax_jpy": 0,
                    }
                )
                recovery_streak = 0
                pending_reentry = False
            elif pending_reentry:
                recovery_streak = 0
                pending_reentry = False

            if units == 0:
                recovery_streak = (
                    recovery_streak + 1 if bool(reentry_ok.loc[day]) else 0
                )
                # 終値で確認した条件を同日の約定に使わず翌営業日に回す。
                if recovery_streak >= confirmation_days:
                    pending_reentry = True

        equity[day] = cash + units * price

    final_price = float(prices.iloc[-1])
    unrealized_profit = units * final_price - cost if units > 0 else 0.0
    liquidation_tax = math.floor(max(unrealized_profit, 0) * tax_rate)
    final_equity = cash + units * final_price
    state = {
        "in_market": units > 0,
        "final_equity_jpy": final_equity,
        "hypothetical_liquidation_tax_jpy": liquidation_tax,
        "final_after_liquidation_jpy": final_equity - liquidation_tax,
    }
    return (
        pd.DataFrame(transactions),
        pd.Series(equity).sort_index(),
        state,
    )


def _load_close(path: str) -> pd.Series:
    frame = pd.read_csv(path, parse_dates=["date"])
    return frame.set_index("date")["Close"]


def run_backtest(
    data_dir: str,
    output_dir: str,
    confirmation_days: int = 20,
) -> tuple[pd.DataFrame, dict]:
    sox = _load_close(os.path.join(data_dir, "raw", "sox_daily.csv"))
    jpy = _load_close(os.path.join(data_dir, "raw", "jpy_daily.csv"))
    jpy = jpy.reindex(sox.index, method="ffill")
    price_jpy = (sox * jpy).dropna()
    defense = build_defense_columns(sox)

    transactions, equity, state = simulate_defense_hold(
        price_jpy,
        defense,
        confirmation_days=confirmation_days,
    )
    years = (equity.index[-1] - equity.index[0]).days / 365.2425
    after_liquidation = state["final_after_liquidation_jpy"]
    max_drawdown = float((equity / equity.cummax() - 1).min() * 100)
    sells = transactions[transactions["action"] == "sell"]

    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "confirmation_days": confirmation_days,
        "capital_jpy": DEFAULT_CAPITAL_JPY,
        "start_date": equity.index[0].date().isoformat(),
        "end_date": equity.index[-1].date().isoformat(),
        "completed_defense_exits": int(len(sells)),
        "realized_tax_jpy": int(sells["tax_jpy"].sum()) if len(sells) else 0,
        "final_equity_jpy": state["final_equity_jpy"],
        "hypothetical_liquidation_tax_jpy": state[
            "hypothetical_liquidation_tax_jpy"
        ],
        "final_after_liquidation_jpy": after_liquidation,
        "after_liquidation_return_pct": (
            after_liquidation / DEFAULT_CAPITAL_JPY - 1
        )
        * 100,
        "after_liquidation_cagr_pct": (
            (after_liquidation / DEFAULT_CAPITAL_JPY) ** (1 / years) - 1
        )
        * 100,
        "max_drawdown_pct": max_drawdown,
        "in_market_at_end": state["in_market"],
    }

    os.makedirs(output_dir, exist_ok=True)
    suffix = f"{confirmation_days}d"
    transactions.to_csv(
        os.path.join(output_dir, f"defense_hold_transactions_{suffix}.csv"),
        index=False,
    )
    equity.rename("equity_jpy").to_csv(
        os.path.join(output_dir, f"defense_hold_equity_{suffix}.csv"),
        index_label="date",
    )
    with open(
        os.path.join(output_dir, f"defense_hold_summary_{suffix}.json"),
        "w",
        encoding="utf-8",
    ) as handle:
        json.dump(summary, handle, ensure_ascii=False, indent=2)
    return transactions, summary


def main() -> None:
    parser = argparse.ArgumentParser(description="防衛売却・確認後再投入バックテスト")
    parser.add_argument("--data-dir", default="data/backtest")
    parser.add_argument("--output-dir", default="data/backtest")
    parser.add_argument("--confirmation-days", type=int, default=20)
    args = parser.parse_args()
    _, summary = run_backtest(
        args.data_dir,
        args.output_dir,
        confirmation_days=args.confirmation_days,
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
