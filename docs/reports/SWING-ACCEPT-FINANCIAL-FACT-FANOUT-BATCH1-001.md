# Financial Fact Fan-out Batch 1 Acceptance

**Record ID:** `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH1-001`  
**Date:** 2026-08-16  
**Authority:** Human Architect  
**Status:** **Batch 1 = Accepted / Frozen**

## Acceptance

Human Architect accepted the fixed Batch 1 execution recorded in
`SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXECUTION-001` as the immutable
Batch 1 baseline for subsequent fan-out work.

| Item | Decision |
|---|---|
| Fixed 8 Documents / 8 Events | Accepted |
| 11 selectors | Accepted |
| Numeric Observations = 10 | Accepted |
| Financial Facts = 10 | Accepted |
| 7735 review-only | Accepted |
| Provenance chain | Accepted |
| Official-only reconciliation | Accepted |
| Separation from Gemini raw | Accepted |
| Immutable-baseline alignment | Accepted |
| Idempotency | Accepted |
| Batch 0 regression boundary | Accepted |
| Exclusion of out-of-scope materials | Accepted |

## Frozen artifacts

Treat the following as frozen for Batch 1:

- Scope: `facts/financial_fact_fanout_batch1_scope.json`
- Scope SHA-256: `e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b`
- Local official PDF snapshots under `raw_external/financial_fact_batch1_sources/`
- Additive outputs under `facts/financial_fact_fanout_batch1_001/`
- Selector validation GO: `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXTRACTION-SELECTOR-003`
- Execution GO: `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXECUTION-001`

## Explicit non-authorization

This acceptance does **not** authorize:

- Batch 2 scope freeze
- Batch 2 selector implementation
- Batch 2 PDF acquisition
- Batch 2 Fact extraction
- remaining-Event fan-out
- analysis, ranking, or trading work
- Commit creation

Batch 2 remains in Design Review until a separate Human Architect decision.
