"""Resolve official-event identity and directional Gemini reconciliation.

This is a Fact-only correction pass. It preserves all existing official
event_ids (345-event population), Gemini raw rows, and raw CSV hash. It does
not calculate market reaction or any investment-analysis output.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import time
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
UNIVERSE = (
    "5803", "285A", "6857", "6146", "6920", "4062", "6525",
    "5801", "8035", "7735", "3436", "7011", "7012", "8306",
)
USER_AGENT = {"User-Agent": "SOX-AUTO-identity-reconciliation/1.0 (+research; fact-only)"}

PERIOD_BASES = {
    "Q1_standalone", "Q2_standalone", "Q3_standalone",
    "Q1_cumulative", "Q2_cumulative", "Q3_cumulative",
    "full_year", "forecast_only", "revision_only", "other", "unknown",
}


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists() or not path.stat().st_size:
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def stable_id(*parts: object) -> str:
    return hashlib.sha256("|".join(str(part) for part in parts).encode("utf-8")).hexdigest()[:32]


def parse_ymd(text: str | None) -> str | None:
    if not text:
        return None
    match = re.search(r"(20\d{2})[/-](\d{1,2})[/-](\d{1,2})", text)
    if not match:
        # Some archived pages declare UTF-8 but return Japanese text through a
        # legacy encoding. The numeric components remain usable; this is not
        # a date inference.
        match = re.search(r"(20\d{2})\D+(\d{1,2})\D+(\d{1,2})", text)
    if not match:
        return None
    return f"{match.group(1)}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"


def document_id_from_url(value: str | None) -> str | None:
    if not value:
        return None
    match = re.search(r"(1401\d{14,})", value)
    return match.group(1) if match else None


def normalize_official_basis(value: str | None) -> str:
    # Current official output only has actual earnings-release identities.
    return value if value in PERIOD_BASES else "unknown"


def normalize_gemini_basis(columns: dict[str, str]) -> tuple[str, str, str]:
    """Return (normalized, raw_label, reason), never inventing a basis."""
    label = (columns.get("四半期区分") or "").strip()
    raw_period = (columns.get("対象会計期間") or "").strip()
    text = f"{label} {raw_period}"

    if "修正" in label or "業績予想修正" in text:
        return "revision_only", label, "explicit revision label"
    if "予想" in label or "予想" in raw_period:
        return "forecast_only", label, "explicit forecast label"
    if "通期" in label or "通期" in raw_period:
        return "full_year", label, "explicit full-year label"

    quarter_match = re.search(r"(?:Q|第)([123])(?:四半期)?", text)
    if not quarter_match:
        return "unknown", label, "quarter not explicit"
    quarter = quarter_match.group(1)
    if "累計" in text:
        return f"Q{quarter}_cumulative", label, "explicit cumulative label"
    if "単体" in text or "単独" in text:
        return f"Q{quarter}_standalone", label, "explicit standalone label"
    # Q1 is often arithmetically the same, but the source has not identified
    # the reporting basis. Do not choose a representation.
    return "unknown", label, "reporting basis not explicit"


def raw_period_end(columns: dict[str, str]) -> str | None:
    value = columns.get("対象会計期間") or ""
    dates = re.findall(r"(20\d{2})/(\d{2})/(\d{2})", value)
    if not dates:
        return None
    year, month, day = dates[-1]
    return f"{year}-{month}-{day}"


def raw_row_identities(raw_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    identities: list[dict[str, Any]] = []
    for raw in raw_rows:
        columns = raw["columns"]
        basis, basis_raw, basis_reason = normalize_gemini_basis(columns)
        date = parse_ymd(columns.get("決算発表日"))
        scope = "in_scope" if date and date >= "2020-01-01" else "outside_window_or_unresolved"
        identities.append({
            "raw_row_id": raw["raw_row_id"],
            "security_id": (columns.get("銘柄コード") or "").strip(),
            "announcement_date": date,
            "announcement_date_raw": columns.get("決算発表日"),
            "fiscal_period_end": raw_period_end(columns),
            "fiscal_period_raw": columns.get("対象会計期間"),
            "period_basis": basis,
            "period_basis_raw": basis_raw,
            "basis_reason": basis_reason,
            "source_url": columns.get("決算資料URL"),
            "document_id": document_id_from_url(columns.get("決算資料URL")),
            "scope_status": scope,
        })
    return identities


def fetch_detail_date(code: str, document_id: str) -> tuple[str | None, str | None]:
    """Read date only from IRBANK document metadata; never return/use time."""
    url = f"https://irbank.net/{code}/{document_id}"
    request = urllib.request.Request(url, headers=USER_AGENT)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            body = response.read().decode("utf-8", "replace")
    except Exception:
        return None, None
    decoded = html.unescape(body)
    match = re.search(r"【日時】</dt>\s*<dd>([^<]+)</dd>", decoded)
    if match:
        raw = match.group(1).strip()
        return parse_ymd(raw), raw
    # OpenGraph / structured document metadata can be mojibake despite its
    # numeric date being intact. Only accept an explicit date+time sequence;
    # use the date and retain the exact raw sequence. Time is still not used.
    match = re.search(r"(20\d{2}\D+\d{1,2}\D+\d{1,2}\D+\d{1,2}\D+\d{2})", decoded)
    return (parse_ymd(match.group(1)), match.group(1)) if match else (None, None)


def enrich_event_dates(
    events: list[dict[str, Any]], documents: list[dict[str, Any]], *,
    fetch_dates: bool,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    docs_by_event: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for document in documents:
        docs_by_event[document["event_id"]].append(document)

    resolutions: list[dict[str, Any]] = []
    for event in events:
        old_date = event.get("announcement_date")
        docs = docs_by_event.get(event["event_id"], [])
        doc_id = next((document_id_from_url(d.get("url")) for d in docs if document_id_from_url(d.get("url"))), None)
        corrected_date = None
        raw_datetime = None
        method = "not_fetched"
        if fetch_dates and doc_id:
            corrected_date, raw_datetime = fetch_detail_date(event["security_id"], doc_id)
            method = "secondary_document_metadata" if corrected_date else "metadata_unavailable"
            time.sleep(0.10)
        if corrected_date:
            event["announcement_date"] = corrected_date
            event["announcement_datetime_raw"] = raw_datetime
        # This pass is deliberately date-only. A secondary displayed time must not
        # affect announcement_time or timestamp_quality.
        event["announcement_time"] = None
        event["timestamp_quality"] = "date_only"
        event["period_basis_raw"] = event.get("period_basis")
        event["period_basis"] = normalize_official_basis(event.get("period_basis"))
        resolutions.append({
            "resolution_id": stable_id("identity", event["event_id"], old_date, event["announcement_date"]),
            "event_id": event["event_id"],
            "old_announcement_date": old_date,
            "new_announcement_date": event["announcement_date"],
            "event_id_preserved": True,
            "source_document_id": doc_id,
            "date_resolution_method": method,
            "timestamp_preserved_as": "date_only",
            "reason": "Corrected date from document metadata; no time promoted from a secondary source." if corrected_date and corrected_date != old_date else "No event identity merge or deletion.",
        })
    return events, resolutions


def recon_row(
    status: str, raw: dict[str, Any] | None, official: dict[str, Any] | None,
    reason: str, keys: list[str],
) -> dict[str, Any]:
    return {
        "reconciliation_id": stable_id("reconciliation", status, raw and raw["raw_row_id"], official and official["event_id"]),
        "raw_row_id": raw["raw_row_id"] if raw else None,
        "official_event_id": official["event_id"] if official else None,
        "match_status": status,
        "match_keys_used": keys,
        "resolution_reason": reason,
        "gemini_value": raw,
        "cursor_value": official,
        "difference_note": None if status == "exact" else reason,
    }


def reconcile(rows: list[dict[str, Any]], events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_document: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    by_composite: dict[tuple[str, str | None, str | None, str], list[dict[str, Any]]] = defaultdict(list)
    for event in events:
        key = (
            event["security_id"], event.get("announcement_date"),
            event.get("fiscal_period_end"), event.get("period_basis"),
        )
        by_composite[key].append(event)
        # documents are represented separately, but event document id is preserved
        # in the source URL relation and reconstructed below by title-less lookup.

    # Build doc IDs from current source documents in an outer closure-like property.
    docs_path = PHASE_A / "facts" / "earnings_event_document.jsonl"
    for document in read_jsonl(docs_path):
        doc_id = document_id_from_url(document.get("url"))
        if doc_id:
            event = next((candidate for candidate in events if candidate["event_id"] == document["event_id"]), None)
            if event:
                by_document[(event["security_id"], doc_id)].append(event)

    output: list[dict[str, Any]] = []
    matched_events: set[str] = set()
    for raw in rows:
        if raw["scope_status"] != "in_scope":
            output.append(recon_row(
                "gemini_only", raw, None,
                "Gemini raw row is outside the 2020+ official-event window or its announcement date is unresolved.",
                ["scope_status"],
            ))
            continue
        if not raw["announcement_date"] or not raw["fiscal_period_end"]:
            output.append(recon_row(
                "unresolved", raw, None,
                "Insufficient identity evidence: date or fiscal period end is unresolved; date-only join is prohibited.",
                ["security_id"],
            ))
            continue

        doc_candidates = by_document.get((raw["security_id"], raw["document_id"]), []) if raw["document_id"] else []
        # An event has JPX, IRBANK detail, and PDF-mirror documents. Those are
        # multiple provenance rows for one event, not ambiguous event matches.
        doc_candidates = list({event["event_id"]: event for event in doc_candidates}.values())
        if len(doc_candidates) == 1:
            event = doc_candidates[0]
            matched_events.add(event["event_id"])
            if raw["period_basis"] == event["period_basis"]:
                output.append(recon_row(
                    "exact", raw, event,
                    "Same security, same source document, same fiscal period end, and same normalized period basis.",
                    ["security_id", "document_id", "fiscal_period_end", "period_basis"],
                ))
            elif raw["period_basis"] in {"forecast_only", "revision_only"}:
                output.append(recon_row(
                    "candidate", raw, event,
                    "Same source document but Gemini row is a forecast/revision component, not the release identity.",
                    ["security_id", "document_id"],
                ))
            else:
                output.append(recon_row(
                    "candidate", raw, event,
                    "Same source document but reporting basis is not explicitly compatible.",
                    ["security_id", "document_id", "fiscal_period_end"],
                ))
            continue

        composite = by_composite.get((
            raw["security_id"], raw["announcement_date"], raw["fiscal_period_end"], raw["period_basis"],
        ), [])
        if len(composite) == 1:
            event = composite[0]
            matched_events.add(event["event_id"])
            output.append(recon_row(
                "exact", raw, event,
                "Security, corrected announcement date, fiscal period end, and explicit normalized basis agree.",
                ["security_id", "announcement_date", "fiscal_period_end", "period_basis"],
            ))
        elif len(composite) > 1:
            output.append(recon_row(
                "candidate", raw, None,
                "Multiple official events meet the composite key; no automatic event selection.",
                ["security_id", "announcement_date", "fiscal_period_end", "period_basis"],
            ))
        else:
            output.append(recon_row(
                "gemini_only", raw, None,
                "No official event meets document or full composite identity; retained as Gemini-only.",
                ["security_id", "announcement_date", "fiscal_period_end", "period_basis"],
            ))

    for event in events:
        if event["event_id"] not in matched_events:
            output.append(recon_row(
                "official_only", None, event,
                "Official event has no Gemini raw row with a full identity match; normal because Gemini coverage is partial.",
                ["official_event_id"],
            ))
    return output


def quality_report(
    events: list[dict[str, Any]], raw_rows: list[dict[str, Any]], recon: list[dict[str, Any]],
    identity_resolutions: list[dict[str, Any]], ledger_sha: str,
) -> dict[str, Any]:
    events_by = defaultdict(list)
    raws_by = defaultdict(list)
    recon_by = defaultdict(list)
    for event in events:
        events_by[event["security_id"]].append(event)
    for raw in raw_rows:
        raws_by[raw["security_id"]].append(raw)
    for item in recon:
        code = (item.get("cursor_value") or item.get("gemini_value") or {}).get("security_id")
        if code:
            recon_by[code].append(item)
    by_security = {}
    for code in UNIVERSE:
        evs = events_by[code]
        rws = raws_by[code]
        recs = recon_by[code]
        status_counts = Counter(item["match_status"] for item in recs)
        by_security[code] = {
            "official_event_count": len(evs),
            "gemini_raw_row_count": len(rws),
            "exact": status_counts["exact"],
            "candidate": status_counts["candidate"],
            "conflict": status_counts["conflict"],
            "official_only": status_counts["official_only"],
            "gemini_only": status_counts["gemini_only"],
            "unresolved": status_counts["unresolved"],
            "period_basis_unknown_count": sum(event["period_basis"] == "unknown" for event in evs)
                + sum(raw["period_basis"] == "unknown" for raw in rws),
            "fiscal_period_end_unknown_count": sum(not event.get("fiscal_period_end") for event in evs)
                + sum(not raw.get("fiscal_period_end") for raw in rws),
            "timestamp_quality": dict(Counter(event["timestamp_quality"] for event in evs)),
        }
    changed_dates = sum(
        item["old_announcement_date"] != item["new_announcement_date"]
        for item in identity_resolutions
    )
    return {
        "generated_at": now_utc(),
        "purpose": "Fact-only official-event identity and Gemini reconciliation quality",
        "gemini_raw_sha256": ledger_sha,
        "official_event_count_before": len(events),
        "official_event_count_after": len(events),
        "event_ids_preserved": True,
        "event_identity_changes": {
            "date_corrected_from_document_metadata": changed_dates,
            "merged_or_deleted_event_count": 0,
        },
        "reconciliation_totals": dict(Counter(item["match_status"] for item in recon)),
        "by_security": by_security,
        "unmatched_431_interpretation": {
            "official_only": sum(item["match_status"] == "official_only" for item in recon),
            "gemini_only": sum(item["match_status"] == "gemini_only" for item in recon),
            "unresolved": sum(item["match_status"] == "unresolved" for item in recon),
            "note": "These directional states replace the previous undifferentiated unmatched count.",
        },
        "verdict": "modify",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase-a-dir", type=Path, default=PHASE_A)
    parser.add_argument("--fetch-detail-dates", action="store_true")
    args = parser.parse_args()
    phase_a = args.phase_a_dir.resolve()
    facts = phase_a / "facts"
    schemas = phase_a / "schemas"

    before_sha = digest(LEDGER)
    if before_sha != EXPECTED_SHA:
        raise RuntimeError(f"Gemini SHA mismatch: {before_sha}")
    events = read_jsonl(facts / "official_earnings_event.jsonl")
    documents = read_jsonl(facts / "earnings_event_document.jsonl")
    raw_rows = raw_row_identities(read_jsonl(phase_a / "raw_external" / "gemini_kessan_ledger_rows.jsonl"))
    prior_identities = read_jsonl(facts / "event_identity_resolution.jsonl")
    if len(events) != 345:
        raise RuntimeError(f"Expected preserved 345 official events, got {len(events)}")

    event_ids_before = {event["event_id"] for event in events}
    events, current_identities = enrich_event_dates(events, documents, fetch_dates=args.fetch_detail_dates)
    # Preserve the first observed before→after mapping across later reconciliation
    # reruns; event IDs never change.
    prior_by_event = {item["event_id"]: item for item in prior_identities}
    identities = [
        prior_by_event.get(item["event_id"], item)
        for item in current_identities
    ]
    identity_by_event = {item["event_id"]: item for item in identities}
    for event in events:
        resolution = identity_by_event[event["event_id"]]
        if resolution["date_resolution_method"] == "secondary_document_metadata":
            event["announcement_date_source_priority"] = 4
            event["announcement_date_provenance_status"] = "secondary_metadata"
        else:
            event["announcement_date_source_priority"] = None
            event["announcement_date_provenance_status"] = "identifier_date_unverified"
    if {event["event_id"] for event in events} != event_ids_before:
        raise RuntimeError("Official event IDs changed unexpectedly.")
    recon = reconcile(raw_rows, events)
    report = quality_report(events, raw_rows, recon, identities, before_sha)

    reconciliation_schema = {
        "type": "object",
        "additionalProperties": False,
        "required": [
            "reconciliation_id", "raw_row_id", "official_event_id", "match_status",
            "match_keys_used", "resolution_reason", "gemini_value", "cursor_value",
            "difference_note",
        ],
        "match_status_enum": [
            "exact", "candidate", "conflict", "official_only", "gemini_only", "unresolved",
        ],
    }
    identity_schema = {
        "type": "object",
        "additionalProperties": False,
        "required": [
            "resolution_id", "event_id", "old_announcement_date", "new_announcement_date",
            "event_id_preserved", "date_resolution_method", "timestamp_preserved_as", "reason",
        ],
    }
    official_schema_path = schemas / "official_earnings_event.schema.json"
    official_schema = json.loads(official_schema_path.read_text(encoding="utf-8"))
    required = set(official_schema.get("required", []))
    required.update({"announcement_date_source_priority", "announcement_date_provenance_status"})
    official_schema["required"] = sorted(required)
    write_json(schemas / "event_reconciliation.schema.json", reconciliation_schema)
    write_json(schemas / "event_identity_resolution.schema.json", identity_schema)
    write_json(official_schema_path, official_schema)
    write_jsonl(facts / "official_earnings_event.jsonl", events)
    write_jsonl(facts / "gemini_earnings_identity.jsonl", raw_rows)
    write_jsonl(facts / "event_identity_resolution.jsonl", identities)
    write_jsonl(facts / "event_reconciliation.jsonl", recon)
    write_json(phase_a / "earnings_reconciliation_quality.json", report)

    after_sha = digest(LEDGER)
    if after_sha != before_sha:
        raise RuntimeError("Gemini raw ledger changed during identity reconciliation.")
    print(json.dumps({
        "official_events": len(events),
        "reconciliation": report["reconciliation_totals"],
        "corrected_dates": report["event_identity_changes"]["date_corrected_from_document_metadata"],
        "gemini_sha256": after_sha,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
