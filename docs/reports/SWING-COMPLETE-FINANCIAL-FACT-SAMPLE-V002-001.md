# Financial Fact Sample V002 — Limited Official-Source Verification

**Record ID:** `SWING-COMPLETE-FINANCIAL-FACT-SAMPLE-V002-001`  
**Date:** 2026-08-15  
**Scope:** Six-security, source-hashed Financial Fact proof only  
**Verdict:** **MODIFY**

## Result

The Fact model can represent actual observations, a normal company forecast,
and an evidence-backed prior/revised forecast pair without changing the
existing official-event or Gemini identity layers. All emitted values are now
extracted from the saved local PDF text through a deliberately narrow,
template-indexed extractor; the build performs no network download.

The proof is deliberately limited:

```text
Fact-bearing events:       7
Evidence-only events:      1
Financial observations:    64
Source documents:          9
Guidance revision links:   5
Numeric reconciliation:    64 official_only
```

No 345-event collection was started.

## New additive sample artifacts

- `scripts/stock_swing/build_financial_fact_sample.py`
- `data/stock/stock_swing/facts_phase_a/facts/financial_observation_sample.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/financial_observation_source_sample.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/guidance_revision_observation_sample.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/financial_observation_reconciliation_sample.jsonl`
- `data/stock/stock_swing/facts_phase_a/schemas/financial_observation_sample.schema.json`
- `data/stock/stock_swing/facts_phase_a/schemas/financial_observation_reconciliation.schema.json`
- `tests/test_stock_swing_financial_fact_sample.py`

Each source record retains `source_id`, `source_document_id`, provider, URL,
retrieval timestamp, SHA-256 `content_hash`, source priority, document type,
and a local content-addressed PDF snapshot under
`data/stock/stock_swing/facts_phase_a/raw_external/financial_fact_sample_sources/`.
The build recalculates each PDF hash before extraction, reads the PDF with
`pypdf`, and writes `pdf_text_sha256`. Observations cite one source document,
page/table/extraction method, `source_unit_raw`, and
`value_conversion_rule_id`.

## Evidence exercised

| Security | Fact-bearing event | Result |
|-|-|-|
| 6857 | 2026-07-29 Q1 | Actuals from the earnings release plus prior/revised full-year forecasts from the separately sourced company `forecast_revision` notice. Five explicit revision links are `upward`. Both documents retain distinct provenance while sharing the existing event ID. |
| 8035 | 2024-11-12 H1 | Actuals and explicit FY company forecast extracted. |
| 8035 | 2026-04-30 FY | Actuals extracted. The document has a deferred FY outlook, so no company-forecast observation is emitted. |
| 285A | 2026-07-31 Q1 | Actuals and the explicitly disclosed H1 cumulative forecast extracted as `Q2_cumulative`, not full year. |
| 3436 | 2026-08-06 H1 | Actuals plus the explicit next-quarter cumulative forecast as `Q3_cumulative`; no full-year conversion. |
| 7011 | 2026-08-04 Q1 | Actuals and explicit FY company forecast, preserving IFRS `metric_name_raw` labels. |
| 8306 | 2026-08-03 Q1 | Bank actuals extracted. The stated FY profit target is preserved as `measure_kind=other`, never `company_forecast`. |
| 8306 | 2026-08-06 review complete | Evidence-only. It remains a distinct source/event and emits no automatically merged or duplicate observation. |

## Data-model behaviors proved

- `actual`, `company_forecast`, `prior_forecast`, and `revised_forecast`
  occur only where the source expressly supplies that type.
- The 6857 revision notice has `document_type=forecast_revision`; its
  prior/revised observations share the existing earnings `event_id` but use
  their own `source_id` and `source_document_id`.
- Source date is retained in `as_of_date`. `as_of_timestamp=null` for all
  observations because the primary source set proves no promoted intraday
  timestamp. No as-of leakage is introduced.
- PDF text extraction verifies the displayed numeric token and source unit
  before emitting a Fact. `value_numeric` uses `JPY_million_identity_v1` or
  `JPY_per_share_identity_v1`; 8306 preserves `27,000 億円` as raw text and
  converts it with the recorded `JPY_oku_to_million_v1` rule.
- `fiscal_period_end` is the period covered by the observation and is proved
  from the PDF date range; it can therefore differ from the source event's
  result period. `event_fiscal_period_end` preserves the existing event axis.
  No period is calculated from quarter labels and no null period was filled.
- `financial_observation_reconciliation_sample` is separate from
  `event_reconciliation`. Gemini is not parsed; each sample row is
  `official_only` with `gemini_value_text=null`.

## Mandatory self-review

| Check | Result |
|-|-|
| 1. Gemini raw CSV unchanged | Pass — SHA-256 remains `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`. |
| 2. Official earnings events unchanged | Pass — 345 distinct event IDs remain; sample writer is read-only for this relation. |
| 3. Saved PDF hashes match provenance | Pass — all nine local snapshots match their source `content_hash` before text extraction. |
| 4. Same-document duplicate observations | Pass — 64 unique `observation_id`s. |
| 5. Multiple documents silently treated as one | Pass — source documents retain independent IDs/hashes; 6857 release/revision and 8306 review records remain distinct. |
| 6. Revision vs earnings release distinguished | Pass — `forecast_revision` is explicit for 6857. |
| 7. Fiscal period end guessed | Pass — each observation period end is matched against an explicit PDF date; event and observation period ends are kept separately. |
| 8. Period basis guessed | Pass — all emitted periods reflect named source tables; deferred 8035 has actuals only. |
| 9. Unit conversion has evidence | Pass — raw unit and conversion-rule ID are stored; 8306 is explicitly `億円 → JPY_million`. |
| 10. Consolidation / accounting standard guessed | Pass — copied from the existing official event, not inferred by the extractor. |
| 11. 8035 special disclosure forced to normal forecast | Pass — deferred-outlook release has actuals only, never a company forecast. |
| 12. 3436 next-quarter forced to full year | Pass — emitted as `Q3_cumulative`. |
| 13. 8306 target/review treated as forecast | Pass — target is `other`; review source emits none. |
| 14. As-of leakage | Pass — timestamps remain null where only date is proved. |
| 15. Source provenance traceable | Pass — all nine PDFs have URL, provider, retrieval time, content hash, and a local hashed snapshot. |
| 16. Financial and event reconciliation separated | Pass — an independent financial reconciliation relation is used. |
| 17. Missing status appropriate | Pass — no observation is emitted where disclosure type is absent; special target is explicitly non-forecast. |
| 18. Analysis logic present | Pass — no surprise, return, ranking, score, signal, or trade logic exists. |

## Verification

```text
python scripts/stock_swing/build_financial_fact_sample.py
python -m unittest tests.test_stock_swing_phase_a
                   tests.test_stock_swing_official_earnings
                   tests.test_stock_swing_reconciliation_quality
                   tests.test_stock_swing_financial_fact_sample

24 tests OK
```

## Why the verdict remains MODIFY

This validates only a curated path. It does not establish a safe
population-scale extractor.

1. The sample is hand-reviewed PDF text, not a tested general parser/taxonomy
   across 345 events.
2. The source inventory still lacks a complete model and collector for
   standalone TDnet/company `forecast_revision` notices.
3. There is no approved, durable policy for bank targets or other non-forecast
   management disclosures beyond the sample `measure_kind=other`.
4. Prior-forecast predecessor chains are only proven for one explicit
   before/after notice; they are not constructed across historical events.
5. Remaining official-event metadata gaps, including null
   `fiscal_period_end`, must be corrected by source evidence before numeric
   collection can rely on that axis.
6. Bulk schema promotion still needs approval for nullable as-of timestamps,
   source-document provenance, unit registry, taxonomy, and observation-level
   reconciliation.

Therefore the 345-event Financial Fact collection remains prohibited until
the gates in `SWING-DESIGN-FINANCIAL-FACT-COLLECTION-001.md` are approved.
