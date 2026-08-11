# Common Backtest Data Storage

**Store ID:** `SOX-AUTO-COMMON-BACKTEST-DATA-1.0`  
**Policy:** source files are never modified — only **copy** / **readonly export** / **reference**.

## Purpose

Single entry point for reusable historical data discovered across:

- `SOX-AUTO/data/backtest`
- `SOX-AUTO/logs/portfolio/portfolio.db`
- `SOX-AUTO/research`
- `NISA_BACKTEST` official NAV / holdings

## Layout

```text
data/common_backtest/
  README.md
  catalog.json                 # full inventory + checksums
  datasets/
    index_daily/               # ^SOX ^IXIC NQ=F JPY=X ^VIX
    etf_adj_close_daily/       # SOXX FNGS QQQ MEGA10_PROXY + FX (from DB export)
    fund_nav_daily/            # NISA panels + normalized NAV
      sources/                 # vendor-format originals (copies)
    holdings_snapshots/        # semiconductor weights (not prices)
    research_panels/           # research CSV panels
    protocol_derived/          # SOX protocol panel (regenerable)
```

## Rebuild / refresh

```bash
python organize_common_backtest_data.py
python organize_common_backtest_data.py --dry-run
```

## Price-type warning

Do **not** mix blindly:

| Location | Price type |
|---|---|
| `index_daily/` | Close + Adj Close (`auto_adjust=False`) |
| `etf_adj_close_daily/` | Yahoo adj close (`auto_adjust=True`) |
| `fund_nav_daily/` | Fund reinvestment NAV / SOXX official NAV |
| `holdings_snapshots/` | Weights only |

## Gaps (documented in catalog)

- `^NDX` history: not stored (live fetch only)
- `SMH` history: not stored
- `MEGA10_OFFICIAL` / `MEGA10_FUND` in DB: empty

## Authority

This store is an **organization / convenience layer**.  
Protected NISA panels and portfolio Fact SoT remain authoritative at their original paths.
