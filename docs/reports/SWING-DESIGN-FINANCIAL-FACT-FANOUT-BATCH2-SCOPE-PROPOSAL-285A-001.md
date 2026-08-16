# Financial Fact Fan-out Batch 2 — Scope Proposal (285A only)

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-PROPOSAL-285A-001`  
**Date:** 2026-08-16  
**Stage:** Scope Candidate concretization (①+)  
**Status:** **Human Architect review required — scope not frozen**  
**Verdict:** **MODIFY — proposal ready for adopt / revise / reject**

## 1. Boundary

This record is the **Batch 2 scope案** for issuer **285A** only.

It does **not**:

- freeze Batch 2 scope;
- compute or record a scope SHA-256;
- acquire, replace, or re-fetch any PDF;
- implement or validate selectors;
- generate Observation / Financial Fact / reconciliation rows;
- mutate Batch 0 / Batch 1 / the preexisting 64 canonical Facts;
- authorize Batch 2 execution; or
- commit.

Authority chain:

```text
Batch 1 Accepted / Frozen
  → Batch 2 Design Review (MODIFY)
  → Scope Candidates list
  → 285A adopted as 採用候補 (this proposal)
  → Human Architect adopt / revise / reject
  → (only if adopted) Scope Freeze + SHA
```

References:

- `docs/reports/SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH1-001.md`
- `docs/reports/SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-001.md`
- `docs/reports/SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-CANDIDATES-001.md`

## 2. Proposal tree (Human review target)

```text
285A
 ├─ Event
 │   └─ official-event-4bda3f4c595f5ba8b34646aada3f7681
 │       └─ Document (TDnet index)
 │           └─ doc-f770b766ffff525fb1d4ac3879967278
 │       └─ Document (hash-backed Fact inventory)
 │           └─ financial-document-5093eae6342a5d06b7a39bd8961dad3f
 │
 ├─ local official snapshot
 │   └─ present (immutable; reference only)
 │
 ├─ candidate selector
 │   ├─ IFRS Q1 actual revenue (page 1) — proposed
 │   ├─ IFRS Q2 cumulative company-forecast revenue (page 2) — proposed
 │   └─ page-8 億円 / Non-GAAP outlook — negative-test only
 │
 ├─ candidate Fact
 │   ├─ actual revenue (Q1 cumulative)
 │   └─ company_forecast revenue (Q2 cumulative)
 │
 ├─ actual / forecast
 │   └─ separated by page, section, period, measure_kind
 │
 ├─ accounting basis
 │   └─ IFRS consolidated for Fact candidates; Non-GAAP excluded
 │
 ├─ period
 │   ├─ actual: Q1_cumulative / period end 2026-06-30
 │   └─ forecast: Q2_cumulative / period end 2026-09-30
 │
 ├─ unit
 │   └─ Fact candidates: 百万円 only (no 億円 normalization)
 │
 ├─ negative-test value
 │   └─ high (IFRS/Non-GAAP, 百万円/億円, actual/forecast, page/row)
 │
 └─ Gemini comparison
     └─ possible vs raw rows 66/67; conflict = none (rounding/unit wording only)
```

## 3. Proposed membership (single Event / Document)

Only one Event/Document is proposed for initial Batch 2 membership.

| Item | Proposed value | Evidence |
|---|---|---|
| issuer / security_id | `285A` (Kioxia Holdings) | Event SoT + Inventory |
| Event ID | `official-event-4bda3f4c595f5ba8b34646aada3f7681` | `official_earnings_event.jsonl` |
| announcement date | `2026-07-31` (date_only) | Event SoT |
| Event period_basis | `Q1_cumulative` | Event SoT |
| Event fiscal_period_end | `2026-06-30` | Event SoT |
| Event fiscal_year_label | `2027-03` | Event SoT |
| Event accounting / consolidation | IFRS / consolidated | Event SoT |
| TDnet index Document ID | `doc-f770b766ffff525fb1d4ac3879967278` | `earnings_event_document.jsonl` |
| Fact inventory Document ID | `financial-document-5093eae6342a5d06b7a39bd8961dad3f` | `financial_document_inventory.jsonl` |
| document date | `2026-07-31` | Inventory `publication_date` |
| document type | `earnings_release` | Inventory + Event document title |
| document title | `2027年3月期第1四半期決算短信〔IFRS〕(連結)` | Event document SoT |
| official source | JPX TDnet PDF | URL below |
| official URL | `https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf` | Inventory / Event document |
| local snapshot | **Yes** (existing; do not re-fetch) | Inventory path below |
| snapshot path | `data/stock/stock_swing/facts_phase_a/raw_external/financial_fact_sample_sources/f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3.pdf` | Inventory |
| content hash (existing inventory) | `f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3` | Inventory `content_hash` |
| extracted-text hash (existing sample) | `e88e9707a8709bd9f9db9c1bc04b732bf94e3ad863e9e0f45e63e76e4410d8ed` | `financial_observation_source_sample.jsonl` |
| inventory_scope today | `pilot_v002_only` | Inventory |
| proposed document_role | `primary_result` | proposal only (not written to Inventory) |
| proposed observation_policy | `eligible` | proposal only |
| proposed issuer key | `kioxia_holdings` | proposal only |

### Identity hygiene (must resolve at Freeze, not now)

```text
TDnet index Document ID:     doc-f770b766ffff525fb1d4ac3879967278
Fact inventory Document ID:  financial-document-5093eae6342a5d06b7a39bd8961dad3f
```

Both point to the same official TDnet URL and the same local snapshot hash.
Freeze must declare which ID is the Batch 2 scope member key and how the
other ID is cited. Silent dual-SoT merge is forbidden.

### Draft freeze shape (not a frozen file)

If Human Architect later adopts this proposal, the future scope file would
contain **one** document entry of this form (illustrative only):

```text
batch_id: financial-fact-fanout-batch2-001
event_ids: [official-event-4bda3f4c595f5ba8b34646aada3f7681]
documents:
  - security_id: 285A
    event_id: official-event-4bda3f4c595f5ba8b34646aada3f7681
    candidate_document_id: <freeze-time choice: doc-* or financial-document-*>
    url: https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf
    document_type: earnings_release
    document_role: primary_result
    observation_policy: eligible
    issuer: kioxia_holdings
    local_snapshot_ref: f78ce549… (existing; no re-fetch)
```

No such file is created by this proposal.

## 4. Explicit exclusions (this proposal)

Not proposed for Batch 2 membership:

| Item | Reason |
|---|---|
| Other six 285A Events | No hash-backed Document/Source in current Fact inventory |
| Secondary IRBANK mirrors for this Event | Not official primary SoT |
| Batch 0 Documents / regression paths | Boundary: regression only |
| Batch 1 frozen Documents / selectors / Facts | Boundary: Accepted / Frozen |
| 4062 Q3 review path | Out of this request |
| 8035 Q1 / H1 hold candidates | Out of this request |
| 7011 Q1 hold candidate | Out of this request |
| Any other Universe issuer | Out of this request |
| Page-8 `億円` / Non-GAAP outlook figures | Ambiguity boundary; negative-test only |

## 5. Candidate Facts (proposed)

Proposed numeric Fact candidates are limited to **IFRS** rows whose page,
section, period, metric, and unit are already evidenced by the existing
official snapshot and confirmed Observation source links.

### 5.1 Actual — Q1 cumulative (page 1)

| Field | Proposed |
|---|---|
| measure_kind | `actual` |
| period_basis | `Q1_cumulative` |
| fiscal_period_end | `2026-06-30` |
| fiscal_year_label | `2027-03` |
| accounting_standard | `IFRS` |
| consolidation | `consolidated` |
| unit | `JPY_million` (`百万円`) |
| primary metric for Batch 2 selector | `revenue` / raw `売上収益` |
| evidence page | 1 |
| evidence table (existing link) | `cover_result_or_explicit_forecast_table` |
| evidence text (existing link) | `1,767,117 百万円` |

Additional IFRS actual metrics exist on the same page in the preexisting
canonical baseline (operating_profit / pretax_profit / net_income / EPS).
This proposal does **not** expand the Batch 2 selector budget to those
metrics unless Human Architect explicitly widens membership at Freeze.

### 5.2 Company forecast — Q2 cumulative (page 2)

| Field | Proposed |
|---|---|
| measure_kind | `company_forecast` |
| period_basis | `Q2_cumulative` |
| fiscal_period_end | `2026-09-30` |
| fiscal_year_label | `2027-03` |
| accounting_standard | `IFRS` |
| consolidation | `consolidated` |
| unit | `JPY_million` (`百万円`) |
| primary metric for Batch 2 selector | `revenue` / raw `第2四半期（累計）売上収益` |
| evidence page | 2 |
| evidence table (existing link) | `cover_result_or_explicit_forecast_table` |
| evidence text (existing link) | `4,157,117 百万円` |

Additional IFRS Q2 forecast metrics exist in the preexisting baseline.
Same selector-budget rule as §5.1: revenue-first unless Human widens.

### 5.3 Not Fact candidates

| Surface | Why excluded from Fact membership |
|---|---|
| Page-8 outlook with `億円` | Different unit; no inferred conversion from `百万円` |
| Any Non-GAAP column / label | Not IFRS canonical Fact without separate taxonomy Authorization |
| Forecast used as actual (or reverse) | measure_kind / page / section mismatch → fail-closed |
| Gemini ledger values | Discovery / comparison only; never Fact SoT |

## 6. Candidate selectors (design only — not implemented)

Reuse Batch 1 evidence-location models. No fixture file is written now.

### 6.1 Proposed: IFRS Q1 actual revenue

```text
location_model:     single_page  (or page_table_row if Freeze requires row lock)
pages:              [1]
section markers:    連結経営成績(累計)  (+ IFRS / 連結 markers)
metric markers:     売上収益
period markers:     2027年3月期第1四半期  / period end 2026-06-30 evidence
unit markers:       百万円
exclude markers:    Non-GAAP, 億円, 予想, 第2四半期
measure_kind:       actual
```

### 6.2 Proposed: IFRS Q2 cumulative company-forecast revenue

```text
location_model:     page_table_row
pages:              [2]
section markers:    3.2027年3月期の連結業績予想  (or proven equivalent)
row markers:        第2四半期(累計)
metric markers:     売上収益
period markers:     2026年4月1日~2026年9月30日 / Q2_cumulative
unit markers:       百万円
exclude markers:    Non-GAAP, 億円, 第1四半期実績, page-8 outlook
measure_kind:       company_forecast
```

### 6.3 Required negative selector surfaces (fixtures later)

| Fail-closed case | How 285A supplies it |
|---|---|
| actual / forecast ambiguity | page-1 actual vs page-2 forecast |
| IFRS / Non-GAAP ambiguity | Non-GAAP co-presentation in the same PDF |
| unit mismatch | page-2 `百万円` vs page-8 `億円` |
| period mismatch | Q1 actual vs Q2 cumulative forecast vs page-8 outlook |
| wrong page / section / table / row | multiple similar revenue figures |
| multiple match / missing evidence / missing label | force conjunctive markers; no first-match |
| hash mismatch / scope mismatch | freeze-time snapshot + scope membership checks |

## 7. Boundary conditions (must remain true)

### Actual / Forecast

- Page-1 IFRS Q1 cumulative figures are `actual` only.
- Page-2 IFRS Q2 cumulative figures are `company_forecast` only.
- A selector that can bind either figure without distinct period +
  measure_kind markers is invalid.

### IFRS / Non-GAAP

- Canonical Fact candidates are **IFRS only**.
- Non-GAAP values may appear in the same Document for negative testing.
- Non-GAAP must not enter the IFRS Fact path without a separate taxonomy
  Authorization outside this proposal.

### Unit

- Fact candidates use source-proved `百万円` only.
- `億円` surfaces are fail-closed negatives.
- No unit normalization / scale conversion is permitted.

### Period

- Actual period end: `2026-06-30` (`Q1_cumulative`).
- Forecast period end: `2026-09-30` (`Q2_cumulative`).
- If period cannot be proved from the selected evidence location, emit no
  Fact.

### Page / Section / Table / Row

- Candidate selectors must bind a unique evidence location under the Batch 1
  conjunctive model.
- First-match, alternate-table substitution, and ordered-regex-only
  shortcuts remain forbidden.

## 8. Relation to preexisting V002 / 64-Fact baseline

The same Event/Document already has confirmed canonical Observations
(part of the immutable 64-Fact baseline), including the IFRS Q1 actual and
Q2 forecast revenues cited above. Inventory remains `pilot_v002_only`.

Therefore this proposal carries a **mandatory Freeze policy choice**:

| Option | Meaning | Allowed later execution effect |
|---|---|---|
| A. Coverage-reference | 285A fan-out path is satisfied by citing the existing official snapshot + V002 Facts | No new numeric Facts; Batch 2 may still freeze membership for coverage accounting / negatives |
| B. Additive namespace verification | Later Batch 2 execution writes only under an additive Batch 2 namespace | Never mutate / overwrite / auto-merge the 64 Facts; digests must prove non-interference |
| C. Reject / defer | Do not freeze 285A into Batch 2 now | Document terminal reason |

**This proposal recommends Option B as the default Freeze posture**, because:

1. Batch 2’s parent objective still needs an explicit fan-out membership for
   the sole uncovered issuer path; and
2. Batch 2 design already forbids mutating the preexisting 64 Facts.

Option B still requires Human Architect explicit approval at Freeze. This
proposal does not execute Option B.

## 9. Gemini comparison (independent; not Fact SoT)

```text
official Fact  vs  Gemini raw ledger
```

Contemporaneous Gemini raw rows for the same announcement date exist
(`raw_row_id` 66 = Q1 actual narrative; 67 = Q2 revision/forecast narrative).
They use `億円`-style wording against the official `百万円` table.

| Question | Proposal finding |
|---|---|
| Comparable later? | Yes, as independent reconciliation only |
| Gemini → Fact path? | **Forbidden** |
| Rounding / unit wording difference? | Present as investigation signal only |
| Source-proved numeric conflict? | **No** — record as **conflictなし** |
| Correct future status until proved otherwise | `official_only` / `unresolved` / investigate — never manufactured `conflict` |

## 10. Fail-closed contract (scope案 binding)

Any later Batch 2 selector/execution for this membership must emit **no**
numeric Financial Fact when any of the following occurs:

- multiple match
- missing evidence
- missing label
- unit mismatch
- period mismatch
- wrong page
- wrong section
- wrong table
- wrong row
- hash mismatch
- scope mismatch
- actual / forecast ambiguity
- IFRS / Non-GAAP ambiguity

## 11. Scope rationale

Include 285A in the Batch 2 **proposal** because:

1. It is the sole issuer without a Batch 0/1 **fan-out Accepted path** in the
   fixed 14-issuer Universe (13/14 after Accepted Batch 1).
2. An official TDnet Document and immutable local snapshot already exist.
3. One Document proves both IFRS actual and IFRS company-forecast candidates
   with separable page/period/unit evidence.
4. The same Document supplies high-value negative tests (Non-GAAP, `億円`,
   actual/forecast proximity) without importing Batch 0/1 materials.
5. Gemini comparison can be planned independently without promoting Gemini
   values.

## 12. Human Architect decision checklist

1. **Adopt / Revise / Reject** this 285A scope案.
2. If Adopt: choose Freeze policy **A / B / C** (§8).
3. If Adopt: choose scope Document ID key (`doc-*` vs `financial-document-*`).
4. If Adopt: confirm revenue-only selector budget, or widen metrics.
5. If Adopt: confirm page-8 Non-GAAP / `億円` remains negative-test only.
6. Confirm Gemini finding remains **conflictなし** unless a later authorized
   preflight proves otherwise.
7. Only after Adopt: authorize Scope Freeze + SHA (separate step).

## 13. Stop state

```text
Scope proposal (285A): created
Scope frozen:          no
Scope SHA:             not created
PDF acquisition:       0 (existing snapshot referenced only)
Selector implementation: 0
Selector validation:   0
Fact generation:       0
Reconciliation run:    0
Commit:                0
```

```text
Scope Candidate (concretized)
        ↓
Human Architect Review
        ↓
採用 / 修正 / 却下
        ↓
Scope Freeze
        ↓
SHA確定
```

**Current position:** Scope Candidate concretized for 285A.  
**Not present:** formal scope freeze, SHA, or execution authorization.
