"""
Phase 7 — Operational Readiness Check tests.

Ops infrastructure only. No trading-rule / ViewModel-schema changes.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.validation.operational_readiness import (
    EVIDENCE_DIR,
    run_operational_readiness,
    write_evidence,
)

PKG = ROOT / "taxable_account"


def test_phase7_operational_readiness_pass():
    report = run_operational_readiness()
    failed = [c.name for c in report.checks if not c.ok]
    failed_sc = [s["name"] for s in report.scenarios if not s["pass"]]
    assert report.passed, {"checks": failed, "scenarios": failed_sc}
    out = write_evidence(report, evidence_dir=EVIDENCE_DIR)
    summary = json.loads((out / "summary.json").read_text(encoding="utf-8"))
    assert summary["overall"] == "PASS"
    assert summary["freeze_recommended"] is True


def test_phase7_no_viewmodel_schema_drift():
    """Phase 7 must not alter ViewModel schema const."""
    schema = json.loads(
        (ROOT / "docs" / "schemas" / "taxable_account_viewmodel.schema.json").read_text(encoding="utf-8")
    )
    assert schema["properties"]["schema_version"]["const"] == "2.1"


def test_phase7_no_legacy_and_no_rule_coupling():
    banned = ("sox_protocol", "ndx_sell", "run_longterm", "run_swing", "discord_morning")
    text = (PKG / "validation" / "operational_readiness.py").read_text(encoding="utf-8")
    for b in banned:
        assert b not in text
    for rel in (
        "decision/regime.py",
        "decision/asset_selection.py",
        "detection/sensors.py",
        "position/risk_control.py",
        "view/view_model.py",
    ):
        src = (PKG / rel).read_text(encoding="utf-8")
        assert "operational_readiness" not in src
