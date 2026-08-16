# Financial Fact Fan-out Batch 1 Extraction Selector Review 002

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXTRACTION-SELECTOR-002`  
**Date:** 2026-08-16  
**Scope:** Frozen Batch 1 eight PDFs only  
**Verdict:** **MODIFY**

## Result

The selector validator was strengthened to require a single page-level
location for section, period, unit, and label evidence. It now rejects zero
matches, multiple matches, and expected-page mismatch rather than taking the
first textual match.

Validation passed the actual selectors for 4062, 5801, 5803, 6146, 6525, and
6920, and the 6146 interim forecast selector. It then stopped on the Lasertec
FY forecast selector because its proposed section/period evidence did not
produce exactly one page-level location.

This is the required fail-closed behavior. No fallback page, alternative
table, or inferred forecast row was selected.

```text
Observation generated: 0
Financial Fact generated: 0
PDF re-fetch: 0
Scope change: 0
```

## Remaining required work

The same frozen 8-document scope needs complete page/table/row fixtures for
the Lasertec FY forecast, Kawasaki Heavy FY forecast, and SCREEN review-only
notice, followed by explicit negative fixture tests for missing label/unit,
period mismatch, expected page/section/table mismatch, hash mismatch, scope
mismatch, and multiple matches.

Until each fixture has one source-proved evidence location and the negative
suite passes, Batch 1 Fact extraction remains unauthorized.
