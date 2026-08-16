"""Validate Batch 4 revenue numeric bindings without emitting Observations/Facts.

The validator consumes the frozen Batch 4 scope and its existing official PDF
snapshots. It proves a single first-column revenue candidate on the exact
actual row, while synthetic negative cases must fail closed.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Callable

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch4_scope.json"
SCOPE_SHA = FACTS / "financial_fact_fanout_batch4_scope.sha256"
OUTPUT = FACTS / "financial_fact_fanout_batch4_numeric_binding_validation_001"
EXPECTED_SCOPE_SHA = "c27f20e039d58604b809d63dea11a272bb36ce121c9c41aa19ff4c5495f6b1a2"


@dataclass(frozen=True)
class NumericBinding:
    binding_id: str
    event_id: str
    document_id: str
    url: str
    content_hash: str
    selector_id: str
    period_basis: str
    exact_actual_row: str
    prior_year_row: str
    expected_value: str
    revenue_column_index: int = 0
    page: int = 1
    actual_section: str = "連結経営成績"
    forecast_section: str = "連結業績予想"
    table: str = "売上高"
    unit: str = "百万円"


BINDINGS = (
    NumericBinding(
        "batch4-5803-actual-revenue-q1-numeric",
        "official-event-51acad93687c5010b1dd6baef0d4faff",
        "doc-8cc5ba087bc65cad9b57aadbb7802607",
        "https://www2.jpx.co.jp/disc/58030/140120250806532719.pdf",
        "32ac32bbac319249264f33c371f45dd5a3c58dd41076f0455cba875f9c912e6c",
        "batch4-5803-actual-revenue-q1",
        "Q1_cumulative",
        "2026年3月期第1四半期",
        "2025年3月期第1四半期",
        "267,908",
    ),
    NumericBinding(
        "batch4-5803-actual-revenue-q2-numeric",
        "official-event-d07fea2491fa5707a32e077f34c83e0d",
        "doc-c13419293b865b8eb1f83311dd0b2660",
        "https://www2.jpx.co.jp/disc/58030/140120251106589866.pdf",
        "b88c7405897f212adf282102818b5cde85762c0c37ff2b83ef3e298a3fa9c1d3",
        "batch4-5803-actual-revenue-q2",
        "Q2_cumulative",
        "2026年3月期中間期",
        "2025年3月期中間期",
        "558,994",
    ),
    NumericBinding(
        "batch4-5803-actual-revenue-q3-numeric",
        "official-event-d01b67f7bdd85249ac0800fac0ed3bb5",
        "doc-1467205d56d15181a56a163e278528e2",
        "https://www2.jpx.co.jp/disc/58030/140120260206550168.pdf",
        "62596375127db3e3228e846a8d9f94aea52c5c28c787c83246aa235304246bed",
        "batch4-5803-actual-revenue-q3",
        "Q3_cumulative",
        "2026年3月期第3四半期",
        "2025年3月期第3四半期",
        "854,931",
    ),
)


def normalized(value: str) -> str:
    return unicodedata.normalize("NFKC", value)


def collapse(value: str) -> str:
    return re.sub(r"\s+", "", normalized(value))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_scope() -> dict:
    if digest(SCOPE) != EXPECTED_SCOPE_SHA:
        raise ValueError("frozen Batch 4 scope SHA-256 mismatch")
    if SCOPE_SHA.read_text(encoding="utf-8").split()[0] != EXPECTED_SCOPE_SHA:
        raise ValueError("recorded Batch 4 scope SHA-256 mismatch")
    return json.loads(SCOPE.read_text(encoding="utf-8"))


def document_for(scope: dict, binding: NumericBinding) -> dict:
    matches = [
        row
        for row in scope["documents"]
        if row["event_id"] == binding.event_id
        and row["candidate_document_id"] == binding.document_id
    ]
    if len(matches) != 1:
        raise ValueError("scope Event/Document identity is not unique")
    return matches[0]


def assert_identity(scope: dict, binding: NumericBinding) -> Path:
    document = document_for(scope, binding)
    identity = document["document_identity"]
    if document["url"] != binding.url:
        raise ValueError("official URL mismatch")
    if identity["existing_content_hash"] != binding.content_hash:
        raise ValueError("official snapshot SHA-256 mismatch")
    if identity["provider"] != "tdnet" or identity["source_priority"] != 1:
        raise ValueError("non-primary official source")
    boundaries = document["candidate_fact_boundaries"]
    expected_boundary = {
        "Q1_cumulative": "actual_revenue_q1",
        "Q2_cumulative": "actual_revenue_q2",
        "Q3_cumulative": "actual_revenue_q3",
    }[binding.period_basis]
    boundary = boundaries.get(expected_boundary)
    if boundary is None or boundary["selector_id"] != binding.selector_id:
        raise ValueError("selector / period boundary mismatch")
    if boundary["exact_actual_row"] != binding.exact_actual_row:
        raise ValueError("actual row boundary mismatch")
    snapshot = ROOT / identity["existing_local_snapshot_path"]
    if not snapshot.is_file() or digest(snapshot) != binding.content_hash:
        raise ValueError("local snapshot content drift")
    return snapshot


def pdf_page(snapshot: Path, page: int) -> str:
    pages = [normalized(pdf_page.extract_text() or "") for pdf_page in PdfReader(str(snapshot)).pages]
    if page != 1 or len(pages) < page:
        raise ValueError("expected page must be available page 1")
    return pages[page - 1]


def structural_candidate_lines(page: str, binding: NumericBinding) -> list[tuple[int, str, str]]:
    """Return exact-row candidates only when the nearby header proves revenue column 0."""
    if binding.revenue_column_index != 0:
        raise ValueError("revenue must bind the first column only")
    if binding.actual_section != "連結経営成績":
        raise ValueError("actual section must be 連結経営成績")
    if binding.forecast_section != "連結業績予想":
        raise ValueError("forecast exclusion boundary drift")

    text = normalized(page)
    compact = collapse(text)
    required = (
        binding.actual_section,
        binding.table,
        binding.unit,
        binding.exact_actual_row,
    )
    if not all(collapse(marker) in compact for marker in required):
        raise ValueError("required actual-row marker missing")
    actual_at = compact.find(collapse(binding.actual_section))
    forecast_at = compact.find(collapse(binding.forecast_section))
    if actual_at < 0 or 0 <= forecast_at < actual_at:
        raise ValueError("forecast / actual section ordering invalid")

    lines = [normalized(line).strip() for line in text.splitlines() if line.strip()]
    candidates: list[tuple[int, str, str]] = []
    for index, line in enumerate(lines):
        if not re.match(rf"^{re.escape(binding.exact_actual_row)}(?:\s|$)", line):
            continue
        context = lines[max(0, index - 3):index]
        headers = [
            previous
            for previous in context
            if collapse(binding.table) in collapse(previous)
        ]
        units = [previous for previous in context if collapse(binding.unit) in collapse(previous)]
        if len(headers) != 1 or not units:
            continue
        header = headers[0]
        if not re.match(rf"^\s*{re.escape(binding.table)}(?:\s|$)", header):
            raise ValueError("revenue is not the first header column")
        candidates.append((index, line, header))
    if len(candidates) != 1:
        raise ValueError(f"actual revenue row candidate is not unique: {len(candidates)}")
    return candidates


def bind_numeric_candidate(page: str, binding: NumericBinding) -> dict:
    candidates = structural_candidate_lines(page, binding)
    index, row, header = candidates[0]
    match = re.fullmatch(
        rf"{re.escape(binding.exact_actual_row)}\s+"
        r"(?P<value>[0-9]{1,3}(?:,[0-9]{3})+)"
        r"(?:\s+[0-9,△▲\-.]+)+",
        row,
    )
    if match is None:
        raise ValueError("first revenue numeric candidate missing or malformed")
    value = match.group("value")
    if value != binding.expected_value:
        raise ValueError("unexpected first revenue candidate")
    return {
        "page": binding.page,
        "section": binding.actual_section,
        "table": binding.table,
        "revenue_column_index": binding.revenue_column_index,
        "header": header,
        "row": binding.exact_actual_row,
        "candidate_value": value,
        "candidate_count": 1,
        "numeric_binding_only": True,
    }


def validate_binding(scope: dict, binding: NumericBinding) -> dict:
    snapshot = assert_identity(scope, binding)
    result = bind_numeric_candidate(pdf_page(snapshot, binding.page), binding)
    return {
        "binding_id": binding.binding_id,
        "event_id": binding.event_id,
        "document_id": binding.document_id,
        "selector_id": binding.selector_id,
        "period_basis": binding.period_basis,
        "snapshot_sha256": binding.content_hash,
        "implementation": "PASS",
        "positive_validation": "PASS",
        "numeric_binding": result,
    }


def expect_fail(case: str, callback: Callable[[], object]) -> dict:
    try:
        callback()
    except ValueError:
        return {"case": case, "result": "fail_closed"}
    raise AssertionError(f"{case} unexpectedly passed")


def negative_cases(scope: dict, binding: NumericBinding) -> list[dict]:
    snapshot = assert_identity(scope, binding)
    page = pdf_page(snapshot, binding.page)
    _index, source_row, _header = structural_candidate_lines(page, binding)[0]
    duplicate = f"\n{binding.table}\n{binding.unit}\n{source_row}\n"

    return [
        expect_fail(
            "wrong_column",
            lambda: bind_numeric_candidate(
                page, replace(binding, revenue_column_index=1)
            ),
        ),
        expect_fail(
            "prior_year_row",
            lambda: bind_numeric_candidate(
                page, replace(binding, exact_actual_row=binding.prior_year_row)
            ),
        ),
        expect_fail(
            "forecast_row",
            lambda: bind_numeric_candidate(
                page, replace(binding, actual_section="連結業績予想")
            ),
        ),
        expect_fail(
            "duplicate_numeric_candidate",
            lambda: bind_numeric_candidate(page + duplicate, binding),
        ),
        expect_fail(
            "period_mismatch",
            lambda: bind_numeric_candidate(
                page, replace(binding, exact_actual_row="存在しない期間")
            ),
        ),
        expect_fail(
            "actual_row_mismatch",
            lambda: bind_numeric_candidate(
                page, replace(binding, exact_actual_row="存在しない実績行")
            ),
        ),
        expect_fail(
            "document_mismatch",
            lambda: assert_identity(
                scope, replace(binding, document_id="doc-" + "0" * 32)
            ),
        ),
        expect_fail(
            "malformed_numeric_candidate",
            lambda: bind_numeric_candidate(
                page.replace(binding.expected_value, "not-a-number", 1), binding
            ),
        ),
    ]


def validate_batch4_numeric_bindings(write_log: bool = True) -> dict:
    scope = load_scope()
    if scope["max_documents"] != 3 or len(scope["documents"]) != 3:
        raise ValueError("Batch 4 Scope is not the frozen three-document set")
    results = [validate_binding(scope, binding) for binding in BINDINGS]
    negatives = [
        item for binding in BINDINGS for item in negative_cases(scope, binding)
    ]
    summary = {
        "record_id": "financial_fact_fanout_batch4_numeric_binding_validation_001",
        "scope_sha256": EXPECTED_SCOPE_SHA,
        "binding_count": len(BINDINGS),
        "results": results,
        "negative_cases": negatives,
        "overall": "PASS",
        "observations_generated": 0,
        "financial_facts_generated": 0,
        "fact_extraction_authorized": False,
        "acceptance_authorized": False,
        "commit_authorized": False,
        "event_sot_mutated": False,
        "gemini_input": False,
    }
    if write_log:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / "numeric_binding_validation_summary.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return summary


if __name__ == "__main__":
    print(json.dumps(validate_batch4_numeric_bindings(), ensure_ascii=False, indent=2))
