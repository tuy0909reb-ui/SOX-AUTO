"""Phase 8.2 — Discord migration test (mocked delivery in CI)."""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from taxable_account.validation.discord_migration_test import (
    ALLOWED_SOURCES,
    run_discord_migration_test,
)
from taxable_account.validation.discord_test_send import EXPECTED_FIELD_ORDER


def test_phase82_migration_dry_run_layout():
    payload = run_discord_migration_test(dry_run=True)
    assert payload["field_order"] == EXPECTED_FIELD_ORDER
    names = {c["name"]: c["pass"] for c in payload["checks"]}
    assert names["embed_fields_present"]
    assert names["no_new_webhook_created"]
    assert names["no_new_channel"]


def test_phase82_migration_mocked_post_uses_existing_resolver():
    mock_resp = MagicMock()
    mock_resp.status_code = 204
    mock_resp.text = ""
    with patch(
        "taxable_account.validation.discord_test_send.requests.post",
        return_value=mock_resp,
    ) as mocked:
        with patch(
            "taxable_account.validation.discord_test_send.resolve_webhook_url",
            return_value="https://discord.com/api/webhooks/sox/existing",
        ):
            with patch(
                "taxable_account.validation.discord_migration_test.webhook_source_label",
                return_value="DISCORD_WEBHOOK_URL",
            ):
                with patch(
                    "taxable_account.validation.discord_migration_test.resolve_webhook_url",
                    return_value="https://discord.com/api/webhooks/sox/existing",
                ):
                    payload = run_discord_migration_test(dry_run=False)
    assert payload["overall"] == "PASS"
    assert payload["sent"] is True
    assert payload["webhook_source"] in ALLOWED_SOURCES
    assert mocked.called
    assert "webhooks/sox/existing" in mocked.call_args[0][0]
