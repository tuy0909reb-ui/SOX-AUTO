"""管理者向け: Ops doctor — one-shot readiness check (read-only diagnosis)."""

from __future__ import annotations

import argparse
import io
import sys
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.cli_support import (
    RUNTIME_LOG_DIR,
    add_version_flag,
    cli_runtime,
    get_schema_version,
    maybe_exit_on_version,
    resolve_db,
)
from portfolio.db import connect, init_db
from health_check import run_health_check
from integrity_check import run_integrity_check

BACKUP_DIR = Path("logs/portfolio/backups")


def _rank(status: str) -> int:
    return {"PASS": 0, "OK": 0, "WARNING": 1, "FAIL": 2}.get(status, 2)


def _worst(*statuses: str) -> str:
    worst = "PASS"
    for s in statuses:
        if _rank(s) > _rank(worst):
            worst = "FAIL" if s == "FAIL" else ("WARNING" if s == "WARNING" else s)
    if worst == "OK":
        return "PASS"
    return worst


def run_doctor(db_path: str | None = None) -> tuple[str, list[str]]:
    lines: list[str] = []
    checks: list[str] = []

    path = resolve_db(db_path)
    lines.append("=== Portfolio Doctor ===")
    lines.append(f"DB path: {path}")

    # 1) DB exists
    if path.is_file():
        lines.append("[PASS] DB exists")
        checks.append("PASS")
    else:
        lines.append("[FAIL] DB missing")
        checks.append("FAIL")
        lines.append("Overall FAIL")
        return "FAIL", lines

    # 2) schema_version
    try:
        schema = get_schema_version(path)
        if schema == "2":
            lines.append(f"[PASS] schema_version={schema}")
            checks.append("PASS")
        else:
            lines.append(f"[WARNING] schema_version={schema} (expected 2)")
            checks.append("WARNING")
    except Exception as exc:
        lines.append(f"[FAIL] schema_version: {exc}")
        checks.append("FAIL")

    # 3) integrity_check (suppress its print; capture status)
    buf = io.StringIO()
    with redirect_stdout(buf):
        integ = run_integrity_check(str(path))
    if integ == "OK":
        lines.append("[PASS] integrity_check=OK")
        checks.append("PASS")
    else:
        lines.append("[FAIL] integrity_check=FAIL")
        detail = buf.getvalue().strip()
        if detail:
            for dline in detail.splitlines():
                if dline not in ("OK", "FAIL"):
                    lines.append(f"  {dline}")
        checks.append("FAIL")

    # 4) health_check
    health_status, health_lines = run_health_check(str(path))
    tag = {"PASS": "PASS", "WARNING": "WARNING", "FAIL": "FAIL"}.get(
        health_status, "FAIL"
    )
    lines.append(f"[{tag}] health_check={health_status}")
    checks.append(health_status)
    for hl in health_lines:
        if hl in ("PASS", "WARNING", "FAIL") or hl.startswith("Overall"):
            continue
        lines.append(f"  {hl}")

    # 5–7) last date / asset count / record counts
    init_db(path)
    conn = connect(path)
    try:
        last = conn.execute("SELECT MAX(date) AS d FROM market_daily").fetchone()["d"]
        asset_n = conn.execute("SELECT COUNT(*) AS n FROM asset").fetchone()["n"]
        market_n = conn.execute("SELECT COUNT(*) AS n FROM market_daily").fetchone()["n"]
        hold_n = conn.execute(
            "SELECT COUNT(*) AS n FROM holdings_snapshot"
        ).fetchone()["n"]
        hyp_n = conn.execute("SELECT COUNT(*) AS n FROM hypothesis").fetchone()["n"]
        lines.append(f"last market_daily date: {last}")
        lines.append(f"asset count: {asset_n}")
        lines.append(
            f"records: market_daily={market_n} holdings={hold_n} hypothesis={hyp_n}"
        )
        if not last:
            lines.append("[WARNING] no market_daily dates")
            checks.append("WARNING")
        if asset_n == 0:
            lines.append("[FAIL] asset count is 0")
            checks.append("FAIL")
        if market_n == 0:
            lines.append("[WARNING] market_daily empty")
            checks.append("WARNING")
    finally:
        conn.close()

    # 8) backups
    backups = sorted(BACKUP_DIR.glob("portfolio_*.db")) if BACKUP_DIR.is_dir() else []
    if backups:
        lines.append(
            f"[PASS] backups: {len(backups)} under {BACKUP_DIR} "
            f"(latest={backups[-1].name})"
        )
        checks.append("PASS")
    else:
        lines.append(f"[WARNING] no backups under {BACKUP_DIR} (run backup_db.py)")
        checks.append("WARNING")

    # 9) runtime log
    if RUNTIME_LOG_DIR.is_dir():
        logs = sorted(RUNTIME_LOG_DIR.glob("*.log"))
        if logs:
            lines.append(
                f"[PASS] runtime logs: {len(logs)} under {RUNTIME_LOG_DIR} "
                f"(latest={logs[-1].name})"
            )
            checks.append("PASS")
        else:
            lines.append(f"[WARNING] runtime log dir empty: {RUNTIME_LOG_DIR}")
            checks.append("WARNING")
    else:
        lines.append(f"[WARNING] runtime log dir missing: {RUNTIME_LOG_DIR}")
        checks.append("WARNING")

    overall = _worst(*checks)
    lines.append(f"Overall {overall}")
    return overall, lines


def main() -> None:
    parser = argparse.ArgumentParser(
        description="One-shot ops readiness check (doctor)"
    )
    parser.add_argument("--db", default=None)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("doctor"):
        overall, lines = run_doctor(args.db)
        print("\n".join(lines))
        try:
            from discord_notify import notify_doctor

            notify_doctor(overall, lines)
        except Exception:
            pass
        raise SystemExit(0 if overall != "FAIL" else 1)


if __name__ == "__main__":
    main()
