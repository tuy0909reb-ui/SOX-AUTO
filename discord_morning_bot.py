import asyncio
import os
import re

import discord
from discord import Intents

from sox_protocol import execute_sox_protocol

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
INPUT_CHANNEL_ID = int(os.getenv("INPUT_CHANNEL_ID", "1524422866609766591"))
OUTPUT_CHANNEL_ID = int(os.getenv("OUTPUT_CHANNEL_ID", "1524422866609766591"))

intents = Intents.default()
intents.messages = True
intents.message_content = True
client = discord.Client(intents=intents)


def parse_morning_input(content: str) -> tuple[float, float]:
    """朝入力メッセージから取得単価・評価額を抽出する。"""
    text = content.replace(",", "").replace("，", "")

    motomoto_match = re.search(
        r"(?:②|取得単価|取得|motomoto|MOTOMOTO)\s*[:：]?\s*([\d.]+)",
        text,
        re.IGNORECASE,
    )
    hyoka_match = re.search(
        r"(?:③|評価額|評価|hyoka|HYOKA|現在)\s*[:：]?\s*([\d.]+)",
        text,
        re.IGNORECASE,
    )
    if motomoto_match and hyoka_match:
        return float(motomoto_match.group(1)), float(hyoka_match.group(1))

    numbers = [float(n) for n in re.findall(r"[\d.]+", text)]
    if len(numbers) >= 2:
        return numbers[0], numbers[1]

    raise ValueError(
        "取得単価・評価額を読み取れませんでした。\n"
        "例:\n"
        "② 850000\n"
        "③ 920000"
    )


async def send_long_message(channel, text: str):
    """Discordの2000文字制限に合わせて分割送信する。"""
    chunk_size = 1900
    for i in range(0, len(text), chunk_size):
        await channel.send(text[i : i + chunk_size])


async def process_latest_message():
    """朝入力チャンネルの最新メッセージを読み、判定して結果を返す。"""
    input_channel = await client.fetch_channel(INPUT_CHANNEL_ID)
    output_channel = await client.fetch_channel(OUTPUT_CHANNEL_ID)

    messages = [m async for m in input_channel.history(limit=1)]
    if not messages:
        await output_channel.send("朝入力チャンネルにメッセージがありません。")
        return

    latest = messages[0]
    content = latest.content.strip()
    if not content:
        await output_channel.send("最新メッセージが空です。取得単価と評価額を入力してください。")
        return

    try:
        sox_motomoto, sox_hyoka = parse_morning_input(content)
        result = execute_sox_protocol(sox_motomoto=sox_motomoto, sox_hyoka=sox_hyoka)
        header = (
            f"【朝プロトコル判定】\n"
            f"入力: 取得単価 {sox_motomoto:,.0f} / 評価額 {sox_hyoka:,.0f}\n\n"
        )
        await send_long_message(output_channel, header + result)
    except ValueError as e:
        await output_channel.send(f"入力エラー:\n{e}\n\n受信メッセージ:\n{content}")
    except Exception as e:
        await output_channel.send(f"判定エラー: {e}")


@client.event
async def on_ready():
    await process_latest_message()
    await client.close()


def main():
    if not DISCORD_TOKEN:
        raise RuntimeError("DISCORD_TOKEN が設定されていません。")
    asyncio.run(client.start(DISCORD_TOKEN))


if __name__ == "__main__":
    main()
