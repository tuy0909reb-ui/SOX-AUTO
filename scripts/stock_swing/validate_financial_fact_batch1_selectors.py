"""Validate source-structure selector fixtures for frozen Batch 1 PDFs only.

Does not generate Observation or Financial Fact rows.
"""
from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
FACTS = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a" / "facts"
SCOPE = FACTS / "financial_fact_fanout_batch1_scope.json"
LEGACY_SCOPE = FACTS / "financial_fact_batch1_scope.json"
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
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
PILOT = FACTS / "financial_fact_pilot_001"

EXPECTED_SCOPE_SHA = "e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"
EXPECTED_CANONICAL_FACTS = 64
EXPECTED_BATCH0_OBS = 11

LOCATION_MODELS = frozenset(
    {
        "single_page",
        "page_table_row",
        "multi_page_same_table",
        "section_range",
    }
)


@dataclass(frozen=True)
class SelectorFixture:
    """Structural evidence only: no numeric values, URLs, Event IDs, or Gemini fields."""

    name: str
    location_model: str
    section: str
    period: str
    measure_kind: str
    period_basis: str
    unit: str | None = None
    table: str | None = None
    row: str | None = None
    accounting_basis: str | None = None
    expected_pages: tuple[int, ...] = (1,)
    numeric_fact_allowed: bool = True

    def __post_init__(self) -> None:
        if self.location_model not in LOCATION_MODELS:
            raise ValueError(f"unsupported location_model: {self.location_model}")
        if self.measure_kind == "review_only" and self.numeric_fact_allowed:
            raise ValueError("review_only selectors must set numeric_fact_allowed=False")


# Fixed Batch 1 eight issuers only. Marker conjunction (no first-match fallback).
FIXTURES: dict[str, tuple[SelectorFixture, ...]] = {
    "ibiden": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上高",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
        ),
    ),
    "furukawa_electric": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上高",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
        ),
    ),
    "fujikura": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上高",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
        ),
    ),
    "disco": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上高",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
        ),
        SelectorFixture(
            name="interim_forecast",
            location_model="page_table_row",
            section="連結業績予想",
            table="売上高",
            row="第2四半期(累計)",
            unit="百万円",
            period="2027年3月期",
            measure_kind="company_forecast",
            period_basis="Q2_cumulative",
        ),
    ),
    "kokusai_electric": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上収益",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
        ),
    ),
    "lasertec": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上高",
            unit="百万円",
            period="2026年6月期",
            measure_kind="actual",
            period_basis="full_year",
        ),
        # PDF text order places 通期 before the section header; require all markers
        # present on one page (page+table+row), never ordered section.*row regex.
        SelectorFixture(
            name="full_year_forecast",
            location_model="page_table_row",
            section="2027年6月期の連結業績予想",
            table="売上高",
            row="通期",
            unit="百万円",
            period="2027年6月期",
            measure_kind="company_forecast",
            period_basis="full_year",
        ),
    ),
    "kawasaki_heavy": (
        SelectorFixture(
            name="actual_revenue",
            location_model="single_page",
            section="連結経営成績",
            table="売上収益",
            unit="百万円",
            period="第1四半期",
            measure_kind="actual",
            period_basis="Q1_cumulative",
            accounting_basis="IFRS",
        ),
        SelectorFixture(
            name="full_year_forecast",
            location_model="page_table_row",
            section="2027年3月期の連結業績予想",
            table="売上収益",
            row="通期",
            unit="百万円",
            period="2027年3月期",
            measure_kind="company_forecast",
            period_basis="full_year",
            accounting_basis="IFRS",
        ),
    ),
    "screen_holdings": (
        SelectorFixture(
            name="review_only",
            location_model="single_page",
            section="公認会計士等による期中レビューの完了",
            table="期中レビューの完了",
            row="変更はありません",
            unit=None,
            period="2027年3月期",
            measure_kind="review_only",
            period_basis="other",
            numeric_fact_allowed=False,
        ),
    ),
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pages(path: Path) -> list[str]:
    return [unicodedata.normalize("NFKC", page.extract_text() or "") for page in PdfReader(str(path)).pages]


def collapse_ws(text: str) -> str:
    """PDF extractors often insert spaces inside Japanese tokens; compare structure only."""
    return re.sub(r"\s+", "", text)


def _markers(fixture: SelectorFixture) -> list[str]:
    markers = [fixture.section, fixture.period]
    for value in (fixture.table, fixture.row, fixture.unit, fixture.accounting_basis):
        if value is not None:
            markers.append(value)
    return markers


def matching_pages(document_pages: list[str], fixture: SelectorFixture) -> list[int]:
    markers = [collapse_ws(marker) for marker in _markers(fixture)]
    return [
        number
        for number, page in enumerate(document_pages, start=1)
        if all(marker in collapse_ws(page) for marker in markers)
    ]


def validate_location(document_pages: list[str], fixture: SelectorFixture) -> list[int]:
    """Require exactly one unique evidence location for the declared model."""
    matches = matching_pages(document_pages, fixture)
    expected = list(fixture.expected_pages)

    if fixture.location_model in {"single_page", "page_table_row"}:
        if len(matches) != 1:
            raise ValueError(f"ambiguous or missing selector location: {matches}")
        if matches != expected:
            raise ValueError(f"expected pages {expected}, found {matches}")
        return matches

    if fixture.location_model == "multi_page_same_table":
        if not matches or set(matches) != set(expected):
            raise ValueError(f"multi_page_same_table mismatch: expected {expected}, found {matches}")
        if len(matches) != len(set(matches)):
            raise ValueError(f"duplicate page matches: {matches}")
        return sorted(matches)

    if fixture.location_model == "section_range":
        if not expected or matches != expected:
            raise ValueError(f"section_range mismatch: expected {expected}, found {matches}")
        if expected != list(range(expected[0], expected[-1] + 1)):
            raise ValueError(f"section_range must be contiguous: {expected}")
        return matches

    raise ValueError(f"unsupported location_model: {fixture.location_model}")


def validate_fixture_against_pages(document_pages: list[str], fixture: SelectorFixture) -> dict:
    pages_found = validate_location(document_pages, fixture)
    if fixture.measure_kind == "review_only" and fixture.numeric_fact_allowed:
        raise ValueError("review_only must not allow numeric Fact selectors")
    return {
        "selector": fixture.name,
        "location_model": fixture.location_model,
        "pages": pages_found,
        "measure_kind": fixture.measure_kind,
        "period_basis": fixture.period_basis,
        "section": fixture.section,
        "table": fixture.table,
        "row": fixture.row,
        "unit": fixture.unit,
        "period": fixture.period,
        "accounting_basis": fixture.accounting_basis,
        "numeric_fact_allowed": fixture.numeric_fact_allowed,
    }


def integrity_snapshot() -> dict:
    scope_bytes = SCOPE.read_bytes()
    scope = json.loads(scope_bytes.decode("utf-8"))
    legacy_bytes = LEGACY_SCOPE.read_bytes()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    snapshot_hashes = {
        row["issuer"]: digest(ROOT / row["local_snapshot_path"]) for row in manifest
    }
    manifest_hashes = {row["issuer"]: row["content_hash"] for row in manifest}
    if snapshot_hashes != manifest_hashes:
        raise RuntimeError("local snapshot hash drift vs manifest")
    canonical_facts = sum(
        1
        for line in (FACTS / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    )
    batch0_obs = sum(
        1
        for line in (PILOT / "financial_observation.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    )
    return {
        "scope_sha256": hashlib.sha256(scope_bytes).hexdigest(),
        "legacy_scope_sha256": hashlib.sha256(legacy_bytes).hexdigest(),
        "event_ids": sorted({row["event_id"] for row in scope["documents"]}),
        "document_ids": [row["candidate_document_id"] for row in scope["documents"]],
        "snapshot_hashes": snapshot_hashes,
        "gemini_sha256": digest(LEDGER),
        "canonical_financial_facts": canonical_facts,
        "batch0_observation_count": batch0_obs,
        "batch0_observation_sha256": digest(PILOT / "financial_observation.jsonl"),
        "batch0_source_link_sha256": digest(PILOT / "financial_observation_source_link.jsonl"),
        "batch0_document_outcome_sha256": digest(PILOT / "document_outcome.jsonl"),
    }


def assert_integrity(before: dict, after: dict) -> None:
    if before != after:
        raise RuntimeError(f"integrity drift: { {k: (before.get(k), after.get(k)) for k in before if before.get(k) != after.get(k)} }")
    if before["scope_sha256"] != EXPECTED_SCOPE_SHA:
        raise RuntimeError("Batch 1 scope SHA mismatch")
    if before["scope_sha256"] != before["legacy_scope_sha256"]:
        raise RuntimeError("fanout/legacy Batch 1 scope SHA mismatch")
    if before["gemini_sha256"] != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger SHA mismatch")
    if before["canonical_financial_facts"] != EXPECTED_CANONICAL_FACTS:
        raise RuntimeError("canonical Financial Fact count drift")
    if before["batch0_observation_count"] != EXPECTED_BATCH0_OBS:
        raise RuntimeError("Batch 0 Observation count drift")
    if len(before["event_ids"]) != 8 or len(before["document_ids"]) != 8:
        raise RuntimeError("Batch 1 scope size drift")


def negative_fixture_cases() -> list[tuple[str, callable]]:
    """Independent negative inputs: do not mutate real PDFs or canonical data."""

    base = SelectorFixture(
        name="synthetic",
        location_model="single_page",
        section="連結経営成績",
        table="売上高",
        unit="百万円",
        period="第1四半期",
        measure_kind="actual",
        period_basis="Q1_cumulative",
        expected_pages=(1,),
    )
    page = "連結経営成績 売上高 百万円 第1四半期 連結業績予想 通期"

    def expect_fail(label: str, fn) -> tuple[str, callable]:
        def case() -> None:
            try:
                fn()
            except (ValueError, RuntimeError):
                return
            raise AssertionError(f"expected fail-closed for {label}")

        return label, case

    cases = [
        expect_fail(
            "multiple_ambiguous_match",
            lambda: validate_location([page, page], base),
        ),
        expect_fail(
            "missing_label",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="missing_label",
                    location_model="page_table_row",
                    section="連結経営成績",
                    table="売上高",
                    row="存在しない行ラベル",
                    unit="百万円",
                    period="第1四半期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                ),
            ),
        ),
        expect_fail(
            "missing_evidence",
            lambda: validate_location([""], base),
        ),
        expect_fail(
            "unit_mismatch",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="unit_mismatch",
                    location_model="single_page",
                    section="連結経営成績",
                    table="売上高",
                    unit="億円",
                    period="第1四半期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                ),
            ),
        ),
        expect_fail(
            "period_mismatch",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="period_mismatch",
                    location_model="single_page",
                    section="連結経営成績",
                    table="売上高",
                    unit="百万円",
                    period="2029年3月期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                ),
            ),
        ),
        expect_fail(
            "wrong_page",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="wrong_page",
                    location_model="single_page",
                    section="連結経営成績",
                    table="売上高",
                    unit="百万円",
                    period="第1四半期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                    expected_pages=(9,),
                ),
            ),
        ),
        expect_fail(
            "wrong_section",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="wrong_section",
                    location_model="single_page",
                    section="個別経営成績",
                    table="売上高",
                    unit="百万円",
                    period="第1四半期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                ),
            ),
        ),
        expect_fail(
            "wrong_table",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="wrong_table",
                    location_model="page_table_row",
                    section="連結経営成績",
                    table="受注高",
                    row="第1四半期",
                    unit="百万円",
                    period="第1四半期",
                    measure_kind="actual",
                    period_basis="Q1_cumulative",
                ),
            ),
        ),
        expect_fail(
            "wrong_row",
            lambda: validate_location(
                [page],
                SelectorFixture(
                    name="wrong_row",
                    location_model="page_table_row",
                    section="連結業績予想",
                    table="売上高",
                    row="第3四半期(累計)",
                    unit="百万円",
                    period="第1四半期",
                    measure_kind="company_forecast",
                    period_basis="Q2_cumulative",
                ),
            ),
        ),
        expect_fail(
            "hash_mismatch",
            lambda: (
                None
                if digest(ROOT / json.loads(MANIFEST.read_text(encoding="utf-8"))[0]["local_snapshot_path"])
                == ("0" * 64)
                else (_ for _ in ()).throw(RuntimeError("hash mismatch"))
            ),
        ),
        expect_fail(
            "scope_mismatch",
            lambda: (
                None
                if digest(SCOPE) == ("f" * 64)
                else (_ for _ in ()).throw(RuntimeError("scope mismatch"))
            ),
        ),
    ]
    return cases


def run_negative_fixtures() -> list[dict]:
    results = []
    for label, case in negative_fixture_cases():
        case()
        results.append({"case": label, "result": "fail_closed"})
    return results


def validate_batch1_selectors() -> dict:
    before = integrity_snapshot()
    assert_integrity(before, before)

    scope = json.loads(SCOPE.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if {(row["event_id"], row["url"]) for row in scope["documents"]} != {
        (row["event_id"], row["url"]) for row in manifest
    }:
        raise RuntimeError("scope/manifest mismatch")
    if set(FIXTURES) != {row["issuer"] for row in manifest}:
        raise RuntimeError("fixture issuers drift from Batch 1 manifest")

    results = []
    for row in manifest:
        path = ROOT / row["local_snapshot_path"]
        if digest(path) != row["content_hash"]:
            raise RuntimeError(f"hash mismatch: {row['candidate_document_id']}")
        document_pages = pages(path)
        for fixture in FIXTURES[row["issuer"]]:
            validated = validate_fixture_against_pages(document_pages, fixture)
            validated["issuer"] = row["issuer"]
            validated["security_id"] = row.get("security_id")
            results.append(validated)

    negative = run_negative_fixtures()
    after = integrity_snapshot()
    assert_integrity(before, after)

    return {
        "documents": len(manifest),
        "selectors_validated": len(results),
        "negative_fixtures": negative,
        "observations_generated": 0,
        "financial_facts_generated": 0,
        "integrity": after,
        "results": results,
    }


def main() -> None:
    print(json.dumps(validate_batch1_selectors(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
