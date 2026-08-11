"""Phase 4 end-to-end integration tests (Legacy-independent)."""

from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.detection.adapter import DetectionAdapter, MarketDataBundle
from taxable_account.detection.market_condition import MarketCondition
from taxable_account.detection.scripted import ScriptedDetection
from taxable_account.domain.models import MarketSignals
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime


def _mc(
    d: date,
    *,
    alert: bool,
    crash: bool = False,
    semi: bool = False,
    dd: bool | None = None,
    prices: dict | None = None,
) -> MarketCondition:
    if dd is None:
        dd = alert
    return MarketCondition(
        as_of=d,
        alert_on=alert,
        signals=MarketSignals(
            dd15_ma200=dd,
            crash_15=crash,
            semi_signal=semi and not crash,
            recovery_model_b_met=(not alert) and (not dd),
            recovery_b_days=0,
        ),
        prices=prices
        or {
            "NOMURA_WORLD_SEMI": 100.0,
            "NIKKEI_LEV_1570": 1000.0,
            "SEMI_282A": 200.0,
        },
    )


def test_legacy_boundary_runtime_modules():
    import taxable_account.runtime.session as sess
    import taxable_account.detection.adapter as det
    import taxable_account.view.discord_adapter as disc

    for mod in (sess, det, disc):
        text = Path(mod.__file__).read_text(encoding="utf-8")
        assert "sox_" not in text
        assert "ndx_" not in text
        assert "run_longterm" not in text
        assert "run_swing" not in text
        assert "sox_utils" not in text


def test_scenario_normal_growth():
    d0 = date(2024, 1, 2)
    d1 = date(2024, 1, 3)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False, prices={"NOMURA_WORLD_SEMI": 100, "NIKKEI_LEV_1570": 1, "SEMI_282A": 1}),
            d1: _mc(d1, alert=False, prices={"NOMURA_WORLD_SEMI": 101, "NIKKEI_LEV_1570": 1, "SEMI_282A": 1}),
        }
    )
    rt = TaxableAccountRuntime(src, config=RuntimeConfig())
    r0 = rt.step(d0)
    assert rt.state.regime_state == RegimeState.GROWTH_ACTIVE
    assert rt.state.asset == Asset.NOMURA_WORLD_SEMI
    assert r0.view_model["current_state"]["decision"] == "MAINTAIN"
    assert r0.discord.dry_run is True
    r1 = rt.step(d1)
    assert r1.state["regime_state"] == "GROWTH_ACTIVE"
    assert r1.view_model["current_state"]["asset"]["code"] == "NOMURA_WORLD_SEMI"


def test_scenario_crash_entry_risk_active():
    d0 = date(2024, 2, 1)
    d1 = date(2024, 2, 2)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={
                    "NOMURA_WORLD_SEMI": 90,
                    "NIKKEI_LEV_1570": 1000,
                    "SEMI_282A": 180,
                },
            ),
        }
    )
    rt = TaxableAccountRuntime(src)
    rt.step(d0)
    r1 = rt.step(d1)
    assert "ALERT_ON" in r1.events
    assert "TRANSFER_COMPLETE" in r1.events
    assert "ENTRY_FILLED" in r1.events
    assert rt.state.regime_state == RegimeState.SWING_ACTIVE
    assert rt.state.position_state == PositionState.POSITION_ACTIVE
    assert rt.state.held_asset == Asset.NIKKEI_LEV_1570
    assert rt.state.risk_control.status == RiskStatus.ACTIVE
    assert rt.state.risk_control.stop_price == pytest.approx(850.0)
    assert r1.view_model["current_state"]["position_state"] == "RISK_CONTROL_ACTIVE"
    assert r1.view_model["position"]["risk_stop"]["status"] == "ACTIVE"
    assert r1.discord.embed["title"] == "【大要塞｜特定口座】"
    assert [f["name"] for f in r1.discord.embed["fields"]] == [
        "命令",
        "司令判断",
        "作戦理由",
        "戦力状況",
    ]


def test_scenario_risk_stop_exit_reeval():
    d0 = date(2024, 3, 1)
    d1 = date(2024, 3, 2)
    d2 = date(2024, 3, 3)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(
                d1,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 180},
            ),
            d2: _mc(
                d2,
                alert=True,
                crash=True,
                prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 840, "SEMI_282A": 180},
            ),
        }
    )
    rt = TaxableAccountRuntime(src)
    rt.step(d0)
    rt.step(d1)
    r2 = rt.step(d2)
    assert "STOP_TRIGGERED" in r2.events
    assert "EXIT_FILLED" in r2.events
    assert rt.state.position_state == PositionState.REENTRY_WAIT
    assert rt.state.held_asset == Asset.CASH
    assert rt.state.risk_control.status == RiskStatus.NA
    assert r2.view_model["current_state"]["decision"] == "REENTRY_WAIT"


def test_scenario_recovery_to_growth():
    d0 = date(2024, 4, 1)
    d1 = date(2024, 4, 2)
    d2 = date(2024, 4, 3)
    src = ScriptedDetection(
        {
            d0: _mc(d0, alert=False),
            d1: _mc(d1, alert=True, crash=True, prices={"NOMURA_WORLD_SEMI": 90, "NIKKEI_LEV_1570": 1000, "SEMI_282A": 1}),
            d2: _mc(d2, alert=False, dd=False, prices={"NOMURA_WORLD_SEMI": 95, "NIKKEI_LEV_1570": 1100, "SEMI_282A": 1}),
        }
    )
    rt = TaxableAccountRuntime(src)
    rt.step(d0)
    rt.step(d1)
    r2 = rt.step(d2)
    assert "ALERT_OFF" in r2.events
    assert "RECOVERY_COMPLETE" in r2.events
    assert rt.state.regime_state == RegimeState.GROWTH_ACTIVE
    assert rt.state.position_state == PositionState.WAIT
    assert rt.state.asset == Asset.NOMURA_WORLD_SEMI


def test_detection_adapter_computes_crash_without_legacy_import():
    idx = pd.bdate_range("2020-01-01", periods=300)
    # flat then crash nikkei
    nik = pd.Series(np.linspace(20000, 22000, len(idx)), index=idx)
    nik.iloc[-5:] = 22000 * 0.80  # -20% from recent high region
    growth = pd.Series(np.linspace(100, 120, len(idx)), index=idx)
    sox = growth.copy()
    nq = growth.copy() * 10
    model_c = growth.copy()
    lev = nik / 10
    adapter = DetectionAdapter(
        MarketDataBundle(
            growth_close=growth,
            nikkei=nik,
            nikkei_lev=lev,
            sox=sox,
            nq=nq,
            model_c=model_c,
            nomura=growth,
        )
    )
    cond = adapter.condition_on(idx[-1].date())
    assert cond.signals.crash_15 is True
    assert "NIKKEI_LEV_1570" in cond.prices
