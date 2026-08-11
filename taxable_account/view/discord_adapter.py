"""Discord projection adapter — FORTRESS Human Display only.

Authority:
- docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md
- docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0.md

Does NOT decide MAINTAIN/HOLD/EXIT. Optional webhook send is dry-run by default.
Does NOT import Legacy notification helpers or bots.
Internal State is never shown raw — always via human_display mapping.
Swing HOLD Evidence は平時オフ（include_hold_evidence=False）。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any, Optional

import requests

from taxable_account.domain.models import TaxableAccountState
from taxable_account.view import human_display as hd
from taxable_account.view.webhook_config import resolve_webhook_url


def _as_of_from_view_model(view_model: dict[str, Any]) -> Optional[date]:
    raw = view_model.get("as_of")
    if not raw:
        return None
    try:
        return date.fromisoformat(str(raw)[:10])
    except ValueError:
        return None


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


def _embed_from_display(display: hd.FortressDisplay) -> dict[str, Any]:
    fields = [_field(name, value) for name, value in display.as_fields()]
    return {
        "title": hd.HEADER,
        "description": "",
        "fields": fields,
    }


def project_discord_payload(
    view_model: dict[str, Any],
    *,
    dry_run: bool = True,
    webhook_url: Optional[str] = None,
    state: Optional[TaxableAccountState] = None,
    error_message: Optional[str] = None,
) -> DiscordProjection:
    if error_message:
        display = hd.map_error_to_fortress(state, message=error_message)
    elif state is not None:
        display = hd.map_state_to_fortress(
            state,
            as_of=_as_of_from_view_model(view_model),
            include_hold_evidence=False,
        )
    else:
        display = hd.map_view_model_to_fortress(view_model)

    content = hd.format_fortress_text(display)
    embed = _embed_from_display(display)

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
