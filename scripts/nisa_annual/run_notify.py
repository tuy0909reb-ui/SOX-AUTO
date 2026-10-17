"""P0: NISA annual plan Discord notify (kick / deadline reminders).

Usage:
  python scripts/nisa_annual/run_notify.py --kind kick
  python scripts/nisa_annual/run_notify.py --kind remind_dec1
  python scripts/nisa_annual/run_notify.py --kind remind_dec8
  python scripts/nisa_annual/run_notify.py --auto          # calendar day → kind
  python scripts/nisa_annual/run_notify.py --kind kick --discord-live
  python scripts/nisa_annual/run_notify.py --kind kick --discord-live --force

Default is dry-run (print only). Does not auto-adopt or place trades.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from messages import (  # noqa: E402
    KINDS,
    format_message,
    infer_kind_from_calendar,
    plan_year_for_kick,
)
from notify_state import already_sent, mark_sent  # noqa: E402
from webhook_config import destination_help, resolve_nisa_annual_webhook_url  # noqa: E402


def _send(text: str, *, webhook_url: str) -> bool:
    from sox_utils import send_discord

    return bool(send_discord(text, webhook_url=webhook_url))


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="NISA annual plan P0 Discord notify")
    ap.add_argument(
        "--kind",
        choices=KINDS,
        default="",
        help="Notify kind (or use --auto)",
    )
    ap.add_argument(
        "--auto",
        action="store_true",
        help="Infer kind from today's calendar (11/1, 12/1, 12/8)",
    )
    ap.add_argument(
        "--plan-year",
        type=int,
        default=0,
        help="Override plan year (default: next year from as-of)",
    )
    ap.add_argument(
        "--as-of",
        default="",
        help="YYYY-MM-DD for dry calendar tests",
    )
    ap.add_argument(
        "--discord-live",
        action="store_true",
        help="Actually post to Discord (default: dry-run print)",
    )
    ap.add_argument(
        "--force",
        action="store_true",
        help="Allow re-send even if idempotency key already recorded",
    )
    args = ap.parse_args(argv)

    as_of = date.fromisoformat(args.as_of) if str(args.as_of).strip() else date.today()
    kind = str(args.kind).strip()
    if args.auto:
        kind = infer_kind_from_calendar(as_of) or ""
        if not kind:
            print(f"[nisa-annual] no scheduled notify for {as_of.isoformat()} - skip")
            return 0
    if not kind:
        ap.error("specify --kind or --auto")

    plan_year = int(args.plan_year) if args.plan_year else plan_year_for_kick(as_of)
    text = format_message(kind, plan_year=plan_year, as_of=as_of)

    result = {
        "job": "nisa_annual_notify_p0",
        "kind": kind,
        "plan_year": plan_year,
        "as_of": as_of.isoformat(),
        "discord_live": bool(args.discord_live),
        "force": bool(args.force),
    }

    if already_sent(kind, plan_year) and not args.force:
        result["discord_sent"] = False
        result["skipped"] = "already_sent"
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("--- message ---")
        print(text)
        print("[nisa-annual] skipped (already sent; use --force to re-send)")
        return 0

    if not args.discord_live:
        result["discord_sent"] = False
        result["destination"] = "dry-run"
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print("--- message ---")
        print(text)
        print("[nisa-annual] dry-run only (--discord-live to send)")
        return 0

    wh = (resolve_nisa_annual_webhook_url() or "").strip()
    if not wh:
        result["discord_sent"] = False
        result["discord_error"] = "dedicated webhook UNCONFIGURED"
        result["help"] = destination_help()
        result["discord_text"] = text
        print(json.dumps(result, ensure_ascii=False, indent=2))
        print(destination_help())
        return 2

    # One retry on transient failure
    sent = _send(text, webhook_url=wh)
    if not sent:
        sent = _send(text, webhook_url=wh)

    result["discord_sent"] = sent
    result["destination"] = "nisa_annual_dedicated"
    result["discord_error"] = "" if sent else "send_discord failed"
    result["discord_text"] = text

    if sent:
        mark_sent(kind, plan_year, meta={"as_of": as_of.isoformat()})
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if not sent:
        print("[nisa-annual] Discord send FAILED")
        return 1
    print("[nisa-annual] Discord: sent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
