# Financial Fact Fan-out Batch 2 — Selector A Binding Revalidation Result

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-REVALIDATION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen 285A Batch 2 scope only  
**Prerequisite:** C2+C3 binding Modify approved by Human Architect  
**Verdict:** **FAIL — stopped for Human Architect review**

## 1. Result

```text
C2+C3 binding implementation: applied to Batch 2 validator only
Selector A revalidation:     FAIL
Selector B validation:       NOT RUN
Observation / Fact:          NOT GENERATED
Execution / Commit:          NOT AUTHORIZED
Scope / SHA / PDF:           UNCHANGED
```

The approved change separated:

```text
structural matching → whitespace collapse
numeric binding     → NFKC only; whitespace preserved
```

No Batch 1 file, frozen scope, PDF, V002 Fact, or Gemini input was modified.

## 2. Preconditions that passed

Before binding:

```text
Scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
Scope key:
  doc-f770b766ffff525fb1d4ac3879967278
PDF hash:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

Event → `doc-*` → citation-only `financial-document-*` → existing local PDF
provenance also passed.

## 3. Selector A failure

Selector A passed page-level structural location matching, then failed before
numeric binding at the proposed raw table-boundary extraction:

```text
Selector:
  batch2-285A-actual-revenue-q1
Failure:
  missing or ambiguous table bounds
Failed boundary:
  table_end = 四半期利益 Non-GAAP
```

The validator could identify the `連結経営成績（累計）` table start but could
not prove a unique end boundary using the approved end-marker rule. Therefore
it did not bind `1,767,117`, did not use a fallback range, and did not proceed
to the `%` adjacency or IFRS/Non-GAAP column proof.

## 4. Required stop behavior followed

Because Selector A failed:

- Selector A was not auto-adjusted.
- Selector A was not retried.
- Selector B was not validated.
- Negative validation was not run.
- No Observation, Financial Fact, reconciliation, or result artifact was
  generated.

## 5. Human Architect review required

The C2+C3 direction remains untested at numeric binding because the proposed
table-range delimiter itself is not source-proved uniquely. A new Modify
review must decide how a raw row's table membership is proved without:

- an inferred table end;
- first-match fallback;
- substring-only extraction;
- V002 value substitution; or
- scope/PDF/identifier changes.

Possible review question only (not implemented here):

```text
Can the raw Q1 row be bound directly by a unique conjunction of
section + header map + row marker + first amount/adjacent % pair,
without using a separately inferred table-end marker?
```

Any such next design requires a new Human Architect approval before another
revalidation attempt.

## 6. Stop state

```text
Selector A: FAIL
Selector B: NOT RUN
Positive validation: FAIL
Negative validation: NOT RUN
Financial Fact: NOT GENERATED
Execution: NOT AUTHORIZED
Commit: NOT AUTHORIZED
```
