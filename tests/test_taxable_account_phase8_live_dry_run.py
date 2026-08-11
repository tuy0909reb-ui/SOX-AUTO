"""
Phase 8 — Live Operation Dry Run tests.

Webhook infra only. No Legacy protocol imports. No trading-rule changes.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.domain.models import TaxableAccountState
from taxable_account.validation.live_dry_run import (
    EVIDENCE_DIR,
    run_live_dry_run,
    write_evidence,
)
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model
from taxable_account.view.webhook_config import resolve_webhook_url, webhook_source_label

PKG = ROOT / "taxable_account"


def test_phase8_live_dry_run_pass():
    report = run_live_dry_run(send=False, allow_unconfigured_webhook=True)
    failed = [c.name for c in report.checks if not c.ok]
    assert report.passed, failed
    out = write_evidence(report, evidence_dir=EVIDENCE_DIR)
    summary = json.loads((out / "summary.json").read_text(encoding="utf-8"))
    assert summary["overall"] == "PASS"
    assert summary["send_attempted"] is False


def test_phase8_webhook_env_fallback_order():
    with patch.dict(os.environ, {"TAXABLE_DISCORD_WEBHOOK": "", "DISCORD_WEBHOOK_URL": ""}):
        with patch("taxable_account.view.webhook_config._from_file", return_value=None):
            assert resolve_webhook_url() is None
            assert webhook_source_label() == "UNCONFIGURED"

    with patch.dict(
        os.environ,
        {
            "TAXABLE_DISCORD_WEBHOOK": "",
            "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/1/abc",
        },
    ):
        with patch("taxable_account.view.webhook_config._from_file", return_value=None):
            assert resolve_webhook_url() == "https://discord.com/api/webhooks/1/abc"
            assert webhook_source_label() == "DISCORD_WEBHOOK_URL"

    with patch.dict(
        os.environ,
        {
            "TAXABLE_DISCORD_WEBHOOK": "https://discord.com/api/webhooks/9/xyz",
            "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/1/abc",
        },
    ):
        assert resolve_webhook_url().endswith("/9/xyz")
        assert webhook_source_label() == "TAXABLE_DISCORD_WEBHOOK"


def test_phase8_adapter_posts_via_resolved_webhook():
    vm = project_view_model(TaxableAccountState())
    mock_resp = MagicMock()
    mock_resp.status_code = 204
    mock_resp.text = ""
    with patch(
        "taxable_account.view.discord_adapter.requests.post", return_value=mock_resp
    ) as mocked:
        with patch(
            "taxable_account.view.discord_adapter.resolve_webhook_url",
            return_value="https://discord.com/api/webhooks/test/token",
        ):
            disc = project_discord_payload(vm, dry_run=False)
    assert disc.sent is True
    assert disc.error is None
    assert mocked.called
    assert "webhooks/test/token" in mocked.call_args[0][0]


def test_phase8_no_legacy_imports():
    import ast

    banned = {"sox_protocol", "sox_utils", "discord_notify", "ndx_sell", "run_longterm", "run_swing"}
    for path in PKG.rglob("*.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    assert not any(b in alias.name for b in banned), path
            elif isinstance(node, ast.ImportFrom) and node.module:
                assert not any(b in node.module for b in banned), path
