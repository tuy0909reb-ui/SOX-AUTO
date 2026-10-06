# BTC D — Difference Explanation (descriptive)

**Record:** `BTC-COMPLETE-D-DIFFERENCE-EXPLANATION-001`

Explain observed C differences descriptively; not trading signals; no causation claims

## Confound reminder

H2024: T_primary=2024-01-11, halving SoT=2024-04-19 (user also notes 2024-04-20). ETF start and halving are proximate; do not attribute to ETF alone.

## Period descriptors

{
  "pre_halving_post_etf_H2020_tail": {
    "label": "pre_halving_post_etf",
    "start": "2024-01-11",
    "end": "2024-04-18",
    "n_bars": 99,
    "btc_return": 0.4506422981878355,
    "btc_vol_ann": 0.619864496705502,
    "btc_mdd": -0.1440972317553857
  },
  "H2024_post_halving": {
    "label": "H2024_post_halving",
    "start": "2024-04-19",
    "end": "2026-08-27",
    "n_bars": 861,
    "btc_return": 0.2936114281090494,
    "btc_vol_ann": 0.4712879723728537,
    "btc_mdd": -0.4944599053790377
  }
}

## Macro period level changes (QQQ / US10Y / DXY)

{
  "QQQ_pre_halving_post_etf": {
    "start": "2024-01-11",
    "end": "2024-04-18",
    "level_change_pct": 0.035714873945681624
  },
  "QQQ_H2024_post_halving": {
    "start": "2024-04-19",
    "end": "2026-08-27",
    "level_change_pct": 0.7601125907995725
  },
  "US10Y_pre_halving_post_etf": {
    "start": "2024-01-11",
    "end": "2024-04-18",
    "level_change_pct": 0.16846865431146463
  },
  "US10Y_H2024_post_halving": {
    "start": "2024-04-19",
    "end": "2026-08-27",
    "level_change_pct": 0.012351064581629378
  },
  "DXY_pre_halving_post_etf": {
    "start": "2024-01-11",
    "end": "2024-04-18",
    "level_change_pct": 0.03773585468573026
  },
  "DXY_H2024_post_halving": {
    "start": "2024-04-19",
    "end": "2026-08-27",
    "level_change_pct": -0.06614228565444569
  }
}

## Descriptive correlations (post H2024 halving)

{
  "btc_qqq_daily_post_h24_halving": 0.3659345005200832,
  "btc_us10y_daily_post_h24_halving": 0.0394529971851886,
  "btc_dxy_daily_post_h24_halving": -0.054154864892706274
}

## IBIT proxy (not official flow)

{
  "ibit_avg_daily_notional_proxy": 2169112421.6111236,
  "ibit_notional_proxy_sum": 1429445085841.7305,
  "note": "Volume×Close proxy; not official ETF flow SoT"
}

## Unavailable in v1 pipeline

{
  "MVRV": "Not fetched — no v1 Yahoo SoT; would require external on-chain source",
  "Realized_Price": "Not fetched — same",
  "OI_Funding_Netflow_FNG": "Not fetched — no v1 data contract path in repo"
}

## C differences referenced

[
  {
    "comparison": "H2024 E0_X365_R180 vs E0_X540_R180 excess_vs_pure",
    "delta": -0.28820101349773775
  },
  {
    "comparison": "H2024 E0_X730_R180 vs E0_X540_R180 excess_vs_pure",
    "delta": -0.42901556187776957
  },
  {
    "comparison": "H2024 E0_X540_R180 exit_dsh vs X",
    "exit_dsh": 540,
    "X": 540
  },
  {
    "comparison": "H2024 E0_X365_R180 exit_dsh vs X",
    "exit_dsh": 365,
    "X": 365
  },
  {
    "comparison": "H2024 E0_X730_R180 exit_dsh vs X",
    "exit_dsh": 730,
    "X": 730
  }
]

## Limitations

- Correlation ≠ causation
- IBIT proxy ≠ official net flow
- MVRV/OI/F&G not in v1 pipeline
- H2024 incomplete vs completed historical cycles

## Final synthesis (7 questions)

### 1. Did X=540 function similarly in H2024?
- Exit fired at dsh=540 (X=540) on 2025-10-11.
- H2024 cycle excess vs pure DCA: 32.52%.
- Mechanically the frozen 540-day rule applied; whether that is 'similar function' to H2016/H2020 is **not proven** (incomplete cycle, ETF/halving confound).

### 2. How did 365/540/730 relative relations change?
- H2024 rank by cycle excess vs pure: [('E0_X540_R180', 0.32522502520793206), ('E0_X365_R180', 0.037024011710194316), ('E0_X730_R180', -0.10379053666983751)].
- 365 excess 3.70%, 540 32.52%, 730 -10.38%.
- Compare to H2016/H2020 ranks in C artifacts for shrink/flip observation.

### 3. Halving-cycle rule behavior post-ETF
- All three rules executed once-per-cycle exits in H2016/H2020; H2024 exit occurred where dsh reached X.
- Post-exit paths differ by X; H2024 often ends FLAT (no next cycle to re-enter).

### 4. Observed differences
[
  {
    "comparison": "H2024 E0_X365_R180 vs E0_X540_R180 excess_vs_pure",
    "delta": -0.28820101349773775
  },
  {
    "comparison": "H2024 E0_X730_R180 vs E0_X540_R180 excess_vs_pure",
    "delta": -0.42901556187776957
  },
  {
    "comparison": "H2024 E0_X540_R180 exit_dsh vs X",
    "exit_dsh": 540,
    "X": 540
  },
  {
    "comparison": "H2024 E0_X365_R180 exit_dsh vs X",
    "exit_dsh": 365,
    "X": 365
  },
  {
    "comparison": "H2024 E0_X730_R180 exit_dsh vs X",
    "exit_dsh": 730,
    "X": 730
  }
]

### 5. Factors that may explain (not causal)
- BTC–QQQ daily correlation post H2024 halving: 0.3659345005200832
- BTC–US10Y daily correlation post H2024 halving: 0.0394529971851886
- BTC–DXY daily correlation post H2024 halving: -0.054154864892706274
- IBIT notional proxy: see D dataset (volume×close, not net flow)
- Macro period level changes (QQQ/US10Y/DXY): see D macro_period_changes section.
- ETF/halving timing overlap documented; no single-factor attribution.

### 6. Unexplained / data-limited
- MVRV, Realized Price, OI/Funding/Netflow/F&G not in v1 fetch path.
- Incomplete H2024 vs completed historical cycles.
- No fixed comparable/degraded thresholds.

### 7. Judgment possible / impossible
**Possible:** describe exit timing, relative X ranking in H2024, cash-flat terminal states, descriptive macro co-movement post-ETF.
**Impossible:** adopt/refute strategy, claim ETF caused outcomes, prove X=540 edge persists, or classify comparable/degraded with authority until thresholds fixed.

**No investment decision or strategy change.**
