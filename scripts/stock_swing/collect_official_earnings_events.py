"""Collect official 2020+ earnings-event Facts and reconcile to Gemini raw.

Additive Fact layer only. Never modifies kessan_ledger.csv or Phase A
Gemini candidate semantics. No win-rate / ranking / trading outputs.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid5, NAMESPACE_URL

ROOT = Path(__file__).resolve().parents[2]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
JST = "Asia/Tokyo"
UA = {"User-Agent": "SOX-AUTO-official-earnings-collector/1.0 (+research; fact-layer-only)"}

UNIVERSE = (
    "5803", "285A", "6857", "6146", "6920", "4062", "6525",
    "5801", "8035", "7735", "3436", "7011", "7012", "8306",
)

LISTING_START = {"285A": "2024-12-18", "6525": "2023-10-25"}

# Working fiscal-year-end month assumptions pending issuer confirmation.
# Stored with quality_status=not_investigated unless title evidence overrides.
FY_END_HINT = {
    "5803": 3, "285A": 3, "6857": 3, "6146": 3, "6920": 6, "4062": 3, "6525": 3,
    "5801": 3, "8035": 3, "7735": 3, "3436": 12, "7011": 3, "7012": 3, "8306": 3,
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(str(p) for p in parts)).hex}"


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def fetch(url: str, pause: float = 0.35) -> str:
    time.sleep(pause)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read().decode("utf-8", "replace")


def head_ok(url: str, pause: float = 0.2) -> bool:
    time.sleep(pause)
    req = urllib.request.Request(url, headers=UA, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return 200 <= getattr(response, "status", 200) < 400
    except Exception:
        return False


def disc_code(security_id: str) -> str:
    if security_id[-1].isalpha():
        return f"{security_id}0"
    return f"{security_id}0"


def jpx_pdf_url(security_id: str, doc_id: str) -> str:
    return f"https://www2.jpx.co.jp/disc/{disc_code(security_id)}/{doc_id}.pdf"


def parse_title_meta(title: str) -> dict[str, Any]:
    accounting = "unknown"
    if "IFRS" in title or "国際" in title:
        accounting = "IFRS"
    elif "米国基準" in title or "USGAAP" in title.upper():
        accounting = "USGAAP"
    elif "日本基準" in title:
        accounting = "JGAAP"

    consolidation = "unknown"
    if "連結" in title:
        consolidation = "consolidated"
    elif "単体" in title or "個別" in title:
        consolidation = "non_consolidated"

    fy_match = re.search(r"(20\d{2})年\s*(\d{1,2})月期", title)
    fiscal_year_label = None
    fy_end_month = None
    fy_end_year = None
    if fy_match:
        fy_end_year = int(fy_match.group(1))
        fy_end_month = int(fy_match.group(2))
        fiscal_year_label = f"{fy_end_year}-{fy_end_month:02d}"
    else:
        heisei = re.search(r"平成(\d+)年\s*(\d{1,2})月期", title)
        if heisei:
            # Heisei year + 1988 ≈ Gregorian; used only when title lacks Western year.
            fy_end_year = 1988 + int(heisei.group(1))
            fy_end_month = int(heisei.group(2))
            fiscal_year_label = f"{fy_end_year}-{fy_end_month:02d}"

    if re.search(r"第1四半期", title):
        quarter = 1
        period_basis = "Q1_cumulative"
    elif re.search(r"第2四半期|中間期", title):
        quarter = 2
        period_basis = "Q2_cumulative"
    elif re.search(r"第3四半期", title):
        quarter = 3
        period_basis = "Q3_cumulative"
    elif re.search(r"決算短信", title):
        quarter = 4
        period_basis = "full_year"
    else:
        quarter = None
        period_basis = "unknown"

    period_end = None
    if fy_end_year and fy_end_month and quarter:
        # Derive period end from fiscal year-end month without inventing announcement dates.
        if fy_end_month == 3:
            ends = {1: f"{fy_end_year - 1}-06-30", 2: f"{fy_end_year - 1}-09-30",
                    3: f"{fy_end_year - 1}-12-31", 4: f"{fy_end_year}-03-31"}
            period_end = ends[quarter]
        elif fy_end_month == 6:
            ends = {1: f"{fy_end_year - 1}-09-30", 2: f"{fy_end_year - 1}-12-31",
                    3: f"{fy_end_year}-03-31", 4: f"{fy_end_year}-06-30"}
            period_end = ends[quarter]
        elif fy_end_month == 12:
            ends = {1: f"{fy_end_year}-03-31", 2: f"{fy_end_year}-06-30",
                    3: f"{fy_end_year}-09-30", 4: f"{fy_end_year}-12-31"}
            period_end = ends[quarter]

    return {
        "accounting_standard": accounting,
        "consolidation": consolidation,
        "fiscal_year_label": fiscal_year_label,
        "fy_end_month": fy_end_month,
        "period_basis": period_basis,
        "fiscal_period_end": period_end,
    }


def announcement_from_doc_id(doc_id: str) -> str | None:
    match = re.match(r"1401(20\d{6})", doc_id)
    if not match:
        return None
    raw = match.group(1)
    return f"{raw[0:4]}-{raw[4:6]}-{raw[6:8]}"


def discover_edinet_code(security_id: str, html: str) -> str | None:
    match = re.search(rf'href="/(E\d+)/tdnet"', html)
    if match:
        return match.group(1)
    match = re.search(rf'href="/(E\d+)/reports"', html)
    return match.group(1) if match else None


def parse_tanshin_from_tdnet(html: str, security_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    # Prefer anchors whose title is an earnings release.
    for title, href in re.findall(
        r'title="([^"]*決算短信[^"]*)"\s+href="(/[^"]+)"',
        html,
    ):
        # Inventory primary earnings releases only (not supplements / corrections).
        if any(token in title for token in ("補足", "説明資料", "プレゼン", "Presentation", "訂正")):
            continue
        if not re.search(r"決算短信[〔\[]", title):
            continue
        doc_match = re.search(r"/(\d{3,4}[A-Z]?)/(\d{15,})", href)
        if not doc_match:
            continue
        code, doc_id = doc_match.group(1), doc_match.group(2)
        if code != security_id:
            continue
        meta = parse_title_meta(title)
        date = announcement_from_doc_id(doc_id)
        # Richer datetime often appears in sibling title text on detail pages; keep raw title.
        raw_dt = None
        dt_match = re.search(r"（(20\d{2}/\d{2}/\d{2})\s+(\d{1,2}:\d{2})提出）", title)
        if dt_match:
            y, m, d = dt_match.group(1).split("/")
            date = f"{y}-{m}-{d}"
            raw_dt = f"{dt_match.group(1)} {dt_match.group(2)}"
        events.append({
            "security_id": security_id,
            "doc_id": doc_id,
            "title": title,
            "irbank_path": href,
            "announcement_date": date,
            "announcement_datetime_raw": raw_dt or title,
            **meta,
        })
    # Deduplicate by doc_id
    uniq: dict[str, dict[str, Any]] = {}
    for event in events:
        uniq[event["doc_id"]] = event
    return list(uniq.values())


def parse_datetime_from_stock_page(html: str) -> dict[str, tuple[str, str]]:
    """Map document titles/snippets to (date, HH:MM) from IR news style titles."""
    found: dict[str, tuple[str, str]] = {}
    for title in re.findall(r'title="([^"]*決算短信[^"]*提出）)"', html):
        match = re.search(
            r"（(20\d{2})/(\d{2})/(\d{2})\s+(\d{1,2}):(\d{2})提出）",
            title,
        )
        if not match:
            continue
        date = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
        hhmm = f"{int(match.group(4)):02d}:{match.group(5)}"
        # Key by shortened earnings title body
        body = re.sub(r"（20\d{2}/\d{2}/\d{2}\s+\d{1,2}:\d{2}提出）", "", title).strip()
        found[body] = (date, hhmm)
    return found


def schemas() -> dict[str, dict[str, Any]]:
    common = {"type": "object", "additionalProperties": False}
    return {
        "official_earnings_event": {
            **common,
            "required": [
                "event_id", "security_id", "announcement_date", "announcement_time",
                "timezone", "timestamp_quality", "fiscal_period_end", "period_basis",
                "consolidation", "accounting_standard", "source_id",
                "source_priority_used", "inventory_status",
            ],
        },
        "earnings_event_document": {
            **common,
            "required": [
                "document_id", "event_id", "source_id", "provider",
                "source_priority", "url", "document_type", "retrieved_at",
            ],
        },
        "security_reporting_regime": {
            **common,
            "required": [
                "regime_id", "security_id", "effective_from", "fiscal_year_end_month",
                "accounting_standard", "break_kind", "quality_status",
            ],
        },
        "event_reconciliation": {
            **common,
            "required": [
                "reconciliation_id", "match_status", "match_keys_used",
                "gemini_value", "cursor_value", "difference_note",
            ],
        },
    }


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists() or path.stat().st_size == 0:
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def collect_security(security_id: str, as_of: str, verify_jpx: bool) -> dict[str, Any]:
    stock_url = f"https://irbank.net/{security_id}"
    result: dict[str, Any] = {
        "security_id": security_id,
        "status": "ok",
        "events": [],
        "documents": [],
        "provenance": [],
        "regime": None,
        "errors": [],
    }
    try:
        stock_html = fetch(stock_url)
    except Exception as exc:
        result["status"] = "source_unavailable"
        result["errors"].append(f"stock_page:{type(exc).__name__}:{exc}")
        return result

    edinet = discover_edinet_code(security_id, stock_html)
    datetime_map = parse_datetime_from_stock_page(stock_html)
    tdnet_html = ""
    tdnet_url = f"https://irbank.net/{edinet}/tdnet" if edinet else ""
    if edinet:
        try:
            tdnet_html = fetch(tdnet_url)
        except Exception as exc:
            result["errors"].append(f"tdnet_page:{type(exc).__name__}:{exc}")
    parsed = parse_tanshin_from_tdnet(tdnet_html or stock_html, security_id)
    retrieved_at = utc_now()

    fy_months = {item["fy_end_month"] for item in parsed if item.get("fy_end_month")}
    fy_month = next(iter(fy_months)) if len(fy_months) == 1 else FY_END_HINT.get(security_id)
    standards = {item["accounting_standard"] for item in parsed if item["accounting_standard"] != "unknown"}
    accounting = next(iter(standards)) if len(standards) == 1 else "unknown"
    result["regime"] = {
        "regime_id": stable_id("regime", security_id, fy_month, accounting),
        "security_id": security_id,
        "effective_from": "2020-01-01",
        "effective_to": None,
        "fiscal_year_end_month": fy_month,
        "consolidation_default": "consolidated",
        "accounting_standard": accounting,
        "break_kind": "none" if len(standards) <= 1 else "accounting_standard_change",
        "evidence_source_id": stable_id("source", "irbank-tdnet", security_id, edinet or "unknown"),
        "quality_status": "confirmed" if fy_months else "not_investigated",
        "notes": f"edinet_code={edinet}; title-derived FY months={sorted(fy_months)}",
    }

    for item in parsed:
        date = item["announcement_date"]
        if not date or date < "2020-01-01" or date > as_of:
            continue
        listing = LISTING_START.get(security_id)
        inventory_status = "candidate"
        if listing and date < listing:
            # Pre-listing disclosures may exist; mark explicitly.
            inventory_status = "candidate"

        # Attach richer datetime raw from stock-page map when titles match.
        for body, (mapped_date, mapped_time) in datetime_map.items():
            if body in item["title"] or item["title"] in body:
                date = mapped_date
                item["announcement_date"] = mapped_date
                item["announcement_datetime_raw"] = f"{mapped_date.replace('-', '/')} {mapped_time}"
                break

        jpx_url = jpx_pdf_url(security_id, item["doc_id"])
        irbank_url = f"https://irbank.net{item['irbank_path']}"
        pdf_mirror = f"https://f.irbank.net/pdf/{date.replace('-', '')}/{item['doc_id']}.pdf" if date else None
        jpx_exists = head_ok(jpx_url) if verify_jpx else False

        if jpx_exists:
            provider = "tdnet"
            source_priority = 1
            primary_url = jpx_url
            # Time still originates from secondary aggregator text → do not mark datetime_confirmed.
            timestamp_quality = "date_only"
            inventory_status = "confirmed"
        else:
            provider = "secondary"
            source_priority = 4
            primary_url = irbank_url
            timestamp_quality = "date_only"
            inventory_status = "candidate"

        source_id = stable_id("source", provider, security_id, item["doc_id"], primary_url)
        event_id = stable_id(
            "official-event",
            security_id,
            item.get("fiscal_period_end") or "unknown-period",
            item["period_basis"],
            date,
            item["doc_id"],
        )
        result["provenance"].append({
            "source_id": source_id,
            "provider": f"IRBANK→{provider}",
            "url": primary_url,
            "retrieved_at": retrieved_at,
            "content_hash": None,
            "quality_status": "primary" if source_priority == 1 else "secondary",
            "license_note": "Secondary aggregator used for inventory; JPX PDF preferred when verified.",
        })
        result["events"].append({
            "event_id": event_id,
            "security_id": security_id,
            "announcement_date": date,
            "announcement_time": None,
            "timezone": JST,
            "timestamp_quality": timestamp_quality,
            "announcement_datetime_raw": item["announcement_datetime_raw"],
            "fiscal_year_label": item["fiscal_year_label"],
            "fiscal_period_end": item["fiscal_period_end"],
            "period_basis": item["period_basis"],
            "consolidation": item["consolidation"],
            "accounting_standard": item["accounting_standard"],
            "source_id": source_id,
            "source_priority_used": source_priority,
            "inventory_status": inventory_status,
            "document_count": 1,
            "doc_id": item["doc_id"],
            "title": item["title"],
        })
        docs = [
            {
                "document_id": stable_id("doc", item["doc_id"], primary_url),
                "event_id": event_id,
                "source_id": source_id,
                "provider": provider,
                "source_priority": source_priority,
                "url": primary_url,
                "document_title_raw": item["title"],
                "document_type": "earnings_release",
                "filed_at_raw": item["announcement_datetime_raw"],
                "content_hash": None,
                "retrieved_at": retrieved_at,
            }
        ]
        if pdf_mirror and primary_url != pdf_mirror:
            docs.append({
                "document_id": stable_id("doc", item["doc_id"], pdf_mirror),
                "event_id": event_id,
                "source_id": source_id,
                "provider": "secondary",
                "source_priority": 4,
                "url": pdf_mirror,
                "document_title_raw": item["title"],
                "document_type": "earnings_release",
                "filed_at_raw": item["announcement_datetime_raw"],
                "content_hash": None,
                "retrieved_at": retrieved_at,
            })
        if irbank_url != primary_url:
            docs.append({
                "document_id": stable_id("doc", item["doc_id"], irbank_url),
                "event_id": event_id,
                "source_id": source_id,
                "provider": "secondary",
                "source_priority": 4,
                "url": irbank_url,
                "document_title_raw": item["title"],
                "document_type": "earnings_release",
                "filed_at_raw": item["announcement_datetime_raw"],
                "content_hash": None,
                "retrieved_at": retrieved_at,
            })
        result["documents"].extend(docs)
        result["events"][-1]["document_count"] = len(docs)

    if not result["events"] and result["status"] == "ok":
        result["status"] = "unresolved"
        result["errors"].append("No 2020+ 決算短信 rows parsed from IRBANK TDnet inventory.")
    return result


def gemini_period_basis(raw: str) -> str:
    value = (raw or "").strip()
    if "予想" in value:
        return "forecast"
    if "累計" in value or value in {"Q1", "Q2", "Q3"}:
        if value.startswith("Q1") or "第1" in value:
            return "Q1_cumulative"
        if value.startswith("Q2") or "第2" in value:
            return "Q2_cumulative"
        if value.startswith("Q3") or "第3" in value:
            return "Q3_cumulative"
        return f"{value}_unknown_basis"
    if "通期" in value:
        return "full_year"
    return "unknown"


def reconcile(
    official_events: list[dict[str, Any]],
    phase_a_events: list[dict[str, Any]],
    raw_rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    # Index official by composite keys (never date alone).
    by_key: dict[tuple, list[dict[str, Any]]] = defaultdict(list)
    for event in official_events:
        key = (
            event["security_id"],
            event["announcement_date"],
            event.get("fiscal_period_end"),
            event.get("period_basis"),
        )
        by_key[key].append(event)

    matched_official: set[str] = set()
    matched_raw: set[int] = set()

    for raw_event in phase_a_events:
        raw_row_id = raw_event.get("raw_row_id")
        security_id = raw_event["security_id"]
        date = raw_event.get("announcement_date")
        period_end = raw_event.get("period_end")
        basis = gemini_period_basis(raw_event.get("period_basis") or "")
        # Also try raw period_basis field directly when already normalized-ish.
        candidates = []
        for key, events in by_key.items():
            if key[0] != security_id or key[1] != date:
                continue
            # Require period evidence beyond date.
            period_ok = False
            if period_end and key[2] == period_end:
                period_ok = True
            if basis != "unknown" and key[3] == basis:
                period_ok = True
            if raw_event.get("period_basis") and key[3] == raw_event.get("period_basis"):
                period_ok = True
            if not period_ok:
                continue
            candidates.extend(events)

        gemini_value = {
            "raw_row_id": raw_row_id,
            "announcement_date": date,
            "fiscal_period_raw": raw_event.get("fiscal_period_raw"),
            "period_basis": raw_event.get("period_basis"),
            "period_end": period_end,
            "url": raw_event.get("official_document_url"),
        }

        if not date or not (period_end or raw_event.get("period_basis")):
            rows.append({
                "reconciliation_id": stable_id("recon", "unmatched-raw-weakkey", raw_row_id),
                "raw_row_id": raw_row_id,
                "official_event_id": None,
                "match_status": "unmatched",
                "match_keys_used": ["insufficient_non_date_keys"],
                "gemini_value": gemini_value,
                "cursor_value": None,
                "difference_note": "Date-only or missing fiscal keys; date-only join forbidden.",
            })
            continue

        if not candidates:
            rows.append({
                "reconciliation_id": stable_id("recon", "unmatched-raw", raw_row_id, security_id, date),
                "raw_row_id": raw_row_id,
                "official_event_id": None,
                "match_status": "unmatched",
                "match_keys_used": ["security_id", "announcement_date", "fiscal_period_or_basis"],
                "gemini_value": gemini_value,
                "cursor_value": None,
                "difference_note": "No official event with matching security+date+period keys.",
            })
            continue

        # Choose best candidate: prefer exact period_end+basis.
        exact = [
            event for event in candidates
            if event.get("fiscal_period_end") == period_end
            and event.get("period_basis") in {basis, raw_event.get("period_basis")}
        ]
        chosen = exact[0] if len(exact) == 1 else candidates[0]
        status = "exact" if len(exact) == 1 else "candidate"
        if len(candidates) > 1 and not exact:
            status = "candidate"
        matched_official.add(chosen["event_id"])
        if raw_row_id is not None:
            matched_raw.add(int(raw_row_id))
        rows.append({
            "reconciliation_id": stable_id("recon", status, raw_row_id, chosen["event_id"]),
            "raw_row_id": raw_row_id,
            "official_event_id": chosen["event_id"],
            "match_status": status,
            "match_keys_used": ["security_id", "announcement_date", "fiscal_period_end_or_basis"],
            "gemini_value": gemini_value,
            "cursor_value": {
                "event_id": chosen["event_id"],
                "announcement_date": chosen["announcement_date"],
                "fiscal_period_end": chosen.get("fiscal_period_end"),
                "period_basis": chosen.get("period_basis"),
                "title": chosen.get("title"),
            },
            "difference_note": None if status == "exact" else "Partial key agreement; human review retained.",
        })

    for event in official_events:
        if event["event_id"] in matched_official:
            continue
        rows.append({
            "reconciliation_id": stable_id("recon", "unmatched-official", event["event_id"]),
            "raw_row_id": None,
            "official_event_id": event["event_id"],
            "match_status": "unmatched",
            "match_keys_used": ["official_only"],
            "gemini_value": None,
            "cursor_value": {
                "event_id": event["event_id"],
                "security_id": event["security_id"],
                "announcement_date": event["announcement_date"],
                "fiscal_period_end": event.get("fiscal_period_end"),
                "period_basis": event.get("period_basis"),
            },
            "difference_note": "Official event has no Gemini raw counterpart.",
        })
    return rows


def build_summary(
    ledger_sha: str,
    as_of: str,
    events: list[dict[str, Any]],
    recon: list[dict[str, Any]],
    per_security_status: dict[str, Any],
) -> dict[str, Any]:
    by_sec = Counter(event["security_id"] for event in events)
    tq = Counter(event["timestamp_quality"] for event in events)
    rs = Counter(row["match_status"] for row in recon)
    missing_reasons = Counter()
    for code in UNIVERSE:
        status = per_security_status.get(code, {})
        if by_sec.get(code, 0) == 0:
            missing_reasons[status.get("status", "unresolved")] += 1
    return {
        "phase": "A-next-official-events",
        "generated_at": utc_now(),
        "as_of": as_of,
        "gemini_raw_sha256": ledger_sha,
        "universe": list(UNIVERSE),
        "official_event_count": len(events),
        "official_events_by_security": dict(sorted(by_sec.items())),
        "timestamp_quality": dict(sorted(tq.items())),
        "reconciliation": dict(sorted(rs.items())),
        "securities_without_official_events": [code for code in UNIVERSE if by_sec.get(code, 0) == 0],
        "collection_status_by_security": per_security_status,
        "missing_reason_counts": dict(missing_reasons),
        "phase_a_compatibility": {
            "earnings_event_candidates_preserved": True,
            "raw_external_preserved": True,
            "market_observation_preserved": True,
            "legacy_reconciliation_untouched": True,
        },
        "completion_verdict": "modify",
        "unresolved": [
            "EDINET API key path not used; inventory currently IRBANK-mediated.",
            "Announcement times from secondary text are retained only in announcement_datetime_raw.",
            "datetime_confirmed requires issuer/TDnet primary timestamp elevation.",
            "Fiscal-year-end remains title-derived / hint where not singularly evidenced.",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--as-of", default=datetime.now().date().isoformat())
    parser.add_argument("--phase-a-dir", type=Path, default=PHASE_A)
    parser.add_argument("--verify-jpx", action="store_true", help="HEAD-check JPX PDF URLs (slower).")
    parser.add_argument("--securities", nargs="*", default=list(UNIVERSE))
    args = parser.parse_args()

    phase_a = args.phase_a_dir.resolve()
    facts_dir = phase_a / "facts"
    schema_dir = phase_a / "schemas"
    if not LEDGER.exists():
        raise FileNotFoundError(LEDGER)
    ledger_sha = sha256(LEDGER)
    if ledger_sha != EXPECTED_SHA:
        raise RuntimeError(f"Gemini ledger SHA mismatch: {ledger_sha}")

    phase_a_events = load_jsonl(facts_dir / "earnings_event.jsonl")
    raw_rows = load_jsonl(phase_a / "raw_external" / "gemini_kessan_ledger_rows.jsonl")

    all_events: list[dict[str, Any]] = []
    all_docs: list[dict[str, Any]] = []
    all_prov: list[dict[str, Any]] = []
    regimes: list[dict[str, Any]] = []
    per_status: dict[str, Any] = {}

    for code in args.securities:
        print(json.dumps({"collecting": code}, ensure_ascii=False), flush=True)
        collected = collect_security(code, args.as_of, verify_jpx=args.verify_jpx)
        per_status[code] = {
            "status": collected["status"],
            "event_count": len(collected["events"]),
            "errors": collected["errors"],
        }
        all_events.extend(collected["events"])
        all_docs.extend(collected["documents"])
        all_prov.extend(collected["provenance"])
        if collected["regime"]:
            regimes.append(collected["regime"])

    # Drop helper fields not in schema-facing export.
    export_events = []
    for event in all_events:
        export_events.append({k: v for k, v in event.items() if k not in {"doc_id", "title"} or k in event})
        # keep title for reconciliation/debug in summary path via separate field already in cursor_value
    # Actually keep title out of strict schema by moving to documents only.
    clean_events = []
    for event in all_events:
        clean = {k: v for k, v in event.items() if k not in {"doc_id"}}
        clean_events.append(clean)

    recon = reconcile(clean_events, phase_a_events, raw_rows)

    for name, schema in schemas().items():
        write_json(schema_dir / f"{name}.schema.json", schema)
    write_jsonl(facts_dir / "official_earnings_event.jsonl", [
        {k: v for k, v in event.items() if k != "title"} for event in clean_events
    ])
    write_jsonl(facts_dir / "earnings_event_document.jsonl", all_docs)
    write_jsonl(facts_dir / "security_reporting_regime.jsonl", regimes)
    write_jsonl(facts_dir / "event_reconciliation.jsonl", recon)

    # Append provenance without rewriting Gemini rows.
    existing_prov = load_jsonl(facts_dir / "source_provenance.jsonl")
    write_jsonl(facts_dir / "source_provenance.jsonl", existing_prov + all_prov)

    summary = build_summary(ledger_sha, args.as_of, clean_events, recon, per_status)
    # include source URL sample list
    summary["source_ids_sample"] = [
        {"source_id": row["source_id"], "url": row["url"], "provider": row["provider"]}
        for row in all_prov[:30]
    ]
    write_json(phase_a / "official_event_summary.json", summary)

    after = sha256(LEDGER)
    if after != ledger_sha:
        raise RuntimeError("Gemini ledger changed during collection.")
    print(json.dumps({
        "official_events": len(clean_events),
        "documents": len(all_docs),
        "reconciliation": summary["reconciliation"],
        "gemini_raw_sha256": ledger_sha,
        "securities_without_official_events": summary["securities_without_official_events"],
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
