# Financial Fact Fan-out Batch 3 — Selector Validation Result Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH3-SELECTOR-VALIDATION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen Batch 3 only  
**Stage:** Selector Validation Result Review — no Observation / Fact extraction  
**Verdict:** **HOLD — MODIFY factors before Architect PASS**

## 1. Overall status

```text
Scope:                         FROZEN
Scope SHA-256:                 1e4899d22e0c89242438d2cc868cd794b134d97a744cdffef3f80f9dee6a0793
Baseline:                      PASS
PDF / hash:                    PASS

7011 Selector:
  implementation:              PASS (mechanical)
  positive validation:         PASS (mechanical)
  negative validation:         PASS (catalog present)

8035 H1 Selector:
  implementation:              PASS (mechanical)
  positive validation:         PASS (mechanical)
  negative validation:         PASS (catalog present; substance gaps noted)

8035 FY revision Selector:
  implementation:              PASS (mechanical)
  positive validation:         PASS (mechanical)
  negative validation:         PASS (catalog present; substance gaps noted)

Cursor Review:                 RECORDED
Architect Validation PASS:     NOT GRANTED
Observation:                   NOT GENERATED
Financial Fact:                NOT GENERATED
Execution:                     NOT AUTHORIZED
Commit:                        NOT AUTHORIZED
```

Mechanical validator output recorded `overall: PASS` for binding + named
negative cases. Independent Cursor review withholds Architect-level PASS.
This review does **not** promote mechanical PASS into Fact Extraction authority.

## 2. Frozen scope

```text
Scope file:
  data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch3_scope.json
Scope key rule:
  candidate_document_id = doc-*
financial-document-*:
  citation only; auto_equate = false
Documents:
  2
Selectors / Fact axes:
  3
```

| Selector | Document | Page | Value |
|---|---|---|---|
| `batch3-7011-actual-revenue-q1` | `doc-d17dcc…` | 1 | `1,194,203` 百万円 |
| `batch3-8035-actual-revenue-h1` | `doc-bfbd66…` | 5 | `1,121,626` 百万円 |
| `batch3-8035-revised-revenue-fy` | same as H1 | 5 | `2,400,000` 百万円 |

`table_end_used = false` for all three mechanical results.

## 3. Baseline and PDF

Inherited Batch 1 / Batch 2 baseline gates passed:

```text
Batch 1 scope SHA
Batch 2 scope SHA
Gemini ledger SHA
Event count = 345
canonical / V002 Facts = 64
Batch 0 Observations = 11
```

Existing local official snapshots matched frozen content hashes. No PDF
re-fetch or replacement was performed.

## 4. Cursor independent review

Source: [Review Batch 3 selector validation](fb814b67-e1c6-4025-9304-d80fa09e6709)

| # | Check | Cursor finding |
|---|---|---|
| 1 | Batch 1/2 pattern conformity | Partial — 7011 strong; 8035 additive mid-doc extension |
| 2 | New selector logic | Yes for 8035 only (mid-doc revision/actual labels) |
| 3 | 7011 risk | Low–medium |
| 4 | 8035 H1 risk | High — section/window/page provenance |
| 5 | 8035 FY revision risk | High — taxonomy + co-page isolation |
| 6 | original / revision uniqueness | Token-level OK; process incomplete |
| 7 | table_end dependency | Declared false; enforcement weaker than Batch 2 |
| 8 | fail-closed | Catalog present; some synthetic / missing design negatives |
| 9 | provenance | Mostly sound; ACCEPT artifact and page convention missing |
| 10 | regression risk | Low while execution remains forbidden |
| 11 | Overlooked issues | `revised_forecast` vs V002 `company_forecast`; blank-cover not tested |
| 12 | Allow Architect PASS? | **No** — HOLD–MODIFY |

Cursor opinion is recorded as reference. It does not auto-rewrite mechanical
PASS/FAIL bits, but it blocks treating this run as Architect-approved
validation for Fact Extraction.

## 5. MODIFY factors (stop conditions)

These must be decided or hardened before Architect Validation PASS:

1. **Taxonomy:** Batch 3 freezes 8035 FY axis as `revised_forecast`, while V002
   stores the same Document’s FY revenue as `company_forecast`. Human must
   choose additive taxonomy policy before Extraction.
2. **8035 page convention:** PdfReader page index `5` is used; proposal text
   previously discussed footer/page-4 wording. Record the convention in Freeze
   acceptance.
3. **8035 section uniqueness:** H1 and FY axes share mid-doc revision page;
   strengthen isolation beyond windowed regex alone.
4. **Fail-closed substance:** add real (non-synthetic) negatives for blank
   cover, 億円 narrative bind, `増減額(B-A)`, and stronger table-end policy.
5. **Acceptance artifact:** create Batch 3 Scope Acceptance / Freeze record if
   Human accepts the frozen JSON + SHA after addressing the above.

## 6. What remains authorized / unauthorized

Authorized completed work:

```text
Scope Freeze JSON + SHA
Baseline inspection
PDF hash verification
Selector design / implementation
Mechanical positive / negative validation
Cursor review recording
```

Unauthorized / not done:

```text
Architect Validation PASS
Observation generation
Financial Fact generation
Gemini reconciliation
Execution Review
Acceptance of Batch 3 Facts
Commit
```

## 7. Stop state

```text
Batch 3 Scope
FROZEN
        ↓
7011 / 8035 H1 / 8035 FY revision
mechanical selector validation recorded
        ↓
Cursor Review
HOLD — MODIFY
        ↓
HUMAN ARCHITECT
VALIDATION RESULT REVIEW
```

**Do not proceed to Observation / Financial Fact Extraction until Human
Architect resolves the MODIFY factors and grants Validation Result approval.**
