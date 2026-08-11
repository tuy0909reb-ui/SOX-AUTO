"""NASDAQ100 Discord UI: 表示用 dict → Discord Embed / Log / Alert 整形のみ。

判定・計算・ファイルI/Oは行わない。
正本: docs/discord_frontend_v1.md（v1.1）
"""

from __future__ import annotations

from datetime import datetime, timezone, timedelta

import discord

PROTOCOL_NAME = "NASDAQ100 Sell Protocol"
TARGET_NAME = "SBI・NASDAQ100"

JST = timezone(timedelta(hours=9))


def _decision_raw(view: dict) -> str:
    return str(view.get("final_decision") or view.get("decision") or "HOLD")


def _ui_label(view: dict) -> str:
    """§8: HOLD→Normal、脱出GO/GO→SELL。GO候補等はそのまま。"""
    if view.get("ui_label"):
        return str(view["ui_label"])
    decision = _decision_raw(view)
    if decision in ("GO", "脱出GO", "EXIT_GO"):
        return "SELL"
    if decision == "HOLD":
        return "Normal"
    return decision


def should_send_alert(view: dict) -> bool:
    """§12: SELL のみ Alert。Normal / 候補GO / Skip は送らない。"""
    if view.get("ui_alert") is not None:
        return bool(view["ui_alert"])
    return _ui_label(view) == "SELL"


def _embed_color(view: dict) -> discord.Color:
    label = _ui_label(view)
    if label == "SELL":
        return discord.Color.red()
    if label == "Normal":
        return discord.Color.green()
    # GO候補等（§8 表外）— Warning 相当は作らない
    return discord.Color.light_grey()


def _fmt_rsi(view: dict) -> str:
    rsi = view.get("rsi")
    if rsi is None:
        return "-"
    return f"{float(rsi):.1f}"


def _fmt_ndx_drop(view: dict) -> str:
    """52週高値乖離。プロトコル値があれば投影、無ければ '-'（再計算しない）。"""
    drop = view.get("ndx_drop")
    if drop is None:
        return "-"
    return f"{float(drop):+.1f}%"


def _fmt_pnl(view: dict) -> str:
    """含み益。pnl_pct または購入比 purchase_ratio_pct を投影。"""
    pnl = view.get("pnl_pct")
    if pnl is None:
        pnl = view.get("purchase_ratio_pct")
    if pnl is None:
        return "-"
    return f"{float(pnl):+.1f}%"


def _sell_condition_lines(view: dict, *, phase: str) -> str:
    """売却条件チェック表示（プロトコルフラグ投影。再計算しない）。

    RSI: rsi_ok / cond_rsi_overheat / cond2
    Futures: AM は unchecked 固定 / PM は nq_safe|futures.calm
    BreakEven: purchase_ok または zone != UNDERWATER
    """
    conds = view.get("conds") if isinstance(view.get("conds"), dict) else {}
    rsi_ok = bool(
        view.get("rsi_ok")
        or conds.get("cond_rsi_overheat")
        or conds.get("cond2")
    )

    if phase == "am":
        futures_ok = False
    else:
        futures = view.get("futures") if isinstance(view.get("futures"), dict) else {}
        futures_ok = bool(view.get("nq_safe") or view.get("nq_ok") or futures.get("calm"))

    principal = view.get("principal") if isinstance(view.get("principal"), dict) else {}
    zone = principal.get("zone")
    if zone is not None:
        breakeven_ok = zone != "UNDERWATER"
    else:
        breakeven_ok = bool(view.get("purchase_ok"))

    def mark(ok: bool) -> str:
        return "☑" if ok else "☒"

    return "\n".join(
        [
            f"{mark(rsi_ok)} RSI",
            f"{mark(futures_ok)} Futures",
            f"{mark(breakeven_ok)} BreakEven",
        ]
    )


def _judgment_display(view: dict) -> str:
    """判定欄: プロトコル文字列を表示。SELL/Normal は §8 表示名も併記。"""
    raw = _decision_raw(view)
    label = _ui_label(view)
    if label == "SELL":
        return f"🔴 SELL（{raw}）"
    if label == "Normal":
        return f"🟢 Normal（{raw}）"
    return raw


def _add_header_fields(embed: discord.Embed) -> None:
    embed.add_field(name="Protocol", value=PROTOCOL_NAME, inline=False)
    embed.add_field(name="Target", value=TARGET_NAME, inline=False)


def _add_result_fields(embed: discord.Embed, view: dict, *, phase: str) -> None:
    next_label = "Evening" if phase == "am" else "Morning"
    embed.add_field(name="判定", value=_judgment_display(view), inline=False)
    embed.add_field(name="RSI", value=_fmt_rsi(view), inline=True)
    embed.add_field(name="52週高値乖離", value=_fmt_ndx_drop(view), inline=True)
    embed.add_field(name="含み益", value=_fmt_pnl(view), inline=True)
    embed.add_field(
        name="売却条件",
        value=_sell_condition_lines(view, phase=phase),
        inline=False,
    )
    embed.add_field(name="次回", value=next_label, inline=False)


def build_morning_embed(view: dict) -> discord.Embed:
    embed = discord.Embed(
        title="📊 Morning Check",
        color=_embed_color(view),
    )
    _add_header_fields(embed)
    _add_result_fields(embed, view, phase="am")
    return embed


def build_evening_embed(view: dict) -> discord.Embed:
    embed = discord.Embed(
        title="📊 Evening Check",
        color=_embed_color(view),
    )
    _add_header_fields(embed)
    _add_result_fields(embed, view, phase="pm")
    return embed


def build_dashboard_embed(view: dict) -> discord.Embed:
    if str(view.get("phase") or "") == "pm":
        return build_evening_embed(view)
    return build_morning_embed(view)


def build_alert_embed(view: dict) -> discord.Embed:
    """§8 Alert: 判定・RSI・乖離・含み益・売却条件（SELL時のみ投稿側で呼ぶ）。"""
    phase = "pm" if str(view.get("phase") or "") == "pm" else "am"
    embed = discord.Embed(
        title="🚨 SELL Alert",
        color=discord.Color.red(),
    )
    _add_header_fields(embed)
    embed.add_field(name="判定", value=_judgment_display(view), inline=False)
    embed.add_field(name="RSI", value=_fmt_rsi(view), inline=True)
    embed.add_field(name="52週高値乖離", value=_fmt_ndx_drop(view), inline=True)
    embed.add_field(name="含み益", value=_fmt_pnl(view), inline=True)
    embed.add_field(
        name="売却条件",
        value=_sell_condition_lines(view, phase=phase),
        inline=False,
    )
    return embed


def build_log_content(view: dict, *, phase: str) -> str:
    """§9 Log: 日時 / Morning|Evening / 判定 / RSI / 乖離 / 含み益 / 次回。"""
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M")
    slot = "Morning" if phase == "am" else "Evening"
    next_label = "Evening" if phase == "am" else "Morning"
    decision = _decision_raw(view)
    return " | ".join(
        [
            now,
            slot,
            decision,
            f"RSI {_fmt_rsi(view)}",
            f"乖離 {_fmt_ndx_drop(view)}",
            f"含み益 {_fmt_pnl(view)}",
            f"次回 {next_label}",
        ]
    )


def build_skip_log_content(*, phase: str) -> str:
    """§9 Skip 固定文言。"""
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M")
    if phase == "am":
        return f"{now} | Morning Skip"
    return f"{now} | Evening Skip"


def build_watch_list_embed(rows: list[dict]) -> discord.Embed:
    """§10 簡易 Embed: id / name / role / status のみ。"""
    embed = discord.Embed(
        title="Watch List",
        color=discord.Color.blurple(),
    )
    _add_header_fields(embed)
    if not rows:
        embed.description = "(empty)"
        return embed
    lines: list[str] = []
    for row in rows:
        lines.append(
            " | ".join(
                [
                    str(row.get("id") or "-"),
                    str(row.get("name") or "-"),
                    str(row.get("role") or "-"),
                    str(row.get("status") or "-"),
                ]
            )
        )
    embed.description = "```\nid | name | role | status\n" + "\n".join(lines) + "\n```"
    return embed
