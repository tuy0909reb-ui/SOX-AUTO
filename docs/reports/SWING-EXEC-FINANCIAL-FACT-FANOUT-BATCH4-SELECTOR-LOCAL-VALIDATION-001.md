# Financial Fact Fan-out Batch 4 — Selector Implementation & Local Fail-Closed Test Execution 001

**Record ID:** `SWING-EXEC-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-LOCAL-VALIDATION-001`  
**Date:** 2026-08-16  
**Authorization:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-DESIGN-AUTH-001`  
**Verdict:** **COMPLETED**

## Implementation

```text
scripts/stock_swing/validate_financial_fact_batch4_selectors.py
tests/test_stock_swing_financial_fact_batch4_selectors.py
```

The new validator is Batch 4-only. It binds each selector to its Event,
Document ID, official TDnet URL, inventory SHA-256 snapshot, expected page,
section, table, unit, period marker, and exact current-year actual row.

It performs structural checks only. It records no numeric value:

```text
numeric_value_read: false
Observation generated: 0
Financial Fact generated: 0
```

Validation log (additive):

```text
data/stock/stock_swing/facts_phase_a/facts/
financial_fact_fanout_batch4_selector_validation_001/
  selector_validation_summary.json
```

## 1. Implementation — PASS

| Selector | Event | Binding | Result |
|---|---|---|---|
| `batch4-5803-actual-revenue-q1` | Q1 | `2026年3月期第1四半期` | PASS |
| `batch4-5803-actual-revenue-q2` | Q2 | `中間期` + `2026年3月期中間期` | PASS |
| `batch4-5803-actual-revenue-q3` | Q3 | `第3四半期` + `2026年3月期第3四半期` | PASS |

All three bind uniquely to page 1's `連結経営成績` / `売上高` /
`百万円` actual-table context. No Batch 1–3 selector was modified or invoked
as the cohort selector.

## 2. Local Fail-Closed Tests

```text
Q1: PASS
Q2: PASS
Q3: PASS
```

Command:

```text
python -m unittest tests/test_stock_swing_financial_fact_batch4_selectors.py
```

Result:

```text
Ran 2 tests
OK
```

## 3. Fail Conditions Verification

Every listed case returned `fail_closed` for every selector (24 negative
checks total):

```text
period:              PASS
row:                 PASS
document:            PASS
candidate uniqueness: PASS
forecast exclusion:  PASS
```

Additional required failures verified:

```text
page1 false positive: PASS
actual row non-unique: PASS
wrong page: PASS
```

The test suite uses synthetic structural rows without numeric values for
ambiguity checks. The production validator rejects a candidate unless exactly
one current-year row has both a nearby `売上高` header and `百万円` unit, and
the `連結経営成績` section precedes the `連結業績予想` boundary.

## 4. Boundary Check — PASS

```text
Batch 0–3: read-only
V002:      no merge
Event SoT: unchanged
Gemini:    not used
Source:    Phase I official TDnet snapshots only
Extension: Batch 4 additive code, test, and log only
```

No Fact Extraction, Observation generation, Fact generation, Fact Scope
Proposal, Fact Scope Freeze, Acceptance, or Commit occurred.

## 5. Fact Scope

```text
NOT REACHED
```

Selector-local PASS is technical evidence only; it does not reclassify the
cohort to track A or authorize a Fact Scope Proposal.

## 6. Final Status

```text
Selector Local Validation: COMPLETED
```

## Stop state

```text
Selector implementation + local fail-closed tests: COMPLETED
        ↓
STOP — separate selector-GO review / Architect decision required
        ↓
(only after that) separate Fact Scope Proposal
```

