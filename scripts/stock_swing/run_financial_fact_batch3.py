"""Execute Architect-approved Batch 3 extraction into an additive namespace."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from run_financial_fact_pilot import EXPECTED_LEDGER_SHA
from validate_financial_fact_batch1_selectors import (
    EXPECTED_BATCH0_OBS,
    EXPECTED_CANONICAL_FACTS,
    EXPECTED_SCOPE_SHA as EXPECTED_BATCH1_SCOPE_SHA,
)
from validate_financial_fact_batch2_selectors import (
    EXPECTED_SCOPE_SHA as EXPECTED_BATCH2_SCOPE_SHA,
)
from validate_financial_fact_batch3_selectors import (
    EXPECTED_DOCUMENTS,
    EXPECTED_EVENT_COUNT,
    EXPECTED_SCOPE_SHA,
    SELECTORS,
    digest,
    frozen_scope,
    pdf_pages,
    validate_batch3_selectors,
)
from validate_financial_fact_pilot import validate_observation_document_traceability

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch3_scope.json"
EVENTS = FACTS / "official_earnings_event.jsonl"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
OUTPUT = FACTS / "financial_fact_fanout_batch3_001"
OUTPUT_FILES = (
    "financial_document_inventory.jsonl",
    "financial_document_source_link.jsonl",
    "financial_observation.jsonl",
    "financial_observation_source_link.jsonl",
    "financial_observation_reconciliation.jsonl",
    "selector_evidence_location.jsonl",
    "document_outcome.jsonl",
    "document_results.json",
    "summary.json",
)
PROTECTED_PATHS = (
    SCOPE,
    FACTS / "financial_fact_fanout_batch1_scope.json",
    FACTS / "financial_fact_fanout_batch2_scope.json",
    EVENTS,
    LEDGER,
    FACTS / "financial_observation.jsonl",
    FACTS / "financial_observation_source_link.jsonl",
    FACTS / "financial_fact_pilot_001",
    FACTS / "financial_fact_fanout_batch1_001",
    FACTS / "financial_fact_fanout_batch2_001",
)
BOUNDARY_KEYS = {
    "batch3-7011-actual-revenue-q1": "actual_revenue_q1",
    "batch3-8035-actual-revenue-h1": "actual_revenue_h1",
    "batch3-8035-revised-revenue-fy": "revised_forecast_revenue_fy",
}


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(map(str, parts))).hex}"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def render_jsonl(rows: list[dict[str, Any]]) -> bytes:
    return "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows).encode("utf-8")


def protected_digests() -> dict[str, str]:
    digests: dict[str, str] = {}
    for path in PROTECTED_PATHS:
        if not path.exists():
            raise RuntimeError(f"protected artifact missing: {path}")
        files = [path] if path.is_file() else sorted(child for child in path.rglob("*") if child.is_file())
        for child in files:
            digests[str(child.relative_to(ROOT)).replace("\\", "/")] = digest(child)
    return digests


def assert_frozen_baselines() -> None:
    if digest(SCOPE) != EXPECTED_SCOPE_SHA:
        raise RuntimeError("Batch 3 scope SHA mismatch")
    if digest(FACTS / "financial_fact_fanout_batch1_scope.json") != EXPECTED_BATCH1_SCOPE_SHA:
        raise RuntimeError("Batch 1 scope SHA drift")
    if digest(FACTS / "financial_fact_fanout_batch2_scope.json") != EXPECTED_BATCH2_SCOPE_SHA:
        raise RuntimeError("Batch 2 scope SHA drift")
    if digest(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger SHA drift")
    if len(load_jsonl(EVENTS)) != EXPECTED_EVENT_COUNT:
        raise RuntimeError("official Event cardinality drift")
    canonical = sum(1 for line in (FACTS / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines() if line.strip())
    if canonical != EXPECTED_CANONICAL_FACTS:
        raise RuntimeError("canonical/V002 Observation cardinality drift")
    batch0 = sum(1 for line in (FACTS / "financial_fact_pilot_001" / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines() if line.strip())
    if batch0 != EXPECTED_BATCH0_OBS:
        raise RuntimeError("Batch 0 Observation cardinality drift")


def ensure_exact_or_create(rendered: dict[str, bytes]) -> None:
    if OUTPUT.exists():
        actual = {path.name for path in OUTPUT.iterdir() if path.is_file()}
        if actual != set(OUTPUT_FILES):
            raise RuntimeError("Batch 3 output namespace is incomplete or unexpected")
        if any((OUTPUT / name).read_bytes() != rendered[name] for name in OUTPUT_FILES):
            raise RuntimeError("existing Batch 3 output conflicts with idempotent result")
        return
    OUTPUT.mkdir(parents=True)
    for name in OUTPUT_FILES:
        (OUTPUT / name).write_bytes(rendered[name])


def build_output() -> tuple[dict[str, bytes], dict[str, Any]]:
    validation = validate_batch3_selectors()
    if (
        validation["overall"] != "PASS"
        or not validation["architect_validation_pass"]
        or validation["scope_sha256"] != EXPECTED_SCOPE_SHA
        or validation["pdf"] != "PASS"
        or validation["revision_semantics"]["result"] != "VERIFIED_NON_EQUIVALENT_NO_MERGE"
    ):
        raise RuntimeError("Architect-approved selector validation is unavailable")
    if validation["revision_semantics"]["merge_replace_alias"]:
        raise RuntimeError("8035 V002 merge/replace/alias is forbidden")

    scope, snapshots = frozen_scope()
    pages = {security: pdf_pages(snapshot) for security, snapshot in snapshots.items()}
    events = {row["event_id"]: row for row in load_jsonl(EVENTS)}
    documents = {row["security_id"]: row for row in scope["documents"]}
    results = {row["selector_id"]: row for row in validation["results"]}
    inventory: list[dict[str, Any]] = []
    observations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    evidence: list[dict[str, Any]] = []
    reconciliation: list[dict[str, Any]] = []

    for security_id, document in documents.items():
        expected_document, expected_hash = EXPECTED_DOCUMENTS[security_id]
        if document["candidate_document_id"] != expected_document:
            raise ValueError("scope Document identity mismatch")
        event = events.get(document["event_id"])
        if event is None or event["security_id"] != security_id:
            raise ValueError("scope Event identity mismatch")
        source_id = stable_id("financial-source", "tdnet", document["url"])
        identity = document["document_identity"]
        inventory.append({
            "inventory_document_id": stable_id("batch3-inventory-document", expected_document),
            "document_id": expected_document,
            "event_id": document["event_id"],
            "security_id": security_id,
            "document_type": document["document_type"],
            "publication_date": identity["publication_date"],
            "publication_time": event["announcement_time"],
            "timestamp_quality": event["timestamp_quality"],
            "url": document["url"],
            "content_hash": expected_hash,
            "local_snapshot_path": identity["existing_local_snapshot_path"],
            "source_id": source_id,
            "source_priority": 1,
            "provider": "tdnet",
            "inventory_scope": scope["batch_id"],
            "duplicate_group_id": None,
            "quality_status": "confirmed",
            "issuer": document["issuer"],
            "document_role": document["document_role"],
            "observation_policy": document["observation_policy"],
            "document_identity_key": f"{document['issuer']}:{expected_hash}",
            "link_status": "confirmed",
            "link_reason": "Architect-approved frozen Batch 3 official PDF selector evidence.",
            "related_document_id": identity["related_financial_document_id"],
        })

    for selector in SELECTORS:
        document = documents[selector.security_id]
        event = events[selector.event_id]
        result = results[selector.selector_id]
        boundary = document["candidate_fact_boundaries"][BOUNDARY_KEYS[selector.selector_id]]
        source_id = stable_id("financial-source", "tdnet", document["url"])
        if (
            result["match_count"] != 1
            or result["column_evidence"]["table_end_used"]
            or result["measure_kind"] != boundary["measure_kind"]
            or result["period_basis"] != boundary["period_basis"]
            or result["page"] != boundary["candidate_page"]
            or boundary["unit_code"] != "JPY_million"
            or result["accounting_basis"] != boundary["accounting_standard"]
        ):
            raise ValueError(f"selector/boundary mismatch: {selector.selector_id}")
        match = re.fullmatch(r"([0-9]{1,3}(?:,[0-9]{3})+) 百万円", result["matched_value_text"])
        if match is None:
            raise ValueError("unproved JPY_million amount")
        value_text = match.group(1)
        value = int(value_text.replace(",", ""))
        source_matches = list(re.finditer(selector.binding_pattern, pages[selector.security_id][result["page"] - 1]))
        if len(source_matches) != 1:
            raise ValueError("source row is missing or ambiguous during extraction")
        source_row = source_matches[0].group(0)
        observation_id = stable_id(
            "batch3-observation", document["candidate_document_id"], selector.selector_id,
            value_text, boundary["fiscal_period_end"],
        )
        table_path = f"{result['section']} / {result['table']}"
        forecast_scope = "full_year" if selector.measure_kind == "revised_forecast" else "other"
        guidance_status = "revised" if selector.measure_kind == "revised_forecast" else "not_applicable"
        observation = {
            "observation_id": observation_id,
            "event_id": selector.event_id,
            "security_id": selector.security_id,
            "metric_name": "revenue",
            "metric_name_raw": boundary["metric_name_raw"],
            "value_numeric": value,
            "raw_value_text": result["matched_value_text"],
            "currency": "JPY",
            "unit_code": "JPY_million",
            "source_unit_raw": "百万円",
            "value_conversion_rule_id": "JPY_million_identity_v1",
            "measure_kind": boundary["measure_kind"],
            "period_basis": boundary["period_basis"],
            "consolidation": boundary["consolidation"],
            "accounting_standard": boundary["accounting_standard"],
            "fiscal_year_label": boundary["fiscal_year_label"],
            "fiscal_period_end": boundary["fiscal_period_end"],
            "event_fiscal_period_end": event["fiscal_period_end"],
            "as_of_date": document["document_identity"]["publication_date"],
            "as_of_timestamp": None,
            "document_publication_date": document["document_identity"]["publication_date"],
            "document_publication_time": event["announcement_time"],
            "document_timestamp_quality": event["timestamp_quality"],
            "observation_effective_date": None,
            "source_id": source_id,
            "source_document_id": document["candidate_document_id"],
            "source_page": result["page"],
            "source_table": table_path,
            "consolidation_evidence_text": "連結",
            "accounting_standard_evidence_text": "〔IFRS〕" if selector.accounting_standard == "IFRS" else "〔日本基準〕",
            "extraction_method": "batch3_architect_approved_selector_pdf_text_v1",
            "quality_status": "confirmed",
            "forecast_scope": forecast_scope,
            "guidance_status": guidance_status,
            "revision_relation": boundary.get("revision_relation", "none"),
            "source_row": source_row,
            "source_column": result["column_evidence"]["bound_column"],
        }
        evidence_text = (
            f"selector={selector.selector_id}; section={result['section']}; row={result['row']}; "
            f"amount={value_text}; unit=百万円; column={result['column_evidence']['bound_column']}; "
            "table_end_used=false"
        )
        if selector.measure_kind == "revised_forecast":
            evidence_text += "; V002=company_forecast citation only; no merge/replace/alias"
        observations.append(observation)
        links.append({
            "observation_source_link_id": stable_id("batch3-observation-source-link", observation_id, document["candidate_document_id"]),
            "observation_id": observation_id,
            "document_id": document["candidate_document_id"],
            "source_id": source_id,
            "link_role": "primary_numeric_evidence",
            "source_page": result["page"],
            "source_table": table_path,
            "evidence_text": evidence_text,
            "quality_status": "confirmed",
        })
        evidence.append({
            "observation_id": observation_id,
            "document_id": document["candidate_document_id"],
            "source_id": source_id,
            "selector_id": selector.selector_id,
            "location_model": "page_section_header_map_period_row_amount_v1",
            "page": result["page"],
            "section": result["section"],
            "table": result["table"],
            "row": result["row"],
            "metric_label": result["table"],
            "period_marker": result["row"],
            "unit_marker": "百万円",
            "accounting_basis": result["accounting_basis"],
            "bound_column": result["column_evidence"]["bound_column"],
            "table_end_used": False,
            "evidence_text": evidence_text,
        })
        reconciliation.append({
            "reconciliation_id": stable_id("batch3-financial-reconciliation", observation_id),
            "observation_id": observation_id,
            "event_id": selector.event_id,
            "gemini_raw_row_id": None,
            "gemini_value_text": None,
            "official_value_numeric": value,
            "official_unit_code": "JPY_million",
            "match_status": "official_only",
            "difference_note": "Official PDF and Architect-approved selector only; Gemini is not an input.",
        })

    identities = {(row["event_id"], row["metric_name"], row["measure_kind"], row["period_basis"]) for row in observations}
    if len(observations) != 3 or len(identities) != 3 or len(links) != 3:
        raise ValueError("unexpected Batch 3 output cardinality or duplicate")
    document_results = [
        {
            "document_id": document["candidate_document_id"],
            "event_id": document["event_id"],
            "security_id": document["security_id"],
            "status": "numeric_facts_emitted",
            "observation_count": sum(row["source_document_id"] == document["candidate_document_id"] for row in observations),
        }
        for document in scope["documents"]
    ]
    summary = {
        "batch_id": scope["batch_id"],
        "scope_sha256": EXPECTED_SCOPE_SHA,
        "scope_sha_status": "UNCHANGED",
        "pdf_hash_status": "PASS",
        "events": 2,
        "documents": 2,
        "validated_selectors": 3,
        "observations_generated": 3,
        "financial_facts_generated": 3,
        "reconciliation_rows": 3,
        "gemini_used_as_input": False,
        "v002_mutated": False,
        "revised_forecast_v002_relation": "additive_non_merge",
        "execution_authorized_by_request": True,
        "commit_authorized": False,
        "failures": 0,
    }
    rendered = {
        "financial_document_inventory.jsonl": render_jsonl(inventory),
        "financial_document_source_link.jsonl": render_jsonl([
            {
                "document_source_link_id": stable_id("batch3-document-source-link", row["document_id"], row["source_id"]),
                "document_id": row["document_id"],
                "source_id": row["source_id"],
                "relation_type": "primary_official_source",
                "quality_status": "confirmed",
            }
            for row in inventory
        ]),
        "financial_observation.jsonl": render_jsonl(observations),
        "financial_observation_source_link.jsonl": render_jsonl(links),
        "financial_observation_reconciliation.jsonl": render_jsonl(reconciliation),
        "selector_evidence_location.jsonl": render_jsonl(evidence),
        "document_outcome.jsonl": b"",
        "document_results.json": (json.dumps(document_results, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8"),
        "summary.json": (json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    }
    return rendered, summary


def output_digests() -> dict[str, str]:
    return {name: digest(OUTPUT / name) for name in OUTPUT_FILES}


def run_once() -> dict[str, Any]:
    assert_frozen_baselines()
    before = protected_digests()
    rendered, summary = build_output()
    ensure_exact_or_create(rendered)
    validate_observation_document_traceability(
        OUTPUT, OUTPUT / "financial_observation.jsonl",
        OUTPUT / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    assert_frozen_baselines()
    if protected_digests() != before:
        raise RuntimeError("protected scope, V002, Batch 0–2, Event, or Gemini drifted")
    return summary


def main() -> None:
    first = run_once()
    first_digests = output_digests()
    second = run_once()
    if first != second or first_digests != output_digests():
        raise RuntimeError("Batch 3 extraction is not idempotent")
    print(json.dumps({**second, "idempotent": True, "output_digests": first_digests}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
