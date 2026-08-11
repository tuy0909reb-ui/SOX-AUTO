"""Phase 8.1 — Discord test send (projection checks; live POST not required in CI)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.validation.discord_test_send import (
    EXPECTED_FIELD_ORDER,
    build_sample_growth_view_model,
    execute_discord_test_send,
)


def test_sample_viewmodel_is_deterministic_growth():
    vm = build_sample_growth_view_model()
    assert vm["schema_version"] == "2.1"
    assert vm["current_state"]["decision"] == "MAINTAIN"
    assert "野村" in vm["current_state"]["asset"]["display_name"]
    assert vm["risk"]["applicable"] is False


def test_phase81_dry_run_layout_and_checks():
    report = execute_discord_test_send(dry_run=True)
    assert report.field_order == EXPECTED_FIELD_ORDER
    # delivery check skipped in dry_run; others must pass
    by = {c["name"]: c["pass"] for c in report.checks}
    assert by["field_order"]
    assert by["reference_numbers_visible"]
    assert by["risk_na"]
    assert by["onescreen_readability"]
    assert by["no_protocol_changes"]
