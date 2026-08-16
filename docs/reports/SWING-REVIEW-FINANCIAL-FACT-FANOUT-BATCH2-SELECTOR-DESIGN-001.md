# Financial Fact Fan-out Batch 2 — Selector Design / Validation Review (285A)

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-DESIGN-001`  
**Date:** 2026-08-16  
**Stage:** Selector Design / Validation Review only  
**Status:** **Human Architect review required — implementation not authorized**  
**Verdict:** **READY FOR APPROVE / MODIFY / REJECT**

## 1. Boundary

This record designs selectors and the validation plan for the **frozen** Batch 2
scope. It does **not**:

- implement selector code or fixtures in the repository;
- run selector validation against the PDF;
- generate Observation / Financial Fact / reconciliation rows;
- re-acquire or replace the PDF;
- change the frozen scope or its SHA-256;
- mutate Batch 0 / Batch 1 / V002 Facts / Gemini ledger; or
- authorize Execution / Commit.

```text
Selector Design
        ↓
Validation Review (this document)
        ↓
APPROVE / MODIFY / REJECT
        ↓
Selector Implementation Authorization
        ↓
(only then) validation execution
```

**Execution and Financial Fact generation remain unauthorized.**

## 2. Frozen scope integrity (unchanged)

```text
Scope file:
  data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_scope.json
Scope key:
  doc-f770b766ffff525fb1d4ac3879967278
Verified SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
```

SHA was re-read mechanically from the frozen file bytes for this review and
matches the Freeze record. Scope contents were not modified.

```text
285A
 ├─ Selector A — IFRS revenue / Q1 actual / JPY_million / page 1
 └─ Selector B — IFRS revenue / Q2 cumulative forecast / JPY_million / page 2
```

Related citation only (not scope key):

```text
financial-document-5093eae6342a5d06b7a39bd8961dad3f
```

Existing local snapshot (reference only; no re-fetch):

```text
…/financial_fact_sample_sources/f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3.pdf
content_hash = f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

## 3. Inherited Batch 1 selector principles

Reuse the Accepted Batch 1 evidence-location contract
(`SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXTRACTION-SELECTOR-003`):

1. A selector proves **unique evidence** that a value is the Fact evidence —
   it does not “search for a number.”
2. Location models: `single_page` | `page_table_row` |
   `multi_page_same_table` | `section_range`.
3. Matching is **conjunctive** after whitespace collapse; all declared
   markers must be present.
4. Zero matches, multiple matches, and expected-page mismatch **fail closed**.
5. First-match fallback, alternate-table substitution, and ordered
   `section.*row` shortcuts remain forbidden.
6. Gemini is never a numeric selector input.

Required identifiable dimensions for every Batch 2 selector:

```text
Document · page · section · table · row · label
period · actual/forecast · accounting basis · unit · target value
```

## 4. Selector tree

```text
285A  (doc-f770b766ffff525fb1d4ac3879967278)
 ├─ Selector A
 │   └─ IFRS revenue / Q1 actual / JPY_million
 │
 ├─ Selector B
 │   └─ IFRS revenue / Q2 cumulative company forecast / JPY_million
 │
 ├─ Positive validation  (plan; not executed)
 │
 ├─ Negative validation  (plan; not executed)
 │
 ├─ Non-GAAP boundary
 │
 ├─ Unit boundary
 │
 ├─ Period boundary
 │
 └─ Provenance path
```

## 5. Selector A — Q1 IFRS actual revenue

| Field | Design |
|---|---|
| selector ID | `batch2-285A-actual-revenue-q1` |
| fixture name (Batch 1 style) | `actual_revenue` |
| target | `actual` |
| document | `doc-f770b766ffff525fb1d4ac3879967278` |
| issuer | `kioxia_holdings` |
| location_model | `single_page` |
| expected_pages | `[1]` |
| section | `連結経営成績` (with cumulative/実績 context locked by period markers) |
| table / label | `売上収益` |
| row | `2027年3月期第1四半期` (or equivalent Q1 cumulative row marker proved on page 1) |
| period | `第1四半期` / `Q1_cumulative` / fiscal_period_end `2026-06-30` |
| measure_kind | `actual` |
| accounting_basis | `IFRS` (`〔IFRS〕` / title IFRS evidence) |
| consolidation | `連結` |
| unit | `百万円` → `JPY_million` |
| expected match | **1** |
| numeric_fact_allowed | `true` |

### Conjunctive markers (design)

```text
required (all):
  section ≈ 連結経営成績
  table/label = 売上収益
  period markers include 第1四半期 (and/or 2027年3月期第1四半期)
  unit = 百万円
  accounting_basis = IFRS
  page = 1

exclude / fail if selected with:
  Non-GAAP
  予想 / 業績予想 (as the binding evidence for this selector)
  第2四半期(累計)
  通期
  億円
```

### Must not bind

- Non-GAAP revenue
- any forecast value (page 2 or elsewhere)
- Q2 / FY / other period rows
- wrong row / similar labels
- `億円` surfaces

### Design note vs Batch 1 IFRS actuals

Closest Accepted Batch 1 pattern: `kawasaki_heavy` / `kokusai_electric`
`actual_revenue` on `連結経営成績` + `売上収益` + `第1四半期` + `百万円`,
with explicit `accounting_basis=IFRS` for 285A because Non-GAAP coexists in
the same Document.

### Validation result (this stage)

```text
NOT RUN — pending Selector Implementation Authorization
```

## 6. Selector B — Q2 cumulative IFRS company-forecast revenue

| Field | Design |
|---|---|
| selector ID | `batch2-285A-forecast-revenue-q2-cumulative` |
| fixture name (Batch 1 style) | `interim_forecast` |
| target | `company_forecast` |
| document | `doc-f770b766ffff525fb1d4ac3879967278` |
| issuer | `kioxia_holdings` |
| location_model | `page_table_row` |
| expected_pages | `[2]` |
| section | `2027年3月期の連結業績予想` (Batch 1-style forecast section; exact PDF wording must remain conjunctive-unique at implementation) |
| table / label | `売上収益` |
| row | `第2四半期(累計)` |
| period | `Q2_cumulative` / fiscal_period_end `2026-09-30` / range evidence `2026年4月1日`–`2026年9月30日` when present |
| measure_kind | `company_forecast` |
| accounting_basis | `IFRS` |
| consolidation | `連結` |
| unit | `百万円` → `JPY_million` |
| expected match | **1** |
| numeric_fact_allowed | `true` |

### Conjunctive markers (design)

```text
required (all):
  section ≈ 2027年3月期の連結業績予想
  table/label = 売上収益
  row = 第2四半期(累計)
  unit = 百万円
  accounting_basis = IFRS
  page = 2

exclude / fail if selected with:
  第1四半期実績 / page-1 actual binding only
  通期 (annual forecast row)
  Non-GAAP
  億円
  page-8 outlook tables
```

### Must not bind

- Q1 actual
- annual (`通期`) forecast
- Non-GAAP
- other periods / rows
- `億円` notation
- similar labels without the Q2 cumulative row lock

### Design note vs Batch 1 forecasts

Closest Accepted Batch 1 pattern: `disco` `interim_forecast`
(`page_table_row` + `第2四半期(累計)`), combined with IFRS metric naming from
`kawasaki_heavy` (`売上収益`). Do **not** reuse a `通期`-only fixture for
this membership.

### Validation result (this stage)

```text
NOT RUN — pending Selector Implementation Authorization
```

## 7. Positive validation plan

When implementation is later authorized, each selector must prove:

| Check | Selector A | Selector B |
|---|---|---|
| unique location match count | 1 | 1 |
| page | 1 | 2 |
| label / table | `売上収益` | `売上収益` |
| period | Q1 actual / `2026-06-30` | Q2 cumulative / `2026-09-30` |
| unit | `百万円` | `百万円` |
| accounting basis | IFRS | IFRS |
| measure_kind | `actual` | `company_forecast` |
| target row | Q1 row | `第2四半期(累計)` |
| scope key | `doc-f770b766…` | same |
| content hash | `f78ce549…` | same |

Positive validation must use the **existing** local official snapshot only.
Re-fetch is forbidden by frozen scope.

## 8. Negative validation plan (fail-closed)

Any of the following must **FAIL** the selector and must emit **no** numeric
Financial Fact:

| Negative case | How exercised for 285A |
|---|---|
| multiple match | Drop a distinguishing marker so page-1 and page-2 both match |
| missing evidence | Remove required section/table evidence |
| missing label | Omit `売上収益` |
| unit mismatch | Bind `億円` instead of `百万円` |
| period mismatch | Bind Q2 markers into Selector A, or Q1/`通期` into Selector B |
| wrong page | Force expected_pages to the other page |
| wrong section | Point actual at forecast section (or reverse) |
| wrong table | Bind a non-revenue metric table |
| wrong row | Bind adjacent forecast/actual row |
| actual / forecast ambiguity | Marker set satisfied by both measure kinds |
| IFRS / Non-GAAP ambiguity | Marker set that also admits Non-GAAP revenue |
| scope mismatch | Wrong `candidate_document_id` / Event |
| hash mismatch | Wrong digest vs frozen `existing_content_hash` |

Negative fixtures are synthetic relative to the frozen Document. Real PDF
bytes, Batch 1 artifacts, and V002 Facts must not be mutated.

## 9. Non-GAAP boundary

```text
Canonical Fact target: IFRS revenue only
Non-GAAP revenue / adjustments: negative-test evidence only
```

- Non-GAAP may appear in the same PDF.
- Selectors A/B must require IFRS markers and must fail closed if the only
  unique match depends on Non-GAAP labeling.
- No Non-GAAP → IFRS conversion.

## 10. Unit boundary

```text
Canonical unit: JPY_million (百万円)
億円: out of selector target
```

Forbidden:

- automatic conversion
- inferred conversion
- implicit unit completion from display conventions

If selector evidence does not uniquely prove `百万円` on the target row,
validation FAILS.

## 11. Period boundary

```text
Selector A: Q1 actual only
Selector B: Q2 cumulative company forecast only
```

Period is never inferred. If Q1 / Q2 cumulative / FY candidates are not
uniquely separated by conjunctive markers, validation FAILS.

## 12. Provenance path (must remain implementable)

```text
Event
  official-event-4bda3f4c595f5ba8b34646aada3f7681
        ↓
Document (Batch 2 scope key)
  doc-f770b766ffff525fb1d4ac3879967278
        ↓
local official PDF (existing snapshot; no re-fetch)
  f78ce549…pdf
        ↓
content hash
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
        ↓
selector evidence (A or B)
        ↓
Observation  (additive Batch 2 namespace only; later gate)
        ↓
Financial Fact (additive Batch 2 namespace only; later gate)
```

Citation-only (unchanged by selectors):

```text
financial-document-5093eae6342a5d06b7a39bd8961dad3f
```

## 13. V002 relationship

Existing V002 / 64-Fact baseline Observations for the related
`financial-document-*` citation remain immutable.

Later Batch 2 outputs, if ever authorized, are **additive namespace
verification** only:

- no replace
- no merge
- no mutate of existing Facts

Agreement or difference versus V002 may be reviewed later without changing
V002.

## 14. Gemini relationship

Gemini raw ledger is **not** a selector input.

Any later comparison remains independent:

```text
official selector evidence
        ↓
official Financial Fact
        vs
Gemini raw ledger
```

No manufactured conflict. Rounding / unit-wording differences alone are not
`conflict`.

## 15. Selector review table (summary)

| Item | Selector A | Selector B |
|---|---|---|
| selector ID | `batch2-285A-actual-revenue-q1` | `batch2-285A-forecast-revenue-q2-cumulative` |
| target | actual | company_forecast |
| document | `doc-f770b766…` | `doc-f770b766…` |
| page | 1 | 2 |
| section | `連結経営成績` | `2027年3月期の連結業績予想` |
| table | `売上収益` | `売上収益` |
| row | Q1 / `2027年3月期第1四半期` | `第2四半期(累計)` |
| label | `売上収益` | `売上収益` |
| period | Q1_cumulative / `2026-06-30` | Q2_cumulative / `2026-09-30` |
| accounting basis | IFRS | IFRS |
| unit | JPY_million | JPY_million |
| expected match | 1 | 1 |
| negative cases | §8 | §8 |
| validation result | NOT RUN | NOT RUN |

## 16. Human Architect decision requested

1. **APPROVE** this Selector Design / Validation plan as-is; or
2. **MODIFY** marker wording / location_model / row locks; or
3. **REJECT** and return to design.

Only after **APPROVE** may a separate Authorization allow selector
implementation and validation execution against the existing snapshot.

## 17. Stop state

```text
Frozen scope:                 unchanged
Scope SHA-256:                unchanged
Selector design:              recorded
Validation plan:              recorded
Selector implementation:      0
Selector validation run:      0
Observation / Fact:           0
PDF acquisition:              0
Reconciliation:               0
Execution:                    NOT AUTHORIZED
Commit:                       0
```

```text
285A
 ├─ Selector A  (designed; not implemented)
 ├─ Selector B  (designed; not implemented)
 ├─ Positive validation  (planned)
 ├─ Negative validation  (planned)
 ├─ Non-GAAP boundary    (fixed)
 ├─ Unit boundary        (fixed)
 ├─ Period boundary      (fixed)
 └─ Provenance path      (fixed)
```
