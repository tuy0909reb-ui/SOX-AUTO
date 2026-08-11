# FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-LIVE-VERIFY-1.0

**Document ID:** `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-LIVE-VERIFY-1.0`  
**Date:** 2026-08-08  
**Status:** **PASS**（API + 実機確認）  

**制約:** Protocol / Decision / Fact·Journal Schema / Display·Evidence Freeze 変更なし  

---

## 1. Bot / slash sync

| 項目 | 結果 |
|---|---|
| 起動後プロセス | **ALIVE**（`python -m taxable_account.ops.discord_trade_bot`） |
| on_ready | `SOX_BOT#3369` / guild `1524165216038945018` |
| slash sync | guild upsert — primary names **`購入報告` / `売却報告`** |
| journal（検証用） | `data/ops/taxable_trade_facts_live_verify.jsonl` |

---

## 2. Discord API

| 確認 | 結果 |
|---|---|
| 正式コマンド名（primary） | **購入報告** / **売却報告** |
| asset → ja | **銘柄** |
| price → ja | **約定価格** |
| trade_date → ja | **約定日** |
| quantity → ja | **数量** |
| Choice | **1570** / **282A** / **野村世界半導体株投資** |
| 旧 `report_buy` / `report_sell` | **正式入口ではない**（API 上も primary としては未登録） |

**API 判定:** **PASS**

---

## 3. 実機確認（Discord クライアント）

| 項目 | 状態 |
|---|---|
| 正式入口 `/購入報告` `/売却報告` | **PASS**（Human 実機確認済） |
| 日本語入力項目（銘柄 / 約定価格 / 約定日 / 数量） | **PASS** |
| 銘柄 Choice（1570 / 282A / 野村世界半導体株投資） | **PASS** |
| 入力操作（Preview → 確認） | **PASS**（購入・売却） |

---

## 4. 総合

| 層 | 判定 |
|---|---|
| Bot 再起動 + sync | **PASS** |
| Discord API 定義 | **PASS** |
| 実 Discord UI | **PASS** |

**完了判定:** **PASS**

```text
Formal Human entry:
  /購入報告
  /売却報告

Not formal entry:
  /report_buy
  /report_sell
```
