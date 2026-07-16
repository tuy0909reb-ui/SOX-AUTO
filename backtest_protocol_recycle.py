"""売却条件を接続した連続再投入バックテスト。

買い（sox_protocol.py の優先順位 + 季節サイクル）:
  1. 1000円レーダー -12% 以下（強買い・最優先）
  2. 1000円レーダー -8% 以下（買い）
  3. VIX>20 かつ騰落率が週次買いライン以下（イベント補強買い）
  4. 季節サイクル買い窓（年4回・各窓の最初の営業日）

防衛（silicon_protocol.py・別レイヤー）:
  - 200MA下かつ下降トレンド → 新規買いブロック
  - 250日高値から -25% 以上 → 全売却（defense_drop_25pct）

売り（メインサイクル）:
  A. 保有フェーズ別の利確ライン
       短期(<=90日): +10% / 中期(<=365日): +8% / 長期(>365日): +6%
  B. 季節サイクルの売り窓（sox_utils.py の CYCLE_WINDOWS）で含み益>=+3%
  C. 週次SELL週（WEEK_ANOMALY）で含み益>=+3%

売却後は税引後資金で待機し、次の買いシグナルで再投入する。
価格は ^SOX × USD/JPY の代理値。特定口座は実現益×20.315%。
"""

from __future__ import annotations

import argparse
import json
import math
import os
from datetime import datetime

import pandas as pd

from backtest_protocol_lump_sum import build_defense_columns, build_protocol_frame
from sox_protocol import WEEK_ANOMALY

DEFAULT_CAPITAL_JPY = 13_500_000.0
DEFAULT_TAX_RATE = 0.20315

SHORT_TARGET_PCT = 10.0
MEDIUM_TARGET_PCT = 8.0
LONG_TARGET_PCT = 6.0
CYCLE_MIN_PROFIT_PCT = 3.0

# sox_utils.py の CYCLE_WINDOWS と同じ売り窓（月日）
SEASONAL_SELL_WINDOWS = [
    ("04-01", "04-20"),
    ("07-20", "07-31"),
    ("09-10", "09-20"),
    ("12-10", "12-20"),
]


def _in_seasonal_sell_window(day: pd.Timestamp) -> bool:
    mmdd = day.strftime("%m-%d")
    return any(start <= mmdd <= end for start, end in SEASONAL_SELL_WINDOWS)


def _is_sell_week(day: pd.Timestamp) -> bool:
    week_no = int(day.isocalendar().week)
    return WEEK_ANOMALY.get(week_no) == "SELL"


def _phase_and_target(holding_days: int) -> tuple[str, float]:
    if holding_days <= 90:
        return "short", SHORT_TARGET_PCT
    if holding_days <= 365:
        return "medium", MEDIUM_TARGET_PCT
    return "long", LONG_TARGET_PCT


def decide_sell(
    day: pd.Timestamp,
    holding_days: int,
    return_pct: float,
) -> str | None:
    """売却理由を返す。売らないなら None。"""
    phase, target = _phase_and_target(holding_days)
    if return_pct >= target:
        return f"take_profit_{phase}"
    if return_pct >= CYCLE_MIN_PROFIT_PCT and _in_seasonal_sell_window(day):
        return "seasonal_window"
    if return_pct >= CYCLE_MIN_PROFIT_PCT and _is_sell_week(day):
        return "sell_week"
    return None


def simulate_recycle(
    protocol_frame: pd.DataFrame,
    price_jpy: pd.Series,
    capital_jpy: float = DEFAULT_CAPITAL_JPY,
    tax_rate: float = DEFAULT_TAX_RATE,
    defense_daily: pd.DataFrame | None = None,
) -> tuple[pd.DataFrame, pd.Series]:
    """連続再投入シミュレーション。約定明細と日次資産推移を返す。"""
    if capital_jpy <= 0:
        raise ValueError("capital_jpy must be positive")
    if not 0 <= tax_rate <= 1:
        raise ValueError("tax_rate must be between 0 and 1")

    prices = price_jpy.dropna().copy()
    prices.index = pd.to_datetime(prices.index).tz_localize(None).normalize()
    prices = prices[~prices.index.duplicated(keep="last")].sort_index()
    if prices.empty:
        return pd.DataFrame(), pd.Series(dtype=float)

    frame = protocol_frame.sort_index()
    signal_days = set(frame.index[frame["protocol_buy_signal"]])
    cash = capital_jpy
    units = 0.0
    cost = 0.0
    buy_date: pd.Timestamp | None = None
    buy_reason: str | None = None
    pending_buy: tuple[pd.Timestamp, pd.Timestamp, str] | None = None

    trades: list[dict] = []
    equity: dict[pd.Timestamp, float] = {}

    for day in prices.index:
        price = float(prices.loc[day])

        # 保有中は売却判定を先に行う（防衛の全売却が最優先）。
        if units > 0 and cost > 0:
            return_pct = (units * price - cost) / cost * 100
            holding_days = int((day - buy_date).days)
            reason = None
            if defense_daily is not None and day in defense_daily.index:
                if bool(defense_daily.loc[day, "defense_force_exit"]):
                    reason = "defense_drop_25pct"
            if reason is None:
                reason = decide_sell(day, holding_days, return_pct)
            if reason is not None:
                proceeds = units * price
                gross_profit = proceeds - cost
                tax = math.floor(max(gross_profit, 0) * tax_rate)
                cash = proceeds - tax
                phase, _ = _phase_and_target(holding_days)
                trades.append(
                    {
                        "buy_date": buy_date.date().isoformat(),
                        "sell_date": day.date().isoformat(),
                        "holding_days": holding_days,
                        "holding_term": phase,
                        "buy_reason": buy_reason,
                        "sell_reason": reason,
                        "return_pct": return_pct,
                        "cost_jpy": cost,
                        "proceeds_jpy": proceeds,
                        "gross_profit_jpy": gross_profit,
                        "tax_jpy": tax,
                        "net_profit_jpy": gross_profit - tax,
                        "cash_after_sell_jpy": cash,
                    }
                )
                units = 0.0
                cost = 0.0
                buy_date = None
                buy_reason = None

        # シグナル時点で記録した推定約定日以降の最初の価格で買う。
        if (
            pending_buy is not None
            and units == 0
            and cash > 0
            and day >= pending_buy[1]
        ):
            buy_price = price
            units = cash / buy_price
            cost = cash
            cash = 0.0
            buy_date = day
            buy_reason = pending_buy[2]
            pending_buy = None

        # 本日がシグナル日ならパネルの推定約定日で予約（フラット時のみ）。
        if day in signal_days and units == 0 and pending_buy is None:
            signal = frame.loc[day]
            pending_buy = (
                day,
                pd.Timestamp(signal["estimated_execution_date_jst"]),
                str(signal["buy_reason"]),
            )

        equity[day] = cash + units * price

    equity_series = pd.Series(equity).sort_index()
    return pd.DataFrame(trades), equity_series


def _load_close(path: str) -> pd.Series:
    frame = pd.read_csv(path, parse_dates=["date"])
    return frame.set_index("date")["Close"]


def run_backtest(
    data_dir: str,
    output_dir: str,
    capital_jpy: float = DEFAULT_CAPITAL_JPY,
    tax_rate: float = DEFAULT_TAX_RATE,
) -> tuple[pd.DataFrame, dict]:
    panel = pd.read_csv(os.path.join(data_dir, "backtest_panel.csv"))
    radar = pd.read_csv(os.path.join(data_dir, "daily_1000_sox.csv"))
    sox = _load_close(os.path.join(data_dir, "raw", "sox_daily.csv"))
    jpy = _load_close(os.path.join(data_dir, "raw", "jpy_daily.csv"))
    jpy = jpy.reindex(sox.index, method="ffill")
    price_jpy = (sox * jpy).dropna()

    defense_daily = build_defense_columns(sox)
    protocol = build_protocol_frame(panel, radar, sox_close=sox)
    trades, equity = simulate_recycle(
        protocol,
        price_jpy,
        capital_jpy=capital_jpy,
        tax_rate=tax_rate,
        defense_daily=defense_daily,
    )

    os.makedirs(output_dir, exist_ok=True)
    trades_path = os.path.join(output_dir, "protocol_recycle_trades.csv")
    trades.to_csv(trades_path, index=False)
    equity.rename("equity_jpy").to_csv(
        os.path.join(output_dir, "protocol_recycle_equity.csv"),
        index_label="date",
    )

    trades_per_year: dict[str, int] = {}
    if not trades.empty:
        years = pd.to_datetime(trades["sell_date"]).dt.year
        trades_per_year = {
            str(year): int(count)
            for year, count in years.value_counts().sort_index().items()
        }

    final_equity = float(equity.iloc[-1]) if len(equity) else capital_jpy
    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "capital_jpy": capital_jpy,
        "account_type": "taxable_specific_account_estimate",
        "tax_rate": tax_rate,
        "buy_rules": [
            "radar <= -12% strong buy (priority)",
            "radar <= -8% buy",
            "VIX > 20 and radar move <= weekly buy_line: event buy",
            "seasonal cycle buy window (4x/year, first trading day each window)",
            "defense: block new buys when SOX below falling 200MA",
        ],
        "sell_rules": [
            "defense: full exit when SOX drop from 250d high >= 25%",
            "take profit by phase: short<=90d +10%, medium<=365d +8%, long +6%",
            "seasonal sell window with gain >= +3%",
            "weekly SELL week with gain >= +3%",
        ],
        "period": {
            "first": equity.index.min().date().isoformat() if len(equity) else None,
            "last": equity.index.max().date().isoformat() if len(equity) else None,
        },
        "completed_trades": int(len(trades)),
        "sold_terms": (
            trades["holding_term"].value_counts().to_dict()
            if not trades.empty
            else {}
        ),
        "sell_reason_counts": (
            trades["sell_reason"].value_counts().to_dict()
            if not trades.empty
            else {}
        ),
        "trades_per_year": trades_per_year,
        "avg_trades_per_active_year": (
            round(sum(trades_per_year.values()) / len(trades_per_year), 2)
            if trades_per_year
            else 0
        ),
        "median_holding_days": (
            float(trades["holding_days"].median()) if not trades.empty else None
        ),
        "total_tax_jpy": (
            int(trades["tax_jpy"].sum()) if not trades.empty else 0
        ),
        "total_net_profit_jpy": (
            int(trades["net_profit_jpy"].sum()) if not trades.empty else 0
        ),
        "final_equity_jpy": final_equity,
        "total_return_pct": (final_equity / capital_jpy - 1) * 100,
        "limitations": [
            "Price proxy is ^SOX close multiplied by USD/JPY close, not Nissei SOX fund NAV.",
            "One position at a time; full post-tax capital is redeployed on the next buy signal.",
            "Trust fees, tracking error, distribution treatment and order timing are excluded.",
            "Silicon defense: 200MA buy block and -25% from 250d high force exit are applied.",
        ],
        "files": {
            "trades": os.path.basename(trades_path),
            "equity": "protocol_recycle_equity.csv",
        },
    }
    with open(
        os.path.join(output_dir, "protocol_recycle_summary.json"),
        "w",
        encoding="utf-8",
    ) as handle:
        json.dump(summary, handle, indent=2, ensure_ascii=False)
    return trades, summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="売却条件を接続した連続再投入バックテスト"
    )
    parser.add_argument("--data-dir", default="data/backtest")
    parser.add_argument("--output-dir", default="data/backtest")
    parser.add_argument("--capital", type=float, default=DEFAULT_CAPITAL_JPY)
    parser.add_argument("--tax-rate", type=float, default=DEFAULT_TAX_RATE)
    args = parser.parse_args()

    _, summary = run_backtest(
        args.data_dir,
        args.output_dir,
        capital_jpy=args.capital,
        tax_rate=args.tax_rate,
    )
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
