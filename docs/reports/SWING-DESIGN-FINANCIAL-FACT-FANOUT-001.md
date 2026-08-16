# Financial Fact Fan-out Implementation Plan

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-001`  
**Date:** 2026-08-16  
**Scope:** Implementation plan only; no collection, snapshot acquisition, or Fact
generation is authorized by this document  
**Verdict:** **GO — eligible for Human Architect authorization of staged fan-out**

## 1. Scope and preservation boundary

The planned collection population is the immutable 14-security, 345-event
`official_earnings_event` relation. Processing is additive:

```text
Event (immutable)
  → Financial Document Inventory
  → official Source / content-addressed snapshot
  → Inventory-selected adapter
  → canonical Financial Observation and supporting relations
```

The plan must not:

- create, merge, delete, or overwrite Event IDs;
- mutate Gemini raw CSV or its hash;
- mutate Event reconciliation;
- delete or regenerate the existing 64 canonical V002 observations;
- infer a missing number, unit, period, or document;
- calculate returns, surprise, ranking, signals, or trading rules.

## 2. Processing unit and relations

The processing unit is an Inventory Document, not an Event and not a URL.
Each Inventory Document has one `document_id`, one primary source relation,
zero or more supporting-source relations, and zero or more Observations.

An Event can have:

- an `earnings_release` / `primary_result` document;
- a companion `forecast_revision` / `revision_detail` document;
- supplementary or presentation documents;
- correction or `restatement_or_review` documents;
- management-target or plan material;
- unresolved candidate documents that remain in Inventory without becoming
  Observations.

Document duplicates are handled by content hash and source links. Identical
bytes across issuer/TDnet paths result in one canonical extraction Document
and multiple provenance links. Different bytes, unclear titles, or unclear
period identity remain `review_required`; they are not auto-merged.

## 3. Document Inventory completion

For every Event, Phase I creates a bounded official-document sweep:

1. Start with the existing official release pointer and title.
2. Query the pre-approved issuer IR / TDnet disclosure index around the Event
   publication window.
3. Record every official candidate before numerical parsing.
4. Classify conservatively as `earnings_release`, `forecast_revision`,
   `earnings_presentation`, `supplementary`, or `other`; classify document role
   independently.
5. Search explicitly for title patterns for forecast revisions, corrections,
   review completion, supplementary materials, targets/plans, and later
   corrections.
6. Link a candidate to an Event only with issuer, title/reference, covered
   period, and chronology evidence. Date alone is insufficient.

Every candidate receives a terminal Inventory state:
`classified`, `review_required`, `source_unavailable`, `not_investigated`, or
`not_listed`. Absence of a revision notice is recorded as a completed search
state, not a fabricated Document.

## 4. Source acquisition and snapshots

Source priority remains:

1. issuer IR / official PDF or XBRL;
2. TDnet / JPX official copy;
3. EDINET only as relevant filing support;
4. Gemini raw, IRBANK, and news services only as discovery or reconciliation
   aids, never unconditionally as primary Fact evidence.

Each accepted primary source is stored content-addressed. The source relation
must contain `source_id`, URL, provider, retrieval time, SHA-256
`content_hash`, and `local_snapshot_path`; the Inventory Document cites the
selected source. Existing snapshots are verified, never silently replaced.

Fetch failures create `source_unavailable`, `not_investigated`, or
`parse_error` records with reason/evidence. They never create zero-filled
Observations.

## 5. Adapter architecture

Dispatch is Inventory-driven:

```text
issuer + document_type + document_role + observation_policy
  → document adapter
  → issuer/layout adapter (if needed)
  → table-label normalizer
  → common observation builder
  → validation or review queue
```

The common builder contains only contract validation, identity construction,
unit conversion, source-provenance linking, and period proof. It must not
contain issuer name, Event ID, URL, page coordinate, fixed output value, or
fiscal-period date.

Document-specific patterns, issuer vocabulary, and presentation quirks belong
to adapters. Each added adapter requires representative local fixtures and
tests. The seven-PDF Pilot remains a permanent regression fixture for:
6857 revision, 8035 deferred guidance, 3436 newly disclosed forecast, 8306
management/review policy, and 7011 IFRS/repair evidence.

## 6. Taxonomy and period rules

`financial_fact_contract.py` is authoritative. The extractor must preserve
raw label, value token, unit token, source table/row, and evidence text before
assigning canonical taxonomy.

Rules:

- `actual` requires a source-proved realized covered period.
- `company_forecast` requires issuer forecast language and a proved target
  period; newly disclosed forecasts use
  `revision_relation=newly_disclosed`, never a synthetic prior.
- `prior_forecast` and `revised_forecast` require explicit before/after
  evidence. Their direction remains `up`, `down`, `unchanged`, `mixed`, or
  `unknown` with raw wording.
- `management_target` is not a company forecast. `review_value` requires a
  source-displayed numeric value; review-only documents may have no numeric
  Observation.
- deferred / withdrawn guidance is a canonical document-level guidance-status
  record, not a null-valued forecast Observation.
- `period_basis` describes cumulative/standalone/full-year accumulation;
  `forecast_scope` describes horizon; neither substitutes for the other.
- Observation `fiscal_period_end` is proven from the source. It remains
  distinct from immutable Event `event_fiscal_period_end`.
- Unproved unit uses `unit_unverified` and must not produce a normalized
  numeric Fact. Unproved accounting or consolidation is `unknown` / review,
  not guessed.
- `as_of_timestamp` remains null unless an official source proves a time.

Taxonomy not in the contract triggers `MODIFY`; it is never coerced into a
convenient existing category.

## 7. Staged execution plan

### Phase I — Inventory completion

**Input:** frozen 345 Events and official disclosure indexes.  
**Output:** candidate Financial Document Inventory and document/source links.  
**Accept:** each Event has a primary-document search terminal state; revision,
supplemental, review, correction, and target/plan discovery has run.  
**Stop:** ambiguous Event linkage, unknown duplicate identity, or missing
primary-source evidence.

### Phase II — Source snapshot acquisition

**Input:** classified accepted Inventory candidates.  
**Output:** content-addressed official snapshots and verified source metadata.  
**Accept:** each accepted candidate hash-matches its local snapshot.  
**Stop:** retrieval failure, changed bytes for an existing source without a new
Source row, or untrusted provider.

### Phase III — Classification and adapter dispatch

**Input:** hashed Inventory Documents.  
**Output:** adapter assignment or explicit fallback/review state.  
**Accept:** dispatch uses Inventory metadata only; no fallback silently emits
Facts.  
**Stop:** missing adapter profile, ambiguous role/policy, or high fallback
rate above the batch threshold.

### Phase IV — Observation extraction

**Input:** adapter-assigned documents.  
**Output:** additive canonical Observations, source links, guidance/revision
relations, and review records.  
**Accept:** every numeric Fact has raw token, unit, source row/table, period
evidence, and one primary Document link.  
**Stop:** inferred value/period/unit, taxonomy ambiguity, or duplicate
Observation identity.

### Phase V — Evidence and provenance validation

**Input:** extracted Observations and Inventory.  
**Output:** per-document validation ledger and unresolved queue.  
**Accept:** snapshot hash, Document/Source/Event chain, schema, unit, period,
accounting, and duplicate checks all pass.  
**Stop:** orphaned Observation, mismatched hash, invalid source chain, or
unresolved evidence promoted as a Fact.

### Phase VI — Financial Observation reconciliation

**Input:** validated official Observations and immutable Gemini raw.  
**Output:** `financial_observation_reconciliation` only.  
**Accept:** matching uses security plus documented metric/period/measure
dimensions, never date alone; one Gemini row may link to N Observations.  
**Stop:** an ambiguous or conflicting match is auto-resolved, or Event
reconciliation/Gemini raw is written.

### Phase VII — Completeness and anomaly review

**Input:** terminal states for Inventory and Observations.  
**Output:** coverage report, unresolved inventory, fallback report, and batch
gate decision.  
**Accept:** all candidates have terminal state and all batch thresholds pass.  
**Stop:** material unexplained coverage loss, high adapter fallback,
unbounded exception growth, or unreviewed conflicts.

## 8. Batch strategy

No production-scale one-shot extraction is permitted.

1. **Batch 0:** rerun the fixed seven-PDF Pilot; require byte-identical
   additive Pilot output apart from explicitly excluded generation metadata.
2. **Batch 1:** a diverse cross-issuer/year sample selected before extraction:
   JGAAP/IFRS, quarterly/full-year, companion revision, newly disclosed,
   deferred, target, review-only, and unit variants.
3. **Batch 2:** at least one classified/snapshotted document path for every
   one of the 14 issuers, with all adapter fallbacks reviewed.
4. **Batch 3:** remaining Events in bounded cohorts. Do not process another
   cohort until the prior cohort’s unresolved queue and quality gate are
   accepted.
5. **Final validation:** complete coverage, duplicate, provenance,
   reconciliation, and immutable-input verification before declaring collection
   complete.

Batch selection must avoid testing only consecutive events from the same
issuer. Diversity is measured by issuer, fiscal year, document type,
accounting standard, period basis, guidance state, and exception category.

## 9. Idempotency and reruns

Documents are idempotent by canonical document identity and content hash.
Observation identity uses:

```text
document_id + source page/table/row/column + raw metric label +
measure_kind + forecast_scope + period_basis + fiscal_period_end + raw value
```

A rerun may add a new Source link or an additive correction/review relation;
it must not delete/rewrite a prior Observation. Same identity is a no-op.
Changed official bytes require a new Source/Document identity and explicit
link/review semantics, never replacement in place.

## 10. Quality gates and completion criteria

Full collection is complete only when all of the following are true:

- Document and source coverage are reported for all 345 Events.
- Every accepted snapshot hash verifies.
- Every Observation has complete provenance and canonical schema validity.
- Period, unit/currency, consolidation, and accounting-basis evidence pass.
- Duplicate Documents and duplicate Observations have explicit terminal
  treatment.
- Financial reconciliation statuses are reported separately from Event
  reconciliation.
- Unresolved Inventory and Observation queues are counted, categorized, and
  explicitly accepted or block completion.
- Adapter fallback count and rate are below a Human Architect-approved
  threshold; a large fallback count is not automatic GO.
- Gemini SHA, 345 Event IDs, Event reconciliation, existing 64 observations,
  and prior snapshots remain unchanged.

## 11. Rollback and preservation policy

There is no destructive rollback. A failed batch leaves immutable inputs and
prior Facts intact. Its new candidates/Observations remain with an explicit
terminal status or are superseded by an additive correction relation. Re-run
selection uses new output namespaces or identities; it never deletes an
existing Fact as a means of recovery.

## 12. Human Architect approvals before start

Before authorizing Phase I, Human Architect approval is required for:

1. the official disclosure-index window and source-priority policy;
2. the terminal-state vocabulary and review ownership;
3. batch sizes, diversity selection, and adapter-fallback threshold;
4. duplicate-document and later-correction chronology policy;
5. taxonomy escalation procedure for values not in the canonical contract;
6. acceptance conditions for unresolved inventory and reconciliation conflict;
7. the explicit boundary that this collection is Fact/provenance work only,
   not analysis or trading.

## Self-review and final verdict

The plan preserves Event/Fact/Raw separation, makes Inventory Document the
processing unit, retains Pilot exceptions as regression fixtures, and places
inventory, acquisition, extraction, reconciliation, and completeness behind
separate gates. It contains no collection command, bulk URL list, numeric
Fact, market analysis, ranking, or trading rule.

```text
GO
```

The current canonical contract and Inventory-driven adapter architecture are
sufficient to begin the planned, approved staged fan-out process. This plan
does not itself authorize or perform that process.
