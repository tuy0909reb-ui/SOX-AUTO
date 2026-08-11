"""Discord slash Human labels.

tree.sync() omits name_localizations in discord.py 2.7 — use bulk_upsert with
explicit localization payload for *option* labels (asset→銘柄, …).

Command primary names are Japanese (購入報告 / 売却報告). Do NOT also set
command name_localizations to English/JP aliases — Discord shows both in the picker.
"""

from __future__ import annotations

from typing import Any, Iterable, Optional, Sequence

OPTION_NAME_JA = {
    "asset": "銘柄",
    "price": "約定価格",
    "trade_date": "約定日",
    "quantity": "数量",
}

# Formal Human slash entry names (primary `name`, not localization aliases)
COMMAND_NAMES_HUMAN = ("購入報告", "売却報告")


def apply_ja_localizations_to_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Attach ja option labels; clear command name_localizations (single Human name)."""
    # Avoid dual picker entries (report_buy + 購入報告)
    payload.pop("name_localizations", None)
    for opt in payload.get("options") or []:
        oname = opt.get("name")
        if oname in OPTION_NAME_JA:
            opt["name_localizations"] = {"ja": OPTION_NAME_JA[oname]}
    return payload


async def bulk_upsert_localized_commands(
    client: Any,
    tree: Any,
    commands: Sequence[Any],
    *,
    guild_id: Optional[int] = None,
) -> list[str]:
    """Upsert commands including ja option localizations. Returns synced command names."""
    payloads = [apply_ja_localizations_to_payload(cmd.to_dict(tree)) for cmd in commands]
    app_id = client.application_id
    if app_id is None and getattr(client, "application", None) is not None:
        app_id = client.application.id
    if app_id is None:
        info = await client.http.application_info()
        app_id = int(info["id"])
    if guild_id is not None:
        await client.http.bulk_upsert_guild_commands(app_id, int(guild_id), payloads)
    else:
        await client.http.bulk_upsert_global_commands(app_id, payloads)
    return [str(p.get("name")) for p in payloads]


def iter_guild_ids(client: Any, guild_env: str) -> Iterable[int]:
    text = (guild_env or "").strip()
    if text:
        yield int(text)
        return
    for g in client.guilds:
        yield int(g.id)
