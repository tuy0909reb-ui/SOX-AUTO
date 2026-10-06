# BTC A1 — Descriptive Statistics (Price + Halving Calendar)

**Record:** `BTC-COMPLETE-A1-DESCRIPTIVE-STATISTICS-001`
**Status:** COMPLETE — Phase A1 only
**Contract:** `btc-dca-halving-contracts-v1.0-approved`
**data_version:** `a1-2026-10-06`
**retrieved_at (UTC):** `2026-10-06T14:25:46Z`

```text
Phase: A1 only
NOT done: E/X/R exploration, candidate_set, extra indicators, adoption judgment
Peaks/bottoms: descriptive observation only — forbidden as rule inputs
```

## Data contract summary

| Item | Value |
|---|---|
| price_source | Yahoo Finance BTC-USD (auto_adjust=True) |
| fx_source | Yahoo Finance JPY=X (USDJPY, auto_adjust=True) |
| timezone / bar | utc_calendar_date_yahoo_daily_close |
| execution price | Yahoo daily Close |
| JPY conversion | btc_jpy = btc_usd * usdjpy |
| FX missing | reindex to BTC spine + ffill only |
| BTC missing | drop row |
| linear interpolation | forbidden / not used |
| T_approve | 2024-01-10 |
| T_primary | 2024-01-11 |
| panel | 2014-09-17 → 2026-10-06 (4403 rows) |

## Halving calendar SoT

| cycle_id | halving_date | role |
|---|---|---|
| H2012 | 2012-11-28 | descriptive_only_if_in_panel |
| H2016 | 2016-07-09 | explore_select |
| H2020 | 2020-05-11 | explore_select |
| H2024 | 2024-04-19 | post_etf_validation_incomplete |

## H2024 × ETF confound (required)

H2024 halving (2024-04-19) is close to US spot BTC ETF public trading start (T_primary=2024-01-11; T_approve=2024-01-10). post_etf early period and post-halving path overlap. Do not attribute outcomes to a single factor (ETF vs halving).

## Cycle descriptive table

| cycle_id | complete | coverage | n | USD cycle ret | JPY cycle ret | MDD USD | days halv→peak* |
|---|---|---|---:|---:|---:|---:|---:|
| H2012 | False | partial_mid_cycle | 661 | 45.7% | 37.1% | -61.1% | — |
| H2016 | True | full_from_halving | 1402 | 1245.2% | 1319.5% | -83.4% | 525 |
| H2020 | True | full_from_halving | 1439 | 638.4% | 965.9% | -76.6% | 1402 |
| H2024 | False | full_from_halving | 901 | 34.7% | 37.4% | -53.1% | 535 |

\* `days halv→peak` = descriptive in-cycle peak after halving; **not a rule input**.

## Match windows from halving (USD return)

### H2012

| W | end | return | MDD | vol_ann |
|---:|---|---:|---:|---:|

### H2016

| W | end | return | MDD | vol_ann |
|---:|---|---:|---:|---:|
| 180 | 2017-01-05 | 55.7% | -19.4% | 41.0% |
| 365 | 2017-07-09 | 286.9% | -32.6% | 58.1% |
| 400 | 2017-08-13 | 525.7% | -34.8% | 67.0% |
| 540 | 2017-12-31 | 2074.7% | -35.5% | 80.9% |

### H2020

| W | end | return | MDD | vol_ann |
|---:|---|---:|---:|---:|
| 180 | 2020-11-07 | 72.4% | -17.3% | 48.6% |
| 365 | 2021-05-11 | 559.2% | -25.4% | 66.7% |
| 400 | 2021-06-15 | 369.7% | -47.3% | 72.6% |
| 540 | 2021-11-02 | 635.0% | -53.1% | 71.9% |

### H2024

| W | end | return | MDD | vol_ann |
|---:|---|---:|---:|---:|
| 180 | 2024-10-16 | 5.9% | -24.5% | 49.5% |
| 365 | 2025-04-19 | 33.2% | -28.1% | 51.2% |
| 400 | 2025-05-24 | 68.8% | -28.1% | 50.3% |
| 540 | 2025-10-11 | 73.6% | -28.1% | 46.3% |

Confound descriptive extras:
- days T_primary→halving: 99
- bars post_etf before halving: 99
- USD return T_primary→halving: 37.7%

## Artifacts

Directory: `C:/Users/User/SOX-AUTO/research/btc_dca_halving/a1/a1-2026-10-06`

- `run_meta.json`
- `btc_usd_daily.csv`
- `usdjpy_daily.csv`
- `panel_daily.csv`
- `descriptive_halving.json`
- `figures/`
- `A1_REPORT.md` (this file)

## Next phase

A2 (E→X→R exploration) is **not** started.
