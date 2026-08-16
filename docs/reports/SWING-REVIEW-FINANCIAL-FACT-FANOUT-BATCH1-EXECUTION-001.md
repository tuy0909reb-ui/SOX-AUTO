# Financial Fact Fan-out Batch 1 Execution Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH1-EXECUTION-001`  
**Date:** 2026-08-16  
**Scope:** Frozen eight Events / eight Documents / eight local official PDF snapshots  
**Verdict:** **GO**

## Boundary

Executed only:

- `data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch1_scope.json`
- its eight fixed Documents and local PDF snapshots
- the 11 selectors approved by selector validation 003

No Batch 2, remaining-event fan-out, PDF acquisition/replacement, analysis,
ranking, or trading work was performed. Batch 0 Documents were used only by
the Batch 0 regression.

The immutable scope SHA-256 remained:

```text
e6e94cb6299fb5234717caf1941277f2abef0f3359b928fe8d3fefb91545186b
```

## Additive output

Batch 1 writes only its own namespace:

```text
data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch1_001/
```

It contains an additive Batch 1 Inventory and Document→Source relation derived
from the already-frozen manifest. Adapter dispatch uses that Inventory only:

```text
issuer + document_type + document_role + observation_policy
```

The pre-existing global Inventory, Events, Event reconciliation, canonical 64
Financial Facts, Batch 0 output, Gemini ledger, and local snapshots were not
modified.

## Result

```text
Events:                         8
Documents:                      8
Validated selectors:           11
Numeric Observations generated: 10
Financial Facts generated:     10
7735 numeric Financial Facts:   0
Reconciliation rows:           10 (official_only)
Batch 1 rerun:                  digest-identical
```

The repository represents source-proved Financial Facts as
`financial_observation` rows. Each numeric Observation is one generated
Financial Fact in this bounded run.

## Document results and Facts

- **4062 / doc-baaa8c108f185a8d884f783523b64519** — 1 actual Fact:
  `売上高` 123,219 `百万円`, Q1 cumulative, period end `2026-06-30`,
  JGAAP.
- **5801 / doc-a77612b025395cda840c61b3fe2e2c02** — 1 actual Fact:
  `売上高` 365,221 `百万円`, Q1 cumulative, period end `2026-06-30`,
  JGAAP.
- **5803 / doc-30d27b92e5515686a4062726da7d133e** — 1 actual Fact:
  `売上高` 402,009 `百万円`, Q1 cumulative, period end `2026-06-30`,
  JGAAP.
- **6146 / doc-965719a06e445c2e95e40abc00825c86** — 2 Facts:
  actual `売上高` 114,308 `百万円`, Q1 cumulative, `2026-06-30`,
  JGAAP; company forecast `売上高` 242,800 `百万円`, Q2 cumulative,
  `2026-09-30`, JGAAP.
- **6525 / doc-7c4645ac891c52978c6c096bc138beeb** — 1 actual Fact:
  `売上収益` 75,414 `百万円`, Q1 cumulative, `2026-06-30`, IFRS.
- **6920 / doc-150bfd73a7b85dbda7b054921cddcc1c** — 2 Facts:
  actual `売上高` 230,485 `百万円`, full-year `2026-06-30`, JGAAP;
  company forecast `売上高` 290,000 `百万円`, full-year `2027-06-30`,
  JGAAP.
- **7012 / doc-458f162127c354b9b8b80a5416d3fa54** — 2 Facts:
  actual `売上収益` 543,576 `百万円`, Q1 cumulative, `2026-06-30`,
  IFRS; company forecast `売上収益` 2,560,000 `百万円`, full-year
  `2027-03-31`, IFRS.
- **7735 / doc-520d79d15d665c72ad87fd20f69b611e** — review-only
  outcome `review_only_no_auto_merge`; numeric Fact = 0.

All numeric Facts retain `currency=JPY`, `unit_code=JPY_million`,
`consolidation=consolidated`, the source unit `百万円`, the normalization rule
`JPY_million_identity_v1`, and PDF title evidence for the applicable
accounting basis.

## Evidence locations

Every generated Fact has one primary Observation→Document evidence link and
one `selector_evidence_location` row. All locations are page 1.

- 4062, 5801, 5803, and 6146 actual: section `連結経営成績`, table
  `売上高`, row `2027年3月期第1四半期`, period marker `第1四半期`,
  unit `百万円`.
- 6146 forecast: section `連結業績予想`, table `売上高`, row
  `第2四半期(累計)`, period marker `2027年3月期`, unit `百万円`.
- 6525 actual: section `連結経営成績`, table `売上収益`, row
  `2027年3月期第1四半期`, period marker `第1四半期`, unit `百万円`,
  IFRS.
- 6920 actual: section `連結経営成績`, table `売上高`, row
  `2026年6月期`, period marker `2026年6月期`, unit `百万円`.
- 6920 forecast: `page_table_row` only — section
  `2027年6月期の連結業績予想`, table `売上高`, row `通期`, period
  marker `2027年6月期`, unit `百万円`. No alternative page/table was used.
- 7012 actual: section `連結経営成績`, table `売上収益`, row
  `2027年3月期第1四半期`, period marker `第1四半期`, unit `百万円`,
  IFRS.
- 7012 forecast: `page_table_row` only — section
  `2027年3月期の連結業績予想`, table `売上収益`, row `通期`, period
  marker `2027年3月期`, unit `百万円`, IFRS title evidence.

The Evidence location relation records page, section, table, row, metric
label, period marker, unit marker, accounting basis, and the official source
row. Extraction stops if that fixture does not validate uniquely.

## Provenance and Gemini separation

All 10 numeric Observations passed:

```text
Observation → Document → local PDF snapshot → content hash → Source → Event
```

Each has exactly one `primary_numeric_evidence` link and a corresponding
Batch 1 Document→Source relation. The output reconciliation rows are
`official_only`; their Gemini fields are null. Gemini raw values were not
read as numeric inputs or copied into Financial Facts.

Gemini ledger SHA-256 remained:

```text
0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507
```

## Validation

Selector validation passed all 11 fixtures. The independent negative suite
fail-closed for:

- multiple ambiguous match
- missing label or evidence
- unit or period mismatch
- wrong page, section, table, or row
- hash mismatch
- scope mismatch

Batch 0 regression passed twice, with 7 Documents, 6 Events, 11 Observations,
provenance verified, and idempotent output. Batch 1 itself writes the output
twice and compares all output digests; the two runs were identical.

```text
Batch 1 output digests:
financial_document_inventory.jsonl               157545bfb87891c3c1e6b52de40664c42cc3eb073f482f38ef18f1dca8d3dac3
financial_document_source_link.jsonl             23c5b2eac1f866ede93fd7856e63660773b8b237097976e76060f4d26ba4d2df
financial_observation.jsonl                      9c009f2b2de58579554ef8c6bb9db465cca0b7cc687e600c7cd23e411942f8d9
financial_observation_source_link.jsonl          a3ee3fbe44797a3a8ac8a5d5d6a847ff89d8a94bea0b60ac79b272767f2e5020
financial_observation_reconciliation.jsonl       b573ed6a3e561956db616a13cdf5aaee0c3b7386a793e92fb7c6cf7b513a8ce4
selector_evidence_location.jsonl                 2007537a3e22fdd60b1efe10db404f4967295baaa930aba6e43ade2145cee1fe
document_outcome.jsonl                            cb14d66b171cca454c89fd4b879d9d550368d8e04dc1827d0ed2db7f255eaff9
document_results.json                             38434fedf33b8fabf5f55951c15f22a3116dfbf059ffb63135a9792161537370
summary.json                                      1f9d746dad6ce2b41aaf7752f974c2bcc533fbde9f28722977146d2624d59db4
```

Tests:

```text
python -m unittest tests.test_stock_swing_financial_fact_batch1_execution \
  tests.test_stock_swing_financial_fact_batch1_selectors \
  tests.test_stock_swing_financial_fact_pilot -v

Ran 10 tests: OK
```

Lint found no errors in the Batch 1 runner or its acceptance test.

## Existing asset immutability

Before/after checks were identical:

- scope SHA and all 8 snapshot hashes
- 345 official Events
- Event reconciliation
- existing canonical 64 Financial Facts
- Batch 0 11 Observations and their output digests
- Gemini ledger SHA

Scope-external Documents, Events, Observations, and Financial Facts in the
Batch 1 output are all zero.

## Unemitted Facts and Batch 2 gate

The only nonnumeric selected Document is 7735, deliberately retained as a
review-only outcome. No unsupported selector, unresolved conflict, duplicate
candidate, or unproved period/unit/accounting/consolidation fact was emitted.

This **GO** covers only the fixed Batch 1 extraction. Batch 2 remains blocked
until a separate Human Architect decision accepts Batch 1 results, the
official-only reconciliation disposition, adapter coverage/negative results,
and immutable-baseline/idempotency evidence. No Batch 2 work is authorized by
this review.
