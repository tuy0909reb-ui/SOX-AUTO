"""Validate Batch 4 selector structure without extracting financial values.

This is limited to the Phase I 5803 Q1--Q3 inventory snapshots.  It validates
document-bound structural locations and synthetic fail-closed cases; it emits
no Observation, Financial Fact, or numeric extraction result.
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
INVENTORY = (
    FACTS
    / "financial_fact_fanout_batch4_phase1_inventory_001"
    / "inventory_manifest.json"
)
OUTPUT = FACTS / "financial_fact_fanout_batch4_selector_validation_001"


@dataclass(frozen=True)
class Selector:
    selector_id: str
    event_id: str
    document_id: str
    url: str
    content_hash: str
    period_basis: str
    exact_row: str
    period_marker: str
    expected_page: int = 1
    section: str = "連結経営成績"
    table: str = "売上高"
    unit: str = "百万円"
    forecast_section: str = "連結業績予想"


SELECTORS = (
    Selector(
        "batch4-5803-actual-revenue-q1",
        "official-event-51acad93687c5010b1dd6baef0d4faff",
        "doc-8cc5ba087bc65cad9b57aadbb7802607",
        "https://www2.jpx.co.jp/disc/58030/140120250806532719.pdf",
        "32ac32bbac319249264f33c371f45dd5a3c58dd41076f0455cba875f9c912e6c",
        "Q1_cumulative",
        "2026年3月期第1四半期",
        "第1四半期",
    ),
    Selector(
        "batch4-5803-actual-revenue-q2",
        "official-event-d07fea2491fa5707a32e077f34c83e0d",
        "doc-c13419293b865b8eb1f83311dd0b2660",
        "https://www2.jpx.co.jp/disc/58030/140120251106589866.pdf",
        "b88c7405897f212adf282102818b5cde85762c0c37ff2b83ef3e298a3fa9c1d3",
        "Q2_cumulative",
        "2026年3月期中間期",
        "中間期",
    ),
    Selector(
        "batch4-5803-actual-revenue-q3",
        "official-event-d01b67f7bdd85249ac0800fac0ed3bb5",
        "doc-1467205d56d15181a56a163e278528e2",
        "https://www2.jpx.co.jp/disc/58030/140120260206550168.pdf",
        "62596375127db3e3228e846a8d9f94aea52c5c28c787c83246aa235304246bed",
        "Q3_cumulative",
        "2026年3月期第3四半期",
        "第3四半期",
    ),
)


def normalized(value: str) -> str:
    return unicodedata.normalize("NFKC", value)


def collapse(value: str) -> str:
    return re.sub(r"\s+", "", normalized(value))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_inventory() -> dict:
    return json.loads(INVENTORY.read_text(encoding="utf-8"))


def document_for(inventory: dict, selector: Selector) -> dict:
    matches = [
        row
        for row in inventory["documents"]
        if row["event_id"] == selector.event_id
        and row["document_id"] == selector.document_id
    ]
    if len(matches) != 1:
        raise ValueError("selector Event/Document identity is not unique")
    return matches[0]


def assert_document_identity(inventory: dict, selector: Selector) -> Path:
    document = document_for(inventory, selector)
    expected = {
        "document_id": selector.document_id,
        "url": selector.url,
        "content_hash": selector.content_hash,
        "period_basis": selector.period_basis,
        "provider": "tdnet",
        "source_priority": 1,
    }
    for key, value in expected.items():
        if document.get(key) != value:
            raise ValueError(f"document identity mismatch: {key}")
    snapshot = ROOT / document["local_snapshot_path"]
    if not snapshot.is_file() or digest(snapshot) != selector.content_hash:
        raise ValueError("official snapshot SHA-256 mismatch")
    return snapshot


def pdf_pages(snapshot: Path) -> list[str]:
    return [normalized(page.extract_text() or "") for page in PdfReader(str(snapshot)).pages]


def _line_has_all(line: str, *markers: str) -> bool:
    compact = collapse(line)
    return all(collapse(marker) in compact for marker in markers)


def validate_page_structure(page: str, selector: Selector) -> dict:
    """Validate one actual-table row structurally, never reading its numeric value."""
    text = normalized(page)
    compact = collapse(text)
    markers = (
        selector.section,
        selector.table,
        selector.unit,
        selector.period_marker,
        selector.exact_row,
    )
    if not all(collapse(marker) in compact for marker in markers):
        raise ValueError("missing required structural marker")

    actual_index = compact.find(collapse(selector.section))
    forecast_index = compact.find(collapse(selector.forecast_section))
    if actual_index < 0:
        raise ValueError("actual section missing")
    if 0 <= forecast_index < actual_index:
        raise ValueError("forecast section precedes actual section")

    lines = [normalized(line).strip() for line in text.splitlines() if line.strip()]
    candidates: list[int] = []
    for index, line in enumerate(lines):
        # The target row must begin with its exact, current-year period label.
        if not re.match(rf"^{re.escape(selector.exact_row)}(?:\s|$)", line):
            continue
        context = lines[max(0, index - 3):index]
        if any(_line_has_all(previous, selector.table) for previous in context) and any(
            _line_has_all(previous, selector.unit) for previous in context
        ):
            candidates.append(index)

    if len(candidates) != 1:
        raise ValueError(f"actual row candidate is not unique: {len(candidates)}")

    source_row = lines[candidates[0]]
    if collapse(selector.forecast_section) in collapse(source_row):
        raise ValueError("forecast row selected")
    return {
        "page": selector.expected_page,
        "section": selector.section,
        "table": selector.table,
        "unit": selector.unit,
        "period_marker": selector.period_marker,
        "row": selector.exact_row,
        "structural_row_index": candidates[0],
        "numeric_value_read": False,
    }


def validate_selector(inventory: dict, selector: Selector) -> dict:
    snapshot = assert_document_identity(inventory, selector)
    pages = pdf_pages(snapshot)
    if selector.expected_page != 1 or len(pages) < selector.expected_page:
        raise ValueError("expected page is invalid")
    result = validate_page_structure(pages[selector.expected_page - 1], selector)
    return {
        "selector_id": selector.selector_id,
        "event_id": selector.event_id,
        "document_id": selector.document_id,
        "period_basis": selector.period_basis,
        "snapshot_sha256": selector.content_hash,
        "implementation": "PASS",
        "positive_validation": "PASS",
        "location": result,
    }


def expect_fail(case: str, callback: Callable[[], object]) -> dict:
    try:
        callback()
    except ValueError:
        return {"case": case, "result": "fail_closed"}
    raise AssertionError(f"{case} unexpectedly passed")


def negative_cases(inventory: dict, selector: Selector) -> list[dict]:
    snapshot = assert_document_identity(inventory, selector)
    page = pdf_pages(snapshot)[0]
    row = selector.exact_row
    # Synthetic structural rows contain no numeric values.
    duplicate = f"\n{selector.table}\n{selector.unit}\n{row}\n"
    wrong_period = replace(selector, period_marker="存在しない期間")
    wrong_row = replace(selector, exact_row="存在しない当期行")
    wrong_document = replace(selector, document_id="doc-" + "0" * 32)
    wrong_page = replace(selector, expected_page=2)

    return [
        expect_fail("period_mismatch", lambda: validate_page_structure(page, wrong_period)),
        expect_fail("row_mismatch", lambda: validate_page_structure(page, wrong_row)),
        expect_fail("document_mismatch", lambda: assert_document_identity(inventory, wrong_document)),
        expect_fail(
            "candidate_multiple",
            lambda: validate_page_structure(page + duplicate, selector),
        ),
        expect_fail(
            "page1_false_positive",
            lambda: validate_page_structure(page, replace(selector, exact_row="第1四半期")),
        ),
        expect_fail(
            "forecast_exclusion",
            lambda: validate_page_structure(
                f"{selector.forecast_section}\n{page}", selector
            ),
        ),
        expect_fail(
            "actual_row_non_unique",
            lambda: validate_page_structure(page + duplicate, selector),
        ),
        expect_fail("wrong_page", lambda: validate_selector(inventory, wrong_page)),
    ]


def validate_batch4_selectors(write_log: bool = True) -> dict:
    inventory = load_inventory()
    if inventory["member_count"] != 3 or inventory["security_id"] != "5803":
        raise ValueError("Batch 4 Inventory cohort is not the locked three-member set")
    if not all(row["work_track"] == "C" and row["terminal_state"] == "classified" for row in inventory["documents"]):
        raise ValueError("Batch 4 Inventory status drift")

    results = [validate_selector(inventory, selector) for selector in SELECTORS]
    negatives = [
        negative
        for selector in SELECTORS
        for negative in negative_cases(inventory, selector)
    ]
    summary = {
        "record_id": "financial_fact_fanout_batch4_selector_validation_001",
        "selector_count": len(SELECTORS),
        "results": results,
        "negative_cases": negatives,
        "overall": "PASS",
        "observations_generated": 0,
        "financial_facts_generated": 0,
        "fact_scope_proposal_authorized": False,
        "fact_scope_freeze_authorized": False,
        "fact_extraction_authorized": False,
        "acceptance_authorized": False,
        "commit_authorized": False,
        "event_sot_mutated": False,
        "gemini_input": False,
    }
    if write_log:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        (OUTPUT / "selector_validation_summary.json").write_text(
            json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return summary


if __name__ == "__main__":
    print(json.dumps(validate_batch4_selectors(), ensure_ascii=False, indent=2))
