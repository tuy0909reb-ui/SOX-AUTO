"""
Phase 8 — Live Operation Dry Run.

Validates: ViewModel 2.1 → Discord Adapter → Webhook infra → Discord display path.

Default mode does NOT post (projection dry-run). Optional --send posts via
shared DISCORD_WEBHOOK_URL / TAXABLE_DISCORD_WEBHOOK (no Legacy protocol imports).
"""

from __future__ import annotations

import json
import tempfile
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Any, Optional
from unittest.mock import MagicMock, patch

from taxable_account.detection.adapter import DetectionAdapter
from taxable_account.detection.data_loader import load_market_bundle
from taxable_account.domain.models import TaxableAccountState
from taxable_account.engine import TaxableAccountEngine
from taxable_account.runtime.session import RuntimeConfig, TaxableAccountRuntime
from taxable_account.state.file_store import FileStateStore
from taxable_account.view.discord_adapter import project_discord_payload
from taxable_account.view.view_model import project_view_model, render_ops_text
from taxable_account.view.webhook_config import resolve_webhook_url, webhook_source_label

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_DIR = (
    ROOT / "data" / "common_backtest" / "reports" / "taxable_account_phase8_live_dry_run"
)

ONE_SCREEN_FIELDS = {
    "Current State",
    "Current Decision",
    "Entry状態",
    "Current Asset",
    "保有期間 / Exit監視",
    "Capital Flow",
    "Next Action",
    "Reference Numbers",
    "Risk Control",
}


@dataclass
class CheckResult:
    name: str
    ok: bool
    detail: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {"name": self.name, "pass": self.ok, "detail": self.detail}


@dataclass
class LiveDryRunReport:
    checks: list[CheckResult] = field(default_factory=list)
    as_of: Optional[str] = None
    webhook_source: str = "UNCONFIGURED"
    send_attempted: bool = False
    send_ok: Optional[bool] = None
    discord_content: str = ""
    notes: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return all(c.ok for c in self.checks)

    def to_dict(self) -> dict[str, Any]:
        return {
            "phase": "8",
            "title": "Live Operation Dry Run",
            "overall": "PASS" if self.passed else "FAIL",
            "as_of": self.as_of,
            "webhook_source": self.webhook_source,
            "send_attempted": self.send_attempted,
            "send_ok": self.send_ok,
            "discord_content": self.discord_content,
            "checks": [c.to_dict() for c in self.checks],
            "notes": self.notes,
        }


def _ok(name: str, cond: bool, detail: str = "") -> CheckResult:
    return CheckResult(name=name, ok=bool(cond), detail=detail)


def _latest_as_of(adapter: DetectionAdapter) -> date:
    return adapter.frame.dropna().index.max().date()


def run_daily_pipeline(
    *,
    as_of: Optional[date] = None,
    state_path: Optional[Path] = None,
    warm_days: int = 5,
    auto_fill: bool = True,
) -> tuple[dict[str, Any], TaxableAccountState, date]:
    """Market → Detection → Runtime → ViewModel (persist optional)."""
    bundle = load_market_bundle()
    adapter = DetectionAdapter(bundle)
    target = as_of or _latest_as_of(adapter)
    prior = adapter.frame.index[adapter.frame.index.date <= target]
    if len(prior) == 0:
        raise ValueError(f"no market data on/before {target}")
    target = prior[-1].date()

    if state_path is not None:
        store = FileStateStore(state_path, create_if_missing=True)
        eng = TaxableAccountEngine(store)
    else:
        eng = TaxableAccountEngine()

    pre = adapter.frame.index[adapter.frame.index.date < target]
    warm = list(pre[-max(warm_days, 0) :])
    dates = [ts.date() for ts in warm] + [target]

    rt = TaxableAccountRuntime(
        adapter,
        config=RuntimeConfig(
            auto_transfer=True,
            auto_fill=auto_fill,
            discord_dry_run=True,
        ),
        engine=eng,
    )
    rt._prev_alert = eng.state.alert_on
    result = None
    for d in dates:
        result = rt.step(d)
    assert result is not None
    if state_path is not None and isinstance(eng.store, FileStateStore):
        eng.store.save()
    return result.view_model, eng.state, target


def run_live_dry_run(
    *,
    as_of: Optional[date] = None,
    send: bool = False,
    state_path: Optional[Path] = None,
    allow_unconfigured_webhook: bool = True,
) -> LiveDryRunReport:
    """
    Full path validation.

    send=False (default): projection dry-run + mocked POST path for error handling.
    send=True: real webhook POST if URL resolved (operator-authorized live dry run).
    """
    report = LiveDryRunReport(
        notes=[
            "Webhook infra reuse only — no SOX Legacy protocol imports.",
            "Trading protocol / ViewModel schema unchanged.",
            "Default send=False; use send=True only with operator authorization.",
        ]
    )
    report.webhook_source = webhook_source_label()

    # 1) Daily update + ViewModel
    try:
        with tempfile.TemporaryDirectory() as tmp:
            path = state_path or (Path(tmp) / "phase8_state.json")
            vm, state, used_as_of = run_daily_pipeline(as_of=as_of, state_path=path)
            report.as_of = used_as_of.isoformat()
            report.checks.append(
                _ok(
                    "daily_update",
                    vm.get("schema_version") == "2.1" and report.as_of is not None,
                    f"as_of={report.as_of} schema={vm.get('schema_version')}",
                )
            )
            # persistence round-trip
            reloaded = FileStateStore(path, create_if_missing=False).state
            report.checks.append(
                _ok(
                    "state_persistence",
                    reloaded.regime_state == state.regime_state
                    and reloaded.held_asset == state.held_asset,
                    f"regime={reloaded.regime_state.value} held={reloaded.held_asset.value}",
                )
            )
    except Exception as exc:
        report.checks.append(_ok("daily_update", False, f"{type(exc).__name__}: {exc}"))
        report.checks.append(_ok("state_persistence", False, "skipped"))
        vm = project_view_model(TaxableAccountState())

    # 2) One-screen Discord projection (dry-run)
    disc = project_discord_payload(vm, dry_run=True)
    report.discord_content = disc.content
    fields = {f["name"] for f in disc.embed.get("fields", [])}
    text = render_ops_text(vm)
    report.checks.append(
        _ok(
            "onescreen_display",
            ONE_SCREEN_FIELDS.issubset(fields)
            and "特定口座 Protocol" in text
            and disc.embed.get("title") == "特定口座 Protocol",
            f"fields={sorted(fields)}",
        )
    )
    report.checks.append(
        _ok(
            "viewmodel_to_adapter",
            disc.content.startswith("【特定口座】") and vm["schema_version"] == "2.1",
            disc.content[:80],
        )
    )

    # 3) Webhook resolution (infra)
    url = resolve_webhook_url()
    configured = url is not None
    report.checks.append(
        _ok(
            "webhook_infra_resolvable",
            configured or allow_unconfigured_webhook,
            f"source={report.webhook_source} configured={configured}",
        )
    )
    # If unconfigured, still require clear error path when send requested without URL
    if not configured:
        fail_disc = project_discord_payload(vm, dry_run=False)
        report.checks.append(
            _ok(
                "error_handling_missing_webhook",
                fail_disc.error is not None and fail_disc.sent is False,
                fail_disc.error or "",
            )
        )
    else:
        report.checks.append(
            _ok("error_handling_missing_webhook", True, "webhook configured — N/A")
        )

    # 4) Adapter → HTTP POST path (mocked unless send=True)
    if send and configured:
        report.send_attempted = True
        live = project_discord_payload(vm, dry_run=False)
        report.send_ok = bool(live.sent) and live.error is None
        report.checks.append(
            _ok(
                "webhook_live_post",
                report.send_ok,
                f"sent={live.sent} error={live.error}",
            )
        )
    else:
        # Mock successful POST to prove adapter wiring without hitting Discord in CI
        mock_resp = MagicMock()
        mock_resp.status_code = 204
        mock_resp.text = ""
        with patch(
            "taxable_account.view.discord_adapter.requests.post", return_value=mock_resp
        ) as mocked:
            with patch(
                "taxable_account.view.discord_adapter.resolve_webhook_url",
                return_value="https://discord.com/api/webhooks/ci/mock",
            ):
                mocked_send = project_discord_payload(vm, dry_run=False)
        report.checks.append(
            _ok(
                "webhook_post_path",
                mocked_send.sent is True and mocked_send.error is None and mocked.called,
                "mocked HTTP 204",
            )
        )
        report.send_attempted = False
        report.send_ok = None

    # 5) Legacy boundary — import statements only (docstring mentions allowed)
    import ast

    banned = {"sox_protocol", "sox_utils", "discord_notify", "ndx_sell", "run_longterm", "run_swing"}
    leaked: list[str] = []
    for path in (ROOT / "taxable_account").rglob("*.py"):
        tree = ast.parse(path.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root = alias.name.split(".")[0]
                    if root in banned or any(b in alias.name for b in banned):
                        leaked.append(f"{path.name}:import {alias.name}")
            elif isinstance(node, ast.ImportFrom) and node.module:
                if any(b in node.module for b in banned):
                    leaked.append(f"{path.name}:from {node.module}")
    report.checks.append(_ok("no_legacy_protocol_import", not leaked, str(leaked[:5])))

    return report


def write_evidence(report: LiveDryRunReport, *, evidence_dir: Path = EVIDENCE_DIR) -> Path:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "summary.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    lines = [
        f"# Phase 8 Live Operation Dry Run — {report.to_dict()['overall']}",
        f"as_of: {report.as_of}",
        f"webhook_source: {report.webhook_source}",
        f"send_attempted: {report.send_attempted} send_ok: {report.send_ok}",
        "",
        "## Checks",
    ]
    for c in report.checks:
        lines.append(f"- [{'PASS' if c.ok else 'FAIL'}] {c.name}: {c.detail}")
    lines += ["", "## Discord content", report.discord_content, ""]
    (evidence_dir / "live_dry_run.log").write_text("\n".join(lines) + "\n", encoding="utf-8")
    return evidence_dir
