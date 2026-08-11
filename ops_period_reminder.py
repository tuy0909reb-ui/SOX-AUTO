"""Period reminder display for Task Scheduler (monthly / quarterly).

Display only — does not run review / holdings / hypothesis.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.cli_support import cli_runtime, runtime_log
from portfolio.ops_assist import period_reminder_messages


def main() -> None:
    parser = argparse.ArgumentParser(description="Show period review reminders")
    parser.add_argument(
        "--kind",
        choices=["auto", "monthly", "quarterly"],
        default="auto",
        help="Which reminder to emphasize (auto = both if due)",
    )
    args = parser.parse_args()

    with cli_runtime("ops_period_reminder"):
        msgs = period_reminder_messages()
        if args.kind == "monthly":
            msgs = [m for m in msgs if "月次" in m]
        elif args.kind == "quarterly":
            msgs = [m for m in msgs if "四半期" in m]

        print("=" * 48, flush=True)
        print("  Portfolio 運用リマインダー", flush=True)
        print("=" * 48, flush=True)
        if not msgs:
            print("（該当するリマインドはありません）", flush=True)
            runtime_log("INFO", "no period reminders", cli="ops_period_reminder")
        else:
            for m in msgs:
                print(m, flush=True)
                runtime_log("WARNING", m, cli="ops_period_reminder")
        print("=" * 48, flush=True)
        # Keep console visible when launched by Task Scheduler
        try:
            input("\nEnter で閉じる...")
        except EOFError:
            pass


if __name__ == "__main__":
    main()
