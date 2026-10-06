# Common Backtest Monthly Refresh

**Retrieved:** `2026-10-06T16:00:53Z` → `2026-10-06T16:01:08Z`  
**ok:** `True`

## Index panels

| name | before_last | after_last | added | ok |
| --- | --- | --- | --- | --- |
| sox | 2026-10-06 | 2026-10-06 | 0 | OK |
| vix | 2026-10-06 | 2026-10-06 | 0 | OK |
| nasdaq | 2026-08-31 | 2026-10-06 | 25 | OK |
| jpy | 2026-09-30 | 2026-10-05 | 8 | OK |
| nq_f | 2026-10-05 | 2026-10-06 | 1 | OK |

## Steps

```json
[
  {
    "step": "sync_data_backtest_raw",
    "copied": [
      "sox_daily.csv",
      "vix_daily.csv",
      "nasdaq_daily.csv",
      "jpy_daily.csv",
      "nq_f_daily.csv"
    ],
    "missing": []
  },
  {
    "step": "taxable_required",
    "ok": true,
    "job": "Data_AM_Refetch",
    "series": [
      {
        "name": "n225",
        "path": "data/common_backtest/datasets/regime_proxies/n225_daily.csv",
        "added_rows": 0,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      },
      {
        "name": "1570",
        "path": "data/common_backtest/datasets/swing_assets_daily/1570.csv",
        "added_rows": 0,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      },
      {
        "name": "soxx",
        "path": "data/common_backtest/datasets/fund_nav_daily/soxx_etf_nav.csv",
        "added_rows": 1,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      },
      {
        "name": "sox",
        "path": "data/common_backtest/datasets/index_daily/sox_daily.csv",
        "added_rows": 0,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      },
      {
        "name": "nq",
        "path": "data/common_backtest/datasets/index_daily/nq_f_daily.csv",
        "added_rows": 0,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      },
      {
        "name": "proxy_c",
        "path": "data/common_backtest/datasets/japan_semiconductor_proxy/proxy_index.csv",
        "added_rows": 0,
        "last_date": "2026-10-06",
        "ok": true,
        "error": ""
      }
    ],
    "notes": []
  },
  {
    "step": "portfolio_export",
    "ok": true,
    "actions": [
      {
        "status": "exported_readonly",
        "source": "C:\\Users\\User\\SOX-AUTO\\logs\\portfolio\\portfolio.db",
        "source_sha256": "2d09a21cb9a69598bd3b8bfc3e7bfe1b8f1d222c039d171167141f5d87126e62",
        "table": "asset",
        "dest": "C:\\Users\\User\\SOX-AUTO\\data\\common_backtest\\datasets\\etf_adj_close_daily\\asset.csv",
        "rows": 6,
        "dest_sha256": "b5b478587e0b9f3e0785e0994cd23b951215e8f49bacf8b5d716327f66575d5b"
      },
      {
        "status": "exported_readonly",
        "source": "C:\\Users\\User\\SOX-AUTO\\logs\\portfolio\\portfolio.db",
        "source_sha256": "2d09a21cb9a69598bd3b8bfc3e7bfe1b8f1d222c039d171167141f5d87126e62",
        "table": "market_daily",
        "dest": "C:\\Users\\User\\SOX-AUTO\\data\\common_backtest\\datasets\\etf_adj_close_daily\\market_daily.csv",
        "rows": 4772,
        "dest_sha256": "02be6934469e74788850e6628c670aa0eb34e0871fa80953485de0d62816d3ed"
      },
      {
        "status": "exported_readonly",
        "source": "C:\\Users\\User\\SOX-AUTO\\logs\\portfolio\\portfolio.db",
        "source_sha256": "2d09a21cb9a69598bd3b8bfc3e7bfe1b8f1d222c039d171167141f5d87126e62",
        "table": "fx_daily",
        "dest": "C:\\Users\\User\\SOX-AUTO\\data\\common_backtest\\datasets\\etf_adj_close_daily\\fx_daily.csv",
        "rows": 1236,
        "dest_sha256": "a9cc5e76b35077fc91a4bf1ca40ffa7ec67f64c96582fe92e46545d7d9ce6b53"
      }
    ]
  },
  {
    "step": "research_bitcoin_panel",
    "ok": true,
    "before_last": "2026-07-17",
    "after_last": "2026-10-06",
    "panel_start": "2014-09-17",
    "mirrored_to": "data/common_backtest/datasets/research_panels/bitcoin_panel.csv"
  }
]
```

```text
判断可能範囲: 系列最終日の延長・欠損埋め・鮮度確認
判断禁止範囲: 戦略採用 / Protocol変更 / portfolio.db書き込み
```
