"""NISA annual-plan Discord destination — NOT monthly / 投資レビュー webhooks.

Dedicated webhook file or env NISA_ANNUAL_DISCORD_WEBHOOK.
Never fall back to MONTHLY_DATA_DISCORD_WEBHOOK or portfolio webhooks.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[2]
WEBHOOK_FILE = ROOT / "logs" / "nisa_annual" / "discord_webhook.json"

_FORBIDDEN_HINTS = (
    "投資レビュー",
    "investment-review",
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
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError, TypeError):
        return None
    url = str(data.get("webhook_url") or data.get("url") or "").strip()
    channel = str(data.get("channel_name") or data.get("expected_channel") or "").strip()
    if channel and any(h in channel for h in _FORBIDDEN_HINTS):
        return None
    return url if is_valid_webhook_url(url) else None


def resolve_nisa_annual_webhook_url() -> Optional[str]:
    env = (os.environ.get("NISA_ANNUAL_DISCORD_WEBHOOK") or "").strip()
    if is_valid_webhook_url(env):
        return env
    return _from_file(WEBHOOK_FILE)


def destination_help() -> str:
    return (
        "NISA annual Discord requires a dedicated webhook (separate from monthly #一般).\n"
        f"1) Create a Discord webhook on the NISA / planning channel\n"
        f"2) Save URL to {WEBHOOK_FILE.as_posix()} as "
        '{"webhook_url":"https://discord.com/api/webhooks/...","channel_name":"…"}\n'
        "3) Or set env NISA_ANNUAL_DISCORD_WEBHOOK\n"
        "Refusing monthly / portfolio / 投資レビュー shared webhooks."
    )
