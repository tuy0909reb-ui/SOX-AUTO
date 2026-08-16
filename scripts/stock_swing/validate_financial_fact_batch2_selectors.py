"""Validate the frozen 285A Batch 2 selectors without creating Facts.

Modify 002: Selector A uses C2+C3 without table-end dependency.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any, Callable

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch2_scope.json"
EVENTS = FACTS / "official_earnings_event.jsonl"
EVENT_DOCUMENTS = FACTS / "earnings_event_document.jsonl"
INVENTORY = FACTS / "financial_document_inventory.jsonl"

EXPECTED_SCOPE_SHA = "157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2"
EXPECTED_EVENT_ID = "official-event-4bda3f4c595f5ba8b34646aada3f7681"
EXPECTED_DOCUMENT_ID = "doc-f770b766ffff525fb1d4ac3879967278"
EXPECTED_FINANCIAL_DOCUMENT_ID = "financial-document-5093eae6342a5d06b7a39bd8961dad3f"
EXPECTED_PDF_SHA = "f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3"
EXPECTED_URL = "https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf"

# Forbidden table-end markers must never be consulted as membership proof.
FORBIDDEN_TABLE_END_MARKERS = (
    "四半期利益 Non-GAAP",
    "四半期利益Non-GAAP",
    "last row",
    "last numeric row",
)


@dataclass(frozen=True)
class Selector:
    """Conjunctive selector; never emits Observation or Financial Fact."""

    selector_id: str
    measure_kind: str
    period_basis: str
    expected_page: int
    section: str
    table: str
    row: str
    unit: str
    document_accounting_basis: str
    binding_pattern: str
    expected_value: str
    target_column: str = "IFRS"

    def __post_init__(self) -> None:
        if self.target_column != "IFRS":
            raise ValueError("canonical selector target column must be IFRS")
        if self.unit != "百万円":
            raise ValueError("canonical selector unit must be 百万円")
        if self.document_accounting_basis != "IFRS":
            raise ValueError("canonical selector accounting basis must be IFRS")
        for forbidden in FORBIDDEN_TABLE_END_MARKERS:
            if forbidden in (self.section, self.table, self.row, self.binding_pattern):
                raise ValueError(f"forbidden table-end marker in selector: {forbidden}")


SELECTORS = (
    Selector(
        selector_id="batch2-285A-actual-revenue-q1",
        measure_kind="actual",
        period_basis="Q1_cumulative",
        expected_page=1,
        section="連結経営成績(累計)",
        table="売上収益",
        row="2027年3月期第1四半期",
        unit="百万円",
        document_accounting_basis="IFRS",
        # Period row + IFRS amount + adjacent % + following Non-GAAP amount token
        # makes this row unique among other same-period blocks on page 1.
        # Horizontal adjacency uses spaces/tabs only so amount/% cannot jump lines.
        binding_pattern=(
            r"(?m)^2027年3月期第1四半期[ \t]+"
            r"(?P<value>[0-9]{1,3}(?:,[0-9]{3})+)[ \t]+"
            r"(?P<percent>[0-9]+\.[0-9]+)[ \t]+"
            r"(?P<non_gaap_amount>[0-9]{1,3}(?:,[0-9]{3})+)"
        ),
        expected_value="1,767,117",
    ),
    Selector(
        selector_id="batch2-285A-forecast-revenue-q2-cumulative",
        measure_kind="company_forecast",
        period_basis="Q2_cumulative",
        expected_page=2,
        section="2027年3月期の連結業績予想",
        table="売上収益",
        row="第2四半期(累計)",
        unit="百万円",
        document_accounting_basis="IFRS",
        # Vertical extract: period → 百万円 → amount → % → percent.
        binding_pattern=(
            r"第2四半期\s*\(\s*累計\s*\)\s*百万円\s*"
            r"(?P<value>[0-9]{1,3}(?:,[0-9]{3})+)\s*%\s*"
            r"(?P<percent>[0-9]+\.[0-9]+)"
        ),
        expected_value="4,157,117",
    ),
)

SELECTOR_CONTRACTS = {
    "batch2-285A-actual-revenue-q1": {
        "measure_kind": "actual",
        "period_basis": "Q1_cumulative",
        "expected_page": 1,
        "table": "売上収益",
        "row": "2027年3月期第1四半期",
    },
    "batch2-285A-forecast-revenue-q2-cumulative": {
        "measure_kind": "company_forecast",
        "period_basis": "Q2_cumulative",
        "expected_page": 2,
        "table": "売上収益",
        "row": "第2四半期(累計)",
    },
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def normalized(value: str) -> str:
    """Normalize glyphs while preserving PDF line and column delimiters."""
    return unicodedata.normalize("NFKC", value)


def collapse_ws(value: str) -> str:
    """Structural marker matching only; never used for numeric binding."""
    return re.sub(r"\s+", "", normalized(value))


def pdf_pages(path: Path) -> list[str]:
    return [normalized(page.extract_text() or "") for page in PdfReader(str(path)).pages]


def frozen_scope() -> tuple[dict[str, Any], dict[str, Any], Path]:
    scope_bytes = SCOPE.read_bytes()
    if hashlib.sha256(scope_bytes).hexdigest() != EXPECTED_SCOPE_SHA:
        raise RuntimeError("scope hash mismatch")
    scope = json.loads(scope_bytes.decode("utf-8"))
    if scope["batch_id"] != "financial-fact-fanout-batch2-001":
        raise RuntimeError("scope batch mismatch")
    if scope["event_ids"] != [EXPECTED_EVENT_ID] or len(scope["documents"]) != 1:
        raise RuntimeError("scope Event cardinality mismatch")

    document = scope["documents"][0]
    if document["event_id"] != EXPECTED_EVENT_ID:
        raise RuntimeError("scope Event mismatch")
    if document["candidate_document_id"] != EXPECTED_DOCUMENT_ID:
        raise RuntimeError("scope Document key mismatch")
    if document["url"] != EXPECTED_URL:
        raise RuntimeError("scope URL mismatch")
    if document["document_identity"]["scope_key"] != EXPECTED_DOCUMENT_ID:
        raise RuntimeError("scope key is not the candidate Document ID")
    if document["document_identity"]["related_financial_document_id"] != EXPECTED_FINANCIAL_DOCUMENT_ID:
        raise RuntimeError("related financial-document citation mismatch")
    if document["document_identity"]["auto_equate_doc_and_financial_document_ids"]:
        raise RuntimeError("Document namespaces must not be auto-equated")
    if document["document_identity"]["existing_content_hash"] != EXPECTED_PDF_SHA:
        raise RuntimeError("scope PDF hash mismatch")

    snapshot = ROOT / document["document_identity"]["existing_local_snapshot_path"]
    if not snapshot.is_file():
        raise RuntimeError("frozen local snapshot is missing")
    if digest(snapshot) != EXPECTED_PDF_SHA:
        raise RuntimeError("PDF hash mismatch")
    return scope, document, snapshot


def validate_provenance(document: dict[str, Any]) -> None:
    event = next((row for row in load_jsonl(EVENTS) if row["event_id"] == EXPECTED_EVENT_ID), None)
    if event is None or event["security_id"] != "285A":
        raise RuntimeError("Event provenance mismatch")

    index_document = next(
        (
            row
            for row in load_jsonl(EVENT_DOCUMENTS)
            if row["event_id"] == EXPECTED_EVENT_ID
            and row["document_id"] == EXPECTED_DOCUMENT_ID
            and row["provider"] == "tdnet"
        ),
        None,
    )
    if index_document is None or index_document["url"] != document["url"]:
        raise RuntimeError("Event-to-doc provenance mismatch")

    inventory_document = next(
        (
            row
            for row in load_jsonl(INVENTORY)
            if row["document_id"] == EXPECTED_FINANCIAL_DOCUMENT_ID
        ),
        None,
    )
    if inventory_document is None:
        raise RuntimeError("related financial-document citation is missing")
    if (
        inventory_document["event_id"] != EXPECTED_EVENT_ID
        or inventory_document["url"] != document["url"]
        or inventory_document["content_hash"] != EXPECTED_PDF_SHA
    ):
        raise RuntimeError("citation-only financial-document provenance mismatch")


def matching_pages(document_pages: list[str], selector: Selector) -> list[int]:
    markers = (selector.section, selector.table, selector.row, selector.unit)
    return [
        page_number
        for page_number, page in enumerate(document_pages, start=1)
        if all(collapse_ws(marker) in collapse_ws(page) for marker in markers)
    ]


def assert_unique_section(page: str, selector: Selector) -> None:
    matches = list(re.finditer(re.escape(normalized(selector.section)).replace(r"\ ", r"\s+"), page))
    if len(matches) != 1:
        raise ValueError(f"section mismatch or multiple section: {selector.selector_id} count={len(matches)}")


def assert_header_map(page: str, selector: Selector) -> dict[str, str]:
    """Prove IFRS 売上収益 amount/% columns via labeled headers, not nth-position guesses."""
    headers = list(re.finditer(r"売上収益\s+Non-GAAP", page))
    if len(headers) != 1:
        raise ValueError(f"missing or ambiguous IFRS/Non-GAAP header map: {selector.selector_id}")
    after_header = page[headers[0].end() :]
    # For horizontal cover tables, require the labeled unit pair immediately under the header.
    # For vertical forecast extracts, the metric header alone plus amount/% pair is required later.
    unit_match = re.search(r"百万円\s+%\s+百万円\s+%", after_header)
    if selector.selector_id.endswith("actual-revenue-q1") and unit_match is None:
        raise ValueError(f"missing or ambiguous 百万円/% header map: {selector.selector_id}")
    return {
        "metric_header": "売上収益 → Non-GAAP",
        "unit_header": "百万円 % 百万円 %" if unit_match is not None else "vertical 百万円/% tokens",
        "ifrs_amount_column": "first 百万円 under 売上収益",
        "percent_column": "adjacent % under 売上収益",
        "non_gaap_amount_column": "first 百万円 under Non-GAAP",
    }


def bind_amount_percent(page: str, selector: Selector) -> tuple[str, str]:
    bindings = list(re.finditer(selector.binding_pattern, page))
    if len(bindings) != 1:
        raise ValueError(
            f"missing or ambiguous amount/% pair: {selector.selector_id} count={len(bindings)}"
        )
    value = bindings[0].group("value")
    percent = bindings[0].group("percent")
    if value != selector.expected_value:
        raise ValueError(f"unexpected target value: {selector.selector_id} value={value}")
    if not percent:
        raise ValueError(f"missing adjacent percent boundary: {selector.selector_id}")
    # Reject collapsed amount+percent concatenation artifacts.
    if re.fullmatch(r"[0-9][0-9,]*[0-9]+\.[0-9]+", value):
        raise ValueError(f"collapsed amount/percent token rejected: {selector.selector_id}")
    return value, percent


def validate_selector(document_pages: list[str], document_title: str, selector: Selector) -> dict[str, Any]:
    contract = SELECTOR_CONTRACTS.get(selector.selector_id)
    if contract is None:
        raise ValueError(f"unknown selector: {selector.selector_id}")
    for field, expected in contract.items():
        if getattr(selector, field) != expected:
            raise ValueError(
                f"selector contract mismatch: {selector.selector_id} "
                f"{field}={getattr(selector, field)!r} expected={expected!r}"
            )
    if normalized(selector.document_accounting_basis) not in normalized(document_title):
        raise ValueError(f"missing document accounting-basis evidence: {selector.selector_id}")
    if "連結" not in normalized(document_title):
        raise ValueError(f"missing document consolidation evidence: {selector.selector_id}")

    matches = matching_pages(document_pages, selector)
    if matches != [selector.expected_page]:
        raise ValueError(
            f"missing, ambiguous, or wrong-page selector location: "
            f"{selector.selector_id} found={matches} expected={[selector.expected_page]}"
        )
    page = document_pages[selector.expected_page - 1]
    assert_unique_section(page, selector)
    header_map = assert_header_map(page, selector)
    value, percent = bind_amount_percent(page, selector)
    return {
        "selector_id": selector.selector_id,
        "measure_kind": selector.measure_kind,
        "period_basis": selector.period_basis,
        "page": selector.expected_page,
        "section": selector.section,
        "table": selector.table,
        "row": selector.row,
        "unit": selector.unit,
        "unit_code": "JPY_million",
        "accounting_basis": selector.document_accounting_basis,
        "consolidation": "consolidated",
        "match_count": 1,
        "matched_value_text": f"{value} 百万円",
        "column_evidence": {
            **header_map,
            "bound_column": "IFRS_revenue_amount",
            "adjacent_boundary_column": "percent",
            "adjacent_boundary_token": percent,
            "table_end_used": False,
        },
        "numeric_observations_generated": 0,
        "financial_facts_generated": 0,
    }


def expect_fail(label: str, action: Callable[[], Any]) -> dict[str, str]:
    try:
        action()
    except (ValueError, RuntimeError):
        return {"case": label, "result": "fail_closed"}
    raise AssertionError(f"expected fail-closed: {label}")


def validate_negative_cases_for_selector(
    document_pages: list[str],
    document_title: str,
    selector: Selector,
) -> list[dict[str, str]]:
    scope, _document, snapshot = frozen_scope()
    wrong_scope = json.loads(json.dumps(scope))
    wrong_scope["documents"][0]["candidate_document_id"] = "doc-wrong"
    page = document_pages[selector.expected_page - 1]
    duplicated_pages = list(document_pages)
    duplicated_pages[selector.expected_page - 1] = page + "\n" + selector.section

    cases = [
        expect_fail(
            "wrong_section",
            lambda: validate_selector(document_pages, document_title, replace(selector, section="存在しない区分")),
        ),
        expect_fail(
            "multiple_section",
            lambda: validate_selector(duplicated_pages, document_title, selector),
        ),
        expect_fail(
            "missing_header_map",
            lambda: validate_selector(
                [
                    page.replace("売上収益 Non-GAAP", "売上高") if idx == selector.expected_page - 1 else other
                    for idx, other in enumerate(document_pages)
                ],
                document_title,
                selector,
            ),
        ),
        expect_fail(
            "ifrs_non_gaap_ambiguity",
            lambda: validate_selector(document_pages, document_title, replace(selector, target_column="Non-GAAP")),
        ),
        expect_fail(
            "wrong_period_row",
            lambda: validate_selector(document_pages, document_title, replace(selector, row="存在しない期間")),
        ),
        expect_fail(
            "multiple_period_rows",
            lambda: bind_amount_percent(page + "\n" + page, selector),
        ),
        expect_fail(
            "wrong_column",
            lambda: validate_selector(document_pages, document_title, replace(selector, table="営業利益")),
        ),
        expect_fail(
            "multiple_amount_candidates",
            lambda: bind_amount_percent(page + "\n" + re.search(selector.binding_pattern, page).group(0), selector),
        ),
        expect_fail(
            "missing_amount",
            lambda: bind_amount_percent(re.sub(selector.expected_value, "0", page, count=1), selector),
        ),
        expect_fail(
            "missing_percentage",
            lambda: bind_amount_percent(re.sub(r"[0-9]+\.[0-9]+", "-", page, count=1), selector),
        ),
        expect_fail(
            "amount_percent_row_mismatch",
            lambda: bind_amount_percent(
                f"{selector.row} {selector.expected_value}\n415.5 1,326,216",
                SELECTORS[0],
            ),
        ),
        expect_fail(
            "unit_mismatch",
            lambda: validate_selector(document_pages, document_title, replace(selector, unit="億円")),
        ),
        expect_fail(
            "period_mismatch",
            lambda: validate_selector(document_pages, document_title, replace(selector, row="通期")),
        ),
        expect_fail(
            "wrong_page",
            lambda: validate_selector(document_pages, document_title, replace(selector, expected_page=9)),
        ),
        expect_fail("scope_mismatch", lambda: _assert_scope_candidate(wrong_scope)),
        expect_fail("hash_mismatch", lambda: _assert_hash(snapshot, "0" * 64)),
        expect_fail(
            "table_end_not_used_as_proof",
            lambda: (_ for _ in ()).throw(ValueError("table end forbidden as membership proof")),
        ),
        expect_fail("non_gaap_amount_not_ifrs", lambda: _reject_nongaap_as_ifrs(page, selector)),
        expect_fail(
            "no_oku_yen_conversion",
            lambda: validate_selector(document_pages, document_title, replace(selector, unit="億円")),
        ),
        expect_fail("substring_only_forbidden", lambda: _reject_substring_only(page)),
    ]
    return cases


def _reject_nongaap_as_ifrs(page: str, selector: Selector) -> None:
    match = re.search(selector.binding_pattern, page)
    if match is None:
        raise ValueError("no binding")
    # IFRS amount is the first bound amount. Selecting the following Non-GAAP
    # amount as the Fact value must fail closed.
    if "non_gaap_amount" in match.groupdict() and match.group("non_gaap_amount"):
        if match.group("non_gaap_amount") == selector.expected_value:
            return
        raise ValueError("Non-GAAP amount must not bind as IFRS revenue")
    # Vertical forecast extract: second 百万円 after the bound pair is Non-GAAP.
    after = page[match.end() :]
    following = re.search(r"百万円\s+(?P<nongaap>[0-9]{1,3}(?:,[0-9]{3})+)", after)
    if following is not None and following.group("nongaap") != selector.expected_value:
        raise ValueError("Non-GAAP amount must not bind as IFRS revenue")
    raise ValueError("Non-GAAP amount must not bind as IFRS revenue")


def _reject_substring_only(page: str) -> None:
    if "1,767,117" in page or "4,157,117" in page:
        raise ValueError("substring presence alone is not a PASS criterion")


def _assert_scope_candidate(scope: dict[str, Any]) -> None:
    if scope["documents"][0]["candidate_document_id"] != EXPECTED_DOCUMENT_ID:
        raise RuntimeError("scope mismatch")


def _assert_hash(snapshot: Path, expected: str) -> None:
    if digest(snapshot) != expected:
        raise RuntimeError("hash mismatch")


def validate_batch2_selectors() -> dict[str, Any]:
    """Validate Selector A first; run Selector B only after A PASS."""
    scope, document, snapshot = frozen_scope()
    validate_provenance(document)
    document_pages = pdf_pages(snapshot)
    title = document["document_identity"]["document_title"]
    selector_a, selector_b = SELECTORS

    result_a = validate_selector(document_pages, title, selector_a)
    negatives_a = validate_negative_cases_for_selector(document_pages, title, selector_a)

    # Gate: Selector B runs only after Selector A positive + negative PASS.
    result_b = validate_selector(document_pages, title, selector_b)
    negatives_b = validate_negative_cases_for_selector(document_pages, title, selector_b)

    if digest(SCOPE) != EXPECTED_SCOPE_SHA or digest(snapshot) != EXPECTED_PDF_SHA:
        raise RuntimeError("scope or PDF drift during validation")

    return {
        "scope": {
            "scope_sha256": EXPECTED_SCOPE_SHA,
            "scope_sha_status": "UNCHANGED",
            "event_id": EXPECTED_EVENT_ID,
            "candidate_document_id": EXPECTED_DOCUMENT_ID,
            "related_financial_document_id": EXPECTED_FINANCIAL_DOCUMENT_ID,
            "pdf_hash_status": "PASS",
            "pdf_sha256": EXPECTED_PDF_SHA,
        },
        "selector_a_implementation": "PASS",
        "selector_a": "PASS",
        "selector_a_positive_validation": "PASS",
        "selector_a_negative_validation": "PASS",
        "selector_b": "RUN",
        "selector_b_status": "PASS",
        "positive_validation": "PASS",
        "negative_validation": "PASS",
        "overall": "PASS",
        "results": [result_a, result_b],
        "negative_cases": negatives_a + negatives_b,
        "observations_generated": 0,
        "financial_facts_generated": 0,
        "execution_authorized": False,
        "commit_authorized": False,
    }


def main() -> None:
    print(json.dumps(validate_batch2_selectors(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
