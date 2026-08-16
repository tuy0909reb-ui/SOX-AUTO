# Financial Fact Fan-out Batch 2 — Selector Binding Modify Review (285A)

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-MODIFY-001`  
**Date:** 2026-08-16  
**Stage:** Modify Review only — no revalidation, no Fact generation  
**Prerequisite FAIL:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-VALIDATION-001`  
**Human Architect decision input:** **MODIFY** (do not defer / reject Batch 2)  
**Verdict:** **READY FOR APPROVE / MODIFY / REJECT of this binding design**

## 1. Boundary

This record proposes a **selector numeric-binding Modify** for frozen 285A
Batch 2. It does **not**:

- change Batch 2 scope / SHA / Event / Document identity;
- re-fetch or replace the PDF;
- auto-fix or re-run the failed selector;
- generate Observation / Financial Fact;
- run Gemini reconciliation;
- mutate Batch 0 / Batch 1 / V002 Facts; or
- commit.

```text
Selector A FAIL
      ↓
Modify Design (this document)
      ↓
Cursor independent review (embedded)
      ↓
Human Architect Review
      ↓
APPROVE / MODIFY / REJECT
      ↓
(only if APPROVE) selector binding implementation + revalidation
```

## 2. Frozen state (unchanged)

```text
Scope file:
  data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch2_scope.json
Scope key:
  doc-f770b766ffff525fb1d4ac3879967278
Scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
PDF hash:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
```

```text
Selector A: FAIL
Selector B: NOT RUN
Observation / Fact: NOT GENERATED
Execution / Commit: NOT AUTHORIZED
```

## 3. Current failure

Selector A (`batch2-285A-actual-revenue-q1`) located page 1 structurally, then
failed at numeric binding:

```text
Expected:  1,767,117
Observed:  1,767,117415
Result:    missing or ambiguous target value → FAIL
```

Validation correctly refused to accept the collapsed token as the IFRS
revenue amount. No auto-retry was performed.

## 4. Root cause

### 4.1 What the official PDF actually exposes

On the existing local snapshot, `pypdf` page-1 extraction with **NFKC only**
(whitespace preserved) already yields a space-delimited Q1 row:

```text
2027年3月期第1四半期 1,767,117 415.5 1,326,216 - 1,270,017 - 1,291,491 - 1,234,720 -
```

Token split:

```text
[row] 2027年3月期第1四半期
[1]   1,767,117      ← IFRS 売上収益 amount (百万円)
[2]   415.5          ← 増減率 (% column)
[3]   1,326,216      ← Non-GAAP-side amount family continues...
```

Header context on the same page:

```text
売上収益 Non-GAAP
...
百万円 ％ 百万円 ％ ...
```

So the PDF extract **already preserves column delimiters as whitespace**.
The failure is not “PDF has no columns.”

### 4.2 What the Batch 2 validator did wrong

`validate_financial_fact_batch2_selectors.py` applies full-page whitespace
collapse before numeric regex:

```text
normalized(page) = remove all whitespace
→ 2027年3月期第1四半期1,767,117415.5...
→ regex ([0-9][0-9,]*) captures 1,767,117415
```

That collapses **amount** and **%** into one false numeric candidate.

### 4.3 What Batch 1 already does

Accepted Batch 1 already separates two layers:

| Layer | Batch 1 behavior |
|---|---|
| Structural marker match | `collapse_ws` only when testing marker presence |
| Numeric row extraction | `normalized_pages` = NFKC only; whitespace kept; `exact_row` regex uses `\s+` |

Batch 2 validation accidentally applied collapse to the numeric layer.
This is a Batch 2 binding-layer defect, not a Frozen-scope defect.

## 5. Candidate binding approaches

| ID | Approach | Fits 285A? | Min change vs Batch 1? | Risk |
|---|---|---|---|---|
| C1 | Substring grab of `1,767,117` | No — forbidden; no column proof | Tiny | False positive |
| C2 | Dual-layer text: collapsed markers + whitespace-preserving numeric row | Yes | **Highest** — mirrors Batch 1 | Low if header map is required |
| C3 | Header-to-column mapping on whitespace-preserving tokens | Yes — needed for IFRS vs Non-GAAP | Additive on C2 | Medium if header parse is weak |
| C4 | PDF char / bounding-box binding via pypdf visitor | Weak on this PDF — many tokens report `x=0` | New geometry stack | High false confidence |
| C5 | External table parser (pdfplumber / camelot / tabula) | Possible | New dependency + adapter surface | High regression / ops cost |
| C6 | Rely on existing V002 Observation value | Forbidden — not selector evidence; would merge namespaces | None | Design violation |

## 6. Cursor independent review (reference only)

This section is a **Cursor technical opinion**. It is not a canonical design
decision by itself.

### 6.1 Cause of whitespace-collapse failure

Agreed with the FAIL report: collapse is useful for Japanese PDF marker
jitter, but it must not be applied to the numeric binding surface when
adjacent columns are space-separated amounts and percentages.

### 6.2 Can the current selector keep column boundaries?

As written: **No.** Full-page collapse destroys boundaries before binding.
With Batch 1’s dual-layer model: **Yes**, for this PDF, because raw/NFKC text
already separates `1,767,117` and `415.5`.

### 6.3 Minimal column-preserving change

Recommended minimum:

1. Keep conjunctive structural matching on collapsed markers (Batch 1 style).
2. Bind numbers only on **whitespace-preserving NFKC page text**.
3. Require a unique row line containing the period/row marker.
4. Map header columns (`売上収益` / `％` / `Non-GAAP` / `百万円`) to token
   positions; take the IFRS amount column only.
5. Require the adjacent `%` token as delimiter evidence for the amount cell.
6. Fail closed on any ambiguous token/header mapping.

Do **not** pass by merely finding the substring `1,767,117`.

### 6.4 PDF coordinates / bounding boxes

On this snapshot, pypdf text visitor often returns `x=0` for critical numeric
fragments while still emitting space-separated line text. Geometry-first
binding is therefore **not** the minimum-safe fix for 285A. Prefer
whitespace-preserving token + header mapping; keep bounding-box as a later
optional enhancement only if token mapping fails on future layouts and
geometry is proved reliable for that PDF.

### 6.5 Fail-closed conditions (must keep)

Fail if any of the following cannot be proved uniquely:

- page / section / table / row
- header→column map for IFRS `売上収益` amount
- distinction from Non-GAAP amount column
- distinction from `%` / 増減率 column
- unit = `百万円` (no `億円`)
- measure_kind actual vs forecast
- period Q1 vs Q2 cumulative vs 通期
- multiple numeric candidates under the same column proof
- scope / hash mismatch

No inferred width, no nearest-number, no V002 value substitution.

### 6.6 Batch 1 regression impact

If Modify stays inside Batch 2 validator / later Batch 2 extractor and does
**not** change Batch 1 scripts, fixtures, scope, or outputs: **regression
risk is near zero**.

Copying Batch 1’s dual-layer rule into Batch 2 is alignment, not a Batch 1
rewrite. Changing Batch 1 `collapse_ws` semantics globally would be
unnecessary and should be rejected for this ticket.

### 6.7 Adapter / parser impact

- No new Fact schema fields required for Modify Review.
- No Gemini input.
- No `doc-*` / `financial-document-*` identity change.
- Later implementation should remain additive under Batch 2 validation code
  (and, only after Authorization, Batch 2 extraction), not rewrite shared
  Pilot parsers unless a shared helper is extracted without behavior change
  to Batch 1.

### 6.8 Recommended approach and why

**Recommend C2 + C3:**

```text
Structural layer:  collapsed marker conjunction (Batch 1 compatible)
Numeric layer:     whitespace-preserving NFKC row tokens
Column proof:      header-to-column map → IFRS 売上収益 amount
Delimiter proof:   adjacent ％ token must remain a separate column
```

Why:

- solves the observed FAIL with evidence already present in the official PDF;
- matches Accepted Batch 1 extraction posture;
- avoids unreliable geometry on this PDF;
- avoids new parser dependencies;
- still forbids bare substring PASS.

### 6.9 Negative tests if adopted

At minimum, after later Authorization:

| Case | Expected |
|---|---|
| collapsed-only numeric binding | FAIL |
| amount+percent concatenated accepted | FAIL |
| Non-GAAP amount column selected | FAIL |
| `%` column selected as revenue | FAIL |
| 億円 unit | FAIL |
| 通期 / Q2 row bound into Selector A | FAIL |
| Q1 actual bound into Selector B | FAIL |
| multiple matching row lines | FAIL |
| header map missing / ambiguous | FAIL |
| scope / hash mismatch | FAIL |

### 6.10 Risk if Modify is not adopted

Leaving Batch 2 on collapsed numeric binding means 285A (and any similar
amount+percent TDnet tables) cannot pass without inventing values or
weakening fail-closed rules. Defer/reject would freeze coverage incomplete;
auto-substring would create false Facts.

## 7. Recommended approach (proposal for Human Architect)

### 7.1 Binding contract for Selector A

```text
Document: doc-f770b766…
Page: 1
Section: 連結経営成績（累計）
Table/metric: 売上収益
Row: 2027年3月期第1四半期
Accounting: IFRS (document title + IFRS amount column, not Non-GAAP)
Unit: 百万円
Measure: actual

Numeric binding:
  unique whitespace-preserving row line
  → header map selects IFRS 売上収益 amount column
  → token equals amount cell
  → adjacent token proves ％ column boundary
  → no Non-GAAP amount accepted
```

Evidence shape to require (not a Fact yet):

```text
売上収益
 ├─ 売上値: 1,767,117   (IFRS / 百万円)
 └─ 増減率: 415.5       (％; delimiter evidence only, not Fact)
```

### 7.2 Selector B implication (design only)

Selector B was not run. The same dual-layer rule must be applied before any
revalidation, because page-2 forecast also coexists with Non-GAAP / `%`
columns and must not be validated under collapsed text.

No Selector B implementation change is authorized by this review alone.

### 7.3 Explicit non-recommendations

- Do not PASS on substring `1,767,117` alone.
- Do not introduce pdfplumber/camelot for this Modify.
- Do not require bounding-box as the primary binder for this PDF.
- Do not change Batch 1 code/fixtures/outputs.
- Do not change Frozen scope / SHA / PDF.
- Do not use V002 Facts as binding authority.

## 8. Implementation impact (if later APPROVED)

Allowed later work surface:

```text
scripts/stock_swing/validate_financial_fact_batch2_selectors.py
tests/test_stock_swing_financial_fact_batch2_selectors.py
(+ optional shared helper only if Batch 1 behavior remains byte-identical)
```

Still forbidden until separate gates:

- Observation / Fact generation
- Execution
- Commit
- PDF re-acquisition
- scope SHA change

## 9. Batch 1 regression checklist

| Item | Impact if recommended Modify is followed |
|---|---|
| existing `doc-*` keys | None |
| Batch 1 selector evidence | None (untouched) |
| Batch 1 unit handling | None |
| Batch 1 period handling | None |
| Batch 1 actual / forecast distinction | None |
| Batch 1 provenance | None |
| Batch 1 Accepted outputs | None |

## 10. Positive validation design (post-approval)

Selector A must prove all of:

1. scope key / Event / PDF hash unchanged;
2. unique page = 1;
3. section / table / row / IFRS / 百万円 markers;
4. unique whitespace-preserving row line;
5. header→IFRS amount column map unique;
6. bound token = amount cell, not `%`, not Non-GAAP;
7. adjacent `%` token present as column boundary evidence;
8. match count = 1;
9. no Observation / Fact emitted by validation.

Selector B must use the same dual-layer contract on page 2 before PASS.

## 11. Negative validation design (post-approval)

Retain prior Batch 2 negatives, plus:

```text
collapsed_numeric_binding_forbidden
concatenated_amount_percent_rejected
non_gaap_amount_column_rejected
percent_column_rejected_as_revenue
header_column_map_ambiguous
whitespace_preserving_row_not_unique
```

All negatives remain fail-closed: no numeric Observation / Fact.

## 12. Fail-closed conditions (binding layer)

FAIL when any proof is missing:

- column boundary cannot be proved;
- multiple numeric candidates under the target column proof;
- header↔column correspondence unclear;
- IFRS / Non-GAAP correspondence unclear;
- actual / forecast correspondence unclear;
- unit / period / row / page / section / table unclear;
- any inference / nearest-match / substring-only acceptance.

## 13. Human Architect decision required

Choose one:

1. **APPROVE** recommended dual-layer + header-to-column binding (C2+C3);
2. **MODIFY** further (e.g., require geometry, or restrict to token-only
   without header map — not recommended);
3. **REJECT** this Modify and return to defer/reject Batch 2 extraction.

Only after **APPROVE** may Selector Implementation Authorization allow code
changes and revalidation.

## 14. Stop state

```text
Current failure: recorded
Root cause: recorded
Candidate approaches: compared
Cursor independent review: recorded
Recommended approach: C2 + C3
Implementation: NOT STARTED
Revalidation: NOT RUN
Observation / Fact: NOT GENERATED
Scope / SHA / PDF: UNCHANGED
Execution / Commit: NOT AUTHORIZED
```

```text
Selector A
    FAIL
      ↓
Modify Design
      ↓
Cursor Review
      ↓
Human Architect Review
      ↓
APPROVE / MODIFY / REJECT
```
