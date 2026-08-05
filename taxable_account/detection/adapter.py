"""
DetectionAdapter: MarketDataBundle → MarketCondition per date.

Does not import Legacy protocol modules. Formulas live in sensors.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional

import pandas as pd

from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.sensors import (
    compute_alert_model_b,
    compute_crash_15,
    compute_dd15_ma200,
    compute_semi_signal,
)
from taxable_account.domain.models import MarketSignals


@dataclass
class MarketDataBundle:
    """Aligned price series for Detection (caller supplies data)."""

    growth_close: pd.Series  # sensor / recovery series (e.g. SOXX)
    nikkei: pd.Series
    nikkei_lev: pd.Series
    sox: pd.Series
    nq: pd.Series
    model_c: pd.Series  # 282A proxy
    nomura: Optional[pd.Series] = None  # growth asset mark (optional)


class DetectionAdapter:
    def __init__(self, bundle: MarketDataBundle, clear_days: int = 20) -> None:
        self.bundle = bundle
        self.clear_days = clear_days
        self._frame = self._build_frame()

    def _build_frame(self) -> pd.DataFrame:
        b = self.bundle
        # Use growth index as master for alert; intersect with nikkei for swing
        idx = b.growth_close.index.intersection(b.nikkei.index).intersection(b.model_c.index)
        idx = idx.sort_values()
        g = b.growth_close.reindex(idx).ffill()
        dd = compute_dd15_ma200(g)
        alert, streak = compute_alert_model_b(dd, g, clear_days=self.clear_days)
        nik = b.nikkei.reindex(idx).ffill()
        crash = compute_crash_15(nik)
        semi = compute_semi_signal(
            b.sox.reindex(idx).ffill(),
            b.nq.reindex(idx).ffill(),
            b.model_c.reindex(idx).ffill(),
            crash,
        )
        lev = b.nikkei_lev.reindex(idx).ffill()
        nom = (b.nomura if b.nomura is not None else g).reindex(idx).ffill()
        sox = b.sox.reindex(idx).ffill()
        nq = b.nq.reindex(idx).ffill()
        mc = b.model_c.reindex(idx).ffill()
        return pd.DataFrame(
            {
                "dd15_ma200": dd.astype(bool),
                "alert_on": alert.astype(bool),
                "recovery_b_days": streak.astype(int),
                "crash_15": crash.astype(bool),
                "semi_signal": semi.astype(bool),
                "px_growth": g.astype(float),
                "px_nomura": nom.astype(float),
                "px_nikkei": nik.astype(float),
                "px_1570": lev.astype(float),
                "px_sox": sox.astype(float),
                "px_nq": nq.astype(float),
                "px_282a": mc.astype(float),
            },
            index=idx,
        )

    @property
    def frame(self) -> pd.DataFrame:
        return self._frame

    def condition_on(self, as_of: date | pd.Timestamp) -> MarketCondition:
        ts = pd.Timestamp(as_of).normalize()
        if ts not in self._frame.index:
            # asof join: last available <= ts
            loc = self._frame.index[self._frame.index <= ts]
            if len(loc) == 0:
                raise KeyError(f"No market data on or before {as_of}")
            ts = loc[-1]
        row = self._frame.loc[ts]
        alert = bool(row["alert_on"])
        dd = bool(row["dd15_ma200"])
        signals = MarketSignals(
            dd15_ma200=dd,
            crash_15=bool(row["crash_15"]),
            semi_signal=bool(row["semi_signal"]),
            recovery_model_b_met=(not alert) and (not dd),
            recovery_b_days=int(row["recovery_b_days"]),
        )
        prices = {
            "NOMURA_WORLD_SEMI": float(row["px_nomura"]),
            "NIKKEI_LEV_1570": float(row["px_1570"]),
            "SEMI_282A": float(row["px_282a"]),
            "GROWTH_SENSOR": float(row["px_growth"]),
            "NIKKEI": float(row["px_nikkei"]),
        }
        return MarketCondition(
            as_of=ts.date() if hasattr(ts, "date") else pd.Timestamp(ts).date(),
            signals=signals,
            alert_on=alert,
            prices=prices,
        )
