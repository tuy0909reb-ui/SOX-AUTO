# Financial Fact Fan-out Batch 3 Acceptance / Freeze

**Record ID:** `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH3-001`  
**Date:** 2026-08-16  
**Authority:** Human Architect Acceptance / Freeze request  
**Status:** **Batch 3 = Accepted / Frozen**

## Acceptance result

```text
Scope SHA-256:                  1e4899d22e0c89242438d2cc868cd794b134d97a744cdffef3f80f9dee6a0793
Scope / PDF integrity:          PASS
Selector validation:            PASS
Architect validation approval:  PASS
Observations / Financial Facts: 3 / 3
Observation → Fact relation:    1:1
Official-only reconciliation:   3 / 3
Gemini as an input:             false
V002 mutation:                  false
Batch 0–2 / Event / ledger:     INTACT
Idempotency:                    PASS
Unexpected Facts / failures:    0 / 0
Commit:                          NOT AUTHORIZED
```

## Accepted Facts

| Issuer | Measure | Period | Value | Unit | Accounting | Official page |
|---|---|---|---:|---|---|---:|
| 7011 | actual | Q1 cumulative / 2027-03 | 1,194,203 | JPY_million | IFRS | 1 |
| 8035 | actual | H1 / Q2 cumulative / 2025-03 | 1,121,626 | JPY_million | JGAAP | 5 |
| 8035 | revised_forecast | FY / full year / 2025-03 | 2,400,000 | JPY_million | JGAAP | 5 |

All three retain `currency=JPY`, `consolidation=consolidated`,
`value_conversion_rule_id=JPY_million_identity_v1`, and explicit official
document/source links. No date, timestamp, period, unit, accounting basis, or
forecast/revision status was inferred beyond frozen selector and scope evidence.

## Provenance and selector evidence

Each accepted record has a unique chain:

```text
official_earnings_event
  → candidate doc-* identity
  → hash-locked local official PDF
  → approved unique selector evidence
  → additive Batch 3 Observation / Financial Fact
```

The extractor enforced one selector match per record, matching page, section,
metric, period, unit, accounting basis, and frozen boundary. `table_end_used`
is false for every accepted row. The approved negative boundaries remain
enforced: blank-cover, 億円, 増減額, table-end, wrong page/section/period/unit/
accounting basis, actual/forecast, original/revision, and IFRS/Non-GAAP.

## 8035 FY revision and V002

```text
Batch 3:  revised_forecast / 今回修正予想(B) / doc-bfbd66… / page 5
V002:      company_forecast / financial-document-d8af1ff… / page 1
Relation:  additive_non_merge
```

The facts have equal reported value but distinct frozen measure kinds and
provenance. Batch 3 stores the source-labeled revision evidence. V002 remains
immutable; no replace, merge, overwrite, alias, or taxonomy migration occurred.

## Official-only and baseline integrity

Every Batch 3 reconciliation row is `official_only`; `gemini_raw_row_id` and
`gemini_value_text` are null. Gemini does not feed the extraction path.

Before and after extraction, protected digests were checked for:

- Batch 3 scope and its two official PDF snapshots
- Batch 0, Batch 1, and Batch 2 artifacts
- canonical / V002 observations and source links
- official Event SoT
- Gemini raw ledger

All checks passed. Batch 3 ran twice with identical rendered output digests:

```text
financial_document_inventory.jsonl               ba87fbf54a17454b347ee9d744737d73300c881d2881a44d45f4ff39573aabb8
financial_document_source_link.jsonl             9860990e6149f6524995f8f28aae03a2ca1ee7c625c0f9e36e493fc61fe03d50
financial_observation.jsonl                      d9d58fbfc8c2047da10c16294e6963c07255c850dce9c3cea4a7bf779577ea65
financial_observation_source_link.jsonl          f9fa324c8f14b7eb04a8a100826c1fb1ee8af9605848e825fef4d1952aea98ef
financial_observation_reconciliation.jsonl       400b3ea7d41d8ada5864a8c0f1cdd7a309aeafdc01fab2a6445b1a328fcd9ab5
selector_evidence_location.jsonl                 d1a36a16eb4ca4c6f6cff23c2926681d8896a5fb48d8009f595cfd41cbae2cd4
document_outcome.jsonl                            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
document_results.json                             de4a42f4deec801bf35f61312565e0e98a9605e2565a89f686629fcb9b958bda
summary.json                                      1edaaea32820d8bf9f8418727d90d2b8325ee39da1c2fd3b50e21b4ad75492a0
```

## Cursor review evidence

The Acceptance Review incorporates the recorded selector/Modify reviews and the
independent Acceptance audit:

- [Review Batch 3 selector validation](fb814b67-e1c6-4025-9304-d80fa09e6709)
- [Review Batch 3 modify](6dcd2043-75fc-4b92-b988-54dfebe175e3)
- [Audit Batch 3 acceptance](90aa86d8-58d8-468a-931c-ee82742ebe3a) — **PASS**, no defect findings

Those reviews are evidence only; this Freeze follows the Human Architect's
explicit Acceptance / Freeze authorization and the passing acceptance gates.

## Frozen artifacts

Treat the following as immutable Batch 3 baseline:

- Scope: `facts/financial_fact_fanout_batch3_scope.json`
- Scope SHA-256 shown above
- Documents:
  - `doc-d17dcc4960ff506e9f866162018e48f0` / PDF
    `fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc`
  - `doc-bfbd66e8e5845552b00af0ceaf23dc05` / PDF
    `88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c`
- Additive output namespace: `facts/financial_fact_fanout_batch3_001/`
- `SWING-APPROVE-FINANCIAL-FACT-FANOUT-BATCH3-VALIDATION-001`
- `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH3-EXECUTION-001`

## Explicit non-authorization

This freeze does not authorize Batch 4, analysis, win-rate calculation,
ranking, trading rules, V002 taxonomy migration, or a Git commit.
