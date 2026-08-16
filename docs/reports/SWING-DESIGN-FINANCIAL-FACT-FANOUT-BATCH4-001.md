# Financial Fact Fan-out Batch 4 — Design Review 001

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH4-001`  
**Date:** 2026-08-16  
**Stage:** Design Review only — no Scope Freeze, selector work, extraction, or Commit  
**Verdict:** **HOLD**

## Context

```text
Batch 0–3: ACCEPTED / FROZEN / COMMITTED
Commit:    cc7bea177a307417911c1c10857ee278a29ec723
Meaning:   Frozen Financial Fact Base only
```

Independent evidence: [Assess Batch 4 scope](f6bb9572-685e-4028-be18-0344786abd65)

## Design principle

Batch 4 remains inside Financial Fact Fanout only:

```text
Fact acquisition
Fact organization
provenance
Document / Event / Selector chain
```

Excluded:

```text
Fact interpretation / Feature generation
Ranking / Trading Rule
PFOS Evaluation / Decision
ASA Decision Record
```

## Candidate evaluation

| Candidate | Judgment |
|---|---|
| A. Additional Financial Fact collection | **Preferred direction**, but only as a **bounded cohort** |
| B. Derived Observation from existing Facts | **Reject for Batch 4** — Analysis-boundary risk |
| C. Analysis Featureization | **Out of Fanout scope** |
| D. Other | Split tracks: Fact cohort / selector-pattern review / 7735 relation review |

## Review result

### 1. Scope — PASS (with bound)

Batch 4 may be defined as additive Fact collection. It must **not** mean “collect all remaining Events in one shot.” Parent plan and Batch 3 design already deferred remaining-Event work as later **bounded cohorts**.

### 2. Frozen boundary — PASS

Batch 0–3 stay immutable. Batch 4 uses a new scope, new snapshots (when authorized), new selectors, and a new additive output namespace. No merge/replace/reopen of frozen Batch 0–3 Documents or V002 Facts.

### 3. Remaining-scope classification

| Item | Classification | Reason |
|---|---|---|
| Uncollected Events (~328) | **Batch 4 candidate** after Inventory/snapshot gates | Fact-layer population; must be cohort-sized |
| Unsupported selector patterns | **Separate Review / Hold** | Need fail-closed fixtures before membership |
| 7735 review-only numeric gap | **Separate Review / Hold** | Relation / primary-vs-review design, not blank issuer discovery |
| 8306 / 4062 / index-only Holds | **Hold** until source+relation GO | Same class as Batch 3 Holds |

### 4. Analysis boundary — PASS

Analysis Feature, Ranking, Trading Rule, PFOS Evaluation, and Decision remain **out of Batch 4**.

### 5. Architecture risk — present

- Premature bulk fan-out without Inventory terminal states  
- Closing 7735 by coercing review-only into numeric Fact  
- Selector-pattern sprawl without negatives  
- `doc-*` / `financial-document-*` auto-equate  
- Using Batch 4 as a gateway into Analysis → Ranking → Decision  

Batch 0–3 impact of this Design Review: **none** (read-only baseline).

## Final recommendation

```text
Batch 4 Design: HOLD
```

Conditions before any Scope Freeze:

1. Human Architect chooses Batch 4 first deliverable:  
   (a) small remaining-Event Fact cohort, or  
   (b) Phase I Inventory completion for a named cohort before numeric Facts.  
2. Explicit candidate list with Event/Document identities and exclusion list.  
3. 7735 kept out of the first Batch 4 freeze pending Separate Relation Review.  
4. Unsupported selector patterns stay out until Separate Review GO.  
5. Additive / non-merge / official-only / Gemini-not-input gates restated in the Freeze record.  
6. No Analysis / Ranking / Trading / PFOS Decision / ASA Decision in Batch 4 Authorization.

## Stop state

```text
Batch 0–3 Frozen Fact Base
        ↓
Batch 4 Design Review
        ↓
HOLD
        ↓
Human Architect APPROVE / MODIFY / REJECT
        ↓
(only then) Scope Proposal / Scope Freeze
```

No Scope Freeze, PDF work, selector implementation, Fact extraction, or Commit is authorized by this record.
