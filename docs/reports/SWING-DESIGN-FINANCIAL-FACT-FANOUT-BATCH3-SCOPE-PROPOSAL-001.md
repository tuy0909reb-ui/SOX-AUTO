# Financial Fact Fan-out Batch 3 — Scope Proposal

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH3-SCOPE-PROPOSAL-001`  
**Date:** 2026-08-16  
**Stage:** Scope proposal only — no Freeze, SHA, PDF work, selector, or Fact extraction  
**Prerequisite:** Batch 3 Design Review Approved  
**Design Review:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH3-001`  
**Verdict:** **READY FOR APPROVE / MODIFY / REJECT**

## 1. Current Frozen Baseline

```text
Batch 0          ACCEPTED / FROZEN
Batch 1          ACCEPTED / FROZEN
Batch 2          ACCEPTED / FROZEN

Batch 3 Design Review: APPROVED
Batch 3 Scope:         NOT FROZEN
```

This proposal does **not** change Batch 0/1/2 artifacts, canonical / V002 Facts,
Gemini ledger, or Event reconciliation.

```text
Scope Freeze:            NOT DONE
Scope SHA:               NOT GENERATED
PDF acquisition:         NOT DONE
Selector implementation: NOT DONE
Fact extraction:         NOT DONE
Commit:                  NOT DONE
```

## 2. Fixed candidates in this proposal

| ID | Label | Proposal class |
|---|---|---|
| A | 7011 Q1 IFRS | **ADOPT** (primary) |
| B | 8035 H1 | **ADOPT** (secondary; same Document as C) |
| C | 8035 FY revision | **ADOPT as axis on B’s Document** — not a third Event |

```text
7735:        NOT INCLUDED in this proposal
8035 Q1:     NOT INCLUDED (do not reopen Batch 0 review path)
```

## 3. Scope-key rule

Batch 1 / Batch 2 alignment:

```text
candidate_document_id = doc-*   ← first / preferred scope key
financial-document-*            ← citation-only related inventory ID
```

Do **not** auto-equate the two namespaces. Using `financial-document-*` as the
Batch 3 scope key would be an intentional schema divergence and requires
separate Human Architect approval. This proposal does **not** adopt that
divergence.

---

## 4. Candidate A — 7011 Q1 IFRS

### Mapping

| Field | Value | Status |
|---|---|---|
| issuer / security_id | Mitsubishi Heavy Industries / `7011` | proved |
| Event ID | `official-event-6042eaef6808592b8e960199e4a45a90` | proved |
| candidate_document_id (`doc-*`) | `doc-d17dcc4960ff506e9f866162018e48f0` | proved |
| financial-document ID | `financial-document-48720411595a52acba60202db3abfe07` | proved (citation) |
| local official PDF | `…/financial_fact_sample_sources/fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc.pdf` | proved |
| PDF content hash | `fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc` | proved |
| document date | `2026-08-04` | proved |
| title | `2027年3月期第1四半期決算短信〔IFRS〕(連結)` | proved |
| reporting period (actual) | Q1 cumulative; covered `2026-04-01`–`2026-06-30` | proved |
| accounting basis | IFRS / consolidated | proved |
| inventory scope today | `pilot_v002_only` | proved |

### Fact candidate definition (primary)

```text
measure_kind:     actual
period_basis:     Q1_cumulative
metric:           revenue / 売上収益
candidate value:  1,194,203
unit:             百万円 / JPY_million
page:             1
section:          連結経営成績（累計）
period row:       2027年3月期第1四半期
```

Optional same-Document secondary axis (not required for A alone):

```text
measure_kind:     company_forecast
period_basis:     full_year
metric:           revenue / 売上収益
candidate value:  5,400,000
unit:             百万円
page:             2
section:          3．2027年3月期の連結業績予想
row:              通期
revision note:    直近に公表されている業績予想からの修正の有無：無
```

### Boundaries (must not enter this Fact)

```text
JGAAP
Non-GAAP (none present; do not invent)
事業利益 as revenue
税引前四半期利益 / 四半期包括利益 as revenue
FY 通期 as Q1 actual
億円 conversion
table-end membership
discontinued-ops narrative as numeric Fact
```

### Existing Fact relation (no merge/replace decision)

Same Event / `financial-document-*` already has confirmed V002 Observations
(Q1 actuals and FY company forecasts). Relation to Batch 3:

```text
relation class: candidate relationship only
not decided here as: replace / merge / duplicate / additive
required later freeze rule: additive namespace + non-merge with V002 64
```

Also distinct from Batch 0 **7011 FY repair** Document (different PDF). Do not
reuse that frozen Document as evidence for Candidate A.

### Binding risk (MODIFY factor, not silent PASS)

Cover row distinguishes:

```text
親会社の所有者に帰属する四半期利益   134,680
四半期包括利益                       131,916
```

Existing V002 stores a row labelled parent-owner quarterly profit with value
`131,916`. Treat as **source-binding risk for non-revenue metrics**. Candidate A
revenue `1,194,203` remains source-proved and is not that ambiguous cell.

### Selector feasibility

```text
pattern class:          existing pattern reusable (Batch 1 IFRS family)
structure:              section + metric header + period row + amount + adjacent %
C2+C3 Non-GAAP map:     NOT required / NOT present
table_end_used:         false (must remain)
```

### Negative boundary

```text
wrong page / section / row / period / unit / accounting basis
actual ↔ forecast confusion
IFRS / Non-GAAP confusion (fail if Non-GAAP invented)
事業利益 ↔ 売上収益 confusion
multiple numeric candidates without conjunction
missing evidence
table-end dependency
hash mismatch / scope mismatch
```

### Proposal

```text
Candidate A: ADOPT (primary)
```

---

## 5. Candidate B — 8035 H1

### Mapping

| Field | Value | Status |
|---|---|---|
| issuer / security_id | Tokyo Electron / `8035` | proved |
| Event ID | `official-event-5097c451c2e6519c90e9bc23fc52def6` | proved |
| candidate_document_id (`doc-*`) | `doc-bfbd66e8e5845552b00af0ceaf23dc05` | proved |
| financial-document ID | `financial-document-d8af1ffc304451f89b1c10d79cdd6c6a` | proved (citation) |
| local official PDF | `…/financial_fact_sample_sources/88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c.pdf` | proved |
| PDF content hash | `88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c` | proved |
| document date | `2024-11-12` | proved |
| title | `2025年3月期第2四半期(中間期)決算短信〔日本基準〕(連結)` | proved |
| reporting period | H1 / Q2 cumulative; end `2024-09-30` | proved |
| accounting basis | JGAAP / consolidated (`〔日本基準〕(連結)`) | proved |
| IFRS? | **No** — JGAAP | proved |

### Fact candidate definition

```text
measure_kind:     actual
period_basis:     Q2_cumulative (H1 / 中間)
metric:           revenue / 売上高
candidate value:  1,121,626
unit:             百万円 / JPY_million
physical PDF page of numeric table: 4 (reader index; footer shows - 3 -)
section / block:  ご参考 2025年3月期中間連結会計期間実績 + 実績(B)
```

Cover page text is largely empty. Narrative page uses `億円` wording. Do not
bind narrative `億円` as the Fact unit.

### Existing Fact relation

V002 already contains H1 actual Observations for this Document. Relation remains
candidate-only; Freeze must require additive non-merge.

Also distinct from Batch 0 **8035 deferred-guidance** Document. Do not reopen
that path. Do not add 8035 Q1 in this proposal.

### Page-index risk (MODIFY factor)

V002 source links record `source_page: 1` /
`cover_result_or_explicit_forecast_table`, while extractable H1 numeric table is
mid-PDF. Before Freeze, declare whether Batch 3 page means:

```text
PdfReader physical page index
or
document footer page label
```

Do not treat V002 page=1 as selector proof for Batch 3.

### Selector feasibility

```text
pattern class:          minor extension
reuse:                  Batch 1 dual-layer whitespace / conjunctive markers
not reusable as-is:     Batch 1 cover single_page on page 1
needed:                 mid-doc page + 実績(B) row + 百万円 unit + blank-cover fail
C2+C3 Non-GAAP map:     not applicable
table_end_used:         false
```

### Negative boundary

```text
blank-cover false PASS
億円 narrative bind / unit conversion
中間実績 ↔ 通期予想 swap
wrong page / section / row / period
actual / forecast confusion
revision / original confusion (with Candidate C on same page)
multiple numeric candidates
hash / scope mismatch
```

### Proposal

```text
Candidate B: ADOPT (secondary)
```

---

## 6. Candidate C — 8035 FY revision

### Mapping

Same issuer, Event, `doc-*`, `financial-document-*`, snapshot, hash, date, title,
and JGAAP consolidation as Candidate B.

```text
separate Event?                 NO
separate Document?              NO
axis on Candidate B Document?   YES
```

### Fact candidate definition

```text
section:          ①連結業績予想の修正
period:           FY 2024-04-01 – 2025-03-31
unit:             百万円
source labels:
  前回発表予想(A)     revenue 2,300,000
  今回修正予想(B)     revenue 2,400,000
  増減額(B-A)         revenue 100,000
```

Proposal target for Batch 3 Fact axis:

```text
revised company forecast revenue = 今回修正予想(B) 2,400,000 百万円
```

Prior forecast `(A)` is required boundary evidence, not the primary Fact value
unless Human later authorizes an explicit `prior_forecast` Observation.

### Can selector distinguish uniquely?

```text
前回発表予想(A) vs 今回修正予想(B): YES — source labels are explicit
通期 revision block vs 中間 実績(B) block: YES — different period headers
```

Therefore Candidate C is **not** excluded for ambiguity. Remaining open item is
taxonomy meaning, not uniqueness of tokens.

### Taxonomy / MODIFY factor

V002 stores FY revised values as `company_forecast`, not
`prior_forecast` / `revised_forecast`.

Before Freeze / selector design, Human Architect must choose:

```text
1) keep company_forecast for (B), with revision evidenced only in selector text
2) introduce revised_forecast / prior_forecast pair under approved contract
```

Do not silently invent revision taxonomy during Freeze.

### Selector feasibility

```text
pattern class:          minor extension (revision-row markers)
reuse:                  Batch 0 revision concepts as negatives / relation hints
not reusable as-is:     Batch 0 companion-document revision wiring
needed:                 mid-doc 今回修正予想(B) + 通期 + 百万円 + isolation from H1 実績
table_end_used:         false
```

### Negative boundary

```text
bind 前回発表予想(A) as current Fact
bind 増減額 as Fact
bind H1 実績 as FY forecast
億円 / buyback narrative as Fact
revision / original confusion
actual / forecast confusion
unit / period / page mismatch
hash / scope mismatch
```

### Proposal

```text
Candidate C: ADOPT as Fact axis on Candidate B Document
             (not a third Event / Document)
MODIFY factors:
  - taxonomy choice for revision
  - page-index convention shared with B
```

---

## 7. Document / Event summary

| Candidate | Event | Scope key (`doc-*`) | Snapshot hash | Axes |
|---|---|---|---|---|
| A | `official-event-6042eaef…` | `doc-d17dcc…` | `fccc0be0…` | Q1 IFRS actual revenue (+ optional FY forecast) |
| B | `official-event-5097c451…` | `doc-bfbd66…` | `88fe102c…` | H1 JGAAP actual revenue |
| C | same as B | same as B | same as B | FY revised forecast revenue `(B)` |

Proposed Batch 3 Document cardinality if both snapshots are accepted:

```text
Documents: 2
Events:    2
Fact axes: 2–3 (A actual [+ optional A FY]; B H1; C FY revision)
```

## 8. Cursor independent review (reference only)

Sources:

- evidence dossier: [Verify Batch 3 candidate evidence](8c730d30-3193-4816-83b5-313704f8678d)
- technical ranking: [Review Batch 3 proposal risks](2d478663-95e8-4b78-9eb2-61d6e146e48b)

This is reference technical opinion, not an auto-adopted decision.

| # | Question | Cursor opinion |
|---|---|---|
| 1 | 7011 Q1 IFRS eligibility | Eligible; primary ADOPT |
| 2 | 8035 H1 eligibility | Eligible; secondary ADOPT; blank-cover risk high |
| 3 | 8035 FY revision eligibility | Eligible as axis on same Document, not separate Event |
| 4 | Ranking | 7011 → 8035 H1 → 8035 FY revision axis |
| 5 | Selector reuse | 7011: Batch 1 reusable; 8035: minor extension |
| 6 | New logic | No new parser stack; additive mid-doc revision fixtures for 8035 |
| 7 | Fail-closed risks | blank cover; 億円 narrative; A/B swap; 事業利益 as revenue |
| 8 | Revision-specific risks | prior/revised swap; taxonomy vs V002 `company_forecast` |
| 9 | Regression risks | V002 overwrite; auto-equate doc/financial-document; reopen B0 docs |
| 10 | Exclude any? | Do not exclude A/B/C; exclude treating C as third Document; exclude 7735 first cohort |
| 11 | 7735 exclusion | Correct — review-only path; numeric gap needs separate relation design |
| 12 | 14/14 Numeric-Fact priority | Not solved by A/B/C; reliability first; 7735 remains Hold |
| 13 | Overlooked issues | V002 page≠extractable page for 8035; 7011 parent-owner vs comprehensive income binding; declare page convention before Freeze |

## 9. Candidate ranking and recommendations

| Rank | Candidate | Recommendation | Why |
|---|---|---|---|
| 1 | A 7011 Q1 IFRS | **ADOPT** | Highest reuse / reliability ratio; clean IFRS cover; no Non-GAAP overfit |
| 2 | B 8035 H1 | **ADOPT** | Highest new layout stress among existing snapshots |
| 3 | C 8035 FY revision | **ADOPT axis** on B | Source-proved revision labels; taxonomy MODIFY before Freeze |

Safer Freeze options for Human Architect:

```text
Option 1: Freeze Document A only
Option 2: Freeze Documents A + B, with Fact axes B+C on Document B
```

Both remain unauthorized until Human Freeze + later selector GO.

## 10. Proposed Batch 3 scope (not frozen)

```text
batch_id (proposed): financial-fact-fanout-batch3-001
scope_key_rule:      candidate_document_id = doc-*
related inventory:   financial-document-* citation only
auto_equate:         false
v002_treatment:      additive_namespace_verification_only
v002_merge/replace:  false
batch0/1/2:          immutable
pdf_reacquisition:   forbidden for these snapshot-backed candidates
execution:           forbidden until selector GO
table_end_used:      false
```

### Proposed membership

1. **Document A**
   - Event `official-event-6042eaef6808592b8e960199e4a45a90`
   - `doc-d17dcc4960ff506e9f866162018e48f0`
   - snapshot hash `fccc0be0…`
   - Fact axis: IFRS Q1 actual revenue `1,194,203` 百万円

2. **Document B** (optional same Freeze or later Freeze)
   - Event `official-event-5097c451c2e6519c90e9bc23fc52def6`
   - `doc-bfbd66e8e5845552b00af0ceaf23dc05`
   - snapshot hash `88fe102c…`
   - Fact axis B: JGAAP H1 actual revenue `1,121,626` 百万円
   - Fact axis C: FY revised forecast revenue `2,400,000` 百万円 (`今回修正予想(B)`)

### Explicit non-members

```text
7735 any Document
8035 Q1
Batch 0 7011 FY repair Document
Batch 0 8035 deferred-guidance Document
Batch 1 / Batch 2 frozen Documents
remaining-Event bulk cohort
```

## 11. Human Architect decisions requested

1. ADOPT / MODIFY / REJECT Candidate A as primary Batch 3 Document.
2. Whether to include Document B in the same Freeze or defer.
3. Whether Candidate C is accepted as a Fact axis on Document B.
4. Taxonomy for Candidate C: keep `company_forecast` vs authorize
   `revised_forecast` / `prior_forecast`.
5. Confirm `doc-*` scope-key rule and citation-only `financial-document-*`.
6. Confirm additive-only / non-merge with V002 64 Facts.
7. Declare Batch 3 page-number convention before selector design.
8. Confirm 7735 remains out of this Freeze.
9. Refuse SHA / selector / extraction until Freeze is explicit.

## 12. Stop state

```text
Batch 3 Design
APPROVED
        ↓
Batch 3 Scope Proposal
READY FOR
APPROVE / MODIFY / REJECT
```

```text
Scope frozen:              no
Scope SHA:                 not created
PDF acquisition:           0
Selector implementation:   0
Selector validation:       0
Observation / Fact:        0
Execution:                 NOT AUTHORIZED
Commit:                    NOT AUTHORIZED
```

**No Batch 3 real processing may begin without Human Architect scope Freeze.**
