# Financial Fact Fan-out Batch 4 — Extraction Execution 001

**Record ID:** `SWING-EXEC-FINANCIAL-FACT-FANOUT-BATCH4-EXTRACTION-001`  
**Date:** 2026-08-16  
**Authorization:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-NUMERIC-BINDING-GO-EXTRACTION-AUTH-001`  
**Scope SHA-256:** `c27f20e039d58604b809d63dea11a272bb36ce121c9c41aa19ff4c5495f6b1a2`  
**Verdict:** **COMPLETED**

## Runner and additive output

```text
scripts/stock_swing/run_financial_fact_batch4.py

data/stock/stock_swing/facts_phase_a/facts/
financial_fact_fanout_batch4_001/
```

The established Fanout output model records generated Fact-layer values as
`financial_observation.jsonl`, with the summary’s `financial_facts_generated`
count. No new parallel Fact table was introduced.

## 1. Pre-Execution Check — PASS

```text
Scope SHA:        PASS
Document SHA:     PASS
Event identity:   PASS
Selector:         PASS
Numeric Binding:  PASS
```

The runner revalidated Scope SHA, official snapshot hashes, Event identity,
Batch 4-only selectors, and numeric bindings before emission. It then ran
twice with identical output digests (idempotent).

## 2. Extraction Result

| Period | Value | Observation | Fact-layer result |
|---|---:|---|---|
| Q1 cumulative | 267,908 百万円 | PASS | PASS |
| Q2 cumulative | 558,994 百万円 | PASS | PASS |
| Q3 cumulative | 854,931 百万円 | PASS | PASS |

```text
Q1: PASS / Observation PASS / Fact PASS
Q2: PASS / Observation PASS / Fact PASS
Q3: PASS / Observation PASS / Fact PASS
```

Generated totals:

```text
observations_generated:       3
financial_facts_generated:    3
reconciliation_rows:          3
failures:                     0
```

## 3. Provenance — PASS

Every emitted Observation preserves:

```text
Event ID
→ doc-* source Document + official TDnet URL + content SHA-256
→ Batch 4 selector ID
→ Batch 4 numeric-binding ID (first 売上高 column; candidate_count=1)
→ Observation
→ Fact-layer summary count
```

Evidence records are in:

```text
financial_document_inventory.jsonl
financial_document_source_link.jsonl
financial_observation.jsonl
financial_observation_source_link.jsonl
financial_observation_reconciliation.jsonl
selector_evidence_location.jsonl
```

## 4. Boundary Check — PASS

```text
Batch 0–3:     read-only
V002:           no merge / no mutation
Event SoT:      unchanged
Gemini:         not used as input
Source:         official TDnet snapshots only
Output:         additive Batch 4 namespace only

Acceptance:     not authorized
Commit:         not authorized
Analysis / Ranking / Trading / PFOS / Decision: not authorized
```

## 5. Acceptance

```text
NOT REACHED
```

## 6. Final Status

```text
Extraction:  COMPLETED
Observation: COMPLETED
Fact:        COMPLETED
```

## Verification

```text
python scripts/stock_swing/run_financial_fact_batch4.py
  → PASS; idempotent=true

python -m unittest tests/test_stock_swing_financial_fact_batch4_execution.py
  → PASS (1 test)
```

No Acceptance or Commit is authorized by this execution.
