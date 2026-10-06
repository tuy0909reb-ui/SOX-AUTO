# BTC B — Frozen Candidate Confirmation (pre-C)

**Record:** `BTC-COMPLETE-B-CANDIDATE-CONFIRMATION-001`
**Status:** PASS — Phase B only
**Contract:** `btc-dca-halving-contracts-v1.1-sm-once-per-cycle`
**candidate_set_id:** `btc-dca-halving-candset-a3-2026-08-27`
**candidate_set status:** `FROZEN`
**data_version:** `b-2026-08-27`

```text
B = confirm frozen candidates under SoT once_per_cycle + reproduce A2 metrics
B ≠ adoption
B ≠ ETF/post-H2024 validation (that is C)
```

## 0. Preconditions

- SM SoT amended to once_per_cycle (R counts in new cycle)
- A3 status resolved: FROZEN (candidate E/X/R unchanged)
- Eval window: 2016-07-09 → 2024-01-10 (no H2024 / no post_etf)

## 1. SM invariant checks

For each frozen rule:
- mode = once_per_cycle
- E=0, R=180
- sell_count = 2 (H2016 once, H2020 once)
- exit dsh == X
- no same-cycle double exit

## 2. A2 reproduction

| rule_id | SM | A2 repro | E0/R180 | overall | B ROI | A2 ROI | exits |
|---|---|---|---|---|---:|---:|---|
| E0_X540_R180 | True | True | True | True | 705.38% | 705.38% | 2017-12-31|2021-11-02 |
| E0_X365_R180 | True | True | True | True | 156.66% | 156.66% | 2017-07-09|2021-05-11 |
| E0_X730_R180 | True | True | True | True | 189.31% | 189.31% | 2018-07-09|2022-05-11 |

## 3. Negative control

- `threshold_repeat` on E0_X540_R180 sell_count = 10 (once_per_cycle = 2)
- distinct from SoT path: **True**

## 4. Purpose reminders carried into later C

- Full-window still trails pure DCA for all three (expected regimen cost)
- X=540 remains primary probe; 365/730 are contrasts
- Do not refit on H2024

Pure DCA full-window ROI (B window): **1314.59%**

## 5. Stop line

- overall_pass = **True**
- C / D **not** started
- No investment adoption
