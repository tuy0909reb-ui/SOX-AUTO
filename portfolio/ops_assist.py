"""Ops assistance helpers for reminders / checklist / runtime summary.

Read-only against DB and logs. Does not change schema or design.
Does not auto-create Hypothesis / Position / Review judgments.
"""

from __future__ import annotations

import calendar
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path

from portfolio.cli_support import RUNTIME_LOG_DIR, resolve_db
from portfolio.db import connect, init_db

BACKUP_DIR = Path("logs/portfolio/backups")

# Stale thresholds (days) → show WARNING (no auto-run)
STALE_COLLECT_DAYS = 3
STALE_BACKUP_DAYS = 10
STALE_HOLDINGS_DAYS = 45
STALE_HYPOTHESIS_DAYS = 60


@dataclass
class OpsSnapshot:
    today: date
    db_exists: bool = False
    db_path: str = ""
    schema_version: str = "unknown"
    integrity_ok: bool | None = None
    asset_count: int = 0
    market_rows: int = 0
    last_market_date: str | None = None
    last_collect_at: str | None = None
    coverage_note: str = ""
    last_backup_path: str | None = None
    last_backup_mtime: datetime | None = None
    last_holdings_date: str | None = None
    last_hypothesis_date: str | None = None
    monthly_review_done_this_month: bool = False
    quarterly_review_done_this_quarter: bool = False
    warnings: list[str] = field(default_factory=list)


def _parse_ymd(s: str | None) -> date | None:
    if not s:
        return None
    try:
        return date.fromisoformat(str(s)[:10])
    except ValueError:
        return None


def _days_ago(d: date | None, today: date) -> int | None:
    if d is None:
        return None
    return (today - d).days


def _human_ago(days: int | None, *, missing: str = "なし") -> str:
    if days is None:
        return missing
    if days == 0:
        return "今日"
    if days == 1:
        return "昨日"
    return f"{days}日前"


def _quarter(d: date) -> tuple[int, int]:
    return d.year, (d.month - 1) // 3 + 1


def gather_snapshot(db_path: str | Path | None = None) -> OpsSnapshot:
    today = date.today()
    path = resolve_db(str(db_path) if db_path else None)
    snap = OpsSnapshot(today=today, db_path=str(path), db_exists=path.is_file())
    if not snap.db_exists:
        snap.warnings.append("DB missing")
        return snap

    init_db(path)
    conn = connect(path)
    try:
        row = conn.execute(
            "SELECT value FROM meta WHERE key = 'schema_version'"
        ).fetchone()
        snap.schema_version = str(row["value"]) if row else "unknown"

        try:
            msg = conn.execute("PRAGMA integrity_check").fetchone()[0]
            snap.integrity_ok = msg == "ok"
        except Exception:
            snap.integrity_ok = False

        snap.asset_count = conn.execute(
            "SELECT COUNT(*) AS n FROM asset"
        ).fetchone()["n"]
        snap.market_rows = conn.execute(
            "SELECT COUNT(*) AS n FROM market_daily"
        ).fetchone()["n"]
        snap.last_market_date = conn.execute(
            "SELECT MAX(date) AS d FROM market_daily"
        ).fetchone()["d"]
        snap.last_collect_at = conn.execute(
            "SELECT MAX(collected_at) AS t FROM market_daily"
        ).fetchone()["t"]

        auto_codes = ("MEGA10_PROXY", "SOXX", "FNGS", "QQQ")
        with_data = 0
        for code in auto_codes:
            n = conn.execute(
                """
                SELECT COUNT(*) AS n FROM market_daily m
                JOIN asset a ON a.asset_id = m.asset_id
                WHERE a.code = ?
                """,
                (code,),
            ).fetchone()["n"]
            if n > 0:
                with_data += 1
        snap.coverage_note = f"{with_data}/{len(auto_codes)} auto peers have rows"

        snap.last_holdings_date = conn.execute(
            "SELECT MAX(as_of_date) AS d FROM holdings_snapshot"
        ).fetchone()["d"]
        snap.last_hypothesis_date = conn.execute(
            "SELECT MAX(as_of_date) AS d FROM hypothesis"
        ).fetchone()["d"]

        month_start = today.replace(day=1)
        rows = conn.execute(
            """
            SELECT review_type, period_start, period_end, generated_at, params_json
            FROM review_run
            WHERE lower(review_type) LIKE '%month%'
            """
        ).fetchall()
        for r in rows:
            gen = _parse_ymd(r["generated_at"])
            pend = _parse_ymd(r["period_end"])
            params = r["params_json"] or ""
            if gen and gen.year == today.year and gen.month == today.month:
                snap.monthly_review_done_this_month = True
            if pend and pend.year == today.year and pend.month == today.month:
                snap.monthly_review_done_this_month = True
            ref_prev = month_start - timedelta(days=1)
            prev_label = f"{ref_prev.year}-{ref_prev.month:02d}"
            if today.day <= 10 and gen and gen >= month_start:
                if prev_label in params or (
                    pend and pend.isoformat()[:7] == prev_label
                ):
                    snap.monthly_review_done_this_month = True

        y, q = _quarter(today)
        q_rows = conn.execute(
            """
            SELECT review_type, period_start, period_end, generated_at, params_json
            FROM review_run
            WHERE lower(review_type) LIKE '%quarter%'
            """
        ).fetchall()
        for r in q_rows:
            gen = _parse_ymd(r["generated_at"])
            params = (r["params_json"] or "") + " " + (r["review_type"] or "")
            if gen and _quarter(gen) == (y, q):
                snap.quarterly_review_done_this_quarter = True
            if f"Q{q}" in params and str(y) in params:
                snap.quarterly_review_done_this_quarter = True
            if f'"quarter": {q}' in params or f'"quarter":{q}' in params:
                if str(y) in params or (gen and gen.year == y):
                    snap.quarterly_review_done_this_quarter = True
    finally:
        conn.close()

    backups = sorted(BACKUP_DIR.glob("portfolio_*.db")) if BACKUP_DIR.is_dir() else []
    if backups:
        latest = backups[-1]
        snap.last_backup_path = latest.name
        snap.last_backup_mtime = datetime.fromtimestamp(latest.stat().st_mtime)

    md = _days_ago(_parse_ymd(snap.last_market_date), today)
    if md is None or md > STALE_COLLECT_DAYS:
        snap.warnings.append("collect stale")
    if snap.last_backup_mtime is None:
        snap.warnings.append("backup missing")
    else:
        bd = (today - snap.last_backup_mtime.date()).days
        if bd > STALE_BACKUP_DAYS:
            snap.warnings.append("backup stale")
    hd = _days_ago(_parse_ymd(snap.last_holdings_date), today)
    if hd is None or hd > STALE_HOLDINGS_DAYS:
        snap.warnings.append("holdings stale")
    hypd = _days_ago(_parse_ymd(snap.last_hypothesis_date), today)
    if hypd is None or hypd > STALE_HYPOTHESIS_DAYS:
        snap.warnings.append("hypothesis stale")
    if snap.integrity_ok is False:
        snap.warnings.append("integrity FAIL")

    return snap


def format_portfolio_status(snap: OpsSnapshot) -> list[str]:
    try:
        from discord_notify import status_label as discord_status
    except Exception:
        discord_status = lambda: "NOT CONFIGURED"  # noqa: E731

    lines = [
        "Portfolio Status",
        "",
        "Database",
        f"  {'OK' if snap.db_exists and snap.schema_version == '2' else 'FAIL'}"
        f"  path={snap.db_path} schema={snap.schema_version}",
        "",
        "Market data",
        f"  last_date={snap.last_market_date or 'none'} rows={snap.market_rows}",
        "",
        "Backup",
    ]
    if snap.last_backup_mtime:
        ago = (snap.today - snap.last_backup_mtime.date()).days
        lines.append(f"  {snap.last_backup_path} ({_human_ago(ago)})")
    else:
        lines.append("  none")
    lines.extend(
        [
            "",
            "Integrity",
            f"  {'OK' if snap.integrity_ok else 'FAIL' if snap.integrity_ok is False else 'unknown'}",
            "",
            "Coverage",
            f"  {snap.coverage_note}",
            "",
            "Discord",
            f"  {discord_status()}",
        ]
    )
    return lines


def format_checklist(snap: OpsSnapshot) -> list[str]:
    today = snap.today
    md = _days_ago(_parse_ymd(snap.last_market_date), today)
    collect_ok = md is not None and md <= STALE_COLLECT_DAYS
    backup_ok = False
    if snap.last_backup_mtime is not None:
        backup_ok = (today - snap.last_backup_mtime.date()).days <= STALE_BACKUP_DAYS
    db_ok = (
        snap.db_exists
        and snap.integrity_ok is not False
        and snap.schema_version == "2"
    )

    hd = _days_ago(_parse_ymd(snap.last_holdings_date), today)
    holdings_ok = hd is not None and hd <= STALE_HOLDINGS_DAYS

    need_monthly = today.day <= 10 or today.day >= calendar.monthrange(
        today.year, today.month
    )[1] - 2
    monthly_ok = snap.monthly_review_done_this_month if need_monthly else True

    hypd = _days_ago(_parse_ymd(snap.last_hypothesis_date), today)
    hyp_ok = hypd is not None and hypd <= STALE_HYPOTHESIS_DAYS

    def mark(ok: bool) -> str:
        return "✔" if ok else "□"

    lines = [
        "Today's checklist",
        "",
        f"{mark(db_ok)} Database OK",
        f"{mark(backup_ok)} Backup OK",
        f"{mark(collect_ok)} Market data collected",
        f"{mark(holdings_ok)} Holdings update",
        f"{mark(monthly_ok)} Monthly review",
        f"{mark(hyp_ok)} Hypothesis",
    ]
    if today.month in (1, 4, 7, 10) and today.day <= 10:
        lines.append(
            f"{mark(snap.quarterly_review_done_this_quarter)} Quarterly review"
        )
    return lines


def format_reminders(snap: OpsSnapshot) -> list[str]:
    today = snap.today
    md = _days_ago(_parse_ymd(snap.last_market_date), today)
    bd = None
    if snap.last_backup_mtime:
        bd = (today - snap.last_backup_mtime.date()).days
    hd = _days_ago(_parse_ymd(snap.last_holdings_date), today)
    hypd = _days_ago(_parse_ymd(snap.last_hypothesis_date), today)

    lines = [
        "Reminder",
        "",
        "最後の収集",
        f"  {_human_ago(md)}",
        "",
        "最後のバックアップ",
        f"  {_human_ago(bd)}",
        "",
        "最後の保有更新",
        f"  {_human_ago(hd)}",
        "",
        "最後のHypothesis",
        f"  {_human_ago(hypd)}",
    ]

    stale = False
    if md is None or md > STALE_COLLECT_DAYS:
        stale = True
    if bd is None or bd > STALE_BACKUP_DAYS:
        stale = True
    if hd is None or hd > STALE_HOLDINGS_DAYS:
        stale = True
    if hypd is None or hypd > STALE_HYPOTHESIS_DAYS:
        stale = True
    if stale:
        lines.extend(["", "WARNING"])

    if today.day <= 7 and not snap.monthly_review_done_this_month:
        lines.extend(["", "今月は月次レビューが未実施です"])
    if (
        today.month in (1, 4, 7, 10)
        and today.day <= 10
        and not snap.quarterly_review_done_this_quarter
    ):
        lines.extend(["", "四半期レビューを実施してください"])

    return lines


def runtime_summary(days: int = 30) -> list[str]:
    end = date.today()
    start = end - timedelta(days=days - 1)
    collect_ok = 0
    backup_n = 0
    review_n = 0
    warn_n = 0
    err_n = 0

    if not RUNTIME_LOG_DIR.is_dir():
        return [
            "運用サマリー",
            "",
            f"直近{days}日",
            "  (runtime log なし)",
        ]

    re_collect_end = re.compile(r"\[collect_market_daily\].*END elapsed_sec=")
    re_backup = re.compile(r"\[backup_db\].*END elapsed_sec=")
    re_review = re.compile(r"\[review_(monthly|quarterly)\].*END elapsed_sec=")
    re_warn = re.compile(r"\[WARNING\]")
    re_err = re.compile(r"\[ERROR\]")

    d = start
    while d <= end:
        path = RUNTIME_LOG_DIR / f"{d.isoformat()}.log"
        d += timedelta(days=1)
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for line in text.splitlines():
            if re_warn.search(line):
                warn_n += 1
            if re_err.search(line):
                err_n += 1
            if re_backup.search(line) and "(failed)" not in line:
                backup_n += 1
            if re_review.search(line) and "(failed)" not in line:
                review_n += 1
            if re_collect_end.search(line) and "(failed)" not in line:
                collect_ok += 1

    return [
        "運用サマリー",
        "",
        f"直近{days}日 (logs/runtime)",
        f"  collect成功回数: {collect_ok}",
        f"  backup回数: {backup_n}",
        f"  review回数: {review_n}",
        f"  warning件数: {warn_n}",
        f"  error件数: {err_n}",
    ]


def period_reminder_messages(today: date | None = None) -> list[str]:
    today = today or date.today()
    snap = gather_snapshot()
    msgs: list[str] = []
    if today.day <= 7 and not snap.monthly_review_done_this_month:
        msgs.append("今月は月次レビューが未実施です")
    if (
        today.month in (1, 4, 7, 10)
        and today.day <= 10
        and not snap.quarterly_review_done_this_quarter
    ):
        msgs.append("四半期レビューを実施してください")
    return msgs


# --- First-time setup gate (display / guidance only) ---

SETUP_ACK_PATH = Path("logs/portfolio/.setup_ack")

SCHEDULER_TASKS = (
    "SOXAUTO_Portfolio_Nightly",
    "SOXAUTO_Portfolio_WeeklyBackup",
    "SOXAUTO_Portfolio_MonthlyReminder",
    "SOXAUTO_Portfolio_QuarterlyReminder",
)


def _scheduler_registered_count() -> int:
    import subprocess
    import sys

    enc = "cp932" if sys.platform == "win32" else "utf-8"
    n = 0
    for name in SCHEDULER_TASKS:
        r = subprocess.run(
            ["schtasks", "/Query", "/TN", name],
            capture_output=True,
            text=True,
            encoding=enc,
            errors="replace",
        )
        if r.returncode == 0:
            n += 1
    return n


def setup_ack_exists() -> bool:
    return SETUP_ACK_PATH.is_file()


def mark_setup_ack() -> None:
    SETUP_ACK_PATH.parent.mkdir(parents=True, exist_ok=True)
    SETUP_ACK_PATH.write_text(date.today().isoformat() + "\n", encoding="utf-8")


def first_setup_report(snap: OpsSnapshot | None = None) -> tuple[str, list[str], bool]:
    """Return (overall, lines, scheduler_missing).

    Checks: DB / Scheduler / Backup / Runtime / Asset.
    Does not mutate system state.
    """
    snap = snap or gather_snapshot()
    lines: list[str] = ["初回セットアップ確認", ""]
    fails: list[str] = []
    warns: list[str] = []

    # DB
    if snap.db_exists and snap.schema_version == "2":
        lines.append("DB")
        lines.append(f"  OK  schema={snap.schema_version}")
    else:
        lines.append("DB")
        lines.append("  FAIL")
        fails.append("DB")

    # Scheduler
    sched_n = _scheduler_registered_count()
    scheduler_missing = sched_n == 0
    lines.append("Scheduler")
    if sched_n == len(SCHEDULER_TASKS):
        lines.append(f"  OK  {sched_n}/{len(SCHEDULER_TASKS)} tasks")
    elif sched_n > 0:
        lines.append(f"  WARNING  {sched_n}/{len(SCHEDULER_TASKS)} tasks")
        warns.append("Scheduler partial")
    else:
        lines.append("  未登録")
        warns.append("Scheduler未登録")

    # Backup
    lines.append("Backup")
    if snap.last_backup_path:
        lines.append(f"  OK  {snap.last_backup_path}")
    else:
        lines.append("  WARNING  none yet")
        warns.append("Backup")

    # Runtime
    lines.append("Runtime")
    if RUNTIME_LOG_DIR.is_dir() and any(RUNTIME_LOG_DIR.glob("*.log")):
        nlogs = len(list(RUNTIME_LOG_DIR.glob("*.log")))
        lines.append(f"  OK  {nlogs} log file(s)")
    else:
        lines.append("  WARNING  no logs yet")
        warns.append("Runtime")

    # Asset
    lines.append("Asset")
    if snap.asset_count >= 6:
        lines.append(f"  OK  count={snap.asset_count}")
    elif snap.asset_count > 0:
        lines.append(f"  WARNING  count={snap.asset_count}")
        warns.append("Asset")
    else:
        lines.append("  FAIL  count=0")
        fails.append("Asset")

    if fails:
        overall = "Overall FAIL"
    elif warns:
        overall = "Overall WARNING"
    else:
        overall = "Overall PASS"
    lines.append("")
    lines.append(overall)
    return overall, lines, scheduler_missing
