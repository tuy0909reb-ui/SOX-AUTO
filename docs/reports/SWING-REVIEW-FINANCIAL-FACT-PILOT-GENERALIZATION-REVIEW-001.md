# Financial Fact Pilot Generalization Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-PILOT-GENERALIZATION-REVIEW-001`  
**Date:** 2026-08-16  
**Scope:** Fixed Pilot only; no 345-Event fan-out executed  
**Verdict:** **GO — fan-out may be authorized in a separate action**

## Decision

The fixed seven-document Pilot is now reproducible through canonical Inventory
metadata and Inventory-driven adapter dispatch. This resolves every
`MODIFY` item recorded in
`SWING-REVIEW-FINANCIAL-FACT-PILOT-COMPLETION-001`.

This verdict confirms readiness to authorize a separately bounded fan-out
implementation. It does not perform, schedule, or otherwise begin collection
for the 345 Events.

## Remediated findings

### Canonical Document metadata and relations

All seven scoped Inventory records now have canonical `issuer`,
`document_role`, and `observation_policy`. The revision notice and
review-complete document additionally carry `related_document_id` and resolve
through `financial_document_link`. Every scoped Document has a
`financial_document_source_link` to its primary Source.

No existing Document ID, URL, content hash, or local snapshot path changed.

### 8035 deferred guidance

The official H1 cumulative forecast now generates a canonical
`company_forecast` Observation:

```text
period_basis:    Q2_cumulative
forecast_scope:  interim
guidance_status: active
```

The absence of a FY forecast is represented independently by a canonical
`financial_guidance_status` record with
`forecast_scope=full_year` and `guidance_status=deferred`, carrying the
source evidence that FY guidance will be disclosed at the H1 announcement.
No FY company forecast is emitted.

### 3436 newly disclosed forecast

The Q3 cumulative forecast is now
`revision_relation=newly_disclosed`, not `in_document`. The contract extension
is additive and states that there is no source-proved prior numeric forecast;
no prior Fact is created.

### 8306 review-only policy

The review Document has canonical:

```text
document_role:      restatement_or_review
observation_policy: review_only_no_auto_merge
```

It remains related to the pre-review Document and emits no duplicate numeric
Fact. The management target continues to be a separate `management_target`,
not `company_forecast` or `review_value`.

### 7011 repair provenance

`official_event_axis_repair_evidence` now gives a direct chain:

```text
7011 actual Observation
→ Observation source link
→ source-cited repair record
→ canonical Document
→ Source and content-hash snapshot
```

The repair remains additive. `official_earnings_event.fiscal_period_end`
remains null.

## Inventory-driven adapter verification

The Pilot runner no longer dispatches by URL or Event ID. It selects its
document adapter using canonical Inventory fields:

```text
issuer + document_type + document_role + observation_policy
```

The common builder remains free of issuer/document URLs, Event IDs, numeric
values, fixed pages, labels, and fiscal-period dates. Document-specific
section/label patterns are isolated in adapters. The seven scoped documents
re-ran successfully through this inventory-selected route.

## Preservation and tests

- Gemini raw CSV and SHA-256 remain unchanged:
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`.
- Official Event count remains 345; existing Event IDs and Event reconciliation
  are unchanged.
- Existing canonical 64 observations are unchanged.
- Existing Documents retain IDs, URLs, PDF hashes, and snapshot paths.
- The Pilot now has 11 numeric Observations: the prior 10 plus the 8035 H1
  company forecast.
- 37 Financial Fact / Phase A regression tests pass, including added checks
  for Inventory-driven dispatch, Document metadata completeness, deferred H1
  guidance, newly disclosed forecast classification, review-only policy, and
  direct 7011 repair provenance.

## Boundary

This review does not authorize inference for unsupported source forms. Any
future document requiring unknown period/unit evidence, ambiguous duplicate or
revision identity, or a new taxonomy must stop and return `MODIFY`.

No 345-Event collection, market analysis, ranking, or trading work was
performed.
