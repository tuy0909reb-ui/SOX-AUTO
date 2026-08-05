"""
Discord projection adapter (ViewModel → outbound payload).

Does NOT decide MAINTAIN/HOLD/EXIT. Optional webhook send is dry-run by default.
Does NOT import Legacy notification helpers or bots.
Does NOT compute P/L or stops — formats ViewModel fields only.

Webhook: resolve via webhook_config (TAXABLE_DISCORD_WEBHOOK → DISCORD_WEBHOOK_URL).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

import requests

from taxable_account.view.webhook_config import resolve_webhook_url


@dataclass(frozen=True)
class DiscordProjection:
    dry_run: bool
    content: str
    embed: dict[str, Any]
    sent: bool = False
    error: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "dry_run": self.dry_run,
            "content": self.content,
            "embed": self.embed,
            "sent": self.sent,
            "error": self.error,
        }


def _field(name: str, value: str, inline: bool = False) -> dict[str, Any]:
    return {"name": name, "value": (value or "—")[:1024], "inline": inline}


def _pct(v: Any) -> str:
    if v is None:
        return "n/a"
    return f"{float(v) * 100:+.2f}%"


def _num(v: Any) -> str:
    if v is None:
        return "n/a"
    if isinstance(v, float):
        return f"{v:.4g}"
    return str(v)


def _entry_timing_text(view_model: dict[str, Any]) -> str:
    """Signal (condition) vs Entry (purchase) — Operational View Entry Timing."""
    es = view_model.get("entry_status") or {}
    status_label = es.get("status_label") or es.get("status") or "待機"
    signal = es.get("signal_date") or "—"
    entry = es.get("entry_date") or ("未投入" if es.get("status") == "READY" else "—")
    candidate = es.get("candidate") or "—"
    lines = [
        f"Entry状態:\n{status_label}",
        f"条件成立:\n{signal}",
        f"Entry:\n{entry}",
        f"対象:\n{candidate}",
    ]
    if es.get("status") == "READY":
        lines.append("注意:\n保有開始前（保有期間・Time Exit未起算）")
    return "\n\n".join(lines)


def _hold_exit_text(view_model: dict[str, Any]) -> str:
    es = view_model.get("entry_status") or {}
    risk = view_model.get("risk") or {}
    cur = es.get("current_holding_days")
    mx = es.get("max_hold_business_days")
    tstat = es.get("time_exit_status") or "N/A"
    if cur is not None and mx is not None:
        hold_line = f"{cur} / {mx}営業日"
        time_line = "Time Exit監視中" if tstat == "MONITORING" else tstat
    else:
        hold_line = "N/A"
        time_line = "N/A"
    if risk.get("applicable"):
        risk_line = f"Risk Stop {_num(risk.get('stop_price'))} (-15%) / {risk.get('status')}"
    else:
        risk_line = "N/A"
    return (
        f"保有期間:\n{hold_line}\n\n"
        f"Time Exit:\n{time_line}\n\n"
        f"Risk:\n{risk_line}"
    )


def project_discord_payload(
    view_model: dict[str, Any],
    *,
    dry_run: bool = True,
    webhook_url: Optional[str] = None,
) -> DiscordProjection:
    cs = view_model["current_state"]
    cf = view_model["capital_flow"]
    ref = view_model["reference"]
    risk = view_model["risk"]
    es = view_model.get("entry_status") or {}
    signal = view_model.get("signal")

    decision_raw = cs["decision"]
    state_line = "MAINTAIN" if decision_raw == "MAINTAIN" else cs["position_state"]
    decision_line = "HOLD" if decision_raw == "MAINTAIN" else decision_raw
    asset_name = cs["asset"]["display_name"]

    state_text = (
        f"State:\n{state_line}\n\n"
        f"Asset:\n{asset_name}\n\n"
        f"Decision:\n{decision_line}"
    )
    if signal:
        state_text += f"\n\nSignal:\n{signal}"

    flow_text = (
        f"Previous:\n{cf.get('previous_asset')}\n\n"
        f"Current:\n{cf.get('current_asset')}\n\n"
        f"Next:\n{cf.get('next_candidate')}\n\n"
        f"Reason:\n{cf.get('reason')}"
    )

    entry_text = _entry_timing_text(view_model)
    hold_text = _hold_exit_text(view_model)

    # Reference kept for ops continuity; holding prefers entry_status business days
    hold_disp = es.get("current_holding_days")
    max_disp = es.get("max_hold_business_days")
    if hold_disp is not None and max_disp is not None:
        holding_str = f"{hold_disp} / {max_disp}営業日"
    elif ref.get("holding_days") is not None:
        holding_str = f"{ref.get('holding_days')} days"
    else:
        holding_str = "n/a"

    ref_text = (
        f"条件成立:\n{es.get('signal_date') or '—'}\n\n"
        f"Entry:\n{es.get('entry_date') or ref.get('entry_date') or '—'}\n\n"
        f"Entry Price:\n{_num(ref.get('entry_price'))}\n\n"
        f"Current:\n{_num(ref.get('current_price'))}\n\n"
        f"P/L:\n{_pct(ref.get('pnl_pct'))}\n\n"
        f"Holding:\n{holding_str}\n\n"
        f"High DD:\n{_pct(ref.get('drawdown_from_high_pct'))}"
    )

    if risk.get("applicable"):
        risk_text = (
            f"Risk Stop:\n{_num(risk.get('stop_price'))} (-15%)\n\n"
            f"Distance:\n{_pct(risk.get('distance_pct'))}\n\n"
            f"Status:\n{risk.get('status')}"
        )
    else:
        risk_text = "N/A"

    fields = [
        _field("Current State", state_text),
        _field(
            "Current Decision",
            f"判断:\n{decision_line}\n\n理由:\n{view_model.get('decision_reason', {}).get('primary', '')}",
        ),
        _field("Entry状態", entry_text),
        _field("Current Asset", asset_name),
        _field("保有期間 / Exit監視", hold_text),
        _field("Capital Flow", flow_text),
        _field("Next Action", view_model.get("next_action", "")),
        _field("Reference Numbers", ref_text),
        _field("Risk Control", risk_text),
    ]
    embed = {
        "title": "特定口座 Protocol",
        "description": "TaxableAccountViewModel projection (no judgment in Discord)",
        "fields": fields,
    }
    content = f"【特定口座】{decision_line} | {asset_name} | {state_line}"

    sent = False
    err = None
    if not dry_run:
        webhook = (webhook_url or resolve_webhook_url() or "").strip()
        if not webhook:
            err = (
                "Discord webhook not configured "
                "(set TAXABLE_DISCORD_WEBHOOK or DISCORD_WEBHOOK_URL)"
            )
        else:
            # Same HTTP client path as SOX ops webhook sends (requests), without
            # importing Legacy protocol modules.
            try:
                resp = requests.post(
                    webhook,
                    json={"content": content, "embeds": [embed]},
                    timeout=15,
                    headers={"User-Agent": "ASA-TaxableAccountProtocol/1.0"},
                )
                sent = 200 <= resp.status_code < 300
                if not sent:
                    err = f"HTTP {resp.status_code}: {(resp.text or '')[:200]}"
            except requests.RequestException as exc:
                err = str(exc)

    return DiscordProjection(dry_run=dry_run, content=content, embed=embed, sent=sent, error=err)
