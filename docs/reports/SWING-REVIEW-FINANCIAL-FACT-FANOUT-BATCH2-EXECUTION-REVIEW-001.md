# Financial Fact Fan-out Batch 2 — Execution Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-REVIEW-001`  
**Date:** 2026-08-16  
**Scope:** Frozen 285A Batch 2 only  
**Review input:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-EXECUTION-001`  
**Verdict:** **GO**  
**Next gate:** Batch 2 Acceptance decision  

## 1. Review result

```text
Baseline integrity:         PASS
Scope integrity:            PASS
Selector integrity:         PASS
Observation integrity:      PASS
Financial Fact integrity:   PASS
Provenance:                 PASS
Reconciliation:             PASS
Negative boundary:          PASS
Gemini separation:          PASS
Existing Fact isolation:    PASS
Idempotency:                PASS
Failures:                   0
```

```text
Batch 2 Execution Review: GO
285A Facts:                 ACCEPTABLE
Baseline:                   INTACT
Provenance:                 VERIFIED
```

This GO is limited to accepting the reviewed Batch 2 execution evidence. It
does not authorize Batch 3, analysis, ranking, regime work, trading rules, or
Commit.

## 2. Frozen baseline and scope

The current independent audit passed the runner's fail-closed baseline gates:

```text
Batch 2 scope SHA:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
Batch 1 scope SHA:          PASS
Gemini ledger SHA:          PASS
Official Event count:       345
Canonical / V002 Facts:     64
Batch 0 Observations:       11
Batch 0 artifact digests:   PASS
Batch 1 artifact digests:   PASS
V002 artifact digests:      PASS
```

The Batch 2 local official PDF hash also passed:

```text
f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

The review found one frozen Event and one frozen candidate Document only:

```text
Event:     official-event-4bda3f4c595f5ba8b34646aada3f7681
Document:  doc-f770b766ffff525fb1d4ac3879967278
Security:  285A
```

## 3. Reviewed Financial Facts

```text
Selector:       batch2-285A-actual-revenue-q1
Fact:           IFRS consolidated revenue
Status:         actual
Period:         2027年3月期第1四半期 / Q1 cumulative
Period end:     2026-06-30
Value:          1,767,117 JPY_million
Evidence:       page 1 / 連結経営成績(累計) / 売上収益 /
                same-row adjacent % 415.5
```

```text
Selector:       batch2-285A-forecast-revenue-q2-cumulative
Fact:           IFRS consolidated revenue
Status:         company_forecast
Period:         第2四半期(累計) / Q2 cumulative
Period end:     2026-09-30
Value:          4,157,117 JPY_million
Evidence:       page 2 / 2027年3月期の連結業績予想 / 売上収益 /
                same-row adjacent % 425.5
```

Both records have:

```text
currency:                  JPY
unit_code:                 JPY_million
source unit:               百万円
normalization:             JPY_million_identity_v1
consolidation:             consolidated
accounting basis:          IFRS
Financial Observations:    2
Financial Facts:           2
```

## 4. Observation, provenance, and reconciliation

Each Observation has exactly one selector-evidence location and exactly one
`primary_numeric_evidence` Observation→Document link. The joined audit
confirmed:

```text
Event
→ candidate Document
→ local official PDF
→ matching PDF content hash
→ approved Selector
→ selector evidence
→ Observation / Financial Fact
```

There are two reconciliation rows. Both are:

```text
match_status:       official_only
official unit:      JPY_million
Gemini row ID:      null
Gemini value:       null
```

Thus the Fact inputs were official PDF selector evidence, not Gemini raw
values. No reconciliation result was used to modify a Fact.

## 5. Negative boundary

The selector evidence for both rows records:

```text
bound_column:      IFRS_revenue_amount
table_end_used:    false
```

No emitted row uses Non-GAAP, `億円`, table-end membership, an alternative
period, row, page, or section. The reviewed Evidence also proves unit,
period, and accounting basis rather than filling them by inference.

## 6. Isolation and idempotency

The only generated output namespace is:

```text
data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_001/
```

All nine required output artifacts exist and joined consistently. The Batch 2
runner accepts a pre-existing namespace only when all expected bytes match;
otherwise it fails closed. The recorded two-run execution was
digest-identical, with no duplicate Observation or Fact.

V002's related `financial-document-*` citation remains separate from the
Batch 2 `doc-*` candidate Document. No V002, Batch 0, or Batch 1 record was
merged, replaced, or modified.

## 7. Review evidence

The current audit independently confirmed:

```text
Baseline:           PASS
Scope:              PASS
Facts:              PASS
Provenance:         PASS
Reconciliation:     PASS
Negative boundary:  PASS
Gemini separation:  PASS
Output files:       PASS (9 / 9)
```

The prior idempotency execution and acceptance tests remain valid evidence:

```text
python scripts/stock_swing/run_financial_fact_batch2.py
python -m unittest tests/test_stock_swing_financial_fact_batch2_selectors.py \
  tests/test_stock_swing_financial_fact_batch2_execution.py -v

3 tests: OK
```

## 8. Stop state

```text
Batch 2 Execution Review: PASS / GO
Next allowed decision:      Batch 2 Acceptance / Freeze decision
Batch 3:                    NOT AUTHORIZED
Analysis / ranking:         NOT AUTHORIZED
Trading work:               NOT AUTHORIZED
Commit:                     NOT AUTHORIZED
```
