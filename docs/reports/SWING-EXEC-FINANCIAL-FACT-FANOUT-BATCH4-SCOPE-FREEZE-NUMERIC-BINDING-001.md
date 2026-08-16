# Financial Fact Fan-out Batch 4 — Scope Freeze & Numeric Binding Execution 001

**Record ID:** `SWING-EXEC-FINANCIAL-FACT-FANOUT-BATCH4-SCOPE-FREEZE-NUMERIC-BINDING-001`  
**Date:** 2026-08-16  
**Authorization:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-FACT-SCOPE-FREEZE-EXTRACTION-AUTH-001`  
**Verdict:** **COMPLETED** — Scope Freeze + numeric binding validation only; Extraction remains unapproved

## 1. Scope Freeze Execution — PASS

Frozen Scope artifacts:

```text
data/stock/stock_swing/facts_phase_a/facts/
  financial_fact_fanout_batch4_scope.json
  financial_fact_fanout_batch4_scope.sha256
```

```text
scope SHA-256:
c27f20e039d58604b809d63dea11a272bb36ce121c9c41aa19ff4c5495f6b1a2

scope hash verification: PASS
```

The manifest locks:

```text
5803 / FY2026-03 / actual revenue only
Q1, Q2, Q3: exactly three Events and three doc-* Documents
official TDnet URLs, local official snapshot SHA-256 values
Batch 4-only selector IDs and exact actual rows
period / metric / unit boundaries
forecast, FY full-year, other metrics/events, Batch1 template: excluded
```

No numeric Fact payload is present in the frozen Scope artifact.

## 2. Numeric Binding Implementation — PASS

```text
scripts/stock_swing/validate_financial_fact_batch4_numeric_bindings.py
tests/test_stock_swing_financial_fact_batch4_numeric_bindings.py
```

The Batch 4-only validator consumes the frozen scope SHA and official snapshot
hashes. It binds only:

```text
exact current-year actual row
→ first 売上高 column (column index 0)
→ exactly one numeric candidate
```

Validation log (additive):

```text
data/stock/stock_swing/facts_phase_a/facts/
financial_fact_fanout_batch4_numeric_binding_validation_001/
  numeric_binding_validation_summary.json
```

## 3. Local Fail-Closed Tests

```text
Q1: PASS
Q2: PASS
Q3: PASS
```

Command:

```text
python -m unittest tests/test_stock_swing_financial_fact_batch4_numeric_bindings.py
```

Result:

```text
Ran 2 tests
OK
```

For every member, eight negative cases fail closed:

```text
wrong column
prior-year row
forecast row
duplicate numeric candidate
period mismatch
actual-row mismatch
document mismatch
malformed numeric candidate
```

Total negative checks: **24** (8 × 3), all `fail_closed`.

## 4. Numeric Validation — PASS

| Period | Exact actual row | Revenue column | Numeric candidate count | Result |
|---|---|---:|---:|---|
| Q1 | `2026年3月期第1四半期` | 0 (`売上高`) | 1 | PASS |
| Q2 | `2026年3月期中間期` | 0 (`売上高`) | 1 | PASS |
| Q3 | `2026年3月期第3四半期` | 0 (`売上高`) | 1 | PASS |

```text
actual row:          PASS
revenue column:      PASS
period:              PASS
candidate uniqueness: PASS
```

This records numeric **binding validation**, not Observation or Fact emission.

## 5. Boundary Check — PASS

```text
Batch 0–3: read-only
V002:      no merge
Event SoT: unchanged
Gemini:    not used
Source:    official TDnet snapshots only
Extension: Batch 4 additive scope / validator / tests / logs only

Observation generated: 0
Financial Fact generated: 0
Acceptance / Commit: not authorized
```

## 6. Extraction Authorization

```text
NOT REACHED
```

This execution provides Scope Freeze and numeric-binding evidence only. A
separate Numeric-Binding GO / Extraction Authorization review is required
before any Observation or Fact can be generated.

## 7. Final Status

```text
Scope Freeze:    COMPLETED
Numeric Binding: COMPLETED
```

## Stop state

```text
Scope Freeze + Numeric Binding Validation COMPLETED
        ↓
STOP — Numeric-Binding GO / Extraction Authorization is separate
        ↓
(no Observation / Fact / Acceptance / Commit)
```

