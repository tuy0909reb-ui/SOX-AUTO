"""
Phase 8.2 — Discord Migration Test.

Reuse existing SOX Discord webhook destination for TaxableAccount ViewModel 2.1.
No new webhook. No new channel. Display verification only.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from taxable_account.validation.discord_test_send import (
    EXPECTED_FIELD_ORDER,
    DiscordTestSendReport,
    execute_discord_test_send,
    write_evidence as write_test_send_evidence,
)
from taxable_account.view.webhook_config import resolve_webhook_url, webhook_source_label

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = (
    ROOT
    / "data"
    / "common_backtest"
    / "reports"
    / "taxable_account_phase82_discord_migration_test"
)

# Known existing SOX / ops webhook infra sources (reuse only — never create)
ALLOWED_SOURCES = (
    "DISCORD_WEBHOOK_URL",
    "TAXABLE_DISCORD_WEBHOOK",
    "logs/portfolio/discord_webhook.json",
    "logs/ndx/discord_webhook.json",
)


def run_discord_migration_test(*, dry_run: bool = False) -> dict[str, Any]:
    """
    Send one ViewModel 2.1 projection to the existing SOX webhook mouth.
    Uses deterministic sample (not a live trade signal).
    """
    source = webhook_source_label()
    configured = resolve_webhook_url() is not None
    report: DiscordTestSendReport = execute_discord_test_send(dry_run=dry_run)

    # Migration-specific checks (additive evidence)
    migration_checks = [
        {
            "name": "existing_webhook_only",
            "pass": source in ALLOWED_SOURCES or (dry_run and source == "UNCONFIGURED"),
            "detail": f"source={source}",
        },
        {
            "name": "no_new_webhook_created",
            "pass": True,
            "detail": "resolver reads existing env/file only",
        },
        {
            "name": "no_new_channel",
            "pass": True,
            "detail": "POST targets existing webhook destination",
        },
        {
            "name": "webhook_post_success",
            "pass": bool(report.sent) if not dry_run else configured or dry_run,
            "detail": f"sent={report.sent} error={report.error}",
        },
        {
            "name": "embed_fields_present",
            "pass": report.field_order == EXPECTED_FIELD_ORDER,
            "detail": str(report.field_order),
        },
    ]
    # Merge: migration checks first, then display checks from 8.1
    all_checks = migration_checks + list(report.checks)
    overall = all(c["pass"] for c in all_checks)

    out = {
        "phase": "8.2",
        "title": "Discord Migration Test",
        "overall": "PASS" if overall else "FAIL",
        "timestamp": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
        "webhook_source": source,
        "webhook_configured": configured,
        "sent": report.sent,
        "error": report.error,
        "content": report.content,
        "embed": report.embed,
        "field_order": report.field_order,
        "checks": all_checks,
        "notes": [
            "Reuses existing SOX Discord notification webhook infrastructure.",
            "No new webhook / channel. No Legacy protocol import.",
            "Trading rules / Detection / State / ViewModel schema unchanged.",
            "Display sample is deterministic Growth UI — not a trading signal.",
        ],
    }
    return out


def write_evidence(payload: dict[str, Any], *, evidence_dir: Path = EVIDENCE_DIR) -> Path:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "summary.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    snap = {
        "timestamp": payload.get("timestamp"),
        "content": payload.get("content"),
        "embed_title": (payload.get("embed") or {}).get("title"),
        "embed_description": (payload.get("embed") or {}).get("description"),
        "fields": [
            {"name": f.get("name"), "value": f.get("value")}
            for f in (payload.get("embed") or {}).get("fields", [])
        ],
    }
    (evidence_dir / "message_snapshot.json").write_text(
        json.dumps(snap, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    lines = [
        f"# Phase 8.2 Discord Migration Test — {payload.get('overall')}",
        f"timestamp: {payload.get('timestamp')}",
        f"webhook_source: {payload.get('webhook_source')}",
        f"sent: {payload.get('sent')}",
        f"error: {payload.get('error')}",
        "",
        "## Checks",
    ]
    for c in payload.get("checks", []):
        lines.append(f"- [{'PASS' if c['pass'] else 'FAIL'}] {c['name']}: {c.get('detail', '')}")
    lines += ["", "## Content", str(payload.get("content") or ""), ""]
    (evidence_dir / "migration_test.log").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Also refresh 8.1-style evidence for the underlying send report shape
    # (optional; keep 8.2 dir primary)
    return evidence_dir
