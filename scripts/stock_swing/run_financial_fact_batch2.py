"""Execute the approved, frozen 285A Batch 2 Financial Fact extraction.

This runner has no selector design authority. It consumes the approved
Selector A/B implementation and emits only an additive Batch 2 namespace.
"""
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
    EXPECTED_DOCUMENT_ID,
    EXPECTED_EVENT_ID,
    EXPECTED_PDF_SHA,
    EXPECTED_SCOPE_SHA,
    SELECTORS,
    digest,
    frozen_scope,
    pdf_pages,
    validate_batch2_selectors,
)
from validate_financial_fact_pilot import validate_observation_document_traceability

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch2_scope.json"
BATCH1_SCOPE = FACTS / "financial_fact_fanout_batch1_scope.json"
EVENTS = FACTS / "official_earnings_event.jsonl"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
OUTPUT = FACTS / "financial_fact_fanout_batch2_001"
EXPECTED_EVENT_COUNT = 345

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
    BATCH1_SCOPE,
    LEDGER,
    EVENTS,
    FACTS / "financial_document_inventory.jsonl",
    FACTS / "financial_observation.jsonl",
    FACTS / "financial_observation_source_link.jsonl",
    FACTS / "financial_fact_fanout_batch1_001",
    FACTS / "financial_fact_pilot_001",
)


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(map(str, parts))).hex}"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def render_jsonl(rows: list[dict[str, Any]]) -> bytes:
    return "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows).encode("utf-8")


def output_digests() -> dict[str, str]:
    return {name: digest(OUTPUT / name) for name in OUTPUT_FILES}


def protected_digests() -> dict[str, str]:
    """Guard immutable scope, canonical/V002 rows, and prior batch outputs."""
    digests: dict[str, str] = {}
    for path in PROTECTED_PATHS:
        if not path.exists():
            raise RuntimeError(f"protected artifact is missing: {path}")
        files = [path] if path.is_file() else sorted(child for child in path.rglob("*") if child.is_file())
        for child in files:
            digests[str(child.relative_to(ROOT)).replace("\\", "/")] = digest(child)
    return digests


def assert_frozen_baselines() -> None:
    """Fail closed if Batch 0/1, V002, Gemini, or Event SoT drifted."""
    if digest(SCOPE) != EXPECTED_SCOPE_SHA:
        raise RuntimeError("Batch 2 scope SHA mismatch")
    if digest(BATCH1_SCOPE) != EXPECTED_BATCH1_SCOPE_SHA:
        raise RuntimeError("Batch 1 scope SHA drift")
    if digest(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger SHA mismatch")
    events = load_jsonl(EVENTS)
    if len(events) != EXPECTED_EVENT_COUNT:
        raise RuntimeError(f"Event cardinality drift: {len(events)}")
    canonical = sum(1 for line in (FACTS / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines() if line.strip())
    if canonical != EXPECTED_CANONICAL_FACTS:
        raise RuntimeError("canonical Financial Fact count drift")
    batch0 = sum(
        1
        for line in (FACTS / "financial_fact_pilot_001" / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    )
    if batch0 != EXPECTED_BATCH0_OBS:
        raise RuntimeError("Batch 0 Observation count drift")


def event_for_scope() -> dict[str, Any]:
    events = load_jsonl(EVENTS)
    if len(events) != EXPECTED_EVENT_COUNT:
        raise ValueError(f"Event cardinality mismatch: {len(events)}")
    rows = [row for row in events if row["event_id"] == EXPECTED_EVENT_ID]
    if len(rows) != 1:
        raise ValueError(f"missing or ambiguous Event: {EXPECTED_EVENT_ID}")
    event = rows[0]
    if (
        event["security_id"] != "285A"
        or event["accounting_standard"] != "IFRS"
        or event["consolidation"] != "consolidated"
        or event["fiscal_period_end"] != "2026-06-30"
    ):
        raise ValueError("Event boundary mismatch")
    return event


def source_row(page: str, binding_pattern: str) -> str:
    """Recover exactly the already-approved selector's source evidence."""
    matches = list(re.finditer(binding_pattern, page))
    if len(matches) != 1:
        raise ValueError(f"unexpected selector match while emitting Fact: {len(matches)}")
    return matches[0].group(0)


def ensure_exact_or_create(rendered: dict[str, bytes]) -> None:
    expected = set(OUTPUT_FILES)
    if OUTPUT.exists():
        actual = {path.name for path in OUTPUT.iterdir() if path.is_file()}
        if actual != expected:
            raise RuntimeError("Batch 2 output namespace is incomplete or contains unexpected artifacts")
        if any((OUTPUT / name).read_bytes() != rendered[name] for name in OUTPUT_FILES):
            raise RuntimeError("existing Batch 2 output conflicts with frozen execution result")
        return
    OUTPUT.mkdir(parents=True)
    for name in OUTPUT_FILES:
        (OUTPUT / name).write_bytes(rendered[name])


def build_output() -> tuple[dict[str, bytes], dict[str, Any]]:
    scope, document_scope, snapshot = frozen_scope()
    if digest(SCOPE) != EXPECTED_SCOPE_SHA or digest(snapshot) != EXPECTED_PDF_SHA:
        raise RuntimeError("scope or PDF hash mismatch")
    if scope["event_ids"] != [EXPECTED_EVENT_ID] or len(scope["documents"]) != 1:
        raise ValueError("unexpected Batch 2 scope")
    if document_scope["candidate_document_id"] != EXPECTED_DOCUMENT_ID:
        raise ValueError("unexpected Batch 2 Document")

    selector_validation = validate_batch2_selectors()
    if (
        selector_validation["overall"] != "PASS"
        or selector_validation["selector_a"] != "PASS"
        or selector_validation["selector_b_status"] != "PASS"
        or selector_validation["scope"]["scope_sha_status"] != "UNCHANGED"
        or selector_validation["scope"]["pdf_hash_status"] != "PASS"
    ):
        raise RuntimeError("approved selector evidence is unavailable or inconsistent")

    event = event_for_scope()
    pages = pdf_pages(snapshot)
    source_id = stable_id("financial-source", "tdnet", document_scope["url"])
    publication_date = document_scope["document_identity"]["publication_date"]
    inventory = [{
        "inventory_document_id": stable_id("batch2-inventory-document", EXPECTED_DOCUMENT_ID),
        "document_id": EXPECTED_DOCUMENT_ID,
        "event_id": EXPECTED_EVENT_ID,
        "security_id": "285A",
        "document_type": "earnings_release",
        "publication_date": publication_date,
        "publication_time": event["announcement_time"],
        "timestamp_quality": event["timestamp_quality"],
        "url": document_scope["url"],
        "content_hash": EXPECTED_PDF_SHA,
        "local_snapshot_path": document_scope["document_identity"]["existing_local_snapshot_path"],
        "source_id": source_id,
        "source_priority": 1,
        "provider": "tdnet",
        "inventory_scope": scope["batch_id"],
        "duplicate_group_id": None,
        "quality_status": "confirmed",
        "issuer": document_scope["issuer"],
        "document_role": "primary_result",
        "observation_policy": "eligible",
        "document_identity_key": f"{document_scope['issuer']}:{EXPECTED_PDF_SHA}",
        "link_status": "confirmed",
        "link_reason": "Frozen Batch 2 candidate verified against its existing local official PDF snapshot.",
        "related_document_id": document_scope["document_identity"]["related_financial_document_id"],
    }]

    boundaries = (
        {
            "selector_index": 0,
            "selector_id": "batch2-285A-actual-revenue-q1",
            "boundary_key": "actual",
            "metric_name_raw": "売上収益",
            "forecast_scope": "other",
            "guidance_status": "not_applicable",
            "revision_relation": "none",
        },
        {
            "selector_index": 1,
            "selector_id": "batch2-285A-forecast-revenue-q2-cumulative",
            "boundary_key": "company_forecast",
            "metric_name_raw": "売上収益",
            "forecast_scope": "interim",
            "guidance_status": "active",
            "revision_relation": "none",
        },
    )
    observations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    evidence_rows: list[dict[str, Any]] = []
    reconciliation: list[dict[str, Any]] = []

    for binding in boundaries:
        selector = SELECTORS[binding["selector_index"]]
        result = next(
            (row for row in selector_validation["results"] if row["selector_id"] == binding["selector_id"]),
            None,
        )
        if result is None or result["match_count"] != 1 or result["column_evidence"]["table_end_used"]:
            raise ValueError(f"unexpected selector evidence: {binding['selector_id']}")
        boundary = document_scope["candidate_fact_boundaries"][binding["boundary_key"]]
        if (
            result["measure_kind"] != boundary["measure_kind"]
            or result["period_basis"] != boundary["period_basis"]
            or result["page"] != boundary["candidate_page"]
            or result["unit_code"] != boundary["unit_code"]
            or result["accounting_basis"] != boundary["accounting_standard"]
            or result["consolidation"] != boundary["consolidation"]
        ):
            raise ValueError(f"selector / frozen boundary mismatch: {binding['selector_id']}")
        value_text = result["matched_value_text"].removesuffix(" 百万円")
        if not re.fullmatch(r"[0-9]{1,3}(?:,[0-9]{3})+", value_text):
            raise ValueError("numeric value is not a source-proved JPY_million token")
        value = int(value_text.replace(",", ""))
        row_text = source_row(pages[result["page"] - 1], selector.binding_pattern)
        if value_text not in row_text or result["column_evidence"]["adjacent_boundary_token"] not in row_text:
            raise ValueError("amount / percent evidence mismatch")

        observation_id = stable_id(
            "batch2-observation",
            EXPECTED_DOCUMENT_ID,
            binding["selector_id"],
            value_text,
            boundary["fiscal_period_end"],
        )
        table_path = f"{result['section']} / {result['table']}"
        observation = {
            "observation_id": observation_id,
            "event_id": EXPECTED_EVENT_ID,
            "security_id": "285A",
            "metric_name": "revenue",
            "metric_name_raw": binding["metric_name_raw"],
            "value_numeric": value,
            "raw_value_text": result["matched_value_text"],
            "currency": "JPY",
            "unit_code": "JPY_million",
            "source_unit_raw": "百万円",
            "value_conversion_rule_id": "JPY_million_identity_v1",
            "measure_kind": boundary["measure_kind"],
            "period_basis": boundary["period_basis"],
            "consolidation": "consolidated",
            "accounting_standard": "IFRS",
            "fiscal_year_label": boundary["fiscal_year_label"],
            "fiscal_period_end": boundary["fiscal_period_end"],
            "event_fiscal_period_end": event["fiscal_period_end"],
            "as_of_date": publication_date,
            "as_of_timestamp": None,
            "document_publication_date": publication_date,
            "document_publication_time": event["announcement_time"],
            "document_timestamp_quality": event["timestamp_quality"],
            "observation_effective_date": None,
            "source_id": source_id,
            "source_document_id": EXPECTED_DOCUMENT_ID,
            "source_page": result["page"],
            "source_table": table_path,
            "consolidation_evidence_text": "連結",
            "accounting_standard_evidence_text": "〔IFRS〕",
            "extraction_method": "batch2_approved_selector_evidence_pdf_text_v1",
            "quality_status": "confirmed",
            "forecast_scope": binding["forecast_scope"],
            "guidance_status": binding["guidance_status"],
            "revision_relation": binding["revision_relation"],
            "source_row": row_text,
            "source_column": "IFRS_revenue_amount",
        }
        link = {
            "observation_source_link_id": stable_id(
                "batch2-observation-source-link", observation_id, EXPECTED_DOCUMENT_ID
            ),
            "observation_id": observation_id,
            "document_id": EXPECTED_DOCUMENT_ID,
            "source_id": source_id,
            "link_role": "primary_numeric_evidence",
            "source_page": result["page"],
            "source_table": table_path,
            "evidence_text": (
                f"selector={binding['selector_id']}; section={result['section']}; "
                f"header_map={result['column_evidence']['metric_header']}; row={result['row']}; "
                f"amount={value_text}; adjacent_percent="
                f"{result['column_evidence']['adjacent_boundary_token']}; unit=百万円; "
                "column=IFRS_revenue_amount; table_end_used=false"
            ),
            "quality_status": "confirmed",
        }
        observations.append(observation)
        links.append(link)
        evidence_rows.append({
            "observation_id": observation_id,
            "document_id": EXPECTED_DOCUMENT_ID,
            "source_id": source_id,
            "selector_id": binding["selector_id"],
            "location_model": "page_section_header_map_period_row_amount_percent_v1",
            "page": result["page"],
            "section": result["section"],
            "table": result["table"],
            "row": result["row"],
            "metric_label": result["table"],
            "period_marker": result["row"],
            "unit_marker": "百万円",
            "accounting_basis": "IFRS",
            "bound_column": "IFRS_revenue_amount",
            "adjacent_percent_token": result["column_evidence"]["adjacent_boundary_token"],
            "table_end_used": False,
            "evidence_text": link["evidence_text"],
        })
        reconciliation.append({
            "reconciliation_id": stable_id("batch2-financial-reconciliation", observation_id),
            "observation_id": observation_id,
            "event_id": EXPECTED_EVENT_ID,
            "gemini_raw_row_id": None,
            "gemini_value_text": None,
            "official_value_numeric": value,
            "official_unit_code": "JPY_million",
            "match_status": "official_only",
            "difference_note": "Official local PDF and approved selector evidence only; Gemini is not an input.",
        })

    identities = {(row["event_id"], row["metric_name"], row["measure_kind"], row["period_basis"]) for row in observations}
    if len(observations) != 2 or len(identities) != 2 or len(links) != 2 or len(reconciliation) != 2:
        raise ValueError("unexpected Batch 2 output cardinality or duplicate")
    if {row["source_document_id"] for row in observations} != {EXPECTED_DOCUMENT_ID}:
        raise ValueError("unexpected Document in emitted Observation")

    document_results = [{
        "document_id": EXPECTED_DOCUMENT_ID,
        "event_id": EXPECTED_EVENT_ID,
        "security_id": "285A",
        "status": "numeric_facts_emitted",
        "observation_count": 2,
        "validated_selectors": [row["selector_id"] for row in evidence_rows],
        "selector_pages": [row["page"] for row in evidence_rows],
    }]
    summary = {
        "batch_id": scope["batch_id"],
        "scope_sha256": EXPECTED_SCOPE_SHA,
        "scope_sha_status": "UNCHANGED",
        "pdf_sha256": EXPECTED_PDF_SHA,
        "pdf_hash_status": "PASS",
        "events": 1,
        "documents": 1,
        "validated_selectors": 2,
        "observations_generated": 2,
        "financial_facts_generated": 2,
        "reconciliation_rows": 2,
        "failures": 0,
        "gemini_used_as_input": False,
        "execution_authorized_by_request": True,
        "commit_authorized": False,
    }
    rendered = {
        "financial_document_inventory.jsonl": render_jsonl(inventory),
        "financial_document_source_link.jsonl": render_jsonl([{
            "document_source_link_id": stable_id("batch2-document-source-link", EXPECTED_DOCUMENT_ID, source_id),
            "document_id": EXPECTED_DOCUMENT_ID,
            "source_id": source_id,
            "relation_type": "primary_official_source",
            "quality_status": "confirmed",
        }]),
        "financial_observation.jsonl": render_jsonl(observations),
        "financial_observation_source_link.jsonl": render_jsonl(links),
        "financial_observation_reconciliation.jsonl": render_jsonl(reconciliation),
        "selector_evidence_location.jsonl": render_jsonl(evidence_rows),
        "document_outcome.jsonl": b"",
        "document_results.json": (json.dumps(document_results, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8"),
        "summary.json": (json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode("utf-8"),
    }
    return rendered, summary


def run_once() -> dict[str, Any]:
    assert_frozen_baselines()
    before = protected_digests()
    rendered, summary = build_output()
    ensure_exact_or_create(rendered)
    validate_observation_document_traceability(
        OUTPUT,
        OUTPUT / "financial_observation.jsonl",
        OUTPUT / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    assert_frozen_baselines()
    if protected_digests() != before:
        raise RuntimeError("immutable scope, V002/canonical rows, or prior batch output drifted")
    return summary


def main() -> None:
    first = run_once()
    first_digests = output_digests()
    second = run_once()
    second_digests = output_digests()
    if first != second or first_digests != second_digests:
        raise RuntimeError("Batch 2 idempotency failure")
    print(json.dumps({**second, "idempotent": True, "output_digests": second_digests}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
