# Financial Fact Fan-out Batch 2 Design Review

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-001`  
**Date:** 2026-08-16  
**Scope:** Design review only — no scope freeze, PDF acquisition, selector coding, or Fact extraction  
**Prerequisite:** Batch 1 Accepted / Frozen (`SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH1-001`)  
**Verdict:** **MODIFY — Design accepted in principle; Batch 2 remains unauthorized until scope candidates are Human-reviewed and frozen**

## 1. Current state

```text
Batch 0  = regression baseline (fixed Pilot)
Batch 1  = Accepted / Frozen
Batch 2  = Design Review (this document)
Execution = not authorized
```

Parent fan-out plan (`SWING-DESIGN-FINANCIAL-FACT-FANOUT-001`) defines Batch 2 as:

> at least one classified/snapshotted document path for every one of the 14
> issuers, with all adapter fallbacks reviewed.

Batch 2 must inherit Batch 1’s fail-closed structure rather than invent a new
extraction architecture.

## 2. Design principles (accepted)

1. Prefer horizontal reuse of the Batch 1 pipeline over new extraction logic.
2. Freeze scope + SHA before any snapshot or Fact work.
3. Out-of-scope materials never enter Batch 2, even if parseable.
4. Selector coverage expands only via: design → selector review → GO → execute.
5. Fail-closed negatives are first-class acceptance criteria, not afterthoughts.
6. Batch 2 measures robustness across issuers/layouts, not mere Fact count growth.
7. Gemini remains discovery/reconciliation only; official PDF remains Fact SoT.
8. Outputs stay additive in a Batch 2 namespace; never mutate Batch 0/1 or the
   preexisting 64 canonical Facts, 345 Events, Event reconciliation, or Gemini SHA.

## 3. Required pipeline (unchanged order)

```text
Immutable baseline
        ↓
Batch 2 scope
        ↓
Document / Event 固定
        ↓
local official PDF snapshot
        ↓
selector validation
        ↓
Human review
        ↓
Execution
        ↓
Observation
        ↓
Financial Fact
        ↓
official-only reconciliation
        ↓
provenance verification
        ↓
idempotency verification
```

No step may skip ahead of an approved gate.

## 4. Approval gate sequence (fixed)

```text
① Batch 2 scope候補作成
② scope Human review → freeze + SHA-256
③ selector設計（Batch 1 fixturesの再利用を優先）
④ selector review
⑤ Negative Test review
⑥ Human Architect GO
⑦ Batch 2 execution
⑧ Execution Review
```

**This review stops before ①.** It does not create, freeze, or SHA a Batch 2
scope file.

## 5. What Batch 2 must prove

Batch 1 proved a small, diverse extraction can be source-proved and idempotent.
Batch 2 must prove the same mechanism survives a broader issuer/layout set.

Mandatory review dimensions:

1. Adapter coverage by Inventory profile
   (`issuer + document_type + document_role + observation_policy`)
2. Selector coverage under the Batch 1 evidence-location model
3. Accounting-basis diversity (JGAAP / IFRS; USGAAP only if official evidence)
4. Actual / company-forecast coexistence without label confusion
5. Cumulative vs quarterly / standalone distinction
6. FY vs interim distinction
7. Period-end evidence fail-closed behavior
8. Special cases already in the contract: revision, newly disclosed, deferred
   guidance, management target, review-only
9. Review-only Documents emit status, never numeric Facts
10. Expanded negative suite

Batch 2 is not authorized to introduce:

- first-match fallback
- alternate-table substitution
- Gemini numeric promotion
- auto-merge with existing Facts
- auto-resolution of conflicts
- Decision / ranking / analysis layers

## 6. Scope design rules (for the next step)

### 6.1 Composition target

Align with the parent fan-out Batch 2 definition and Batch 1 lessons:

- Stay inside the fixed 14-security Universe.
- Prefer Events/Documents not already frozen in Batch 0 or Batch 1 scopes.
- Completeness goal after Batch 2: every Universe issuer has at least one
  classified, hash-backed official Document path somewhere in
  Batch 0 + Batch 1 + Batch 2.
- Current cumulative coverage after Accepted Batch 1: **13 / 14 issuers**.
  Missing issuer for any Fact-path coverage: **285A**.
- Batch 2 therefore must include **285A** unless Human Architect explicitly
  documents a temporary exclusion with a terminal Inventory reason.
- Keep Batch 0 Documents (6857 / 8035 / 3436 / 8306 / 7011 Pilot paths) as
  **regression only**; do not re-list them as Batch 2 scope members.
- Keep Batch 1’s eight Documents frozen; do not re-open or replace them to
  “pass” Batch 2.

Suggested candidate budget (subject to Human Architect freeze):

```text
Events:     enough to cover missing issuer(s) + layout stress cases
Documents:  small enough for full Human review (Batch 1 used 8; Batch 2
            should stay bounded, not a 337-Event cohort)
```

Exact cardinality is **not** frozen by this review.

### 6.2 Required scope fields (same discipline as Batch 1)

Before acquisition, every candidate needs:

```text
batch_id
event_id
security_id
issuer
candidate_document_id
candidate_url
document_type
document_role
observation_policy
selection_reason
expected_exception_category (if any)
```

Document identity and content hash become stable only after official snapshot
acquisition under a later authorized step. Do not invent hashes.

### 6.3 Diversity checklist for candidate selection

Candidates should collectively stress:

| Axis | Intent |
|---|---|
| Issuer not yet covered | Close 14-issuer path gap (285A) |
| Layout not identical to Batch 1 | Adapter/selector generalization |
| JGAAP and IFRS | Accounting evidence |
| Actual + forecast | Taxonomy separation |
| Interim and/or FY | Period basis |
| Revision or newly disclosed | No fabricated prior |
| Deferred guidance (if present) | No null/zero forecast invention |
| Review-only / exception | Status without numeric Fact |
| Multi-document Event (if available) | Relation without overwrite |
| Natural Gemini/official difference (if available) | Reconciliation without auto-resolve |

If a natural Gemini/official numerical difference cannot be found in preflight,
Batch 2 must return **MODIFY** for that reconciliation objective rather than
manufacture a conflict. Batch 1 remained `official_only`; that residual is an
explicit Batch 2 preflight item, not a reason to invent conflict rows.

## 7. Selector design inheritance

Reuse Batch 1’s additive location models:

- `single_page`
- `page_table_row`
- `multi_page_same_table`
- `section_range`

Matching remains conjunctive evidence (no ordered first-match fallback).
Uniqueness is mandatory. Ambiguity is fail-closed.

New selectors, if required for Batch 2 layouts, follow:

```text
propose fixture → unique PDF evidence → selector review → GO → only then execute
```

Do not widen Batch 1 frozen selectors to make a new Document pass.

## 8. Negative tests (elevated)

Batch 2 Negative Test review must include Batch 1 cases plus layout-stress
cases such as:

```text
正しい資料だが期間が違う
正しい期間だが単位が違う
正しい表だが行が違う
actualとforecastが混在する曖昧候補
同一資料内に複数候補
証跡位置（page/section/table/row）が一致しない
PDF hashが変わっている
scopeに存在しないDocument / Event
unsupported adapter profile
duplicate candidate identity
unresolved conflict auto-resolution attempt
```

Acceptance criterion for each:

```text
Fact = 生成されない
```

“Can extract correctly” is insufficient without “does not extract incorrectly.”

## 9. Immutable baselines Batch 2 must preserve

Any later Batch 2 execution must prove unchanged:

- Gemini ledger SHA-256
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`
- 345 official Events and Event reconciliation
- Existing canonical Financial Facts (64, plus Accepted Batch 1 additive
  namespace remains separate unless a later Human decision promotes it)
- Batch 0 Pilot output digests / 11 Observations
- Frozen Batch 1 scope SHA and Batch 1 snapshot hashes
- No out-of-scope Observation/Fact emission

## 10. Residual risks / MODIFY items

This Design Review is **not** GO for execution because:

1. Batch 2 scope candidates are not yet listed or Human-reviewed.
2. Cardinality and diversity mix are not frozen.
3. 285A coverage path is identified as necessary but not yet selected.
4. Natural Gemini/official conflict availability is still unproven for Batch 2.
5. No Batch 2 selector fixtures exist yet (and must not be coded before scope
   freeze + selector review).
6. No Batch 2 output namespace is authorized.

## 11. Explicit prohibitions (now)

- Batch 2 scope freeze without Human Architect review of candidates
- PDF re-fetch / snapshot replacement for Batch 0 or Batch 1
- Adding Batch 0 Documents into Batch 2 scope
- Replacing Batch 1 Documents to pass new selectors
- Fact extraction, fan-out to remaining Events, Batch 3 start
- Analysis, price reaction, win-rate, expectancy, ranking, trading rules
- Commit creation as part of this design step

## 12. Next concrete work (authorized as design only)

```text
Create Batch 2 scope *candidates* for Human Architect review.
```

Candidate work may:

- enumerate Universe Events/Documents from existing Event SoT and official
  disclosure indexes
- mark proposed diversity axes and expected exception categories
- exclude Batch 0 / Batch 1 frozen members
- highlight the 285A gap

Candidate work may **not**:

- write a frozen scope SHA as authoritative
- acquire PDFs
- implement Batch 2 selectors
- generate Observations / Financial Facts

## 13. Verdict

```text
Design principles:     ACCEPTED
Gate sequence:         ACCEPTED
Execution:             NOT AUTHORIZED
Scope freeze:          NOT STARTED
Next step:             Batch 2 scope candidate list for Human review
```

**MODIFY** until Human Architect reviews and freezes a Batch 2 scope (+ SHA).
Only after that freeze may selector design for Batch 2 begin.
