# Financial Fact Fan-out Batch 3 Design Review

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH3-001`  
**Date:** 2026-08-16  
**Scope:** Design review only — no scope freeze, PDF acquisition, selector coding, or Fact extraction  
**Prerequisite:** Batch 0 / Batch 1 / Batch 2 Accepted / Frozen  
**Verdict:** **READY FOR APPROVE / MODIFY / REJECT**

## 1. Current Frozen Baseline

```text
Batch 0          ACCEPTED / FROZEN
Batch 1          ACCEPTED / FROZEN
Batch 2 (285A)   ACCEPTED / FROZEN
Batch 3          NOT AUTHORIZED
```

Authoritative acceptance records:

- Batch 1: `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH1-001`
- Batch 2: `SWING-ACCEPT-FINANCIAL-FACT-FANOUT-BATCH2-001`

Immutable inputs that Batch 3 design must not change:

```text
Batch 0 frozen artifacts
Batch 1 frozen artifacts
Batch 2 frozen artifacts
existing canonical / V002 Facts (64)
Gemini raw ledger
Event reconciliation
official Event SoT (345)
```

This review creates **scope candidates only**. It does not freeze a Batch 3
scope, generate a scope SHA, acquire PDFs, implement selectors, or emit Facts.

## 2. 14 issuer coverage (dual metric)

Human Architect selected dual coverage: Document-path and numeric-Fact are
reported separately.

| Security | Issuer path (fan-out) | Document-path | Numeric-Fact |
|---|---|---|---|
| 285A | Batch 2 | covered | covered |
| 3436 | Batch 0 | covered | covered |
| 4062 | Batch 1 | covered | covered |
| 5801 | Batch 1 | covered | covered |
| 5803 | Batch 1 | covered | covered |
| 6146 | Batch 1 | covered | covered |
| 6525 | Batch 1 | covered | covered |
| 6857 | Batch 0 | covered | covered |
| 6920 | Batch 1 | covered | covered |
| 7011 | Batch 0 | covered | covered |
| 7012 | Batch 1 | covered | covered |
| 7735 | Batch 1 review-only | covered | **uncovered** |
| 8035 | Batch 0 | covered | covered |
| 8306 | Batch 0 | covered | covered |

```text
Document-path coverage: 14 / 14
Numeric-Fact coverage:  13 / 14
Numeric gap:            7735 only
```

Implication:

- Batch 3 is **not** “find the missing 14th issuer.”
- Issuer fan-out Document-path completeness is already achieved.
- The remaining numeric gap (7735) is a review-only / relation problem, not a
  blank-slate issuer discovery problem.
- Batch 3 value is therefore **unvalidated PDF / selector / exception
  patterns**, not Fact-count growth for already-covered issuers.

## 3. Batch 3 purpose

Batch 3 should extend the Financial Fact foundation for the fixed 14-issuer
Universe while checking whether the fail-closed extraction path proven in
Batch 0–2 survives **different document forms**.

Priority order:

```text
1. unvalidated selector / PDF structure patterns
2. fail-closed inheritance under new layout stress
3. additive namespace hygiene vs V002
4. later remaining-Event cohorts (parent plan Phase VII / Batch 3 definition)
```

Do **not** treat simple duplicate extension of already-proven Batch 1 cover
tables as the main Batch 3 objective.

Parent plan (`SWING-DESIGN-FINANCIAL-FACT-FANOUT-001`) defines Batch 3 as
remaining Events in bounded cohorts. That remains a **later cohort** after a
first diversity / reliability cohort is designed, frozen, and accepted.

## 4. Candidate discovery summary

| Candidate | Local PDF | Existing Facts | Pattern value | Class |
|---|---|---|---|---|
| 7011 Q1 IFRS | yes (sample) | V002 + Batch 0 FY path (different PDF) | Batch 1 IFRS reuse without Non-GAAP | **Adopt** |
| 8035 H1 + FY revision | yes (sample) | V002 present; Batch 0 deferred path different | blank cover / mid-PDF revision / 億円 | **Adopt** |
| 7735 numeric gap / multi-doc | no (for non–Batch-1 Events) | Batch 1 review-only Document | relation / numeric gap | **Hold** |
| 8306 primary+review pair | no (non–Batch-0 Events) | Batch 0 covered | multi-doc relation | **Hold** |
| 4062 Q3 review-complete | no | Batch 1 covered | review-complete title | **Hold** |
| 8035 2027 Q1 | no | Batch 0 covered | index-only JGAAP Q1 | **Hold** |
| Frozen Batch 0/1/2 Documents | yes | Accepted Facts | regression mix | **Exclude** |
| Remaining-Event bulk first | mixed | n/a | premature fan-out | **Exclude** |

## 5. Adopt candidates (design recommendation)

### 5.1 7011 Mitsubishi Heavy Industries — Q1 IFRS

```text
Issuer / security:     7011
Event:                 official-event-6042eaef6808592b8e960199e4a45a90
Inventory Document:    financial-document-48720411595a52acba60202db3abfe07
Event SoT also cites:  doc-d17dcc4960ff506e9f866162018e48f0
Title:                 2027年3月期第1四半期決算短信〔IFRS〕(連結)
Local snapshot:        .../fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc.pdf
Content hash:          fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc
Inventory scope today: pilot_v002_only
PDF reacquisition:     forbidden for this review; snapshot already exists
```

| Axis | Finding |
|---|---|
| Document format | Horizontal cover tables; clean text layer |
| Accounting basis | IFRS / consolidated; **no** Non-GAAP header pair |
| Actual / forecast | Q1 cumulative actual + FY `通期` company forecast |
| Period | Actual end `2026-06-30`; FY forecast end `2027-03-31` |
| Unit | `百万円` on cover |
| Selector complexity | Low–medium; Batch 1 IFRS path reuse |
| Negative-test value | `事業利益` ≠ revenue; Q1↔通期 swap; discontinued-ops narrative |
| Provenance risk | `doc-*` vs `financial-document-*`; V002 already present |
| Gemini comparison | Available in Event reconciliation universe for 7011; not Fact input |
| Regression risk | Must not reuse / mutate Batch 0 7011 FY repair Document |

Why Adopt:

- Proves Batch 1 IFRS generalization **without** forcing Batch 2 C2+C3
  Non-GAAP header-map machinery onto every IFRS Document.
- Distinct from Batch 0’s 7011 FY repair PDF.
- Existing local official snapshot; no acquisition needed for later freeze
  consideration.

### 5.2 8035 Tokyo Electron — H1 + FY revision tables

```text
Issuer / security:     8035
Event:                 official-event-5097c451c2e6519c90e9bc23fc52def6
Inventory Document:    financial-document-d8af1ffc304451f89b1c10d79cdd6c6a
Event SoT also cites:  doc-bfbd66e8e5845552b00af0ceaf23dc05
Title:                 2025年3月期第2四半期(中間期)決算短信〔日本基準〕(連結)
Local snapshot:        .../88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c.pdf
Content hash:          88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c
Inventory scope today: pilot_v002_only
PDF reacquisition:     forbidden for this review; snapshot already exists
```

| Axis | Finding |
|---|---|
| Document format | Cover text largely empty; mid-PDF vertical revision blocks |
| Accounting basis | JGAAP / consolidated |
| Actual / forecast | 中間 actual + 通期 revised company forecast; prior forecast rows present |
| Period | H1 / Q2 cumulative `2024-09-30`; FY `2025-03-31` |
| Unit | Tables `百万円`; narrative `億円` / `兆円` |
| Selector complexity | Medium–high; new mid-doc fixtures likely |
| Negative-test value | Blank cover; 億円 narrative; 前回↔今回; 中間実績↔通期予想 |
| Provenance risk | V002 Facts already exist; identity hygiene required |
| Gemini comparison | Sparse / limited for 8035; do not invent conflict |
| Regression risk | Must not confuse with Batch 0 deferred-guidance 8035 Document |

Why Adopt:

- Highest remaining **new PDF-structure** stress among snapshot-backed
  candidates.
- Exercises blank-cover fail-closed, mid-document vertical revision labels,
  and 億円 narrative rejection without converting units.

## 6. Hold candidates

### 6.1 7735 SCREEN — numeric gap / multi-doc relation

- Batch 1 already has a frozen review-only Document path
  (`doc-520d79d15d665c72ad87fd20f69b611e`) with **0** numeric Facts.
- Closing the numeric-Fact gap may require a different primary Document and
  relation design; non–Batch-1 sibling Events lack local snapshots.
- Valuable for relation / review policy, not as the first numeric Batch 3
  cohort without acquisition authorization.

### 6.2 8306 MUFG — primary + review Event pair

- Issuer already covered via Batch 0.
- Multi-doc relation design value; snapshot acquisition not authorized.

### 6.3 4062 Ibiden — Q3 review-complete title

```text
Event:     official-event-8f70d727fd9e54ed9be059fa06e85d27
Document:  doc-d7723997699f5d36a7782a980e076d26
```

- Index-only; no local snapshot found.
- Negative-design for review-complete vs original disclosure; not an initial
  numeric Fact candidate.

### 6.4 8035 2027 Q1 — index only

```text
Event:     official-event-3c41b9e2f1d2583aae1eaccdb3338371
Document:  doc-6334a924109655239c6a433f1cd9694d
```

- JGAAP Q1 metadata only; table / guidance unproved.
- Prefer the snapshot-backed 8035 H1 candidate (§5.2) over acquisition-dependent
  Q1.

## 7. Exclude candidates

- Any Document already frozen in Batch 0, Batch 1, or Batch 2 scopes / outputs
- 7735 original Q1 sibling of the Batch 1 review Document (regression mix)
- Mass “remaining 345 Events” as the **first** Batch 3 cohort
- Blank-slate re-extraction that merges, replaces, or overwrites V002 64 Facts

## 8. Candidate comparison (reliability first)

Criterion used:

> Which candidate most increases overall Financial Fact foundation reliability?

| Rank | Candidate | Coverage value | Reliability / structure value | Recommendation |
|---|---|---|---|---|
| 1 | 7011 Q1 | Low (issuer covered) | High — Batch 1 IFRS reuse without Non-GAAP overfit | Primary adopt |
| 2 | 8035 H1 | Low (issuer covered) | Highest new layout stress among snapshots | Secondary adopt |
| 3 | 7735 numeric gap | High for numeric layer | Blocked by snapshot / relation design | Hold |
| 4 | 8306 / 4062 / 8035 Q1 | Low–medium | Index-only or relation-only | Hold |
| — | Remaining Events bulk | High count | Premature; fails diversity-first reliability | Exclude first |

## 9. Technical difficulty

### Selector reuse

| Candidate | Batch 1 reuse | C2+C3 applicability | New logic |
|---|---|---|---|
| 7011 Q1 | Yes — `single_page` actual + `page_table_row` FY | Do **not** force Non-GAAP header map | Likely none beyond additive fixtures |
| 8035 H1 | Partial — dual-layer whitespace / page_table_row concepts | Not Non-GAAP header map; vertical shape nearer Batch 2 B | Small additive mid-doc revision-row fixtures |

### PDF / table structure risks to carry forward

```text
whitespace collapse vs numeric whitespace preservation
column boundary / adjacent %
header mapping (only when source proves it)
period row uniqueness
actual / forecast separation
IFRS / JGAAP / Non-GAAP
百万円 / 億円 (no conversion inference)
table end dependency forbidden
blank-cover false PASS
revision prior / revised / actual swap
```

### Fail-closed inheritance

Batch 3 must keep Batch 0–2 fail-closed cases:

```text
multiple match
missing evidence
missing label
unit mismatch
period mismatch
wrong page
wrong section
wrong table
wrong row
hash mismatch
scope mismatch
```

plus candidate-specific negatives listed in §5.

## 10. Cursor independent review (reference only)

Independent technical review sources:

- coverage map: [Map issuer coverage](66a599ae-bfc0-48b3-9459-2b5a9e78de3e)
  (corrected: Batch 2 is Accepted / Frozen; dual coverage applied)
- pattern ranking: [Assess candidate technical patterns](b6caa0ca-e0d8-4236-a208-c3032dcdc579)

This section is Cursor’s technical opinion, **not** a Human Architect decision.

### Required answers

1. **Which issuer / Document to prioritize?**  
   7011 Q1 IFRS first; 8035 H1 second.

2. **Technical reason?**  
   7011 proves Batch 1 IFRS without Non-GAAP overfit; 8035 adds blank-cover and
   mid-PDF revision stress unavailable in Batch 0–2 Accepted paths.

3. **Different document forms vs Batch 0–2?**  
   Yes for 8035 H1. Partially for 7011 (same family as Batch 1 IFRS, but not
   Batch 2 Non-GAAP and not Batch 0 7011 FY repair).

4. **Reuse existing selector structure?**  
   7011: yes, Batch 1. 8035: partial reuse; not full C2+C3 Non-GAAP map.

5. **New selector logic needed?**  
   7011: likely no. 8035: small additive fixtures likely.

6. **Minimal new design if needed?**  
   Mid-document page + revision-row markers (`今回修正予想` / `実績`) +
   blank-cover fail; no new parser stack.

7. **Fail-closed risks?**  
   V002 auto-merge; forcing C2+C3 onto all IFRS docs; 億円 narrative bind;
   prior/revised swap; identity `doc-*` vs `financial-document-*`.

8. **Regression risk to Batch 0–2?**  
   High if validators are widened globally or frozen Documents are re-listed.
   Low if Batch 3 stays additive-namespace-only.

9. **14 issuer coverage contribution?**  
   Document-path: none needed. Numeric-Fact: does not close 7735 gap unless a
   later Hold is authorized. Reliability contribution is the primary value.

10. **Overlooked risks?**  
    Treating parent-plan “remaining Events” as the first Batch 3 action;
    inventing Gemini conflicts; blank-slate V002 overwrite for sample PDFs.

11. **Recommended order?**  
    7011 Q1 → 8035 H1 → optional relation Holds after snapshot authorization.

12. **Why not start Batch 3 execution now?**  
    No Human-approved Batch 3 design / frozen scope / selectors exist.
    Execution remains unauthorized by Batch 2 Acceptance.

## 11. Recommended candidate and alternatives

### Recommended first Batch 3 design cohort

```text
1) 7011 Q1 IFRS
2) 8035 H1 + FY revision tables
```

Both use **existing** local official snapshots. Both require additive
namespace treatment and explicit non-merge with V002 64 Facts.

### Alternatives / Holds

```text
7735 numeric-Fact gap / multi-doc relation
8306 multi-doc pair
4062 review-complete
8035 2027 Q1 (index-only)
```

### Explicit non-recommendation as first action

```text
remaining-Event bulk fan-out
re-opening Batch 0 / 1 / 2 frozen Documents
```

## 12. Batch 3 proposed scope (candidates only)

Proposed fields for a later Human-reviewed freeze (not written as a frozen
file in this step):

```text
batch_id: financial-fact-fanout-batch3-001 (proposed)
max_documents: small bounded cohort (suggested 1–2 snapshot-backed docs)
treatment_of_existing_v002_facts: additive_namespace_verification_only
v002_facts_replace_merge_or_mutate: false
batch0_immutable / batch1_immutable / batch2_immutable: true
pdf_acquisition_forbidden_for_snapshot_backed_candidates: true
execution_forbidden_until_selector_GO: true
```

Candidate A (recommended):

```text
security_id: 7011
event_id: official-event-6042eaef6808592b8e960199e4a45a90
related inventory: financial-document-48720411595a52acba60202db3abfe07
existing snapshot hash: fccc0be04fbc1b9c927a652801339d92e789d3aac37e79122961681f173fafcc
expected axes: IFRS Q1 actual + FY company forecast
```

Candidate B (recommended secondary):

```text
security_id: 8035
event_id: official-event-5097c451c2e6519c90e9bc23fc52def6
related inventory: financial-document-d8af1ffc304451f89b1c10d79cdd6c6a
existing snapshot hash: 88fe102c11e8b98fd7dc34ba0fe8d458d5d3825ebfb207cca8fd6777d6696e4c
expected axes: H1/中間 actual + FY revised forecast; revision negatives
```

No scope SHA is generated here. Identity hygiene (`doc-*` vs
`financial-document-*`, additive `issuer` / `document_role` /
`observation_policy`) must be decided before any later freeze, following the
Batch 2 precedent.

## 13. Human Architect decisions requested

1. Accept, modify, or reject the dual-coverage framing (14/14 Document-path;
   13/14 numeric-Fact; 7735 gap Hold).
2. Accept or modify the Batch 3 purpose shift from issuer-gap closing to
   unvalidated-pattern reliability.
3. Decide whether the first Batch 3 cohort is:
   - 7011 only;
   - 7011 + 8035;
   - or a different Hold candidate (e.g. 7735 relation path).
4. Confirm additive-only / non-merge treatment for any candidate that already
   has V002 Facts.
5. Decide whether index-only Holds may enter a later freeze only after
   authorized snapshot acquisition.
6. Decide whether parent-plan remaining-Event cohorts wait until after the
   first diversity cohort is Accepted / Frozen.
7. Refuse execution, selector implementation, and Commit until a separate
   scope-freeze decision.

## 14. Stop state

```text
Batch 0          ACCEPTED / FROZEN
Batch 1          ACCEPTED / FROZEN
Batch 2          ACCEPTED / FROZEN
        ↓
Batch 3 Design Review
        ↓
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
Reconciliation run:        0
Commit:                    0
```

**Human Architect approval is required before any Batch 3 scope is fixed or
executed.**
