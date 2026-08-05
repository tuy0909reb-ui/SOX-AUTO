"""
Webhook URL resolution for Taxable Account Discord projection.

Reuses the same webhook *infrastructure* as SOX ops (env / optional JSON),
without importing Legacy protocol modules.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[2]

# Infra-only config locations (gitignored logs). Read JSON key only — no Legacy imports.
_INFRA_WEBHOOK_FILES = (
    ROOT / "logs" / "portfolio" / "discord_webhook.json",
    ROOT / "logs" / "ndx" / "discord_webhook.json",
)


def is_valid_webhook_url(url: str) -> bool:
    u = (url or "").strip()
    if not u.startswith("https://"):
        return False
    return "discord.com/api/webhooks/" in u or "discordapp.com/api/webhooks/" in u


def _from_file(path: Path) -> Optional[str]:
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, TypeError):
        return None
    url = str(data.get("webhook_url") or data.get("url") or "").strip()
    return url if is_valid_webhook_url(url) else None


def resolve_webhook_url() -> Optional[str]:
    """
    Resolution order (first valid wins):

    1. TAXABLE_DISCORD_WEBHOOK — dedicated override
    2. DISCORD_WEBHOOK_URL — shared SOX / CI webhook secret (infra reuse)
    3. Optional gitignored JSON files under logs/ (webhook_url key only)
    """
    for key in ("TAXABLE_DISCORD_WEBHOOK", "DISCORD_WEBHOOK_URL"):
        env = (os.environ.get(key) or "").strip()
        if is_valid_webhook_url(env):
            return env
    for path in _INFRA_WEBHOOK_FILES:
        url = _from_file(path)
        if url:
            return url
    return None


def webhook_source_label() -> str:
    """Which source would be used (for ops evidence; does not leak URL)."""
    for key in ("TAXABLE_DISCORD_WEBHOOK", "DISCORD_WEBHOOK_URL"):
        env = (os.environ.get(key) or "").strip()
        if is_valid_webhook_url(env):
            return key
    for path in _INFRA_WEBHOOK_FILES:
        if _from_file(path):
            return str(path.relative_to(ROOT)).replace("\\", "/")
    return "UNCONFIGURED"
