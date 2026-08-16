# Financial Fact Fan-out Batch 1 Completion Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-COMPLETION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen 8-Event / 8-Document Batch 1 scope  
**Verdict:** **MODIFY**

## Scope and source verification

The frozen scope SHA-256 is:

```text
e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b
```

It contains exactly 8 Events and 8 Documents. The content-addressed source
manifest contains the same 8 `(event_id, URL)` pairs. All 8 local official
PDF snapshots hash-match their manifest `content_hash`.

No scope member changed, no scope-external Document was selected, and no PDF
was retrieved or replaced during this execution attempt.

## Execution result

Batch 1 stopped before canonical Inventory insertion, PDF parsing,
Observation generation, or reconciliation.

All 8 Documents dispatch to their approved Inventory metadata profiles, but
the adapters intentionally registered by the preceding coverage fix are
`coverage_only`: each has zero extraction selectors. They prove safe dispatch
only. They do not contain source-proved table/label mappings required to
create a canonical Financial Observation.

Emitting a numeric Fact without such a selector would violate the no-inference
and provenance rules. The correct execution behavior is therefore fail-closed
`MODIFY`, not an empty Fact treated as completed and not a guessed extraction.

```text
Documents acquired previously:  8
Snapshots verified:             8
Documents dispatchable:         8
Observations generated:         0
Financial Facts generated:      0
Reconciliation rows generated: 0
Unresolved extraction profiles: 8
```

## Preservation and regression

No Gemini value was used as a Fact source, and Gemini raw was not written.
No Event, Event reconciliation row, existing 64 canonical Observation, Batch
0 Observation, existing Document relation, or existing snapshot was changed.

Batch 0 regression and the 39-test scoped suite remain the current passing
baseline. Batch 1 generated no additional Fact that could conflict with that
baseline.

## Required correction before another execution

For the *same frozen eight Documents only*, add source-proved extraction
selectors and fixture tests to the corresponding eight issuer/document
adapters. Each selector must establish table/row label, raw unit, covered
period evidence, accounting/consolidation evidence, and expected taxonomy
without placing URL, Event ID, page number, or numeric constant in the common
builder.

The next execution must then rerun snapshot-hash verification, provenance
validation, idempotency, independent Gemini reconciliation, negative tests,
and Batch 0 regression.

Batch 2 and the remaining 337 Events remain prohibited.
