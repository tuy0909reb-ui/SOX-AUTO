"""Prepare additive Financial Fact pilot relations without bulk collection.

This consumes the bounded V002 source manifest only. It writes canonical
schemas, a pilot-scoped official-document inventory, and an empty evidence
repair relation. It never mutates Gemini, official events, or existing facts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import urllib.request
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from pypdf import PdfReader

from financial_fact_contract import financial_fact_schemas

ROOT = Path(__file__).resolve().parents[2]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
UA = {"User-Agent": "SOX-AUTO-financial-fact-pilot-prep/1.0 (+research; fact-layer-only)"}
PILOT_7011 = {
    "event_id": "official-event-7d68553c9dc55def9581a5b845e6555f",
    "url": "https://www2.jpx.co.jp/disc/70110/140120250425523602.pdf",
    "publication_date": "2025-05-09",
    "document_type": "earnings_release",
    "document_role": "primary_result",
}
PILOT_DOCUMENT_METADATA = {
    "https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf": ("advantest", "primary_result", "eligible"),
    "https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf": ("advantest", "revision_detail", "eligible"),
    "https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf": ("tokyo_electron", "primary_result", "deferred_outlook_no_company_forecast"),
    "https://www2.jpx.co.jp/disc/34360/140120260805509445.pdf": ("sumco", "primary_result", "eligible"),
    "https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf": ("mufg", "primary_result", "eligible"),
    "https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf": ("mufg", "restatement_or_review", "review_only_no_auto_merge"),
    "https://www2.jpx.co.jp/disc/70110/140120250425523602.pdf": ("mhi", "primary_result", "repair_evidence_only"),
}


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(str(part) for part in parts)).hex}"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inventory_rows(
    sources: list[dict[str, Any]],
    events: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    hash_counts: dict[str, int] = {}
    for source in sources:
        hash_counts[source["content_hash"]] = hash_counts.get(source["content_hash"], 0) + 1
    rows = []
    for source in sources:
        snapshot = ROOT / source["local_snapshot_path"]
        if not snapshot.is_file() or sha256(snapshot) != source["content_hash"]:
            raise RuntimeError(f"Snapshot provenance mismatch: {snapshot}")
        event = events[source["event_id"]]
        publication_date = source.get("publication_date") or event["announcement_date"]
        rows.append({
            "inventory_document_id": stable_id("inventory-document", source["source_document_id"]),
            "document_id": source["source_document_id"],
            "event_id": source["event_id"],
            "security_id": event["security_id"],
            "document_type": source["document_type"],
            "publication_date": publication_date,
            "publication_time": source.get("publication_time"),
            "timestamp_quality": source.get("timestamp_quality", "unknown_time"),
            "url": source["url"],
            "content_hash": source["content_hash"],
            "local_snapshot_path": source["local_snapshot_path"],
            "source_id": source["source_id"],
            "source_priority": source["source_priority"],
            "provider": source["provider"],
            "inventory_scope": "pilot_v002_only",
            "duplicate_group_id": (
                stable_id("duplicate-document", source["content_hash"])
                if hash_counts[source["content_hash"]] > 1 else None
            ),
            "quality_status": "confirmed",
        })
    return rows


def apply_pilot_metadata(rows: list[dict[str, Any]]) -> None:
    for row in rows:
        metadata = PILOT_DOCUMENT_METADATA.get(row["url"])
        if metadata is None:
            continue
        issuer, role, policy = metadata
        row.update({
            "issuer": issuer,
            "document_role": role,
            "observation_policy": policy,
            "document_identity_key": f"{issuer}:{row['content_hash']}",
            "link_status": "confirmed",
            "link_reason": "Pilot metadata is source-linked by canonical document relation.",
            "related_document_id": None,
        })


def add_7011_pilot_document(
    inventory: list[dict[str, Any]],
    events: dict[str, dict[str, Any]],
    snapshot_dir: Path,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Download exactly one official 7011 FY document for repair verification."""
    event = events[PILOT_7011["event_id"]]
    request = urllib.request.Request(PILOT_7011["url"], headers=UA)
    with urllib.request.urlopen(request, timeout=60) as response:
        content = response.read()
    content_hash = hashlib.sha256(content).hexdigest()
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    snapshot = snapshot_dir / f"{content_hash}.pdf"
    if not snapshot.exists():
        snapshot.write_bytes(content)
    if sha256(snapshot) != content_hash:
        raise RuntimeError(f"7011 snapshot mismatch: {snapshot}")
    text = unicodedata.normalize(
        "NFKC",
        "\n".join(page.extract_text() or "" for page in PdfReader(snapshot).pages[:2]),
    )
    if not re.search(r"2025\s*年\s*3\s*月\s*31\s*日", text):
        raise RuntimeError("7011 FY PDF does not prove 2025-03-31; repair withheld.")
    source_id = stable_id("financial-source", "tdnet", PILOT_7011["url"])
    document_id = stable_id("financial-document", PILOT_7011["url"])
    snapshot_path = str(snapshot.relative_to(ROOT)).replace("\\", "/")
    row = {
        "inventory_document_id": stable_id("inventory-document", document_id),
        "document_id": document_id,
        "event_id": event["event_id"],
        "security_id": event["security_id"],
        "document_type": PILOT_7011["document_type"],
        "publication_date": PILOT_7011["publication_date"],
        "publication_time": None,
        "timestamp_quality": "date_only",
        "url": PILOT_7011["url"],
        "content_hash": content_hash,
        "local_snapshot_path": snapshot_path,
        "source_id": source_id,
        "source_priority": 1,
        "provider": "tdnet",
        "inventory_scope": "pilot_gate_7011_only",
        "duplicate_group_id": None,
        "quality_status": "confirmed",
        "document_role": PILOT_7011["document_role"],
        "related_document_id": None,
        "title_raw": "2025年3月期決算短信〔IFRS〕(連結)",
        "document_identity_key": f"7011:{content_hash}",
        "link_status": "confirmed",
        "link_reason": "Official FY PDF states the covered period end.",
        "retrieved_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }
    repair = {
        "repair_id": stable_id("event-axis-repair", event["event_id"], "fiscal_period_end", content_hash),
        "event_id": event["event_id"],
        "field_name": "fiscal_period_end",
        "prior_value": None,
        "repaired_value": "2025-03-31",
        "repair_method": "official_pdf_covered_period_v1",
        "repair_source_id": source_id,
        "repaired_at": row["retrieved_at"],
        "quality_status": "confirmed",
    }
    return row, repair


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase-a-dir", type=Path, default=PHASE_A)
    parser.add_argument(
        "--include-7011-pilot-document",
        action="store_true",
        help="Add only the bounded official 7011 FY document for repair validation.",
    )
    args = parser.parse_args()
    phase_a = args.phase_a_dir.resolve()
    facts = phase_a / "facts"
    schemas = phase_a / "schemas"

    if sha256(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger SHA mismatch before pilot preparation.")
    events = {row["event_id"]: row for row in load_jsonl(facts / "official_earnings_event.jsonl")}
    if len(events) != 345:
        raise RuntimeError(f"Expected 345 official events, found {len(events)}.")
    sources = load_jsonl(facts / "financial_observation_source_sample.jsonl")
    inventory = inventory_rows(sources, events)
    repairs: list[dict[str, Any]] = []
    if args.include_7011_pilot_document:
        row, repair = add_7011_pilot_document(
            inventory,
            events,
            phase_a / "raw_external" / "financial_fact_pilot_sources",
        )
        inventory.append(row)
        repairs.append(repair)
    apply_pilot_metadata(inventory)
    inventory_by_url = {row["url"]: row for row in inventory}
    inventory_by_url["https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf"]["related_document_id"] = inventory_by_url["https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf"]["document_id"]
    inventory_by_url["https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf"]["related_document_id"] = inventory_by_url["https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf"]["document_id"]

    observations = load_jsonl(facts / "financial_observation.jsonl")
    observation_source_links = [{
        "observation_source_link_id": stable_id("observation-source-link", row["observation_id"], row["source_document_id"]),
        "observation_id": row["observation_id"],
        "document_id": row["source_document_id"],
        "source_id": row["source_id"],
        "link_role": "primary_numeric_evidence",
        "source_page": row["source_page"],
        "source_table": row["source_table"],
        "evidence_text": row["raw_value_text"],
        "quality_status": "confirmed",
    } for row in observations]
    document_links = [
        {
            "document_link_id": stable_id("document-link", inventory_by_url["https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf"]["document_id"]),
            "document_id": inventory_by_url["https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf"]["document_id"],
            "related_document_id": inventory_by_url["https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf"]["document_id"],
            "link_type": "companion_revision_of",
            "evidence_text": "決算短信が同日公表の業績予想修正通知を参照。",
            "quality_status": "confirmed",
        },
        {
            "document_link_id": stable_id("document-link", inventory_by_url["https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf"]["document_id"]),
            "document_id": inventory_by_url["https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf"]["document_id"],
            "related_document_id": inventory_by_url["https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf"]["document_id"],
            "link_type": "review_completion_of",
            "evidence_text": "2026年8月3日開示の四半期連結財務諸表等に変更なし。",
            "quality_status": "confirmed",
        },
    ]
    document_source_links = [{
        "document_source_link_id": stable_id("document-source-link", row["document_id"], row["source_id"]),
        "document_id": row["document_id"],
        "source_id": row["source_id"],
        "relation_type": "primary_official_source",
        "quality_status": "confirmed",
    } for row in inventory if row["url"] in PILOT_DOCUMENT_METADATA]
    guidance_status = [{
        "guidance_id": stable_id("guidance-status", inventory_by_url["https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf"]["document_id"], "full_year"),
        "document_id": inventory_by_url["https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf"]["document_id"],
        "event_id": inventory_by_url["https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf"]["event_id"],
        "forecast_scope": "full_year",
        "period_basis": "full_year",
        "guidance_status": "deferred",
        "evidence_text": "通期連結業績予想は、第2四半期(中間期)の決算発表時に開示する予定",
        "quality_status": "confirmed",
    }]
    pilot_scope = {
        "scope_id": "financial-fact-pilot-boundary-001",
        "event_ids": [
            "official-event-a070ef6d36cb5a3eb162648400b027c7",
            "official-event-ed132c223977592c8cbfdd61e2f599f0",
            "official-event-f068a6004c335384940a3195270928db",
            "official-event-c6fe3f3887a45049babb620b7dc52241",
            "official-event-98506537e1cf5cc4bb7ed01f7ed93c15",
            PILOT_7011["event_id"],
        ],
        "document_urls": [
            PILOT_7011["url"],
            "https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf",
            "https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf",
            "https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf",
            "https://www2.jpx.co.jp/disc/34360/140120260805509445.pdf",
            "https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf",
            "https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf",
        ],
        "fan_out_forbidden": True,
        "full_collection_forbidden": True,
    }

    for name, schema in financial_fact_schemas().items():
        write_json(schemas / f"{name}.schema.json", schema)
    write_jsonl(facts / "financial_document_inventory.jsonl", inventory)
    write_jsonl(facts / "financial_document_link.jsonl", document_links)
    write_jsonl(facts / "financial_document_source_link.jsonl", document_source_links)
    write_jsonl(facts / "financial_guidance_status.jsonl", guidance_status)
    write_jsonl(facts / "financial_observation_source_link.jsonl", observation_source_links)
    write_jsonl(facts / "official_event_axis_repair.jsonl", repairs)
    write_jsonl(facts / "financial_observation_taxonomy_migration.jsonl", [])
    write_json(facts / "financial_fact_pilot_scope.json", pilot_scope)

    after = sha256(LEDGER)
    if after != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger changed during pilot preparation.")
    print(json.dumps({
        "inventory_scope": "pilot_v002_only",
        "inventory_document_count": len(inventory),
        "forecast_revision_documents": sum(row["document_type"] == "forecast_revision" for row in inventory),
        "axis_repair_count": len(repairs),
        "gemini_raw_sha256": after,
        "prepared_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
