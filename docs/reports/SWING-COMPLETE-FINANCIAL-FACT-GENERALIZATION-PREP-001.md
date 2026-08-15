# Financial Fact Generalization Preparation

**Record ID:** `SWING-COMPLETE-FINANCIAL-FACT-GENERALIZATION-PREP-001`  
**Date:** 2026-08-15  
**Scope:** Pilot-preparation contracts and bounded V002 inventory only  
**Verdict:** **MODIFY**

## Result

This change prepares the pipeline for the fixed sequence:

```text
I Inventory → II Repair → III Pilot → IV Pilot Review → V Fan-out → VI Full collection
```

It does not authorize Phase V fan-out or Phase VI 345-event collection.

## Canonical schema decision

`scripts/stock_swing/financial_fact_contract.py` is the single source of
truth for Financial Fact schema definitions. Both Phase A schema generation and
the V002 builder write the same canonical contracts:

```text
financial_observation
guidance_revision_observation
financial_observation_reconciliation
financial_document_inventory
official_event_axis_repair
```

The former `financial_observation_sample.schema.json` has been removed.
Sample JSONL is retained as historical verification evidence; the same 64
records are now written to canonical `financial_observation.jsonl`, and the
five revision records to canonical `guidance_revision_observation.jsonl`.

## Additive pilot relations

- `facts/financial_document_inventory.jsonl`
  - 9 V002 documents only; `inventory_scope=pilot_v002_only`
  - includes 1 separate `forecast_revision`
  - captures hash, snapshot path, provider, document type, and date-only
    publication timestamp state.
- `facts/official_event_axis_repair.jsonl`
  - intentionally empty. It is the required provenance relation for future
    evidence-backed repairs; no null fiscal period end was guessed or changed.
- `facts/financial_observation_reconciliation.jsonl`
  - canonical name; remains independent of `event_reconciliation`.
  - schema permits repeated `gemini_raw_row_id` across separate observation
    links, enabling a future `1 raw row : N observations` fan-out without
    duplicating Event reconciliation.

## As-of and evidence policy

Observation as-of fields now distinguish:

```text
document_publication_date/time/timestamp_quality
as_of_date/as_of_timestamp
observation_effective_date
```

V002 documents remain `date_only`; no HH:MM is invented. The observation
effective date remains null because the source does not separately establish
one. Consolidation and accounting-standard evidence are retained as short
source-page text values, alongside page/table references.

## Revision and repair policy

Canonical revision direction vocabulary:

```text
up | down | unchanged | mixed | unknown
```

V002’s 6857 revision is migrated to `up`. `mixed` is now available for
different directions across disclosed metrics, with raw direction text
preserved.

Repairs must be additive records containing:

```text
repair_method
repair_source_id
repaired_at
prior_value
repaired_value
```

The known 7011 null `fiscal_period_end` remains null because no repair source
was collected in this bounded preparation.

## Preservation and verification

- Gemini ledger unchanged:
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`
- 345 official Event IDs preserved.
- All 9 existing PDF snapshots remain and match their stored SHA-256 hashes.
- Existing sample evidence files remain; no PDF snapshot or Fact evidence was
  deleted.
- No returns, surprise, ranking, score, signal, or trading rule was added.

Verification run:

```text
python scripts/stock_swing/build_financial_fact_sample.py
python scripts/stock_swing/prepare_financial_fact_pilot.py
python -m unittest tests.test_stock_swing_phase_a
                   tests.test_stock_swing_official_earnings
                   tests.test_stock_swing_reconciliation_quality
                   tests.test_stock_swing_financial_fact_sample
                   tests.test_stock_swing_financial_fact_generalization_prep

31 tests OK
```

## Self-review

1. One Fact schema contract: pass.
2. Sample-only schema no longer primary: pass.
3. Event and Financial Observation reconciliation separated: pass.
4. One raw row to N observations representable: pass by canonical relation.
5. `forecast_revision` represented as a document: pass.
6. Document hashes retained: pass.
7. Document publication and observation as-of meanings separated: pass.
8. Consolidation/standard evidence fields present: pass.
9. `mixed` revision direction represented: pass.
10. Repairs require evidence provenance: pass.
11. Unsupported repairs preserve null: pass.
12. I → II → III → IV → V → VI sequence fixed: pass.
13. Gemini raw unchanged: pass.
14. Official Events unchanged: pass.
15. Existing Fact/PDF evidence retained: pass.
16. No analysis logic: pass.

## Pilot entry conditions

The preparation work is complete, but Pilot execution remains gated by:

1. Human Architect approves the canonical contract and taxonomy candidates.
2. Phase I builds a 345-Event Document Inventory before numeric collection.
3. Phase II repairs only evidence-backed Event-axis gaps.
4. Phase III runs a bounded, intentionally diverse pilot that includes
   forecast revision, duplicate/review disclosure, deferred or withdrawn
   guidance, management target, and next-quarter guidance.
5. Phase IV explicitly accepts the pilot. Failure or unresolved review blocks
   fan-out and full collection.

Phase V and Phase VI remain unauthorized.
