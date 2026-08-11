"""Windows Task Scheduler for NDX sell daily ops (until --complete).

参照:
  python setup_ndx_scheduler.py
  python setup_ndx_scheduler.py --list

更新:
  python setup_ndx_scheduler.py --install
  python setup_ndx_scheduler.py --uninstall

平日:
  AM 08:30  → ndx_ops.py --run am   # 技術判定（ViewModel通知）
  PM 14:05  → ndx_ops.py --run pm   # 朝判定再計算 + NQギャップ回避
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PY = sys.executable

TASK_AM = "SOXAUTO_NDX_AM"
TASK_PM = "SOXAUTO_NDX_PM"
ALL_TASKS = (TASK_AM, TASK_PM)


def _schtasks(args: list[str]) -> subprocess.CompletedProcess[str]:
    enc = "cp932" if sys.platform == "win32" else "utf-8"
    return subprocess.run(
        ["schtasks", *args],
        capture_output=True,
        text=True,
        encoding=enc,
        errors="replace",
    )


def _delete_if_exists(name: str) -> None:
    _schtasks(["/Delete", "/TN", name, "/F"])


def _create(name: str, *, schedule: list[str], run_args: str) -> None:
    _delete_if_exists(name)
    inner = (
        f'cd /d "{ROOT}" && "{PY}" "{ROOT / "ndx_ops.py"}" {run_args}'
    ).strip()
    tr = f"cmd /c {inner}"
    result = _schtasks(
        [
            "/Create",
            "/TN",
            name,
            "/TR",
            tr,
            *schedule,
            "/RL",
            "LIMITED",
            "/F",
        ]
    )
    if result.returncode != 0:
        raise SystemExit(
            f"Failed to create {name}:\n{result.stdout}\n{result.stderr}"
        )
    print(f"Registered: {name}")
    print(f"  TR: {tr}")


def install(*, am_time: str = "08:30", pm_time: str = "14:05") -> None:
    print(f"Repo: {ROOT}")
    print("Installing NDX weekday AM/PM tasks...")
    _create(
        TASK_AM,
        schedule=["/SC", "WEEKLY", "/D", "MON,TUE,WED,THU,FRI", "/ST", am_time],
        run_args="--run am",
    )
    _create(
        TASK_PM,
        schedule=["/SC", "WEEKLY", "/D", "MON,TUE,WED,THU,FRI", "/ST", pm_time],
        run_args="--run pm",
    )
    print()
    print("Done. Verify: python setup_ndx_scheduler.py --list")
    print("売却完了後: python ndx_ops.py --complete")
    print("          python setup_ndx_scheduler.py --uninstall")


def uninstall() -> None:
    for name in ALL_TASKS:
        result = _schtasks(["/Delete", "/TN", name, "/F"])
        status = "removed" if result.returncode == 0 else "not found / skip"
        print(f"{name}: {status}")


def _parse_query(text: str) -> dict[str, str]:
    info: dict[str, str] = {}
    for line in text.splitlines():
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        info[key.strip()] = val.strip()
    return info


def _pick(info: dict[str, str], *keys: str) -> str:
    lower = {k.lower(): v for k, v in info.items()}
    for k in keys:
        if k in info:
            return info[k]
        if k.lower() in lower:
            return lower[k.lower()]
    for token in keys:
        for k, v in info.items():
            if token.lower() in k.lower():
                return v
    return "(n/a)"


def list_tasks() -> None:
    print("NDX Scheduler (read-only)")
    for name in ALL_TASKS:
        result = _schtasks(["/Query", "/TN", name, "/V", "/FO", "LIST"])
        print("-" * 48)
        print(f"Task: {name}")
        if result.returncode != 0:
            print("  Status: (not registered)")
            continue
        info = _parse_query(result.stdout)
        print(f"  Status:      {_pick(info, 'Status', '状態')}")
        print(f"  Next run:    {_pick(info, 'Next Run Time', '次回の実行時刻')}")
        print(f"  Last run:    {_pick(info, 'Last Run Time', '前回の実行時刻')}")
        print(f"  Last result: {_pick(info, 'Last Result', '前回の結果')}")
    print("-" * 48)


def print_usage() -> None:
    print(
        """Usage: setup_ndx_scheduler.py [option]

参照（変更なし）:
  --list

更新:
  --install [--am-time HH:MM] [--pm-time HH:MM]
  --uninstall

既定: 平日 AM 08:30 / PM 14:05
"""
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="NDX Task Scheduler (default: usage only)"
    )
    g = parser.add_mutually_exclusive_group()
    g.add_argument("--list", action="store_true")
    g.add_argument("--install", action="store_true")
    g.add_argument("--uninstall", action="store_true")
    parser.add_argument("--am-time", default="08:30")
    parser.add_argument("--pm-time", default="14:05")
    args = parser.parse_args()

    if args.list:
        list_tasks()
        return
    if args.install:
        install(am_time=args.am_time, pm_time=args.pm_time)
        return
    if args.uninstall:
        uninstall()
        return
    print_usage()


if __name__ == "__main__":
    main()
