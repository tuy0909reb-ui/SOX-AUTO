"""Shared silicon-cycle materials (regenerable Review layer).

Price-required indicators always attempted. Legacy WSTS / TSMC are best-effort.
No lump-sum / redesign recommendation text.
"""

from __future__ import annotations

import math
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
SOX_INDEX_PATH = ROOT / "data" / "common_backtest" / "datasets" / "index_daily" / "sox_daily.csv"

SCHEMA = "silicon_cycle_materials_v1"
DEFENSE_DROP_EXIT_PCT = 25.0
WATCH_DD_HINT_PCT = 15.0

REL_WINDOWS_MONTHS = (3, 6, 12)
MA_WINDOW = 200
HIGH_LOOKBACK = 250
MA_SLOPE_LOOKBACK = 20


def _series_from_df(df: pd.DataFrame, date_col: str, value_col: str) -> pd.Series:
    s = df[[date_col, value_col]].dropna().copy()
    converted = pd.to_datetime(s[date_col], utc=True)
    s[date_col] = converted.dt.tz_localize(None)
    s = s.drop_duplicates(date_col).set_index(date_col)[value_col].astype(float).sort_index()
    return s


def clip_to_asof(s: pd.Series, as_of: date) -> pd.Series:
    ts = pd.Timestamp(as_of)
    return s.loc[s.index <= ts]


def window_return(s: pd.Series, as_of: date, months: int) -> Optional[float]:
    s = clip_to_asof(s, as_of)
    if len(s) < 2:
        return None
    end = s.index[-1]
    start_target = end - pd.DateOffset(months=months)
    start_s = s.loc[s.index <= start_target]
    if start_s.empty:
        return None
    start = start_s.index[-1]
    return float(s.loc[end] / s.loc[start] - 1.0)


def load_sox_series(*, as_of: date) -> tuple[pd.Series, str]:
    if SOX_INDEX_PATH.is_file():
        sox = pd.read_csv(SOX_INDEX_PATH)
        col = "Adj Close" if "Adj Close" in sox.columns else "Close"
        return _series_from_df(sox, "date", col), str(SOX_INDEX_PATH.as_posix())

    import yfinance as yf

    end = (pd.Timestamp(as_of) + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    h = yf.Ticker("^SOX").history(start="2006-01-01", end=end, auto_adjust=True)
    if h.empty:
        return pd.Series(dtype=float), "yfinance ^SOX (empty)"
    h = h.copy()
    h.index = pd.to_datetime(h.index).tz_localize(None)
    return h["Close"].astype(float).sort_index(), "yfinance ^SOX"


def load_spy_series(*, as_of: date) -> tuple[pd.Series, str]:
    import yfinance as yf

    end = (pd.Timestamp(as_of) + pd.Timedelta(days=1)).strftime("%Y-%m-%d")
    h = yf.Ticker("SPY").history(start="2018-01-01", end=end, auto_adjust=True)
    if h.empty:
        return pd.Series(dtype=float), "yfinance SPY (empty)"
    h = h.copy()
    h.index = pd.to_datetime(h.index).tz_localize(None)
    return h["Close"].astype(float).sort_index(), "yfinance SPY auto_adjust=True"


def fetch_wsts_3m_minus() -> tuple[Optional[bool], Optional[str]]:
    try:
        url = "https://www.wsts.org/Portals/0/Monthly-Semiconductor-Sales.csv"
        df = pd.read_csv(url)
        if "Sales" not in df.columns or len(df) < 4:
            return None, "wsts_csv_shape"
        df = df.tail(4).copy()
        df["MoM"] = df["Sales"].pct_change() * 100
        last3 = df["MoM"].tail(3)
        if last3.isna().any():
            return None, "wsts_mom_nan"
        return bool(all(float(x) < 0 for x in last3)), None
    except Exception as exc:  # noqa: BLE001 — best-effort external
        return None, f"wsts_fetch:{type(exc).__name__}"


def fetch_tsmc_yoy_pct() -> tuple[Optional[float], Optional[str]]:
    try:
        import requests

        url = "https://www.tsmc.com/api/monthly-revenues"
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return None, f"tsmc_http_{res.status_code}"
        data = res.json()["data"]
        latest = data[-1]
        latest_month = latest["Month"]
        latest_year = int(latest["Year"])
        latest_revenue = float(latest["Revenue"])
        prev = next(
            (x for x in data if int(x["Year"]) == latest_year - 1 and x["Month"] == latest_month),
            None,
        )
        if prev is None:
            return None, "tsmc_prev_year_missing"
        prev_revenue = float(prev["Revenue"])
        if prev_revenue == 0:
            return None, "tsmc_prev_zero"
        return round((latest_revenue - prev_revenue) / prev_revenue * 100, 2), None
    except Exception as exc:  # noqa: BLE001 — best-effort external
        return None, f"tsmc_fetch:{type(exc).__name__}"


def _compute_price_block(
    sox: pd.Series,
    spy: pd.Series,
    *,
    as_of: date,
) -> tuple[dict[str, Any], list[str], bool]:
    gaps: list[str] = []
    sox_c = clip_to_asof(sox, as_of)
    spy_c = clip_to_asof(spy, as_of)

    if len(sox_c) < MA_WINDOW:
        gaps.append("sox_insufficient_for_200ma")
        return {}, gaps, False

    close = sox_c.astype(float)
    ma = close.rolling(window=MA_WINDOW).mean()
    ma_now = float(ma.iloc[-1])
    slope_idx = -MA_SLOPE_LOOKBACK if len(close) > MA_WINDOW + MA_SLOPE_LOOKBACK else -1
    ma_prev = float(ma.iloc[slope_idx])
    ma_trend = ma_now - ma_prev
    sox_close = float(close.iloc[-1])
    below_200ma = sox_close < ma_now
    downward = ma_trend < 0

    high_tail = close.tail(HIGH_LOOKBACK)
    sox_high = float(high_tail.max())
    drop_pct = round((sox_high - sox_close) / sox_high * 100, 2) if sox_high > 0 else None

    # 12M percentile of close within trailing ~252 trading days
    trail = close.tail(252)
    if len(trail) < 60:
        gaps.append("sox_short_for_12m_percentile")
        pctile_12m = None
    else:
        pctile_12m = float((trail <= sox_close).sum() / len(trail))

    rel: list[dict[str, Any]] = []
    if len(spy_c) < 2:
        gaps.append("spy_missing")
    for months in REL_WINDOWS_MONTHS:
        sox_r = window_return(close, as_of, months)
        spy_r = window_return(spy_c, as_of, months) if len(spy_c) >= 2 else None
        vs = None if sox_r is None or spy_r is None else float(sox_r - spy_r)
        rel.append(
            {
                "months": months,
                "sox_return": sox_r,
                "spy_return": spy_r,
                "vs_sp500": vs,
            }
        )

    defense_reached = drop_pct is not None and drop_pct >= DEFENSE_DROP_EXIT_PCT
    watch_from_ma = below_200ma and downward
    watch_from_dd = drop_pct is not None and drop_pct >= WATCH_DD_HINT_PCT
    watch_hint = bool(watch_from_ma or watch_from_dd)

    block = {
        "sox_close": sox_close,
        "sox_high_250d": sox_high,
        "drop_from_high_pct": drop_pct,
        "defense_exit_threshold_pct": DEFENSE_DROP_EXIT_PCT,
        "defense_exit_line_reached": defense_reached,
        "ma200": ma_now,
        "ma200_trend": ma_trend,
        "below_200ma": below_200ma,
        "ma200_downward": downward,
        "percentile_12m": pctile_12m,
        "vs_sp500": rel,
        "effective_end": close.index[-1].date().isoformat(),
    }
    return block, gaps, watch_hint


def build_materials(
    *,
    as_of: date,
    sox: Optional[pd.Series] = None,
    spy: Optional[pd.Series] = None,
    sox_source: Optional[str] = None,
    spy_source: Optional[str] = None,
    fetch_legacy: bool = True,
    wsts_3m_minus: Optional[bool] = None,
    tsmc_yoy_pct: Optional[float] = None,
    wsts_gap: Optional[str] = None,
    tsmc_gap: Optional[str] = None,
) -> dict[str, Any]:
    """Build silicon_cycle_materials_v1 payload.

    Inject sox/spy (and optional legacy values) for offline / unit tests.
    """
    data_gaps: list[str] = []

    if sox is None:
        sox, sox_source = load_sox_series(as_of=as_of)
    else:
        sox_source = sox_source or "injected"

    if spy is None:
        spy, spy_source = load_spy_series(as_of=as_of)
    else:
        spy_source = spy_source or "injected"

    price, price_gaps, watch_hint = _compute_price_block(sox, spy, as_of=as_of)
    data_gaps.extend(price_gaps)

    legacy: dict[str, Any] = {
        "wsts_3m_minus": None,
        "tsmc_yoy_pct": None,
        "tsmc_yoy_soft_threshold_pct": 10.0,
        "sensor_lights": {
            "wsts": "N/A",
            "tsmc_yoy": "N/A",
            "ma200": "N/A",
        },
    }

    if fetch_legacy and wsts_3m_minus is None and wsts_gap is None:
        wsts_3m_minus, wsts_gap = fetch_wsts_3m_minus()
    if fetch_legacy and tsmc_yoy_pct is None and tsmc_gap is None:
        tsmc_yoy_pct, tsmc_gap = fetch_tsmc_yoy_pct()

    if wsts_gap:
        data_gaps.append(wsts_gap)
    if tsmc_gap:
        data_gaps.append(tsmc_gap)

    legacy["wsts_3m_minus"] = wsts_3m_minus
    legacy["tsmc_yoy_pct"] = tsmc_yoy_pct

    if wsts_3m_minus is None:
        legacy["sensor_lights"]["wsts"] = "N/A"
    else:
        legacy["sensor_lights"]["wsts"] = "RED" if wsts_3m_minus else "GREEN"

    if tsmc_yoy_pct is None:
        legacy["sensor_lights"]["tsmc_yoy"] = "N/A"
    else:
        legacy["sensor_lights"]["tsmc_yoy"] = (
            "RED" if float(tsmc_yoy_pct) < 10.0 else "GREEN"
        )

    if price:
        ma_red = bool(price["below_200ma"] and price["ma200_downward"])
        legacy["sensor_lights"]["ma200"] = "RED" if ma_red else "GREEN"
    else:
        data_gaps.append("price_block_unavailable")

    watch_reasons: list[str] = []
    if price:
        if price["below_200ma"] and price["ma200_downward"]:
            watch_reasons.append("below_200ma_and_downward")
        if (
            price["drop_from_high_pct"] is not None
            and price["drop_from_high_pct"] >= WATCH_DD_HINT_PCT
        ):
            watch_reasons.append(f"drop_from_high_ge_{WATCH_DD_HINT_PCT:g}pct")

    return {
        "schema": SCHEMA,
        "layer": "Review_materials",
        "as_of": as_of.isoformat(),
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sources": {
            "sox": sox_source,
            "spy": spy_source,
            "wsts": "best_effort_csv" if wsts_3m_minus is not None else "unavailable",
            "tsmc": "best_effort_api" if tsmc_yoy_pct is not None else "unavailable",
        },
        "price": price,
        "legacy_compat": legacy,
        "watch_hint": {
            "elevated": bool(watch_hint),
            "reasons": watch_reasons,
            "note": "Schedule cadence only. Not a buy-method recommendation.",
        },
        "data_gaps": data_gaps,
        "judgment_scope": {
            "対象": "シリコンサイクル監視材料（年次③ゲート＋継続監視共通）",
            "期間": f"as_of={as_of.isoformat()}",
            "N": "SOX価格必須；WSTS/TSMCは任意",
            "評価目的": "年次の買い方確認材料と警戒年の定期確認材料",
            "判断可能範囲": "材料の把握・Humanによる年初一括／再設計の検討開始",
            "判断禁止範囲": "一括／再設計の自動断定、発注・入替、Decision接続",
        },
        "footer": "材料のみ。推奨・自動入替・発注なし。レガシーsilicon_protocol Discord封印は解除しない。",
    }


def _pct(x: Optional[float]) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "—"
    return f"{x * 100:.2f}%"


def _num(x: Optional[float], digits: int = 2) -> str:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        return "—"
    return f"{x:.{digits}f}"


def render_materials_md(payload: dict[str, Any]) -> str:
    js = payload["judgment_scope"]
    price = payload.get("price") or {}
    legacy = payload.get("legacy_compat") or {}
    lights = legacy.get("sensor_lights") or {}
    watch = payload.get("watch_hint") or {}

    lines = [
        f"# シリコンサイクル材料 — as_of {payload['as_of']}",
        "",
        f"**Schema:** `{payload['schema']}`  ",
        f"**Layer:** {payload['layer']}  ",
        f"**Generated:** {payload['generated_at']}",
        "",
        "## 判断スコープ",
        "",
        f"- 対象: {js['対象']}",
        f"- 期間: {js['期間']}",
        f"- N: {js['N']}",
        f"- 評価目的: {js['評価目的']}",
        f"- 判断可能範囲: {js['判断可能範囲']}",
        f"- 判断禁止範囲: {js['判断禁止範囲']}",
        "",
        "## 価格材料",
        "",
    ]
    if not price:
        lines.append("_価格材料を計算できませんでした。_")
    else:
        lines.extend(
            [
                f"- SOX終値: {_num(price.get('sox_close'), 2)}（effective_end={price.get('effective_end')}）",
                f"- 250日高値: {_num(price.get('sox_high_250d'), 2)}",
                f"- 高値下落率: {_num(price.get('drop_from_high_pct'), 2)}%",
                f"- 全売却ライン表示（材料）: 閾値 -{DEFENSE_DROP_EXIT_PCT:g}% / "
                f"到達={'YES' if price.get('defense_exit_line_reached') else 'NO'}",
                f"- 200DMA: {_num(price.get('ma200'), 2)} "
                f"（終値下回り={'YES' if price.get('below_200ma') else 'NO'} / "
                f"傾き下落={'YES' if price.get('ma200_downward') else 'NO'}）",
                f"- 12M分位: {_num(price.get('percentile_12m'), 3)}",
                "",
                "### SOX vs S&P500（SPY）相対",
                "",
                "| 窓 | SOX | SPY | 超過 |",
                "|---|---:|---:|---:|",
            ]
        )
        for row in price.get("vs_sp500") or []:
            lines.append(
                "| {m}M | {s} | {p} | {v} |".format(
                    m=row["months"],
                    s=_pct(row.get("sox_return")),
                    p=_pct(row.get("spy_return")),
                    v=_pct(row.get("vs_sp500")),
                )
            )

    lines.extend(
        [
            "",
            "## レガシー互換センサー（任意）",
            "",
            f"- WSTS 3M MoMマイナス連: {lights.get('wsts', 'N/A')} "
            f"（raw={legacy.get('wsts_3m_minus')}）",
            f"- TSMC YoY: {lights.get('tsmc_yoy', 'N/A')} "
            f"（raw={legacy.get('tsmc_yoy_pct')} / soft_threshold=10%）",
            f"- 200MA判定灯: {lights.get('ma200', 'N/A')}",
            "",
            "## 監視ヒント（スケジュール用）",
            "",
            f"- elevated: **{'YES' if watch.get('elevated') else 'NO'}**",
            f"- reasons: {', '.join(watch.get('reasons') or []) or '—'}",
            f"- note: {watch.get('note', '')}",
            "",
            "## データ欠落",
            "",
        ]
    )
    gaps = payload.get("data_gaps") or []
    if not gaps:
        lines.append("- （なし）")
    else:
        for g in gaps:
            lines.append(f"- `{g}`")

    lines.extend(
        [
            "",
            "## Human判断欄（年次③）",
            "",
            "- [ ] 年初一括のまま",
            "- [ ] 買い方を再設計",
            "- メモ:",
            "",
            "---",
            "",
            payload.get("footer", ""),
            "",
        ]
    )
    return "\n".join(lines)
