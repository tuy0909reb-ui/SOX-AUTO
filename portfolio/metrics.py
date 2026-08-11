"""Performance metrics computed from price series (never persisted as daily SoT)."""

from __future__ import annotations

import math
from typing import Iterable

import numpy as np
import pandas as pd


def max_drawdown(prices: pd.Series) -> float:
    s = prices.dropna()
    if len(s) < 2:
        return float("nan")
    peak = s.cummax()
    dd = s / peak - 1.0
    return float(dd.min())


def period_return(prices: pd.Series) -> float:
    s = prices.dropna()
    if len(s) < 2:
        return float("nan")
    return float(s.iloc[-1] / s.iloc[0] - 1.0)


def ann_vol(prices: pd.Series, trading_days: int = 252) -> float:
    rets = prices.dropna().pct_change().dropna()
    if len(rets) < 2:
        return float("nan")
    return float(rets.std() * math.sqrt(trading_days))


def sharpe(prices: pd.Series, trading_days: int = 252) -> float:
    rets = prices.dropna().pct_change().dropna()
    if len(rets) < 2:
        return float("nan")
    vol = float(rets.std() * math.sqrt(trading_days))
    if vol <= 0 or math.isnan(vol):
        return float("nan")
    mean = float(rets.mean() * trading_days)
    return mean / vol


def metrics_for_window(prices: pd.Series) -> dict[str, float]:
    s = prices.dropna()
    return {
        "ret": period_return(s),
        "mdd": max_drawdown(s),
        "vol": ann_vol(s),
        "sharpe": sharpe(s),
        "n_obs": float(len(s)),
    }


def rank_by_metric(
    per_asset: dict[str, dict[str, float]],
    metric_key: str = "ret",
    ascending: bool = False,
) -> list[str]:
    """Return asset codes sorted by metric (default: higher return = rank 1)."""
    items = []
    for code, m in per_asset.items():
        val = m.get(metric_key, float("nan"))
        if val is None or (isinstance(val, float) and math.isnan(val)):
            continue
        items.append((code, float(val)))
    items.sort(key=lambda x: x[1], reverse=not ascending)
    return [c for c, _ in items]


def ranking_match_score(expected: Iterable[str], actual: Iterable[str]) -> float:
    """Fraction of positions where expected rank equals actual rank (same set)."""
    exp = list(expected)
    act = list(actual)
    if not exp or not act:
        return float("nan")
    # Compare only overlapping ordered prefixes by asset membership
    common = [c for c in exp if c in act]
    if not common:
        return float("nan")
    # Spearman-like: compare rank order of common assets
    exp_rank = {c: i for i, c in enumerate(exp)}
    act_rank = {c: i for i, c in enumerate(act)}
    n = len(common)
    if n == 1:
        return 1.0
    d2 = sum((exp_rank[c] - act_rank[c]) ** 2 for c in common)
    return float(1.0 - (6.0 * d2) / (n * (n * n - 1)))


def align_price_frame(series_by_code: dict[str, pd.Series]) -> pd.DataFrame:
    df = pd.DataFrame(series_by_code)
    return df.sort_index()


def slice_window(df: pd.DataFrame, start: str | None, end: str | None) -> pd.DataFrame:
    out = df
    if start:
        out = out.loc[out.index >= pd.Timestamp(start)]
    if end:
        out = out.loc[out.index <= pd.Timestamp(end)]
    return out


def asset_availability(
    df: pd.DataFrame,
    codes: list[str],
) -> dict[str, dict[str, object]]:
    """Per-asset non-null coverage in the full frame (or any frame)."""
    out: dict[str, dict[str, object]] = {}
    for code in codes:
        if code not in df.columns:
            out[code] = {"start": None, "end": None, "n": 0}
            continue
        s = df[code].dropna()
        if s.empty:
            out[code] = {"start": None, "end": None, "n": 0}
        else:
            out[code] = {
                "start": s.index.min().strftime("%Y-%m-%d"),
                "end": s.index.max().strftime("%Y-%m-%d"),
                "n": int(len(s)),
            }
    return out


def intersection_frame(
    df: pd.DataFrame,
    codes: list[str],
    start: str | None = None,
    end: str | None = None,
) -> tuple[pd.DataFrame, str | None, str | None]:
    """
    Restrict to calendar [start, end], then keep only rows where ALL compare
    assets have prices (intersection). Late-listed assets shrink the window;
    they are not dropped from the peer set.
    """
    cols = [c for c in codes if c in df.columns]
    if not cols:
        return pd.DataFrame(), None, None
    window = slice_window(df[cols], start, end)
    aligned = window.dropna(how="any")
    if aligned.empty:
        return aligned, None, None
    c_start = aligned.index.min().strftime("%Y-%m-%d")
    c_end = aligned.index.max().strftime("%Y-%m-%d")
    return aligned, c_start, c_end


def nan_to_none(x: float) -> float | None:
    if x is None:
        return None
    try:
        if math.isnan(float(x)) or math.isinf(float(x)):
            return None
    except (TypeError, ValueError):
        return None
    return float(x)
