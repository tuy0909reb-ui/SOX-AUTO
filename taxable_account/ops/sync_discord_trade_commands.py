"""One-shot slash sync with Japanese option labels (then exit).

Usage:
  python -m taxable_account.ops.sync_discord_trade_commands

Env: DISCORD_TOKEN
Optional: TAXABLE_DISCORD_GUILD_ID

Note: Restart the long-running trade bot after sync so handlers match.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    import discord
    from discord import app_commands
except ImportError:  # pragma: no cover
    discord = None  # type: ignore
    app_commands = None  # type: ignore

from taxable_account.ops.discord_slash_locale import (
    bulk_upsert_localized_commands,
    iter_guild_ids,
)


async def _fetch_raw(client: Any, guild_id: int | None) -> list[dict[str, Any]]:
    app_id = client.application_id or (
        client.application.id if client.application else None
    )
    if app_id is None:
        info = await client.http.application_info()
        app_id = int(info["id"])
    if guild_id is not None:
        route = discord.http.Route(
            "GET",
            "/applications/{application_id}/guilds/{guild_id}/commands",
            application_id=app_id,
            guild_id=int(guild_id),
        )
    else:
        route = discord.http.Route(
            "GET",
            "/applications/{application_id}/commands",
            application_id=app_id,
        )
    return list(
        await client.http.request(route, params={"with_localizations": "true"})
    )


async def _run_sync(token: str) -> dict[str, Any]:
    assert discord is not None and app_commands is not None

    intents = discord.Intents.default()
    client = discord.Client(intents=intents)
    tree = app_commands.CommandTree(client)

    asset_choices = [
        app_commands.Choice(name="1570", value="1570"),
        app_commands.Choice(name="282A", value="282A"),
        app_commands.Choice(name="野村世界半導体株投資", value="野村世界半導体株投資"),
    ]

    @tree.command(name="購入報告", description="購入報告（確認必須）")
    @app_commands.describe(
        asset="銘柄を選択",
        price="約定した価格",
        trade_date="YYYYMMDD または YYYY-MM-DD",
        quantity="約定した数量",
    )
    @app_commands.choices(asset=asset_choices)
    async def report_buy(
        interaction: discord.Interaction,
        asset: app_commands.Choice[str],
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await interaction.response.send_message("sync-only stub", ephemeral=True)

    @tree.command(name="売却報告", description="売却報告（確認必須）")
    @app_commands.describe(
        asset="銘柄を選択",
        price="約定した価格",
        trade_date="YYYYMMDD または YYYY-MM-DD",
        quantity="約定した数量",
    )
    @app_commands.choices(asset=asset_choices)
    async def report_sell(
        interaction: discord.Interaction,
        asset: app_commands.Choice[str],
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await interaction.response.send_message("sync-only stub", ephemeral=True)

    done = asyncio.Event()
    result: dict[str, Any] = {}

    @client.event
    async def on_ready() -> None:
        try:
            guild_env = (os.getenv("TAXABLE_DISCORD_GUILD_ID") or "").strip()
            guild_ids = list(iter_guild_ids(client, guild_env))
            cmds = (report_buy, report_sell)
            synced: list[Any] = []
            raw: list[dict[str, Any]] = []
            if guild_ids:
                for gid in guild_ids:
                    names = await bulk_upsert_localized_commands(
                        client, tree, cmds, guild_id=gid
                    )
                    synced.append(("guild", str(gid), names))
                    raw = await _fetch_raw(client, gid)
            else:
                names = await bulk_upsert_localized_commands(
                    client, tree, cmds, guild_id=None
                )
                synced.append(("global", "", names))
                raw = await _fetch_raw(client, None)

            names = sorted(c.get("name") for c in raw)
            buy = next((c for c in raw if c.get("name") == "購入報告"), {}) or {}
            result["ok"] = True
            result["bot_user"] = str(client.user)
            result["synced"] = synced
            result["api_command_names"] = names
            result["report_buy"] = {
                "name": buy.get("name"),
                "name_localizations": buy.get("name_localizations") or {},
                "description": buy.get("description"),
                "options": [
                    {
                        "name": o.get("name"),
                        "name_localizations": o.get("name_localizations") or {},
                        "description": o.get("description"),
                        "choices": [
                            {"name": c.get("name"), "value": c.get("value")}
                            for c in (o.get("choices") or [])
                        ],
                    }
                    for o in (buy.get("options") or [])
                ],
            }
            opts = {o["name"]: o for o in result["report_buy"]["options"]}
            result["human_labels_ok"] = (
                names == ["売却報告", "購入報告"]
                and "report_buy" not in names
                and "report_sell" not in names
                and (opts.get("asset") or {}).get("name_localizations", {}).get("ja") == "銘柄"
                and (opts.get("price") or {}).get("name_localizations", {}).get("ja")
                == "約定価格"
                and any(
                    c.get("name") == "野村世界半導体株投資"
                    for c in (opts.get("asset") or {}).get("choices") or []
                )
            )
        except Exception as exc:
            result["ok"] = False
            result["error"] = repr(exc)
        finally:
            done.set()
            await client.close()

    async with client:
        task = asyncio.create_task(client.start(token))
        await done.wait()
        if not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
    return result


def main() -> int:
    if discord is None or app_commands is None:
        print("ERROR: discord.py required", file=sys.stderr)
        return 2
    token = (os.getenv("DISCORD_TOKEN") or "").strip()
    if not token:
        print("ERROR: DISCORD_TOKEN required", file=sys.stderr)
        return 2
    result = asyncio.run(_run_sync(token))
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("ok") and result.get("human_labels_ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
