# Financial Fact Fan-out Batch 0 Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH0-001`  
**Date:** 2026-08-16  
**Scope:** Existing fixed Pilot only; no new source acquisition or fan-out  
**Verdict:** **GO — Batch 1 may be separately authorized**

## Execution target

Batch 0 processed exactly the fixed Pilot scope:

```text
7 official URLs
6 Events
7 content-addressed PDFs
5 disclosure cases
```

No out-of-scope document was dispatched. No new official document was acquired.
No Batch 1 work was started.

## Dispatch and output

All seven Documents dispatched through canonical Inventory metadata:

```text
issuer + document_type + document_role + observation_policy
```

The runner contains no URL or Event-ID dispatch. It produced 11 additive Pilot
Observations:

- actual;
- company forecast, including 8035 H1;
- prior/revised companion revision pair;
- 3436 newly disclosed Q3 cumulative forecast;
- 8306 management target;
- canonical deferred-guidance and review-only document states.

The 8306 review-only Document emitted no duplicate numeric Fact. The 7011
repair evidence relation resolves from actual Observation through source link,
Document, Source, and the official PDF snapshot.

## Idempotency and provenance

The Batch 0 runner executed the same Inventory scope twice. JSONL output
digests were identical after both runs. It does not delete canonical
Observations; it writes only its additive Pilot output namespace.

Every Pilot Observation passed:

```text
Observation → Document → PDF snapshot → content hash → Source → Event
```

Document→Source relations are required during Batch 0 provenance validation.

## Gemini / Official separation

Gemini raw remains immutable with SHA-256:

```text
0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507
```

Official PDFs remain the only source for canonical numeric Observations. Batch
0 creates 11 separate `financial_observation_reconciliation` rows, all
`official_only`; no Gemini numeric value or raw-row identifier is copied into
a canonical Observation. Event reconciliation is not written. This is not a
numeric audit of all 103 Gemini rows.

## Regression and negative controls

The Batch 0 immutable digest guard confirmed unchanged:

- Gemini raw CSV;
- 345 official Events;
- Event reconciliation;
- existing canonical 64 Observations;
- Pilot Inventory, Document links, and Document→Source links.

`38` Financial Fact / Phase A tests passed. Negative controls fail closed for:

- unknown document role / adapter profile;
- unsupported unit (`unit_unverified`);
- unknown period basis;
- missing Observation→Document primary evidence;
- missing Document→Source relation;
- snapshot hash mismatch;
- same-document reprocessing (output identity stays identical);
- Gemini-only values (no canonical Observation is created without official
  evidence).

## Batch 1 entry conditions

Batch 1 is not started by this review. It requires Human Architect approval of:

1. the diverse cross-issuer/year Batch 1 selection;
2. Inventory discovery window and official source priority;
3. adapter fallback threshold and review-queue owner;
4. treatment of unresolved documents, units, periods, and reconciliation
   conflicts.

If any Batch 1 candidate requires a taxonomy outside the contract, has
unproved period/unit/provenance, or causes adapter fallback without review,
execution stops and returns **MODIFY**.
