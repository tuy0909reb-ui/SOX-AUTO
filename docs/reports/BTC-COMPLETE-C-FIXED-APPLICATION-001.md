# BTC C — Fixed Application to H2024 / post-ETF

**Record:** `BTC-COMPLETE-C-FIXED-APPLICATION-001`
**Contract:** `btc-dca-halving-contracts-v1.1-sm-once-per-cycle`
**candidate_set_id:** `btc-dca-halving-candset-a3-2026-08-27`
**panel_end:** `2026-10-06`

## Confound (required)

{
  "T_approve": "2024-01-10",
  "T_primary": "2024-01-11",
  "halving_sot": "2024-04-19",
  "halving_user_note": "2024-04-20",
  "days_T_primary_to_halving": 99,
  "statement": "ETF public trading start and H2024 halving are proximate. Do not attribute observed paths to ETF alone."
}

## Classification policy

comparable/degraded/inconclusive labels requested but v1 numeric thresholds are NOT fixed. All rules labeled inconclusive pending threshold SoT; qualitative notes attached per rule.

## H2024 rule comparison (365 / 540 / 730)

| rule | X | H2024 strat ROI | pure ROI | excess | exit dsh | exit date | flat days | terminal | post-exit BTC +90d |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| E0_X540_R180 | 540 | 36.74% | 10.52% | 26.22% | 540 | 2025-10-11 | 361 | FLAT_CASH | -16.22% |
| E0_X365_R180 | 365 | 7.92% | 10.52% | -2.60% | 365 | 2025-04-19 | 536 | FLAT_CASH | 45.09% |
| E0_X730_R180 | 730 | -6.16% | 10.52% | -16.68% | 730 | 2026-04-19 | 171 | FLAT_CASH | -10.51% |

## Per-rule cycle summary

### E0_X540_R180

| cycle | complete | strat ROI | pure ROI | excess | exit dsh | flat days | terminal |
|---|---|---:|---:|---:|---:|---:|---|
| H2016 | True | 1120.72% | 251.54% | 869.19% | 540 | 862 | FLAT_CASH |
| H2020 | True | 236.99% | 226.93% | 10.06% | 540 | 899 | FLAT_CASH |
| H2024 | False | 36.74% | 10.52% | 26.22% | 540 | 361 | FLAT_CASH |

**Classification:** `inconclusive` — v1 contract does not fix numeric thresholds for comparable/degraded/inconclusive. Quantitative differences are recorded below; formal classification deferred.

### E0_X365_R180

| cycle | complete | strat ROI | pure ROI | excess | exit dsh | flat days | terminal |
|---|---|---:|---:|---:|---:|---:|---|
| H2016 | True | 196.43% | 251.54% | -55.11% | 365 | 1037 | FLAT_CASH |
| H2020 | True | 263.00% | 226.93% | 36.07% | 365 | 1074 | FLAT_CASH |
| H2024 | False | 7.92% | 10.52% | -2.60% | 365 | 536 | FLAT_CASH |

**Classification:** `inconclusive` — v1 contract does not fix numeric thresholds for comparable/degraded/inconclusive. Quantitative differences are recorded below; formal classification deferred.

### E0_X730_R180

| cycle | complete | strat ROI | pure ROI | excess | exit dsh | flat days | terminal |
|---|---|---:|---:|---:|---:|---:|---|
| H2016 | True | 341.42% | 251.54% | 89.88% | 730 | 672 | FLAT_CASH |
| H2020 | True | 49.19% | 226.93% | -177.74% | 730 | 709 | FLAT_CASH |
| H2024 | False | -6.16% | 10.52% | -16.68% | 730 | 171 | FLAT_CASH |

**Classification:** `inconclusive` — v1 contract does not fix numeric thresholds for comparable/degraded/inconclusive. Quantitative differences are recorded below; formal classification deferred.


## Relative ranking (cycle excess vs pure)

- **H2016:** E0_X540_R180=869.19%, E0_X730_R180=89.88%, E0_X365_R180=-55.11%
- **H2020:** E0_X365_R180=36.07%, E0_X540_R180=10.06%, E0_X730_R180=-177.74%
- **H2024:** E0_X540_R180=26.22%, E0_X365_R180=-2.60%, E0_X730_R180=-16.68%

## Stop line

No refit. No adoption. D follows if differences warrant explanation.

---

Artifacts: `research/btc_dca_halving/c/cd-2026-10-06/`
