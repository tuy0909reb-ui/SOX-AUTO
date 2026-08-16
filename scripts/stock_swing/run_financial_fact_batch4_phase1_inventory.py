"""Phase I Inventory Execution for Batch 4 frozen Inventory Cohort (5803 Q1–Q3).

Authorized: Event/Document/Source/URL confirm, official snapshot + SHA-256,
two-axis classification, additive inventory artifacts only.

Forbidden: Fact Extraction, selector-for-Facts, Observation, Fact Scope Freeze,
Event SoT mutation, V002 merge, Gemini input, Commit.
"""
from __future__ import annotations

import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
OUT_SRC = (
    ROOT
    / "data"
    / "stock"
    / "stock_swing"
    / "facts_phase_a"
    / "raw_external"
    / "financial_fact_batch4_phase1_inventory_sources"
)
OUT_INV = FACTS / "financial_fact_fanout_batch4_phase1_inventory_001"

FROZEN = [
    {
        "event_id": "official-event-51acad93687c5010b1dd6baef0d4faff",
        "period_basis": "Q1_cumulative",
        "fiscal_period_end": "2025-06-30",
        "document_id": "doc-8cc5ba087bc65cad9b57aadbb7802607",
        "source_id": "source-2b23ab0f482350c79fc004aa1cdc58cc",
        "url": "https://www2.jpx.co.jp/disc/58030/140120250806532719.pdf",
        "expected_title": "2026年3月期第1四半期決算短信〔日本基準〕(連結)",
    },
    {
        "event_id": "official-event-d07fea2491fa5707a32e077f34c83e0d",
        "period_basis": "Q2_cumulative",
        "fiscal_period_end": "2025-09-30",
        "document_id": "doc-c13419293b865b8eb1f83311dd0b2660",
        "source_id": "source-5467c1d629be5c189f23fb3a195121dc",
        "url": "https://www2.jpx.co.jp/disc/58030/140120251106589866.pdf",
        "expected_title": "2026年3月期第2四半期(中間期)決算短信〔日本基準〕(連結)",
    },
    {
        "event_id": "official-event-d01b67f7bdd85249ac0800fac0ed3bb5",
        "period_basis": "Q3_cumulative",
        "fiscal_period_end": "2025-12-31",
        "document_id": "doc-1467205d56d15181a56a163e278528e2",
        "source_id": "source-89063a6de9595fa5a9255c182dabdd4d",
        "url": "https://www2.jpx.co.jp/disc/58030/140120260206550168.pdf",
        "expected_title": "2026年3月期第3四半期決算短信〔日本基準〕(連結)",
    },
]


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def main() -> None:
    events = {row["event_id"]: row for row in load_jsonl(FACTS / "official_earnings_event.jsonl")}
    docs_by_event: dict[str, list[dict]] = {}
    for row in load_jsonl(FACTS / "earnings_event_document.jsonl"):
        docs_by_event.setdefault(row["event_id"], []).append(row)

    if len(FROZEN) != 3:
        raise RuntimeError("Phase I cohort must be exactly 3 Events")

    OUT_SRC.mkdir(parents=True, exist_ok=True)
    OUT_INV.mkdir(parents=True, exist_ok=True)

    retrieved_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    rows: list[dict] = []

    for item in FROZEN:
        eid = item["event_id"]
        event = events.get(eid)
        if event is None:
            raise RuntimeError(f"missing event: {eid}")
        matches = [d for d in docs_by_event.get(eid, []) if d["document_id"] == item["document_id"]]
        if len(matches) != 1:
            raise RuntimeError(f"document mismatch for {eid}")
        doc = matches[0]

        integrity = (
            event["security_id"] == "5803"
            and event["fiscal_year_label"] == "2026-03"
            and event["period_basis"] == item["period_basis"]
            and event["source_id"] == item["source_id"]
            and doc["url"] == item["url"]
            and doc["provider"] == "tdnet"
            and doc["source_priority"] == 1
            and doc["document_title_raw"] == item["expected_title"]
            and doc["content_hash"] is None
        )
        if not integrity:
            raise RuntimeError(f"cohort integrity fail for {eid}")

        providers = sorted({d["provider"] for d in docs_by_event[eid]})
        tdnet_primaries = [
            d
            for d in docs_by_event[eid]
            if d["provider"] == "tdnet"
            and d["document_type"] == "earnings_release"
            and d["source_priority"] == 1
        ]
        title = doc["document_title_raw"]
        title_flags = {
            "is_standard_jgaap_consolidated_earnings_release": (
                "決算短信〔日本基準〕(連結)" in title
                and "訂正" not in title
                and "レビュー" not in title
                and "監査" not in title
            ),
            "multi_primary_tdnet": len(tdnet_primaries) != 1,
            "secondary_mirrors_present": "secondary" in providers,
        }

        request = urllib.request.Request(
            item["url"],
            headers={"User-Agent": "SOX-AUTO-Batch4-Phase1-Inventory/1.0"},
        )
        with urllib.request.urlopen(request, timeout=90) as response:
            content = response.read()
            http_status = getattr(response, "status", None) or response.getcode()
            content_type = response.headers.get("Content-Type")

        if not content.startswith(b"%PDF"):
            raise RuntimeError(f"official URL did not return PDF for {eid}")

        content_hash = hashlib.sha256(content).hexdigest()
        snapshot = OUT_SRC / f"{content_hash}.pdf"
        if not snapshot.exists():
            snapshot.write_bytes(content)
        elif hashlib.sha256(snapshot.read_bytes()).hexdigest() != content_hash:
            raise RuntimeError(f"snapshot collision for {eid}")

        if title_flags["multi_primary_tdnet"]:
            work_track = "D"
            terminal_state = "review_required"
            classification_note = (
                "Multiple TDnet primary earnings_release pointers; Hold pending relation review."
            )
        elif not title_flags["is_standard_jgaap_consolidated_earnings_release"]:
            work_track = "D"
            terminal_state = "review_required"
            classification_note = "Title class not standard JGAAP consolidated earnings release."
        else:
            # Document/source gap closed; selector-for-Facts not assessed → C / classified.
            work_track = "C"
            terminal_state = "classified"
            classification_note = (
                "Official TDnet primary snapshot+SHA-256 verified for inventory. "
                "Selector-for-Facts not assessed; Fact Scope promotion not authorized."
            )

        rows.append(
            {
                "phase": "batch4_phase1_inventory",
                "security_id": "5803",
                "fiscal_year_label": "2026-03",
                "event_id": eid,
                "period_basis": item["period_basis"],
                "fiscal_period_end": item["fiscal_period_end"],
                "document_id": item["document_id"],
                "source_id": item["source_id"],
                "url": item["url"],
                "document_title_raw": title,
                "provider": "tdnet",
                "source_priority": 1,
                "event_document_count": event["document_count"],
                "providers_seen": providers,
                "title_flags": title_flags,
                "http_status": http_status,
                "content_type": content_type,
                "byte_length": len(content),
                "content_hash": content_hash,
                "local_snapshot_path": str(snapshot.relative_to(ROOT)).replace("\\", "/"),
                "retrieved_at": retrieved_at,
                "work_track": work_track,
                "terminal_state": terminal_state,
                "classification_note": classification_note,
                "fact_scope_ready": False,
                "event_sot_mutated": False,
                "gemini_used": False,
                "numeric_pdf_parse": False,
                "selector_for_facts": False,
            }
        )

    # Confirm Event SoT document hashes remain null (no mutation).
    for item in FROZEN:
        current = [
            d for d in docs_by_event[item["event_id"]] if d["document_id"] == item["document_id"]
        ][0]
        if current["content_hash"] is not None:
            raise RuntimeError("Event SoT content_hash unexpectedly non-null")

    manifest = {
        "record_id": "financial_fact_fanout_batch4_phase1_inventory_001",
        "phase": "batch4_phase1_inventory",
        "authorization": (
            "SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-PHASE1-INVENTORY-COHORT-FREEZE-AUTH-001"
        ),
        "frozen_base_commit": "cc7bea177a307417911c1c10857ee278a29ec723",
        "security_id": "5803",
        "fiscal_year_label": "2026-03",
        "member_count": len(rows),
        "retrieved_at": retrieved_at,
        "boundaries": {
            "event_sot_mutated": False,
            "v002_merge": False,
            "batch0_3_read_only": True,
            "gemini_input": False,
            "official_only": True,
            "additive_only": True,
            "fact_extraction": False,
            "fact_scope_freeze": False,
        },
        "documents": rows,
    }

    (OUT_SRC / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT_INV / "inventory_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT_INV / "inventory_status.jsonl").write_text(
        "".join(json.dumps(row, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8",
    )

    summary = {
        "cohort_integrity": "PASS",
        "member_count": len(rows),
        "snapshot": "YES",
        "sha256": "YES",
        "boundary_check": "PASS",
        "fact_scope_freeze": "NOT REACHED",
        "phase1_inventory": "COMPLETED",
        "work_tracks": {
            row["event_id"]: {
                "period_basis": row["period_basis"],
                "document_id": row["document_id"],
                "work_track": row["work_track"],
                "terminal_state": row["terminal_state"],
                "content_hash": row["content_hash"],
                "fact_scope_ready": row["fact_scope_ready"],
            }
            for row in rows
        },
    }
    (OUT_INV / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
