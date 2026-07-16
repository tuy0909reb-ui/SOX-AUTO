"""sox_protocol.py の買い優先順位どおりに一括売買を検証する。

判定順（sox_protocol.py）:
1. 1000円SOXレーダー -12% 以下 → 強買い（最優先）
2. 1000円SOXレーダー -8% 以下 → 買い
3. VIX>20（暴落ゾーン）かつ騰落率が週次買いライン以下 → イベント補強買い
4. 季節サイクル買い窓（年4回・各窓の最初の営業日）→ サイクル買い
5. BUY週は買い補強のみ（単独エントリーではない）

防衛プロトコル（silicon_protocol.py・別レイヤー）:
- 200MA下かつトレンド下降 → 新規買いブロック
- 250日高値から -25% 以上 → 全売却（recycle 側で適用）

過去検証の開始は各年1月（レーダー年次リセットに合わせる）。
10月開始は未来の実運用想定であり、ここでは使わない。
円建て価格は ^SOX × USD/JPY の代理値。特定口座は利益×20.315%。
"""

from __future__ import annotations

import argparse
import json
import math
import os
from datetime import datetime

import pandas as pd

from sox_utils import CYCLE_WINDOWS

DEFAULT_CAPITAL_JPY = 13_500_000.0
DEFAULT_TAX_RATE = 0.20315
DEFAULT_SELL_TARGET_PCT = 10.0
STRONG_BUY_THRESHOLD_PCT = -12.0
NORMAL_BUY_THRESHOLD_PCT = -8.0
DEFENSE_DROP_EXIT_PCT = 25.0

SEASONAL_BUY_WINDOWS = [
    (CYCLE_WINDOWS[1]["buy"][0], CYCLE_WINDOWS[1]["buy"][1], "seasonal_cycle_1"),
    (CYCLE_WINDOWS[2]["buy"][0], CYCLE_WINDOWS[2]["buy"][1], "seasonal_cycle_2"),
    (CYCLE_WINDOWS[3]["buy"][0], CYCLE_WINDOWS[3]["buy"][1], "seasonal_cycle_3"),
    (CYCLE_WINDOWS[4]["buy"][0], CYCLE_WINDOWS[4]["buy"][1], "seasonal_cycle_4"),
]


def build_defense_columns(sox_close: pd.Series) -> pd.DataFrame:
    """silicon_protocol.py と同じ 200MA / 250日高値ドロップの防衛指標。"""
    close = sox_close.dropna().copy()
    close.index = pd.to_datetime(close.index).tz_localize(None).normalize()
    close = close[~close.index.duplicated(keep="last")].sort_index()

    high_250 = close.rolling(250, min_periods=200).max()
    drop_pct = (high_250 - close) / high_250 * 100
    ma_200 = close.rolling(200, min_periods=200).mean()
    ma_trend = ma_200 - ma_200.shift(20)
    below_200ma = close < ma_200
    downward = ma_trend < 0

    return pd.DataFrame(
        {
            "defense_sox_drop_pct": drop_pct,
            "defense_sox_close": close,
            "defense_ma_200": ma_200,
            "defense_ma_trend_20d": ma_trend,
            "defense_block_buy": (below_200ma & downward).fillna(False),
            "defense_force_exit": (drop_pct >= DEFENSE_DROP_EXIT_PCT).fillna(
                False
            ),
        },
        index=close.index,
    )


def _mark_seasonal_cycle_buys(frame: pd.DataFrame) -> None:
    """各季節買い窓の最初の営業日だけサイクル買い候補にする。"""
    frame["seasonal_cycle_buy"] = False
    frame["seasonal_cycle_label"] = None
    if "buy_allowed" not in frame.columns:
        frame["buy_allowed"] = True

    mmdd = frame.index.strftime("%m-%d")
    for year in frame.index.year.unique():
        for start, end, label in SEASONAL_BUY_WINDOWS:
            mask = (
                (frame.index.year == year)
                & (mmdd >= start)
                & (mmdd <= end)
                & frame["buy_allowed"].fillna(False)
            )
            days = frame.index[mask]
            if len(days) == 0:
                continue
            first = days[0]
            if bool(frame.loc[first, "defense_block_buy"]):
                continue
            frame.loc[first, "seasonal_cycle_buy"] = True
            frame.loc[first, "seasonal_cycle_label"] = label


def build_protocol_frame(
    panel: pd.DataFrame,
    radar_daily: pd.DataFrame,
    sox_close: pd.Series | None = None,
    strong_buy_threshold_pct: float = STRONG_BUY_THRESHOLD_PCT,
    normal_buy_threshold_pct: float = NORMAL_BUY_THRESHOLD_PCT,
) -> pd.DataFrame:
    """sox_protocol.py と同じ優先順位で日次の買いシグナルを付ける。"""
    required_panel = {
        "date",
        "order_date_jst",
        "estimated_execution_date_jst",
        "week_phase",
        "buy_line",
        "crash_zone",
        "vix",
    }
    missing_panel = required_panel - set(panel.columns)
    if missing_panel:
        raise ValueError(f"panel columns missing: {sorted(missing_panel)}")
    if not {"date", "total_return_pct"}.issubset(radar_daily.columns):
        raise ValueError("radar_daily requires date and total_return_pct")

    frame = panel.copy()
    for column in ("date", "order_date_jst", "estimated_execution_date_jst"):
        frame[column] = pd.to_datetime(frame[column])
    frame = frame.set_index("date").sort_index()

    radar = radar_daily.copy()
    radar["date"] = pd.to_datetime(radar["date"])
    radar = radar.set_index("date")["total_return_pct"].sort_index()
    frame = frame.join(radar.rename("radar_return_pct"))

    # sox_protocol.py: sox_change = (HYOKA - MOTOMOTO) / MOTOMOTO * 100
    # レーダーは毎日1000円SOXの年内累積騰落率で代用する。
    frame["strong_buy"] = (
        frame["radar_return_pct"] <= strong_buy_threshold_pct
    )
    frame["normal_buy"] = (
        frame["radar_return_pct"] <= normal_buy_threshold_pct
    )

    # is_my_bottom: SOX_MOVE_RATE <= buy_line
    # buy_line は BUY週-0.10 / SELL週-0.06 / HOLD週-0.08
    frame["is_my_bottom"] = (
        frame["radar_return_pct"] / 100.0
    ) <= frame["buy_line"]

    # イベント補強買い: crash_zone(VIX>20) かつ is_my_bottom
    frame["event_buy"] = (
        frame["crash_zone"].fillna(False) & frame["is_my_bottom"].fillna(False)
    )

    # BUY週単独は「買い補強」であり、ここでは単独エントリーに使わない。
    # レーダー優先 → なければイベント補強、の順。
    frame["buy_reason"] = None
    strong_label = f"radar_strong_{strong_buy_threshold_pct:g}"
    normal_label = f"radar_normal_{normal_buy_threshold_pct:g}"
    frame.loc[frame["strong_buy"], "buy_reason"] = strong_label
    frame.loc[
        frame["buy_reason"].isna() & frame["normal_buy"], "buy_reason"
    ] = normal_label
    frame.loc[
        frame["buy_reason"].isna() & frame["event_buy"], "buy_reason"
    ] = "event_vix_and_bottom"

    if sox_close is not None:
        defense = build_defense_columns(sox_close)
        frame = frame.join(defense, how="left")
        frame["defense_block_buy"] = frame["defense_block_buy"].fillna(False)
        frame["defense_force_exit"] = frame["defense_force_exit"].fillna(False)
    else:
        frame["defense_sox_drop_pct"] = None
        frame["defense_block_buy"] = False
        frame["defense_force_exit"] = False

    _mark_seasonal_cycle_buys(frame)
    frame.loc[
        frame["buy_reason"].isna() & frame["seasonal_cycle_buy"],
        "buy_reason",
    ] = frame.loc[
        frame["buy_reason"].isna() & frame["seasonal_cycle_buy"],
        "seasonal_cycle_label",
    ]

    # 防衛: 200MA下かつ下降トレンド中は新規買いをブロック（レーダー買いも含む）
    frame.loc[frame["defense_block_buy"], "buy_reason"] = None
    frame["protocol_buy_signal"] = frame["buy_reason"].notna()
    return frame


def simulate_lump_sum_cohorts(
    protocol_frame: pd.DataFrame,
    price_jpy: pd.Series,
    start_years: range | list[int],
    capital_jpy: float = DEFAULT_CAPITAL_JPY,
    tax_rate: float = DEFAULT_TAX_RATE,
    sell_target_pct: float = DEFAULT_SELL_TARGET_PCT,
) -> pd.DataFrame:
    """各年1月開始の独立ケース。年内に買いシグナルが出た最初の日で一括購入する。"""
    if capital_jpy <= 0:
        raise ValueError("capital_jpy must be positive")
    if not 0 <= tax_rate <= 1:
        raise ValueError("tax_rate must be between 0 and 1")
    if sell_target_pct <= 0:
        raise ValueError("sell_target_pct must be positive")

    prices = price_jpy.dropna().copy()
    prices.index = pd.to_datetime(prices.index).tz_localize(None).normalize()
    prices = prices[~prices.index.duplicated(keep="last")].sort_index()
    if prices.empty:
        return pd.DataFrame()

    target_multiplier = 1 + sell_target_pct / 100
    rows: list[dict] = []

    for start_year in start_years:
        observation_start = pd.Timestamp(start_year, 1, 1)
        observation_end = pd.Timestamp(start_year + 1, 1, 1)
        candidates = protocol_frame[
            protocol_frame["protocol_buy_signal"]
            & (protocol_frame.index >= observation_start)
            & (protocol_frame.index < observation_end)
        ]

        if candidates.empty:
            rows.append(
                {
                    "start_year": start_year,
                    "status": "no_entry",
                    "observation_start": observation_start.date().isoformat(),
                    "observation_end": observation_end.date().isoformat(),
                }
            )
            continue

        signal_date = candidates.index[0]
        signal = candidates.iloc[0]
        execution_candidates = prices[
            prices.index >= signal["estimated_execution_date_jst"]
        ]
        if execution_candidates.empty:
            rows.append(
                {
                    "start_year": start_year,
                    "status": "no_execution_data",
                    "signal_date": signal_date.date().isoformat(),
                    "buy_reason": signal["buy_reason"],
                }
            )
            continue

        buy_date = execution_candidates.index[0]
        buy_price = float(execution_candidates.iloc[0])
        units = capital_jpy / buy_price
        after_buy = prices[prices.index > buy_date]
        target_hits = after_buy[after_buy >= buy_price * target_multiplier]

        if target_hits.empty:
            sale_date = prices.index[-1]
            sale_price = float(prices.iloc[-1])
            status = "open"
        else:
            sale_date = target_hits.index[0]
            sale_price = float(target_hits.iloc[0])
            status = "sold"

        sale_value = units * sale_price
        gross_profit = sale_value - capital_jpy
        estimated_tax = math.floor(max(gross_profit, 0) * tax_rate)
        net_sale_value = sale_value - estimated_tax
        holding_days = int((sale_date - buy_date).days)
        holding_term = (
            "short"
            if holding_days <= 90
            else "medium"
            if holding_days <= 365
            else "long"
        )
        path = prices.loc[buy_date:sale_date] / buy_price - 1

        rows.append(
            {
                "start_year": start_year,
                "status": status,
                "observation_start": observation_start.date().isoformat(),
                "observation_end": observation_end.date().isoformat(),
                "signal_date": signal_date.date().isoformat(),
                "order_date_jst": signal["order_date_jst"].date().isoformat(),
                "buy_date": buy_date.date().isoformat(),
                "sale_or_valuation_date": sale_date.date().isoformat(),
                "holding_days": holding_days,
                "holding_term": holding_term,
                "buy_reason": signal["buy_reason"],
                "radar_return_pct": float(signal["radar_return_pct"]),
                "week_phase": signal["week_phase"],
                "buy_line": float(signal["buy_line"]),
                "vix": (
                    float(signal["vix"]) if pd.notna(signal["vix"]) else None
                ),
                "crash_zone": bool(signal["crash_zone"]),
                "is_my_bottom": bool(signal["is_my_bottom"]),
                "buy_price_jpy_proxy": buy_price,
                "sale_price_jpy_proxy": sale_price,
                "units": units,
                "capital_jpy": capital_jpy,
                "gross_sale_value_jpy": sale_value,
                "gross_profit_jpy": gross_profit,
                "estimated_tax_jpy": estimated_tax,
                "net_sale_value_jpy": net_sale_value,
                "net_profit_jpy": net_sale_value - capital_jpy,
                "net_return_pct": (net_sale_value / capital_jpy - 1) * 100,
                "worst_return_from_entry_pct": float(path.min() * 100),
            }
        )

    return pd.DataFrame(rows)


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

    protocol = build_protocol_frame(panel, radar, sox_close=sox)
    first_year = max(2006, int(protocol.index.min().year))
    last_available_date = price_jpy.index.max()
    # 当年データが途中で終わる場合、その年は未完了として集計から外す。
    last_complete_start_year = int(last_available_date.year) - (
        0 if last_available_date.month == 12 and last_available_date.day >= 28
        else 1
    )
    results = simulate_lump_sum_cohorts(
        protocol,
        price_jpy,
        range(first_year, last_complete_start_year + 1),
        capital_jpy=capital_jpy,
        tax_rate=tax_rate,
    )

    os.makedirs(output_dir, exist_ok=True)
    result_path = os.path.join(output_dir, "protocol_lump_sum_results.csv")
    results.to_csv(result_path, index=False)

    traded = results[results["status"].isin(["sold", "open"])].copy()
    sold = traded[traded["status"] == "sold"]
    reason_counts = (
        traded["buy_reason"].value_counts().to_dict() if len(traded) else {}
    )
    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "capital_jpy": capital_jpy,
        "account_type": "taxable_specific_account_estimate",
        "tax_rate": tax_rate,
        "protocol_source": "sox_protocol.py buy priority",
        "entry_rules": [
            "radar <= -12%: strong buy (highest priority)",
            "radar <= -8%: normal buy",
            "VIX > 20 and radar move <= weekly buy_line: event buy",
            "seasonal cycle buy window (4x/year, first trading day each window)",
            "BUY week alone is reinforcement only, not a standalone entry",
            "defense: block new buys when SOX below falling 200MA",
        ],
        "sell_target_pct": DEFAULT_SELL_TARGET_PCT,
        "entry_search_window": "January 1 through December 31 of each start year",
        "case_count": int(len(results)),
        "entry_count": int(len(traded)),
        "no_entry_count": int((results["status"] == "no_entry").sum()),
        "sold_count": int(len(sold)),
        "buy_reason_counts": reason_counts,
        "median_holding_days": (
            float(sold["holding_days"].median()) if len(sold) else None
        ),
        "average_net_profit_jpy": (
            float(sold["net_profit_jpy"].mean()) if len(sold) else None
        ),
        "total_estimated_tax_jpy": (
            int(sold["estimated_tax_jpy"].sum()) if len(sold) else 0
        ),
        "worst_return_from_entry_pct": (
            float(sold["worst_return_from_entry_pct"].min())
            if len(sold)
            else None
        ),
        "limitations": [
            "Price proxy is ^SOX close multiplied by USD/JPY close, not Nissei SOX fund NAV.",
            "Trust fees, tracking error, distribution treatment and order-to-NAV timing are excluded.",
            "Tax is positive gain multiplied by 20.315%, rounded down below one yen.",
            "Silicon defense blocks buys below falling 200MA; -25% from 250d high forces exit in recycle backtest.",
        ],
        "files": {"results": os.path.basename(result_path)},
    }
    with open(
        os.path.join(output_dir, "protocol_lump_sum_summary.json"),
        "w",
        encoding="utf-8",
    ) as handle:
        json.dump(summary, handle, indent=2, ensure_ascii=False)
    return results, summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="sox_protocol.pyどおりの1,350万円一括売買バックテスト"
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
