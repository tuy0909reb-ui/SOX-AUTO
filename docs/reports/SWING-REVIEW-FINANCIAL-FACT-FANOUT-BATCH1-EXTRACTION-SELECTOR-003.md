# Financial Fact Fan-out Batch 1 Extraction Selector Review 003

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXTRACTION-SELECTOR-003`  
**Date:** 2026-08-16  
**Scope:** Frozen Batch 1 eight PDFs only; selector validation only  
**Verdict:** **GO**

## Summary

Remaining selector validation gaps for the fixed eight Documents are closed.
Evidence locations are unique under an additive location model. Ambiguous or
mismatched evidence fails closed. No Observation or Financial Fact was
generated. Batch 1 Fact extraction remains unauthorized.

```text
Observation generated = 0
Financial Fact generated = 0
```

## 8 Documents (unchanged)

| Security | Issuer | Document ID |
|---|---|---|
| 4062 | ibiden | doc-baaa8c108f185a8d884f783523b64519 |
| 5801 | furukawa_electric | doc-a77612b025395cda840c61b3fe2e2c02 |
| 5803 | fujikura | doc-30d27b92e5515686a4062726da7d133e |
| 6146 | disco | doc-965719a06e445c2e95e40abc00825c86 |
| 6525 | kokusai_electric | doc-7c4645ac891c52978c6c096bc138beeb |
| 6920 | lasertec | doc-150bfd73a7b85dbda7b054921cddcc1c |
| 7012 | kawasaki_heavy | doc-458f162127c354b9b8b80a5416d3fa54 |
| 7735 | screen_holdings | doc-520d79d15d665c72ad87fd20f69b611e |

Batch 0 Documents (6857 / 8035 / 3436 / 8306 / 7011) were regression-only and
were not added to Batch 1 scope.

## Selector list (11)

| Security | Selector | Model | Kind | Page |
|---|---|---|---|---|
| 4062 | actual_revenue | single_page | actual | 1 |
| 5801 | actual_revenue | single_page | actual | 1 |
| 5803 | actual_revenue | single_page | actual | 1 |
| 6146 | actual_revenue | single_page | actual | 1 |
| 6146 | interim_forecast | page_table_row | company_forecast | 1 |
| 6525 | actual_revenue | single_page | actual | 1 |
| 6920 | actual_revenue | single_page | actual | 1 |
| 6920 | full_year_forecast | page_table_row | company_forecast | 1 |
| 7012 | actual_revenue | single_page | actual | 1 |
| 7012 | full_year_forecast | page_table_row | company_forecast | 1 |
| 7735 | review_only | single_page | review_only | 1 |

No numeric values were embedded in fixtures.

## 6920 Lasertec FY forecast evidence

Fixed local snapshot only. Prior failure was ordered regex
`連結業績予想.*通期`: PDF text places `通期` before the section header, so
page-level ordered match returned zero locations.

Unique conjunction on page 1:

- section: `2027年6月期の連結業績予想`
- table / metric: `売上高`
- row: `通期`
- period: `2027年6月期`
- unit: `百万円`
- location_model: `page_table_row`
- pages: `[1]`

No alternate table, narrative outlook page, or value substitution was used.
Existing 6920 actual selector remains on `連結経営成績` / `2026年6月期`.

## 7012 Kawasaki Heavy FY forecast evidence

Unique conjunction on page 1 from the fixed IFRS Q1 release:

- section: `2027年3月期の連結業績予想`
- table / metric: `売上収益`
- row: `通期`
- period: `2027年3月期`
- unit: `百万円`
- accounting_basis: `IFRS` (title evidence on the same PDF page)
- location_model: `page_table_row`
- pages: `[1]`

Accounting basis was not inferred; it is present in the official PDF text.

## 7735 SCREEN review-only evidence

Structural selector only (`numeric_fact_allowed=false`):

- section: `公認会計士等による期中レビューの完了`
- table / status marker: `期中レビューの完了`
- row / status: `変更はありません`
- period: `2027年3月期`
- pages: `[1]` (cover notice page)

This Document was not converted into actual / forecast / revision numeric
selectors.

## Evidence location model

Additive models available:

- `single_page`
- `page_table_row`
- `multi_page_same_table`
- `section_range`

Matching requires all declared markers to be present after whitespace collapse
(PDF extract spacing only). Zero matches, multiple matches, and expected-page
mismatch fail closed. First-match fallback is forbidden.

## Page / table / section / row validation

Validated for every fixture. Fail-closed on wrong page, section, table, or row
via independent negative fixtures.

## Period / unit validation

Validated for every numeric fixture. Fail-closed on period mismatch and unit
mismatch via independent negative fixtures.

## Negative fixtures

| Case | Result |
|---|---|
| multiple ambiguous match | fail_closed |
| missing label | fail_closed |
| missing evidence | fail_closed |
| unit mismatch | fail_closed |
| period mismatch | fail_closed |
| wrong page | fail_closed |
| wrong section | fail_closed |
| wrong table | fail_closed |
| wrong row | fail_closed |
| hash mismatch | fail_closed |
| scope mismatch | fail_closed |

Negative inputs are synthetic / expected-digest mismatches. Real PDFs and
canonical relations were not mutated.

## Batch 0 regression

`scripts/stock_swing/run_financial_fact_batch0.py`:

```text
documents=7 events=6 observations=11 idempotent=true provenance=verified
gemini_raw_sha256=0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507
```

Pilot output digests unchanged after rerun:

- financial_observation.jsonl: `d8e5d88a17792d0e49279f50c093e1c66f08c073902c5fe318f8c784c5ad8095`
- financial_observation_source_link.jsonl: `360675bf9852018dd73aaea7b7e698a94da483b9c9eb1cf489f46e90193e6f31`
- document_outcome.jsonl: `b041efdcde554ad0535545aaca936bcc6746fedf83b490348c009fa99d23fcd1`

## Scope SHA / snapshot hashes / integrity

```text
Batch 1 scope SHA-256:
e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b

Gemini ledger SHA-256:
0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507

Canonical Financial Facts: 64 (unchanged)
Batch 0 Observations: 11 (unchanged)
```

Snapshot hashes (unchanged vs manifest):

| Issuer | SHA-256 |
|---|---|
| ibiden | 857da08aba153f0ffd3c7fef52a230a20eab0620fc27f608d862813537db2300 |
| furukawa_electric | 866a2882ce696b8bb086fae201a94359399c3892124b154c7a69d01fde7b8224 |
| fujikura | a070c03457d4a90d58964dc58107d84e9f8329e1ca0b729e06fb9db6dbf10857 |
| disco | 52424c16aa2219fbd42ebefe18da19d6361be44d8c5a33f718faf9f679bf5390 |
| kokusai_electric | eec93b5e1df6921342e0b482011fc15d774cd0deeff3b0f2fe39c2783b2534a1 |
| lasertec | 1ddc222419579980dbc9357dc2b7424bc0931c955470c181bb8716eb467b6f13 |
| kawasaki_heavy | 69cac8e66eee02ed2334231f3c1f3adb43e8a351709a1a317309447351baee14 |
| screen_holdings | 2b7ecde846a0dda17ac11bdc8966bd6e2f23434194b5f576c8ec1c0e42bd7cf3 |

Pre/post integrity comparison: identical. No PDF re-fetch. No Event / Document /
Source / Gemini / canonical Fact mutation.

## Counts

```text
Documents validated:           8
Structural selectors:         11
Negative fixtures:            11
Observation generated:         0
Financial Fact generated:      0
```

## Tests / lint

```text
python -m unittest tests.test_stock_swing_financial_fact_batch1_selectors -v
  Ran 3 tests: OK

python -m unittest tests.test_stock_swing_financial_fact_pilot -v
  Ran 6 tests: OK

python -m py_compile
  validate_financial_fact_batch1_selectors.py OK
  test_stock_swing_financial_fact_batch1_selectors.py OK
```

## GO / MODIFY / STOP

**GO**

All GO conditions met:

- eight Documents have unique required selector evidence
- 6920 FY forecast unique with PDF evidence
- 7012 FY forecast unique with PDF evidence including IFRS
- 7735 remains review-only (no numeric Fact selector)
- multi-page location models exist when needed; current fixtures use
  `single_page` / `page_table_row`
- ambiguous evidence fail-closed
- page/table/section/row/unit/period mismatch fail-closed
- hash/scope mismatch fail-closed
- Batch 0 regression passed
- scope/snapshot unchanged
- Observation = 0
- Financial Fact = 0

GO does **not** authorize Batch 1 Fact extraction. That remains a separate
approval gate.
