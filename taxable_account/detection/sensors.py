"""
Validated sensor semantics re-coded for New Runtime.

Sources of meaning (not code imports):
  - dd15_ma200: SOXX/lt close, 250d high DD>=15% AND close < SMA200
  - Recovery Model B: alert OFF when dd15_ma200 False AND RSI14>=50 for 20bd
  - crash_15: Nikkei 252d high DD <= -15%
  - semi_signal: Freeze panel OR-themes AND NOT crash_15
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from taxable_account.detection.indicators import pct_change, rolling_max, rsi_wilder, sma


def compute_dd15_ma200(close: pd.Series) -> pd.Series:
    close = close.astype(float).sort_index()
    high250 = rolling_max(close, 250, min_periods=200)
    dd250 = (high250 - close) / high250
    ma200 = sma(close, 200, min_periods=200)
    dd15 = (dd250 >= 0.15).fillna(False)
    below = (close < ma200).fillna(False)
    return (dd15 & below).astype(bool)


def compute_alert_model_b(
    dd15_ma200: pd.Series,
    growth_close: pd.Series,
    clear_days: int = 20,
) -> tuple[pd.Series, pd.Series]:
    """
    Returns (alert_on, recovery_streak).
    ON: dd15_ma200 True (immediate).
    OFF: dd15_ma200 False AND RSI14>=50 for clear_days consecutive.
    """
    raw = dd15_ma200.reindex(growth_close.index).fillna(False).astype(bool)
    rsi = rsi_wilder(growth_close.astype(float), 14).reindex(growth_close.index)
    n = len(raw)
    on = False
    streak = 0
    alert = np.zeros(n, dtype=bool)
    streaks = np.zeros(n, dtype=int)
    for i in range(n):
        ex = bool(raw.iloc[i])
        if not on:
            if ex:
                on = True
                streak = 0
        else:
            r = rsi.iloc[i]
            ok = (not ex) and pd.notna(r) and float(r) >= 50.0
            if ok:
                streak += 1
                if streak >= clear_days:
                    on = False
                    streak = 0
            else:
                streak = 0
        alert[i] = on
        streaks[i] = streak if on else (0 if not on else streak)
        if on and not ex and pd.notna(r) and float(r) >= 50.0:
            streaks[i] = streak
        elif on:
            streaks[i] = streak
        else:
            streaks[i] = 0
    return pd.Series(alert, index=growth_close.index, name="alert_on"), pd.Series(
        streaks, index=growth_close.index, name="recovery_b_days"
    )


def compute_crash_15(nikkei: pd.Series) -> pd.Series:
    nikkei = nikkei.astype(float).sort_index()
    high252 = rolling_max(nikkei, 252, min_periods=100)
    dd52 = nikkei / high252 - 1.0
    return (dd52 <= -0.15).fillna(False).astype(bool)


def compute_semi_signal(
    sox: pd.Series,
    nq: pd.Series,
    model_c: pd.Series,
    crash_15: pd.Series,
) -> pd.Series:
    """Freeze panel semi_signal semantics (OR of themes) & ~crash_15."""
    idx = model_c.index
    sox = sox.reindex(idx).ffill()
    nq = nq.reindex(idx).ffill()
    mc = model_c.astype(float)
    sox_ma20 = sma(sox, 20)
    sox_ma50 = sma(sox, 50)
    nq_ma20 = sma(nq, 20)
    mc_ma20 = sma(mc, 20)
    sox_rsi = rsi_wilder(sox, 14)
    mc_rsi = rsi_wilder(mc, 14)
    sox_r5 = pct_change(sox, 5)
    sox_r10 = pct_change(sox, 10)
    sox_up = sox > sox_ma20
    nq_up = nq > nq_ma20
    sox_trend_ok = sox > sox_ma50
    mc_ma20_gap = mc / mc_ma20 - 1.0
    mc_ma20_reclaim = (mc > mc_ma20) & (mc.shift(1) <= mc_ma20.shift(1))
    mc_rsi_reclaim50 = (mc_rsi > 50) & (mc_rsi.shift(1) <= 50)

    pullback = sox_trend_ok.fillna(False) & nq_up.fillna(False) & (sox_r5 <= -0.025)
    oversold = nq_up.fillna(False) & (sox_rsi <= 45) & (sox_r10 <= 0)
    rsi_env = mc_rsi_reclaim50.fillna(False) & sox_up.fillna(False) & nq_up.fillna(False)
    ma_env = mc_ma20_reclaim.fillna(False) & sox_up.fillna(False) & nq_up.fillna(False)
    range_theme = (
        sox_up.fillna(False)
        & nq_up.fillna(False)
        & (mc_ma20_gap.abs() <= 0.03)
        & (mc_rsi >= 40)
        & (mc_rsi <= 65)
    )
    crash = crash_15.reindex(idx).fillna(False)
    return ((pullback | oversold | rsi_env | ma_env | range_theme) & ~crash).astype(bool)
