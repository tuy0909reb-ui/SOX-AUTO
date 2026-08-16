# Financial Fact Fan-out Batch 2 — Selector Binding Modify Review 002 (285A)

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-MODIFY-002`  
**Date:** 2026-08-16  
**Stage:** Modify Review only — no implementation, no revalidation, no Fact generation  
**Prerequisite FAIL:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-REVALIDATION-001`  
**Base design:** Approved C2+C3 (`SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SELECTOR-BINDING-MODIFY-001`)  
**Verdict:** **READY FOR APPROVE / MODIFY / REJECT**

## 1. Boundary

This record redesigns Selector A binding so it no longer depends on a raw
table-end marker. It does **not**:

- implement or revalidate selectors;
- change Batch 2 scope / SHA / Event / Document identity;
- re-fetch or replace the PDF;
- validate Selector B;
- generate Observation / Financial Fact;
- run Gemini reconciliation;
- mutate Batch 0 / Batch 1 / V002 Facts; or
- commit.

```text
Selector A FAIL
      ↓
Modify Review 002 (this document)
      ↓
Cursor independent review (embedded)
      ↓
Human Architect
      ↓
APPROVE / MODIFY / REJECT
```

## 2. Frozen state (unchanged)

```text
Scope SHA-256:
  157c968d965016904007f6282ff46c76ce0173b126fbbcc70a0e76ceeb872de2
Scope key:
  doc-f770b766ffff525fb1d4ac3879967278
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

After C2+C3 implementation, Selector A failed before numeric binding:

```text
Failure: missing or ambiguous table bounds
Failed dependency: table_end = 四半期利益 Non-GAAP
```

Scope / PDF / hash checks had already passed. Numeric amount/`%` binding was
never reached.

## 4. Root cause

### 4.1 Design cause: table-end dependency

Selector A still required a `table_end` marker to carve a raw table region
before binding. That makes Fact uniqueness depend on a secondary boundary
that is not itself a Fact dimension.

### 4.2 Source evidence: why that end marker is unstable

On the frozen PDF (NFKC, whitespace preserved), page 1 shows:

```text
(1)連結経営成績(累計) ...
売上収益 Non-GAAP
...
百万円 % 百万円 % ...
2027年3月期第1四半期 1,767,117 415.5 1,326,216 - ...
...
四半期利益
Non-GAAP
```

`四半期利益` and `Non-GAAP` are split across lines and later reappear in other
blocks. Using `四半期利益 Non-GAAP` as a required end boundary is therefore
fragile and unnecessary. It is also listed in this review’s forbidden set:

```text
table end / last row / 四半期利益 Non-GAAP presence
```

### 4.3 What remains source-proved without table end

The revenue Fact surface is already present as a conjunction:

```text
section: 連結経営成績(累計)
header:  売上収益 Non-GAAP
units:   百万円 % 百万円 % ...
period row:
  2027年3月期第1四半期 1,767,117 415.5 ...
```

Token split of that period row:

```text
[row]     2027年3月期第1四半期
[amount]  1,767,117
[%]       415.5
[next]    1,326,216 ...
```

## 5. Terminology alignment (important)

In TDnet cover tables:

| Term | 285A meaning | Example |
|---|---|---|
| section | results block | `連結経営成績(累計)` |
| metric / column header | IFRS revenue label | `売上収益` |
| period row | fiscal row line | `2027年3月期第1四半期` |
| amount / % pair | first IFRS amount + adjacent % | `1,767,117` / `415.5` |

The request phrase “対象 row = 売上収益” is interpreted as the **metric
column** `売上収益`, not as the period-row line. The Frozen scope and approved
C2+C3 already use:

```text
table/metric = 売上収益
period row   = 2027年3月期第1四半期
```

This Modify keeps that meaning. Treating `売上収益` as a period-row label
would be false for this PDF.

## 6. Table-end dependency — remove

Selector A must **not** use any of the following as membership proof:

```text
table_end
table_start→table_end span
last row
last numeric row
四半期利益 Non-GAAP
PDF last line
```

Membership must be proved by Fact dimensions only.

## 7. Proposed binding (Selector A only)

Retain approved C2+C3 dual layers; replace table-region carving with
dimension conjunction.

```text
Document (doc-f770b766…)
  ↓
page = 1
  ↓
section = 連結経営成績(累計)   [collapse markers OK]
  ↓
header map:
  売上収益 → Non-GAAP
  百万円/% → 百万円/% ...
  first amount column = IFRS 売上収益
  adjacent % column = 増減率 boundary
  ↓
period row = 2027年3月期第1四半期
  ↓
whitespace-preserving tokens on that unique row
  ↓
amount / % pair under IFRS 売上収益 column
  ↓
amount token = target candidate
```

### 7.1 Section proof

- Require unique page-1 presence of section marker
  `連結経営成績(累計)` (Batch 1-compatible collapsed match).
- If zero or multiple section pages/locations make membership unclear → FAIL.
- Do not adopt a same/similar label from another section.

### 7.2 Header map proof

Require an explicit map on the same page:

```text
売上収益 Non-GAAP
百万円 % ... 百万円 % ...
```

Interpretation that must be proved, not guessed:

```text
IFRS
 → 売上収益
 → amount column = first 百万円 under 売上収益
 → percentage column = adjacent %
Non-GAAP amount columns remain non-canonical
```

Fail if:

- header map missing / multiple / ambiguous;
- IFRS vs Non-GAAP column correspondence unclear;
- left/right “nth column” is used without header labels.

### 7.3 Period-row binding

Bind the unique period row:

```text
2027年3月期第1四半期
```

under the revenue header map.

Page 1 contains multiple lines with the same period label (profit / EPS /
balance-sheet blocks). Uniqueness therefore requires the conjunction:

```text
period row
+ amount/% pair shape under the revenue header map
+ not under a later conflicting header block
```

Not by table-end. If more than one such row remains → FAIL.

### 7.4 Amount / % pair binding

On the bound period row, require:

```text
amount = 1,767,117
%      = 415.5
```

as a same-row column pair under the IFRS 売上収益 amount/`%` group.

Rules:

- adjacency alone does **not** define meaning;
- header map + period row must already be proved;
- `%` is delimiter / boundary evidence, never a Fact value;
- Non-GAAP amount (`1,326,216` in the same line) must not bind as IFRS revenue.

Bare substring `1,767,117` remains forbidden as a PASS criterion.

## 8. Fail-closed conditions

FAIL and emit no Observation / Fact when any of the following holds:

- section mismatch / multiple match
- header map unclear
- IFRS / Non-GAAP column unclear
- period-row missing / multiple after conjunction
- amount / `%` pair unclear
- amount column unclear
- percentage column unclear
- amount↔`%` row correspondence unclear
- unit unclear (`百万円` only; no `億円`)
- period unclear
- actual / forecast unclear
- page / document mismatch
- hash mismatch / scope mismatch

## 9. Forbidden workarounds

Do not:

- replace one table-end marker with another end marker as the fix;
- first-match / nearest-match;
- substring-only extraction;
- fixed character offsets;
- left/right position-only column inference;
- magnitude-based guessing;
- expected-value confirmation as authority;
- Gemini confirmation;
- V002 Fact confirmation;
- “obvious to a human” PASS.

## 10. Cursor independent review (reference only)

This section is Cursor’s technical opinion, not a canonical decision.

### 10.1 Is table-end dependency the root FAIL?

**Yes.** Revalidation stopped at `table_end` before C2+C3 numeric binding
could run. The PDF already exposes a space-delimited amount/`%` pair; the
blocker was the artificial end-boundary requirement.

### 10.2 Can section + header map + row + amount/% prove uniqueness?

**Yes, for Selector A on this PDF**, if “row” means the period row
`2027年3月期第1四半期` and `売上収益` is the metric/header column. The period
label alone is not unique on page 1; uniqueness comes from the conjunction
with the revenue header map and the first amount/`%` pair.

### 10.3 Minimal change from approved C2+C3

Keep:

```text
structural markers → collapse
numeric tokens     → whitespace-preserving NFKC
header → IFRS amount
adjacent % as boundary evidence
```

Remove only:

```text
table_start / table_end region carving for Selector A
```

Replace region carving with page-local conjunction proofs above.

### 10.4 Can raw extraction keep header-column relations?

**Yes** on this snapshot. Header line `売上収益 Non-GAAP`, unit line
`百万円 % ...`, and period row tokens are all present with whitespace
delimiters. Geometry / external parsers are unnecessary for this Modify.

### 10.5 How to record amount / % evidence

Evidence should store:

```text
section
header_map
period_row
bound_column = IFRS_revenue_amount
amount_token
adjacent_percent_token
unit = 百万円
page = 1
```

`%` is evidence only.

### 10.6 False-positive guards

Especially required because multiple `2027年3月期第1四半期` lines exist:

- reject profit / EPS / BS period rows that lack the revenue header map
  conjunction;
- reject Non-GAAP amount token;
- reject `%` as amount;
- reject collapsed numeric binding;
- reject any PASS that skips header map.

### 10.7 Batch 1 regression

If changes stay inside Batch 2 validator / later Batch 2 extractor only:

- Batch 1 marker collapse unchanged;
- Batch 1 numeric whitespace preservation unchanged;
- Batch 1 fixtures / outputs / `doc-*` provenance untouched.

No Batch 1 code change is required for this Modify.

### 10.8 Implementation risks

| Risk | Mitigation |
|---|---|
| Misreading `売上収益` as period row | Keep Frozen-scope terminology |
| Multiple period rows | Conjunction with revenue header map |
| Reintroducing another end marker | Explicit ban list |
| Expected-value driven PASS | Bind first; compare only as non-authoritative check if used at all |
| Scope creep into Selector B | Selector B remains blocked until A passes |

### 10.9 Recommended approach

**Adopt table-end-free C2+C3 conjunction binding for Selector A:**

```text
page + section
+ header map (売上収益/Non-GAAP + 百万円/%)
+ period row (2027年3月期第1四半期)
+ IFRS amount / adjacent % pair
```

### 10.10 Recommended negative tests (post-approval only)

| Case | Expected |
|---|---|
| table_end used as required proof | FAIL / forbidden |
| period row without revenue header map | FAIL |
| Non-GAAP amount selected | FAIL |
| `%` selected as revenue | FAIL |
| collapsed amount+percent token accepted | FAIL |
| profit-block period row accepted | FAIL |
| header map missing/ambiguous | FAIL |
| multiple revenue amount/% candidates | FAIL |
| scope / hash mismatch | FAIL |

## 11. Batch 1 regression impact

| Item | Impact if recommended Modify is followed |
|---|---|
| marker collapse | Unchanged |
| numeric whitespace preservation | Unchanged / aligned |
| existing Batch 1 selector evidence | None |
| `doc-*` keys | None |
| provenance | None |
| unit / period validation | None |
| Batch 1 Accepted outputs | None |

## 12. Recommended implementation (design only; not authorized yet)

If Human Architect APPROVES:

1. Remove Selector A `table_end` / table-span dependency.
2. Keep C2+C3 dual-layer text handling.
3. Implement section + header map + period-row + amount/`%` conjunction.
4. Revalidate Selector A only.
5. On A PASS, separately authorize Selector B validation.
6. Still forbid Observation / Fact / Gemini reconciliation / Commit.

No implementation is authorized by this document alone.

## 13. Human Architect decision required

Choose one:

1. **APPROVE** table-end-free C2+C3 conjunction binding for Selector A;
2. **MODIFY** further (state the additional constraint);
3. **REJECT** and keep Selector A blocked.

## 14. Stop state

```text
Current failure: recorded
Root cause: table-end dependency
Proposed binding: section + header map + period row + amount/% pair
Cursor review: recorded
Implementation: NOT STARTED
Revalidation: NOT RUN
Selector B: NOT RUN
Observation / Fact: NOT GENERATED
Scope / SHA / PDF: UNCHANGED
Execution / Commit: NOT AUTHORIZED
```

```text
Selector A
    FAIL
      ↓
Modify Review 002
      ↓
Cursor Review
      ↓
Human Architect
      ↓
APPROVE / MODIFY / REJECT
```
