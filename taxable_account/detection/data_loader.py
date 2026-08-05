"""
Load market CSVs for New Runtime Detection.

Uses dataset files only — does not import Legacy protocol modules.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from taxable_account.detection.adapter import MarketDataBundle

ROOT = Path(__file__).resolve().parents[2]
DS = ROOT / "data" / "common_backtest" / "datasets"
PROXY_NAME = "JP_SEMI_PROXY_C_CONCENTRATED"


def _idx_close(path: Path, value_col: str = "Adj Close") -> pd.Series:
    df = pd.read_csv(path)
    df["date"] = pd.to_datetime(df["date"] if "date" in df.columns else df.columns[0])
    # n225 uses Date capital sometimes
    if "date" not in df.columns and "Date" in df.columns:
        df["date"] = pd.to_datetime(df["Date"])
    col = value_col if value_col in df.columns else ("Close" if "Close" in df.columns else df.columns[-1])
    s = df.set_index("date")[col].astype(float)
    s.index = pd.to_datetime(s.index).tz_localize(None).normalize()
    return s[~s.index.duplicated(keep="last")].sort_index()


def load_market_bundle() -> MarketDataBundle:
    soxx = pd.read_csv(DS / "fund_nav_daily" / "soxx_etf_nav.csv", parse_dates=["date"])
    growth = soxx.set_index("date")["value"].astype(float)
    growth.index = pd.to_datetime(growth.index).normalize()

    lev_df = pd.read_csv(DS / "swing_assets_daily" / "1570.csv", parse_dates=["date"])
    lev = lev_df.set_index("date")["adjusted_close"].astype(float)
    lev.index = pd.to_datetime(lev.index).normalize()

    prox = pd.read_csv(DS / "japan_semiconductor_proxy" / "proxy_index.csv", parse_dates=["date"])
    prox = prox[prox["proxy_name"] == PROXY_NAME]
    model_c = prox.set_index("date")["adjusted_close"].astype(float)
    model_c.index = pd.to_datetime(model_c.index).normalize()

    nomura_path = DS / "swing_assets_daily" / "nomura_semiconductor.csv"
    if nomura_path.exists():
        nom = pd.read_csv(nomura_path, parse_dates=["date"])
        # fund NAV series uses `nav` (not Yahoo-style adjusted_close)
        price_col = next(
            (c for c in ("nav", "adjusted_close", "close", "value") if c in nom.columns),
            nom.columns[-1],
        )
        nomura = nom.set_index("date")[price_col].astype(float)
        nomura.index = pd.to_datetime(nomura.index).normalize()
    else:
        nomura = growth.copy()

    return MarketDataBundle(
        growth_close=growth[~growth.index.duplicated(keep="last")].sort_index(),
        nikkei=_idx_close(DS / "regime_proxies" / "n225_daily.csv"),
        nikkei_lev=lev[~lev.index.duplicated(keep="last")].sort_index(),
        sox=_idx_close(DS / "index_daily" / "sox_daily.csv"),
        nq=_idx_close(DS / "index_daily" / "nq_f_daily.csv"),
        model_c=model_c[~model_c.index.duplicated(keep="last")].sort_index(),
        nomura=nomura[~nomura.index.duplicated(keep="last")].sort_index(),
    )


def load_1570_ohlc() -> pd.DataFrame:
    e = pd.read_csv(DS / "swing_assets_daily" / "1570.csv", parse_dates=["date"])
    e = e.set_index("date").sort_index()
    e.index = pd.to_datetime(e.index).tz_localize(None).normalize()
    close = e["close"].astype(float)
    adj = e["adjusted_close"].astype(float)
    factor = adj / close.replace(0, pd.NA)
    out = pd.DataFrame(
        {
            "open": e["open"].astype(float) * factor,
            "high": e["high"].astype(float) * factor,
            "low": e["low"].astype(float) * factor,
            "close": adj,
        }
    )
    return out[~out.index.duplicated(keep="last")]
