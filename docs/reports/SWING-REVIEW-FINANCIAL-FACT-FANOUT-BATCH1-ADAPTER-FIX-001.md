# Financial Fact Fan-out Batch 1 Adapter Coverage Fix Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-ADAPTER-FIX-001`  
**Date:** 2026-08-16  
**Scope:** Frozen Batch 1 adapter coverage and dry-run only  
**Verdict:** **GO — eligible for separately authorized Batch 1 execution**

## Frozen scope verification

The canonical scope
`financial_fact_fanout_batch1_scope.json` is byte-identical to its retained
legacy copy. Its SHA-256 is:

```text
e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b
```

It remains exactly 8 Events / 8 Documents. No Event, Document, URL, or scope
member was added, removed, or substituted.

## MODIFY cause and additive fix

The prior `MODIFY` was caused solely by missing profile registrations. The
fixed Pilot registry contained only Batch 0 adapter profiles, so all eight
frozen Batch 1 Documents failed dispatch.

Added eight **coverage-only** adapters:

- ibiden / earnings release / primary result / eligible;
- furukawa_electric / earnings release / primary result / eligible;
- fujikura / earnings release / primary result / eligible;
- disco / earnings release / primary result / eligible;
- kokusai_electric / earnings release / primary result / eligible;
- lasertec / earnings release / primary result / eligible;
- kawasaki_heavy / earnings release / primary result / eligible;
- screen_holdings / earnings release / restatement-or-review /
  review-only-no-auto-merge.

They are selected solely through:

```text
issuer + document_type + document_role + observation_policy
```

They have no extraction selectors. Therefore they establish dispatch coverage
without authorizing PDF access, numeric parsing, Observation generation, or
taxonomy interpretation. Existing Batch 0 adapters are unchanged.

## Dry-run result

All 8 frozen Documents dispatched successfully as
`dispatchable_coverage_only`.

```text
PDF accessed:            false
Observation generated:   0
Scope-external dispatch: 0
```

No taxonomy change was made.

## Fail-closed and regression evidence

Adapter and core validation tests fail closed for:

- unknown profile / unsupported document type;
- missing adapter metadata;
- invalid unit;
- invalid period basis;
- missing Document→Source relation;
- missing Observation→Document evidence;
- snapshot hash mismatch.

Batch 0 regression reran successfully. The fixed 7-PDF output remains
idempotent with 11 Observations and complete provenance.

The scoped suite reports **39 passing tests**. Gemini raw SHA remains:

```text
0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507
```

The 345 Event set, Event IDs, Event reconciliation, existing canonical 64
Facts, Batch 0 Observations, and existing Document IDs/URLs/hashes/snapshots
are unchanged.

## Next execution conditions

This review does not execute Batch 1. Before a separate Batch 1 execution,
the approved scope must be used unchanged and execution must add canonical
Inventory/Source relations, source-proved extraction selectors, and
document-specific fixture tests. It must stop for unknown taxonomy,
unproved provenance/unit/period/accounting evidence, ambiguous duplicate or
revision relation, or adapter fallback.

Batch 2 and 345-Event collection remain prohibited.
