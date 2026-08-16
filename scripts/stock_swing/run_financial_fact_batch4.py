"""Execute the frozen Batch 4 scope into an additive Fact namespace only.

Authorized output: three official-source revenue Observations / Financial Facts.
Unauthorized: changes to Event SoT/V002/Batch 0-3, Analysis, Acceptance, Commit.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from validate_financial_fact_batch4_numeric_bindings import (
    BINDINGS,
    EXPECTED_SCOPE_SHA,
    assert_identity,
    load_scope,
    pdf_page,
    structural_candidate_lines,
    validate_batch4_numeric_bindings,
)
from validate_financial_fact_batch4_selectors import validate_batch4_selectors
from validate_financial_fact_pilot import validate_observation_document_traceability


ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
EVENTS = FACTS / "official_earnings_event.jsonl"
OUTPUT = FACTS / "financial_fact_fanout_batch4_001"
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
    FACTS / "official_earnings_event.jsonl",
    FACTS / "earnings_event_document.jsonl",
    FACTS / "financial_observation.jsonl",
    FACTS / "financial_observation_source_link.jsonl",
    FACTS / "financial_fact_pilot_001",
    FACTS / "financial_fact_fanout_batch1_001",
    FACTS / "financial_fact_fanout_batch2_001",
    FACTS / "financial_fact_fanout_batch3_001",
    FACTS / "financial_fact_fanout_batch4_scope.json",
    FACTS / "financial_fact_fanout_batch4_scope.sha256",
)


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(map(str, parts))).hex}"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def render_jsonl(rows: list[dict[str, Any]]) -> bytes:
    return "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows).encode("utf-8")


def protected_digests() -> dict[str, str]:
    result: dict[str, str] = {}
    for path in PROTECTED_PATHS:
        if not path.exists():
            raise RuntimeError(f"protected artifact missing: {path}")
        files = [path] if path.is_file() else sorted(item for item in path.rglob("*") if item.is_file())
        for item in files:
            result[str(item.relative_to(ROOT)).replace("\\", "/")] = digest(item)
    return result


def ensure_exact_or_create(rendered: dict[str, bytes]) -> None:
    if OUTPUT.exists():
        actual = {path.name for path in OUTPUT.iterdir() if path.is_file()}
        if actual != set(OUTPUT_FILES):
            raise RuntimeError("Batch 4 output namespace is incomplete or unexpected")
        if any((OUTPUT / name).read_bytes() != rendered[name] for name in OUTPUT_FILES):
            raise RuntimeError("existing Batch 4 output conflicts with idempotent result")
        return
    OUTPUT.mkdir(parents=True)
    for name in OUTPUT_FILES:
        (OUTPUT / name).write_bytes(rendered[name])


def output_digests() -> dict[str, str]:
    return {name: digest(OUTPUT / name) for name in OUTPUT_FILES}


def build_output() -> tuple[dict[str, bytes], dict[str, Any]]:
    scope = load_scope()
    selector_validation = validate_batch4_selectors(write_log=False)
    numeric_validation = validate_batch4_numeric_bindings(write_log=False)
    if selector_validation["overall"] != "PASS" or numeric_validation["overall"] != "PASS":
        raise RuntimeError("Batch 4 selector or numeric validation is unavailable")
    if numeric_validation["scope_sha256"] != EXPECTED_SCOPE_SHA:
        raise RuntimeError("Batch 4 Scope SHA mismatch")

    events = {row["event_id"]: row for row in load_jsonl(EVENTS)}
    numeric_results = {row["binding_id"]: row for row in numeric_validation["results"]}
    bindings = {binding.event_id: binding for binding in BINDINGS}
    if set(bindings) != set(scope["event_ids"]):
        raise RuntimeError("binding / frozen Scope membership mismatch")

    inventory: list[dict[str, Any]] = []
    observations: list[dict[str, Any]] = []
    source_links: list[dict[str, Any]] = []
    evidence_rows: list[dict[str, Any]] = []
    reconciliation: list[dict[str, Any]] = []

    for document in scope["documents"]:
        event = events.get(document["event_id"])
        if event is None or event["security_id"] != "5803" or event["fiscal_year_label"] != "2026-03":
            raise RuntimeError("frozen Scope Event identity mismatch")
        binding = bindings.get(document["event_id"])
        if binding is None or binding.document_id != document["candidate_document_id"]:
            raise RuntimeError("frozen Scope Document / binding mismatch")
        snapshot = assert_identity(scope, binding)
        identity = document["document_identity"]
        source_id = stable_id("financial-source", "tdnet", document["url"])
        inventory.append(
            {
                "inventory_document_id": stable_id(
                    "batch4-inventory-document", document["candidate_document_id"]
                ),
                "document_id": document["candidate_document_id"],
                "event_id": document["event_id"],
                "security_id": "5803",
                "document_type": document["document_type"],
                "publication_date": event["announcement_date"],
                "publication_time": event["announcement_time"],
                "timestamp_quality": event["timestamp_quality"],
                "url": document["url"],
                "content_hash": identity["existing_content_hash"],
                "local_snapshot_path": identity["existing_local_snapshot_path"],
                "source_id": source_id,
                "source_priority": 1,
                "provider": "tdnet",
                "inventory_scope": scope["batch_id"],
                "duplicate_group_id": None,
                "quality_status": "confirmed",
                "issuer": scope["issuer"],
                "document_role": document["document_role"],
                "observation_policy": document["observation_policy"],
                "document_identity_key": f"{scope['issuer']}:{identity['existing_content_hash']}",
                "link_status": "confirmed",
                "link_reason": "Frozen Batch 4 official TDnet snapshot and numeric binding verified.",
                "related_document_id": None,
            }
        )

        boundary = next(iter(document["candidate_fact_boundaries"].values()))
        if boundary["selector_id"] != binding.selector_id or boundary["exact_actual_row"] != binding.exact_actual_row:
            raise RuntimeError("candidate Fact boundary / binding mismatch")
        numeric = numeric_results.get(binding.binding_id)
        if numeric is None or numeric["positive_validation"] != "PASS":
            raise RuntimeError("numeric binding result missing")
        value_text = numeric["numeric_binding"]["candidate_value"]
        if numeric["numeric_binding"]["candidate_count"] != 1:
            raise RuntimeError("numeric candidate is not unique")
        page = pdf_page(snapshot, binding.page)
        candidates = structural_candidate_lines(page, binding)
        if len(candidates) != 1:
            raise RuntimeError("source row became ambiguous during extraction")
        source_row = candidates[0][1]
        if not source_row.startswith(binding.exact_actual_row + " ") or value_text not in source_row:
            raise RuntimeError("numeric candidate / source row mismatch")
        value = int(value_text.replace(",", ""))
        observation_id = stable_id(
            "batch4-observation",
            document["candidate_document_id"],
            binding.selector_id,
            value_text,
            boundary["fiscal_period_end"],
        )
        table_path = f"{binding.actual_section} / {binding.table}"
        observation = {
            "observation_id": observation_id,
            "event_id": document["event_id"],
            "security_id": "5803",
            "metric_name": "revenue",
            "metric_name_raw": boundary["metric_name_raw"],
            "value_numeric": value,
            "raw_value_text": f"{value_text} 百万円",
            "currency": "JPY",
            "unit_code": boundary["unit_code"],
            "source_unit_raw": "百万円",
            "value_conversion_rule_id": "JPY_million_identity_v1",
            "measure_kind": boundary["measure_kind"],
            "period_basis": boundary["period_basis"],
            "consolidation": boundary["consolidation"],
            "accounting_standard": boundary["accounting_standard"],
            "fiscal_year_label": boundary["fiscal_year_label"],
            "fiscal_period_end": boundary["fiscal_period_end"],
            "event_fiscal_period_end": event["fiscal_period_end"],
            "as_of_date": event["announcement_date"],
            "as_of_timestamp": None,
            "document_publication_date": event["announcement_date"],
            "document_publication_time": event["announcement_time"],
            "document_timestamp_quality": event["timestamp_quality"],
            "observation_effective_date": None,
            "source_id": source_id,
            "source_document_id": document["candidate_document_id"],
            "source_page": binding.page,
            "source_table": table_path,
            "consolidation_evidence_text": "連結",
            "accounting_standard_evidence_text": "〔日本基準〕",
            "extraction_method": "batch4_frozen_scope_numeric_binding_pdf_text_v1",
            "quality_status": "confirmed",
            "forecast_scope": "other",
            "guidance_status": "not_applicable",
            "revision_relation": "none",
            "source_row": source_row,
            "source_column": "revenue_amount_first_column",
        }
        evidence_text = (
            f"selector={binding.selector_id}; numeric_binding={binding.binding_id}; "
            f"section={binding.actual_section}; table={binding.table}; "
            f"row={binding.exact_actual_row}; amount={value_text}; unit=百万円; "
            "column=revenue_amount_first_column; candidate_count=1; "
            "forecast_excluded=true; table_end_used=false"
        )
        observations.append(observation)
        source_links.append(
            {
                "observation_source_link_id": stable_id(
                    "batch4-observation-source-link",
                    observation_id,
                    document["candidate_document_id"],
                ),
                "observation_id": observation_id,
                "document_id": document["candidate_document_id"],
                "source_id": source_id,
                "link_role": "primary_numeric_evidence",
                "source_page": binding.page,
                "source_table": table_path,
                "evidence_text": evidence_text,
                "quality_status": "confirmed",
            }
        )
        evidence_rows.append(
            {
                "observation_id": observation_id,
                "document_id": document["candidate_document_id"],
                "source_id": source_id,
                "selector_id": binding.selector_id,
                "numeric_binding_id": binding.binding_id,
                "location_model": "page_section_header_first_column_period_row_amount_v1",
                "page": binding.page,
                "section": binding.actual_section,
                "table": binding.table,
                "row": binding.exact_actual_row,
                "metric_label": binding.table,
                "period_marker": binding.exact_actual_row,
                "unit_marker": "百万円",
                "accounting_basis": boundary["accounting_standard"],
                "bound_column": "revenue_amount_first_column",
                "candidate_count": 1,
                "forecast_excluded": True,
                "table_end_used": False,
                "evidence_text": evidence_text,
            }
        )
        reconciliation.append(
            {
                "reconciliation_id": stable_id("batch4-financial-reconciliation", observation_id),
                "observation_id": observation_id,
                "event_id": document["event_id"],
                "gemini_raw_row_id": None,
                "gemini_value_text": None,
                "official_value_numeric": value,
                "official_unit_code": boundary["unit_code"],
                "match_status": "official_only",
                "difference_note": "Official frozen PDF, Batch 4 selector, and numeric binding only; Gemini is not an input.",
            }
        )

    identities = {
        (row["event_id"], row["metric_name"], row["measure_kind"], row["period_basis"])
        for row in observations
    }
    if len(observations) != 3 or len(identities) != 3 or len(source_links) != 3:
        raise RuntimeError("unexpected Batch 4 Observation cardinality or duplicate")
    if {row["source_document_id"] for row in observations} != {
        row["candidate_document_id"] for row in scope["documents"]
    }:
        raise RuntimeError("emitted Observation source Documents drifted from frozen Scope")

    document_results = [
        {
            "document_id": document["candidate_document_id"],
            "event_id": document["event_id"],
            "security_id": "5803",
            "status": "numeric_facts_emitted",
            "observation_count": 1,
            "selector_id": next(iter(document["candidate_fact_boundaries"].values()))["selector_id"],
        }
        for document in scope["documents"]
    ]
    summary = {
        "batch_id": scope["batch_id"],
        "scope_sha256": EXPECTED_SCOPE_SHA,
        "scope_sha_status": "UNCHANGED",
        "document_hash_status": "PASS",
        "event_identity_status": "PASS",
        "selector_status": "PASS",
        "numeric_binding_status": "PASS",
        "events": 3,
        "documents": 3,
        "validated_selectors": 3,
        "validated_numeric_bindings": 3,
        "observations_generated": 3,
        "financial_facts_generated": 3,
        "reconciliation_rows": 3,
        "gemini_used_as_input": False,
        "v002_mutated": False,
        "event_sot_mutated": False,
        "execution_authorized_by_request": True,
        "acceptance_authorized": False,
        "commit_authorized": False,
        "failures": 0,
    }
    rendered = {
        "financial_document_inventory.jsonl": render_jsonl(inventory),
        "financial_document_source_link.jsonl": render_jsonl(
            [
                {
                    "document_source_link_id": stable_id(
                        "batch4-document-source-link", row["document_id"], row["source_id"]
                    ),
                    "document_id": row["document_id"],
                    "source_id": row["source_id"],
                    "relation_type": "primary_official_source",
                    "quality_status": "confirmed",
                }
                for row in inventory
            ]
        ),
        "financial_observation.jsonl": render_jsonl(observations),
        "financial_observation_source_link.jsonl": render_jsonl(source_links),
        "financial_observation_reconciliation.jsonl": render_jsonl(reconciliation),
        "selector_evidence_location.jsonl": render_jsonl(evidence_rows),
        "document_outcome.jsonl": b"",
        "document_results.json": (
            json.dumps(document_results, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
        ).encode("utf-8"),
        "summary.json": (
            json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
        ).encode("utf-8"),
    }
    return rendered, summary


def run_once() -> dict[str, Any]:
    before = protected_digests()
    rendered, summary = build_output()
    ensure_exact_or_create(rendered)
    validate_observation_document_traceability(
        OUTPUT,
        OUTPUT / "financial_observation.jsonl",
        OUTPUT / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    if protected_digests() != before:
        raise RuntimeError("protected Batch 0-3, V002, Event SoT, or Scope drifted")
    return summary


def main() -> None:
    first = run_once()
    first_digests = output_digests()
    second = run_once()
    if first != second or first_digests != output_digests():
        raise RuntimeError("Batch 4 extraction is not idempotent")
    print(json.dumps({**second, "idempotent": True, "output_digests": first_digests}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
