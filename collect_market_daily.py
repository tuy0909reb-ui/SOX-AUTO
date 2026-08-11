"""Daily market data collection into portfolio.db.

Default history window: 2022-01-01 through today, so judgment verification
covers the 2022 drawdown, 2023 AI start, and 2024-2026 bull regimes.

Existing DB rows are never duplicated: inserts use
PRIMARY KEY (date, asset_id) / date with ON CONFLICT DO NOTHING.
Missing early history (e.g. only 2023+) is backfilled; complete history
only appends from the latest stored date.
"""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

import pandas as pd
import yfinance as yf

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio import DEFAULT_HISTORY_START, PROTOCOL_VERSION
from portfolio.db import (
    connect,
    fx_date_range,
    get_asset_map,
    init_db,
    insert_fx_daily_ignore,
    insert_market_daily_ignore,
    market_date_range,
    utc_now_iso,
)
from portfolio.mega_proxy import fetch_mega10_proxy_nav

YF_ETF_CODES = {
    "SOXX": "SOXX",
    "FNGS": "FNGS",
    "QQQ": "QQQ",
}

# Expected short history is not a collection failure (ETF listing / vendor start).
HISTORY_COVERAGE_NOTES = {
    "FNGS": (
        "FNGS listing/Yahoo history may start after the requested history start; "
        "early gap is normal, not a fetch error."
    ),
    "MEGA10_PROXY": (
        "Proxy needs overlapping constituent history; early gaps can occur "
        "when any mega name lacks data."
    ),
    "MEGA10_OFFICIAL": "Manual import only until an official daily feed is wired.",
    "MEGA10_FUND": "Manual import only (domestic fund NAV).",
    "SOXX": None,
    "QQQ": None,
    "USDJPY": None,
}


def _normalize_index(s: pd.Series | pd.DataFrame) -> pd.Series | pd.DataFrame:
    out = s.copy()
    out.index = pd.to_datetime(out.index).tz_localize(None)
    return out


def fetch_etf_closes(tickers: list[str], start: str, end: str | None) -> pd.DataFrame:
    kwargs = {"start": start, "auto_adjust": True, "progress": False}
    if end:
        kwargs["end"] = end
    raw = yf.download(tickers, **kwargs)["Close"]
    if isinstance(raw, pd.Series):
        raw = raw.to_frame(name=tickers[0])
    return _normalize_index(raw)


def fetch_usdjpy(start: str, end: str | None) -> pd.Series:
    kwargs = {"start": start, "auto_adjust": True, "progress": False}
    if end:
        kwargs["end"] = end
    raw = yf.download("JPY=X", **kwargs)["Close"]
    if isinstance(raw, pd.DataFrame):
        raw = raw.squeeze()
    return _normalize_index(raw).dropna()


def _today() -> str:
    return date.today().isoformat()


def resolve_fetch_window(
    *,
    history_start: str,
    history_end: str,
    earliest: str | None,
    latest: str | None,
) -> tuple[str, str] | None:
    """
    Decide download window for one series.

    - No data: [history_start, history_end]
    - Earliest later than history_start: backfill from history_start through history_end
      (existing rows skipped via ON CONFLICT DO NOTHING)
    - History already covers history_start: append from latest through history_end
    - Already up to date: None
    """
    if earliest is None or latest is None:
        return history_start, history_end

    if earliest > history_start:
        # Missing early years (e.g. DB starts 2023) — pull full span once.
        return history_start, history_end

    if latest >= history_end:
        return None

    # Append only from last stored date (overlap 1 day for ret continuity).
    return latest, history_end


def _write_series_ignore(
    conn,
    asset_id: int,
    series: pd.Series,
    source: str,
    collected_at: str,
    *,
    dry_run: bool = False,
) -> tuple[int, int]:
    """Returns (inserted, skipped_existing). dry_run counts without writing."""
    s = series.dropna().astype(float)
    if s.empty:
        return 0, 0
    rets = s.pct_change()
    inserted = 0
    skipped = 0
    for dt, price in s.items():
        d = pd.Timestamp(dt).strftime("%Y-%m-%d")
        if dry_run:
            exists = conn.execute(
                "SELECT 1 FROM market_daily WHERE date = ? AND asset_id = ?",
                (d, asset_id),
            ).fetchone()
            if exists:
                skipped += 1
            else:
                inserted += 1
            continue
        ret = rets.loc[dt]
        ret_1d = float(ret) if pd.notna(ret) else None
        ok = insert_market_daily_ignore(
            conn,
            date=d,
            asset_id=asset_id,
            price=float(price),
            ret_1d=ret_1d,
            source=source,
            protocol_version=PROTOCOL_VERSION,
            collected_at=collected_at,
        )
        if ok:
            inserted += 1
        else:
            skipped += 1
    return inserted, skipped


def collect_market_daily(
    db_path: str | None = None,
    start: str = DEFAULT_HISTORY_START,
    end: str | None = None,
    skip_proxy: bool = False,
    dry_run: bool = False,
) -> dict[str, dict[str, int | str | None]]:
    """
    Fetch MEGA10_PROXY / SOXX / FNGS / QQQ / USDJPY into portfolio.db.

    Default: start=2022-01-01, end=today.
    Existing PRIMARY KEY rows are left untouched (INSERT ... DO NOTHING).
    dry_run=True: fetch and count would-insert / would-skip; no DB writes.
    """
    history_start = start or DEFAULT_HISTORY_START
    history_end = end or _today()

    init_db(db_path)
    conn = connect(db_path)
    collected_at = utc_now_iso()
    report: dict[str, dict[str, int | str | None]] = {}

    try:
        assets = get_asset_map(conn)

        # ---- ETFs: one download covering the widest needed window ----
        etf_windows: dict[str, tuple[str, str]] = {}
        global_etf_start: str | None = None
        global_etf_end: str | None = None
        for code in YF_ETF_CODES:
            if code not in assets:
                continue
            earliest, latest = market_date_range(conn, assets[code])
            win = resolve_fetch_window(
                history_start=history_start,
                history_end=history_end,
                earliest=earliest,
                latest=latest,
            )
            if win is None:
                report[code] = {
                    "inserted": 0,
                    "skipped": 0,
                    "fetch_start": None,
                    "fetch_end": None,
                    "db_earliest": earliest,
                    "db_latest": latest,
                    "note": "up_to_date",
                }
                continue
            etf_windows[code] = win
            fs, fe = win
            global_etf_start = fs if global_etf_start is None else min(global_etf_start, fs)
            global_etf_end = fe if global_etf_end is None else max(global_etf_end, fe)

        closes = None
        if global_etf_start and global_etf_end and etf_windows:
            closes = fetch_etf_closes(
                list(YF_ETF_CODES.values()),
                start=global_etf_start,
                end=global_etf_end,
            )

        for code, ticker in YF_ETF_CODES.items():
            if code not in assets:
                continue
            if code not in etf_windows:
                continue
            fs, fe = etf_windows[code]
            if closes is None or ticker not in closes.columns:
                report[code] = {
                    "inserted": 0,
                    "skipped": 0,
                    "fetch_start": fs,
                    "fetch_end": fe,
                    "note": "no_data",
                }
                continue
            series = closes[ticker]
            series = series.loc[
                (series.index >= pd.Timestamp(fs))
                & (series.index <= pd.Timestamp(fe))
            ]
            earliest, latest = market_date_range(conn, assets[code])
            inserted, skipped = _write_series_ignore(
                conn,
                assets[code],
                series,
                source=f"yfinance:{ticker}",
                collected_at=collected_at,
                dry_run=dry_run,
            )
            report[code] = {
                "inserted": inserted,
                "skipped": skipped,
                "fetch_start": fs,
                "fetch_end": fe,
                "db_earliest_before": earliest,
                "db_latest_before": latest,
            }

        # ---- MEGA10_PROXY ----
        if not skip_proxy and "MEGA10_PROXY" in assets:
            earliest, latest = market_date_range(conn, assets["MEGA10_PROXY"])
            win = resolve_fetch_window(
                history_start=history_start,
                history_end=history_end,
                earliest=earliest,
                latest=latest,
            )
            if win is None:
                report["MEGA10_PROXY"] = {
                    "inserted": 0,
                    "skipped": 0,
                    "fetch_start": None,
                    "fetch_end": None,
                    "note": "up_to_date",
                }
            else:
                fs, fe = win
                try:
                    nav = fetch_mega10_proxy_nav(start=fs, end=fe)
                    inserted, skipped = _write_series_ignore(
                        conn,
                        assets["MEGA10_PROXY"],
                        nav,
                        source="yfinance:mega10_equal_weight_quarterly",
                        collected_at=collected_at,
                        dry_run=dry_run,
                    )
                    report["MEGA10_PROXY"] = {
                        "inserted": inserted,
                        "skipped": skipped,
                        "fetch_start": fs,
                        "fetch_end": fe,
                    }
                except Exception as exc:
                    report["MEGA10_PROXY"] = {
                        "inserted": 0,
                        "skipped": 0,
                        "fetch_start": fs,
                        "fetch_end": fe,
                        "note": f"skip:{exc}",
                    }
        elif skip_proxy:
            report["MEGA10_PROXY"] = {"inserted": 0, "skipped": 0, "note": "skipped"}

        # ---- USDJPY ----
        earliest_fx, latest_fx = fx_date_range(conn)
        win_fx = resolve_fetch_window(
            history_start=history_start,
            history_end=history_end,
            earliest=earliest_fx,
            latest=latest_fx,
        )
        if win_fx is None:
            report["USDJPY"] = {
                "inserted": 0,
                "skipped": 0,
                "fetch_start": None,
                "fetch_end": None,
                "note": "up_to_date",
            }
        else:
            fs, fe = win_fx
            try:
                fx = fetch_usdjpy(start=fs, end=fe)
                inserted = 0
                skipped = 0
                for dt, val in fx.items():
                    d = pd.Timestamp(dt).strftime("%Y-%m-%d")
                    if dry_run:
                        exists = conn.execute(
                            "SELECT 1 FROM fx_daily WHERE date = ?", (d,)
                        ).fetchone()
                        if exists:
                            skipped += 1
                        else:
                            inserted += 1
                        continue
                    ok = insert_fx_daily_ignore(
                        conn,
                        date=d,
                        usdjpy=float(val),
                        source="yfinance:JPY=X",
                        collected_at=collected_at,
                    )
                    if ok:
                        inserted += 1
                    else:
                        skipped += 1
                report["USDJPY"] = {
                    "inserted": inserted,
                    "skipped": skipped,
                    "fetch_start": fs,
                    "fetch_end": fe,
                }
            except Exception as exc:
                report["USDJPY"] = {
                    "inserted": 0,
                    "skipped": 0,
                    "fetch_start": fs,
                    "fetch_end": fe,
                    "note": f"skip:{exc}",
                }

        for code in ("MEGA10_OFFICIAL", "MEGA10_FUND"):
            report.setdefault(code, {"inserted": 0, "skipped": 0, "note": "manual_only"})

        for code, asset_id in assets.items():
            if code not in (
                "MEGA10_PROXY",
                "MEGA10_OFFICIAL",
                "MEGA10_FUND",
                "SOXX",
                "FNGS",
                "QQQ",
            ):
                continue
            earliest, latest = market_date_range(conn, asset_id)
            n = conn.execute(
                "SELECT COUNT(*) AS n FROM market_daily WHERE asset_id = ? AND price IS NOT NULL",
                (asset_id,),
            ).fetchone()["n"]
            entry = report.setdefault(code, {"inserted": 0, "skipped": 0})
            entry["db_rows"] = int(n)
            entry["available_start"] = earliest
            entry["available_end"] = latest
            entry["coverage_note"] = _coverage_note(
                code, history_start=history_start, earliest=earliest, n=int(n)
            )

        earliest_fx, latest_fx = fx_date_range(conn)
        n_fx = conn.execute("SELECT COUNT(*) AS n FROM fx_daily").fetchone()["n"]
        fx_entry = report.setdefault("USDJPY", {"inserted": 0, "skipped": 0})
        fx_entry["db_rows"] = int(n_fx)
        fx_entry["available_start"] = earliest_fx
        fx_entry["available_end"] = latest_fx
        fx_entry["coverage_note"] = _coverage_note(
            "USDJPY",
            history_start=history_start,
            earliest=earliest_fx,
            n=int(n_fx),
        )

        if dry_run:
            conn.rollback()
            for v in report.values():
                if isinstance(v, dict):
                    v["note"] = (str(v.get("note") or "") + " dry_run").strip()
        else:
            conn.commit()
    finally:
        conn.close()
    return report


def _coverage_note(
    code: str,
    *,
    history_start: str,
    earliest: str | None,
    n: int,
) -> str:
    known = HISTORY_COVERAGE_NOTES.get(code)
    if n <= 0:
        if known and "Manual" in (known or ""):
            return known
        return "no_rows_in_db"
    if earliest and earliest > history_start:
        base = (
            f"ok_short_history: available from {earliest} "
            f"(requested start {history_start})"
        )
        if known:
            return f"{base}; {known}"
        return base
    if known and "Manual" in known:
        return known
    return "ok_full_requested_span"


def import_manual_prices(
    db_path: str | None,
    asset_code: str,
    csv_path: str,
    source: str = "manual_import",
    date_col: str = "date",
    price_col: str = "price",
    dry_run: bool = False,
) -> tuple[int, int]:
    """Import MEGA10_OFFICIAL / MEGA10_FUND (or any asset) from CSV. Returns (inserted, skipped)."""
    from portfolio.cli_support import validate_market_csv

    rows = validate_market_csv(csv_path, date_col=date_col, price_col=price_col)
    init_db(db_path)
    conn = connect(db_path)
    collected_at = utc_now_iso()
    try:
        assets = get_asset_map(conn)
        if asset_code not in assets:
            raise SystemExit(f"Unknown asset_code: {asset_code}")
        inserted = 0
        skipped = 0
        prev_price = None
        for row in rows:
            d = row["date"]
            price = float(row["price"])
            ret_1d = None if prev_price is None else (price / prev_price - 1.0)
            prev_price = price
            if dry_run:
                exists = conn.execute(
                    "SELECT 1 FROM market_daily WHERE date = ? AND asset_id = ?",
                    (d, assets[asset_code]),
                ).fetchone()
                if exists:
                    skipped += 1
                else:
                    inserted += 1
                continue
            ok = insert_market_daily_ignore(
                conn,
                date=d,
                asset_id=assets[asset_code],
                price=price,
                ret_1d=ret_1d,
                source=source,
                protocol_version=PROTOCOL_VERSION,
                collected_at=collected_at,
            )
            if ok:
                inserted += 1
            else:
                skipped += 1
        if dry_run:
            conn.rollback()
        else:
            conn.commit()
        return inserted, skipped
    finally:
        conn.close()


def main() -> None:
    from portfolio.cli_support import (
        add_version_flag,
        cli_runtime,
        maybe_exit_on_version,
        runtime_log,
    )

    parser = argparse.ArgumentParser(
        description=(
            "Collect daily market data into portfolio.db for long-horizon "
            "investment-judgment verification. Default history: "
            f"{DEFAULT_HISTORY_START} through today "
            "(MEGA10_PROXY, SOXX, FNGS, QQQ, USDJPY). "
            "Existing rows are not duplicated (PRIMARY KEY + INSERT OR IGNORE)."
        )
    )
    parser.add_argument("--db", default=None, help="Path to portfolio.db")
    parser.add_argument(
        "--start",
        default=DEFAULT_HISTORY_START,
        help=f"History start date YYYY-MM-DD (default: {DEFAULT_HISTORY_START})",
    )
    parser.add_argument(
        "--end",
        default=None,
        help="History end date YYYY-MM-DD (default: today)",
    )
    parser.add_argument("--skip-proxy", action="store_true")
    parser.add_argument(
        "--import-csv",
        nargs=2,
        metavar=("ASSET_CODE", "CSV_PATH"),
        help="Manual import for MEGA10_OFFICIAL / MEGA10_FUND etc.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch/validate and report counts without writing to DB",
    )
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)

    with cli_runtime("collect_market_daily"):
        if args.import_csv:
            code, path = args.import_csv
            inserted, skipped = import_manual_prices(
                args.db, code, path, dry_run=args.dry_run
            )
            label = "DRY-RUN import" if args.dry_run else "Imported"
            print(
                f"{label} {code} from {path}: "
                f"would_insert={inserted} would_skip={skipped}"
                if args.dry_run
                else f"{label} {code} from {path}: inserted={inserted} skipped_existing={skipped}"
            )
            return

        report = collect_market_daily(
            db_path=args.db,
            start=args.start,
            end=args.end,
            skip_proxy=args.skip_proxy,
            dry_run=args.dry_run,
        )
        title = "DRY-RUN collect" if args.dry_run else "Collect complete"
        print(
            f"{title} (requested history {args.start} -> {args.end or _today()}):"
        )
        print("Per-asset coverage:")
        total_ins = 0
        total_skip = 0
        for k in sorted(report.keys()):
            r = report[k]
            ins = int(r.get("inserted", 0) or 0)
            sk = int(r.get("skipped", 0) or 0)
            total_ins += ins
            total_skip += sk
            print(
                f"  {k}: rows={r.get('db_rows', 0)} "
                f"available={r.get('available_start')}->{r.get('available_end')} "
                f"{'would_insert' if args.dry_run else 'inserted'}={ins} "
                f"{'would_skip' if args.dry_run else 'skipped_existing'}={sk}"
            )
            note = r.get("coverage_note") or r.get("note")
            if note:
                print(f"    note: {note}")
        if args.dry_run:
            print(f"Totals: would_insert={total_ins} would_skip={total_skip}")
            runtime_log(
                "INFO",
                f"dry_run would_insert={total_ins} would_skip={total_skip}",
                cli="collect_market_daily",
            )


if __name__ == "__main__":
    main()
