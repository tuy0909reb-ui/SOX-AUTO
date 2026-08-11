"""Shared CLI helpers for ops (runtime log, --version). No schema / design changes."""

from __future__ import annotations

import argparse
import sys
import time
from contextlib import contextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Iterator

from portfolio import DEFAULT_DB_PATH, PROTOCOL_VERSION
from portfolio.db import connect, db_path, init_db

RUNTIME_LOG_DIR = Path("logs/runtime")


def get_schema_version(path: str | Path | None = None) -> str:
    init_db(path)
    conn = connect(path)
    try:
        row = conn.execute(
            "SELECT value FROM meta WHERE key = 'schema_version'"
        ).fetchone()
        return str(row["value"]) if row else "unknown"
    finally:
        conn.close()


def print_versions(path: str | Path | None = None) -> None:
    print(f"protocol_version={PROTOCOL_VERSION}")
    print(f"schema_version={get_schema_version(path)}")


def add_version_flag(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--version",
        action="store_true",
        help="Print protocol_version and schema_version, then exit",
    )


def maybe_exit_on_version(args: argparse.Namespace, db: str | None = None) -> None:
    if getattr(args, "version", False):
        print_versions(db if db is not None else getattr(args, "db", None))
        raise SystemExit(0)


def _log_path() -> Path:
    RUNTIME_LOG_DIR.mkdir(parents=True, exist_ok=True)
    return RUNTIME_LOG_DIR / f"{date.today().isoformat()}.log"


def runtime_log(level: str, message: str, *, cli: str | None = None) -> None:
    ts = datetime.now().replace(microsecond=0).isoformat(sep=" ")
    prefix = f"[{ts}] [{level}]"
    if cli:
        prefix += f" [{cli}]"
    line = f"{prefix} {message}"
    path = _log_path()
    with path.open("a", encoding="utf-8") as f:
        f.write(line + "\n")


@contextmanager
def cli_runtime(cli_name: str) -> Iterator[None]:
    """Log start/end/duration; capture uncaught errors to runtime log."""
    start = time.perf_counter()
    runtime_log("INFO", "START", cli=cli_name)
    try:
        yield
    except SystemExit as exc:
        code = exc.code if isinstance(exc.code, int) else (0 if exc.code is None else 1)
        if code != 0:
            runtime_log("ERROR", f"SystemExit code={exc.code}", cli=cli_name)
        elapsed = time.perf_counter() - start
        runtime_log("INFO", f"END elapsed_sec={elapsed:.3f}", cli=cli_name)
        raise
    except Exception as exc:
        runtime_log("ERROR", f"{type(exc).__name__}: {exc}", cli=cli_name)
        elapsed = time.perf_counter() - start
        runtime_log("INFO", f"END elapsed_sec={elapsed:.3f} (failed)", cli=cli_name)
        raise
    else:
        elapsed = time.perf_counter() - start
        runtime_log("INFO", f"END elapsed_sec={elapsed:.3f}", cli=cli_name)


def resolve_db(path: str | None) -> Path:
    return db_path(path or DEFAULT_DB_PATH)


# --- CSV validation (import gate) ---

def validate_market_csv(
    csv_path: str,
    *,
    date_col: str = "date",
    price_col: str = "price",
) -> list[dict]:
    """Validate market price CSV; return normalized rows or SystemExit."""
    import csv
    import re

    path = Path(csv_path)
    if not path.is_file():
        raise SystemExit(f"CSV not found: {csv_path}")

    date_re = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise SystemExit("CSV has no header")
        fields = [c.strip() for c in reader.fieldnames]
        if date_col not in fields or price_col not in fields:
            raise SystemExit(
                f"CSV columns must include {date_col!r} and {price_col!r}; got {fields}"
            )
        rows: list[dict] = []
        seen: set[str] = set()
        for i, raw in enumerate(reader, start=2):
            d = (raw.get(date_col) or "").strip()
            p = (raw.get(price_col) or "").strip()
            if d == "" or p == "":
                raise SystemExit(f"CSV line {i}: NULL/empty {date_col} or {price_col}")
            if not date_re.match(d):
                # try normalize
                try:
                    from datetime import datetime as dt

                    d = dt.fromisoformat(d.replace("/", "-")).strftime("%Y-%m-%d")
                except Exception:
                    raise SystemExit(f"CSV line {i}: bad date format {d!r} (want YYYY-MM-DD)")
            try:
                price = float(p.replace(",", ""))
            except ValueError:
                raise SystemExit(f"CSV line {i}: non-numeric price {p!r}")
            if d in seen:
                raise SystemExit(f"CSV line {i}: duplicate date {d}")
            seen.add(d)
            rows.append({"date": d, "price": price})
    if not rows:
        raise SystemExit("CSV has no data rows")
    rows.sort(key=lambda r: r["date"])
    return rows


def validate_holdings_csv(csv_path: str) -> list[dict]:
    """Validate holdings_snapshot CSV; return row dicts or SystemExit."""
    import csv
    import re

    path = Path(csv_path)
    if not path.is_file():
        raise SystemExit(f"CSV not found: {csv_path}")

    required = {"as_of_date", "position_id"}
    date_re = re.compile(r"^\d{4}-\d{2}-\d{2}$")
    numeric_optional = {
        "cost_jpy",
        "value_jpy",
        "units",
        "unit_cost_jpy",
        "pnl_jpy",
        "pnl_pct",
    }

    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise SystemExit("CSV has no header")
        fields = set(c.strip() for c in reader.fieldnames)
        missing = required - fields
        if missing:
            raise SystemExit(f"CSV missing columns: {sorted(missing)}")

        rows: list[dict] = []
        seen: set[tuple[str, str]] = set()
        for i, raw in enumerate(reader, start=2):
            as_of = (raw.get("as_of_date") or "").strip()
            pos = (raw.get("position_id") or "").strip()
            if not as_of or not pos:
                raise SystemExit(f"CSV line {i}: as_of_date and position_id required")
            if not date_re.match(as_of):
                try:
                    from datetime import datetime as dt

                    as_of = dt.fromisoformat(as_of.replace("/", "-")).strftime("%Y-%m-%d")
                except Exception:
                    raise SystemExit(f"CSV line {i}: bad as_of_date {as_of!r}")
            key = (as_of, pos)
            if key in seen:
                raise SystemExit(f"CSV line {i}: duplicate ({as_of}, {pos})")
            seen.add(key)
            row = {k: (raw.get(k) or "").strip() for k in fields}
            row["as_of_date"] = as_of
            row["position_id"] = pos
            for nk in numeric_optional:
                if nk in row and row[nk] != "":
                    try:
                        float(row[nk].replace(",", ""))
                    except ValueError:
                        raise SystemExit(f"CSV line {i}: non-numeric {nk}={row[nk]!r}")
            if row.get("hypothesis_id"):
                try:
                    int(row["hypothesis_id"])
                except ValueError:
                    raise SystemExit(f"CSV line {i}: bad hypothesis_id")
            rows.append(row)
    if not rows:
        raise SystemExit("CSV has no data rows")
    return rows
