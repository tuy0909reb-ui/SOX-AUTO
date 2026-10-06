# BTC A2 — Entry / Exit / Re-entry Exploration (Discovery)

**Record:** `BTC-COMPLETE-A2-EXPLORATION-001`
**Status:** COMPLETE — Phase A2 only (not A3 freeze, not adoption)
**Contract:** `btc-dca-halving-contracts-v1.0-approved`
**data_version:** `a2-2026-08-27`
**source A1:** `a1-2026-08-27`
**retrieved_at:** `2026-08-27T21:28:03Z`

```text
A2 role: discovery / exploration
A3 role (later): review → candidate_set freeze (K≤5)
C role (later): fixed apply to post-ETF / H2024 — NO refit
```

## 0. Amendment vs earlier tight A2 binding

A2 is discovery: full grid + marginal sweeps allowed; K<=5 freeze deferred to A3; staged E→X→R not required as sole method.

Maintained prohibitions: no H2024/post_etf in selection, no peak/bottom rules,
no lookahead, no extra indicators, no adoption judgment.

## 1. Eval window & assumptions

| Item | Value |
|---|---|
| eval window | 2016-07-09 → 2024-01-10 |
| rationale | Last calendar day with date < T_primary so A2 selection uses no post_etf / no H2024 bars. H2020 segment is truncated ~3 months before next halving. |
| DCA | 5000.0 JPY/day |
| fee_rate | 0.001 (assumption) |
| tax | none in primary A2 tables |
| price | btc_jpy |
| reentry mode | once_per_cycle (exit ≤1/cycle; R waits after next halving) |
| grid | E=[0, 90, 180] X=[365, 450, 540, 630, 730, 900] R=[30, 90, 180, 365] |
| n rules | 72 |

### Semantics note (important discovery)

A naive reading of `dsh>=X` after Re-entry inside the **same** cycle causes repeated exits
(threshold_repeat). That does **not** match「全撤退→次サイクル再DCA」.
A2 primary results use **once_per_cycle** only.

## 2. What is safe to explore vs overfitting risk

### Explorable in A2 (this run)

- Coarse calendar grids on `days_since_halving` for Entry delay and Exit
- Coarse calendar wait after full exit for Re-entry
- Full E×X×R enumeration on the **fixed** contract grid (72 rules)
- One-factor sweeps (vary X with E,R fixed, etc.) for mechanism reading
- Compare to pure DCA on the **same** window / cycle segment
- Stability across H2016 vs H2020 (N=2 — descriptive only)

### Overfitting / avoid as 'discovery of truth'

- Continuous day-by-day optimization of E/X/R
- Rules using in-cycle peak/trough or max drawdown breach from peak
- Expanding grid after seeing H2016/H2020 answers (forbidden without new contract version)
- Adding MVRV/flows/Nasdaq because they 'would have helped'
- Fitting different parameters per cycle then calling it one rule
- Using H2024 / post_etf to choose among rules (forbidden; reserved for C)
- Treating max full-window ROI as the strategy (ignores cycle stability & cash drag)

## 3. Benchmark: Pure DCA (no exit)

- Full window ROI: **1314.59%** | invested 13710000 | equity 193940427 | MDD -81.40%
- H2016 segment ROI: **251.54%**
- H2020 segment ROI (truncated pre-ETF): **135.08%**

## 4. One-factor sweeps (mechanism)

### Exit sweep (E=0, R=180)

| X | ROI | min(H16,H20) ROI | H2016 | H2020 | wait_days |
|---:|---:|---:|---:|---:|---:|
| 365 | 156.66% | 196.43% | 196.43% | 263.00% | 2190 |
| 450 | 222.42% | 127.11% | 344.01% | 127.11% | 2020 |
| 540 | 705.38% | 236.99% | 1120.72% | 236.99% | 1840 |
| 630 | 233.24% | 88.95% | 395.86% | 88.95% | 1660 |
| 730 | 189.31% | 49.19% | 341.42% | 49.19% | 1460 |
| 900 | 54.82% | 15.35% | 117.31% | 15.35% | 1120 |

### Entry sweep (X=540, R=180)

| E | ROI | min ROI | H2016 | H2020 |
|---:|---:|---:|---:|---:|
| 0 | 705.38% | 236.99% | 1120.72% | 236.99% |
| 90 | 510.34% | 164.52% | 852.72% | 164.52% |
| 180 | 340.74% | 82.35% | 599.13% | 82.35% |

### Re-entry sweep (E=0, X=540)

| R | ROI | min ROI | H2016 | H2020 | wait |
|---:|---:|---:|---:|---:|---:|
| 30 | 680.85% | 236.99% | 1120.72% | 236.99% | 1690 |
| 90 | 686.09% | 236.99% | 1120.72% | 236.99% | 1750 |
| 180 | 705.38% | 236.99% | 1120.72% | 236.99% | 1840 |
| 365 | 859.87% | 236.99% | 1120.72% | 236.99% | 2025 |

## 5. Full-grid discovery rankings (not freeze)

### Top 10 by min(H2016,H2020) ROI — stability-oriented

| rule_id | roi | min_cycle_roi | H2016_roi | H2020_roi | excess_roi_vs_pure | cash_wait_days | stability_flags |
|---|---|---|---|---|---|---|---|
| E0_X540_R365 | 859.87% | 236.99% | 1120.72% | 236.99% | -454.72% | 2025 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |
| E0_X540_R180 | 705.38% | 236.99% | 1120.72% | 236.99% | -609.22% | 1840 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |
| E0_X540_R90 | 686.09% | 236.99% | 1120.72% | 236.99% | -628.50% | 1750 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |
| E0_X540_R30 | 680.85% | 236.99% | 1120.72% | 236.99% | -633.74% | 1690 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |
| E0_X365_R30 | 217.84% | 196.43% | 196.43% | 263.00% | -1096.75% | 2040 | underperforms_pure_dca|long_cash_wait |
| E0_X365_R90 | 191.94% | 196.43% | 196.43% | 263.00% | -1122.65% | 2100 | underperforms_pure_dca|long_cash_wait |
| E0_X365_R180 | 156.66% | 196.43% | 196.43% | 263.00% | -1157.93% | 2190 | underperforms_pure_dca|long_cash_wait |
| E0_X365_R365 | 195.85% | 196.43% | 196.43% | 263.00% | -1118.74% | 2374 | underperforms_pure_dca|long_cash_wait |
| E90_X540_R30 | 508.62% | 164.52% | 852.72% | 164.52% | -805.97% | 1690 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |
| E90_X540_R90 | 508.62% | 164.52% | 852.72% | 164.52% | -805.97% | 1750 | roi_gap_gt_200pp|underperforms_pure_dca|long_cash_wait |

### Top 10 by full-window ROI — peak fit (higher overfit risk)

| rule_id | roi | min_cycle_roi | H2016_roi | H2020_roi | excess_roi_vs_pure | cash_wait_days |
|---|---|---|---|---|---|---|
| E0_X540_R365 | 859.87% | 236.99% | 1120.72% | 236.99% | -454.72% | 2025 |
| E0_X540_R180 | 705.38% | 236.99% | 1120.72% | 236.99% | -609.22% | 1840 |
| E0_X540_R90 | 686.09% | 236.99% | 1120.72% | 236.99% | -628.50% | 1750 |
| E0_X540_R30 | 680.85% | 236.99% | 1120.72% | 236.99% | -633.74% | 1690 |
| E90_X540_R365 | 629.35% | 164.52% | 852.72% | 164.52% | -685.24% | 2025 |
| E90_X540_R180 | 510.34% | 164.52% | 852.72% | 164.52% | -804.25% | 1840 |
| E90_X540_R30 | 508.62% | 164.52% | 852.72% | 164.52% | -805.97% | 1690 |
| E90_X540_R90 | 508.62% | 164.52% | 852.72% | 164.52% | -805.97% | 1750 |
| E180_X540_R365 | 421.13% | 82.35% | 599.13% | 82.35% | -893.46% | 2025 |
| E180_X540_R90 | 340.74% | 82.35% | 599.13% | 82.35% | -973.85% | 1750 |

### Rules that beat cycle-local pure DCA on **both** H2016 and H2020: **8** / 72

| rule_id | min_cycle_roi | H2016_excess_vs_cycle_pure | H2020_excess_vs_cycle_pure | cash_wait_days | equity_mdd |
|---|---|---|---|---|---|
| E0_X540_R30 | 236.99% | 869.19% | 101.91% | 1690 | -34.86% |
| E0_X540_R90 | 236.99% | 869.19% | 101.91% | 1750 | -34.86% |
| E0_X540_R180 | 236.99% | 869.19% | 101.91% | 1840 | -34.86% |
| E0_X540_R365 | 236.99% | 869.19% | 101.91% | 2025 | -34.86% |
| E90_X540_R30 | 164.52% | 601.19% | 29.44% | 1690 | -34.62% |
| E90_X540_R90 | 164.52% | 601.19% | 29.44% | 1750 | -34.62% |
| E90_X540_R180 | 164.52% | 601.19% | 29.44% | 1840 | -34.62% |
| E90_X540_R365 | 164.52% | 601.19% | 29.44% | 2025 | -34.62% |

## 6. What we see (analyst read)

- Pure DCA full-window ROI is 1314.59% — the bar for 'exit helps' across the multi-cycle window.
- In Exit sweep (E=0,R=180), best min-cycle X=540 (min-cycle ROI 236.99%); weakest min-cycle X=900 (15.35%).
- **X=540 is the standout Exit on this coarse grid** (near A1's H2016 descriptive peak ~525d — do **not** tighten grid toward 525; that would be peak-fitting).
- Entry delay (E>0) hurts on this grid; E=0 dominates.
- Re-entry R does **not** change cycle-local H2016/H2020 ROI under once_per_cycle (no next cycle inside a segment). R only changes the full-window path via when H2020 DCA restarts. Ranking R by min_cycle_roi is not informative.
- Full-window: longer R can raise ROI-on-invested by skipping early post-halving buys (less capital / different average entry) — not automatically a better strategy.
- Both-cycle beat vs cycle-pure = 8/72, all with **X=540** and E∈{0,90}.
- Every rule exits exactly **twice** in the window (once per cycle) under once_per_cycle.
- Full-window excess vs pure DCA is **negative for all 72 rules** — calendar full-exit did not beat never-sell DCA on total capital deployed in 2016-07→2024-01.
- Feature: on H2016/H2020 segments, X=540 timed exits beat segment pure DCA; as a multi-year wealth path, idle cash after exit is expensive vs staying invested.

## 7. Promising patterns for A3 review (not frozen)

**Pattern A — both cycles beat cycle-local pure DCA:**
- `E0_X540_R*` (R=30/90/180/365) — same cycle-local scores; choose R in A3 by policy / full-window / tax, not by min_cycle
- `E90_X540_R*` — weaker both-cycle beat; likely discard unless delayed Entry is desired for policy

**Pattern B — Exit discovery to carry forward:**
- Document **X=540** as the primary Exit finding on the contract grid
- Keep a contrast Exit (e.g. X=365 or X=730) in candidate_set only if A3 wants regime diversity — not because they win

**Pattern C — early vs late Exit:**
- X=540 >> X=365/450 and >> X=630/730/900 on min-cycle in this window
- Late exits still force long cash wait after the single exit and trail badly vs pure DCA full-window

**Rejected semantics:** `threshold_repeat` (re-exit every R days while dsh≥X) — not used in primary tables; mismatches「次サイクル再DCA」.

## 8. Overfitting concerns

- N=2 completed explore cycles only; any 'best' rule is anecdotal.
- H2020 truncated before ETF/halving overlap by design — full-cycle truth not claimed.
- Full-window ROI favors rules that stayed invested through 2020–2021 blow-off; may conflict with 'full exit' intent.
- If both-cycle beat set is empty/small, the honest discovery may be: **pure DCA dominates coarse calendar exits** in-sample.
- Do not expand X grid toward observed A1 peaks (e.g. ~525d) after seeing results — that would be peak-adjacent fitting.

## 9. A3 freeze discussion points (stop here — do not freeze in A2)

1. Is the goal to beat pure DCA, or to encode an intentional full-exit risk policy even if ROI is lower?
2. Prefer max ROI champions vs min-cycle / both-cycle survivors?
3. How much cash-wait is acceptable for the 'full exit' philosophy?
4. Keep multiple X regimes (early vs late exit) in candidate_set rather than one champion?
5. Entry delay (E>0) appears secondary in sweeps — freeze E=0 unless there is a policy reason?
6. Re-entry wait: economic meaning vs noise on N=2?
7. Tax scenario (30%) may flip rankings when exits crystallize gains — run before A3 freeze?
8. Confirm eval_end truncation policy remains acceptable for A3 narrative.

## 10. Artifacts

- `research/btc_dca_halving/a2/a2-2026-08-27/`
- `grid_results.csv`, `cycle_segment_results.csv`
- `sweep_exit_E0_R180.csv`, `sweep_entry_X540_R180.csv`, `sweep_reentry_E0_X540.csv`
- `exploration_summary.json`, `run_meta.json`, `A2_REPORT.md`

## 11. Stop line

A3 / B / C / D **not** started. H2024 not used for selection.
