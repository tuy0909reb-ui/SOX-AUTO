# FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0

**Document ID:** `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0`  
**Title:** Trade Report 入力経路 — 実運用相当確認（Adapter / Port / Validation）  
**種別:** Input Path Verification  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0.md`  
**Status:** **PASS**  

**Scope:** Discord slash → Input Adapter → Preview → Confirm → `TradeReportPort` → Validation → Fact  
**Out of scope:** 表示改訂 / Protocol / Logic / Schema / ライブ Discord クライアント操作  

**Test harness:**

- `tests/test_taxable_account_trade_report_input_path.py`（本確認の正）
- `tests/test_taxable_account_discord_trade_input.py`（既存 Adapter 回帰）

**実行結果:** `17 passed`（上記2ファイル合算）

---

## 判定

### **PASS**

入力経路（Choice / 価格 / YYYYMMDD / 数量 / Preview / 確定 / Fact、Reject、Cancel）は  
本番ロジックを変更せず、Adapter+Port 経路で確認できた。

---

## 1. 購入報告

| ステップ | 結果 | 根拠 |
|---|---|---|
| 銘柄 Choice（`1570`） | PASS | draft + bot source Choice values |
| 約定価格 | PASS | Fact `trade_price=1000.0` |
| 約定日 YYYYMMDD | PASS | `20240801` → Fact `2024-08-01` |
| 数量 | PASS | Fact `quantity=10.0` |
| Preview 確認 | PASS | `購入対象` / `現在保有` / 日付・数量。Preview で State 不変 |
| 確定 | PASS | `confirm_and_submit` → Port |
| Fact 生成 | PASS | Journal `ACCEPTED`, `source=DISCORD`, `confirm_flag=True` |

Test: `test_1_buy_choice_price_yyyymmdd_qty_preview_confirm_fact`

---

## 2. 売却報告

| ステップ | 結果 | 根拠 |
|---|---|---|
| 銘柄 Choice | PASS | `1570` |
| 現在保有表示 | PASS | Preview に `現在保有` + 保有銘柄 |
| 約定価格 / 日 / 数量 | PASS | YYYYMMDD + Fact |
| Preview → 確定 → Fact | PASS | `ACCEPTED` SELL、保有が CASH へ同期 |

Test: `test_2_sell_choice_held_preview_confirm_fact`

---

## 3. Reject

| ケース | State 変更 | ACCEPTED Fact | 結果 |
|---|---|---|---|
| 不正銘柄 | なし | なし（Journal 未作成） | PASS — draft 前に失敗 |
| 不正日付（形式） | なし | なし | PASS — draft 前に失敗 |
| 不正日付（未来） | なし | なし（`REJECTED` 行のみ） | PASS |
| 保有不一致 | なし | なし（`REJECTED` 行のみ） | PASS — `sell_asset_mismatch` |
| 重複報告 | 2回目で Position 不変 | 2回目は `REJECTED` | PASS — `duplicate_report_id` |

### 「Fact生成なし」の解釈（確認済み）

| 段階 | Journal |
|---|---|
| Adapter 入力エラー（銘柄・日付形式） | **行なし** |
| Port Validation Reject | HTR どおり **`REJECTED` 行は append**（`routed_event=null`）。**ACCEPTED / Position 更新 Fact ではない** |
| 運用確認の意図 | Reject で State が進まない / 約定完了 Fact が立たない → **満たす** |

---

## 4. Cancel

| 項目 | 結果 |
|---|---|
| Cancel 後 Fact | **なし**（Journal ファイル未作成） |
| Cancel 後 State | **不変**（`ENTRY_READY` 維持） |

Test: `test_4_cancel_no_fact_no_state_change`

---

## 経路図（確認対象）

```text
Discord slash (/report_buy|/report_sell) + Choice
  → DiscordTradeInputAdapter.create_draft
  → preview_text（表示写像のみ・State 非変更）
  → Confirm「確認する」
  → Adapter.confirm_and_submit
  → TradeReportPort.submit（Validation）
  → Journal append +（受理時のみ）Routing → State
```

ライブ Discord UI クリックは本記録の対象外（同一 Adapter/Port 契約を単体で確認）。

---

## 制約遵守

| 制約 | 結果 |
|---|---|
| 表示変更なし | PASS（テスト・レポートのみ） |
| Protocol / Logic / Schema 変更なし | PASS |
| 入力経路のみ確認 | PASS |

---

## Version

```text
Status: PASS
FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0
Tests: test_taxable_account_trade_report_input_path.py (+ discord_trade_input regression)
Code production: NONE
```
