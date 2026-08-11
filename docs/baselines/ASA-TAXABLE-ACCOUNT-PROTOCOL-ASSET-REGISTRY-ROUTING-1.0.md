# ASA-TAXABLE-ACCOUNT-PROTOCOL-ASSET-REGISTRY-ROUTING-1.0

# Asset Registry / Routing Policy — Interface Extension Freeze

**Status:** **IMPLEMENTED**（Interface Extension）  
**Version:** 1.0  
**Date:** 2026-08-06  
**Freeze ID:** ASA-TAXABLE-ASSET-REGISTRY-ROUTING-1.0  
**Classification:** Operational Interface Extension  
**Protocol Rule Change:** **NO**  
**Parent:** ASA-TAXABLE-HTR-PORT-FJ-1.0

---

## 1. Purpose

Trade Fact Port を特定 asset ハードコードから分離し、
Taxable Account 全取引 Fact 基盤として:

`	ext
Asset → Registry → Sleeve / Routing Policy → Domain Events
`

を成立させる。

完成条件 = **B**（Asset/Sleeve/Routing 分離済みで将来商品変更可能）

---

## 2. Asset Registry（Metadata only）

| Field | Role |
|---|---|
| asset_id | Canonical Asset |
| aliases | Discord / Human input aliases |
| sleeve | GROWTH / SWING / CASH |
| routing_policy | SWING_POSITION / GROWTH_REGIME / NONE |
| asset_type | ETF / FUND / CASH |
| active | Tradeable gate |

**Must not store:** Selection rules, Risk formulas, Time Exit, Detection thresholds.

Seed:

| Asset | Sleeve | Policy |
|---|---|---|
| NIKKEI_LEV_1570 | SWING | SWING_POSITION |
| SEMI_282A | SWING | SWING_POSITION |
| NOMURA_WORLD_SEMI | GROWTH | GROWTH_REGIME |
| CASH | CASH | NONE |

---

## 3. Routing Policies

### SWING_POSITION

既存維持:

- BUY: ENTRY_FILLED / DELAYED_FILL_RECOVERY
- SELL: EXIT_FILLED（+ internal ABNORMAL_EXIT when ACTIVE）

### GROWTH_REGIME

既存 Regime イベントへ接続（Swing ENTRY/EXIT SM を使わない）:

| Fact | Guard | Routed event |
|---|---|---|
| SELL | EXIT_PENDING + held match | TRANSFER_COMPLETE |
| BUY | REENTRY_PENDING | RECOVERY_COMPLETE |

ALERT_ON / Detection は Fact が発火しない（Fact ≠ Command）。

---

## 4. Boundaries (unchanged)

- Trade Fact ≠ Command
- Decision / Risk / Time / Selection 条件式 **UNCHANGED**
- 第二 Port 禁止
- Ledger 化禁止
- Discord slash Schema 変更なし（alias 解決のみ Registry へ）

---

## 5. Product change rule

新 Swing ETF / Growth 商品:

1. Asset enum（または同等 ID）追加が必要な場合のみ domain Asset 拡張
2. Registry に record 追加（sleeve + routing_policy + aliases）
3. Selection 表の更新は別 Protocol CR（本 Freeze 外）

Port / Journal Schema は原則無改修。

---

## 6. STOP

- Port に個別 asset if を戻す
- Trade Fact を Command 化する
- Protocol 判断を Asset Registry へ移す
