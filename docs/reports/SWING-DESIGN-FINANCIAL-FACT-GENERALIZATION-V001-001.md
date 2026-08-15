# Financial Fact Generalization Review V001

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-GENERALIZATION-V001-001`  
**Date:** 2026-08-15  
**Scope:** Design gates for a future 345-event Financial Fact collection  
**Verdict:** **MODIFY**

## Decision

V002 proves that official PDFs can produce source-preserving Financial
Observations. It does **not** prove that the nine-document,
template-indexed extractor generalizes to the 345 immutable
`official_earnings_event` records.

No bulk inventory, parser, extraction run, analysis, ranking, return, or
trading logic is authorized by this review.

The required generalized shape is:

```text
Event (existing immutable earnings event)
  └─ Document (one or more official source documents)
       └─ Observation (zero or more independently evidenced numeric Facts)
```

An Event answers “which earnings announcement?” A Document answers “which
official artifact stated this?” An Observation answers “which disclosed number,
for what covered period, in what unit, and with what meaning?”

## 1. Document inventory design

### 1.1 Additive Document Inventory relation

Create a future additive `financial_document_inventory` relation. It is
separate from the current earnings-event document relation because it must
represent documents discovered for Financial Fact collection without changing
the meaning or cardinality of the 345 event identities.

Minimum fields:

```text
inventory_document_id
event_id                         nullable only when linkage remains unresolved
security_id
document_type
document_role
provider
url
publication_date
publication_time                 nullable
retrieved_at
content_hash
local_snapshot_path
source_priority
title_raw
document_identity_key
duplicate_group_id               nullable
link_status
link_reason
supersedes_inventory_document_id nullable
quality_status
```

`document_type` vocabulary:

```text
earnings_release
forecast_revision
earnings_presentation
supplementary
correction
other
```

`document_role` is independent of type:

```text
primary_result
forecast_detail
revision_detail
presentation_context
restatement_or_review
other
```

This separation avoids treating every presentation as a new earnings Event or
treating every same-day document as a revision.

### 1.2 Inventory discovery procedure

For each immutable official Event, discovery is a **bounded document sweep**:

1. Start from the existing JPX/TDnet release document and its official title.
2. Obtain the issuer’s TDnet/company-IR disclosure index for a defined window:
   the Event publication date, plus a pre-approved backward/forward window.
3. Classify titles using conservative candidate rules:
   - `決算短信` → `earnings_release`
   - `業績予想の修正` / `通期連結業績予想の修正` → candidate
     `forecast_revision`
   - `決算説明資料` / `補足説明資料` → `earnings_presentation` or
     `supplementary`
   - `訂正` / `差替` / `期中レビュー完了` → candidate `correction` or
     `restatement_or_review` role; no automatic revision classification.
4. Download every accepted candidate into a content-addressed snapshot and
   record hash before parsing.
5. Link a candidate to an Event only with document evidence: issuer, disclosed
   fiscal period, publication chronology, title/reference, and where relevant
   a same-document citation. Date alone is forbidden.
6. Retain candidates whose Event linkage cannot be proven as
   `link_status=unresolved`; do not discard them and do not create a new
   earnings Event.

The inventory must distinguish:

- an in-release revision table (`earnings_release` document,
  `document_role=forecast_detail`);
- a separate companion revision notice (`forecast_revision`,
  `document_role=revision_detail`);
- multiple same-day documents, each with its own document identity;
- a later correction/review completion that references an earlier release;
- a later revision referring to a prior forecast, even when it has no new
  earnings-release Event.

### 1.3 Document identity and source duplicates

`document_identity_key` is initially:

```text
issuer/security + content_hash
```

when the bytes match. URL/provider copies with identical hash form one
`duplicate_group_id`: retain every source provenance row but permit only one
canonical extraction source selected by `source_priority`.

If hashes differ, titles differ, or the content cannot be read, never collapse
documents automatically. Use `link_status=review_required` or
`duplicate_status=unresolved`.

The 8306 review-complete PDF proves why this rule is necessary: same issuer,
same accounting period, and near-identical title do not mean a new result or a
duplicate source.

## 2. Financial taxonomy

### 2.1 Keep numeric assertion separate from disclosure intent

The existing `measure_kind` is suitable for the **assertion relationship** of a
number, but not for all disclosure intents. Preserve it for primary numeric
meaning and add separate dimensions rather than overloading it.

Approved candidate `measure_kind` vocabulary for the next schema review:

```text
actual
company_forecast
prior_forecast
revised_forecast
consensus
management_target
mid_term_target
review_value
other
```

The last four are candidates for approval, not implemented schema values.

Definitions:

- `actual`: a reported realized result for an explicitly covered period.
- `company_forecast`: an issuer’s stated forecast, neither a before/after
  revision row nor a target substitute.
- `prior_forecast`: explicitly identified preceding forecast value in a
  revision table or a proven predecessor document chain.
- `revised_forecast`: explicitly identified revised value paired to a prior
  forecast in the same revision evidence.
- `consensus`: third-party market expectation; out of current scope.
- `management_target`: management’s target explicitly stated as replacing or
  differing from an earnings forecast. 8306 is the proof case.
- `mid_term_target`: a multi-year plan/target, not a period earnings forecast.
- `review_value`: value in a correction/review artifact whose semantic
  relationship to the original needs explicit evidence.
- `other`: source-reported numeric disclosure that cannot meet any preceding
  definition.

### 2.2 Required companion dimensions

Do not encode horizon, status, and relationship solely in `measure_kind`.
Add these candidate dimensions to the schema contract:

```text
forecast_scope = next_quarter | interim | full_year | multi_year | other | unknown
guidance_status = active | revised | postponed | withdrawn | not_applicable | unknown
revision_relation = none | in_document | companion_document | predecessor_chain | unknown
```

Examples:

- 3436 next-quarter cumulative forecast:
  `measure_kind=company_forecast`,
  `forecast_scope=next_quarter`,
  `guidance_status=active`.
- 6857 companion notice:
  `prior_forecast` / `revised_forecast`,
  `forecast_scope=full_year`,
  `guidance_status=revised`,
  `revision_relation=companion_document`.
- 8035 deferred FY outlook:
  no numeric forecast observation. Record document-level
  `guidance_status=postponed` with raw evidence; do not synthesize a missing
  number.
- 8306:
  `measure_kind=management_target`,
  `forecast_scope=full_year`, and raw replacement-language retained. Until
  the new kind is approved, V002’s `other` remains the only safe storage.

All classifications retain `metric_name_raw`, `raw_value_text`,
`raw_unit_text`, `title_raw`, and the relevant source-table text. A normalizer
may assign a canonical metric only after preserving the raw label.

## 3. Period taxonomy

`period_basis` describes how the reported value accumulates, not the
disclosure’s forecast horizon or lifecycle. Keep the existing vocabulary:

```text
Q1_standalone / Q2_standalone / Q3_standalone
Q1_cumulative / Q2_cumulative / Q3_cumulative
full_year / forecast_only / revision_only / other / unknown
```

Rules:

- Use `Q*_cumulative` or `Q*_standalone` only when the source table establishes
  the basis. A quarter label alone is insufficient.
- Use `full_year` only when the observation covers the full named fiscal year.
- 3436’s next-quarter cumulative forecast is `Q3_cumulative`, even though it
  is forward-looking. `forecast_scope=next_quarter` carries that separate fact.
- Interim/H1 forecast uses the disclosed cumulative basis (normally
  `Q2_cumulative`) plus `forecast_scope=interim`.
- A revision is not a period basis. Keep the covered period’s basis and record
  the relationship in `measure_kind`, `guidance_status`, and
  `revision_relation`. Direction remains
  `upward / downward / unchanged / mixed / unknown` with raw text retained.
- Postponed or withdrawn guidance with no number becomes a document-level
  status record, not a zero/null-valued Financial Observation.

`fiscal_period_end` on an Observation must be the PDF-proved end of the
observation’s covered period. `event_fiscal_period_end` is a separately cited
Event axis. Neither is calculated from a fiscal-month hint or quarter label.

`as_of_date` prefers the source document’s publication date. Event
`announcement_date` is only a fallback when the document date is absent or
identical. `as_of_timestamp` stays null unless primary evidence proves a time.

## 4. Observation identity and duplicate rule

Create an Observation only if one canonical document table/cell provides:

```text
security_id
metric_name_raw
measure_kind
forecast_scope
period_basis
fiscal_period_end
consolidation
accounting_standard
source numeric token and unit
```

Candidate `observation_identity_key`:

```text
canonical_document_hash +
source_page + source_table + source_row + source_column +
metric_name_raw + measure_kind + fiscal_period_end + raw_value_text
```

An identical number in a presentation and release does not create two
Observations. It creates one canonical Observation with an additive
`financial_observation_source_link` relation that records every supporting
document and its evidence location.

Do not deduplicate merely on normalized numeric value: two same-valued metrics,
two forecast revisions, or two different covered periods can legitimately
share a number.

## 5. Extractor generalization architecture

The V002 template is a verification fixture, not the production architecture.
The future pipeline has five bounded responsibilities:

```text
document_adapter
  → issuer_adapter
    → table_label_normalizer
      → common_observation_builder
        → exception_handler / review queue
```

- `document_adapter`: obtains local hashed PDF/XBRL text, page boundaries, and
  source metadata. It never classifies investment meaning.
- `issuer_adapter`: recognizes issuer-specific layout and disclosure policy
  (for example, a bank target or 3436’s next-quarter practice). It emits
  source candidates and raw labels; it must not bypass common validation.
- `table_label_normalizer`: maps explicit table headers/labels to canonical
  metric candidates, preserving raw text and rejecting ambiguous mappings.
- `common_observation_builder`: validates period, unit, provenance, taxonomy,
  and identity before materializing an Observation.
- `exception_handler`: writes a review record with raw evidence and reason;
  it does not invent values, map to a convenient metric, or mutate Events.

No issuer-specific conditional belongs in the common builder. An issuer adapter
can be added only with fixtures that demonstrate the disclosure form and its
expected exception behavior.

## 6. Exception model

| Case | Treatment | Rule |
|-|-|-|
| Forecast postponed | Raw/document status only | No forecast Observation unless a number and covered period are disclosed. |
| Forecast withdrawn | Raw/document status only | Preserve withdrawal text and prior source links; never carry a prior number forward. |
| Management target | Factable as `management_target` after taxonomy approval; otherwise `other` | Preserve replacement wording and raw unit. |
| Mid-term target | Factable as `mid_term_target` after approval; otherwise review required | Never compare as one-period company forecast. |
| Next-quarter only | Factable | Use disclosed cumulative/standalone basis and `forecast_scope=next_quarter`. |
| Multiple revisions | Factable | Each before/after pair has its own revision relation and document order; no overwrite. |
| Duplicate disclosure | Factable once | Use document hashes/source links; ambiguous duplicate requires review. |
| Fiscal period unknown | Raw/review required | Do not emit a typed comparable Observation. |
| Unit unknown | Raw/review required | `unit_unverified`; no normalized value. |
| Accounting standard unknown | Factable only as non-comparable raw-mapped Fact | Never normalize across regimes until evidence repairs it. |
| Consolidated/non-consolidated ambiguity | Review required | No automatic selection or cross-form comparison. |

## 7. Validation gates before bulk collection

The collector must fail closed per document/Observation and produce a review
queue. A bulk run is blocked until all gates are approved:

1. **Source gate:** snapshot exists; file hash equals `content_hash`; provider,
   URL, retrieval timestamp, title, and priority are present.
2. **Event/document gate:** document identity is unique or explicitly grouped;
   Event linkage has non-date evidence; no existing Event ID is changed.
3. **Extraction gate:** local text/XBRL evidence identifies a page/table/row
   and source numeric token; raw text is retained exactly.
4. **Unit gate:** displayed unit and conversion rule are present. Unsupported
   or unknown units stop numeric normalization.
5. **Period gate:** Observation covered period end appears in source evidence;
   basis comes from table wording, not heuristic quarter arithmetic.
6. **Taxonomy gate:** measure kind, scope, status, standard, and consolidation
   are explicit or become review-required.
7. **Identity gate:** observation key is unique; source duplicate links do not
   produce a second Fact.
8. **Revision gate:** a prior/revised pair has explicit before/after evidence
   and chronology; actual-versus-forecast is never a revision inference.
9. **Reconciliation gate:** Financial reconciliation writes only to its own
   relation and never changes Gemini raw or Event reconciliation.
10. **No-inference gate:** zero-fill, estimate, forward-fill, derived
    standalone amounts, and guessed dates/times are rejected.
11. **Leakage gate:** `as_of_timestamp` remains null unless primary evidence
    proves a time; later documents cannot be attached as prior evidence.
12. **Coverage gate:** every inventory candidate has a terminal state:
    extracted, raw_only, review_required, unsupported, or source_unavailable.

## 8. Gemini Financial Observation reconciliation

Gemini raw is immutable, opaque, and can contain several metrics in one row.
The future relation must therefore support one-to-many links rather than a
single observation foreign key on the raw row.

Candidate relation:

```text
financial_observation_reconciliation
reconciliation_id
official_observation_id
gemini_raw_row_id
match_status
match_dimensions
gemini_value_text
official_value_numeric
official_unit_code
difference_note
quality_status
```

One Gemini row can appear in multiple reconciliation records, each attached to
one official Observation. That does not duplicate the official Observation.

Required matching dimensions:

```text
security_id
linked_event_id or proven document relation
metric raw/canonical mapping
measure_kind
forecast_scope
period_basis
fiscal_period_end
consolidation
accounting_standard
unit conversion rule
```

Date alone is prohibited. A prose cell that cannot separate individual metrics
remains `unresolved` or `gemini_only`; it does not create a numeric official
Fact. An official Fact with no proven Gemini match is normally `official_only`.

## 9. Freeze before any later analysis

Before calculating any return, surprise, score, rank, or trade-related output,
freeze independently versioned definitions for:

1. immutable Event identity and document linkage;
2. metric taxonomy and raw-to-canonical mapping;
3. observation identity and duplicate policy;
4. unit conversion registry;
5. forecast comparison eligibility and prior/revised chain rule;
6. repeated-event/re-disclosure policy;
7. period and as-of timestamp policy;
8. a future event-window definition, market-session rule, and return
   definition;
9. a future surprise definition, including eligible metric, forecast source,
   timing, and treatment of missing/withdrawn/postponed guidance.

These are collection/analysis boundary contracts, not authority to compute
analysis now. Analysis results must never retroactively select data fields,
merge documents, or alter a Fact taxonomy.

## 10. Self-review

1. Generalization is adapter-based rather than nine-document template growth:
   **Pass as design; not implemented.**
2. Forecast revisions are inventoried as candidate official documents, including
   in-release, companion, same-day, and later cases: **Pass as design.**
3. Management targets are distinct from company forecasts: **Pass as design.**
4. Next-quarter, interim, and full-year scope are separate from period basis:
   **Pass as design.**
5. Event, Document, and Observation responsibilities are separate: **Pass.**
6. Hash-based source grouping plus Observation identity prevents duplicate
   facts: **Pass as design.**
7. Issuer exceptions stay in adapters/exception records, not common taxonomy
   shortcuts: **Pass as design.**
8. Raw evidence, unit, page/table, and document links are retained: **Pass.**
9. Covered period ends require source evidence; no period inference: **Pass.**
10. Gemini raw is immutable: **Pass.**
11. Financial and Event reconciliation are separate: **Pass.**
12. No return, score, ranking, signal, or trade logic is introduced: **Pass.**

## 11. Open contradictions to resolve before schema promotion

These are design defects found by comparing V002, the current official Fact
inventory, and older kessan gates. They must be settled additively before any
schema promotion or bulk inventory run.

| Issue | Current state | Required resolution |
|-|-|-|
| Dual schemas | Stub `financial_observation.schema.json` / `guidance_revision_observation.schema.json` remain minimal; V002 sample schemas are richer and unpromoted. | Promote one additive contract; leave stubs only as transitional until the sample-proven fields are approved. |
| Reconciliation naming | Older design text used `observation_reconciliation`; V002 ships `financial_observation_reconciliation*`. | Canonical name is `financial_observation_reconciliation`. Older aliases are obsolete. |
| Document-type vocabulary | Official population documents are URL-only `earnings_release` with `content_hash=null`. V002 already needs `forecast_revision`. | Inventory vocabulary must include `forecast_revision` without rewriting the frozen 345 Event IDs. |
| Parent gate vocabulary | KESSAN gates omit `measure_kind=other` and omit several period/status values needed by V002. | Generalization taxonomy supersedes the older incomplete list for Financial Facts. |
| as-of source | V002 sets Observation `as_of_date` from Event `announcement_date`, including revision-notice metrics when the notice is same calendar day. | Freeze a document-date policy: prefer the source document’s publication date when it differs from the Event announcement date; never invent an intraday timestamp. |
| Consolidation / standard proof | V002 copies Event consolidation and accounting standard onto Observations. | Require table-level evidence or an explicit `unknown` / review outcome when dual forms appear. |
| Revision direction coverage | Sample hardcodes `upward` for one issuer. Gemini already contains mixed cases. | Direction vocabulary remains `upward / downward / unchanged / mixed / unknown` with raw text retained. |
| Event-axis repair | Known null Event `fiscal_period_end` (e.g. 7011) still exists. | Repair from document evidence as additive Event metadata maintenance before Observation axes rely on that Event. |
| Inventory vs extraction readiness | Population documents are URL pointers only. | Hashed primary + revision snapshots must exist before numeric extraction. |

## 12. Approval sequence (no bulk yet)

Architect approval is required after each step. No step authorizes 345-event
numeric collection by itself.

1. Approve promoted additive schemas: Observation, Document Inventory,
   source-link, revision relation, `financial_observation_reconciliation`,
   unit registry, metric taxonomy, exception enum, and document-date as-of
   policy.
2. Build hashed primary + revision Document Inventory for the 345 Events
   without extracting numbers.
3. Repair Event-axis blockers that have document evidence (including null
   `fiscal_period_end` cases) without merging or deleting Event IDs.
4. Generalize the extractor and validation harness on a wider multi-issuer
   pilot, still short of the full population.
5. Specify and pilot Gemini channel → Observation fan-out reconciliation
   without writing Gemini into Fact SoT.
6. Only then authorize population Financial Fact collection under the freezes
   in §9.

## Unresolved blockers and final verdict

```text
MODIFY
```

Bulk collection remains blocked by the following unresolved approvals:

1. The additive Document Inventory and source-link schema has not been
   authorized or implemented; official documents remain URL-only and lack
   revision-notice coverage.
2. `management_target`, `mid_term_target`, `review_value`, scope/status,
   revision-relation, and document-date as-of taxonomy candidates require
   approval; older stubs/gates remain inconsistent with V002.
3. The adapter fixtures, parser confidence policy, table-level
   consolidation/standard proof, and review-queue contract are not
   implemented across issuer/document forms.
4. The inventory coverage threshold, Event-axis repair acceptance criteria,
   and Gemini one-to-many reconciliation contract for all 345 Events are not
   yet approved.

Therefore no 345-event Financial Fact collection may start from this review.

## 13. Fixed progression contract

| Phase | Input | Output | Acceptance criteria | Stop condition |
|-|-|-|-|-|
| I. Official document inventory | Frozen 345 Events, issuer/TDnet indexes | Hashed Document Inventory with terminal state per candidate | Required provenance present; document type and Event linkage supported by evidence | Missing primary snapshot, ambiguous document identity, or unresolved revision candidate |
| II. Existing Event / Fact repair | Inventory evidence and frozen Events | Additive repair records only | Every non-null repair has source ID, method, timestamp, and evidence | Any inferred fiscal end, date, standard, or consolidation |
| III. Financial Fact Pilot | Approved contract plus bounded documents | Canonical Observations, revisions, and independent reconciliation | Token/unit/period/table evidence passes; exception cases have expected terminal status | Schema mismatch, unsupported exception, duplicate, or missing provenance |
| IV. Pilot review | Pilot outputs and review queue | Written acceptance/rejection decision | Cross-issuer layout, taxonomy, exception, and coverage criteria approved | Any unresolved material review item; **no automatic advance** |
| V. Fan-out | Approved Pilot review and Gemini channel policy | Observation-level one-raw-to-N reconciliation pilot | No Event reconciliation change; each link has non-date matching dimensions | Opaque Gemini cell cannot be segmented or match is ambiguous |
| VI. 345-event collection | Explicit authorization after I–V | Population Document/Fact relations and coverage report | Every in-scope inventory candidate has a terminal state; all validation gates pass | Any prior phase remains unapproved or fails its stop condition |
