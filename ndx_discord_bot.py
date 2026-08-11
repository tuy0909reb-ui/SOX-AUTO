"""NASDAQ100 Discord Bot（運用フロントエンド v1.1）。

Interaction・投稿・更新のみ。判定・計算は ndx_ops.run_for_ui → ndx_sell_protocol。
正本: docs/discord_frontend_v1.md

接続先は環境変数:
  DISCORD_TOKEN
  NDX_CHANNEL_MORNING_ID
  NDX_CHANNEL_EVENING_ID
  NDX_CHANNEL_ALERTS_ID
  NDX_CHANNEL_LOG_ID
  NDX_CHANNEL_WATCHLIST_ID

未設定時は logs/ndx/discord_ui_webhooks.json を参照（gitignored）。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import discord
import requests
from discord.ext import commands

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from ndx_discord_ui import (
    build_alert_embed,
    build_evening_embed,
    build_log_content,
    build_morning_embed,
    build_skip_log_content,
    build_watch_list_embed,
    should_send_alert,
)
from ndx_ops import load_watch_list, run_for_ui

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
WEBHOOK_CONFIG_PATH = ROOT / "logs" / "ndx" / "discord_ui_webhooks.json"

ENV_KEYS = {
    "morning": "NDX_CHANNEL_MORNING_ID",
    "evening": "NDX_CHANNEL_EVENING_ID",
    "alerts": "NDX_CHANNEL_ALERTS_ID",
    "log": "NDX_CHANNEL_LOG_ID",
    "watchlist": "NDX_CHANNEL_WATCHLIST_ID",
}

_PUBLISH_ON_READY = False


def _load_webhook_file() -> dict:
    if not WEBHOOK_CONFIG_PATH.is_file():
        return {}
    try:
        data = json.loads(WEBHOOK_CONFIG_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def _destination(key: str) -> str:
    """環境変数 → 設定ファイルの順で接続先を取得。"""
    env_name = ENV_KEYS[key]
    val = (os.getenv(env_name) or "").strip()
    if val:
        return val
    return str((_load_webhook_file().get(key) or "")).strip()


def _is_webhook(dest: str) -> bool:
    return dest.startswith("https://") and "discord.com/api/webhooks/" in dest


def _is_channel_id(dest: str) -> bool:
    return dest.isdigit()


def _destinations() -> dict[str, str]:
    return {k: _destination(k) for k in ENV_KEYS}


def _all_webhooks(dests: dict[str, str]) -> bool:
    return all(_is_webhook(v) for v in dests.values())


def _post_webhook(
    url: str, *, content: str | None = None, embed: discord.Embed | None = None
) -> None:
    payload: dict = {}
    if content:
        payload["content"] = content[:1900]
    if embed is not None:
        payload["embeds"] = [embed.to_dict()]
    if not payload:
        return
    response = requests.post(url, json=payload, timeout=15)
    response.raise_for_status()


def _placeholder_view(*, phase: str) -> dict:
    """初回パネル用。run_for_ui 前の空表示（判定しない）。"""
    return {
        "phase": phase,
        "nav": None,
        "nav_date": "-",
        "purchase_ratio_pct": None,
        "pnl_pct": None,
        "purchase_ok": False,
        "ndx_close": None,
        "rsi": None,
        "rsi_ok": False,
        "ndx_drop": None,
        "nq_pct": None,
        "nq_ok": False,
        "nq_safe": False,
        "decision": "HOLD",
        "morning_decision": "HOLD",
        "final_decision": "HOLD",
        "ui_label": "Normal",
        "ui_alert": False,
        "stop_reason": "未実行",
        "reason": "未実行",
    }


class MorningView(discord.ui.View):
    def __init__(self) -> None:
        super().__init__(timeout=None)

    @discord.ui.button(
        label="▶ Morning実行",
        style=discord.ButtonStyle.primary,
        custom_id="morning_run",
    )
    async def morning_run(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_run(interaction, phase="am")

    @discord.ui.button(
        label="🔄 再実行",
        style=discord.ButtonStyle.secondary,
        custom_id="morning_retry",
    )
    async def morning_retry(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_run(interaction, phase="am")

    @discord.ui.button(
        label="⏭ スキップ",
        style=discord.ButtonStyle.secondary,
        custom_id="morning_skip",
    )
    async def morning_skip(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_skip(interaction, phase="am")


class EveningView(discord.ui.View):
    def __init__(self) -> None:
        super().__init__(timeout=None)

    @discord.ui.button(
        label="▶ Evening実行",
        style=discord.ButtonStyle.primary,
        custom_id="evening_run",
    )
    async def evening_run(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_run(interaction, phase="pm")

    @discord.ui.button(
        label="🔄 再実行",
        style=discord.ButtonStyle.secondary,
        custom_id="evening_retry",
    )
    async def evening_retry(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_run(interaction, phase="pm")

    @discord.ui.button(
        label="⏭ スキップ",
        style=discord.ButtonStyle.secondary,
        custom_id="evening_skip",
    )
    async def evening_skip(
        self, interaction: discord.Interaction, button: discord.ui.Button
    ) -> None:
        await _handle_skip(interaction, phase="pm")


intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)


async def _channel(channel_id: int) -> discord.abc.Messageable | None:
    if not channel_id:
        return None
    ch = bot.get_channel(channel_id)
    if ch is None:
        try:
            ch = await bot.fetch_channel(channel_id)
        except (discord.HTTPException, discord.NotFound):
            return None
    return ch


async def _post_to_dest(
    key: str, *, content: str | None = None, embed: discord.Embed | None = None
) -> None:
    dest = _destination(key)
    if not dest:
        return
    if _is_webhook(dest):
        _post_webhook(dest, content=content, embed=embed)
        return
    if _is_channel_id(dest):
        ch = await _channel(int(dest))
        if ch is None:
            return
        kwargs: dict = {}
        if content:
            kwargs["content"] = content
        if embed is not None:
            kwargs["embed"] = embed
        await ch.send(**kwargs)


async def _post_log(text: str) -> None:
    await _post_to_dest("log", content=text)


async def _post_alert_if_needed(view: dict) -> None:
    """§12: SELL（脱出GO/GO）のときのみ #alerts へ送信。"""
    if not should_send_alert(view):
        return
    await _post_to_dest("alerts", embed=build_alert_embed(view))


def publish_panels_webhook() -> None:
    """Webhook 経由で Morning / Evening / Watch List を投稿（ボタンなし）。"""
    dests = _destinations()
    _post_webhook(
        dests["morning"],
        embed=build_morning_embed(_placeholder_view(phase="am")),
    )
    _post_webhook(
        dests["evening"],
        embed=build_evening_embed(_placeholder_view(phase="pm")),
    )
    _post_webhook(
        dests["watchlist"],
        embed=build_watch_list_embed(load_watch_list()),
    )
    print("Webhook publish: Morning / Evening / Watch List OK")


def run_phase_webhook(phase: str) -> None:
    """Webhook テスト用: 判定実行→チャンネル投稿（Alert は SELL のみ）。"""
    view = run_for_ui(phase)
    if phase == "am":
        _post_webhook(_destination("morning"), embed=build_morning_embed(view))
    else:
        _post_webhook(_destination("evening"), embed=build_evening_embed(view))
    _post_webhook(_destination("log"), content=build_log_content(view, phase=phase))
    if should_send_alert(view):
        _post_webhook(_destination("alerts"), embed=build_alert_embed(view))
    print(
        f"Webhook run phase={phase} decision={view.get('decision')} "
        f"alert={should_send_alert(view)}"
    )


def skip_phase_webhook(phase: str) -> None:
    _post_webhook(
        _destination("log"), content=build_skip_log_content(phase=phase)
    )
    print(f"Webhook skip phase={phase}")


async def _publish_panels() -> None:
    dests = _destinations()
    if _is_webhook(dests["morning"]):
        publish_panels_webhook()
        return
    morning = await _channel(int(dests["morning"]))
    if morning is not None:
        await morning.send(
            embed=build_morning_embed(_placeholder_view(phase="am")),
            view=MorningView(),
        )
    evening = await _channel(int(dests["evening"]))
    if evening is not None:
        await evening.send(
            embed=build_evening_embed(_placeholder_view(phase="pm")),
            view=EveningView(),
        )
    watch = await _channel(int(dests["watchlist"]))
    if watch is not None:
        await watch.send(embed=build_watch_list_embed(load_watch_list()))


async def _handle_run(interaction: discord.Interaction, *, phase: str) -> None:
    """run / retry 同一処理: run_for_ui → Embed更新 → Log → Alert(SELLのみ)。"""
    await interaction.response.defer(ephemeral=True)
    try:
        view = run_for_ui(phase)
    except Exception as exc:
        await interaction.followup.send(f"実行エラー: {exc}", ephemeral=True)
        return

    if phase == "am":
        embed = build_morning_embed(view)
        panel: discord.ui.View = MorningView()
    else:
        embed = build_evening_embed(view)
        panel = EveningView()

    if interaction.message is None:
        await interaction.followup.send(
            "更新対象メッセージがありません", ephemeral=True
        )
        return
    await interaction.message.edit(embed=embed, view=panel)

    await _post_log(build_log_content(view, phase=phase))
    await _post_alert_if_needed(view)
    await interaction.followup.send("完了", ephemeral=True)


async def _handle_skip(interaction: discord.Interaction, *, phase: str) -> None:
    """Skip: プロトコル非実行。Log のみ（Morning Skip / Evening Skip）。"""
    await interaction.response.defer(ephemeral=True)
    await _post_log(build_skip_log_content(phase=phase))
    await interaction.followup.send("Skip を記録しました", ephemeral=True)


@bot.event
async def on_ready() -> None:
    bot.add_view(MorningView())
    bot.add_view(EveningView())
    if _PUBLISH_ON_READY:
        await _publish_panels()
    print(f"NDX Discord Bot ready: {bot.user}", flush=True)


def main() -> None:
    global _PUBLISH_ON_READY
    parser = argparse.ArgumentParser(description="NDX Discord frontend bot v1.1")
    parser.add_argument(
        "--publish",
        action="store_true",
        help="Morning/Evening/Watch List パネルを1回投稿する",
    )
    parser.add_argument(
        "--run",
        choices=["am", "pm"],
        help="Webhookテスト: 判定実行して投稿（Bot Token不要）",
    )
    parser.add_argument(
        "--skip",
        choices=["am", "pm"],
        help="Webhookテスト: Skip を Log に記録",
    )
    args = parser.parse_args()

    dests = _destinations()
    missing = [ENV_KEYS[k] for k, v in dests.items() if not v]
    if missing:
        raise SystemExit("未設定: " + ", ".join(missing))

    if _all_webhooks(dests) and (args.publish or args.run or args.skip):
        if args.publish:
            publish_panels_webhook()
        if args.run:
            run_phase_webhook(args.run)
        if args.skip:
            skip_phase_webhook(args.skip)
        return

    _PUBLISH_ON_READY = bool(args.publish)
    if not DISCORD_TOKEN:
        raise SystemExit(
            "DISCORD_TOKEN が未設定です。"
            "Webhookのみの場合は --publish / --run / --skip を使ってください。"
        )
    bot.run(DISCORD_TOKEN)


if __name__ == "__main__":
    main()
