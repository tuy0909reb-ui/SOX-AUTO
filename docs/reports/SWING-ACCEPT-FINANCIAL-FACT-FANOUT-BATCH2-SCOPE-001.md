# Financial Fact Fan-out Batch 2 — Scope Freeze (285A)

**Record ID:** `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-001`  
**Date:** 2026-08-16  
**Authority:** Human Architect decision (Batch 1-aligned `doc-*` scope key)  
**Status:** **Batch 2 Scope = FROZEN**  
**Execution:** **NOT AUTHORIZED**

## 1. Freeze decision

Human Architect adopted Batch 1-aligned Document identity for Batch 2:

```text
Scope key: doc-f770b766ffff525fb1d4ac3879967278
```

`financial-document-5093eae6342a5d06b7a39bd8961dad3f` is retained only as a
related V002 inventory / Observation namespace citation for the same official
PDF. It is **not** the Batch 2 scope key.

Forbidden and not performed:

- auto-equating `doc-*` and `financial-document-*`
- rewriting identifiers
- intentional divergence into the V002 namespace as the fan-out key
- any change to Batch 1 Accepted / Frozen artifacts

## 2. Frozen membership

| Field | Frozen value |
|---|---|
| issuer / security_id | `kioxia_holdings` / `285A` |
| event_id | `official-event-4bda3f4c595f5ba8b34646aada3f7681` |
| candidate_document_id | `doc-f770b766ffff525fb1d4ac3879967278` |
| url | `https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf` |
| document_type | `earnings_release` |
| document_role | `primary_result` |
| observation_policy | `eligible` |
| related_financial_document_id | `financial-document-5093eae6342a5d06b7a39bd8961dad3f` (citation only) |
| existing snapshot (reference only) | `…/f78ce549….pdf` / hash `f78ce549…` |

### Actual candidate boundary

```text
IFRS revenue
measure_kind: actual
period: Q1_cumulative / fiscal_period_end 2026-06-30
unit: JPY_million
candidate page: 1
```

### Forecast candidate boundary

```text
IFRS revenue
measure_kind: company_forecast
period: Q2_cumulative / fiscal_period_end 2026-09-30
unit: JPY_million
candidate page: 2
```

### Negative-test boundary (canonical Fact excluded)

```text
Non-GAAP excluded
no Non-GAAP → IFRS conversion
no 億円 → 百万円 conversion
no actual ↔ forecast swap
no Q1 ↔ Q2 swap
no unit / period / accounting-basis inference
```

## 3. Frozen artifact and SHA-256

```text
Scope: FROZEN
Scope file: data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_scope.json
Scope key: doc-f770b766ffff525fb1d4ac3879967278
SHA-256: 157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
```

The SHA-256 was calculated mechanically from the saved scope file bytes after
Freeze. It was not hand-entered.

```text
scope_frozen_at: 2026-08-16T08:00:00+09:00
treatment_of_existing_v002_facts: additive_namespace_verification_only
v002_facts_replace_merge_or_mutate: false
```

## 4. Immutable baselines preserved

Not modified by this Freeze:

- fixed 14-issuer Universe
- 345 Events
- immutable baseline (including preexisting 64 canonical Facts)
- Batch 0 artifacts
- Batch 1 Accepted / Frozen artifacts and scope SHA
  `e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b`
- V002 existing Facts
- Gemini raw ledger
- existing local official PDF snapshot for 285A

## 5. Explicit non-authorization

This Freeze does **not** authorize:

- PDF re-acquisition or replacement
- selector implementation
- selector validation
- Observation generation
- Financial Fact generation
- Gemini reconciliation
- Batch 2 execution
- Commit

Next permitted gate:

```text
Frozen Batch 2 scope
        ↓
selector design + validation review
        ↓
Human Architect GO
        ↓
(only then) execution consideration
```

## 6. Stop state

```text
285A Batch 2 Scope
        ↓
FROZEN
        ↓
SHA-256 recorded
        ↓
Execution NOT AUTHORIZED
```

Prerequisite proposal:
`docs/reports/SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-PROPOSAL-285A-001.md`

Prior FAIL preflight (superseded by Human Architect `doc-*` decision):
`docs/reports/SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-FREEZE-PREFLIGHT-285A-001.md`
