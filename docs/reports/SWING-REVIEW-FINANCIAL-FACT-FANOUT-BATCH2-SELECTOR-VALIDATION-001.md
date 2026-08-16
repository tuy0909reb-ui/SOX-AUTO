# Financial Fact Fan-out Batch 2 — Selector Validation Result (285A)

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-VALIDATION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen 285A Batch 2 scope only  
**Verdict:** **FAIL — stopped for Human Architect review**  
**Execution:** **NOT AUTHORIZED**

## 1. Overall result

```text
Selector A:               FAIL
Selector B:               NOT RUN
Positive validation:      FAIL
Negative validation:      NOT RUN
PDF hash:                 PASS
Scope SHA-256:            PASS / unchanged
Financial Observation:    NOT GENERATED
Financial Fact:           NOT GENERATED
Execution:                NOT AUTHORIZED
Commit:                   NOT AUTHORIZED
```

Validation stopped at the first fail-closed positive check. Per the approved
request, the failed selector was not modified and validation was not rerun.

## 2. Preconditions that passed

```text
Frozen scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2

Scope key:
  doc-f770b766ffff525fb1d4ac3879967278

Existing local PDF hash:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

The validation implementation checked the Event → `doc-*` → citation-only
`financial-document-*` → local snapshot relationship without changing either
namespace. The PDF was read locally; it was not re-fetched or replaced.

## 3. Selector A failure

Target:

```text
Selector:  batch2-285A-actual-revenue-q1
Target:    IFRS revenue / Q1 actual / JPY_million
Page:      1
```

The structural markers located page 1. Failure occurred at numeric-row
evidence binding:

```text
Expected target value:  1,767,117
Observed after whitespace collapse: 1,767,117415
Result: missing or ambiguous target value
```

### Cause

The Batch 1 marker matcher intentionally collapses whitespace to tolerate PDF
extraction spacing. In this PDF's page-1 actual row, the `売上収益` IFRS value
is immediately followed by the percentage column (`415.5`). Collapsing
whitespace therefore destroys the numeric column boundary:

```text
raw row shape:      2027年3月期第1四半期  1,767,117  415.5  ...
collapsed shape:    2027年3月期第1四半期1,767,117415.5...
```

The implementation correctly refused to treat `1,767,117415` as the
canonical `1,767,117`. It did not use first-match, nearest-number, inferred
column width, or an existing V002 value as a substitute.

## 4. Items intentionally not run

Because Selector A failed:

- Selector B positive validation was not run.
- The complete negative suite was not run.
- No retry, selector adjustment, or alternative regex was attempted.
- No Observation, Financial Fact, reconciliation, or Batch 2 Result was
  created.

The implementation and its test are retained as failure evidence only:

- `scripts/stock_swing/validate_financial_fact_batch2_selectors.py`
- `tests/test_stock_swing_financial_fact_batch2_selectors.py`

IDE diagnostics for those files were clean; runtime validation and its test
both fail at the same Selector A boundary.

## 5. Required Human Architect decision

The frozen scope is sound; the issue is limited to the approved selector
design's numeric-column binding rule. Human review must choose whether to:

1. **MODIFY** selector design to preserve raw row column delimiters for
   numeric binding while still using whitespace-collapsed text only for
   structural marker matching; or
2. **REJECT / defer** Batch 2 extraction for this PDF.

Any revised design must continue to prove:

```text
page 1 → IFRS 売上収益 first numeric column → Q1 actual → 百万円
page 2 → IFRS 売上収益 first numeric column → Q2 cumulative forecast → 百万円
```

and must retain the frozen Non-GAAP, `億円`, actual/forecast, and period
fail-closed boundaries.

## 6. Immutable state

Unchanged:

- Frozen Batch 2 scope and SHA-256
- Fixed 14-issuer Universe and 345 Events
- Batch 0 and Batch 1 artifacts
- Existing V002 / 64-Fact baseline
- Existing 285A local official PDF snapshot
- Gemini raw ledger

```text
Next state: Human Architect Selector Validation Result Review
```
