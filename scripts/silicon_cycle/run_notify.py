"""Periodic silicon-cycle watch Discord notify.

Usage:
  python scripts/silicon_cycle/run_notify.py --auto
  python scripts/silicon_cycle/run_notify.py --force-today
  python scripts/silicon_cycle/run_notify.py --as-of 2026-10-20 --force-today --discord-live

Default dry-run. Dedicated webhook only. Does not unseal legacy silicon_protocol.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PKG = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(PKG) not in sys.path:
    sys.path.insert(0, str(PKG))

from materials import build_materials  # noqa: E402
from messages import format_watch_message  # noqa: E402
from watch_state import (  # noqa: E402
    already_sent,
    apply_materials_observation,
    load_state,
    mark_sent,
    save_state,
    should_notify_today,
)
from webhook_config import destination_help, resolve_silicon_cycle_webhook_url  # noqa: E402


def _send(text: str, *, webhook_url: str) -> bool:
    import requests

    try:
        response = requests.post(
            webhook_url,
            json={"content": text},
            timeout=10,
        )
        response.raise_for_status()
        return True
    except Exception as exc:  # noqa: BLE001
        print("Discord送信エラー:", exc)
        return False


def _why(mode: str, state: dict) -> str:
    if mode == "elevated":
        reason = state.get("elevated_reason") or "watch_hint"
        return f"月次確認（警戒フラグON: {reason}）"
    return "月次確認（毎月1日）"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Silicon-cycle watch Discord notify")
    ap.add_argument("--as-of", default="", help="YYYY-MM-DD (default: today)")
    ap.add_argument("--plan-year", type=int, default=0)
    ap.add_argument(
        "--auto",
        action="store_true",
        help="Notify only if calendar matches mode cadence",
    )
    ap.add_argument(
        "--force-today",
        action="store_true",
        help="Notify regardless of cadence (still respects idempotency unless --force)",
    )
    ap.add_argument("--discord-live", action="store_true")
    ap.add_argument("--force", action="store_true", help="Allow re-send same key")
    ap.add_argument("--no-legacy", action="store_true")
    ap.add_argument(
        "--human-force-elevated",
        action="store_true",
        help="Persist human_force_elevated=true in watch state",
    )
    ap.add_argument(
        "--clear-human-force-elevated",
        action="store_true",
        help="Clear human_force_elevated flag",
    )
    args = ap.parse_args(argv)

    if not args.auto and not args.force_today and not args.human_force_elevated and not args.clear_human_force_elevated:
        ap.error("specify --auto or --force-today (or human force flags)")

    as_of = date.fromisoformat(args.as_of) if str(args.as_of).strip() else date.today()
    # Link digest to next NISA plan year (③ gate target).
    plan_year = int(args.plan_year) if args.plan_year else as_of.year + 1

    state = load_state()
    if args.human_force_elevated:
        state["human_force_elevated"] = True
        state["elevated_reason"] = "human_force_elevated"
    if args.clear_human_force_elevated:
        state["human_force_elevated"] = False

    materials = build_materials(as_of=as_of, fetch_legacy=not args.no_legacy)
    state = apply_materials_observation(
        state,
        as_of=as_of,
        watch_hint_elevated=bool(materials["watch_hint"]["elevated"]),
        watch_reasons=list(materials["watch_hint"].get("reasons") or []),
    )
    mode = str(state.get("mode") or "normal")
    save_state(state)

    flag_only = (args.human_force_elevated or args.clear_human_force_elevated) and not (
        args.auto or args.force_today
    )
    if flag_only:
        print(
            json.dumps(
                {
                    "ok": True,
                    "updated_state_only": True,
                    "mode": mode,
                    "human_force_elevated": state.get("human_force_elevated"),
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 0

    due = True
    if args.auto:
        due = should_notify_today(as_of, mode)
    if args.force_today:
        due = True

    why = _why(mode, state)
    text = format_watch_message(
        materials, mode=mode, plan_year=plan_year, why=why
    )

    result = {
        "job": "silicon_cycle_watch_notify",
        "as_of": as_of.isoformat(),
        "mode": mode,
        "plan_year": plan_year,
        "due": due,
        "discord_live": bool(args.discord_live),
        "watch_hint_elevated": materials["watch_hint"]["elevated"],
    }

    if not due:
        result["skipped"] = "not_scheduled_today"
        result["discord_sent"] = False
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("[silicon-cycle] skip (not scheduled for this mode/day)")
        return 0

    if already_sent(state, as_of, mode) and not args.force:
        result["skipped"] = "already_sent"
        result["discord_sent"] = False
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("--- message ---")
        print(text)
        print("[silicon-cycle] skipped (already sent; use --force)")
        return 0

    if not args.discord_live:
        result["discord_sent"] = False
        result["destination"] = "dry-run"
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("--- message ---")
        print(text)
        print("[silicon-cycle] dry-run only (--discord-live to send)")
        return 0

    wh = (resolve_silicon_cycle_webhook_url() or "").strip()
    if not wh:
        result["discord_sent"] = False
        result["discord_error"] = "dedicated webhook UNCONFIGURED"
        result["help"] = destination_help()
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print(destination_help())
        return 2

    sent = _send(text, webhook_url=wh)
    if not sent:
        sent = _send(text, webhook_url=wh)

    result["discord_sent"] = sent
    result["destination"] = "silicon_cycle_dedicated"
    result["discord_text"] = text
    if sent:
        state = mark_sent(state, as_of, mode, meta={"plan_year": plan_year})
        save_state(state)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("[silicon-cycle] Discord: sent")
        return 0

    result["discord_error"] = "send_discord failed"
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("[silicon-cycle] Discord send FAILED")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
