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
# One-shot inventory rebuild (copy/export catalog)
python organize_common_backtest_data.py
python organize_common_backtest_data.py --dry-run

# Monthly sample extension (indexes / taxable REQUIRED / portfolio export / bitcoin panel)
python scripts/common_backtest/run_monthly_refresh.py
npm run data:monthly-refresh
```

**Cadence (Human 2026-10-07):** month 1 × — GitHub Actions
`.github/workflows/monthly-data-refresh.yml` (also runs BTC Observation Refresh).

Dated memos: `data/common_backtest/obs/monthly-YYYY-MM-DD/`

## Monthly Growth / peer accumulation monitor

Accumulation Review only (not Decision). Syncs Nomura / SOXX / 2243 / Nissay / Mega10
(+ MEGA10_PROXY) and writes a Human-checkable report. Does **not** overwrite sealed
`reports/taxable_growth_asset_reverification/`.

**Nomura daily NAV:** fetched automatically from Nomura AM
`download.php?fundcd=140471` (分配金再投資基準価額 → panel + swing_assets).

```bash
python run_monthly_growth_monitor.py
python run_nomura_official_nav_refresh.py          # Gate 机上確認用
python run_bootstrap_gate_briefing.py --discord-live   # 朝の購入戦略連絡
python setup_monthly_growth_monitor_scheduler.py --install   # MONTHLY day=1 10:00
python setup_bootstrap_gate_scheduler.py --install           # 平日 08:15 Discord
```

Output: `reports/monthly_growth_monitor/YYYY-MM/HUMAN_CHECK.md`  
Bootstrap board: `reports/taxable_growth_bootstrap_gate/YYYY-MM-DD/HUMAN_CHECK.md`  
Stop daily Bootstrap Discord: `data/ops/bootstrap_gate_briefing.json` → `enabled: false`

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
