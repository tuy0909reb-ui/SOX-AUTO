"""P0 Discord copy for NISA annual plan kick / deadline reminders.

Rules SoT: ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0
Response: NISA-ANNUAL-PLAN-AI-TEAM-RESPONSE-2026-10-17
"""

from __future__ import annotations

from datetime import date

KINDS = ("kick", "remind_dec1", "remind_dec8")

FOOTER = (
    "判断はHuman。自動入替・自動発注はしません。\n"
    "正本: ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0"
)


def plan_year_for_kick(as_of: date | None = None) -> int:
    """Kick in November YYYY prepares plan for YYYY+1."""
    d = as_of or date.today()
    if d.month == 11:
        return d.year + 1
    if d.month == 12:
        return d.year + 1
    # Dry-run / off-season: still speak to next calendar year's plan
    return d.year + 1 if d.month >= 11 else d.year + 1


def hard_deadline_for_january_lump(plan_year: int) -> date:
    """Credit installment: previous-month day 10 before January deploy → Dec 10 of prior year."""
    return date(plan_year - 1, 12, 10)


def format_kick(*, plan_year: int, as_of: date | None = None) -> str:
    deadline = hard_deadline_for_january_lump(plan_year)
    return (
        f"【NISA翌年計画キック】\n"
        f"\n"
        f"{plan_year}年投入の確認を開始してください。\n"
        f"\n"
        f"① 市場動向（ハイテク／半導体の継続可否）\n"
        f"② 投入アイテム（メガ10／FANG+／ニッセイSOX／2243／野村）\n"
        f"③ シリコンサイクル（年初一括でよいか／買い方再設計か）\n"
        f"\n"
        f"つみたて・成長とも、サイクルに問題なければ基本は年初一括です。\n"
        f"クレジット分割の場合、投入アイテムのハード締切は "
        f"{deadline.isoformat()}（前月10日）です。\n"
        f"\n"
        f"{FOOTER}"
    )


def format_remind_dec1(*, plan_year: int) -> str:
    deadline = hard_deadline_for_january_lump(plan_year)
    return (
        f"【NISA投入アイテム・締切リマインド】\n"
        f"\n"
        f"{plan_year}年計画の②投入アイテムは確定しましたか。\n"
        f"クレジット分割で載せる場合、ハード締切は {deadline.isoformat()} です。\n"
        f"（現金・通常一括のみなら、その後の確定でも間に合いうる）\n"
        f"\n"
        f"{FOOTER}"
    )


def format_remind_dec8(*, plan_year: int) -> str:
    deadline = hard_deadline_for_january_lump(plan_year)
    return (
        f"【NISA投入アイテム・締切直前】\n"
        f"\n"
        f"ハード締切 {deadline.isoformat()} まで残りわずかです。\n"
        f"クレジット分割の場合、②投入アイテムが未確定なら今日中に確定してください。\n"
        f"\n"
        f"{FOOTER}"
    )


def format_message(kind: str, *, plan_year: int | None = None, as_of: date | None = None) -> str:
    d = as_of or date.today()
    year = plan_year if plan_year is not None else plan_year_for_kick(d)
    if kind == "kick":
        return format_kick(plan_year=year, as_of=d)
    if kind == "remind_dec1":
        return format_remind_dec1(plan_year=year)
    if kind == "remind_dec8":
        return format_remind_dec8(plan_year=year)
    raise ValueError(f"unknown kind={kind!r}; expected one of {KINDS}")


def infer_kind_from_calendar(as_of: date | None = None) -> str | None:
    """Map calendar day → notify kind. None if not a scheduled notify day."""
    d = as_of or date.today()
    if d.month == 11 and d.day == 1:
        return "kick"
    if d.month == 12 and d.day == 1:
        return "remind_dec1"
    if d.month == 12 and d.day == 8:
        return "remind_dec8"
    return None
