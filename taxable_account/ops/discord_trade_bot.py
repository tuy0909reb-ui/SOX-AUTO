"""
Discord Trade Report Interaction bot (Fact transport only).

Projection webhook path remains taxable_account.view.discord_adapter.
This module only accepts slash + confirm and forwards to TradeReportPort.

Env:
  DISCORD_TOKEN                 — bot token
  TAXABLE_DISCORD_OPERATOR_IDS  — comma-separated Discord user ids
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
    try:
        import discord
        from discord import app_commands
    except ImportError:
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

    class ConfirmView(discord.ui.View):
        def __init__(self, report_id: str, operator_id: str) -> None:
            super().__init__(timeout=300)
            self.report_id = report_id
            self.operator_id = operator_id

        @discord.ui.button(label="Confirm Fact", style=discord.ButtonStyle.danger)
        async def confirm(self, interaction: discord.Interaction, button: discord.ui.Button):
            if str(interaction.user.id) != self.operator_id:
                await interaction.response.send_message("Not your draft.", ephemeral=True)
                return
            try:
                result = adapter.confirm_and_submit(self.report_id, self.operator_id)
                save = getattr(store, "save", None)
                if callable(save):
                    save()
                msg = (
                    f"accepted={result.accepted}\n"
                    f"events={list(result.events)}\n"
                    f"error={result.error}\n"
                    f"fact_journal={jpath}"
                )
                await interaction.response.edit_message(content=msg, view=None)
            except Exception as exc:
                await interaction.response.send_message(f"ERROR: {exc}", ephemeral=True)

        @discord.ui.button(label="Cancel", style=discord.ButtonStyle.secondary)
        async def cancel(self, interaction: discord.Interaction, button: discord.ui.Button):
            if str(interaction.user.id) != self.operator_id:
                await interaction.response.send_message("Not your draft.", ephemeral=True)
                return
            adapter.cancel_draft(self.report_id, self.operator_id)
            await interaction.response.edit_message(content="Cancelled.", view=None)

    async def _start_draft(
        interaction: discord.Interaction,
        *,
        side: str,
        asset: str,
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
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
            await interaction.response.send_message(f"ERROR: {exc}", ephemeral=True)
            return
        view = ConfirmView(draft.report_id, op)
        await interaction.response.send_message(draft.preview_text(), view=view, ephemeral=True)

    @tree.command(name="report_buy", description="Taxable Trade Fact BUY (confirm required)")
    @app_commands.describe(
        asset="1570 / 282A / …",
        price="trade_price",
        trade_date="YYYY-MM-DD actual trade date",
        quantity="traded quantity Fact",
    )
    async def report_buy(
        interaction: discord.Interaction,
        asset: str,
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await _start_draft(
            interaction,
            side="BUY",
            asset=asset,
            price=price,
            trade_date=trade_date,
            quantity=quantity,
        )

    @tree.command(name="report_sell", description="Taxable Trade Fact SELL (confirm required)")
    @app_commands.describe(
        asset="1570 / 282A / …",
        price="trade_price",
        trade_date="YYYY-MM-DD actual trade date",
        quantity="traded quantity Fact",
    )
    async def report_sell(
        interaction: discord.Interaction,
        asset: str,
        price: float,
        trade_date: str,
        quantity: float,
    ) -> None:
        await _start_draft(
            interaction,
            side="SELL",
            asset=asset,
            price=price,
            trade_date=trade_date,
            quantity=quantity,
        )

    @client.event
    async def on_ready() -> None:
        await tree.sync()
        print(f"Discord Trade Report bot ready as {client.user}; journal={jpath}")

    # silence unused eng warning in lint-free envs
    _ = eng
    client.run(token)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
