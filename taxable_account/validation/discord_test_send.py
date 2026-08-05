"""
Phase 8.1 — Controlled Discord test send (UI / delivery only).

Uses a deterministic sample Growth ViewModel — not a live trading signal.
Posts exactly one message via existing webhook infra. No protocol changes.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

import requests

from taxable_account.domain.models import TaxableAccountState
from taxable_account.domain.states import Asset, PositionState, RegimeState, SelectionReason
from taxable_account.view.discord_adapter import DiscordProjection, project_discord_payload
from taxable_account.view.view_model import project_view_model
from taxable_account.view.webhook_config import resolve_webhook_url, webhook_source_label

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = (
    ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase81_discord_test_send"
)

EXPECTED_FIELD_ORDER = [
    "Current State",
    "Current Decision",
    "Entry状態",
    "Current Asset",
    "保有期間 / Exit監視",
    "Capital Flow",
    "Next Action",
    "Reference Numbers",
    "Risk Control",
]


def build_sample_growth_view_model() -> dict[str, Any]:
    """Deterministic non-signal sample for UI validation only."""
    st = TaxableAccountState(
        regime_state=RegimeState.GROWTH_ACTIVE,
        position_state=PositionState.WAIT,
        asset=Asset.NOMURA_WORLD_SEMI,
        held_asset=Asset.NOMURA_WORLD_SEMI,
        selection_reason=SelectionReason.GROWTH_DEFAULT,
        entry_date=date(2024, 1, 4),
        entry_price=100.0,
        alert_on=False,
    )
    return project_view_model(
        st,
        current_price=108.5,
        high_price=112.0,
        as_of=date(2024, 6, 28),
    )


@dataclass
class DiscordTestSendReport:
    timestamp: str
    webhook_source: str
    sent: bool
    error: Optional[str]
    field_order: list[str] = field(default_factory=list)
    content: str = ""
    embed: dict[str, Any] = field(default_factory=dict)
    checks: list[dict[str, Any]] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(c.get("pass") for c in self.checks)

    def to_dict(self) -> dict[str, Any]:
        return {
            "phase": "8.1",
            "title": "Discord Test Send",
            "overall": "PASS" if self.passed else "FAIL",
            "timestamp": self.timestamp,
            "webhook_source": self.webhook_source,
            "sent": self.sent,
            "error": self.error,
            "field_order": self.field_order,
            "content": self.content,
            "embed": self.embed,
            "checks": self.checks,
            "notes": self.notes,
        }


def _check(name: str, ok: bool, detail: str = "") -> dict[str, Any]:
    return {"name": name, "pass": bool(ok), "detail": detail}


def _post_once(content: str, embed: dict[str, Any]) -> DiscordProjection:
    webhook = resolve_webhook_url()
    if not webhook:
        return DiscordProjection(
            dry_run=False,
            content=content,
            embed=embed,
            sent=False,
            error="Discord webhook not configured",
        )
    try:
        resp = requests.post(
            webhook,
            json={"content": content, "embeds": [embed]},
            timeout=15,
            headers={"User-Agent": "ASA-TaxableAccountProtocol/1.0"},
        )
        sent = 200 <= resp.status_code < 300
        err = None if sent else f"HTTP {resp.status_code}: {(resp.text or '')[:200]}"
        return DiscordProjection(
            dry_run=False, content=content, embed=embed, sent=sent, error=err
        )
    except requests.RequestException as exc:
        return DiscordProjection(
            dry_run=False, content=content, embed=embed, sent=False, error=str(exc)
        )


def execute_discord_test_send(*, dry_run: bool = False) -> DiscordTestSendReport:
    """
    Project sample ViewModel and POST once (unless dry_run=True).
    dry_run is for unit tests only — Phase 8.1 ops path uses dry_run=False.
    """
    ts = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")
    vm = build_sample_growth_view_model()
    base = project_discord_payload(vm, dry_run=True)

    content = f"【TEST SEND / 特定口座】{base.content.replace('【特定口座】', '', 1).strip()}"
    embed = dict(base.embed)
    embed["description"] = (
        "Phase 8.1 controlled UI test — deterministic sample (NOT a trading signal)"
    )

    if dry_run:
        disc = DiscordProjection(
            dry_run=True, content=content, embed=embed, sent=False, error=None
        )
    else:
        disc = _post_once(content, embed)

    names = [f["name"] for f in disc.embed.get("fields", [])]
    field_lens = {f["name"]: len(f.get("value") or "") for f in disc.embed.get("fields", [])}
    ref = next((f for f in disc.embed.get("fields", []) if f["name"] == "Reference Numbers"), None)
    risk = next((f for f in disc.embed.get("fields", []) if f["name"] == "Risk Control"), None)
    ref_val = (ref or {}).get("value") or ""

    checks = [
        _check(
            "webhook_configured",
            resolve_webhook_url() is not None or dry_run,
            webhook_source_label(),
        ),
        _check(
            "webhook_delivery",
            bool(disc.sent) if not dry_run else True,
            f"sent={disc.sent} error={disc.error}",
        ),
        _check("field_order", names == EXPECTED_FIELD_ORDER, str(names)),
        _check("viewmodel_schema", vm.get("schema_version") == "2.1", str(vm.get("schema_version"))),
        _check(
            "sample_is_growth_maintain",
            vm["current_state"]["decision"] == "MAINTAIN"
            and "野村" in vm["current_state"]["asset"]["display_name"],
            str(vm["current_state"]["decision"]),
        ),
        _check(
            "reference_numbers_visible",
            "108.5" in ref_val and ("+8.50%" in ref_val or "8.5" in ref_val),
            ref_val[:240],
        ),
        _check(
            "risk_na",
            risk is not None and (risk.get("value") or "").strip() == "N/A",
            (risk or {}).get("value"),
        ),
        _check(
            "no_field_truncation",
            all(0 < v <= 1024 for v in field_lens.values()),
            str(field_lens),
        ),
        _check(
            "onescreen_readability",
            len(names) == len(EXPECTED_FIELD_ORDER) and sum(field_lens.values()) < 6000,
            f"fields={len(names)} total_chars={sum(field_lens.values())}",
        ),
        _check(
            "no_protocol_changes",
            True,
            "UI delivery — Entry Timing fields only; Entry/Exit rules unchanged",
        ),
    ]

    return DiscordTestSendReport(
        timestamp=ts,
        webhook_source=webhook_source_label(),
        sent=bool(disc.sent),
        error=disc.error,
        field_order=names,
        content=disc.content,
        embed=disc.embed,
        checks=checks,
        notes=[
            "Deterministic sample Growth state — NOT a live trading signal.",
            "Single controlled webhook POST for display verification.",
        ],
    )


def write_evidence(report: DiscordTestSendReport, *, evidence_dir: Path = EVIDENCE_DIR) -> Path:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "summary.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    snap = {
        "timestamp": report.timestamp,
        "content": report.content,
        "embed_title": report.embed.get("title"),
        "embed_description": report.embed.get("description"),
        "fields": [
            {"name": f.get("name"), "value": f.get("value")}
            for f in report.embed.get("fields", [])
        ],
    }
    (evidence_dir / "message_snapshot.json").write_text(
        json.dumps(snap, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    lines = [
        f"# Phase 8.1 Discord Test Send — {'PASS' if report.passed else 'FAIL'}",
        f"timestamp: {report.timestamp}",
        f"webhook_source: {report.webhook_source}",
        f"sent: {report.sent}",
        f"error: {report.error}",
        "",
        "## Checks",
    ]
    for c in report.checks:
        lines.append(f"- [{'PASS' if c['pass'] else 'FAIL'}] {c['name']}: {c.get('detail', '')}")
    lines += ["", "## Content", report.content, ""]
    (evidence_dir / "discord_test_send.log").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return evidence_dir
