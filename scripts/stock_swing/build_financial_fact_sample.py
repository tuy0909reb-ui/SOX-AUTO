"""Build a deliberately small, source-hashed Financial Fact proof sample.

This is a curated six-security verification artifact, not a bulk extractor.
It never rewrites Gemini data, official earnings events, or identity
reconciliation. Numeric values are transcribed from specifically listed
primary PDFs after the PDF bytes and their SHA-256 are captured.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from pypdf import PdfReader

from financial_fact_contract import (
    MEASURE_KINDS,
    PERIOD_BASIS,
    financial_fact_schemas,
)

ROOT = Path(__file__).resolve().parents[2]
PHASE_A = ROOT / "data" / "stock" / "stock_swing" / "facts_phase_a"
FACTS = PHASE_A / "facts"
LEDGER = ROOT / "data" / "stock" / "stock_swing" / "research" / "kessan_ledger.csv"
EXPECTED_LEDGER_SHA = "0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507"

def stable_id(namespace: str, *parts: object) -> str:
    return f"{namespace}-{uuid5(NAMESPACE_URL, '|'.join(str(part) for part in parts)).hex}"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [
        json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


# Every URL is a source record, including the review-complete re-disclosure.
# The latter intentionally emits no observation: it is evidence that no
# automatic same-period document merge or duplicate count occurs.
SOURCES = {
    "6857-release": {
        "event_id": "official-event-a070ef6d36cb5a3eb162648400b027c7",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "6857-revision": {
        "event_id": "official-event-a070ef6d36cb5a3eb162648400b027c7",
        "provider": "company_ir",
        "url": "https://www.advantest.com/ja/news/2026/qnpuno0000000cmx-att/J_Info_20260729.pdf",
        "document_type": "forecast_revision",
        "source_priority": 1,
    },
    "8035-release": {
        "event_id": "official-event-5097c451c2e6519c90e9bc23fc52def6",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/80350/140120241003593212.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "8035-deferred-outlook": {
        "event_id": "official-event-ed132c223977592c8cbfdd61e2f599f0",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/80350/140120260413502285.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
        # The FY outlook was deferred to the next H1 release. It is retained
        # as source evidence only; no number is invented as a forecast.
        "observation_policy": "deferred_outlook_no_company_forecast",
    },
    "285A-release": {
        "event_id": "official-event-4bda3f4c595f5ba8b34646aada3f7681",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "3436-release": {
        "event_id": "official-event-f068a6004c335384940a3195270928db",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/34360/140120260805509445.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "7011-release": {
        "event_id": "official-event-6042eaef6808592b8e960199e4a45a90",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/70110/140120260726599663.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "8306-release": {
        "event_id": "official-event-c6fe3f3887a45049babb620b7dc52241",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
    },
    "8306-review": {
        "event_id": "official-event-98506537e1cf5cc4bb7ed01f7ed93c15",
        "provider": "tdnet",
        "url": "https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf",
        "document_type": "earnings_release",
        "source_priority": 1,
        "observation_policy": "review_only_no_auto_merge",
    },
}

# Template-indexed extraction configuration. The template identifies the
# source table and its displayed value; output is emitted only after the
# corresponding locally snapshotted PDF text proves the value token and unit.
# No network fetch occurs in this stage.
ROWS = [
    ("6857-release", "actual", "Q1_cumulative", [
        ("revenue", "売上高", 367473), ("operating_profit", "営業利益", 189990),
        ("pretax_profit", "税引前利益", 234082), ("net_income", "親会社の所有者に帰属する四半期利益", 174780),
        ("EPS", "基本的1株当たり四半期利益", 241.27),
    ]),
    ("6857-revision", "prior_forecast", "full_year", [
        ("revenue", "前回発表予想(A) 売上高", 1420000), ("operating_profit", "前回発表予想(A) 営業利益", 627500),
        ("pretax_profit", "前回発表予想(A) 税引前利益", 629000), ("net_income", "前回発表予想(A) 当期利益", 465500),
        ("EPS", "前回発表予想(A) 基本的1株当たり当期利益", 641.61),
    ], 1, "2027-03-31"),
    ("6857-revision", "revised_forecast", "full_year", [
        ("revenue", "今回修正予想(B) 売上高", 1714000), ("operating_profit", "今回修正予想(B) 営業利益", 846000),
        ("pretax_profit", "今回修正予想(B) 税引前利益", 891000), ("net_income", "今回修正予想(B) 当期利益", 660000),
        ("EPS", "今回修正予想(B) 基本的1株当たり当期利益", 911.64),
    ], 1, "2027-03-31"),
    ("8035-release", "actual", "Q2_cumulative", [
        ("revenue", "売上高", 1121626), ("operating_profit", "営業利益", 313904),
        ("ordinary_profit", "経常利益", 321181), ("net_income", "親会社株主に帰属する中間純利益", 243903),
        ("EPS", "1株当たり中間純利益", 528.67),
    ]),
    ("8035-release", "company_forecast", "full_year", [
        ("revenue", "通期 売上高", 2400000), ("operating_profit", "通期 営業利益", 680000),
        ("ordinary_profit", "通期 経常利益", 692000), ("net_income", "通期 親会社株主に帰属する当期純利益", 526000),
        ("EPS", "通期 1株当たり当期純利益", 1140.67),
    ], 1, "2025-03-31"),
    ("8035-deferred-outlook", "actual", "full_year", [
        ("revenue", "売上高", 2443533), ("operating_profit", "営業利益", 624936),
        ("ordinary_profit", "経常利益", 630338), ("net_income", "親会社株主に帰属する当期純利益", 574454),
        ("EPS", "1株当たり当期純利益", 1254.57),
    ]),
    ("285A-release", "actual", "Q1_cumulative", [
        ("revenue", "売上収益", 1767117), ("operating_profit", "営業利益", 1270017),
        ("pretax_profit", "税引前四半期利益", 1234720), ("net_income", "親会社の所有者に帰属する四半期利益", 842165),
        ("EPS", "基本的1株当たり四半期利益", 1539.91),
    ]),
    ("285A-release", "company_forecast", "Q2_cumulative", [
        ("revenue", "第2四半期（累計）売上収益", 4157117), ("operating_profit", "第2四半期（累計）営業利益", 3160017),
        ("pretax_profit", "第2四半期（累計）税引前中間利益", 3104720), ("net_income", "第2四半期（累計）親会社の所有者に帰属する中間利益", 2112165),
    ], 2, "2026-09-30"),
    ("3436-release", "actual", "Q2_cumulative", [
        ("revenue", "売上高", 215016), ("operating_profit", "営業利益", -6363),
        ("ordinary_profit", "経常利益", -12179), ("net_income", "親会社株主に帰属する中間純利益", -12895),
        ("EPS", "1株当たり中間純利益", -36.87),
    ]),
    ("3436-release", "company_forecast", "Q3_cumulative", [
        ("revenue", "第3四半期予想 売上高", 333000), ("operating_profit", "第3四半期予想 営業利益", -6300),
        ("ordinary_profit", "第3四半期予想 経常利益", -11100), ("net_income", "第3四半期予想 親会社株主に帰属する四半期純利益", -12800),
        ("EPS", "第3四半期予想 1株当たり四半期純利益", -36.60),
    ], 1, "2026-09-30"),
    ("7011-release", "actual", "Q1_cumulative", [
        ("revenue", "売上収益", 1194203), ("operating_profit", "事業利益", 159645),
        ("pretax_profit", "税引前四半期利益", 176426), ("net_income", "親会社の所有者に帰属する四半期利益", 131916),
        ("EPS", "基本的1株当たり四半期利益", 40.08),
    ]),
    ("7011-release", "company_forecast", "full_year", [
        ("revenue", "通期 売上収益", 5400000), ("operating_profit", "通期 事業利益", 540000),
        ("pretax_profit", "通期 税引前利益", 530000), ("net_income", "通期 親会社の所有者に帰属する当期利益", 380000),
        ("EPS", "通期 基本的1株当たり当期利益", 113.09),
    ], 2, "2027-03-31"),
    ("8306-release", "actual", "Q1_cumulative", [
        ("ordinary_income", "経常収益", 3907543), ("ordinary_profit", "経常利益", 1117934),
        ("net_income", "親会社株主に帰属する四半期純利益", 809427), ("EPS", "1株当たり四半期純利益", 71.77),
    ]),
    ("8306-release", "other", "full_year", [
        ("net_income_target", "親会社株主に帰属する当期純利益 目標値", 2700000),
    ], 1, "2027-03-31"),
]


def normalized(value: str) -> str:
    return unicodedata.normalize("NFKC", value).replace("\u2212", "-")


def load_local_source_text(source: dict[str, Any]) -> list[str]:
    """Verify a content-addressed snapshot and extract its PDF text locally."""
    snapshot = ROOT / source["local_snapshot_path"]
    if not snapshot.is_file():
        raise FileNotFoundError(f"Missing source snapshot: {snapshot}")
    if sha256(snapshot) != source["content_hash"]:
        raise RuntimeError(f"Snapshot hash mismatch: {snapshot}")
    pages = [normalized(page.extract_text() or "") for page in PdfReader(snapshot).pages]
    if not any(pages):
        raise RuntimeError(f"No extractable text in source snapshot: {snapshot}")
    source["pdf_text_sha256"] = hashlib.sha256("\n\f\n".join(pages).encode("utf-8")).hexdigest()
    source["extraction_method"] = "local_pdf_text_template_v1"
    return pages


def source_date_fields(event: dict[str, Any]) -> dict[str, Any]:
    """Document date is the observation as-of basis; time remains unpromoted."""
    return {
        "publication_date": event["announcement_date"],
        "publication_time": None,
        "timestamp_quality": "date_only",
    }


def source_value_token(value: int | float) -> str:
    return f"{value:,}"


def parsed_numeric(token: str) -> int | float:
    normalized_token = token.replace(",", "").replace("△", "-")
    return float(normalized_token) if "." in normalized_token else int(normalized_token)


def observation(
    event: dict[str, Any],
    source: dict[str, Any],
    measure_kind: str,
    period_basis: str,
    metric_name: str,
    metric_name_raw: str,
    value: int | float,
    page_text: str,
    evidence_page_text: str,
    source_page: int,
    fiscal_period_end: str | None,
) -> dict[str, Any]:
    if measure_kind not in MEASURE_KINDS or period_basis not in PERIOD_BASIS:
        raise ValueError("Unsupported Financial Fact vocabulary.")
    is_eps = metric_name == "EPS"
    is_oku_target = metric_name == "net_income_target"
    unit_code = "JPY_per_share" if is_eps else "JPY_million"
    source_unit = "円" if is_eps else ("億円" if is_oku_target else "百万円")
    source_value = value // 100 if is_oku_target else value
    token = source_value_token(source_value)
    source_tokens = [token]
    if token.startswith("-"):
        source_tokens.append(f"△{token[1:]}")
    source_token = next((candidate for candidate in source_tokens if candidate in page_text), None)
    if source_token is None:
        raise RuntimeError(
            f"Local PDF text does not prove {metric_name_raw}={token} on page {source_page}."
        )
    if source_unit not in page_text:
        raise RuntimeError(f"Local PDF text does not prove {source_unit} on page {source_page}.")
    if fiscal_period_end:
        year, month, day = (int(part) for part in fiscal_period_end.split("-"))
        period_pattern = rf"{year}\s*年\s*{month}\s*月\s*{day}\s*日"
        if not re.search(period_pattern, page_text):
            raise RuntimeError(
                f"Local PDF text does not prove fiscal period end {fiscal_period_end} on page {source_page}."
            )
    consolidation_evidence = "連結" if "連結" in evidence_page_text else "unknown"
    standard_evidence = {
        "IFRS": "IFRS",
        "JGAAP": "日本基準",
        "USGAAP": "米国基準",
    }.get(event["accounting_standard"], "unknown")
    if standard_evidence != "unknown" and standard_evidence not in evidence_page_text:
        standard_evidence = "unknown"
    raw_value = f"{source_token} {source_unit}"
    quality = "confirmed"
    if measure_kind == "other":
        quality = "not_company_forecast"
    return {
        "observation_id": stable_id(
            "financial-observation", event["event_id"], source["source_id"],
            measure_kind, period_basis, metric_name, value,
        ),
        "event_id": event["event_id"],
        "security_id": event["security_id"],
        "metric_name": metric_name,
        "metric_name_raw": metric_name_raw,
        "value_numeric": (
            parsed_numeric(source_token) * 100 if is_oku_target else parsed_numeric(source_token)
        ),
        "raw_value_text": raw_value,
        "currency": "JPY",
        "unit_code": unit_code,
        "source_unit_raw": source_unit,
        "measure_kind": measure_kind,
        "period_basis": period_basis,
        "consolidation": event["consolidation"],
        "accounting_standard": event["accounting_standard"],
        "fiscal_year_label": event.get("fiscal_year_label"),
        # A Financial Observation's covered period can differ from its source event.
        "fiscal_period_end": fiscal_period_end,
        "event_fiscal_period_end": event.get("fiscal_period_end"),
        # Source documents are date-only; never manufacture an intraday as-of.
        "as_of_timestamp": None,
        "as_of_date": source["publication_date"],
        "document_publication_date": source["publication_date"],
        "document_publication_time": source["publication_time"],
        "document_timestamp_quality": source["timestamp_quality"],
        "observation_effective_date": None,
        "source_id": source["source_id"],
        "source_document_id": source["source_document_id"],
        "source_page": source_page,
        "source_table": "cover_result_or_explicit_forecast_table",
        "consolidation_evidence_text": consolidation_evidence,
        "accounting_standard_evidence_text": standard_evidence,
        "extraction_method": "local_pdf_text_template_v1",
        "value_conversion_rule_id": (
            "JPY_per_share_identity_v1" if is_eps
            else ("JPY_oku_to_million_v1" if is_oku_target else "JPY_million_identity_v1")
        ),
        "quality_status": quality,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase-a-dir", type=Path, default=PHASE_A)
    args = parser.parse_args()
    phase_a = args.phase_a_dir.resolve()
    facts = phase_a / "facts"
    if sha256(LEDGER) != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger SHA mismatch before Financial Fact sample.")
    events = {row["event_id"]: row for row in load_jsonl(facts / "official_earnings_event.jsonl")}
    if len(events) != 345:
        raise RuntimeError(f"Expected 345 official events, found {len(events)}.")
    source_manifest = load_jsonl(facts / "financial_observation_source_sample.jsonl")
    source_rows = {
        key: next(
            row for row in source_manifest
            if row["event_id"] == spec["event_id"] and row["url"] == spec["url"]
        )
        for key, spec in SOURCES.items()
    }
    for source in source_rows.values():
        source.update(source_date_fields(events[source["event_id"]]))
    source_pages = {
        key: load_local_source_text(source)
        for key, source in source_rows.items()
    }
    output: list[dict[str, Any]] = []
    for row_spec in ROWS:
        source_key, measure_kind, period_basis, metrics, *row_options = row_spec
        source_page = row_options[0] if row_options else 1
        source = source_rows[source_key]
        event = events[source["event_id"]]
        page_text = source_pages[source_key][source_page - 1]
        evidence_page_text = source_pages[source_key][0]
        fiscal_period_end = row_options[1] if len(row_options) > 1 else event.get("fiscal_period_end")
        for metric_name, raw_name, value in metrics:
            output.append(observation(
                event, source, measure_kind, period_basis, metric_name, raw_name,
                value, page_text, evidence_page_text, source_page, fiscal_period_end,
            ))
    if len({row["observation_id"] for row in output}) != len(output):
        raise RuntimeError("Duplicate Financial Observation ID.")

    by_key = {(row["event_id"], row["metric_name"], row["measure_kind"]): row for row in output}
    revisions = []
    for metric in ("revenue", "operating_profit", "pretax_profit", "net_income", "EPS"):
        prior = by_key[("official-event-a070ef6d36cb5a3eb162648400b027c7", metric, "prior_forecast")]
        revised = by_key[("official-event-a070ef6d36cb5a3eb162648400b027c7", metric, "revised_forecast")]
        revisions.append({
            "revision_id": stable_id("guidance-revision", prior["observation_id"], revised["observation_id"]),
            "event_id": prior["event_id"],
            "security_id": prior["security_id"],
            "metric_name": metric,
            "prior_forecast_observation_id": prior["observation_id"],
            "revised_forecast_observation_id": revised["observation_id"],
            "direction_normalized": "up",
            "direction_raw": "通期連結業績予想の修正に関するお知らせ",
            "source_id": revised["source_id"],
            "source_document_id": revised["source_document_id"],
            "quality_status": "confirmed",
        })
    reconciliation = [{
        "reconciliation_id": stable_id("financial-reconciliation", row["observation_id"]),
        "observation_id": row["observation_id"],
        "event_id": row["event_id"],
        "gemini_raw_row_id": None,
        "gemini_value_text": None,
        "official_value_numeric": row["value_numeric"],
        "official_unit_code": row["unit_code"],
        "match_status": "official_only",
        "difference_note": "No Gemini numeric parse attempted; opaque Gemini text is untouched.",
    } for row in output]

    write_jsonl(facts / "financial_observation_sample.jsonl", output)
    write_jsonl(facts / "financial_observation.jsonl", output)
    write_jsonl(facts / "financial_observation_source_sample.jsonl", list(source_rows.values()))
    write_jsonl(facts / "guidance_revision_observation_sample.jsonl", revisions)
    write_jsonl(facts / "guidance_revision_observation.jsonl", revisions)
    write_jsonl(facts / "financial_observation_reconciliation_sample.jsonl", reconciliation)
    write_jsonl(facts / "financial_observation_reconciliation.jsonl", reconciliation)
    schema_dir = phase_a / "schemas"
    for name, value in financial_fact_schemas().items():
        write_json(schema_dir / f"{name}.schema.json", value)

    after = sha256(LEDGER)
    if after != EXPECTED_LEDGER_SHA:
        raise RuntimeError("Gemini ledger changed during Financial Fact sample build.")
    print(json.dumps({
        "sample_event_count": len({row["event_id"] for row in output}),
        "observation_count": len(output),
        "source_document_count": len(source_rows),
        "revision_count": len(revisions),
        "reconciliation_count": len(reconciliation),
        "gemini_raw_sha256": after,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
