# Financial Fact Pilot 001 — Fixed-Boundary Execution

**Record ID:** `SWING-COMPLETE-FINANCIAL-FACT-PILOT-001`  
**Date:** 2026-08-16  
**Scope:** Five fixed disclosure cases / seven official documents only  
**Verdict:** **GO — Pilot verified; 345-Event fan-out remains forbidden**

## Outcome

The Pilot generated **10** new, separately stored Financial Observations from
the seven fixed official PDFs. The common builder did not receive document URL,
page number, numeric value, or fiscal-period-date constants. It receives only
an adapter-selected source match, parses its displayed numeric token and unit,
and derives a period only from an explicit document date range.

```text
actual:             5
company_forecast:   2
prior_forecast:     1
revised_forecast:   1
management_target:  1
review_value:       0 (correctly not emitted: the review notice has no numeric value)
total:             10
```

Outputs are in `facts/financial_fact_pilot_001/`, separate from the immutable
64-observation V002 canonical evidence set.

## Fixed case results

| Case | Result |
|-|-|
| 6857 revision pair | Q1 actual plus source-proved prior/revised FY revenue. Both forecast rows are `revision_relation=companion_document`; the release and revision notice remain distinct Documents. |
| 8035 deferred guidance | FY actual revenue emitted. A document outcome records `full_year_guidance_postponed`; no full-year company forecast is fabricated. |
| 3436 next-quarter forecast | Q2 actual plus Q3 cumulative company forecast. The forecast is `forecast_scope=next_quarter`, `period_basis=Q3_cumulative`, and is not converted to full year. |
| 8306 management/review pair | Q1 actual plus the stated ¥27,000億 management target, normalized with `JPY_oku_to_million_v1`. The review-complete notice creates no duplicate Fact and records `review_value_not_emitted_no_numeric_value`; a numeric `review_value` would be unsupported evidence. |
| 7011 bounded FY document | FY actual and FY company forecast generated from the official PDF. The separate additive repair relation proves `fiscal_period_end=2025-03-31`; the original Event field remains null. |

## Taxonomy, units, and provenance

- All numeric rows preserve `raw_value_text`, displayed source unit, JPY
  normalized unit, conversion rule, source row text, document page, Source ID,
  Document ID, and local content-hash snapshot.
- `8035` represents postponed full-year guidance as a nonnumeric document
  outcome rather than incorrectly assigning that state to an actual Fact.
- `8306` confirms the operational boundary: management targets are
  `management_target`; review-only notices cannot create a `review_value`
  without a source-displayed value.
- The relational validator and Pilot acceptance tests prove every generated
  Observation resolves to its inventory Document, Source, snapshot, hash, and
  evidence token. No isolated Observation is present.

## Reconciliation and immutable inputs

- Pilot reconciliation writes 10 independent
  `financial_observation_reconciliation` rows, all `official_only`.
- `event_reconciliation` was not written.
- Gemini raw ledger SHA-256 remains
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`.
- The fixed official Event population remains 345 IDs.
- The existing 64 canonical V002 Facts were not modified, deleted, or
  reclassified.

## Generalization review

`run_financial_fact_pilot.py` has a strict responsibility split:

```text
Document adapter: source-specific labels/section regular expressions
Common builder:   PDF token parsing, unit normalization, provenance,
                  period-range proof, canonical row construction
```

The adapters contain document identity and label/section selectors because
those are document-specific parsing exceptions. They contain no numeric output
values, page coordinates, snapshot hashes, or fixed fiscal-period dates. The
common builder contains no issuer/document URL or document-specific label.

## Tests and self-review

`37` Financial Fact / Phase A regression tests passed. The Pilot-specific tests
cover fixed-boundary enforcement, source/hash traceability, taxonomy and
guidance state, no duplicate review Fact, additive 7011 repair, separate
financial reconciliation, the immutable Gemini SHA, and unchanged Event
period value.

Self-review found no write path to Gemini raw, `official_earnings_event`,
existing canonical V002 observations, or Event reconciliation. Pilot output is
written only to `financial_fact_pilot_001`.

## Remaining limits

This is not authorization for full collection. Return to **MODIFY** if a new
Pilot document needs an unapproved taxonomy, lacks period/unit/provenance
evidence, has ambiguous revision/duplicate identity, or requires source
constants in the common builder. 345-Event fan-out, analysis, ranking, and
trading work remain prohibited.
