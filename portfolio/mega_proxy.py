"""Mega10 equal-weight quarterly proxy NAV from constituent prices."""

from __future__ import annotations

import numpy as np
import pandas as pd
import yfinance as yf

from portfolio import MEGA10_CONSTITUENTS


def equal_weight_quarterly(prices: pd.DataFrame) -> pd.Series:
    """Approximate Mega10: equal-weight, rebalance on quarter starts."""
    px = prices.dropna(how="any")
    if px.empty:
        raise RuntimeError("no overlapping Mega10 price history")
    rets = px.pct_change().fillna(0.0)
    quarters = px.groupby([px.index.year, px.index.quarter]).head(1).index
    w = np.repeat(1.0 / len(px.columns), len(px.columns))
    qset = set(quarters)
    port_rets = []
    for i, dt in enumerate(px.index):
        if dt in qset:
            w = np.repeat(1.0 / len(px.columns), len(px.columns))
        if i == 0:
            port_rets.append(0.0)
        else:
            port_rets.append(float((w * rets.loc[dt].values).sum()))
            grown = w * (1.0 + rets.loc[dt].values)
            if grown.sum() > 0:
                w = grown / grown.sum()
    nav = (1.0 + pd.Series(port_rets, index=px.index)).cumprod()
    nav.iloc[0] = 1.0
    return nav


def fetch_mega10_proxy_nav(
    start: str = "2006-06-01",
    end: str | None = None,
) -> pd.Series:
    """Download constituents and return proxy NAV (starts at 1.0)."""
    kwargs = {"start": start, "auto_adjust": True, "progress": False}
    if end:
        kwargs["end"] = end
    mega_px = yf.download(MEGA10_CONSTITUENTS, **kwargs)["Close"]
    if isinstance(mega_px, pd.Series):
        mega_px = mega_px.to_frame()
    # Normalize timezone-naive dates
    mega_px.index = pd.to_datetime(mega_px.index).tz_localize(None)
    return equal_weight_quarterly(mega_px)
