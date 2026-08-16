# Financial Fact Fan-out Batch 4 — Named Cohort Selection Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-NAMED-COHORT-SELECTION-001`  
**Date:** 2026-08-16  
**Stage:** Cohort selection only — no Scope Freeze, acquisition, selector work, extraction, or Commit  
**Verdict:** **APPROVE — Inventory-only named cohort**

Independent evidence:
- [Assess cohort strategy](4c4d391b-ade2-438d-a395-b038eb534e7e)
- [Find cohort candidates](e4fcd431-26eb-4256-960d-042db1e954cc)
- Event/document pointer check for 5803 2026年3月期 Q1–Q3

## 1. Strategy

```text
Strategy: D hybrid, inventory-constrained
         = name a small remaining-Event cohort
         + Phase I Inventory first
         + promote only track-A / classified candidates later

Not:      investment/business-priority selection
Not:      technical-debt / unsupported-pattern-first selection
Not:      immediate Fact extraction on remaining Events
```

Business priority would import future Analysis value into the Fact-layer
selection rule. Technical debt may require relation or selector redesign and is
therefore not suitable for the first bounded cohort. Pure “small remaining-Event
cohort → extract Facts now” is also rejected while terminal states and hashes
are missing.

## 2. Selected named cohort

```text
Name:
5803 2026年3月期 標準JGAAP四半期 Inventory Cohort
```

| Event | Period | TDnet primary Document | Source | URL |
|---|---|---|---|---|
| `official-event-51acad93687c5010b1dd6baef0d4faff` | Q1 cumulative / 2025-06-30 | `doc-8cc5ba087bc65cad9b57aadbb7802607` | `source-2b23ab0f482350c79fc004aa1cdc58cc` | https://www2.jpx.co.jp/disc/58030/140120250806532719.pdf |
| `official-event-d07fea2491fa5707a32e077f34c83e0d` | Q2 cumulative / 2025-09-30 | `doc-c13419293b865b8eb1f83311dd0b2660` | `source-5467c1d629be5c189f23fb3a195121dc` | https://www2.jpx.co.jp/disc/58030/140120251106589866.pdf |
| `official-event-d01b67f7bdd85249ac0800fac0ed3bb5` | Q3 cumulative / 2025-12-31 | `doc-1467205d56d15181a56a163e278528e2` | `source-89063a6de9595fa5a9255c182dabdd4d` | https://www2.jpx.co.jp/disc/58030/140120260206550168.pdf |

Current classification for all three: work track **B** / terminal **`not_investigated`** (`content_hash=null`).

Each candidate has a single primary TDnet earnings-release titled 決算短信〔日本基準〕(連結), JGAAP consolidated Event identity, and a common issuer / fiscal-year sequence. They are additive versus Batch 0–3 and distinct from the frozen Batch 1 5803 FY2027 Q1 Document. None is Fact-ready; none may enter extraction today.

Optional FY full-year Event `official-event-9c1cc9f8f5075cad93a05b0ef31b96bb` is **not** in this named selection unless Human Architect expands the cohort.

## 3. Boundary

**PASS.** The selected work is Inventory-only:

```text
Event identity
→ TDnet primary Document identity
→ official snapshot and content hash
→ terminal inventory state
```

It does not create a Fact, Observation, derived feature, Ranking, Trading
Rule, PFOS Evaluation, or Decision.

## 4. Risk

**Present but bounded.**

- The Documents may prove unavailable, ambiguous, or unsupported after source
  inspection.
- A common issuer does not prove a common selector layout.
- Q1 / Q2 / Q3 must remain distinct cumulative periods.
- The existing 5803 Batch 1 2027 Q1 Document is frozen and is not a template
  source or scope member.

## 5. Promotion rule

No candidate becomes a Batch 4 Fact Scope Proposal unless it is:

```text
work track = A
terminal state = classified
official snapshot + SHA-256 = verified
Document / Event identity = unique
selector pattern = separately approved and fail-closed
```

Candidates that are `review_required`, `source_unavailable`, `not_listed`,
`parse_error`, or selector-unsupported remain outside any Fact extraction
scope.

## 6. Explicit exclusions

```text
7735 numeric / multi-document relation
8306 primary+review relation
4062 review-complete index-only path
8035 index-only Q1 path
all Batch 0–3 frozen Documents
Analysis / Ranking / Trading / PFOS / ASA Decision
```

## 7. Frozen Base impact

None. Batch 0–3 scopes, PDFs/hashes, outputs, provenance, V002, Event SoT,
and Gemini ledger remain read-only.

## Stop state

```text
Batch 4 named cohort selected
        ↓
Inventory-only authorization required
        ↓
(after Inventory terminal states) separate Scope Proposal decision
```

This selection is not a Batch 4 Scope Freeze and does not authorize source
acquisition, selector implementation, Fact extraction, Acceptance, or Commit.
