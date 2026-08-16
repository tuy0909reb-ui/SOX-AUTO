# Financial Fact Fan-out Batch 1 Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-001`  
**Date:** 2026-08-16  
**Scope:** Frozen eight-Event scope only  
**Verdict:** **MODIFY**

## Execution boundary

The Batch 1 scope was frozen before retrieval at exactly eight Events and
eight official TDnet primary PDFs, within the twelve-document maximum:

- 4062 Ibiden;
- 5801 Furukawa Electric;
- 5803 Fujikura;
- 6146 Disco;
- 6525 Kokusai Electric;
- 6920 Lasertec;
- 7012 Kawasaki Heavy Industries;
- 7735 SCREEN Holdings review-complete case.

All eight official PDFs were acquired as content-addressed snapshots and
recorded in the frozen scope manifest. No scope-external Event or Document was
added.

## Stop result

Batch 1 stopped before canonical Inventory insertion, adapter dispatch,
Observation extraction, or reconciliation.

The current adapter registry has only the seven fixed Pilot profiles. None of
the eight frozen Batch 1 issuer profiles is registered. Adding issuer/layout
profiles now would require new PDF fixtures, table-label mappings, and
expected taxonomy tests. Proceeding without those would violate the
fail-closed rule and risk placing issuer-specific parsing into the common
builder.

No canonical Batch 1 Observation was generated. Consequently there is no
Batch 1 numeric Fact count and no Gemini/official numerical reconciliation
result. This is an intentional stop, not a source-evidence failure.

## Completed checks

- Scope: 8 Events / 8 official PDFs / no scope expansion.
- Official acquisition: eight TDnet PDFs saved with SHA-256 snapshot paths.
- Batch 0 regression: 38 Financial Fact / Phase A tests pass.
- Gemini raw SHA remains
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`.
- The existing 345 Events, Event reconciliation, existing 64 canonical Facts,
  Batch 0 output, and existing Documents remain unchanged.
- Gemini raw was not used as evidence and was not reconciled or modified.

## Unresolved work required before re-run

1. Add an additive Batch 1 canonical Inventory/source relation for the eight
   frozen snapshot manifests; retain candidate Document IDs and official source
   metadata without changing existing Documents.
2. Add issuer/document adapter fixtures for the eight frozen profiles, each
   with table-label mappings outside the common builder.
3. Define expected actual/forecast/revision/guidance/review outcomes per
   fixture before extraction.
4. Add real Gemini reconciliation fixtures after official Observations exist,
   including one naturally occurring conflict if preflight evidence supports
   it. Do not manufacture a conflict.
5. Add Batch 1 idempotency and negative tests for each adapter profile.

## Safety conclusion

No stop condition involving mutation, unproven numeric Fact, inferred
period/unit/accounting value, duplicate merge, or auto-resolved conflict
occurred. The adapter coverage gap is nevertheless sufficient for
**MODIFY**.

Batch 2 and 345-Event collection remain prohibited.
