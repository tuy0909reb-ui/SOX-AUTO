# Financial Fact Fan-out Batch 2 Scope Candidates

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-CANDIDATES-001`  
**Date:** 2026-08-16  
**Stage:** ① Scope candidate creation only  
**Status:** **Human Architect review required — no scope is frozen**  
**Verdict:** **MODIFY**

## 1. Boundary

This record is a candidate list, not a Batch 2 scope file.

It does not:

- fix Batch 2 Event or Document membership;
- calculate or record a scope SHA-256;
- acquire, replace, or re-fetch any PDF;
- implement a selector or run selector validation;
- generate an Observation, Financial Fact, or reconciliation row;
- alter Batch 0 / Batch 1 / canonical outputs; or
- authorize Batch 2 execution.

Candidate references use only the existing 345-Event SoT, existing official
TDnet document-index records, and an already-present local official 285A
snapshot. Gemini is discussed only as a future independent reconciliation
candidate and is not used as a numeric Fact input.

## 2. Coverage baseline

```text
Fixed Universe:                         14 issuers
Batch 0 + Accepted Batch 1 Fact paths:  13 issuers
Uncovered issuer (fan-out path):        285A (Kioxia Holdings)
Canonical 64-Fact baseline:             285A already has V002 Facts for the
                                        2026-07-31 Q1 Document/Event
```

Batch 0 remains regression-only. Batch 1 scope, snapshots, selectors, and
outputs remain frozen. The 285A fan-out coverage gap makes it a mandatory
Human Architect review item, but not an automatic Batch 2 scope member. The
presence of preexisting V002 Facts further blocks blank-slate adoption.

## 3. Candidate decision summary

| Candidate | Official source status | Batch 2 purpose | Recommendation |
|---|---|---|---|
| 285A 2027 Q1 | Snapshot + V002 Facts already present (`pilot_v002_only`) | Sole missing fan-out issuer path; IFRS / Non-GAAP ambiguity | **Hold — primary review candidate** |
| 8035 2024-11-12 H1 + FY forecast | Snapshot + V002 Facts already present (`pilot_v002_only`) | Forecast axis without reusing Batch 0 deferred Document | **Hold — diversity review** |
| 7011 2027 Q1 | Snapshot + V002 Facts already present (`pilot_v002_only`) | IFRS interim layout ≠ Batch 0 FY repair Document | **Hold — diversity review** |
| 8035 2027 Q1 | TDnet index / Event SoT only; no local snapshot found | JGAAP Q1 layout; guidance-status unproved | **Hold — index-only** |
| 4062 2026 Q3 review-complete | TDnet index / Event SoT only; no local snapshot | Review-complete relationship ambiguity | **Hold — index-only** |
| 7735 / 8306 primary+review Event pairs | Event SoT + official URLs; no local Batch 2 snapshot | Multi-doc / review relation design | **Hold — relation design** |
| 7735 original Q1 / Batch 0 materials | Related to frozen Batch 0/1 paths | Duplicate or regression mix risk | **Exclude from initial scope** |

“Hold — primary / diversity review” means present for Human Architect decision.
It does **not** mean Include into a frozen Batch 2 scope. All three
snapshot-backed rows already carry V002 Facts; blank-slate re-extraction is
forbidden without an explicit non-merge rule.

## 4. Primary review candidate — 285A Kioxia Holdings

### Identity and official path

```text
Issuer / security: 285A / Kioxia Holdings
Event:
  official-event-4bda3f4c595f5ba8b34646aada3f7681
Event date / period:
  2026-07-31 / 2027-03 Q1 cumulative / fiscal period end 2026-06-30
Accounting / consolidation in Event SoT:
  IFRS / consolidated
Official TDnet index Document:
  doc-f770b766ffff525fb1d4ac3879967278
Title:
  2027年3月期第1四半期決算短信〔IFRS〕(連結)
Official TDnet URL:
  https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf
Existing local official snapshot record:
  financial-document-5093eae6342a5d06b7a39bd8961dad3f
Snapshot SHA-256:
  f78ce549aabdf043201b7592397079b29345cb10808f8ab14bf555e8e4590fe3
Inventory scope today:
  pilot_v002_only
```

The snapshot is already present under
`raw_external/financial_fact_sample_sources/`; this candidate list neither
copies nor reclassifies it. Any later Batch 2 scope decision must state
whether that immutable snapshot can be referenced as the approved scope
source, or whether the candidate is held. It must not silently re-fetch or
replace it.

### Existing canonical Facts already present

The same Document/Event already contributes confirmed rows in the preexisting
canonical `financial_observation.jsonl` (part of the immutable 64-Fact
baseline). Those rows include IFRS Q1 cumulative actuals and Q2 cumulative
company forecasts sourced from the same official PDF.

Therefore:

- 285A is uncovered only as a **Batch 0/1 fan-out Accepted path**, not as an
  issuer with zero official Facts;
- Batch 2 must not auto-merge, overwrite, or regenerate those existing Facts;
- any later Batch 2 treatment of 285A requires an explicit Human Architect
  decision among coverage-reference, additive namespace-only verification, or
  exclusion with a documented reason.

### Evidence-confirmed candidate selector paths

The already-present official PDF proves the following *candidate* paths. These
are not implemented selectors.

1. **IFRS Q1 cumulative actual**
   - page 1
   - section: `連結経営成績(累計)`
   - metric/table: `売上収益`
   - period marker: `2027年3月期第1四半期`
   - unit marker: `百万円`
   - basis / consolidation: `〔IFRS〕(連結)`
   - candidate Fact type: `actual`

2. **IFRS Q2 cumulative company forecast**
   - page 2
   - section: `3.2027年3月期の連結業績予想`
   - row: `第2四半期(累計)`
   - metric/table: `売上収益`
   - period range shown: `2026年4月1日~2026年9月30日`
   - unit marker: `百万円`
   - candidate Fact type: `company_forecast`

3. **Required ambiguity boundary, not a Fact candidate until proved**
   - page 8 has a second-quarter outlook presentation with `億円` and both
     IFRS and `Non-GAAP` labels.
   - This is intentionally a selector-risk case. It must not substitute for
     the page-2 `百万円` cumulative forecast, and it must not be treated as the
     same accounting metric without a source-proved taxonomy decision.

### Why 285A is the primary review candidate

- It is the sole missing Batch 0/1 **fan-out Accepted path** among the 14
  Universe issuers.
- It already has V002 Facts for the same Document, so Human Architect must
  decide coverage-reference versus additive Batch 2 treatment before any
  scope freeze.
- It provides both actual and forecast candidates in one official Document.
- It is an IFRS layout distinct from the Batch 1 IFRS examples because it
  presents IFRS and Non-GAAP measures side by side.
- It supplies concrete negative-test material: same visual topic, different
  period, unit, and accounting meaning.
- It has a pre-existing immutable official snapshot, so selector feasibility
  can later be reviewed without source substitution.

### Risks and required decisions

- Existing V002 Facts already cover this Document. Batch 2 cannot treat 285A
  as a blank-slate first extraction without a non-merge / non-overwrite rule.
- Current Inventory metadata is `pilot_v002_only` and lacks the Batch 1-style
  `issuer` / `document_role` / `observation_policy` dispatch fields. Any Batch 2
  use requires additive Inventory classification, not mutation of the baseline.
- The Q2 cumulative forecast table is vertically extracted and may require a
  `multi_page_same_table` or `page_table_row` fixture. That must be decided
  only in a later selector-design step.
- The Document contains both IFRS and Non-GAAP measures. A selector must
  explicitly target the IFRS `売上収益` column; any Non-GAAP field requires a
  separate taxonomy proposal and must otherwise fail closed.
- Page 8 uses `億円`; no unit conversion may be inferred or reused from the
  page-2 `百万円` table.
- Gemini has contemporaneous 285A Q1/Q2 text with apparent rounding/scale
  wording versus the official `百万円` table. That is a **reconciliation
  investigation candidate only**, not a proved `conflict`. Do not promote
  Gemini values or invent a conflict.
- The other six 285A Event SoT rows state `document_count: 3` but lack
  individual hash-backed Document/Source records in the current Fact inventory.
  They are not Batch 2 Fact candidates until authorized official snapshot work
  exists.

**Recommendation: Hold — primary Human Architect review candidate.**
Strong for coverage and negative-test design; not auto-adoptable into a frozen
Batch 2 scope.

## 5. Snapshot-backed diversity pool (outside frozen Batch 0/1 Events)

Outside frozen Batch 0/1 Events, the inventory currently exposes **exactly
three** hash-backed official PDFs. All three are `inventory_scope =
pilot_v002_only` and already contribute confirmed rows to the canonical
64-Fact baseline. They are diversity / coverage review candidates only.

### 5.1 8035 Tokyo Electron — JGAAP H1 with explicit FY company forecast

```text
Event:     official-event-5097c451c2e6519c90e9bc23fc52def6
Date:      2024-11-12
Period:    2025-03 Q2 cumulative (Event SoT); FY company forecast also present
Document:  financial-document-d8af1ffc304451f89b1c10d79cdd6c6a
           (Event SoT also cites doc-bfbd66e8e5845552b00af0ceaf23dc05)
Title:     2025年3月期第2四半期(中間期)決算短信〔日本基準〕(連結)
TDnet:     https://www2.jpx.co.jp/disc/80350/140120241003593212.pdf
Snapshot:  .../financial_fact_sample_sources/88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c.pdf
Hash:      88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c
Inventory: pilot_v002_only
```

- Purpose: forecast axis without reusing the Batch 0 deferred-guidance
  Document (`ed132c22…`).
- Existing V002 Facts already include H1 actuals and FY `company_forecast`
  rows for this Document.
- Risk: issuer already has a Batch 0 Fact path; this is diversity only.
  Do not overwrite or auto-merge the 64 Facts.

**Recommendation: Hold — diversity review.**

### 5.2 7011 Mitsubishi Heavy Industries — IFRS Q1

```text
Event:     official-event-6042eaef6808592b8e960199e4a45a90
Date:      2026-08-04
Period:    2027-03 Q1 cumulative (Event SoT)
Document:  financial-document-48720411595a52acba60202db3abfe07
           (Event SoT also cites doc-d17dcc4960ff506e9f866162018e48f0)
Title:     2027年3月期第1四半期決算短信〔IFRS〕(連結)
TDnet:     https://www2.jpx.co.jp/disc/70110/140120260726599663.pdf
Snapshot:  .../financial_fact_sample_sources/fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc.pdf
Hash:      fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc
Inventory: pilot_v002_only
```

- Purpose: IFRS interim layout distinct from the Batch 0 7011 FY repair
  Document.
- Existing V002 Facts already include Q1 actuals and company-forecast rows.
- Risk: issuer already covered via Batch 0; optional only if Human Architect
  keeps a diversity budget after 285A.

**Recommendation: Hold — diversity review.** Do not treat the Batch 0 FY PDF
as this candidate.

## 6. Index-only / relation Hold candidates (no Batch 2 snapshot)

### 6.1 8035 Tokyo Electron — JGAAP Q1 (index only)

```text
Event:     official-event-3c41b9e2f1d2583aae1eaccdb3338371
Date:      2026-07-30
Period:    2027-03 Q1 cumulative (Event SoT)
Document:  doc-6334a924109655239c6a433f1cd9694d
Title:     2027年3月期第1四半期決算短信〔日本基準〕(連結)
TDnet:     https://www2.jpx.co.jp/disc/80350/140120260630584086.pdf
```

- No local hash-backed snapshot was found for this Event in the current
  inventory. Title/Event establish JGAAP Q1 metadata only.
- Forecast, deferred-guidance status, unit, and table remain unproved.
- Prefer the snapshot-backed 2024-11-12 H1 Document (§5.1) if a forecast
  axis is needed without acquisition.

**Recommendation: Hold — index-only.**

### 6.2 4062 Ibiden — JGAAP Q3 review-complete title

```text
Event:     official-event-8f70d727fd9e54ed9be059fa06e85d27
Date:      2026-02-24
Period:    2026-03 Q3 cumulative (Event SoT)
Document:  doc-d7723997699f5d36a7782a980e076d26
Title:     2026年3月期第3四半期決算短信〔日本基準〕(連結)
            (公認会計士等による期中レビューの完了)
TDnet:     https://www2.jpx.co.jp/disc/40620/140120260220565976.pdf
```

- Candidate purpose: review-complete title versus review-only Document.
- No near sibling Event was matched in a ±14-day scan from existing SoT.
- Risk: may refer to an underlying original Q3 disclosure. Any relation
  must be source-proved and must not create a duplicate Fact or auto-merge.

**Recommendation: Hold — index-only** as a review/duplicate negative-design
candidate, not as an initial numeric Fact candidate.

### 6.3 Multi-doc / review Event pairs (URL SoT only)

Best non-Batch-0 multi-doc relation candidates still in Event SoT:

- **7735** review `official-event-fd15399076935297a8fa1cbf2b7a97a8` with
  sibling primary `official-event-d718eaa87c825021b0ad87ccd31b9d33`
  (~14 days apart; distinct from frozen Batch 1 review Event `bac0d4c9…`).
- **8306** review `official-event-f2fcb9f043295c3e935ca6bd6611c59d` with
  sibling primary `official-event-4cddce1f43de539aa0653c8bd563bb9c`
  (alternate if 7735 is skipped; issuer already covered via Batch 0).

Neither pair has a local Batch 2 snapshot. They are relation-design Holds
only; acquisition remains unauthorized.

## 7. Excluded candidates and SoT gaps

### 7.1 Exact Batch 0 materials

The following remain Batch 0 regression only and are excluded from Batch 2
candidate adoption:

- 6857 2027 Q1 primary/revision path;
- 8035 2026 FY deferred-guidance path;
- 3436 2026 Q2 path;
- 8306 2027 Q1 primary/review path; and
- 7011 2025 FY repair-evidence path.

### 7.2 7735 original Q1 release

```text
Event:     official-event-b3575ec5147c5cb28fbefe1dcb3b0506
Document:  doc-51ef4d2ec122584f9a9ebd0e18cf2521
Title:     2027年3月期第1四半期決算短信〔日本基準〕(連結)
```

The later 7735 review-complete Document is frozen in Batch 1. The original
release is a useful duplicate/relationship **negative-test concept**, but
including it in an initial Batch 2 scope risks re-opening the accepted Batch 1
review path. It is therefore excluded pending a separate relation/duplicate
design decision.

### 7.3 Gaps that cannot be evidenced from current SoT alone

- **New revision-companion multi-doc pair** outside Batch 0: Event SoT does
  not currently expose a second revision-companion identity suitable for
  Batch 2.
- **Second deferred-guidance Event** outside Batch 0: not proved in Event
  titles; keep deferred guidance on Batch 0 regression.
- **Natural Gemini↔official numeric conflict:** Event reconciliation remains
  `conflict=0`. Do not manufacture a conflict for Batch 2.

## 8. Negative-test design candidates (not implementations)

The following are mandatory design cases for the later selector/negative
reviews. None is a Fact candidate by itself.

| Case | Source-informed rationale | Required behavior |
|---|---|---|
| Actual vs forecast ambiguity | 285A Q1 actual (page 1) versus Q2 forecast (page 2) | Never use one as the other |
| IFRS vs Non-GAAP ambiguity | 285A side-by-side columns | Non-GAAP cannot enter IFRS Fact path |
| Unit mismatch | 285A page 2 `百万円` versus page 8 `億円` | Reject mismatched selector |
| Period mismatch | 285A Q1 / Q2 cumulative / Q2 outlook | Reject wrong period end/basis |
| Wrong page/section/table/row | 285A multi-page structure | Reject rather than use first match |
| Multiple match / missing evidence / label | All new layout fixtures | Emit no Fact |
| Hash and scope mismatch | Future frozen candidate inputs | Emit no Fact |
| Review-complete / multi-doc relation | 4062 / 7735 / 8306 concepts | Emit no duplicate/auto-merge |
| Identity hygiene | `doc-*` vs `financial-document-*`; null role/policy on V002 inventory | Resolve before any later freeze |

## 9. Gemini / official reconciliation preflight

The 285A ledger has contemporaneous Q1 actual and Q2 forecast text. Because
official Observations for this Document already exist in the 64-Fact baseline,
any later comparison must remain independent:

```text
official Financial Fact
vs
Gemini raw ledger
```

All matching dimensions must still be established before a status other than
`official_only` / `unresolved` is claimed:

```text
security + Event/document + metric + measure kind + forecast scope
+ period basis + period end + accounting basis + consolidation + unit
```

This candidate review finds no source-proved natural Gemini/official conflict.
Event-level reconciliation currently shows **zero** `conflict` rows.
Apparent rounding/scale wording is not a conflict finding. Correct future
preflight status: **unresolved / investigate**, never a manufactured
`conflict`. Reconciliation as a Batch 2 objective is therefore likely
**MODIFY** unless a later authorized preflight proves a real discrepancy.

## 10. Human Architect decisions requested

1. Decide how 285A relates to Batch 2:
   coverage-reference only, additive namespace verification without touching the
   64 Facts, or temporary exclusion with a documented reason.
2. Decide whether preexisting V002 Facts for 285A satisfy the “14-issuer path”
   objective for Batch 2, or whether a separate Batch 2 path is still required.
3. Decide the diversity budget among the three snapshot-backed V002 Documents
   (285A / 8035 H1+FY forecast / 7011 Q1). None may be blank-slate re-extracted.
4. Decide whether index-only or URL-only relation cases (8035 Q1, 4062,
   7735/8306 pairs) belong in Batch 2, remain negative-test-only, or wait for
   authorized acquisition.
5. Set a bounded candidate-to-frozen-scope budget before any scope file,
   SHA, PDF acquisition, selector, or Fact work.
6. Decide whether the absence of a natural Gemini conflict blocks Batch 2
   scope approval or remains a later preflight `MODIFY` gate.
7. Before any later freeze, require identity hygiene: reconcile `doc-*` vs
   `financial-document-*`, and decide additive `document_role` /
   `observation_policy` classification without mutating baseline Inventory
   meaning.

## 11. Stop state

```text
Scope candidates:     created
Scope frozen:         no
Scope SHA:            not created
PDF acquisition:      0
Selector implementation: 0
Selector validation:  0
Fact generation:      0
Reconciliation run:   0
Commit:               0
```

The next permitted action is **Human Architect Review** of this candidate
list. No Batch 2 execution work is authorized.
