# Financial Fact Fan-out Batch 2 — Selector Binding Modify 002 Revalidation Result

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-REVALIDATION-002`  
**Date:** 2026-08-16  
**Scope:** Frozen 285A Batch 2 scope only  
**Prerequisite:** Modify Review 002 approved by Human Architect  
**Verdict:** **PASS — stopped for Human Architect Selector Validation Result Review**  
**Execution:** **NOT AUTHORIZED**

## 1. Overall result

```text
Selector A implementation:     PASS
Selector A positive validation: PASS
Selector A negative validation: PASS
PDF hash:                      PASS
Scope SHA:                     UNCHANGED
Selector B:                    RUN
Selector B status:             PASS
Observation:                   NOT GENERATED
Financial Fact:                NOT GENERATED
Execution:                     NOT AUTHORIZED
Commit:                        NOT AUTHORIZED
```

This PASS means Selector A/B validation succeeded under Modify 002. It does
**not** authorize Observation / Financial Fact extraction, Batch 2 Execution,
or Commit.

## 2. Preconditions that remained frozen

```text
Frozen scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2

Scope key:
  doc-f770b766ffff525fb1d4ac3879967278

Existing local PDF hash:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

Scope / Event / Document identity / PDF content were not changed. The PDF was
read from the existing local official snapshot only.

## 3. Modify 002 implementation applied

Selector A binding no longer uses table-end membership proof.

Retained (C2+C3):

```text
structural markers → whitespace collapse
numeric binding    → NFKC only; whitespace preserved
header map         → IFRS amount column
adjacent %         → same-row boundary evidence
```

Removed:

```text
table_start / table_end region carving
四半期利益 Non-GAAP as table-end proof
last row / last numeric row / PDF final-row proof
```

Approved Selector A conjunction:

```text
page
+ section
+ header map (売上収益 / Non-GAAP + 百万円 / %)
+ period row (2027年3月期第1四半期)
+ IFRS amount
+ same-row adjacent %
```

Horizontal amount/`%` adjacency is enforced with spaces/tabs only, so the pair
cannot jump across lines.

## 4. Selector A positive evidence

```text
Selector:  batch2-285A-actual-revenue-q1
Page:      1
Section:   連結経営成績(累計)
Header:    売上収益 → Non-GAAP ; 百万円 % 百万円 %
Period:    2027年3月期第1四半期
Amount:    1,767,117 百万円 (IFRS)
Adjacent %: 415.5
Match count: 1
table_end_used: false
```

## 5. Selector A negative suite (fail-closed)

All required negatives closed without auto-fix / first-match / retry:

```text
wrong_section
multiple_section
missing_header_map
ifrs_non_gaap_ambiguity
wrong_period_row
multiple_period_rows
wrong_column
multiple_amount_candidates
missing_amount
missing_percentage
amount_percent_row_mismatch
unit_mismatch
period_mismatch
wrong_page
scope_mismatch
hash_mismatch
table_end_not_used_as_proof
non_gaap_amount_not_ifrs
no_oku_yen_conversion
substring_only_forbidden
```

## 6. Selector B (run only after A PASS)

```text
Selector:  batch2-285A-forecast-revenue-q2-cumulative
Page:      2
Section:   2027年3月期の連結業績予想
Period:    第2四半期(累計)
Amount:    4,157,117 百万円 (IFRS)
Adjacent %: 425.5
Match count: 1
table_end_used: false
Status:    PASS
```

No new Selector B design change was introduced. The same Modify 002 rule —
no table-end dependency — was applied.

## 7. Artifacts touched

```text
scripts/stock_swing/validate_financial_fact_batch2_selectors.py
tests/test_stock_swing_financial_fact_batch2_selectors.py
docs/reports/SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-REVALIDATION-002.md
```

Not touched:

```text
Batch 2 scope JSON / SHA
PDF snapshot
Batch 0 / Batch 1 outputs
V002 Observations / Facts
Gemini ledger
```

## 8. Stop state

```text
Selector Validation: PASS (A + B)
Next gate: Human Architect — Selector Validation Result Review
Observation / Fact generation: NOT AUTHORIZED
Batch 2 Execution: NOT AUTHORIZED
Commit: NOT AUTHORIZED
```

Human Architect must review this result before any Fact extraction authority
is considered.
