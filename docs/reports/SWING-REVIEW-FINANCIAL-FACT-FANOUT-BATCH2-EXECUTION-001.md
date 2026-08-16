# Financial Fact Fan-out Batch 2 — Execution Result 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen 285A Batch 2 scope only  
**Prerequisite:** Selector Validation Result approved  
**Verdict:** **READY FOR Batch 2 Execution Review**  
**Commit:** **NOT AUTHORIZED**

## 1. Boundary

Executed only the two approved selectors in:

```text
data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_scope.json
```

No selector design or validation rule was changed. No Batch 0, Batch 1,
existing V002 Fact, Gemini ledger, Event, Document identity, scope, or PDF
content was modified. The PDF was read only from the frozen local snapshot.

The scope's existing `execution_forbidden: true` remains unchanged. It was the
pre-authorization guard against automatic execution; this explicitly
authorized execution request is recorded in the output summary, not by
rewriting the frozen scope.

## 2. Frozen provenance

```text
Event:
  official-event-4bda3f4c595f5ba8b34646aada3f7681
Document:
  doc-f770b766ffff525fb1d4ac3879967278
Scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
PDF SHA-256:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

Both scope and PDF hash checks passed before extraction and after the
idempotency rerun.

## 3. Result

```text
Events:                         1
Documents:                      1
Validated selectors:            2
Numeric Observations generated: 2
Financial Facts generated:      2
Reconciliation rows:            2 (official_only)
Failures:                       0
Batch 2 rerun:                  digest-identical
```

As in Batch 1, the bounded Fact contract represents each canonical numeric
Financial Fact as one `financial_observation` row. Thus two Observations are
the two generated Financial Facts.

## 4. Generated Facts

| Selector | Fact | Evidence |
|---|---|---|
| `batch2-285A-actual-revenue-q1` | IFRS consolidated revenue, actual, Q1 cumulative, `1,767,117` JPY_million, period end `2026-06-30` | page 1; `連結経営成績(累計)`; `売上収益 → Non-GAAP` header map; `2027年3月期第1四半期`; adjacent `%` `415.5` |
| `batch2-285A-forecast-revenue-q2-cumulative` | IFRS consolidated revenue, company forecast, Q2 cumulative, `4,157,117` JPY_million, period end `2026-09-30` | page 2; `2027年3月期の連結業績予想`; `売上収益 → Non-GAAP` header map; `第2四半期(累計)`; adjacent `%` `425.5` |

Both rows retain:

```text
currency:                JPY
unit_code:               JPY_million
source_unit_raw:         百万円
normalization:           JPY_million_identity_v1
consolidation:           consolidated
accounting_standard:     IFRS
table_end_used:          false
```

## 5. Provenance and reconciliation

For each emitted Fact:

```text
Event
→ doc-f770... candidate Document
→ frozen local official PDF
→ PDF content hash
→ approved Selector
→ selector_evidence_location
→ Financial Observation / Fact
```

Each Observation has exactly one `primary_numeric_evidence` Document link and
one Selector-evidence row. Reconciliation records are `official_only`; Gemini
fields are null and Gemini was not used as an input.

The pre-existing V002 namespace remains untouched. Its
`financial-document-*` identifier is a citation-only related namespace and
was not auto-equated, merged, replaced, or overwritten with the Batch 2
`doc-*` candidate Document.

## 6. Output and idempotency

Only this additive namespace was written:

```text
data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_001/
```

It contains all requested artifacts:

```text
financial_document_inventory.jsonl
financial_document_source_link.jsonl
financial_observation.jsonl
financial_observation_source_link.jsonl
financial_observation_reconciliation.jsonl
selector_evidence_location.jsonl
document_outcome.jsonl
document_results.json
summary.json
```

The runner rebuilds deterministic content and accepts an existing output only
when every expected artifact is byte-identical; unexpected, incomplete, or
conflicting existing output fails closed. Two consecutive executions produced
identical digests.

## 7. Verification

```text
python scripts/stock_swing/run_financial_fact_batch2.py
python -m unittest tests/test_stock_swing_financial_fact_batch2_selectors.py \
  tests/test_stock_swing_financial_fact_batch2_execution.py -v

Ran 3 tests: OK
```

The acceptance test verifies correct Document, PDF provenance, selector
evidence, values, unit, period, accounting basis, consolidation,
official-only reconciliation, and source-link traceability.

Frozen-baseline integrity gates also fail closed when any of the following
drifts:

```text
Batch 2 scope SHA
Batch 1 scope SHA
Gemini ledger SHA
official Event cardinality (345)
canonical / V002 Financial Fact count (64)
Batch 0 Observation count (11)
Batch 0 / Batch 1 / V002 output digests
```

## 8. Stop state

```text
Batch 2 extraction:       COMPLETE
Batch 2 Execution Review: REQUIRED
Batch 3:                  NOT STARTED
Analysis / ranking:       NOT STARTED
Commit:                   NOT AUTHORIZED
```

This record does not authorize a next batch or any non-Fact work.
