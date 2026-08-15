# Financial Fact Pilot Gate Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-PILOT-GATE-001`  
**Date:** 2026-08-15  
**Scope:** Bounded Pilot gate remediation; no fan-out, analysis, or trading work  
**Verdict:** **GO — Pilot execution only**

## Decision

The original review identified contract, evidence-chain, taxonomy, adapter, and
7011 repair gaps. The remediation outcome below supersedes the original
**MODIFY** conclusion. It authorizes only the fixed Pilot boundary; it does
not authorize 345-document collection, fan-out, event-reaction analysis,
ranking, or trading work.

## 1. Original gate findings (historical record)

The following sections preserve the original finding set for traceability.
Section 8 records the implemented remediation and is controlling.

## 1. Contract and boundary review

### What passes

- `financial_fact_contract.py` is the only active schema producer for the
  canonical Financial Fact relations.
- The former sample-only observation schema is absent. V002’s 64
  observations are byte-for-byte represented in canonical
  `financial_observation.jsonl`.
- `official_earnings_event` remains the sole Event identity relation; the
  Financial Fact layer only cites `event_id`.
- `event_reconciliation` remains Event identity reconciliation.
  `financial_observation_reconciliation` remains numeric-observation
  reconciliation and has a distinct file and schema.
- The financial reconciliation shape permits repeated
  `gemini_raw_row_id` across different `observation_id` values; a future
  `1 raw row : N observations` relation is therefore representable.
- The canonical observation requires source IDs, document IDs, page/table,
  raw numeric text, unit source text, conversion rule, publication/as-of
  fields, and short consolidation/accounting evidence fields.
- The 9 local snapshots still hash-match their source metadata. Gemini SHA and
  the 345 Event population remain unchanged.

### What does not yet pass

The contract does not yet encode or require several fields that the
generalization design identifies as necessary:

```text
forecast_scope
guidance_status
revision_relation
document_role
title_raw
document_identity_key
link_status / link_reason
retrieved_at
source-row / source-column identity
financial_observation_source_link
```

Consequently, a Pilot cannot objectively distinguish all required disclosure
states using the canonical relations alone.

## 2. Taxonomy readiness

| Item | Current operational status | Pilot finding |
|-|-|-|
| `actual` | Implemented and evidenced in V002 | Ready |
| `company_forecast` | Implemented, but has no separate forecast-scope/status fields | Incomplete |
| `prior_forecast` / `revised_forecast` | Implemented for 6857 explicit pair | Ready only for explicit in-document/companion evidence |
| `consensus` | Enumerated but out of scope and without source policy | Not Pilot-ready |
| Management target | Stored as `other` for 8306 | Candidate `management_target` is not approved |
| Mid-term target / review value | Design candidates only | Not implemented |
| Revision direction | `up/down/unchanged/mixed/unknown` is operationally enumerated | Ready, but only `up` has real V002 evidence |
| `period_basis` | Implemented | Ready only where table wording proves basis |
| Consolidation / accounting standard | Stored with short document-header evidence | Incomplete for dual-form/ambiguous tables |
| Unit/currency | Raw unit and rule present | Ready for known conversion rules only |
| Document publication / as-of | Date-only behavior is explicit | Ready for date-only; cross-date revision policy untested |
| `fiscal_period_end` / `event_fiscal_period_end` | Separate fields and PDF proof in V002 | Ready for proved periods; repair workflow untested |

`forecast_scope`, `guidance_status`, and `revision_relation` are not optional
cosmetic fields. Without them:

- a 3436 next-quarter forecast and a full-year forecast cannot be distinguished
  by taxonomy without relying on implementation convention;
- a postponed or withdrawn guidance state has no canonical document-level
  terminal representation;
- an in-release revision and a companion revision notice are not represented
  as distinct relationships.

This blocks a generalizing Pilot.

## 3. Evidence and repair review

V002 proves local hash verification and token/unit/page checks. The contract
requires evidence fields, but it does not yet enforce the complete evidence
chain relationally:

1. An Observation cites `source_document_id`, but schema validation alone does
   not require that ID to resolve to a canonical inventory record.
2. `financial_document_inventory` does not yet require the generalization
   design’s document role, title, identity key, link status/reason, or
   retrieval timestamp.
3. Table/page evidence exists, but source row/column identity and a
   multi-document source-link relation are absent.
4. The repair relation is correctly empty and the known 7011 null period
   remains null; however, no evidence-backed repair has exercised the
   acceptance path.

This is correct fail-closed behavior for V002. It is not adequate proof that a
Pilot can safely process repair, correction, or cross-date revision cases.

## 4. Hidden-overfitting review

The current V002 extractor is intentionally a fixture, but it contains
accidental generalization assumptions:

- fixed source URLs and document IDs;
- issuer-specific `SOURCES` keys;
- document-specific `ROWS` with numeric values, metric labels, page numbers,
  and fiscal-period ends;
- special handling keyed to one metric name (`net_income_target`) for the
  8306 `億円` conversion;
- fixed assumptions that header-page text supplies consolidation and
  accounting-standard evidence;
- a single fixed 6857 prior/revised relationship and `up` direction.

These are legitimate fixture assertions for V002; they are not legitimate
issuer adapters or general extraction logic. A Pilot must use a bounded
document adapter → issuer adapter → label/table normalizer → common builder
path, with no hard-coded output values or document IDs in the common builder.

## 5. Minimum Pilot scope after contract approval

The smallest heterogeneous Pilot should reuse these V002 documents:

1. **8035, 2024-11-12 earnings release** — ordinary JGAAP cumulative results
   plus explicit full-year company forecast.
2. **6857, 2026-07-29 earnings release and separate forecast-revision
   notice** — one Event, two Documents, actuals plus explicit prior/revised
   pair.
3. **8035, 2026-04-30 earnings release** — actuals with deferred FY outlook;
   must yield no fabricated company forecast.
4. **3436, 2026-08-06 earnings release** — next-quarter cumulative forecast;
   must remain `Q3_cumulative`, not full year.
5. **8306, 2026-08-03 earnings release and 2026-08-06 review-complete
   document** — management target distinct from forecast and a same-period
   re-disclosure that must not duplicate results.

One bounded additional official document is required before Pilot acceptance:

6. **7011, 2025-05-09 FY earnings release**
   (`official-event-7d68553c9dc55def9581a5b845e6555f`) — this is the known
   null `fiscal_period_end` Event. Its official document is needed to exercise
   either an evidence-backed repair or an explicit unresolved terminal state.

The current 9 snapshots do not contain a document for the known null-period
Event. Reusing only those 9 cannot satisfy the requested ambiguous/missing
period test. This is a single bounded Pilot input, not a 345-document sweep.

## 6. Required acceptance criteria before Pilot execution

The following must be automated and pass for every Pilot document:

1. Gemini ledger SHA, PDF snapshot hashes, and all 345 Event IDs remain
   unchanged.
2. Re-executing extraction produces byte-identical canonical JSONL output
   apart from an explicitly excluded generation timestamp.
3. Every typed Observation resolves to a canonical inventory document with
   hash, snapshot path, publication state, page/table, raw numeric token,
   source unit, and conversion rule.
4. Every covered period and basis is source-proved; unresolved values are
   review records, not typed numeric Facts.
5. Every measure kind has its operational taxonomy fields, including scope,
   guidance status, and revision relationship where relevant.
6. Unit normalization preserves raw text and uses a registered conversion
   rule; unsupported units emit no normalized value.
7. Prior/revised links are explicit and chronological. `mixed` direction is
   tested with a synthetic fixture and a real source when available.
8. A same-content duplicate produces one canonical Observation plus source
   links; a review-complete re-disclosure does not become a duplicate or a new
   result.
9. Date-only / unknown-time publication state never creates a guessed HH:MM,
   and document publication/as-of evidence is distinct from effective-date
   evidence.
10. Financial reconciliation stays `official_only` until approved fan-out;
    Event reconciliation is not written.

## 7. Explicit stop conditions

Pilot implementation must stop and return **MODIFY** immediately if:

- an encountered disclosure requires an unapproved taxonomy extension;
- no source evidence supports a typed value, unit, period, or provenance;
- basis or fiscal end needs inference;
- a prior/revised relationship is ambiguous;
- document identity, duplicate handling, or source linkage cannot be proven;
- a common builder needs issuer/document-specific output values, coordinates,
  or fiscal dates;
- a null Event field would need a silent repair;
- the additional 7011 document cannot establish either a repair record or an
  explicit unresolved status.

## Final verdict

```text
GO — bounded Pilot execution only
```

## 8. Remediation outcome

### Canonical contract changes

- Added optional Observation qualifiers: `forecast_scope`, `guidance_status`,
  `revision_relation`, and source row/column coordinates.
- Added optional Inventory qualifiers: `document_role`,
  `related_document_id`, `title_raw`, identity/link state, and retrieval time.
- Added the canonical `financial_document_link` and
  `financial_observation_source_link` relations. The latter contains all 64
  existing V002 Observation → Document → Source links; Pilot acceptance rejects
  isolated Observations through `validate_financial_fact_pilot.py`.
- Added approved `management_target` and `review_value` candidates plus the
  empty, explicit `financial_observation_taxonomy_migration` relation. V002
  remains unchanged.

### Fixed Pilot input

The scope record permits only: 6857 earnings release + revision notice, 8035
deferred-guidance release, 3436 next-quarter release, 8306 release +
review-complete document, and 7011’s 2025-05-09 FY release. It explicitly
prohibits fan-out and full collection.

### 7011 repair result

One official JPX FY PDF was downloaded and content-addressed under
`raw_external/financial_fact_pilot_sources/`. It explicitly states
`2024年4月1日～2025年3月31日`; therefore an additive
`official_event_axis_repair` record proposes `fiscal_period_end=2025-03-31`.
The original Event field remains null. The repair is not an Event mutation.

### Regression and residual conditions

- 33 regression tests pass, including contract, document-link, Observation
  provenance, taxonomy, 7011 repair, immutable Gemini ledger, and unchanged
  V002/official Event fixtures.
- Existing 64 canonical Facts were regenerated byte-identically and no
  taxonomy-migration record was emitted.
- The 345 official Event IDs and Gemini raw SHA remain unchanged.
- There is no remaining **Pilot-entry** blocking gap. The Pilot must still
  stop and return `MODIFY` for unsupported taxonomy, unproved period/unit,
  ambiguous duplicate/revision identity, or any requirement to put
  issuer-specific output constants in the common builder.

Phase V fan-out and Phase VI full collection remain forbidden.
