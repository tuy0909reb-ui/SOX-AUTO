"""管理者向け: Backup portfolio.db with 20-generation retention."""

from __future__ import annotations

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.cli_support import (
    add_version_flag,
    cli_runtime,
    maybe_exit_on_version,
    resolve_db,
    runtime_log,
)

BACKUP_DIR = Path("logs/portfolio/backups")
KEEP = 20


def backup_db(db_path: str | None = None, keep: int = KEEP) -> Path:
    src = resolve_db(db_path)
    if not src.is_file():
        raise SystemExit(f"DB not found: {src}")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = BACKUP_DIR / f"portfolio_{stamp}.db"
    shutil.copy2(src, dest)

    backups = sorted(BACKUP_DIR.glob("portfolio_*.db"), key=lambda p: p.stat().st_mtime)
    removed = 0
    while len(backups) > keep:
        old = backups.pop(0)
        old.unlink(missing_ok=True)
        removed += 1

    runtime_log(
        "INFO",
        f"backup created={dest.name} removed_old={removed} keep={keep}",
        cli="backup_db",
    )
    return dest


def main() -> None:
    parser = argparse.ArgumentParser(description="Backup portfolio.db (keep 20)")
    parser.add_argument("--db", default=None)
    parser.add_argument("--keep", type=int, default=KEEP)
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("backup_db"):
        dest = backup_db(args.db, keep=args.keep)
        print(f"Backup written: {dest}")
        remaining = sorted(BACKUP_DIR.glob("portfolio_*.db"))
        print(f"Generations kept: {len(remaining)} (max {args.keep})")


if __name__ == "__main__":
    main()
