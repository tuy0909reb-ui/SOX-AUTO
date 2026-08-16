"""Run Fact extraction for the frozen eight-document Batch 1 scope only.

The run creates an additive Batch 1 output namespace. It never writes Gemini,
Event, reconciliation, canonical Observation, or Batch 0 relations.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from run_financial_fact_pilot import (
    EXPECTED_LEDGER_SHA,
    adapter_for_document,
    normalize_unit,
    normalized_pages,
)
from validate_financial_fact_batch1_selectors import (
    EXPECTED_CANONICAL_FACTS,
    EXPECTED_SCOPE_SHA,
    FIXTURES,
    ROOT,
    SelectorFixture,
    assert_integrity,
    digest,
    integrity_snapshot,
    validate_fixture_against_pages,
)
from validate_financial_fact_pilot import validate_observation_document_traceability

FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch1_scope.json"
MANIFEST = (
    ROOT
    / "data"
    / "stock"
    / "stock_swing"
    / "facts_phase_a"
    / "raw_external"
    / "financial_fact_batch1_sources"
    / "manifest.json"
)
OUTPUT = FACTS / "financial_fact_fanout_batch1_001"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"


@dataclass(frozen=True)
class Batch1NumericSelector:
    """Adapter-owned row mapping; fixture owns the unique evidence location."""

    fixture_name: str
    metric_name: str
    metric_name_raw: str
    row_pattern: str
    forecast_scope: str
    guidance_status: str
    revision_relation: str


@dataclass(frozen=True)
class Batch1Adapter:
    issuer: str
    document_type: str
    document_role: str
    observation_policy: str
    selectors: tuple[Batch1NumericSelector, ...]
    consolidation: str
    accounting_standard: str
    document_outcome: str | None = None


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(map(str, parts))).hex}"


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def batch1_adapters() -> tuple[Batch1Adapter, ...]:
    q1_jgaap = (
        r"売上高\s+営業利益\s+経常利益[\s\S]{0,300}?"
        r"(?P<row>2027年3月期第1四半期\s+(?P<value>[\d,△.]+)[^\n]*)"
    )
    q1_ifrs_revenue = (
        r"売上収益\s+営業利益\s+税引前利益[\s\S]{0,350}?"
        r"(?P<row>2027年3月期第1四半期\s+(?P<value>[\d,△.]+)[^\n]*)"
    )
    q1_ifrs_business = (
        r"売上収益\s+事業利益\s+税引前利益[\s\S]{0,350}?"
        r"(?P<row>2027年3月期第1四半期\s+(?P<value>[\d,△.]+)[^\n]*)"
    )
    return (
        Batch1Adapter(
            "ibiden", "earnings_release", "primary_result", "eligible",
            (Batch1NumericSelector("actual_revenue", "revenue", "売上高", q1_jgaap, "other", "not_applicable", "none"),),
            "consolidated", "JGAAP",
        ),
        Batch1Adapter(
            "furukawa_electric", "earnings_release", "primary_result", "eligible",
            (Batch1NumericSelector("actual_revenue", "revenue", "売上高", q1_jgaap, "other", "not_applicable", "none"),),
            "consolidated", "JGAAP",
        ),
        Batch1Adapter(
            "fujikura", "earnings_release", "primary_result", "eligible",
            (Batch1NumericSelector("actual_revenue", "revenue", "売上高", q1_jgaap, "other", "not_applicable", "none"),),
            "consolidated", "JGAAP",
        ),
        Batch1Adapter(
            "disco", "earnings_release", "primary_result", "eligible",
            (
                Batch1NumericSelector("actual_revenue", "revenue", "売上高", q1_jgaap, "other", "not_applicable", "none"),
                Batch1NumericSelector(
                    "interim_forecast", "revenue", "売上高",
                    r"売上高\s+営業利益\s+経常利益[\s\S]{0,300}?"
                    r"(?P<row>第2四半期\(累計\)\s+(?P<value>[\d,△.]+)[^\n]*)",
                    "interim", "active", "none",
                ),
            ),
            "consolidated", "JGAAP",
        ),
        Batch1Adapter(
            "kokusai_electric", "earnings_release", "primary_result", "eligible",
            (Batch1NumericSelector("actual_revenue", "revenue", "売上収益", q1_ifrs_revenue, "other", "not_applicable", "none"),),
            "consolidated", "IFRS",
        ),
        Batch1Adapter(
            "lasertec", "earnings_release", "primary_result", "eligible",
            (
                Batch1NumericSelector(
                    "actual_revenue", "revenue", "売上高",
                    r"売上高\s+営業利益\s+経常利益[\s\S]{0,300}?"
                    r"(?P<row>2026年6月期\s+(?P<value>[\d,△.]+)[^\n]*)",
                    "other", "not_applicable", "none",
                ),
                Batch1NumericSelector(
                    "full_year_forecast", "revenue", "売上高",
                    r"売上高\s+営業利益\s+経常利益[\s\S]{0,500}?"
                    r"(?P<row>通期\s+(?P<value>[\d,△.]+)[^\n]*)",
                    "full_year", "active", "none",
                ),
            ),
            "consolidated", "JGAAP",
        ),
        Batch1Adapter(
            "kawasaki_heavy", "earnings_release", "primary_result", "eligible",
            (
                Batch1NumericSelector("actual_revenue", "revenue", "売上収益", q1_ifrs_business, "other", "not_applicable", "none"),
                Batch1NumericSelector(
                    "full_year_forecast", "revenue", "売上収益",
                    r"売上収益\s+事業利益\s+税引前利益[\s\S]{0,500}?"
                    r"(?P<row>通期\s+(?P<value>[\d,△.]+)[^\n]*)",
                    "full_year", "active", "none",
                ),
            ),
            "consolidated", "IFRS",
        ),
        Batch1Adapter(
            "screen_holdings", "earnings_release", "restatement_or_review", "review_only_no_auto_merge",
            (), "consolidated", "JGAAP", "review_only_no_auto_merge",
        ),
    )


def fixture_for(issuer: str, fixture_name: str) -> SelectorFixture:
    matches = [fixture for fixture in FIXTURES[issuer] if fixture.name == fixture_name]
    if len(matches) != 1:
        raise ValueError(f"missing or ambiguous validated fixture: {issuer}/{fixture_name}")
    return matches[0]


def extract_period_end(
    page: str,
    section: str,
    period_marker: str,
    expected_end: str | None = None,
) -> str:
    section_match = re.search(re.escape(section), page)
    if section_match is None:
        raise ValueError(f"section absent while extracting period: {section}")
    matches = list(re.finditer(
        r"(\d{4})年(\d{1,2})月(\d{1,2})日\s*[~〜]\s*(\d{4})年(\d{1,2})月(\d{1,2})日",
        page,
    ))
    candidates = [
        (match, f"{match.group(4)}-{int(match.group(5)):02d}-{int(match.group(6)):02d}")
        for match in matches
    ]
    if expected_end is not None:
        candidates = [(match, end) for match, end in candidates if end == expected_end]
    else:
        # Official PDF extraction may put a table before its section label.
        # Require the explicit range to remain structurally near that label.
        start = section_match.start()
        candidates = [
            (match, end)
            for match, end in candidates
            if start - 300 <= match.start() <= start + 300
        ]
        if len(candidates) > 1:
            fiscal_label = re.search(r"(\d{4})年(\d{1,2})月期", period_marker)
            if fiscal_label is not None:
                candidates = [
                    (match, end)
                    for match, end in candidates
                    if (
                        match.group(4) == fiscal_label.group(1)
                        and int(match.group(5)) == int(fiscal_label.group(2))
                    )
                ]
    if len(candidates) != 1:
        raise ValueError(f"unproved fiscal period for section {section}: {len(candidates)} ranges")
    return candidates[0][1]


def exact_row(page: str, selector: Batch1NumericSelector) -> tuple[str, str]:
    matches = list(re.finditer(selector.row_pattern, page, re.MULTILINE))
    if len(matches) != 1:
        raise ValueError(f"missing or ambiguous source row: {selector.fixture_name} ({len(matches)})")
    return matches[0].group("value"), matches[0].group("row")


def assert_title_evidence(page: str, adapter: Batch1Adapter) -> None:
    if "連結" not in page:
        raise ValueError("consolidation evidence is absent")
    expected = "〔IFRS〕" if adapter.accounting_standard == "IFRS" else "〔日本基準〕"
    if expected not in page:
        raise ValueError(f"accounting basis evidence is absent: {adapter.accounting_standard}")


def batch1_inventory(manifest: list[dict[str, Any]], events: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for candidate in manifest:
        event = events.get(candidate["event_id"])
        if event is None or event["security_id"] != candidate["security_id"]:
            raise ValueError(f"Event identity mismatch: {candidate['candidate_document_id']}")
        snapshot = ROOT / candidate["local_snapshot_path"]
        if not snapshot.is_file() or digest(snapshot) != candidate["content_hash"]:
            raise ValueError(f"hash mismatch: {candidate['candidate_document_id']}")
        source_id = stable_id("financial-source", "tdnet", candidate["url"])
        rows.append({
            "inventory_document_id": stable_id("inventory-document", candidate["candidate_document_id"]),
            "document_id": candidate["candidate_document_id"],
            "event_id": candidate["event_id"],
            "security_id": candidate["security_id"],
            "document_type": candidate["document_type"],
            "publication_date": event["announcement_date"],
            "publication_time": event["announcement_time"],
            "timestamp_quality": event["timestamp_quality"],
            "url": candidate["url"],
            "content_hash": candidate["content_hash"],
            "local_snapshot_path": candidate["local_snapshot_path"],
            "source_id": source_id,
            "source_priority": 1,
            "provider": "tdnet",
            "inventory_scope": "financial_fact_fanout_batch1_001",
            "duplicate_group_id": None,
            "quality_status": "confirmed",
            "issuer": candidate["issuer"],
            "document_role": candidate["document_role"],
            "observation_policy": candidate["observation_policy"],
            "document_identity_key": f"{candidate['issuer']}:{candidate['content_hash']}",
            "link_status": "confirmed",
            "link_reason": "Frozen Batch 1 scope candidate verified against local official PDF snapshot.",
            "related_document_id": None,
        })
    if len({row["document_id"] for row in rows}) != 8:
        raise ValueError("duplicate candidate Document")
    return rows


def output_digests() -> dict[str, str]:
    return {path.name: digest(path) for path in sorted(OUTPUT.glob("*.json*"))}


def run_once() -> dict[str, Any]:
    before = integrity_snapshot()
    assert_integrity(before, before)
    if before["scope_sha256"] != EXPECTED_SCOPE_SHA or digest(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("scope or Gemini integrity gate failed")
    if before["canonical_financial_facts"] != EXPECTED_CANONICAL_FACTS:
        raise RuntimeError("existing canonical Fact count drift")

    scope = json.loads(SCOPE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if len(scope["event_ids"]) != 8 or len(manifest) != 8:
        raise ValueError("Batch 1 scope cardinality mismatch")
    if {(row["event_id"], row["url"]) for row in scope["documents"]} != {
        (row["event_id"], row["url"]) for row in manifest
    }:
        raise ValueError("scope mismatch")

    events = {row["event_id"]: row for row in load_jsonl(FACTS / "official_earnings_event.jsonl")}
    if len(events) != 345 or set(scope["event_ids"]) - set(events):
        raise ValueError("Event scope mismatch")
    inventory = batch1_inventory(manifest, events)
    registry = {
        (adapter.issuer, adapter.document_type, adapter.document_role, adapter.observation_policy): adapter
        for adapter in batch1_adapters()
    }

    observations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    reconciliation: list[dict[str, Any]] = []
    outcomes: list[dict[str, Any]] = []
    selector_evidence: list[dict[str, Any]] = []
    document_results: list[dict[str, Any]] = []

    for document in inventory:
        adapter = adapter_for_document(document, registry)
        pages = normalized_pages(ROOT / document["local_snapshot_path"])
        assert_title_evidence(pages[0], adapter)
        if adapter.document_outcome:
            review = fixture_for(adapter.issuer, "review_only")
            evidence = validate_fixture_against_pages(pages, review)
            if review.numeric_fact_allowed:
                raise ValueError("review-only selector permits numeric Fact")
            outcomes.append({
                "document_id": document["document_id"],
                "event_id": document["event_id"],
                "outcome": adapter.document_outcome,
                "quality_status": "confirmed",
            })
            document_results.append({
                "document_id": document["document_id"], "event_id": document["event_id"],
                "security_id": document["security_id"], "status": "review_only_no_numeric_fact",
                "observation_count": 0, "selector_pages": evidence["pages"],
            })
            continue

        emitted = 0
        for selector in adapter.selectors:
            fixture = fixture_for(adapter.issuer, selector.fixture_name)
            evidence = validate_fixture_against_pages(pages, fixture)
            if not fixture.numeric_fact_allowed or fixture.unit != "百万円":
                raise ValueError(f"unproved numeric fixture: {adapter.issuer}/{fixture.name}")
            if evidence["pages"] != [1]:
                raise ValueError(f"unexpected evidence page: {adapter.issuer}/{fixture.name}")
            page = pages[0]
            assert_title_evidence(page, adapter)
            raw_value, row_text = exact_row(page, selector)
            numeric, unit_code, conversion = normalize_unit(raw_value, fixture.unit)
            fiscal_period_end = extract_period_end(
                page,
                fixture.section,
                fixture.period,
                events[document["event_id"]]["fiscal_period_end"] if fixture.measure_kind == "actual" else None,
            )
            if fixture.measure_kind == "actual" and fiscal_period_end != events[document["event_id"]]["fiscal_period_end"]:
                raise ValueError(f"actual period/Event mismatch: {document['document_id']}")
            observation_id = stable_id(
                "batch1-observation", document["document_id"], selector.fixture_name,
                raw_value, fiscal_period_end,
            )
            table_path = f"{fixture.section} / {fixture.table}"
            location = {
                "location_model": fixture.location_model,
                "page": evidence["pages"][0],
                "section": fixture.section,
                "table": fixture.table,
                "row": fixture.row or row_text.split()[0],
                "metric_label": fixture.table,
                "period_marker": fixture.period,
                "unit_marker": fixture.unit,
                "accounting_basis": fixture.accounting_basis or adapter.accounting_standard,
            }
            row = {
                "observation_id": observation_id,
                "event_id": document["event_id"],
                "security_id": document["security_id"],
                "metric_name": selector.metric_name,
                "metric_name_raw": selector.metric_name_raw,
                "value_numeric": numeric,
                "raw_value_text": f"{raw_value}{fixture.unit}",
                "currency": "JPY",
                "unit_code": unit_code,
                "source_unit_raw": fixture.unit,
                "value_conversion_rule_id": conversion,
                "measure_kind": fixture.measure_kind,
                "period_basis": fixture.period_basis,
                "consolidation": adapter.consolidation,
                "accounting_standard": adapter.accounting_standard,
                "fiscal_year_label": fixture.period,
                "fiscal_period_end": fiscal_period_end,
                "event_fiscal_period_end": events[document["event_id"]]["fiscal_period_end"],
                "as_of_date": document["publication_date"],
                "as_of_timestamp": None,
                "document_publication_date": document["publication_date"],
                "document_publication_time": document["publication_time"],
                "document_timestamp_quality": document["timestamp_quality"],
                "observation_effective_date": None,
                "source_id": document["source_id"],
                "source_document_id": document["document_id"],
                "source_page": evidence["pages"][0],
                "source_table": table_path,
                "consolidation_evidence_text": "連結",
                "accounting_standard_evidence_text": (
                    "〔IFRS〕" if adapter.accounting_standard == "IFRS" else "〔日本基準〕"
                ),
                "extraction_method": "batch1_validated_selector_pdf_text_v1",
                "quality_status": "confirmed",
                "forecast_scope": selector.forecast_scope,
                "guidance_status": selector.guidance_status,
                "revision_relation": selector.revision_relation,
                "source_row": row_text,
                "source_column": fixture.table,
            }
            link = {
                "observation_source_link_id": stable_id(
                    "batch1-observation-source-link", observation_id, document["document_id"]
                ),
                "observation_id": observation_id,
                "document_id": document["document_id"],
                "source_id": document["source_id"],
                "link_role": "primary_numeric_evidence",
                "source_page": evidence["pages"][0],
                "source_table": table_path,
                "evidence_text": (
                    f"section={fixture.section}; table={fixture.table}; row={location['row']}; "
                    f"period={fixture.period}; unit={fixture.unit}; source_row={row_text}"
                ),
                "quality_status": "confirmed",
            }
            observations.append(row)
            links.append(link)
            selector_evidence.append({
                "observation_id": observation_id,
                "document_id": document["document_id"],
                "source_id": document["source_id"],
                **location,
                "evidence_text": link["evidence_text"],
            })
            reconciliation.append({
                "reconciliation_id": stable_id("batch1-financial-reconciliation", observation_id),
                "observation_id": observation_id,
                "event_id": document["event_id"],
                "gemini_raw_row_id": None,
                "gemini_value_text": None,
                "official_value_numeric": numeric,
                "official_unit_code": unit_code,
                "match_status": "official_only",
                "difference_note": "Batch 1 uses official PDF evidence only; Gemini raw is not an input.",
            })
            emitted += 1
        document_results.append({
            "document_id": document["document_id"], "event_id": document["event_id"],
            "security_id": document["security_id"], "status": "numeric_facts_emitted",
            "observation_count": emitted,
            "selector_pages": [row["page"] for row in selector_evidence if row["document_id"] == document["document_id"]],
        })

    identity = {
        (row["event_id"], row["metric_name"], row["measure_kind"], row["period_basis"])
        for row in observations
    }
    if len(identity) != len(observations):
        raise ValueError("duplicate candidate")
    if len(observations) != 10 or len(links) != 10 or len(reconciliation) != 10:
        raise ValueError("unexpected Batch 1 numeric output cardinality")
    if any(row["security_id"] == "7735" for row in observations):
        raise ValueError("review-only Document emitted a numeric Fact")
    if any(row["event_id"] not in scope["event_ids"] for row in observations):
        raise ValueError("scope-external Observation")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    write_jsonl(OUTPUT / "financial_document_inventory.jsonl", inventory)
    write_jsonl(OUTPUT / "financial_document_source_link.jsonl", [{
        "document_source_link_id": stable_id("batch1-document-source-link", row["document_id"], row["source_id"]),
        "document_id": row["document_id"],
        "source_id": row["source_id"],
        "relation_type": "primary_official_source",
        "quality_status": "confirmed",
    } for row in inventory])
    write_jsonl(OUTPUT / "financial_observation.jsonl", observations)
    write_jsonl(OUTPUT / "financial_observation_source_link.jsonl", links)
    write_jsonl(OUTPUT / "financial_observation_reconciliation.jsonl", reconciliation)
    write_jsonl(OUTPUT / "document_outcome.jsonl", outcomes)
    write_jsonl(OUTPUT / "selector_evidence_location.jsonl", selector_evidence)
    (OUTPUT / "document_results.json").write_text(
        json.dumps(document_results, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    summary = {
        "batch_id": scope["batch_id"],
        "scope_sha256": digest(SCOPE),
        "documents": len(inventory),
        "events": len(scope["event_ids"]),
        "observations_generated": len(observations),
        "financial_facts_generated": len(observations),
        "review_only_numeric_facts": sum(row["security_id"] == "7735" for row in observations),
        "gemini_sha256": digest(LEDGER),
        "canonical_facts_preexisting": before["canonical_financial_facts"],
    }
    (OUTPUT / "summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    validate_observation_document_traceability(
        OUTPUT,
        OUTPUT / "financial_observation.jsonl",
        OUTPUT / "financial_observation_source_link.jsonl",
        require_document_source_links=True,
    )
    after = integrity_snapshot()
    assert_integrity(before, after)
    return summary


def main() -> None:
    first = run_once()
    first_digests = output_digests()
    second = run_once()
    second_digests = output_digests()
    if first != second or first_digests != second_digests:
        raise RuntimeError("Batch 1 idempotency failure")
    print(json.dumps({**second, "idempotent": True, "output_digests": second_digests}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
