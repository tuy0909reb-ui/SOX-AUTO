"""Pure indicator formulas (spec re-implementation, no Legacy imports)."""

from __future__ import annotations

import numpy as np
import pandas as pd


def rsi_wilder(series: pd.Series, n: int = 14) -> pd.Series:
    d = series.astype(float).diff()
    up = d.clip(lower=0.0)
    dn = -d.clip(upper=0.0)
    ma_up = up.ewm(alpha=1 / n, min_periods=n, adjust=False).mean()
    ma_dn = dn.ewm(alpha=1 / n, min_periods=n, adjust=False).mean()
    # Wilder edge: avg loss 0 → RSI 100; avg gain 0 → RSI 0
    rsi = pd.Series(np.nan, index=series.index, dtype=float)
    both = ma_up.notna() & ma_dn.notna()
    zero_dn = both & (ma_dn == 0.0)
    zero_up = both & (ma_up == 0.0) & (ma_dn > 0.0)
    normal = both & (ma_dn > 0.0)
    rsi = rsi.mask(zero_dn & (ma_up > 0.0), 100.0)
    rsi = rsi.mask(zero_dn & (ma_up == 0.0), 50.0)
    rsi = rsi.mask(zero_up, 0.0)
    rs = ma_up / ma_dn
    rsi = rsi.mask(normal, 100.0 - (100.0 / (1.0 + rs)))
    return rsi


def sma(series: pd.Series, n: int, min_periods: int | None = None) -> pd.Series:
    mp = n if min_periods is None else min_periods
    return series.astype(float).rolling(n, min_periods=mp).mean()


def rolling_max(series: pd.Series, n: int, min_periods: int) -> pd.Series:
    return series.astype(float).rolling(n, min_periods=min_periods).max()


def pct_change(series: pd.Series, n: int) -> pd.Series:
    return series.astype(float).pct_change(n)
