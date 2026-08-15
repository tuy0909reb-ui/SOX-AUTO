# Financial Fact Collection — Feasibility & Design Review

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-COLLECTION-001`  
**Date:** 2026-08-15  
**Scope:** Fact collection feasibility and design only  
**Verdict:** **MODIFY**

## Scope and immutable inputs

This review evaluates whether typed financial Facts can be collected for the
fixed 14-security, 345-event official earnings population. It does not compute
surprise, price reaction, return, win rate, expectancy, ranking, signal, or
trading rule.

The following remain immutable:

- Gemini raw external source:
  `data/stock/stock_swing/research/kessan_ledger.csv`
- Gemini SHA-256:
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`
- Official earnings-event population: 345 event IDs, no merge/deletion
- Current event / raw reconciliation relations

Gemini is usable only as reconciliation evidence. Its prose fields are not
Financial Fact SoT.

## Verdict

```text
MODIFY
```

## Pilot contract amendment (2026-08-15)

This amendment authorizes preparation of the *bounded* Pilot contract only. It
does not change Event, Document, Gemini, or existing Financial Observation
semantics, and it does not authorize 345-Event collection.

The additive canonical relations and fields are:

- Observation optional qualifiers: `forecast_scope`, `guidance_status`, and
  `revision_relation`. They are required for newly emitted Pilot observations
  when applicable, but optional in the persisted schema so the immutable V002
  64-observation evidence set is not rewritten.
- Inventory qualifiers: `document_role`, `related_document_id`, `title_raw`,
  `document_identity_key`, link state/reason, and retrieval timestamp.
- `financial_document_link`: links independent official Documents without
  changing Event identity.
- `financial_observation_source_link`: the mandatory Pilot evidence relation
  from each Observation to an inventory Document and concrete Source.
- `financial_observation_taxonomy_migration`: the only route to propose a
  reclassification of an already stored Fact. It is empty for V002.
- `official_event_axis_repair`: additive, source-cited repair proposals; it
  never edits `official_earnings_event`.

### Operational taxonomy

`management_target` is a management-stated operating target and is not a
company forecast. `review_value` is a value repeated, confirmed, or assessed
in a management review and is not a new result or forecast. Both retain raw
text, source page/table, and unit evidence. Ambiguous values remain `other`
with raw text; no prior V002 observation is automatically reclassified.

`forecast_scope` expresses only coverage (`next_quarter`, `interim`,
`full_year`, `multi_year`, `other`, `unknown`). `guidance_status` expresses
state (`active`, `revised`, `postponed`, `withdrawn`, `not_applicable`,
`unknown`). `revision_relation` expresses evidence topology (`in_document`,
`companion_document`, `predecessor_chain`, `none`, `unknown`). These concerns
must not be encoded by `period_basis`.

### Pilot-only adapter boundary

The V002 builder remains a regression fixture, not a collection engine. A
Pilot extractor must use: document adapter → issuer adapter → table/label
normalizer → common observation builder → exception handler. The common
builder must accept discovered source metadata/evidence and must not contain
fixed URL, page, label, value, or fiscal-period constants. Issuer/document
exceptions live in the adapter/exception layer and stop for review if their
taxonomy is unsupported.

### Required Pilot validator

Each new Pilot Observation must have exactly one primary
`financial_observation_source_link` resolving to a
`financial_document_inventory` row with the same Event, source, hash-backed
snapshot, page/table, and raw evidence. An isolated Observation is rejected.
The allowed boundary is 6857 revision pair, 8035 deferred guidance, 3436
next-quarter forecast, 8306 management/review pair, and the single 7011 FY
document only. Any other Event requires a new gate review.

The primary documents contain enough information to make Financial Fact
collection realistic, especially for actuals and current company forecasts.
However, the present schemas and source-handling path cannot safely support
all requested Fact types, especially historical prior forecasts and revision
chains. Bulk extraction must not start before the listed design gates are
resolved.

## A. Realistic collection method for 345 events

### Actuals

Primary earnings releases normally contain the consolidated statement / results
summary, and are the preferred source for:

- revenue / sales (or issuer-specific equivalent)
- operating profit
- ordinary profit (JGAAP) or profit before tax (IFRS)
- net income / profit attributable to owners
- basic EPS when disclosed

The collector must preserve `metric_name_raw`; no attempt should force banks
or IFRS issuers into a universal “sales” field.

### Current company forecast

The same earnings release often contains the current full-year company forecast.
It can be collected as `measure_kind=company_forecast` only when the table
states it is a company forecast and the covered fiscal period is explicit.

### Prior company forecast

This is **not** equivalent to the current forecast shown in a later document.
It requires a documented historical chain:

1. identify the latest company forecast document available strictly before the
   event's publication date;
2. prove fiscal year, consolidation, accounting standard, and period match;
3. link that prior document to the later event using source IDs;
4. retain an explicit `source_unavailable` / `not_investigated` state when the
   chain cannot be proven.

The current 345-event inventory identifies release documents but does not yet
model this predecessor relation.

### Revision

Revision must be evidence-backed, not inferred from actual-versus-forecast.
Use a dedicated issuer / TDnet forecast-revision notice where present, or an
explicit revised forecast table in the current release. Normalize only:

```text
upward / downward / unchanged / mixed / unknown
```

where the raw revision text and comparable before/after values are retained.

## B. Source priority and provenance

Proposed order per numeric observation:

1. Company official earnings release PDF / XBRL
2. Company official earnings presentation
3. Company official forecast-revision notice
4. TDnet document copy / structured data
5. EDINET filing metadata / document (filing evidence, not a replacement for
   earnings-release timing)
6. Secondary source, reconciliation aid only

Each observation requires:

```text
source_id
source_url
retrieved_at
content_hash
source_priority
quality_status
```

Primary documents must be fetched into a reproducible source snapshot or
content-hash manifest before values are parsed. A URL alone is not sufficient
for five-year auditability.

## C. Schema assessment

Current `financial_observation.schema.json` only requires:

```text
observation_id / event_id / metric_name / value_numeric / currency /
unit_code / measure_kind / quality_status / source_id
```

Current `guidance_revision_observation.schema.json` only requires a revision
ID, event ID, normalized direction, quality status, and source ID.

They cannot represent the requested source-preserving, time-aware Fact:

```text
security_id
metric_name_raw
raw_value_text
period_basis
consolidation
accounting_standard
fiscal_year_label
period_end_date
as_of_timestamp
source priority / content hash
prior/revised forecast links
revision direction raw text
```

Local schema audit confirms the numeric Fact files are still absent, while
only required-key stubs exist. Gemini raw columns already separate prose
channels for actual / company forecast / revision, but they remain opaque
blobs rather than typed observations. Event-level reconciliation must stay
identity-only; numeric matching needs a separate observation-level path so
`official_earnings_event` semantics are not rewritten.

Therefore the next implementation must first approve an additive schema
extension:

- extend `financial_observation` with the fields above;
- extend `guidance_revision_observation` with
  `prior_forecast_observation_id`, `revised_forecast_observation_id`,
  `direction_raw`, and evidence fields;
- add a dedicated `observation_reconciliation` relation for
  gemini_value / official_value matching, leaving
  `event_reconciliation` as the identity SoT.

No schema change is made by this review.

## D. Numeric normalization contract

The proposed typed Fact uses:

```text
observation_id
event_id
security_id
metric_name
metric_name_raw
raw_value_text
value_numeric
currency
unit_code
measure_kind
period_basis
consolidation
accounting_standard
fiscal_year_label
period_end_date
as_of_timestamp
source_id
quality_status
```

Example conversion, only where the source’s unit is explicit:

```text
raw_value_text = "1,234億円"
value_numeric  = 123400
currency       = JPY
unit_code      = JPY_million
conversion_rule_id = JPY_oku_to_million_v1
```

If the document does not establish the unit, retain raw text and use
`quality_status=unit_unverified`; never guess or zero-fill.

`period_basis` must remain one of:

```text
Q1_standalone / Q2_standalone / Q3_standalone
Q1_cumulative / Q2_cumulative / Q3_cumulative
full_year / forecast_only / revision_only / other / unknown
```

Standalone and cumulative values must be extracted as disclosed. A later
derived standalone amount is an analysis transformation and is outside this
Fact collection stage.

## E. Six-security sample feasibility

Local official Facts already point to live JPX 決算短信 PDFs for all six
codes (typically JPX primary + IRBANK PDF mirror + IRBANK page). Sampled
primary PDFs responded `HTTP 200`. The table below is **structural presence
only** (section markers), not extracted numeric values.

Official Facts currently store `document_type=earnings_release` identity
only. Separate TDnet「業績予想の修正に関するお知らせ」are **not** stored as
official event identities even when a 短信 cover references them.

| Code | Representative event dates | Accounting / disclosure characteristic | Structural presence (A/F/P/R) | Feasibility finding |
|-|-|-|-|-|
| 6857 | 2020-04-24, 2024-04-26, 2026-07-29 | IFRS, March year-end | A yes; F yes; P often absent on cover; R sometimes yes via companion notice | Actual + outlook usually in 短信. 2026-07-29 cover shows `修正の有無:有` and points to a companion revision notice that is **not** a separate official Fact event. Encrypted PDF handling still blocks some local text paths. |
| 8035 | 2020-01-30, 2024-11-12, 2026-04-30 | JGAAP, March year-end | A yes; F often yes but can be partial; P rarely on cover; R flag varies | Same issuer can withhold full-year outlook (e.g. FY release with H1-only / deferred FY outlook). Prior forecast still needs predecessor-chain / revision-table evidence. |
| 285A | 2025-02-14, 2025-05-15, 2026-07-31 | IFRS, post-listing only | A yes; F yes; P no; R usually 無 / absent | No pre-listing official events. Gemini `forecast_only` / `revision_only` rows for some dates remain `gemini_only`, not official identities. Encrypted PDF handling blocked some local text paths. |
| 3436 | 2020-02-13, 2024-08-07, 2026-08-06 | JGAAP, December year-end; next-Q policy | A yes; F yes (often next-Q only); P yes when revision table present; R flag often 有 | Issuer policy is typically **翌四半期累計のみ**, not full-year guidance every release. Strongest prior-forecast evidence appears with `前回発表予想` revision tables. |
| 7011 | 2020-05-11, 2025-05-09, 2026-08-04 | IFRS, March year-end | A yes; F yes; P often not on cover; R often 無 / weak | Use IFRS raw labels; do not force JGAAP ordinary profit. One confirmed event has null `fiscal_period_end` in Facts despite a normal FY 短信 title — metadata gap, not missing PDF. |
| 8306 | 2025-02-04, 2025-02-12, 2026-08-03 | JGAAP bank; dual filings | A yes; F = profit **目標値** substitute (`業績予想に代えて`); P no; R not a forecast revision on review-complete refiles | Banking terminology differs. Same-period **期中レビュー完了** re-disclosures are separate official events and must not be treated as new earnings or forecast revisions without title inspection. |

Legend: **A**=actuals, **F**=company forecast/outlook, **P**=prior forecast (`前回発表予想`), **R**=revision signal in-doc or companion notice.

Sample primary URLs:

- 6857: `https://www2.jpx.co.jp/disc/68570/140120260728500866.pdf`
- 8035: `https://www2.jpx.co.jp/disc/80350/140120241003593212.pdf`
- 285A: `https://www2.jpx.co.jp/disc/285A0/140120260731505265.pdf`
- 3436: `https://www2.jpx.co.jp/disc/34360/140120260805509445.pdf`
- 7011: `https://www2.jpx.co.jp/disc/70110/140120260726599663.pdf`
- 8306 main: `https://www2.jpx.co.jp/disc/83060/140120260731505851.pdf`
- 8306 review-complete pair: `https://www2.jpx.co.jp/disc/83060/140120260805510381.pdf`

Practical parsing takeaway:

| Need | Usually in primary 決算短信? | Hard cases in this sample |
|-|-|-|
| Actual results | Yes | — |
| Company forecast | Often yes | 8035 can defer FY; 3436 next-Q-only; 8306 bank target substitute |
| Prior forecast | Sometimes | Strongest when revision table present (3436 H1); often absent on cover |
| Revisions | Partial | Cover flag and/or in-短信 numbers; full revision packages may be a separate TDnet notice outside current official event Facts |

The samples establish document availability and issuer-policy diversity. They do
not authorize bulk numeric extraction or treat Gemini prose values as official
numbers.

## F. Cross-issuer comparability

Existing reporting-regime records show multiple accounting standards and
issuer-specific labels:

- JGAAP and IFRS both occur in the fixed universe.
- 6857, 7011, and 7012 have an accounting-standard change / unknown regime
  marker requiring direct evidence before a cross-period comparison.
- 3436 uses a December year-end; 6920 uses a June year-end.
- 8306 banking terminology is structurally different from industrial issuers.

Therefore, numeric comparison is allowed only where:

```text
security_id
period_basis
measure_kind
consolidation
accounting_standard
currency
unit_code
period_end_date
```

are compatible under a pre-approved conversion rule. Otherwise use
`not_comparable`.

## G. Gemini financial reconciliation

Gemini has prose columns for company forecast, actual, and revision, but they
are secondary/mixed raw material. A future financial reconciliation relation
must retain both values and status:

```text
gemini_value
official_value
match_status = exact | candidate | conflict | official_only |
               gemini_only | unresolved
```

Matching needs:

```text
security_id
event_id
metric_name / metric_name_raw mapping
measure_kind
period_basis
period_end_date
consolidation
accounting_standard
unit conversion rule
```

An official number absent from Gemini is normal `official_only`. A Gemini
prose value with no proven primary numeric counterpart is `gemini_only` or
`unresolved`; it must not overwrite the official Fact.

## H. V002 limited implementation evidence

`SWING-COMPLETE-FINANCIAL-FACT-SAMPLE-V002-001` implements a deliberately
limited, source-hashed proof for six issuers (six Fact-bearing events, with
two extra evidence-only documents for the 8035 deferred-outlook and 8306
review-complete cases). It adds new sample-only relations; it does not modify
the 345 official events, Gemini raw ledger, or event-identity reconciliation:

```text
financial_observation_sample
financial_observation_source_sample
guidance_revision_observation_sample
financial_observation_reconciliation_sample
```

The sample establishes the following design consequences:

- `as_of_timestamp` must permit `null` when the primary document only proves
  a date; `as_of_date` retains that date without inventing an intraday time.
- A companion `forecast_revision` document can contribute prior/revised
  observations to the existing earnings event through its own `source_id` and
  `source_document_id`; it must not split or rewrite that event identity.
- 8035's deferred FY outlook is source evidence only and produces no
  `company_forecast` observation. The presence of an earnings release cannot
  imply that a full-year forecast exists.
- 3436's explicit next-quarter cumulative table is
  `company_forecast + Q3_cumulative`, never a full-year forecast.
- 8306's disclosed profit target is `measure_kind=other` with raw label
  retained and `quality_status=not_company_forecast`; its review-complete
  re-disclosure is retained as a separate source record with no automatically
  merged or duplicated observation.
- Sample PDFs are persisted as content-addressed snapshots under
  `raw_external/financial_fact_sample_sources/` so the proof does not rely on
  URL-only provenance. This remains sample-scoped; population collection still
  needs an approved snapshot inventory design.
- The local-PDF extraction proof adds `source_unit_raw`,
  `value_conversion_rule_id`, `source_page`, `source_table`, and
  `extraction_method` to observations. These fields are needed to distinguish
  an identity conversion from 8306's explicit `億円 → JPY_million` conversion
  without mutating numeric values or losing the source representation.
- Observation `fiscal_period_end` must mean the period covered by that
  numeric Fact, not necessarily the source event's result period. Preserve
  `event_fiscal_period_end` separately: a Q1 release can state a full-year
  forecast, whose covered end differs from the Q1 result.
- A deferred outlook does not prohibit actual-result extraction: 8035's
  deferred-outlook release yields actual observations, but still yields no
  `company_forecast`. The decision is per disclosed table, not per document.

This is proof of the proposed structure, not approval for the population
collection.

## Required gates before 345-event extraction

1. Approve the additive Financial Fact / revision / numeric-reconciliation
   schema contract.
2. Fix and test a first-party PDF/XBRL extraction path, including encrypted
   PDF handling without weakening source provenance.
3. Freeze a metric taxonomy that maps raw issuer labels without falsely
   equating JGAAP ordinary profit, IFRS pretax profit, and bank ordinary income.
4. Define the historical prior-forecast graph and its as-of rule.
5. Define revision evidence rules and an explicit `unknown` outcome,
   including companion TDnet revision notices that are referenced by a
   短信 but are not yet official event identities.
6. Define dual-filing / re-disclosure handling (e.g. 8306 期中レビュー完了)
   so same-period events are not misread as new earnings or revisions.
7. Complete a persisted sample extraction review for the six named issuers
   before any bulk run.
8. Define a numeric unit conversion registry and unit-verification gate.
9. Repair known official-event metadata gaps that block observation axes
   (e.g. null `fiscal_period_end` on otherwise valid 短信 events).
10. Promote the V002 sample relations from sample-only files only after
    approving their exact schema, including nullable `as_of_timestamp`,
    explicit `as_of_date`, document-level provenance, and a durable treatment
    for `measure_kind=other`.

## Final assessment

```text
MODIFY
```

Official materials make actual/current company forecast collection feasible.
Historical prior forecasts and revision chains are not safely extractable from
the present model without the additional Fact design and source-extraction
gates above. No bulk Financial Fact implementation should begin yet.

## J. Generalization review authority

`SWING-DESIGN-FINANCIAL-FACT-GENERALIZATION-V001-001` is the additive
pre-bulk design authority for:

- financial-document inventory and forecast-revision discovery;
- measure, scope, status, and revision taxonomy separation;
- Event / Document / Observation identity and duplicate rules;
- adapter-based extraction responsibilities and exception handling;
- Financial Observation reconciliation and pre-analysis freezes.

It does not authorize an inventory or extraction run. The verdict remains
`MODIFY` until its schema and validation gates receive explicit approval.

`financial_fact_contract.py` is the implementation source of truth for
canonical Financial Fact schemas. V002 sample rows are validation data written
to those canonical relations; they do not define a competing sample schema.
