"""
Monthly Common Backtest Data Refresh — extend sample so Human can notice change.

Purpose:
  Keep reusable Fact panels current (indexes / proxies / research BTC panel /
  portfolio readonly export). Not Decision, not strategy refit.

Does NOT:
  - mutate portfolio.db
  - change NISA_BACKTEST vendor originals in place (copies only when organize runs)
  - refit BTC candidate_set (that is Observation Refresh)

Usage:
  python scripts/common_backtest/run_monthly_refresh.py
  python scripts/common_backtest/run_monthly_refresh.py --skip-bitcoin
  python scripts/common_backtest/run_monthly_refresh.py --skip-portfolio-export
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import pandas as pd
import yfinance as yf

REPO = Path(__file__).resolve().parents[2]
DS = REPO / "data" / "common_backtest" / "datasets"
OBS = REPO / "data" / "common_backtest" / "obs"
RAW = REPO / "data" / "backtest" / "raw"
LOOKBACK_DAYS = 90

# Gap-prone + core index panels under common_backtest.
INDEX_SERIES: list[tuple[str, str, str, Path]] = [
    ("sox", "^SOX", "US", DS / "index_daily" / "sox_daily.csv"),
    ("vix", "^VIX", "US", DS / "index_daily" / "vix_daily.csv"),
    ("nasdaq", "^IXIC", "US", DS / "index_daily" / "nasdaq_daily.csv"),
    ("jpy", "JPY=X", "US", DS / "index_daily" / "jpy_daily.csv"),
    ("nq_f", "NQ=F", "US", DS / "index_daily" / "nq_f_daily.csv"),
]

RAW_SYNC = {
    "sox_daily.csv": DS / "index_daily" / "sox_daily.csv",
    "vix_daily.csv": DS / "index_daily" / "vix_daily.csv",
    "nasdaq_daily.csv": DS / "index_daily" / "nasdaq_daily.csv",
    "jpy_daily.csv": DS / "index_daily" / "jpy_daily.csv",
    "nq_f_daily.csv": DS / "index_daily" / "nq_f_daily.csv",
}


@dataclass
class SeriesResult:
    name: str
    path: str
    before_last: str | None = None
    after_last: str | None = None
    added_rows: int = 0
    ok: bool = True
    error: str = ""


@dataclass
class RefreshReport:
    job: str = "Common_Backtest_Monthly_Refresh"
    started: str = ""
    finished: str = ""
    ok: bool = False
    series: list[SeriesResult] = field(default_factory=list)
    steps: list[dict[str, Any]] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "job": self.job,
            "started": self.started,
            "finished": self.finished,
            "ok": self.ok,
            "series": [asdict(s) for s in self.series],
            "steps": self.steps,
            "notes": self.notes,
        }


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _session_date(ts: pd.Timestamp, *, market: str) -> pd.Timestamp:
    t = pd.Timestamp(ts)
    if t.tzinfo is None:
        return t.tz_localize(None).normalize()
    zone = "America/New_York" if market == "US" else "Asia/Tokyo"
    return t.tz_convert(zone).tz_localize(None).normalize()


def _history(ticker: str, start: date, *, market: str) -> pd.DataFrame:
    df = yf.Ticker(ticker).history(
        start=start.isoformat(),
        interval="1d",
        auto_adjust=False,
        actions=False,
    )
    if df is None or df.empty:
        return pd.DataFrame()
    out = df.reset_index()
    dcol = "Date" if "Date" in out.columns else out.columns[0]
    out["date"] = [_session_date(v, market=market) for v in pd.to_datetime(out[dcol])]
    return out


def _last_csv_date(path: Path) -> date | None:
    if not path.is_file():
        return None
    df = pd.read_csv(path)
    key = "date" if "date" in df.columns else ("Date" if "Date" in df.columns else df.columns[0])
    s = pd.to_datetime(df[key], errors="coerce").dropna()
    if s.empty:
        return None
    return pd.Timestamp(s.max()).date()


def _merge_csv(path: Path, new: pd.DataFrame) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_file():
        old = pd.read_csv(path)
        if "date" not in old.columns and "Date" in old.columns:
            old = old.rename(columns={"Date": "date"})
        old["date"] = pd.to_datetime(old["date"]).dt.strftime("%Y-%m-%d")
        merged = pd.concat([old, new], ignore_index=True)
        merged = merged.drop_duplicates(subset=["date"], keep="last").sort_values("date")
        before = len(old)
    else:
        merged = new.sort_values("date")
        before = 0
    merged.to_csv(path, index=False)
    return max(0, len(merged) - before)


def _refresh_index(name: str, ticker: str, market: str, path: Path) -> SeriesResult:
    rel = str(path.relative_to(REPO)).replace("\\", "/")
    before = _last_csv_date(path)
    try:
        start = (before or date(2006, 1, 1)) - timedelta(days=LOOKBACK_DAYS)
        raw = _history(ticker, start, market=market)
        time.sleep(0.25)
        if raw.empty:
            return SeriesResult(
                name,
                rel,
                before.isoformat() if before else None,
                before.isoformat() if before else None,
                0,
                False,
                "empty_fetch",
            )
        frame = pd.DataFrame(
            {
                "date": raw["date"].dt.strftime("%Y-%m-%d"),
                "Open": pd.to_numeric(raw["Open"], errors="coerce"),
                "High": pd.to_numeric(raw["High"], errors="coerce"),
                "Low": pd.to_numeric(raw["Low"], errors="coerce"),
                "Close": pd.to_numeric(raw["Close"], errors="coerce"),
                "Adj Close": pd.to_numeric(
                    raw["Adj Close"] if "Adj Close" in raw.columns else raw["Close"],
                    errors="coerce",
                ),
                "Volume": pd.to_numeric(raw["Volume"], errors="coerce"),
                "Dividends": 0.0,
                "Stock Splits": 0.0,
            }
        ).dropna(subset=["Close"])
        added = _merge_csv(path, frame)
        after = _last_csv_date(path)
        return SeriesResult(
            name,
            rel,
            before.isoformat() if before else None,
            after.isoformat() if after else None,
            added,
            True,
            "",
        )
    except Exception as exc:  # noqa: BLE001
        return SeriesResult(
            name,
            rel,
            before.isoformat() if before else None,
            before.isoformat() if before else None,
            0,
            False,
            f"{type(exc).__name__}: {exc}",
        )


def _sync_raw_mirrors() -> dict[str, Any]:
    RAW.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    missing: list[str] = []
    for name, src in RAW_SYNC.items():
        dest = RAW / name
        if not src.is_file():
            missing.append(name)
            continue
        shutil.copy2(src, dest)
        copied.append(name)
    return {"copied": copied, "missing": missing}


def _export_portfolio_facts() -> dict[str, Any]:
    # Reuse organize helper (readonly portfolio.db → CSV).
    sys.path.insert(0, str(REPO))
    import organize_common_backtest_data as org  # noqa: WPS433

    dest = DS / "etf_adj_close_daily"
    actions = org._export_portfolio_fact(dest, dry_run=False)
    return {"actions": actions}


def _refresh_taxable_required() -> dict[str, Any]:
    sys.path.insert(0, str(REPO))
    from taxable_account.ops import data_update as du  # noqa: WPS433

    rep = du.fetch_named_series(list(du.REQUIRED))
    return {
        "ok": rep.ok,
        "job": rep.job,
        "series": [asdict(s) if hasattr(s, "__dataclass_fields__") else s.__dict__ for s in rep.series],
        "notes": list(rep.notes),
    }


def _refresh_research_bitcoin() -> dict[str, Any]:
    sys.path.insert(0, str(REPO / "research"))
    import bitcoin_analysis as ba  # noqa: WPS433

    before = None
    panel = REPO / "research" / "bitcoin_panel.csv"
    if panel.is_file():
        lines = [ln for ln in panel.read_text(encoding="utf-8").splitlines() if ln.strip()]
        if len(lines) >= 2:
            before = lines[-1].split(",", 1)[0]
    result = ba.run()
    dq = result.get("data_quality") or {}
    # Mirror into common_backtest research_panels (copy, not source mutation of research/).
    dest = DS / "research_panels" / "bitcoin_panel.csv"
    dest.parent.mkdir(parents=True, exist_ok=True)
    if panel.is_file():
        shutil.copy2(panel, dest)
    return {
        "ok": True,
        "before_last": before,
        "after_last": dq.get("panel_end"),
        "panel_start": dq.get("panel_start"),
        "mirrored_to": str(dest.relative_to(REPO)).replace("\\", "/"),
    }


def _write_memo(rep: RefreshReport) -> Path:
    day = _utc_today()
    out = OBS / f"monthly-{day}"
    out.mkdir(parents=True, exist_ok=True)
    (out / "refresh_report.json").write_text(
        json.dumps(rep.to_dict(), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    rows = [
        ["name", "before_last", "after_last", "added", "ok"],
    ]
    for s in rep.series:
        rows.append(
            [
                s.name,
                s.before_last or "",
                s.after_last or "",
                str(s.added_rows),
                "OK" if s.ok else s.error,
            ]
        )
    md = [
        "# Common Backtest Monthly Refresh",
        "",
        f"**Retrieved:** `{rep.started}` → `{rep.finished}`  ",
        f"**ok:** `{rep.ok}`",
        "",
        "## Index panels",
        "",
        "| " + " | ".join(rows[0]) + " |",
        "| " + " | ".join(["---"] * 5) + " |",
    ]
    for r in rows[1:]:
        md.append("| " + " | ".join(r) + " |")
    md.extend(
        [
            "",
            "## Steps",
            "",
            "```json",
            json.dumps(rep.steps, ensure_ascii=False, indent=2),
            "```",
            "",
            "```text",
            "判断可能範囲: 系列最終日の延長・欠損埋め・鮮度確認",
            "判断禁止範囲: 戦略採用 / Protocol変更 / portfolio.db書き込み",
            "```",
            "",
        ]
    )
    path = out / "MONTHLY_REFRESH.md"
    path.write_text("\n".join(md), encoding="utf-8")
    (OBS / "LATEST.txt").write_text(f"monthly-{day}\n", encoding="utf-8")
    return path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Monthly common backtest data refresh")
    parser.add_argument("--skip-bitcoin", action="store_true")
    parser.add_argument("--skip-portfolio-export", action="store_true")
    parser.add_argument("--skip-taxable-required", action="store_true")
    args = parser.parse_args(argv)

    rep = RefreshReport(started=_utc_now())

    for name, ticker, market, path in INDEX_SERIES:
        print(f"[monthly] index {name} ({ticker})")
        rep.series.append(_refresh_index(name, ticker, market, path))

    raw_step = _sync_raw_mirrors()
    rep.steps.append({"step": "sync_data_backtest_raw", **raw_step})

    if not args.skip_taxable_required:
        print("[monthly] taxable REQUIRED series")
        try:
            tax = _refresh_taxable_required()
            rep.steps.append({"step": "taxable_required", **tax})
            if not tax.get("ok", False):
                rep.notes.append("taxable_required_partial_or_fail")
        except Exception as exc:  # noqa: BLE001
            rep.steps.append({"step": "taxable_required", "ok": False, "error": str(exc)})
            rep.notes.append(f"taxable_required_error={exc}")

    if not args.skip_portfolio_export:
        print("[monthly] portfolio readonly export")
        try:
            pe = _export_portfolio_facts()
            rep.steps.append({"step": "portfolio_export", "ok": True, **pe})
        except Exception as exc:  # noqa: BLE001
            rep.steps.append({"step": "portfolio_export", "ok": False, "error": str(exc)})
            rep.notes.append(f"portfolio_export_error={exc}")

    if not args.skip_bitcoin:
        print("[monthly] research bitcoin_panel")
        try:
            btc = _refresh_research_bitcoin()
            rep.steps.append({"step": "research_bitcoin_panel", **btc})
        except Exception as exc:  # noqa: BLE001
            rep.steps.append({"step": "research_bitcoin_panel", "ok": False, "error": str(exc)})
            rep.notes.append(f"bitcoin_panel_error={exc}")

    rep.finished = _utc_now()
    index_ok = all(s.ok for s in rep.series)
    step_ok = all(s.get("ok", True) for s in rep.steps if "ok" in s)
    rep.ok = index_ok and step_ok
    memo = _write_memo(rep)
    print(f"[monthly] memo={memo.as_posix()} ok={rep.ok}")
    for s in rep.series:
        print(
            f"  {s.name}: {s.before_last} -> {s.after_last} (+{s.added_rows}) "
            f"{'OK' if s.ok else s.error}"
        )
    return 0 if rep.ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
