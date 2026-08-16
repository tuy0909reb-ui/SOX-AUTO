# Financial Fact Fan-out Batch 1 Implementation Plan

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH1-001`  
**Date:** 2026-08-16  
**Scope:** Plan only; no document acquisition, extraction, or fan-out  
**Verdict:** **GO — eligible for scope-freeze approval only**

## 1. Purpose and fixed boundary

Batch 1 tests whether the Batch 0 Inventory-driven pipeline generalizes to a
small, deliberately diverse set of real official documents outside the fixed
seven-PDF regression scope. It is not a population collection.

The immutable input boundary remains:

- fixed 14-security Universe;
- 345 existing official Event identities since 2020-01-01;
- Gemini raw CSV and its SHA-256;
- Event reconciliation;
- existing 64 canonical Observations;
- Batch 0 Inventory/Documents/snapshots and 11 Pilot Observations.

Canonical official Financial Observations remain the Fact SoT. Gemini is
discovery/reconciliation material only; it is never primary numeric evidence.

## 2. Proposed Batch 1 scope

The target is **8 Events and at most 12 official Documents**. The limit is
intentional: enough diversity to challenge the adapter architecture, small
enough that every candidate can receive Human review.

Before any source acquisition, create and approve
`financial_fact_batch1_scope.json` with exactly:

```text
batch_id
event_id
security_id
issuer
candidate_document_id
candidate_url
expected_document_type
expected_document_role
expected_observation_policy
selection_reason
expected_exception_category
```

No candidate may enter Batch 1 until all fields are populated from existing
Event SoT and an official issuer/TDnet disclosure index. A Document ID is
stable only after its official snapshot hash is known; until then the scope
records a candidate identity and acquisition state, never an invented hash.

### Selection composition

The eight Events must collectively include:

1. at least four issuers outside the Batch 0 issuer/document-layout pairings;
2. both JGAAP and IFRS; include USGAAP only if an official candidate exists;
3. actual plus company forecast;
4. one explicit prior→revised pair or a documented revision status;
5. one newly disclosed or next-quarter/interim forecast;
6. at least two distinct `period_basis` values beyond Batch 0’s primary rows;
7. one multi-document Event (release plus revision/correction/review or
   verified duplicate source);
8. one documented ambiguity/exception that is expected to enter review rather
   than silently emit a Fact;
9. one Event with a Gemini row and one official-only Event where available;
10. one naturally occurring, source-preserved Gemini/official numerical
    difference. If preflight cannot identify such a case, Batch 1 must return
    `MODIFY`; it must not manufacture a conflict.

The existing non-Pilot source documents (8035 2024-11-12, 285A, and 7011
2026-08-04) are discovery references only. They are not automatically Batch 1
members. Inclusion requires the same scope-freeze fields and approval.

## 3. Document discovery and acquisition

For each frozen Event:

1. inspect the official issuer IR / TDnet index around the approved Event
   publication window;
2. inventory earnings release, forecast revision, correction/supplement,
   review-only, management target/plan, and relevant official guidance;
3. record all candidates before parsing a numeric value;
4. classify candidate title and relationship conservatively;
5. acquire only approved candidates from issuer IR / TDnet primary sources;
6. content-address each retrieved PDF by SHA-256 and create Source and
   Inventory relations;
7. retain failures as `source_unavailable`, `not_investigated`, `not_listed`,
   or `parse_error`.

EDINET can support discovery or provenance but does not automatically replace
the official earnings disclosure. Gemini, IRBANK, and news services remain
discovery/reconciliation-only. No absent Document is synthesized.

## 4. Adapter dispatch and extraction

Dispatch uses only canonical Inventory metadata:

```text
issuer + document_type + document_role + observation_policy
```

The common builder receives source text candidates and validates taxonomy,
period, unit, identity, and provenance. It contains no issuer, URL, Event ID,
page position, output number, fiscal date, or label constant.

Issuer/document exceptions are adapter-owned and require:

- raw label/table mapping;
- fixture PDF snapshot;
- expected canonical taxonomy or explicit review outcome;
- regression test.

For every supported row, extraction preserves raw value/unit text and emits
only `actual`, `company_forecast`, `prior_forecast`, `revised_forecast`,
`newly_disclosed`, `management_target`, or source-proved document-status
relations. Unsupported cases emit a terminal review state, not a guessed Fact.

## 5. Period, accounting, and unit rules

Batch 1 verifies Q1/Q2/Q3 standalone, cumulative, full-year, and forecast
period handling where sources permit. `period_basis`, `forecast_scope`,
Observation `fiscal_period_end`, and immutable Event
`event_fiscal_period_end` are independently evidenced.

Accounting standard and consolidation are source-proved. Similar labels are
not sufficient to equate accounting concepts (for example, IFRS business
profit and JGAAP operating profit).

The unit registry must preserve raw unit and use only approved conversion
rules. Planned recognized output units include JPY million, JPY hundred
million, JPY trillion, JPY per share, percent, and share count. Unknown units
emit `unit_unverified` and no normalized numeric Fact.

## 6. Revision, guidance, and multi-document rules

- A prior→revised pair requires explicit before/after evidence and chronology.
- A forecast with no official prior is `newly_disclosed`, never a revision
  pair.
- Deferred/withdrawn FY guidance is a document-level guidance-status relation;
  it does not create a null/zero FY forecast.
- Management target, review-only, actual, and company forecast remain distinct.
- Multiple revision documents form ordered relations; later documents do not
  overwrite prior Observations.
- Same hash creates one canonical extraction Document plus source links.
  Different bytes or unclear relationship remain unresolved/review-required.

## 7. Gemini reconciliation plan

Reconciliation runs only after official Observation validation. It writes
`financial_observation_reconciliation`, never Event reconciliation or Gemini
raw.

Matching requires all applicable dimensions:

```text
security, Event/document linkage, metric mapping, measure kind,
forecast scope, period basis, fiscal period end, accounting basis,
consolidation, raw/normalized unit
```

Allowed states are `exact`, `candidate`, `conflict`, `official_only`,
`gemini_only`, and `unresolved`. A conflict retains both source texts,
values/units, source IDs, and difference note; neither value is auto-promoted.

## 8. Idempotency, regression, and negative tests

Reprocessing an identical Source/Document must be a no-op for Document,
Observation, source-link, and reconciliation identity. No prior Fact may be
deleted to achieve idempotency.

Batch 1 must retain Batch 0 negative tests and add fixtures for:

- same canonical metric name with different accounting concept;
- same period label with different cumulative/standalone basis;
- revision wording without a source-proved prior;
- unverified unit;
- unproved fiscal period end;
- multiple Documents per Event;
- same-content duplicate source;
- Gemini-only numeric text without official evidence;
- real Gemini/official conflict selected in preflight.

Before/after digests must prove unchanged Gemini raw/SHA, 345 Events,
Event reconciliation, existing 64 canonical Observations, Batch 0 11
Observations, and pre-existing Document ID/URL/hash/snapshot relations.

## 9. Acceptance criteria and stop conditions

Batch 1 may be **GO** only if all selected Documents:

- dispatch through Inventory metadata;
- have hash-backed source and complete Observation provenance;
- preserve taxonomy, period, accounting, and unit evidence;
- are idempotent across a second run;
- retain independent Gemini reconciliation;
- pass negative controls and immutable-baseline regression.

Return **MODIFY** immediately for unknown taxonomy, adapter/generalization
failure, missing provenance, unresolved period/unit/accounting evidence,
ambiguous duplicate/revision, or insufficient reconciliation evidence.

Return **STOP** for Gemini/raw/Event/existing-Fact mutation, hash mismatch
ignored by the pipeline, unproven canonical Fact creation, or fail-open
behavior.

## 10. Rollback and Batch 2 entry

There is no destructive rollback. Failed Batch 1 candidates remain additive
Inventory/review records; valid prior Facts remain unchanged. A corrected
Document or Source creates an additive relation and explicit chronology.

Batch 2 cannot begin until Human Architect accepts:

1. the Batch 1 coverage and unresolved queue;
2. the natural Gemini/official conflict review;
3. all new adapter fixtures and fallback rate;
4. any proposed taxonomy escalation;
5. immutable-baseline and idempotency evidence.

## Final boundary

Batch 1 is a plan only. Before Human Architect approval of the fixed Batch 1
scope record, this document authorizes **no** PDF acquisition, Document
inventory expansion, Fact extraction, reconciliation run, or fan-out.
No analysis, price-reaction, win-rate, ranking, or trading work is authorized.
