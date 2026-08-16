# Financial Fact Fan-out Batch 4 — Fact Acceptance Review 001

**Record ID:** `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH4-001`  
**Date:** 2026-08-16  
**Scope SHA-256:** `c27f20e039d58604b809d63dea11a272bb36ce121c9c41aa19ff4c5495f6b1a2`  
**Extraction record:** `SWING-EXEC-FINANCIAL-FACT-FANOUT-BATCH4-EXTRACTION-001`  
**Verdict:** **APPROVE**

## Acceptance result

```text
Scope SHA-256:                  PASS / unchanged
Document / Event / Selector:    PASS
Numeric binding:                PASS
Observations / Financial Facts: 3 / 3
Observation → Fact relation:    1:1 (established Fanout observation model)
Official-only reconciliation:   3 / 3
Gemini as an input:             false
V002 mutation:                  false
Event SoT mutation:             false
Batch 0–3 integrity:            PASS
Idempotency:                    PASS
Unexpected Facts / failures:    0 / 0
Commit:                          NOT AUTHORIZED
```

The established Fanout model stores its accepted Fact-layer values as three
`financial_observation` records; the output summary reports the same three
records as `financial_facts_generated`. No parallel Fact table is required or
introduced.

## Accepted Fact-layer values

| Issuer | Measure | Period | Value | Unit | Official page |
|---|---|---|---:|---|---:|
| 5803 | actual revenue / 売上高 | Q1 cumulative / 2026-03 | 267,908 | JPY_million | 1 |
| 5803 | actual revenue / 売上高 | Q2 cumulative / 2026-03 | 558,994 | JPY_million | 1 |
| 5803 | actual revenue / 売上高 | Q3 cumulative / 2026-03 | 854,931 | JPY_million | 1 |

All retain `currency=JPY`, `accounting_standard=JGAAP`,
`consolidation=consolidated`, `measure_kind=actual`, and
`value_conversion_rule_id=JPY_million_identity_v1`.

## 1. Observation-Fact Integrity — PASS

There are exactly three unique `(event_id, period_basis)` records:

```text
Q1 Event → 1 Observation / 1 Fact-layer value
Q2 Event → 1 Observation / 1 Fact-layer value
Q3 Event → 1 Observation / 1 Fact-layer value
```

The extraction summary reports `observations_generated=3` and
`financial_facts_generated=3`. This is the same 1:1 representation used by
the accepted Fanout baseline, not a new duplicate Fact store.

## 2. Fact Payload Integrity — PASS

Every record matches the frozen Scope:

```text
company:       5803
metric:        revenue / 売上高
measure_kind:  actual
period:        Q1 / Q2 / Q3 cumulative, FY2026-03
unit:          JPY_million
source:        one official TDnet Document per Event
```

No forecast, full-year, other metric, other Event, other issuer, or Batch 1
template record was emitted.

## 3. Numeric Integrity — PASS

Extracted values equal their approved numeric-binding candidates:

```text
Q1: 267,908 百万円
Q2: 558,994 百万円
Q3: 854,931 百万円
```

Each evidence row records `candidate_count=1`, bound first revenue column,
exact actual row, and `forecast_excluded=true`.

## 4. Provenance — PASS

For all three accepted records:

```text
official_earnings_event
→ doc-* Document identity + TDnet URL + snapshot SHA-256
→ Batch 4 selector
→ Batch 4 numeric binding (first revenue column / unique candidate)
→ financial_observation
→ Fact-layer summary
```

Each Observation has exactly one primary numeric source link and one selector
evidence-location record. Every reconciliation row is `official_only`; Gemini
fields are null.

## 5. Namespace / Boundary Integrity — PASS

```text
Output:      financial_fact_fanout_batch4_001/ (additive)
Batch 0–3:  unchanged
V002:        unchanged / no merge
Event SoT:   unchanged
Gemini:      not input
Analysis / Ranking / Trading / PFOS / Decision: not authorized
```

## 6. Idempotency — PASS

The extraction runner executed twice with identical output digests. The
execution test also passed:

```text
python scripts/stock_swing/run_financial_fact_batch4.py
  → idempotent=true

python -m unittest tests/test_stock_swing_financial_fact_batch4_execution.py
  → PASS
```

## 7. Architecture Risk — 有（bounded）

1. Treating accepted Fact-layer records as authorization for Analysis,
   Ranking, Trading, PFOS, or Decision.
2. Expanding the accepted set beyond three frozen actual-revenue records.
3. Merging the additive Batch 4 output into V002.
4. Treating Acceptance as Commit authorization.

## Final recommendation

```text
Batch 4 Fact Acceptance Review Result:

1. Observation-Fact Integrity:
PASS
理由: 3 Event / 3 Observation / 3 Fact-layer value の 1:1。

2. Fact Payload Integrity:
PASS
理由: company / event / period / metric / value / unit / source が
      frozen Scope と一致。

3. Numeric Integrity:
PASS
理由: Q1 267,908; Q2 558,994; Q3 854,931 百万円が
      numeric binding と一致し candidate_count=1。

4. Provenance:
PASS
理由: Event→Document/URL/SHA→Selector→Numeric Binding→Observation
      の参照が全3件で完結。

5. Namespace / Boundary:
PASS
理由: Batch 4 additive namespace のみ。Batch 0–3 / V002 / Event SoT
      は不変、Gemini 非入力。

6. Idempotency:
PASS
理由: 同一 Scope の再実行で同一 output digests。

7. Risk:
有
内容: Acceptance→Analysis/Decision 誤接続、scope expansion、V002 merge、
      Acceptance→Commit 誤読。

8. Final Recommendation:

Batch 4 Fact Acceptance:
APPROVE

Conditions:
1. Accepted set is only the three frozen 5803 actual-revenue records.
2. Keep `financial_fact_fanout_batch4_001/` additive; do not merge/replace
   V002 or mutate Event SoT / Batch 0–3.
3. No Analysis, Ranking, Trading, PFOS, or Decision authorization follows.
4. Output freeze / Commit require separate Human Architect authorization.
```

## Stop state

```text
Batch 4 Fact Acceptance: APPROVE
        ↓
STOP — Output Freeze / Commit are separate gates
        ↓
(no Analysis / Ranking / Trading / PFOS / Decision)
```

