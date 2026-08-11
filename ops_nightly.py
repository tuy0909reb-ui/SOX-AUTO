"""Weekday nightly ops: collect_market_daily → doctor.

Safe automation only. Does NOT run holdings / hypothesis / review.
"""

from __future__ import annotations

import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.cli_support import cli_runtime, runtime_log

PY = sys.executable
NIGHTLY_LOG_DIR = Path("logs/portfolio/nightly")


def _run(script: str, args: list[str] | None = None) -> tuple[int, str]:
    cmd = [PY, str(ROOT / script), *(args or [])]
    completed = subprocess.run(
        cmd,
        cwd=str(ROOT),
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    out = (completed.stdout or "") + (completed.stderr or "")
    return completed.returncode, out


def main() -> None:
    NIGHTLY_LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = NIGHTLY_LOG_DIR / f"nightly_{stamp}.log"

    with cli_runtime("ops_nightly"):
        lines: list[str] = []
        lines.append(f"ops_nightly start {stamp}")

        code_c, out_c = _run("collect_market_daily.py")
        lines.append(f"=== collect_market_daily exit={code_c} ===")
        lines.append(out_c.rstrip())
        if code_c != 0:
            runtime_log("ERROR", f"collect failed exit={code_c}", cli="ops_nightly")
            print("FAIL: collect_market_daily", flush=True)
            print(out_c, flush=True)
        else:
            runtime_log("INFO", "collect ok", cli="ops_nightly")
            print("collect: OK", flush=True)

        code_d, out_d = _run("doctor.py")
        lines.append(f"=== doctor exit={code_d} ===")
        lines.append(out_d.rstrip())
        print(out_d, flush=True)

        overall = "PASS"
        if code_c != 0 or code_d != 0 or "Overall FAIL" in out_d:
            overall = "FAIL"
            runtime_log("ERROR", f"nightly overall={overall}", cli="ops_nightly")
            print("\n*** NIGHTLY ABNORMAL — check logs ***", flush=True)
        elif "Overall WARNING" in out_d or "WARNING" in out_d:
            overall = "WARNING"
            runtime_log("WARNING", f"nightly overall={overall}", cli="ops_nightly")
            print("\n*** NIGHTLY WARNING — review doctor output ***", flush=True)
        else:
            runtime_log("INFO", f"nightly overall={overall}", cli="ops_nightly")
            print("\nnightly: OK", flush=True)

        lines.append(f"overall={overall}")
        log_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"log saved: {log_path}", flush=True)

        if overall == "FAIL":
            raise SystemExit(1)


if __name__ == "__main__":
    main()
