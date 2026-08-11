"""
Phase 4.5 — Runtime Validation Review

Compares New Runtime behavior to DESIGN SPECS (not Legacy code imports).
"""

from __future__ import annotations

import ast
import sys
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.decision.asset_selection import select_asset
from taxable_account.decision.regime import apply_regime_event, can_transition
from taxable_account.detection.adapter import DetectionAdapter
from taxable_account.detection.data_loader import load_1570_ohlc, load_market_bundle
from taxable_account.detection.indicators import rsi_wilder, rolling_max, sma
from taxable_account.detection.sensors import (
    compute_alert_model_b,
    compute_crash_15,
    compute_dd15_ma200,
)
from taxable_account.domain.events import DomainEvent
from taxable_account.domain.models import MarketSignals, TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState, RiskStatus, SelectionReason
from taxable_account.engine import TaxableAccountEngine
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model

PKG = ROOT / "taxable_account"

CRISIS = {
    "2016": (date(2016, 1, 1), date(2016, 3, 31)),
    "COVID": (date(2020, 2, 15), date(2020, 5, 31)),
    "2022": (date(2022, 1, 1), date(2022, 8, 31)),
    "2024": (date(2024, 8, 1), date(2025, 5, 31)),
}


# ---------------------------------------------------------------------------
# 1. Detection — spec-base formulas (independent oracle vs sensors.py)
# ---------------------------------------------------------------------------

def _oracle_dd15_ma200(close: pd.Series) -> pd.Series:
    close = close.astype(float).sort_index()
    high250 = close.rolling(250, min_periods=200).max()
    dd = (high250 - close) / high250
    ma200 = close.rolling(200, min_periods=200).mean()
    return ((dd >= 0.15) & (close < ma200)).fillna(False)


def _oracle_crash_15(nikkei: pd.Series) -> pd.Series:
    high252 = nikkei.astype(float).rolling(252, min_periods=100).max()
    return ((nikkei / high252 - 1.0) <= -0.15).fillna(False)


def test_detection_dd15_ma200_matches_spec_oracle():
    bundle = load_market_bundle()
    close = bundle.growth_close.dropna().iloc[-1500:]
    got = compute_dd15_ma200(close)
    exp = _oracle_dd15_ma200(close)
    pd.testing.assert_series_equal(got.astype(bool), exp.astype(bool), check_names=False)


def test_detection_crash_15_matches_spec_oracle():
    bundle = load_market_bundle()
    nik = bundle.nikkei.dropna().iloc[-2000:]
    got = compute_crash_15(nik)
    exp = _oracle_crash_15(nik)
    pd.testing.assert_series_equal(got.astype(bool), exp.astype(bool), check_names=False)


def test_detection_recovery_model_b_rules():
    """Model B: ON immediate on sensor True; OFF only after clear_days of (False & RSI>=50)."""
    idx = pd.bdate_range("2018-01-01", periods=100)
    close = pd.Series(100.0, index=idx, dtype=float)
    # mostly up with occasional small downs so Wilder RSI is defined and >=50
    rng = np.random.default_rng(0)
    for i in range(1, len(close)):
        close.iloc[i] = close.iloc[i - 1] * (1.003 if rng.random() > 0.2 else 0.999)

    raw = pd.Series(False, index=idx)
    raw.iloc[10:25] = True
    alert, streak = compute_alert_model_b(raw, close, clear_days=20)
    assert bool(alert.iloc[10]) is True
    assert bool(alert.iloc[24]) is True
    # still ON right after sensor clears (streak not yet 20)
    assert bool(alert.iloc[25]) is True
    # first OFF day must be after >=20 qualifying clears
    off_idx = np.where(~alert.to_numpy() & alert.shift(1, fill_value=False).to_numpy())[0]
    assert len(off_idx) >= 1
    first_off = int(off_idx[0])
    assert first_off >= 25 + 19
    assert bool(alert.iloc[first_off]) is False
    assert int(streak.iloc[first_off - 1]) >= 19


def test_detection_semi_signal_excludes_crash_15():
    """Spec: semi_signal := themes AND NOT crash_15 (never both True)."""
    adapter = DetectionAdapter(load_market_bundle())
    frame = adapter.frame.dropna(subset=["crash_15", "semi_signal"])
    both = frame["crash_15"].astype(bool) & frame["semi_signal"].astype(bool)
    assert int(both.sum()) == 0


def test_detection_adapter_signal_contract():
    adapter = DetectionAdapter(load_market_bundle())
    cond = adapter.condition_on(date(2020, 3, 24))
    assert set(cond.signals.to_dict()) == {
        "dd15_ma200",
        "crash_15",
        "semi_signal",
        "recovery_model_b_met",
        "recovery_b_days",
    }
    assert isinstance(cond.alert_on, bool)
    assert "NIKKEI_LEV_1570" in cond.prices


# ---------------------------------------------------------------------------
# 2. Decision Validation
# ---------------------------------------------------------------------------

def test_regime_transition_table_spec():
    allowed = {
        (RegimeState.GROWTH_ACTIVE, DomainEvent.ALERT_ON, RegimeState.EXIT_PENDING),
        (RegimeState.EXIT_PENDING, DomainEvent.TRANSFER_COMPLETE, RegimeState.SWING_ACTIVE),
        (RegimeState.EXIT_PENDING, DomainEvent.ALERT_OFF, RegimeState.REENTRY_PENDING),
        (RegimeState.SWING_ACTIVE, DomainEvent.ALERT_OFF, RegimeState.REENTRY_PENDING),
        (RegimeState.REENTRY_PENDING, DomainEvent.RECOVERY_COMPLETE, RegimeState.GROWTH_ACTIVE),
        (RegimeState.REENTRY_PENDING, DomainEvent.ALERT_ON, RegimeState.EXIT_PENDING),
    }
    for frm, ev, to in allowed:
        s = TaxableAccountState(regime_state=frm)
        apply_regime_event(s, ev)
        assert s.regime_state == to
    assert not can_transition(RegimeState.GROWTH_ACTIVE, DomainEvent.TRANSFER_COMPLETE)
    assert not can_transition(RegimeState.SWING_ACTIVE, DomainEvent.RECOVERY_COMPLETE)


@pytest.mark.parametrize(
    "regime,crash,semi,expect_asset,expect_reason",
    [
        (RegimeState.GROWTH_ACTIVE, False, False, Asset.NOMURA_WORLD_SEMI, SelectionReason.GROWTH_DEFAULT),
        (RegimeState.GROWTH_ACTIVE, True, True, Asset.NOMURA_WORLD_SEMI, SelectionReason.GROWTH_DEFAULT),
        (RegimeState.SWING_ACTIVE, True, True, Asset.NIKKEI_LEV_1570, SelectionReason.CRASH_15),
        (RegimeState.SWING_ACTIVE, False, True, Asset.SEMI_282A, SelectionReason.SEMI_SIGNAL),
        (RegimeState.SWING_ACTIVE, False, False, Asset.CASH, SelectionReason.FLAT),
        (RegimeState.EXIT_PENDING, True, True, Asset.CASH, SelectionReason.TRANSITIONAL),
        (RegimeState.REENTRY_PENDING, True, True, Asset.CASH, SelectionReason.TRANSITIONAL),
    ],
)
def test_asset_selection_priority(regime, crash, semi, expect_asset, expect_reason):
    sig = MarketSignals(crash_15=crash, semi_signal=semi, dd15_ma200=regime != RegimeState.GROWTH_ACTIVE)
    r = select_asset(regime, sig)
    assert r.asset == expect_asset
    assert r.reason == expect_reason


# ---------------------------------------------------------------------------
# 3. Position / Risk Validation
# ---------------------------------------------------------------------------

def test_1570_risk_control_flow_spec():
    eng = TaxableAccountEngine()
    eng.on_event(DomainEvent.ALERT_ON)
    eng.on_event(DomainEvent.TRANSFER_COMPLETE)
    eng.set_signals(MarketSignals(dd15_ma200=True, crash_15=True))
    eng.on_event(DomainEvent.SIGNAL_ENTRY_AVAILABLE)
    eng.on_event(DomainEvent.ENTRY_FILLED, fill_asset=Asset.NIKKEI_LEV_1570, fill_price=1000.0)
    assert eng.state.position_state == PositionState.POSITION_ACTIVE
    assert eng.state.risk_control.status == RiskStatus.ACTIVE
    assert eng.state.risk_control.stop_price == pytest.approx(850.0)
    eng.on_event(DomainEvent.STOP_TRIGGERED)
    assert eng.state.risk_control.status == RiskStatus.TRIGGERED
    eng.on_event(DomainEvent.EXIT_FILLED, fill_price=840.0)
    assert eng.state.position_state == PositionState.REENTRY_WAIT
    assert eng.state.held_asset == Asset.CASH
    assert eng.state.risk_control.status == RiskStatus.NA


# ---------------------------------------------------------------------------
# 4. State Integrity
# ---------------------------------------------------------------------------

def _module_assigns_trading_decision(path: Path) -> bool:
    """Discord adapter must not compute BUY/HOLD/SELL from market math."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    banned_attrs = {"crash_15", "dd15_ma200", "semi_signal", "select_asset", "apply_regime"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Attribute) and node.attr in banned_attrs:
            return True
        if isinstance(node, ast.Name) and node.id in {"select_asset", "apply_regime_event"}:
            return True
    return False


def test_state_is_sot_detection_has_no_position_fields():
    adapter = DetectionAdapter(load_market_bundle())
    assert not hasattr(adapter, "regime_state")
    assert not hasattr(adapter, "position_state")
    assert not hasattr(adapter, "risk_control")
    # cache frame is market features only
    cols = set(adapter.frame.columns)
    assert "regime_state" not in cols
    assert "position_state" not in cols


def test_viewmodel_projects_from_state_only():
    st = TaxableAccountState(
        regime_state=RegimeState.SWING_ACTIVE,
        position_state=PositionState.POSITION_ACTIVE,
        held_asset=Asset.NIKKEI_LEV_1570,
        asset=Asset.NIKKEI_LEV_1570,
        entry_price=1000.0,
        entry_date=date(2016, 1, 14),
    )
    from taxable_account.position.risk_control import arm_stop

    st.risk_control = arm_stop(1000.0)
    vm = project_view_model(st, current_price=900.0)
    # decision is a pure mapping of state enums (display), not a new sensor
    assert vm["current_state"]["decision"] == "HOLD"
    assert vm["current_state"]["position_state"] == "RISK_CONTROL_ACTIVE"
    assert vm["position"]["risk_stop"]["stop_price"] == pytest.approx(850.0)
    assert vm["reference"]["pnl_pct"] == pytest.approx(-0.10)
    # return derived from args + state entry only
    assert vm["position"]["return_pct"] == pytest.approx(-0.10)


def test_discord_adapter_no_market_judgment():
    assert _module_assigns_trading_decision(PKG / "view" / "discord_adapter.py") is False
    st = TaxableAccountState(position_state=PositionState.ENTRY_READY, asset=Asset.NIKKEI_LEV_1570)
    vm = project_view_model(st)
    payload = project_discord_payload(vm, dry_run=True)
    # Discord peacetime surface: Fortress 4-field mapping (not raw decision codes)
    assert "出撃準備" in payload.content or "購入" in payload.content
    assert "ENTRY_READY" not in payload.content
    assert payload.dry_run is True


def test_no_legacy_protocol_imports_in_package():
    """Import-boundary only (docstrings / ban-lists may mention names)."""
    banned = ("sox_protocol", "ndx_sell", "run_longterm", "run_swing", "sox_utils", "discord_morning")
    for path in PKG.rglob("*.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    for b in banned:
                        assert b not in alias.name, f"{path} imports {alias.name}"
            elif isinstance(node, ast.ImportFrom) and node.module:
                for b in banned:
                    assert b not in node.module, f"{path} imports from {node.module}"


# ---------------------------------------------------------------------------
# 5. Historical Scenario — 1570 stop false-fire check
# ---------------------------------------------------------------------------

def _crisis_1570_paths():
    """For crash_15 days in crisis windows, measure MAE from entry using 1570 OHLC."""
    bundle = load_market_bundle()
    ohlc = load_1570_ohlc()
    crash = compute_crash_15(bundle.nikkei)
    rows = []
    for name, (start, end) in CRISIS.items():
        idx = crash.index[(crash.index.date >= start) & (crash.index.date <= end) & crash.fillna(False)]
        # entry candidates: first day of contiguous crash True runs
        entries = []
        prev = False
        for ts in idx:
            if crash.loc[ts] and not prev:
                entries.append(ts)
            prev = bool(crash.loc[ts]) if ts in crash.index else False
        # also evaluate known review entries if present
        for et in entries:
            if et not in ohlc.index:
                continue
            entry_px = float(ohlc.loc[et, "close"])
            # hold up to 20 business days
            fut = ohlc.loc[et:].iloc[1:21]
            if len(fut) == 0:
                continue
            min_low = float(fut["low"].min())
            min_close = float(fut["close"].min())
            mae_low = min_low / entry_px - 1.0
            mae_close = min_close / entry_px - 1.0
            stop_hit = mae_low <= -0.15
            rows.append(
                {
                    "crisis": name,
                    "entry": et.date(),
                    "entry_px": entry_px,
                    "mae_low": mae_low,
                    "mae_close": mae_close,
                    "stop_hit_low": stop_hit,
                }
            )
    return pd.DataFrame(rows)


def test_historical_stop_behavior_by_crisis():
    df = _crisis_1570_paths()
    assert len(df) > 0, "expected crash_15 entry candidates in crisis windows"
    # Persist summary for registration evidence
    out = ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase45_validation"
    out.mkdir(parents=True, exist_ok=True)
    df.to_csv(out / "crisis_1570_stop_paths.csv", index=False)

    by = df.groupby("crisis")["stop_hit_low"].agg(["sum", "count", "mean"])
    by.to_csv(out / "crisis_1570_stop_hit_rates.csv")

    # Spec expectations from prior validated review (spec-level, not Legacy import):
    # 2016-type: continuation risk — at least one stop-hit path expected
    if "2016" in by.index and by.loc["2016", "count"] > 0:
        assert by.loc["2016", "sum"] >= 1, "2016 should show at least one -15% low breach path"

    # COVID rebound-type: majority of crash entries should NOT hit -15% from entry
    # (anti-false-fire). Allow rare hits but rate must be low.
    if "COVID" in by.index and by.loc["COVID", "count"] >= 3:
        assert by.loc["COVID", "mean"] <= 0.35, (
            f"COVID stop hit rate too high (false-fire risk): {by.loc['COVID', 'mean']:.2f}"
        )

    # 2024: should not be dominated by stop hits
    if "2024" in by.index and by.loc["2024", "count"] >= 1:
        assert by.loc["2024", "mean"] <= 0.5


def test_historical_runtime_stop_events_not_excessive():
    """Paper runtime over crisis windows: STOP_TRIGGERED should be rare except deep continuations."""
    adapter = DetectionAdapter(load_market_bundle())
    frame = adapter.frame
    results = []
    for name, (start, end) in CRISIS.items():
        # restart runtime per crisis to avoid cross-window contamination
        rt = TaxableAccountRuntime(adapter, config=RuntimeConfig(auto_transfer=True, auto_fill=True))
        # warm-up: step a few days before window if available
        pre = frame.index[(frame.index.date >= date(start.year - 1, 1, 1)) & (frame.index.date < start)]
        for ts in pre[-5:]:
            rt.step(ts.date())
        stops = 0
        entries = 0
        days = frame.index[(frame.index.date >= start) & (frame.index.date <= end)]
        for ts in days:
            r = rt.step(ts.date())
            if "ENTRY_FILLED" in r.events and rt.state.held_asset == Asset.NIKKEI_LEV_1570:
                entries += 1
            if "STOP_TRIGGERED" in r.events:
                stops += 1
        results.append({"crisis": name, "entries_1570": entries, "stop_events": stops})

    out = ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase45_validation"
    out.mkdir(parents=True, exist_ok=True)
    pdf = pd.DataFrame(results)
    pdf.to_csv(out / "crisis_runtime_stop_events.csv", index=False)

    covid = pdf[pdf.crisis == "COVID"]
    if len(covid) and int(covid.iloc[0]["entries_1570"]) > 0:
        # COVID must not stop on every entry
        assert int(covid.iloc[0]["stop_events"]) < int(covid.iloc[0]["entries_1570"])
