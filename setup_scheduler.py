"""Windows Task Scheduler for portfolio ops (admin tool).

参照系（副作用なし）:
  python setup_scheduler.py           # Usage のみ
  python setup_scheduler.py --list    # 登録状況の表示

更新系:
  python setup_scheduler.py --install
  python setup_scheduler.py --uninstall

Automates only: collect → doctor, weekly backup, period reminders.
Never schedules: holdings / hypothesis / review.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PY = sys.executable

TASK_NIGHTLY = "SOXAUTO_Portfolio_Nightly"
TASK_BACKUP = "SOXAUTO_Portfolio_WeeklyBackup"
TASK_MONTHLY = "SOXAUTO_Portfolio_MonthlyReminder"
TASK_QUARTERLY = "SOXAUTO_Portfolio_QuarterlyReminder"
ALL_TASKS = (TASK_NIGHTLY, TASK_BACKUP, TASK_MONTHLY, TASK_QUARTERLY)


def _schtasks(args: list[str]) -> subprocess.CompletedProcess[str]:
    # Japanese Windows schtasks emits CP932 text; UTF-8 mis-parses field names.
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


def _create(
    name: str,
    *,
    schedule: list[str],
    script: str,
    script_args: list[str] | None = None,
) -> None:
    _delete_if_exists(name)
    arg_tail = " ".join(script_args or [])
    inner = f'cd /d "{ROOT}" && "{PY}" "{ROOT / script}" {arg_tail}'.strip()
    tr = f"cmd /c {inner}"
    cmd = [
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
    result = _schtasks(cmd)
    if result.returncode != 0:
        raise SystemExit(
            f"Failed to create {name}:\n{result.stdout}\n{result.stderr}"
        )
    print(f"Registered: {name}")
    print(f"  TR: {tr}")


def install(*, nightly_time: str = "20:30", backup_time: str = "10:00") -> None:
    """更新系: 本プロジェクトの Scheduler を登録／更新。"""
    print(f"Repo: {ROOT}")
    print(f"Python: {PY}")
    print("Installing tasks (collect/doctor/backup/reminders only)...")
    _create(
        TASK_NIGHTLY,
        schedule=["/SC", "WEEKLY", "/D", "MON,TUE,WED,THU,FRI", "/ST", nightly_time],
        script="ops_nightly.py",
    )
    _create(
        TASK_BACKUP,
        schedule=["/SC", "WEEKLY", "/D", "SUN", "/ST", backup_time],
        script="backup_db.py",
    )
    _create(
        TASK_MONTHLY,
        schedule=["/SC", "MONTHLY", "/D", "1", "/ST", "09:00"],
        script="ops_period_reminder.py",
        script_args=["--kind", "monthly"],
    )
    _create(
        TASK_QUARTERLY,
        schedule=[
            "/SC",
            "MONTHLY",
            "/M",
            "JAN,APR,JUL,OCT",
            "/D",
            "1",
            "/ST",
            "09:15",
        ],
        script="ops_period_reminder.py",
        script_args=["--kind", "quarterly"],
    )
    print()
    print("Done. Verify: python setup_scheduler.py --list")
    print("Remove:  python setup_scheduler.py --uninstall")


def uninstall() -> None:
    """更新系: 本プロジェクトが登録したタスクのみ削除。"""
    for name in ALL_TASKS:
        result = _schtasks(["/Delete", "/TN", name, "/F"])
        status = "removed" if result.returncode == 0 else "not found / skip"
        print(f"{name}: {status}")


def _parse_query(text: str) -> dict[str, str]:
    """Parse schtasks /FO LIST output (EN or JA keys)."""
    info: dict[str, str] = {}
    for line in text.splitlines():
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip()
        if key:
            info[key] = val
    return info


def _pick(info: dict[str, str], *keys: str) -> str:
    lower = {k.lower(): v for k, v in info.items()}
    for k in keys:
        if k in info:
            return info[k]
        if k.lower() in lower:
            return lower[k.lower()]
    # fuzzy: any key containing token
    for token in keys:
        for k, v in info.items():
            if token.lower() in k.lower():
                return v
    return "(n/a)"


def task_registered(name: str) -> bool:
    return _schtasks(["/Query", "/TN", name]).returncode == 0


def count_registered() -> int:
    return sum(1 for name in ALL_TASKS if task_registered(name))


def list_tasks() -> None:
    """参照系: 登録一覧・状態・次回・最終結果。システム変更なし。"""
    print("Scheduler status (read-only)")
    print(f"Project tasks: {', '.join(ALL_TASKS)}")
    print()
    for name in ALL_TASKS:
        result = _schtasks(["/Query", "/TN", name, "/V", "/FO", "LIST"])
        print("-" * 48)
        print(f"Task: {name}")
        if result.returncode != 0:
            print("  Status:     (not registered)")
            print("  Next run:   -")
            print("  Last run:   -")
            print("  Last result:-")
            continue
        info = _parse_query(result.stdout)
        status = _pick(info, "Status", "状態")
        next_run = _pick(info, "Next Run Time", "次回の実行時刻", "Next Run")
        last_run = _pick(info, "Last Run Time", "前回の実行時刻", "Last Run")
        last_result = _pick(info, "Last Result", "前回の結果", "Last Task Result")
        print(f"  Status:      {status}")
        print(f"  Next run:    {next_run}")
        print(f"  Last run:    {last_run}")
        print(f"  Last result: {last_result}")
    print("-" * 48)
    n = count_registered()
    print(f"Registered: {n}/{len(ALL_TASKS)}")


def print_usage() -> None:
    print(
        """Usage: setup_scheduler.py [option]

参照系（システム変更なし）:
  --list              登録済みタスク一覧・状態・次回実行・最終結果

更新系:
  --install           Scheduler を登録／更新
  --uninstall         本プロジェクトのタスクのみ削除

オプション:
  --nightly-time HH:MM   平日 collect+doctor（--install 時, 既定 20:30）
  --backup-time HH:MM    日曜 backup（--install 時, 既定 10:00）

例:
  python setup_scheduler.py --list
  python setup_scheduler.py --install
  python setup_scheduler.py --uninstall

自動実行: collect / doctor / backup / reminder表示
人間のみ: holdings / hypothesis / hypothesis_review / review
"""
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Portfolio Task Scheduler (admin). Default: usage only.",
        add_help=True,
    )
    g = parser.add_mutually_exclusive_group()
    g.add_argument(
        "--list",
        action="store_true",
        help="Show registered tasks (read-only, no system change)",
    )
    g.add_argument(
        "--install",
        action="store_true",
        help="Register/update SOXAUTO_Portfolio_* tasks",
    )
    g.add_argument(
        "--uninstall",
        action="store_true",
        help="Remove SOXAUTO_Portfolio_* tasks only",
    )
    # Backward-compatible alias (update-side)
    g.add_argument(
        "--unregister",
        action="store_true",
        help=argparse.SUPPRESS,  # alias of --uninstall
    )
    parser.add_argument("--nightly-time", default="20:30")
    parser.add_argument("--backup-time", default="10:00")
    args = parser.parse_args()

    if args.list:
        list_tasks()
        return
    if args.install:
        install(nightly_time=args.nightly_time, backup_time=args.backup_time)
        return
    if args.uninstall or args.unregister:
        uninstall()
        return

    # Default: no system change
    print_usage()


if __name__ == "__main__":
    main()
