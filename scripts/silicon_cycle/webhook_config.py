"""Silicon-cycle Discord destination — dedicated only.

Never fall back to NISA annual, monthly #一般, portfolio, or sealed
DISCORD_WEBHOOK_URL (legacy SOX).
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[2]
WEBHOOK_FILE = ROOT / "logs" / "silicon_cycle" / "discord_webhook.json"


def is_valid_webhook_url(url: str) -> bool:
    u = (url or "").strip()
    if not u.startswith("https://"):
        return False
    return "discord.com/api/webhooks/" in u or "discordapp.com/api/webhooks/" in u


def _from_file() -> Optional[str]:
    if not WEBHOOK_FILE.is_file():
        return None
    try:
        # utf-8-sig tolerates PowerShell / editor BOM that breaks plain utf-8 JSON.
        data = json.loads(WEBHOOK_FILE.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict):
        return None
    url = str(data.get("webhook_url") or data.get("url") or "").strip()
    return url if is_valid_webhook_url(url) else None


def resolve_silicon_cycle_webhook_url() -> Optional[str]:
    env = (os.environ.get("SILICON_CYCLE_DISCORD_WEBHOOK") or "").strip()
    if is_valid_webhook_url(env):
        return env
    return _from_file()


def destination_help() -> str:
    return (
        "Silicon-cycle Discord requires a dedicated webhook "
        "(not NISA annual / monthly / legacy DISCORD_WEBHOOK_URL).\n"
        "1) Create a Discord webhook on the silicon-cycle / planning channel\n"
        f"2) Save {WEBHOOK_FILE.as_posix()}:\n"
        '{"webhook_url":"https://discord.com/api/webhooks/...","channel_name":"…"}\n'
        "3) Or set env SILICON_CYCLE_DISCORD_WEBHOOK\n"
        "Refusing shared / sealed legacy webhooks."
    )
