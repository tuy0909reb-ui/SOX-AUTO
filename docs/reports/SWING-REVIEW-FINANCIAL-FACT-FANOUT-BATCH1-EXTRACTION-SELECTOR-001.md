# Financial Fact Fan-out Batch 1 Extraction Selector Review

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXTRACTION-SELECTOR-001`  
**Date:** 2026-08-16  
**Scope:** Frozen Batch 1 eight PDFs only; selector validation only  
**Verdict:** **MODIFY**

## Result

All eight frozen local snapshots hash-verified and yielded 11 structural
selector validations without generating an Observation or Financial Fact.

The validated fixture coverage is:

- 4062, 5801, 5803, 6146, and 6525: Q1 cumulative actual revenue;
- 6146: Q2 cumulative interim company forecast;
- 6920: FY actual and FY company forecast;
- 7012: IFRS Q1 cumulative actual and FY company forecast;
- 7735: review-only / no-change notice, intentionally no numeric Fact.

Each fixture is structural only: section/table wording, metric label, unit
marker, period marker, and taxonomy intent. It contains no URL, Event ID,
page number, numeric value, or Gemini data. Batch 0 special cases remain
Batch 0 regression only and were not added to Batch 1 scope.

## Why MODIFY remains

The current validator confirms evidence presence but does not yet enforce
unique table/row match, expected page identity, or negative fixtures for
multiple ambiguous matches, missing labels, unit mismatch, and period mismatch.
Those fail-closed selector tests are mandatory before source-proven numeric
extraction can start.

```text
Documents validated:      8
Structural selectors:    11
Observations generated:   0
Facts generated:          0
```

Scope SHA and snapshot hashes were unchanged. No PDF was re-fetched, no
canonical relation was written, and no Event, Gemini raw value, existing Fact,
or Batch 0 output was modified.

## Required next step

Add unique-location selector assertions and the required negative fixtures for
the same eight frozen Documents only. Then rerun selector validation and Batch
0 regression before separately authorizing Batch 1 Fact extraction.
