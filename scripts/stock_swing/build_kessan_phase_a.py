"""Build immutable-raw and normalized Phase A earnings Fact datasets.

This collector intentionally does not calculate returns, win rates, rankings,
recommendations, or trading rules.  It never writes to the Gemini raw ledger.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse
from uuid import uuid5, NAMESPACE_URL

from financial_fact_contract import financial_fact_schemas


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
DEFAULT_OUTPUT = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
JST = "Asia/Tokyo"


UNIVERSE: tuple[dict[str, Any], ...] = (
    {"security_id": "5803", "name": "フジクラ", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.fujikura.co.jp/ir/"},
    {"security_id": "285A", "name": "キオクシアHD", "market": "TSE Prime",
     "listing_start": "2024-12-18", "listing_start_status": "datetime_confirmed",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www2.jpx.co.jp/disc/285A0/140120241217539866.pdf"},
    {"security_id": "6857", "name": "アドバンテスト", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.advantest.com/ja/investors/"},
    {"security_id": "6146", "name": "ディスコ", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.disco.co.jp/jp/ir/"},
    {"security_id": "6920", "name": "レーザーテック", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.lasertec.co.jp/ir/"},
    {"security_id": "4062", "name": "イビデン", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.ibiden.co.jp/ir/"},
    {"security_id": "6525", "name": "KOKUSAI ELECTRIC", "market": "TSE Prime",
     "listing_start": "2023-10-25", "listing_start_status": "datetime_confirmed",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.kokusai-electric.com/sites/default/files/2023-09/%E8%A8%98%E8%80%85%E7%99%BA%E8%A1%A8%E6%96%87%28%E6%96%B0%E8%A6%8F%E4%B8%8A%E5%A0%B4%E6%89%BF%E8%AA%8D%29_final.pdf"},
    {"security_id": "5801", "name": "古河電工", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.furukawa.co.jp/ir/"},
    {"security_id": "8035", "name": "東京エレクトロン", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.tel.co.jp/ir/"},
    {"security_id": "7735", "name": "SCREENホールディングス", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.screen.co.jp/ir/"},
    {"security_id": "3436", "name": "SUMCO", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.sumcosi.com/ir/"},
    {"security_id": "7011", "name": "三菱重工業", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.mhi.com/jp/finance"},
    {"security_id": "7012", "name": "川崎重工業", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.khi.co.jp/ir/"},
    {"security_id": "8306", "name": "三菱UFJフィナンシャル・グループ", "market": "TSE Prime",
     "listing_start": None, "listing_start_status": "not_investigated",
     "fiscal_year_end_month": None, "fiscal_year_end_status": "not_investigated",
     "evidence_url": "https://www.bk.mufg.jp/ir/"},
)

MISSING_STATUSES = (
    "not_investigated", "source_unavailable", "not_listed", "not_applicable",
    "not_comparable", "unit_unverified", "parse_error", "unknown_time",
    "date_only", "planned_date", "yuho_filing_only", "unresolved",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def display_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(path)


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def stable_id(namespace: str, *parts: object) -> str:
    value = "|".join(str(part) for part in parts)
    return f"{namespace}-{uuid5(NAMESPACE_URL, value).hex}"


def parse_exact_date(text: str) -> str | None:
    match = re.search(r"(?<!\d)(20\d{2})/(\d{2})/(\d{2})(?!\d)", text)
    return "-".join(match.groups()) if match else None


def parse_period_end(text: str) -> str | None:
    matches = re.findall(r"(20\d{2})/(\d{2})/(\d{2})", text)
    return "-".join(matches[-1]) if matches else None


def timestamp_quality(raw_date: str) -> str:
    value = raw_date.strip()
    if "有報提出時" in value:
        return "yuho_filing_only"
    if "予定" in value:
        return "planned_date"
    if parse_exact_date(value):
        return "date_only"
    return "unresolved"


def period_basis(label: str) -> str:
    value = label.strip()
    if "予想" in value:
        return "forecast"
    if "単体" in value:
        return value.replace("単体", "_standalone")
    if "累計" in value:
        return value.replace("累計", "_cumulative")
    if value in {"Q1", "Q2", "Q3"}:
        return f"{value}_unknown_basis"
    if "通期" in value:
        return "full_year"
    return "unknown"


def source_quality(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if not host:
        return "source_unavailable"
    if "jpx.co.jp" in host or "edinet-fsa.go.jp" in host:
        return "primary"
    if "irbank.net" in host or "kabutan.jp" in host or "scouter.monex.co.jp" in host:
        return "secondary"
    return "unknown"


def schemas() -> dict[str, dict[str, Any]]:
    common = {
        "additionalProperties": False,
        "type": "object",
    }
    base = {
        "security_master": {**common, "required": ["security_id", "name", "market", "listing_start", "listing_start_status", "evidence_url"]},
        "earnings_event": {**common, "required": ["event_id", "security_id", "announcement_date", "announcement_time", "timezone", "timestamp_quality", "fiscal_period_raw", "period_end", "period_basis", "source_id", "official_document_url", "inventory_status"]},
        "market_observation": {**common, "required": ["security_id", "session_date", "open", "high", "low", "close", "volume", "adj_close", "source_id", "retrieved_at", "quality_status"]},
        "corporate_action": {**common, "required": ["security_id", "ex_date", "action_type", "factor", "source_id", "quality_status"]},
        "source_provenance": {**common, "required": ["source_id", "provider", "url", "retrieved_at", "quality_status"]},
        "reconciliation": {**common, "required": ["reconciliation_id", "raw_row_id", "event_id", "match_status", "notes"]},
    }
    return {**base, **financial_fact_schemas()}


def build_raw_and_events(ledger: Path, output: Path, imported_at: str) -> dict[str, Any]:
    raw_dir = output / "raw_external"
    facts_dir = output / "facts"
    schema_dir = output / "schemas"
    raw_dir.mkdir(parents=True, exist_ok=True)
    facts_dir.mkdir(parents=True, exist_ok=True)
    schema_dir.mkdir(parents=True, exist_ok=True)

    original_hash = sha256(ledger)
    with ledger.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        source_rows = list(reader)

    raw_rows = [
        {
            "raw_row_id": index,
            "raw_file_path": display_path(ledger),
            "imported_at": imported_at,
            "content_sha256": original_hash,
            "columns": {field: row.get(field, "") for field in fieldnames},
        }
        for index, row in enumerate(source_rows, start=1)
    ]
    write_jsonl(raw_dir / "gemini_kessan_ledger_rows.jsonl", raw_rows)
    write_json(raw_dir / "gemini_kessan_ledger_manifest.json", {
        "raw_file_path": display_path(ledger),
        "imported_at": imported_at,
        "content_sha256": original_hash,
        "row_count": len(raw_rows),
        "columns": fieldnames,
        "immutability_rule": "The source CSV is never modified by this collector.",
    })

    universe_ids = {item["security_id"] for item in UNIVERSE}
    security_rows = [{**item, "universe_status": "active", "analysis_window_start": "2020-01-01"} for item in UNIVERSE]
    write_jsonl(facts_dir / "security_master.jsonl", security_rows)

    provenance: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []
    raw_codes: set[str] = set()
    for raw in raw_rows:
        values = raw["columns"]
        security_id = values["銘柄コード"].strip()
        raw_codes.add(security_id)
        raw_date = values["決算発表日"]
        url = values["決算資料URL"].strip()
        source_id = stable_id("source", raw["raw_row_id"], url or values["データ取得元"])
        provenance.append({
            "source_id": source_id,
            "provider": values["データ取得元"].strip() or "Gemini raw ledger",
            "url": url,
            "retrieved_at": imported_at,
            "content_hash": None,
            "quality_status": source_quality(url),
            "raw_row_id": raw["raw_row_id"],
        })
        announcement_date = parse_exact_date(raw_date)
        # Raw preserves every original row.  The normalized Phase A event
        # relation is intentionally scoped to announcement dates from 2020.
        if announcement_date and announcement_date < "2020-01-01":
            continue
        basis = period_basis(values["四半期区分"])
        event_id = stable_id(
            "earnings-event", security_id, raw["raw_row_id"], raw_date,
            values["対象会計期間"], values["四半期区分"],
        )
        events.append({
            "event_id": event_id,
            "security_id": security_id,
            "announcement_date": announcement_date,
            "announcement_time": None,
            "timezone": JST,
            "timestamp_quality": timestamp_quality(raw_date),
            "gemini_raw_announcement_date": raw_date,
            "fiscal_period_raw": values["対象会計期間"],
            "period_end": parse_period_end(values["対象会計期間"]),
            "period_basis": basis,
            "source_id": source_id,
            "official_document_url": url or None,
            "inventory_status": "raw_candidate",
            "raw_row_id": raw["raw_row_id"],
            "security_in_universe": security_id in universe_ids,
        })
    write_jsonl(facts_dir / "source_provenance.jsonl", provenance)
    write_jsonl(facts_dir / "earnings_event.jsonl", events)

    inventory = []
    for security in security_rows:
        security_events = [event for event in events if event["security_id"] == security["security_id"]]
        inventory.append({
            "security_id": security["security_id"],
            "raw_ledger_event_candidates": len(security_events),
            "first_raw_announcement_date": min((event["announcement_date"] for event in security_events if event["announcement_date"]), default=None),
            "last_raw_announcement_date": max((event["announcement_date"] for event in security_events if event["announcement_date"]), default=None),
            "inventory_status": "raw_seeded" if security_events else "not_investigated",
            "missing_reason": None if security_events else "No in-scope 2020+ Gemini raw event candidate exists for this universe security.",
        })
    write_jsonl(facts_dir / "event_inventory.jsonl", inventory)

    # Numeric Fact relations begin empty, but later additive pilot Facts must
    # never be erased by a Phase A raw rebuild.
    for name in ("financial_observation", "guidance_revision_observation"):
        path = facts_dir / f"{name}.jsonl"
        if not path.exists():
            path.write_text("", encoding="utf-8")
    for name in ("market_observation", "corporate_action", "reconciliation"):
        (facts_dir / f"{name}.jsonl").write_text("", encoding="utf-8")
    for name, schema in schemas().items():
        write_json(schema_dir / f"{name}.schema.json", schema)

    return {
        "ledger_sha256": original_hash,
        "raw_rows": len(raw_rows),
        "raw_security_ids": sorted(raw_codes),
        "events": events,
        "inventory": inventory,
        "provenance": provenance,
    }


def fetch_market(output: Path, as_of: str) -> dict[str, Any]:
    """Fetch daily OHLCV candidates without deriving event reactions."""
    try:
        import yfinance as yf
    except ImportError as error:
        return {"status": "source_unavailable", "reason": f"yfinance import failed: {error}", "rows": []}

    facts_dir = output / "facts"
    security_rows = [json.loads(line) for line in (facts_dir / "security_master.jsonl").read_text(encoding="utf-8").splitlines()]
    observations: list[dict[str, Any]] = []
    source_rows: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    retrieved_at = utc_now()
    for security in security_rows:
        code = security["security_id"]
        symbol = f"{code}.T"
        try:
            frame = yf.download(
                symbol, start="2020-01-01", end=as_of, auto_adjust=False,
                progress=False, threads=False, timeout=45,
            )
        except Exception as error:
            failures.append({"security_id": code, "status": "source_unavailable", "reason": str(error)})
            continue
        if frame is None or frame.empty:
            failures.append({"security_id": code, "status": "source_unavailable", "reason": "No daily OHLCV returned."})
            continue
        # yfinance 1.x returns MultiIndex columns even for a single symbol.
        # Normalize that shape before reading one scalar from each row.
        if getattr(frame.columns, "nlevels", 1) > 1:
            frame = frame.copy()
            frame.columns = frame.columns.get_level_values(0)
        source_id = stable_id("market-source", "yfinance", symbol, retrieved_at)
        source_rows.append({
            "source_id": source_id,
            "provider": "yfinance",
            "url": f"https://finance.yahoo.com/quote/{symbol}/history",
            "retrieved_at": retrieved_at,
            "content_hash": None,
            "quality_status": "candidate_unverified",
            "license_note": "Research feasibility source; corporate actions require independent audit.",
        })
        for index, row in frame.iterrows():
            def value(name: str) -> float | None:
                item = row.get(name)
                if item is None:
                    return None
                try:
                    return float(item)
                except (TypeError, ValueError):
                    return None
            session_date = index.date().isoformat()
            listing_start = security["listing_start"]
            status = "not_listed" if listing_start and session_date < listing_start else "candidate_unverified"
            observations.append({
                "security_id": code,
                "session_date": session_date,
                "open": value("Open"),
                "high": value("High"),
                "low": value("Low"),
                "close": value("Close"),
                "volume": value("Volume"),
                "adj_close": value("Adj Close"),
                "source_id": source_id,
                "retrieved_at": retrieved_at,
                "quality_status": status,
            })
    write_jsonl(facts_dir / "market_observation.jsonl", observations)
    # Append independent market provenance; raw provenance remains untouched.
    existing = [json.loads(line) for line in (facts_dir / "source_provenance.jsonl").read_text(encoding="utf-8").splitlines()]
    write_jsonl(facts_dir / "source_provenance.jsonl", [*existing, *source_rows])
    return {"status": "ok", "rows": observations, "failures": failures}


def report(ledger: Path, output: Path, data: dict[str, Any], market: dict[str, Any] | None) -> None:
    facts = output / "facts"
    events = data["events"]
    inventory = data["inventory"]
    timestamp_counts = Counter(event["timestamp_quality"] for event in events)
    events_by_security = Counter(event["security_id"] for event in events)
    market_rows = market.get("rows", []) if market else []
    market_by_security = Counter(row["security_id"] for row in market_rows)
    report_data = {
        "phase": "A",
        "generated_at": utc_now(),
        "gemini_raw_sha256": data["ledger_sha256"],
        "universe_count": len(UNIVERSE),
        "universe_ids": [item["security_id"] for item in UNIVERSE],
        "raw_ledger_rows": data["raw_rows"],
        "gemini_raw_security_count": len(data["raw_security_ids"]),
        "gemini_raw_security_ids": data["raw_security_ids"],
        "gemini_in_scope_event_security_count": len({event["security_id"] for event in events}),
        "gemini_in_scope_event_security_ids": sorted({event["security_id"] for event in events}),
        "event_candidate_count": len(events),
        "event_candidates_by_security": dict(sorted(events_by_security.items())),
        "inventory": inventory,
        "timestamp_quality": dict(sorted(timestamp_counts.items())),
        "reconciliation": {"exact": 0, "candidate": 0, "conflict": 0, "unmatched": 0, "note": "Deferred until Cursor-side official event sources are collected."},
        "market_observation_count": len(market_rows),
        "market_observations_by_security": dict(sorted(market_by_security.items())),
        "market_fetch_failures": market.get("failures", []) if market else [],
        "phase_a_completion": "modify",
        "unresolved": [
            "Official earnings timestamp collection is not yet implemented.",
            "Six universe securities have no Gemini raw rows: 5803, 6146, 6920, 6525, 5801, 7012.",
            "8035 has a Gemini raw row, but its only record is before the 2020 event scope.",
            "Fiscal-year end values remain not_investigated until primary-source verification.",
            "Corporate actions are not audited.",
            "Historical as-of consensus is optional and not collected.",
        ],
    }
    write_json(output / "phase_a_summary.json", report_data)
    # Re-check the source at the end: any mismatch fails the run.
    if sha256(ledger) != data["ledger_sha256"]:
        raise RuntimeError("Gemini raw ledger hash changed during Phase A run.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ledger", type=Path, default=DEFAULT_LEDGER)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--as-of", default=datetime.now().date().isoformat())
    parser.add_argument("--fetch-market", action="store_true", help="Fetch daily OHLCV candidates through yfinance.")
    parser.add_argument("--replace-output", action="store_true", help="Replace the generated Fact directory, never the raw ledger.")
    args = parser.parse_args()

    ledger = args.ledger.resolve()
    output = args.output.resolve()
    if not ledger.exists():
        raise FileNotFoundError(ledger)
    if args.replace_output and output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True, exist_ok=True)
    before_hash = sha256(ledger)
    data = build_raw_and_events(ledger, output, utc_now())
    market = fetch_market(output, args.as_of) if args.fetch_market else None
    report(ledger, output, data, market)
    after_hash = sha256(ledger)
    if before_hash != after_hash:
        raise RuntimeError("Gemini raw ledger was modified; refusing success.")
    print(json.dumps({
        "phase": "A",
        "output": str(output),
        "raw_sha256": before_hash,
        "events": len(data["events"]),
        "market_rows": len(market.get("rows", [])) if market else 0,
        "market_fetch_status": market.get("status") if market else "not_requested",
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
