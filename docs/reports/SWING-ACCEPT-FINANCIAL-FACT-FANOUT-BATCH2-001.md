# Financial Fact Fan-out Batch 2 Acceptance / Freeze

**Record ID:** `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH2-001`  
**Date:** 2026-08-16  
**Authority:** Human Architect  
**Status:** **Batch 2 = Accepted / Frozen**

## Acceptance

Human Architect accepted the fixed 285A Batch 2 execution reviewed in
`SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-REVIEW-001` as the
immutable Batch 2 baseline for subsequent fan-out work.

```text
Batch 2
285A
2 Financial Facts
        ↓
ACCEPTED
        ↓
FROZEN
```

| Item | Decision |
|---|---|
| Baseline integrity | Accepted |
| Scope / PDF integrity | Accepted |
| Selectors = 2 | Accepted |
| Numeric Observations = 2 | Accepted |
| Financial Facts = 2 | Accepted |
| Provenance chain | Accepted |
| Official-only reconciliation = 2 | Accepted |
| Negative boundary (`table_end_used=false`) | Accepted |
| Separation from Gemini raw | Accepted |
| V002 / Batch 0 / Batch 1 intact | Accepted |
| Idempotency | Accepted |
| Failures = 0 | Accepted |

## Accepted Facts

| Issuer | Measure | Period | Value | Unit | Accounting |
|---|---|---|---|---|---|
| 285A | actual | Q1 cumulative / `2027年3月期第1四半期` | `1,767,117` | JPY_million | IFRS |
| 285A | company_forecast | Q2 cumulative / `第2四半期(累計)` | `4,157,117` | JPY_million | IFRS |

Both Facts retain:

```text
currency:       JPY
unit_code:      JPY_million
consolidation:  consolidated
normalization:  JPY_million_identity_v1
```

## Frozen artifacts

Treat the following as frozen for Batch 2:

- Scope: `facts/financial_fact_fanout_batch2_scope.json`
- Scope SHA-256: `157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2`
- Scope key: `doc-f770b766ffff525fb1d4ac3879967278`
- Event: `official-event-4bda3f4c595f5ba8b34646aada3f7681`
- Local official PDF snapshot:
  `raw_external/financial_fact_sample_sources/f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3.pdf`
- PDF content hash: `f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3`
- Additive outputs under `facts/financial_fact_fanout_batch2_001/`
- Selector evidence for:
  - `batch2-285A-actual-revenue-q1`
  - `batch2-285A-forecast-revenue-q2-cumulative`
- Selector validation PASS:
  `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-REVALIDATION-002`
- Execution result:
  `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-001`
- Execution Review GO:
  `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-REVIEW-001`

Frozen Batch 2 output digests:

```text
financial_document_inventory.jsonl               11d9f3a66f620a5d37419d25d79a2b8362e50f211a3c1831c186e3dba94897cd
financial_document_source_link.jsonl             142b1afaf0b71e0e652c6c21d9f262489012fdc36571c3e5495374d2f3fd3b2b
financial_observation.jsonl                      144744fba85397d9c760624103135d6fec8d037f19f0babb9868660b154e359a
financial_observation_source_link.jsonl          b9f21f18e48e5a4819c02e2945af4594f20f60427d1ae9ab733d5c1dd47c54b6
financial_observation_reconciliation.jsonl       e37d16d5026cbde7fc75c2043f11b9deed61e43b7cb414eefff9d0c047dc7688
selector_evidence_location.jsonl                 e9ccac42b462a9b0d5971367640b66957267e9d08faf97842066fc6067319bd6
document_outcome.jsonl                            e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
document_results.json                             c79c206a8ac58844d8ad0bd2988f38e459ed6e5eb842e10242992eddcc95de58
summary.json                                      fa9899216e66dfa564e7c1a64bbbb9cc0e67381c973692d3e4041902f9f09adf
```

## Existing asset isolation

This acceptance does **not** change:

- Batch 0 Accepted / Frozen artifacts
- Batch 1 Accepted / Frozen artifacts
- Canonical / V002 Financial Facts (64)
- Gemini ledger
- Event SoT (345)

Batch 2 remains an additive namespace only. V002's
`financial-document-5093eae6342a5d06b7a39bd8961dad3f` stays a citation-only
related identifier and is not auto-equated with the Batch 2 `doc-*` key.

## Explicit non-authorization

This acceptance means only that the **285A Batch 2 Financial Facts** are now
formal foundational Facts.

It does **not** authorize:

- 14-issuer full Fact foundation completion
- Batch 3 scope / selectors / extraction
- regime / market-phase analysis
- win-rate calculation
- ranking
- trading conditions / rules
- Commit creation

## Current foundation state

```text
Batch 0
ACCEPTED / FROZEN
        +
Batch 1
ACCEPTED / FROZEN
        +
Batch 2 — 285A
ACCEPTED / FROZEN
```

**Batch 3 remains unapproved.**
