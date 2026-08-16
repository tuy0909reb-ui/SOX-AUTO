# Financial Fact Pilot Completion Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-PILOT-COMPLETION-001`  
**Date:** 2026-08-16  
**Scope:** `financial_fact_pilot_scope.json` only; no fan-out or analysis  
**Verdict:** **MODIFY**

## Decision

The fixed Pilot proves that evidence-backed numeric Facts can be extracted from
heterogeneous official PDFs without changing Gemini raw, the 345 Event SoT,
Event reconciliation, or the existing 64 V002 observations.

It does **not** yet prove that the same implementation can safely expand to
345 Events. The failures are bounded and design-visible, not corruption of
Fact evidence:

1. Six of seven in-scope Inventory records do not carry required Pilot
   `document_role`, relation, or link-state metadata.
2. The 8035 H1 company forecast is present in the official document but is not
   generated. The output only represents the FY deferral as an ad hoc
   `document_outcome` JSONL record, not a canonical, contracted guidance
   relation.
3. 3436's explicitly newly disclosed Q3 cumulative forecast is classified as
   `revision_relation=in_document`. Since the source has no numeric prior(A),
   this is not a revision pair. The contract has no `newly_disclosed` relation
   state.
4. The Pilot uses seven fixed URL-keyed adapters. Their selectors contain no
   output values, pages, or fiscal-period dates, but Inventory-driven adapter
   selection and a reusable table/label normalizer are not implemented.

These gaps require additive contract and implementation design before fan-out.
No 345-Event collection is authorized by this review.

## 1. Scope integrity

The scope declares exactly **7 URLs** and **6 Events**. All seven resolve to
Inventory Documents and the Pilot summary records `document_count=7`,
`case_count=5`, and `event_count=345`.

The seven in-scope documents are the 6857 TDnet release and IR revision
notice, 8035 deferred-guidance release, 3436 release, 8306 release and
review-complete notice, and the 7011 FY release.

The three locally available out-of-scope documents were not linked to any
Pilot Observation:

- 8035 2024-11-12 release;
- 285A release;
- 7011 2026-08-04 Q release.

Six documents have numeric Observation links; the 8306 review-only document
is processed as an outcome record rather than a numeric Fact. This is correct
for the source, but processing should be represented by a canonical
document-status relation, not only an ad hoc output file.

## 2. Evidence traceability and regression

All 10 Pilot Observations resolve through a primary source link to an
Inventory Document. Each linked document resolves to a local PDF snapshot,
content hash, Source ID, and Event ID. No Pilot Observation is isolated.

The following regression checks pass:

- Gemini raw ledger remains SHA-256
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`.
- `official_earnings_event`, `event_reconciliation`, and the existing
  `financial_observation.jsonl` have no diff from the branch baseline.
- The official Event population remains 345.
- 37 scoped Financial Fact / Phase A tests pass.
- Pilot reconciliation contains 10 separate `official_only` records and does
  not modify Event reconciliation.

## 3. Case findings

### 6857 — revision pair

Passes for the generated revenue facts. The IR revision notice supplies
distinct prior(A) and revised(B) values; both are FY, JPY million,
`revision_relation=companion_document`, and retain source-specific evidence.
The TDnet release supplies the Q1 IFRS actual. No prior forecast is inferred
from TDnet's revised-only disclosure.

Limit: this Pilot extracts revenue only. It does not exercise the same generic
path for the document's pretax-profit or EPS columns, so it does not prove the
requested JPY-per-share behavior for fan-out.

### 8035 — deferred guidance

The FY actual and deferred full-year status are correctly distinguished; no FY
company forecast is fabricated.

Failure: the official document explicitly presents an H1 cumulative forecast,
but no H1 `company_forecast` Observation is generated. Also,
`full_year_guidance_postponed` is stored only as `document_outcome.jsonl`,
outside the canonical contract. Deferred guidance and absent forecast are
therefore not yet fully modelled as reusable canonical relations.

### 3436 — next-quarter cumulative forecast

The Q2 actual and Q3 cumulative forecast are separate, and the Q3 forecast is
not converted to full year. The displayed values and negative-token policy are
available to the common numeric parser, although the selected revenue row does
not itself exercise `△` normalization.

Failure: because source prior(A) is `―`, the Q3 forecast is newly disclosed,
not an evidenced revision pair. `revision_relation=in_document` is
semantically inaccurate. The enum needs an additive `newly_disclosed` state
or a separate disclosure-relation field before fan-out.

### 8306 — management target / review

Passes for the Q1 actual and the distinct management target. The raw
`27,000億円`, normalized `2,700,000` JPY million, and
`JPY_oku_to_million_v1` conversion rule are traceable. It is not classified
as `company_forecast`.

The review document does not duplicate numeric Facts. However, its terminal
state is `review_value_not_emitted_no_numeric_value`, while the requested
operational identity is `review_only_no_auto_merge`. This policy is not
persisted in the canonical Inventory metadata. It must be a canonical
document-status/role relation, not a convention in a Pilot-only output.

### 7011 — FY document and repair

FY actual and FY forecast are present with IFRS retained. `事業利益` is not
renamed to operating profit because it is not extracted as such. No EPS or
stock-split comparability inference is generated.

The additive repair record is source-cited and confirms `2025-03-31`; the
original Event remains null. The repair is Document-evidence-based, but it is
not linked directly to a specific Observation evidence record. The repair
relation should gain an optional `document_id` and/or
`observation_source_link_id` for audit completeness.

## 4. Contract and taxonomy assessment

Operationally demonstrated:

- `actual`, `company_forecast`, `prior_forecast`, `revised_forecast`, and
  `management_target`;
- `forecast_scope=next_quarter` and `full_year`;
- `guidance_status=active`, `revised`, and `not_applicable`;
- `revision_relation=none`, `in_document`, and `companion_document`;
- JGAAP / IFRS, consolidated scope, JPY million, and `億円 → 百万円`
  conversion.

Not demonstrated or not yet canonical:

- H1 guidance as `company_forecast`;
- newly disclosed forecast distinct from a revision;
- canonical deferred/withdrawn guidance document state;
- canonical `review_only_no_auto_merge` document state;
- `review_value` with an actual source numeric value;
- real-source `mixed` revision direction;
- complete `document_role`, `related_document_id`, and link metadata for all
  Pilot Inventory records.

## 5. Generalization and stop-condition review

The common builder is appropriately free of numeric output values, fixed page
coordinates, and fixed fiscal dates. Source-local labels and section patterns
are separated into adapters.

This is not sufficient for fan-out: adapters are selected by seven explicit
URLs and embed issuer/document-specific Japanese structural patterns. There is
no Inventory-driven document adapter registry, document-type parser, or
generic table/label normalization stage. Applying this implementation to 345
Events would require adding source-specific entries manually and would violate
the Pilot's generalization objective.

No stop condition was breached for the narrow Pilot output: all emitted values,
units, periods, and provenance are evidenced. The conditions are nevertheless
not fully operational for fan-out because newly-disclosed guidance and
document-only terminal states cannot be expressed canonically.

## Required modifications before a new fan-out gate

1. Make Inventory `document_role`, document links, relation state, and
   source-link metadata mandatory for every Pilot/future collected document.
2. Add a canonical guidance/document-status relation for deferred, withdrawn,
   review-only, and no-auto-merge states.
3. Add a source-proven `newly_disclosed` forecast relation distinct from
   revision, without converting it to prior/revised.
4. Add direct repair-to-Document/Observation evidence linkage.
5. Replace fixed URL dispatch with Inventory-selected document adapters and
   introduce a reusable table/label normalization interface.
6. Extend the bounded Pilot only after approval to exercise H1 guidance, EPS
   unit handling, negative-token normalization, and a source with an actual
   `review_value` or `mixed` revision.

Until these changes pass a new gate, Phase V fan-out, Phase VI collection,
analysis, ranking, and trading work remain prohibited.
