"""
Phase 6 — Operational Replay Validation tests.

Harness + scenarios only. Does not modify trading protocol / ViewModel logic.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.validation.operational_replay import (
    DEFAULT_EVIDENCE_DIR,
    run_all_scenarios,
    run_scenario_1_normal_growth,
    run_scenario_2_growth_exit_transition,
    run_scenario_3_crash_recovery_entry,
    run_scenario_4_1570_risk_control,
    run_scenario_5_282a_swing,
    run_scenario_6_recovery_reentry,
    write_evidence,
)

PKG = ROOT / "taxable_account"


def test_phase6_scenario1_normal_growth():
    r = run_scenario_1_normal_growth()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_scenario2_growth_exit():
    r = run_scenario_2_growth_exit_transition()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_scenario3_crash_1570():
    r = run_scenario_3_crash_recovery_entry()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_scenario4_1570_risk_stop():
    r = run_scenario_4_1570_risk_control()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_scenario5_282a():
    r = run_scenario_5_282a_swing()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_scenario6_recovery():
    r = run_scenario_6_recovery_reentry()
    assert r.passed, [c for c in r.checks if not c["pass"]]


def test_phase6_all_and_evidence():
    results = run_all_scenarios()
    assert all(r.passed for r in results), [(r.scenario_id, r.status) for r in results]
    out = write_evidence(results, evidence_dir=DEFAULT_EVIDENCE_DIR)
    assert (out / "summary.json").exists()
    for r in results:
        assert list(out.glob(f"{r.scenario_id}_*.json"))
        assert list(out.glob(f"{r.scenario_id}_*.log"))


def test_phase6_no_protocol_touch():
    """Harness must not import Legacy; decision modules not rewritten by this phase."""
    banned = ("sox_protocol", "ndx_sell", "run_longterm", "run_swing", "discord_morning")
    text = (PKG / "validation" / "operational_replay.py").read_text(encoding="utf-8")
    for b in banned:
        assert b not in text
    # Decision/sensor files must remain free of phase6 harness coupling
    for rel in (
        "decision/regime.py",
        "decision/asset_selection.py",
        "detection/sensors.py",
        "position/risk_control.py",
    ):
        src = (PKG / rel).read_text(encoding="utf-8")
        assert "operational_replay" not in src
        assert "phase6" not in src.lower()
