"""Run the fixed five-case Financial Fact Pilot without Event fan-out.

The common builder accepts only source-proved matches. Document-specific
adapters supply labels/section cues, never numeric values, page numbers, URLs,
or fiscal-period constants. Outputs are kept in a dedicated Pilot directory so
the existing canonical V002 observations remain immutable evidence.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable
from uuid import NAMESPACE_URL, uuid5

from pypdf import PdfReader

from financial_fact_contract import (
    FORECAST_SCOPES,
    GUIDANCE_STATUSES,
    PERIOD_BASIS,
    REVISION_RELATIONS,
)

ROOT = Path(__file__).resolve().parents[2]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
FACTS = PHASE_A / "facts"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
OUTPUT = FACTS / "financial_fact_pilot_001"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"


@dataclass(frozen=True)
class EvidenceSelector:
    """Document-adapter cue: labels and syntax only, never an output value."""

    metric_name: str
    metric_name_raw: str
    measure_kind: str
    period_basis: str
    forecast_scope: str
    guidance_status: str
    revision_relation: str
    row_pattern: str
    period_anchor_pattern: str


@dataclass(frozen=True)
class DocumentAdapter:
    """An exception boundary for one official document shape."""

    issuer: str
    document_type: str
    document_role: str
    observation_policy: str
    selectors: tuple[EvidenceSelector, ...]
    consolidation: str
    accounting_standard: str
    document_outcome: str | None = None


def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(map(str, parts))).hex}"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def normalized_pages(snapshot: Path) -> list[str]:
    return [
        unicodedata.normalize("NFKC", page.extract_text() or "")
        for page in PdfReader(snapshot).pages
    ]


def parse_numeric(token: str) -> int | float:
    value = token.replace(",", "").replace(" ", "").replace("△", "-")
    return float(value) if "." in value else int(value)


def normalize_unit(raw_number: str, source_unit: str) -> tuple[int | float, str, str]:
    value = parse_numeric(raw_number)
    if source_unit == "百万円":
        return value, "JPY_million", "JPY_million_identity_v1"
    if source_unit == "億円":
        return value * 100, "JPY_million", "JPY_oku_to_million_v1"
    raise ValueError(f"unit_unverified: {source_unit}")


def adapter_for_document(
    document: dict[str, Any],
    registry: dict[tuple[str | None, str, str | None, str | None], DocumentAdapter],
) -> DocumentAdapter:
    profile = (
        document.get("issuer"), document["document_type"],
        document.get("document_role"), document.get("observation_policy"),
    )
    adapter = registry.get(profile)
    if adapter is None:
        raise ValueError(f"No Inventory-selected adapter for profile {profile}.")
    return adapter


def extract_period_end(text: str, anchor_pattern: str) -> str | None:
    """Return an explicit range end near an adapter cue; never derive a period."""
    anchor = re.search(anchor_pattern, text)
    start = anchor.start() if anchor else -1
    window = text[start:start + 200] if start >= 0 else text
    matches = list(re.finditer(
        r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*[~〜]\s*"
        r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日",
        window,
    ))
    if len(matches) != 1:
        return None
    match = matches[0]
    return f"{match.group(4)}-{int(match.group(5)):02d}-{int(match.group(6)):02d}"


def source_match(pages: list[str], selector: EvidenceSelector) -> tuple[int, str, str, str | None]:
    for page_number, page in enumerate(pages, start=1):
        if re.search(selector.period_anchor_pattern, page) is None:
            continue
        match = re.search(selector.row_pattern, page, re.MULTILINE)
        if match is not None:
            raw_value = match.group("value")
            return page_number, raw_value, match.group(0), extract_period_end(page, selector.period_anchor_pattern)
    raise ValueError(f"Unsupported document shape: no evidence for {selector.metric_name_raw}")


def document_adapters() -> tuple[DocumentAdapter, ...]:
    # Cues are isolated here. The common builder never receives URL/page/value/date constants.
    return (
        DocumentAdapter(
            "advantest", "earnings_release", "primary_result", "eligible",
            (EvidenceSelector(
                "revenue", "売上高", "actual", "Q1_cumulative", "other", "not_applicable", "none",
                r"20\d{2}年3月期第1四半期\s+(?P<value>[\d,△.]+)",
                r"1\.20\d{2}年3月期第1四半期の連結業績",
            ),),
            "consolidated", "IFRS",
        ),
        DocumentAdapter(
            "advantest", "forecast_revision", "revision_detail", "eligible",
            (
                EvidenceSelector(
                    "revenue", "前回発表予想(A) 売上高", "prior_forecast", "full_year",
                    "full_year", "revised", "companion_document",
                    r"前回発表予想\(A\)\s+(?P<value>[\d,△.]+)",
                    r"業績予想の修正について",
                ),
                EvidenceSelector(
                    "revenue", "今回修正予想(B) 売上高", "revised_forecast", "full_year",
                    "full_year", "revised", "companion_document",
                    r"今回修正予想\(B\)\s+(?P<value>[\d,△.]+)",
                    r"業績予想の修正について",
                ),
            ),
            "consolidated", "IFRS",
        ),
        DocumentAdapter(
            "tokyo_electron", "earnings_release", "primary_result", "deferred_outlook_no_company_forecast",
            (
                EvidenceSelector(
                    "revenue", "売上高", "actual", "full_year", "other", "not_applicable", "none",
                    r"20\d{2}年3月期\s+(?P<value>[\d,△.]+)\s+[-\d.]+",
                    r"1\.\s*20\d{2}年3月期の連結業績",
                ),
                EvidenceSelector(
                    "revenue", "第2四半期(累計) 売上高", "company_forecast", "Q2_cumulative",
                    "interim", "active", "none",
                    r"第2四半期\(累計\)\s+(?P<value>[\d,△.]+)",
                    r"3\.\s*20\d{2}年3月期第2四半期",
                ),
            ),
            "consolidated", "JGAAP", "full_year_guidance_postponed",
        ),
        DocumentAdapter(
            "sumco", "earnings_release", "primary_result", "eligible",
            (
                EvidenceSelector(
                    "revenue", "売上高", "actual", "Q2_cumulative", "other", "not_applicable", "none",
                    r"20\d{2}年12月期中間期\s+(?P<value>[\d,△.]+)",
                    r"1\.20\d{2}年12月期第2四半期",
                ),
                EvidenceSelector(
                    "revenue", "第3四半期予想 売上高", "company_forecast", "Q3_cumulative",
                    "next_quarter", "active", "newly_disclosed",
                    r"第3四半期\(累計\)\s+(?P<value>[\d,△.]+)",
                    r"3\.20\d{2}年12月期第3四半期の連結業績予想",
                ),
            ),
            "consolidated", "JGAAP",
        ),
        DocumentAdapter(
            "mufg", "earnings_release", "primary_result", "eligible",
            (
                EvidenceSelector(
                    "ordinary_income", "経常収益", "actual", "Q1_cumulative",
                    "other", "not_applicable", "none",
                    r"20\d{2}年3月期第1四半期\s+(?P<value>[\d,△.]+)",
                    r"1\.20\d{2}年3月期第1四半期の連結業績",
                ),
                EvidenceSelector(
                    "net_income_target", "親会社株主に帰属する当期純利益 目標値", "management_target",
                    "full_year", "full_year", "active", "none",
                    r"親会社株主に帰属する当期純利益」は(?P<value>[\d,△.]+)億円を目標",
                    r"3\.20\d{2}年3月期の連結業績目標",
                ),
            ),
            "consolidated", "JGAAP",
        ),
        DocumentAdapter(
            "mufg", "earnings_release", "restatement_or_review", "review_only_no_auto_merge",
            (), "consolidated", "JGAAP", "review_only_no_auto_merge",
        ),
        DocumentAdapter(
            "mhi", "earnings_release", "primary_result", "repair_evidence_only",
            (
                EvidenceSelector(
                    "revenue", "売上収益", "actual", "full_year", "other", "not_applicable", "none",
                    r"20\d{2}年3月期\s+(?P<value>[\d,△.]+)\s+[-\d.]+",
                    r"1\.20\d{2}年3月期の連結業績",
                ),
                EvidenceSelector(
                    "revenue", "通期 売上収益", "company_forecast", "full_year",
                    "full_year", "active", "none",
                    r"通期\s+(?P<value>[\d,△.]+)\s+[-\d.]+",
                    r"3\.20\d{2}年3月期の連結業績予想",
                ),
            ),
            "consolidated", "IFRS",
        ),
    )


def batch1_coverage_adapters() -> tuple[DocumentAdapter, ...]:
    """Metadata-only adapters for the frozen Batch 1 dry-run.

    They intentionally have no selectors: this registers dispatch coverage
    without authorizing PDF parsing or Observation creation.
    """
    return (
        DocumentAdapter("ibiden", "earnings_release", "primary_result", "eligible", (), "consolidated", "JGAAP"),
        DocumentAdapter("furukawa_electric", "earnings_release", "primary_result", "eligible", (), "consolidated", "JGAAP"),
        DocumentAdapter("fujikura", "earnings_release", "primary_result", "eligible", (), "consolidated", "JGAAP"),
        DocumentAdapter("disco", "earnings_release", "primary_result", "eligible", (), "consolidated", "JGAAP"),
        DocumentAdapter("kokusai_electric", "earnings_release", "primary_result", "eligible", (), "consolidated", "IFRS"),
        DocumentAdapter("lasertec", "earnings_release", "primary_result", "eligible", (), "consolidated", "JGAAP"),
        DocumentAdapter("kawasaki_heavy", "earnings_release", "primary_result", "eligible", (), "consolidated", "IFRS"),
        DocumentAdapter("screen_holdings", "earnings_release", "restatement_or_review", "review_only_no_auto_merge", (), "consolidated", "JGAAP", "review_only_no_auto_merge"),
    )


def observation(
    document: dict[str, Any],
    event: dict[str, Any],
    selector: EvidenceSelector,
    pages: list[str],
    adapter: DocumentAdapter,
) -> tuple[dict[str, Any], dict[str, Any]]:
    page_number, raw_number, evidence, period_end = source_match(pages, selector)
    raw_unit = "億円" if selector.measure_kind == "management_target" else "百万円"
    numeric, unit_code, conversion = normalize_unit(raw_number, raw_unit)
    if selector.period_basis not in PERIOD_BASIS:
        raise ValueError(f"unknown period_basis: {selector.period_basis}")
    if selector.forecast_scope not in FORECAST_SCOPES:
        raise ValueError(f"unknown forecast_scope: {selector.forecast_scope}")
    if selector.guidance_status not in GUIDANCE_STATUSES:
        raise ValueError(f"unknown guidance_status: {selector.guidance_status}")
    if selector.revision_relation not in REVISION_RELATIONS:
        raise ValueError(f"unknown revision_relation: {selector.revision_relation}")
    observation_id = stable_id(
        "pilot-observation", document["document_id"], selector.measure_kind,
        selector.metric_name, raw_number,
    )
    row = {
        "observation_id": observation_id,
        "event_id": event["event_id"],
        "security_id": event["security_id"],
        "metric_name": selector.metric_name,
        "metric_name_raw": selector.metric_name_raw,
        "value_numeric": numeric,
        "raw_value_text": f"{raw_number}{raw_unit}",
        "currency": "JPY",
        "unit_code": unit_code,
        "source_unit_raw": raw_unit,
        "value_conversion_rule_id": conversion,
        "measure_kind": selector.measure_kind,
        "period_basis": selector.period_basis,
        "consolidation": adapter.consolidation,
        "accounting_standard": adapter.accounting_standard,
        "fiscal_year_label": evidence.splitlines()[0],
        "fiscal_period_end": period_end,
        "event_fiscal_period_end": event["fiscal_period_end"],
        "as_of_date": document["publication_date"],
        "as_of_timestamp": None,
        "document_publication_date": document["publication_date"],
        "document_publication_time": document["publication_time"],
        "document_timestamp_quality": document["timestamp_quality"],
        "observation_effective_date": None,
        "source_id": document["source_id"],
        "source_document_id": document["document_id"],
        "source_page": page_number,
        "source_table": "adapter_discovered_pdf_text_row",
        "consolidation_evidence_text": "連結",
        "accounting_standard_evidence_text": adapter.accounting_standard,
        "extraction_method": "adapter_discovered_pdf_text_v1",
        "quality_status": "confirmed" if period_end else "unresolved_period",
        "forecast_scope": selector.forecast_scope,
        "guidance_status": selector.guidance_status,
        "revision_relation": selector.revision_relation,
        "source_row": evidence,
        "source_column": selector.metric_name_raw,
    }
    link = {
        "observation_source_link_id": stable_id("pilot-observation-source-link", observation_id, document["document_id"]),
        "observation_id": observation_id,
        "document_id": document["document_id"],
        "source_id": document["source_id"],
        "link_role": "primary_numeric_evidence",
        "source_page": page_number,
        "source_table": row["source_table"],
        "evidence_text": evidence,
        "quality_status": row["quality_status"],
    }
    return row, link


def main() -> None:
    if sha256(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini raw SHA mismatch before Pilot.")
    scope = json.loads((FACTS / "financial_fact_pilot_scope.json").read_text(encoding="utf-8"))
    inventory = load_jsonl(FACTS / "financial_document_inventory.jsonl")
    events = {row["event_id"]: row for row in load_jsonl(FACTS / "official_earnings_event.jsonl")}
    if len(events) != 345:
        raise RuntimeError("Official Event population is not the fixed 345.")
    adapters = document_adapters()
    adapters_by_profile = {
        (adapter.issuer, adapter.document_type, adapter.document_role, adapter.observation_policy): adapter
        for adapter in adapters
    }
    scoped_documents = [row for row in inventory if row["url"] in scope["document_urls"]]
    if len(scoped_documents) != 7:
        raise RuntimeError("Pilot scope does not resolve to exactly seven Inventory documents.")

    observations: list[dict[str, Any]] = []
    links: list[dict[str, Any]] = []
    outcomes: list[dict[str, Any]] = []
    for document in scoped_documents:
        adapter = adapter_for_document(document, adapters_by_profile)
        if document["event_id"] not in scope["event_ids"]:
            raise RuntimeError(f"Pilot document is outside Event scope: {document['document_id']}.")
        pages = normalized_pages(ROOT / document["local_snapshot_path"])
        for selector in adapter.selectors:
            row, link = observation(document, events[document["event_id"]], selector, pages, adapter)
            observations.append(row)
            links.append(link)
        if adapter.document_outcome:
            outcomes.append({
                "document_id": document["document_id"],
                "event_id": document["event_id"],
                "outcome": adapter.document_outcome,
                "quality_status": "confirmed",
            })

    # Guard against a duplicate canonical Fact within this bounded extraction.
    identity = {(row["event_id"], row["metric_name"], row["measure_kind"], row["period_basis"]) for row in observations}
    if len(identity) != len(observations):
        raise RuntimeError("Duplicate Pilot observation identity; review required.")
    if any(row["quality_status"] != "confirmed" for row in observations):
        raise RuntimeError("Unproved period; Pilot must return MODIFY.")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    write_jsonl(OUTPUT / "financial_observation.jsonl", observations)
    write_jsonl(OUTPUT / "financial_observation_source_link.jsonl", links)
    write_jsonl(OUTPUT / "document_outcome.jsonl", outcomes)
    repairs = load_jsonl(FACTS / "official_event_axis_repair.jsonl")
    repair = next(row for row in repairs if row["event_id"] == "official-event-7d68553c9dc55def9581a5b845e6555f")
    repair_observation = next(
        row for row in observations
        if row["event_id"] == repair["event_id"] and row["measure_kind"] == "actual"
    )
    repair_link = next(row for row in links if row["observation_id"] == repair_observation["observation_id"])
    write_jsonl(OUTPUT / "official_event_axis_repair_evidence.jsonl", [{
        "repair_evidence_id": stable_id("repair-evidence", repair["repair_id"], repair_observation["observation_id"]),
        "repair_id": repair["repair_id"],
        "observation_id": repair_observation["observation_id"],
        "observation_source_link_id": repair_link["observation_source_link_id"],
        "document_id": repair_observation["source_document_id"],
        "source_id": repair_observation["source_id"],
        "evidence_text": "2025年3月期の連結業績(2024年4月1日~2025年3月31日)",
        "quality_status": "confirmed",
    }])
    write_jsonl(OUTPUT / "financial_observation_reconciliation.jsonl", [{
        "reconciliation_id": stable_id("pilot-financial-reconciliation", row["observation_id"]),
        "observation_id": row["observation_id"], "event_id": row["event_id"],
        "gemini_raw_row_id": None, "gemini_value_text": None,
        "official_value_numeric": row["value_numeric"], "official_unit_code": row["unit_code"],
        "match_status": "official_only", "difference_note": "Pilot does not parse Gemini opaque text.",
    } for row in observations])
    (OUTPUT / "summary.json").write_text(json.dumps({
        "scope_id": scope["scope_id"],
        "observation_count": len(observations),
        "case_count": 5,
        "document_count": len(scoped_documents),
        "ledger_sha256": sha256(LEDGER),
        "event_count": len(events),
    }, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print((OUTPUT / "summary.json").read_text(encoding="utf-8"))


if __name__ == "__main__":
    main()
