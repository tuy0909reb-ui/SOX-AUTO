"""
バックテスト用の市場データを取得し、日次パネル CSV を生成する。

出力先: data/backtest/
  - manifest.json       … メタデータ
  - raw/*.csv           … ティッカー別 OHLCV
  - backtest_panel.csv  … 指標付き日次パネル（バックテスト本体用）
  - daily_1000_sox.csv  … 毎営業日1000円・年末リセットの評価推移
  - annual_summary.csv  … 年別の投資成績
  - weekly_summary.csv  … 入出金調整後の週次成績
  - worst_weeks.csv     … 週次リターンが低い順の20週
"""

import argparse
import json
import os
from datetime import date, datetime, timedelta

import pandas as pd

from sox_protocol import WEEK_ANOMALY
from sox_utils import calc_RSI, fetch_with_retry, safe_float

DEFAULT_START = "2006-01-01"
DEFAULT_OUTPUT_DIR = "data/backtest"
DAILY_INVESTMENT_JPY = 1000.0

# sox_protocol.py と同じティッカー構成（日次ベース）
DAILY_TICKERS = {
    "^SOX": "sox",
    "^VIX": "vix",
    "^IXIC": "nasdaq",
    "JPY=X": "jpy",
    "NQ=F": "nq_f",
}


def japan_holidays(year: int) -> set[date]:
    """Return Japanese national holidays for the supported backtest years."""

    def nth_monday(month: int, nth: int) -> date:
        first = date(year, month, 1)
        return first + timedelta(days=(7 - first.weekday()) % 7 + 7 * (nth - 1))

    # Equinox formulas published for the 1980-2099 calendar range.
    vernal_day = int(20.8431 + 0.242194 * (year - 1980) - (year - 1980) // 4)
    autumn_day = int(23.2488 + 0.242194 * (year - 1980) - (year - 1980) // 4)

    holidays = {
        date(year, 1, 1),
        nth_monday(1, 2),
        date(year, 2, 11),
        date(year, 2, 23),
        date(year, 3, vernal_day),
        date(year, 4, 29),
        date(year, 5, 3),
        date(year, 5, 4),
        date(year, 5, 5),
        nth_monday(9, 3),
        date(year, 9, autumn_day),
        date(year, 11, 3),
        date(year, 11, 23),
    }

    # Marine Day, Mountain Day and Sports Day were moved for the Olympics.
    if year == 2020:
        holidays.update({date(2020, 7, 23), date(2020, 7, 24), date(2020, 8, 10)})
    elif year == 2021:
        holidays.update({date(2021, 7, 22), date(2021, 7, 23), date(2021, 8, 8)})
    else:
        holidays.update({nth_monday(7, 3), date(year, 8, 11), nth_monday(10, 2)})

    # Substitute holidays: a Sunday holiday moves to the next non-holiday.
    for holiday in sorted(tuple(holidays)):
        if holiday.weekday() == 6:
            substitute = holiday + timedelta(days=1)
            while substitute in holidays:
                substitute += timedelta(days=1)
            holidays.add(substitute)

    # Citizen's holidays: a weekday between two national holidays is a holiday.
    cursor = date(year, 1, 2)
    while cursor < date(year, 12, 31):
        if (
            cursor.weekday() < 5
            and cursor not in holidays
            and cursor - timedelta(days=1) in holidays
            and cursor + timedelta(days=1) in holidays
        ):
            holidays.add(cursor)
        cursor += timedelta(days=1)

    return holidays


def _next_japan_business_day(day: date, holidays_by_year: dict[int, set[date]]) -> date:
    candidate = day + timedelta(days=1)
    while candidate.weekday() >= 5 or candidate in holidays_by_year.get(candidate.year, set()):
        candidate += timedelta(days=1)
    return candidate


def _buy_calendar_status(
    order_date: date, holidays_by_year: dict[int, set[date]]
) -> tuple[bool, str | None]:
    if order_date.weekday() == 4:
        return False, "friday"
    if order_date.weekday() >= 5:
        return False, "weekend"
    if order_date in holidays_by_year.get(order_date.year, set()):
        return False, "japan_holiday"
    if order_date + timedelta(days=1) in holidays_by_year.get(
        (order_date + timedelta(days=1)).year, set()
    ):
        return False, "before_japan_holiday"
    return True, None


def _normalize_index(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.index = pd.to_datetime(out.index).tz_localize(None).normalize()
    return out[~out.index.duplicated(keep="last")].sort_index()


def fetch_daily_ohlcv(ticker: str, start: str, end: str) -> pd.DataFrame:
    df = fetch_with_retry(ticker, start=start, end=end, interval="1d", auto_adjust=False)
    return _normalize_index(df)


def save_raw_csv(df: pd.DataFrame, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out = df.copy()
    out.index.name = "date"
    out.to_csv(path)


def _week_phase(week_no: int) -> str:
    return WEEK_ANOMALY.get(week_no, "HOLD")


def _buy_sell_lines(week_phase: str) -> tuple[float, float]:
    if week_phase == "BUY":
        return -0.10, 0.08
    if week_phase == "SELL":
        return -0.06, 0.10
    return -0.08, 0.08


def _anomaly_factor(week_phase: str) -> float:
    if week_phase == "BUY":
        return 0.95
    if week_phase == "SELL":
        return 1.05
    return 1.0


def build_panel(
    sox: pd.Series,
    vix: pd.Series,
    nasdaq: pd.Series,
    jpy: pd.Series,
    nq_f: pd.Series,
) -> pd.DataFrame:
    """^SOX の営業日を基準に、sox_protocol 相当の指標を日次で計算する。"""
    sox = sox.dropna().sort_index()
    ma5 = sox.rolling(5).mean()
    ma25 = sox.rolling(25).mean()
    rsi14 = calc_RSI(sox, period=14)

    weekly = sox.resample("W-FRI").last().dropna()
    wma5 = weekly.rolling(5).mean()
    wma25 = weekly.rolling(25).mean()
    weekly_gc = (wma5 > wma25).reindex(sox.index, method="ffill")

    recent_returns = sox.pct_change()
    vix = vix.reindex(sox.index, method="ffill")
    nasdaq = nasdaq.reindex(sox.index, method="ffill")
    jpy = jpy.reindex(sox.index, method="ffill")
    nq_f = nq_f.reindex(sox.index, method="ffill")
    # The order decision must not see same-session futures data.  Shift both
    # futures and its spot comparison by one completed US market session.
    nq_f_previous = nq_f.shift(1)
    nasdaq_previous = nasdaq.shift(1)

    years = range(sox.index.min().year, sox.index.max().year + 2)
    holidays_by_year = {year: japan_holidays(year) for year in years}

    rows = []
    for position, dt in enumerate(sox.index):
        if pd.isna(ma25.loc[dt]) or pd.isna(rsi14.loc[dt]):
            continue

        week_no = int(dt.isocalendar().week)
        week_phase = _week_phase(week_no)
        buy_line, sell_line = _buy_sell_lines(week_phase)
        anomaly_factor = _anomaly_factor(week_phase)

        sox_index = safe_float(sox.loc[dt])
        ma5_v = safe_float(ma5.loc[dt])
        ma25_v = safe_float(ma25.loc[dt])
        rsi_v = safe_float(rsi14.loc[dt])
        vix_v = safe_float(vix.loc[dt]) if pd.notna(vix.loc[dt]) else None
        nasdaq_v = safe_float(nasdaq.loc[dt]) if pd.notna(nasdaq.loc[dt]) else None
        nq_f_v = (
            safe_float(nq_f_previous.loc[dt])
            if pd.notna(nq_f_previous.loc[dt])
            else None
        )
        nasdaq_previous_v = (
            safe_float(nasdaq_previous.loc[dt])
            if pd.notna(nasdaq_previous.loc[dt])
            else None
        )
        jpy_v = safe_float(jpy.loc[dt]) if pd.notna(jpy.loc[dt]) else None

        jpy_prev = safe_float(jpy.shift(1).loc[dt]) if pd.notna(jpy.shift(1).loc[dt]) else None

        # SOX=F の信頼できる日次履歴がないため、現物終値で代用しない。
        # 過去時点で取得できる NQ 先物だけを確認材料にする。
        sox_f_proxy = None
        sox_f_move = None
        nasdaq_f_move = (
            (nq_f_v - nasdaq_previous_v) / nasdaq_previous_v * 100
            if nq_f_v is not None and nasdaq_previous_v not in (None, 0)
            else None
        )
        jpy_move = (
            (jpy_v - jpy_prev) / jpy_prev * 100
            if jpy_v is not None and jpy_prev not in (None, 0)
            else None
        )

        ret_tail = recent_returns.loc[:dt].dropna().tail(3)
        max_down_event = bool(len(ret_tail) >= 3 and ret_tail.min() <= -0.03)
        max_up_event = bool(len(ret_tail) >= 3 and ret_tail.max() >= 0.03)

        last5 = sox.loc[:dt].tail(5)
        mean5 = last5.mean()
        median5 = last5.median()
        mean_median_reverse = bool(mean5 < median5 and sox_index > mean5)

        day_dc = ma5_v < ma25_v
        wgc = bool(weekly_gc.loc[dt]) if pd.notna(weekly_gc.loc[dt]) else False
        crash_zone = vix_v is not None and vix_v > 20
        pm_overheat = (
            nasdaq_f_move is not None and nasdaq_f_move >= 1.0
        )
        is_market_bottom = (
            rsi_v <= 45
            and sox_index <= ma25_v * 0.97
            and day_dc
            and wgc
        )
        rebound_expect = ((ma25_v - sox_index) / sox_index) * anomaly_factor * 100
        order_date = dt.date() + timedelta(days=1)
        buy_calendar_allowed, buy_block_reason = _buy_calendar_status(
            order_date, holidays_by_year
        )
        previous_futures_available = nq_f_v is not None
        buy_allowed = buy_calendar_allowed and previous_futures_available
        if buy_calendar_allowed and not previous_futures_available:
            buy_block_reason = "previous_futures_unavailable"
        estimated_execution_date = _next_japan_business_day(
            order_date, holidays_by_year
        )
        previous_session_date = (
            sox.index[position - 1].date().isoformat() if position > 0 else None
        )

        rows.append(
            {
                "date": dt.date().isoformat(),
                "order_date_jst": order_date.isoformat(),
                "estimated_execution_date_jst": estimated_execution_date.isoformat(),
                "buy_calendar_allowed": buy_calendar_allowed,
                "previous_futures_available": previous_futures_available,
                "buy_allowed": buy_allowed,
                "buy_block_reason": buy_block_reason,
                "futures_observed_session": previous_session_date,
                "week_no": week_no,
                "week_phase": week_phase,
                "buy_line": buy_line,
                "sell_line": sell_line,
                "anomaly_factor": anomaly_factor,
                "sox_close": sox_index,
                "ma5": ma5_v,
                "ma25": ma25_v,
                "rsi14": rsi_v,
                "weekly_gc": wgc,
                "day_dc": day_dc,
                "vix": vix_v,
                "sox_f_proxy": sox_f_proxy,
                "nasdaq_close": nasdaq_v,
                "nq_f_previous_close": nq_f_v,
                "jpy": jpy_v,
                "sox_f_move_pct": None,
                "nasdaq_f_move_pct": round(nasdaq_f_move, 4) if nasdaq_f_move is not None else None,
                "jpy_move_pct": round(jpy_move, 4) if jpy_move is not None else None,
                "crash_zone": crash_zone,
                "pm_overheat": pm_overheat,
                "market_bottom": is_market_bottom,
                "max_down_event": max_down_event,
                "max_up_event": max_up_event,
                "mean_median_reverse": mean_median_reverse,
                "rebound_expect_pct": round(rebound_expect, 4),
                "fwd_return_5d_pct": None,
                "fwd_return_20d_pct": None,
            }
        )

    panel = pd.DataFrame(rows)
    if panel.empty:
        return panel

    panel["fwd_return_5d_pct"] = (
        sox.reindex(pd.to_datetime(panel["date"])).pct_change(5).shift(-5).values * 100
    )
    panel["fwd_return_20d_pct"] = (
        sox.reindex(pd.to_datetime(panel["date"])).pct_change(20).shift(-20).values * 100
    )
    return panel.round(4)


def simulate_daily_1000_yen(
    sox: pd.Series,
    jpy: pd.Series,
    daily_investment_jpy: float = DAILY_INVESTMENT_JPY,
) -> pd.DataFrame:
    """SOX営業日ごとに円建てで積み立て、各年の最終営業日に全口売却する。

    ^SOXは売買できないため、配当・手数料なしで指数の端数口を買えると仮定する。
    USD/JPYは同日終値をSOX営業日にforward-fillして使用する。
    """
    if daily_investment_jpy <= 0:
        raise ValueError("daily_investment_jpy must be positive")

    sox = _normalize_index(sox.to_frame("sox_close"))["sox_close"].dropna()
    jpy = _normalize_index(jpy.to_frame("jpy"))["jpy"]
    prices = pd.concat(
        [sox.rename("sox_close"), jpy.reindex(sox.index, method="ffill").rename("jpy")],
        axis=1,
    ).dropna()
    if prices.empty:
        return pd.DataFrame()

    prices["year"] = prices.index.year
    rows = []
    for year, yearly in prices.groupby("year", sort=True):
        units = 0.0
        invested = 0.0
        previous_value = 0.0
        last_date = yearly.index[-1]

        for dt, values in yearly.iterrows():
            sox_close = float(values["sox_close"])
            usd_jpy = float(values["jpy"])
            price_jpy = sox_close * usd_jpy
            units_bought = daily_investment_jpy / price_jpy
            units += units_bought
            invested += daily_investment_jpy
            market_value = units * price_jpy
            daily_market_pnl = market_value - previous_value - daily_investment_jpy
            capital_before_move = previous_value + daily_investment_jpy
            daily_return = (
                daily_market_pnl / capital_before_move * 100
                if capital_before_move
                else 0.0
            )
            is_year_end = dt == last_date

            rows.append(
                {
                    "date": dt.date().isoformat(),
                    "year": int(year),
                    "sox_close_usd": sox_close,
                    "usd_jpy": usd_jpy,
                    "sox_price_jpy": price_jpy,
                    "daily_investment_jpy": daily_investment_jpy,
                    "units_bought": units_bought,
                    "cumulative_units": units,
                    "cumulative_investment_jpy": invested,
                    "market_value_jpy": market_value,
                    "unrealized_pnl_jpy": market_value - invested,
                    "total_return_pct": (market_value / invested - 1) * 100,
                    "daily_market_pnl_jpy": daily_market_pnl,
                    "daily_account_return_pct": daily_return,
                    "sold_at_year_end": is_year_end,
                    "year_end_sale_value_jpy": market_value if is_year_end else None,
                }
            )
            previous_value = market_value

    return pd.DataFrame(rows).round(6)


def summarize_annual_results(daily: pd.DataFrame) -> pd.DataFrame:
    """日次シミュレーションから年別成績を作る。"""
    if daily.empty:
        return pd.DataFrame()

    rows = []
    for year, group in daily.groupby("year", sort=True):
        last = group.iloc[-1]
        rows.append(
            {
                "year": int(year),
                "first_purchase_date": group.iloc[0]["date"],
                "sale_date": last["date"],
                "purchase_days": int(len(group)),
                "total_investment_jpy": float(group["daily_investment_jpy"].sum()),
                "sale_value_jpy": float(last["market_value_jpy"]),
                "profit_loss_jpy": float(
                    last["market_value_jpy"] - group["daily_investment_jpy"].sum()
                ),
                "return_pct": float(last["total_return_pct"]),
            }
        )
    return pd.DataFrame(rows).round(4)


def summarize_weekly_results(daily: pd.DataFrame) -> pd.DataFrame:
    """入金の影響を除いた口座リターンと市場損益を週単位で集計する。"""
    if daily.empty:
        return pd.DataFrame()

    frame = daily.copy()
    frame["date_dt"] = pd.to_datetime(frame["date"])
    frame["week_end"] = frame["date_dt"].dt.to_period("W-FRI").dt.end_time.dt.normalize()

    rows = []
    for (year, week_end), group in frame.groupby(["year", "week_end"], sort=True):
        compounded_return = (
            (1 + group["daily_account_return_pct"] / 100).prod() - 1
        ) * 100
        rows.append(
            {
                "year": int(year),
                "week_start": group.iloc[0]["date"],
                "week_end": group.iloc[-1]["date"],
                "trading_days": int(len(group)),
                "investment_jpy": float(group["daily_investment_jpy"].sum()),
                "market_pnl_jpy": float(group["daily_market_pnl_jpy"].sum()),
                "account_return_pct": float(compounded_return),
                "ending_value_jpy": float(group.iloc[-1]["market_value_jpy"]),
            }
        )
    return pd.DataFrame(rows).round(4)


def build_backtest_dataset(start: str, end: str, output_dir: str) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    raw_dir = os.path.join(output_dir, "raw")
    os.makedirs(raw_dir, exist_ok=True)

    raw_frames = {}
    for ticker, name in DAILY_TICKERS.items():
        df = fetch_daily_ohlcv(ticker, start, end)
        save_raw_csv(df, os.path.join(raw_dir, f"{name}_daily.csv"))
        raw_frames[name] = df

    sox_close = raw_frames["sox"]["Close"]
    panel = build_panel(
        sox=sox_close,
        vix=raw_frames["vix"]["Close"],
        nasdaq=raw_frames["nasdaq"]["Close"],
        jpy=raw_frames["jpy"]["Close"],
        nq_f=raw_frames["nq_f"]["Close"],
    )

    panel_path = os.path.join(output_dir, "backtest_panel.csv")
    panel.to_csv(panel_path, index=False)

    daily = simulate_daily_1000_yen(
        sox=sox_close,
        jpy=raw_frames["jpy"]["Close"],
    )
    annual = summarize_annual_results(daily)
    weekly = summarize_weekly_results(daily)
    worst_weeks = weekly.nsmallest(20, "account_return_pct").reset_index(drop=True)

    daily.to_csv(os.path.join(output_dir, "daily_1000_sox.csv"), index=False)
    annual.to_csv(os.path.join(output_dir, "annual_summary.csv"), index=False)
    weekly.to_csv(os.path.join(output_dir, "weekly_summary.csv"), index=False)
    worst_weeks.to_csv(os.path.join(output_dir, "worst_weeks.csv"), index=False)

    manifest = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "start": start,
        "end": end,
        "row_count": int(len(panel)),
        "daily_backtest_row_count": int(len(daily)),
        "date_range": {
            "first": panel["date"].iloc[0] if len(panel) else None,
            "last": panel["date"].iloc[-1] if len(panel) else None,
        },
        "tickers": DAILY_TICKERS,
        "notes": [
            "SOX=F の信頼できる日次履歴がないため現物終値による代用はせず、過去時点で取得可能なNQ先物だけを確認材料に使用。",
            "購入日は米国市場セッションの翌JST日とし、金曜日・週末・日本の祝日・日本の祝日前は買いを禁止。",
            "約定日ズレは購入日の次の日本営業日を estimated_execution_date_jst として記録。",
            "NQ先物は当日値を使わず、直前に完了した米国市場セッションの終値を1営業日シフトして使用。",
            "fwd_return_* はバックテスト評価用の将来リターン（当日シグナルには未使用）。",
            "ポジション（SOX_MOTOMOTO/SOX_HYOKA）はバックテスト実行時に別途シミュレートする。",
            "毎日1000円SOXは米国SOX営業日の終値で指数の端数口を購入し、同日のUSD/JPY終値で円換算する。",
            "各年の最終SOX営業日に全口売却し、翌年の最初のSOX営業日から保有口数と投資額をリセットする。",
            "配当・手数料・税金・スプレッドは含めず、^SOX指数を売買可能とみなす比較用シミュレーション。",
            "最悪週は日次入金を除いた口座リターンを週内で複利集計し、低い順に判定する。",
        ],
        "files": {
            "panel": "backtest_panel.csv",
            "daily_backtest": "daily_1000_sox.csv",
            "annual_summary": "annual_summary.csv",
            "weekly_summary": "weekly_summary.csv",
            "worst_weeks": "worst_weeks.csv",
            "raw_dir": "raw/",
        },
    }

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    return manifest


def main():
    parser = argparse.ArgumentParser(description="SOX プロトコル用バックテストデータを生成")
    parser.add_argument("--start", default=DEFAULT_START, help="開始日 (YYYY-MM-DD)")
    parser.add_argument("--end", default=date.today().isoformat(), help="終了日 (YYYY-MM-DD)")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="出力ディレクトリ")
    args = parser.parse_args()

    print(f"取得期間: {args.start} 〜 {args.end}")
    print(f"出力先: {args.output_dir}")

    manifest = build_backtest_dataset(args.start, args.end, args.output_dir)

    print(f"完了: {manifest['row_count']} 行")
    if manifest["date_range"]["first"]:
        print(f"  期間: {manifest['date_range']['first']} 〜 {manifest['date_range']['last']}")
    print(f"  パネル: {os.path.join(args.output_dir, 'backtest_panel.csv')}")


if __name__ == "__main__":
    main()
