"""
Discord Trade Report Interaction bot (Fact transport only).

Projection webhook path remains taxable_account.view.discord_adapter.
This module only accepts slash + confirm and forwards to TradeReportPort.

Human Interface: Choices / JP descriptions / Fortress error·cancel surfaces.
Does NOT decide Entry/Exit. Does NOT change Trade Fact schema.

Env:
  DISCORD_TOKEN                 — bot token
  TAXABLE_DISCORD_OPERATOR_IDS  — comma-separated Discord user ids
  TAXABLE_DISCORD_GUILD_ID      — optional; guild sync (immediate slash visibility)
  TAXABLE_STATE_FILE            — optional state JSON path
  TAXABLE_FACT_JOURNAL          — optional Fact Journal JSONL path

Run:
  python -m taxable_account.ops.discord_trade_bot
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Module-level import required: discord.py evaluates annotations via callback.__globals__
try:
    import discord
    from discord import app_commands
except ImportError:  # pragma: no cover
    discord = None  # type: ignore[assignment]
    app_commands = None  # type: ignore[assignment]


def _allowed_ids() -> list[str]:
    raw = os.getenv("TAXABLE_DISCORD_OPERATOR_IDS") or ""
    return [x.strip() for x in raw.split(",") if x.strip()]


def build_adapter_and_engine():
    from taxable_account.engine import TaxableAccountEngine
    from taxable_account.state.file_store import FileStateStore
    from taxable_account.state.state_store import InMemoryStateStore
    from taxable_account.trade.discord_input import DiscordTradeInputAdapter
    from taxable_account.trade.journal import TradeFactJournal
    from taxable_account.trade.port import TradeReportPort, default_journal_path

    state_file = os.getenv("TAXABLE_STATE_FILE")
    if state_file:
        store = FileStateStore(state_file, create_if_missing=True)
    else:
        store = InMemoryStateStore()
    eng = TaxableAccountEngine(store)
    jpath = os.getenv("TAXABLE_FACT_JOURNAL") or str(default_journal_path(state_file))
    port = TradeReportPort(eng, TradeFactJournal(jpath))
    adapter = DiscordTradeInputAdapter(port, allowed_operator_ids=_allowed_ids())
    return adapter, eng, store, jpath


def main() -> int:
    if discord is None or app_commands is None:
        print("ERROR: discord.py is required for the Trade Report bot", file=sys.stderr)
        return 2

    token = (os.getenv("DISCORD_TOKEN") or "").strip()
    if not token:
        print("ERROR: DISCORD_TOKEN is required", file=sys.stderr)
        return 2
    if not _allowed_ids():
        print("ERROR: TAXABLE_DISCORD_OPERATOR_IDS is required", file=sys.stderr)
        return 2

    adapter, eng, store, jpath = build_adapter_and_engine()

    intents = discord.Intents.default()
    client = discord.Client(intents=intents)
    tree = app_commands.CommandTree(client)

    # Human Choice labels; values resolve via Asset Registry
    ASSET_CHOICES = [
        app_commands.Choice(name="1570", value="1570"),
        app_commands.Choice(name="282A", value="282A"),
        app_commands.Choice(
            name="野村世界半導体株投資",
            value="野村世界半導体株投資",
        ),
    ]

    class ConfirmView(discord.ui.View):
        def __init__(self, report_id: str, operator_id: str) -> None:
            super().__init__(timeout=300)
            self.report_id = report_id
            self.operator_id = operator_id

        @discord.ui.button(label="確認する", style=discord.ButtonStyle.danger)
        async def confirm(self, interaction: discord.Interaction, button: discord.ui.Button):
            from taxable_account.view.human_display import (
                format_input_failure_message,
                format_trade_result_message,
            )

            if str(interaction.user.id) != self.operator_id:
                msg = format_input_failure_message(
                    eng.state,
                    reason="この下書きの操作者ではありません",
                )
                await interaction.response.send_message(msg, ephemeral=True)
                return
            try:
                result = adapter.confirm_and_submit(self.report_id, self.operator_id)
                save = getattr(store, "save", None)
                if callable(save):
                    save()
                msg = format_trade_result_message(
                    accepted=result.accepted,
                    fact=result.fact,
                    events=result.events,
                    error=result.error,
                    state=eng.state,
                )
                await interaction.response.edit_message(content=msg, view=None)
            except Exception as exc:
                msg = format_input_failure_message(eng.state, exc=exc)
                await interaction.response.send_message(msg, ephemeral=True)

        @discord.ui.button(label="キャンセル", style=discord.ButtonStyle.secondary)
        async def cancel(self, interaction: discord.Interaction, button: discord.ui.Button):
            from taxable_account.view.human_display import (
                format_cancel_message,
                format_input_failure_message,
            )

            if str(interaction.user.id) != self.operator_id:
                msg = format_input_failure_message(
                    eng.state,
                    reason="この下書きの操作者ではありません",
                )
                await interaction.response.send_message(msg, ephemeral=True)
                return
            adapter.cancel_draft(self.report_id, self.operator_id)
            await interaction.response.edit_message(
                content=format_cancel_message(eng.state),
                view=None,
            )

    async def _start_draft(
        interaction: discord.Interaction,
        *,
        side: str,
        asset: str,
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        from taxable_account.view.human_display import format_input_failure_message

        op = str(interaction.user.id)
        try:
            draft = adapter.create_draft(
                operator_id=op,
                asset=asset,
                side=side,
                trade_date=trade_date,
                trade_price=price,
                quantity=quantity,
            )
        except Exception as exc:
            await interaction.response.send_message(
                format_input_failure_message(eng.state, exc=exc),
                ephemeral=True,
            )
            return
        view = ConfirmView(draft.report_id, op)
        await interaction.response.send_message(
            draft.preview_text(eng.state),
            view=view,
            ephemeral=True,
        )

    # Formal Human entry = Japanese primary names (not report_* + name_localizations).
    # Option API names stay ASCII; ja labels via bulk upsert localizations.
    @tree.command(name="購入報告", description="購入報告（確認必須）")
    @app_commands.describe(
        asset="銘柄を選択",
        price="約定した価格",
        trade_date="YYYYMMDD または YYYY-MM-DD",
        quantity="約定した数量",
    )
    @app_commands.choices(asset=ASSET_CHOICES)
    async def report_buy(
        interaction: discord.Interaction,
        asset: app_commands.Choice[str],
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await _start_draft(
            interaction,
            side="BUY",
            asset=asset.value,
            price=price,
            trade_date=trade_date,
            quantity=quantity,
        )

    @tree.command(name="売却報告", description="売却報告（確認必須）")
    @app_commands.describe(
        asset="銘柄を選択",
        price="約定した価格",
        trade_date="YYYYMMDD または YYYY-MM-DD",
        quantity="約定した数量",
    )
    @app_commands.choices(asset=ASSET_CHOICES)
    async def report_sell(
        interaction: discord.Interaction,
        asset: app_commands.Choice[str],
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await _start_draft(
            interaction,
            side="SELL",
            asset=asset.value,
            price=price,
            trade_date=trade_date,
            quantity=quantity,
        )

    def _log(msg: str) -> None:
        print(msg, flush=True)

    @client.event
    async def on_ready() -> None:
        from taxable_account.ops.discord_slash_locale import (
            bulk_upsert_localized_commands,
            iter_guild_ids,
        )

        guild_env = (os.getenv("TAXABLE_DISCORD_GUILD_ID") or "").strip()
        synced_names: list[str] = []
        guild_names = [f"{g.id}:{g.name}" for g in client.guilds]
        _log(f"on_ready as {client.user}; guilds={guild_names}")
        _log("syncing slash commands (Japanese primary names + ja option labels)...")
        try:
            guild_ids = list(iter_guild_ids(client, guild_env))
            cmds = (report_buy, report_sell)
            if guild_ids:
                for gid in guild_ids:
                    names = await bulk_upsert_localized_commands(
                        client, tree, cmds, guild_id=gid
                    )
                    synced_names.extend(names)
                    _log(f"guild_upsert guild_id={gid} commands={names}")
            else:
                _log(
                    "WARNING: bot is in 0 guilds. Invite the bot with scopes "
                    "bot + applications.commands, then restart."
                )
                names = await bulk_upsert_localized_commands(
                    client, tree, cmds, guild_id=None
                )
                synced_names.extend(names)
                _log(f"global_upsert commands={names} (may take up to ~1h to appear)")
        except Exception as exc:
            print(f"ERROR: slash command sync failed: {exc}", file=sys.stderr, flush=True)
            raise
        _log(
            f"Discord Trade Report bot ready as {client.user}; "
            f"slash={sorted(set(synced_names))}; journal={jpath}"
        )

    client.run(token)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
