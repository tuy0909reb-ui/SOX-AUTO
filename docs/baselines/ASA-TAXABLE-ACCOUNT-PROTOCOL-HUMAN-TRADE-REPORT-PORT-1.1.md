# ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.1

# Human Trade Report Port / Fact Journal — Freeze Design Record

**Status:** **FROZEN**  
**Version:** `1.1`  
**Date:** 2026-08-08  
**Freeze ID:** `ASA-TAXABLE-HTR-PORT-FJ-1.1`  
**Classification:** Operational Interface Extension + Runtime Extension + Operational Data Layer  
**Protocol Rule Change:** **NO**  
**Implementation Authorization:** **AUTHORIZED**（本Freeze範囲内のみ；1.0 実装を継承）  

**Predecessor（preserved — do not overwrite）:**

- Design: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`
- Freeze ID: `ASA-TAXABLE-HTR-PORT-FJ-1.0`
- Registration: `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`
- Digest (1.0): `5b499d9b47ccc9b56adc8a4db21ca75b61c18db2ee529e6bb1574c70ce108e06`

**1.1 delta（additive only — Protocol Rule Change: NO）:**

- §4.1 Asset Registry / Routing dispatch note（parent §4 semantics preserved）
- Discord Trade Report Interaction = Input Adapter **IN**（Dashboard は OUT のまま）
- Fact Schema / Journal / Decision / Entry·Exit·Risk 条件は 1.0 と同一

**Parent / authority:**

- Final Design Review: APPROVE（Architecture / Runtime Owner）— 1.0 継承
- Human Decision: APPROVE FREEZE 1.1（formalize working-tree additive notes；1.0 digest 保持）
- Human Correction (1.0): quantity を Trade Fact 保存項目へ復元（Protocol 条件変更ではない）
- Related: `ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0`（Entry/Exit/Risk/Selection 条件は非改訂）
- Related: `ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0`（Position SoT / ENTRY_FILLED 意味を維持）
- Related: `ASA-TAXABLE-ACCOUNT-PROTOCOL-ASSET-REGISTRY-ROUTING-1.0.md`

---


## 1. Freeze meaning

本記録は、証券世界の取引事実を Runtime へ接続する**正式入力境界**と、
その証拠保存（Fact Journal）を固定する。

```text
Human Trade Report = Runtime 同期 + 取引 Fact 蓄積
```

「第一CR範囲を小さくする」ことを理由に、将来価値のある Fact 情報を削除してはならない。  
quantity の Fact 保存は本 Port の本来目的への復元であり、Protocol 条件変更ではない。

変更には明示的な Human 認可と再 Design Review が必要。  
ad-hoc 実装拡張で本境界を歪めてはならない。

---

## 2. Human Trade Report Port（外部入力境界）

```text
Human / Broker
    ↓
Trade Fact Input Port
    ↓
Validation
    ↓
Fact Journal append
    ↓
Domain Event Routing
    ↓
Position State
```

### Fixed rules

| Rule | Definition |
|---|---|
| External contract | Trade Fact のみ（asset / side / trade_date / trade_price / quantity / confirm 等） |
| Forbidden input | Internal Event 名（`DELAYED_FILL_RECOVERY` 等）を人間に選ばせない |
| Fact ≠ command | Trade Fact は事実報告であり State 変更命令ではない |
| No direct State write | Input → Domain Event → State のみ。POSITION_ACTIVE 直書き禁止 |

### Responsibility separation

| Layer | Role |
|---|---|
| **Trade Fact** | 実際に発生した取引事実を保存する（証拠 / 将来分析の一次データ） |
| **Position State** | 現在の Runtime 状態管理のみ行う |

`quantity` 保存は **Ledger 化ではない**。  
平均取得単価・部分約定・残数量・損益・税務は別 CR。

### Human fields（BUY / SELL 共通）

**Required from Human（routing + Fact）:**

- `asset`
- `side`（`BUY` / `SELL`）
- `trade_date`
- `trade_price`
- `quantity` — 約定数量。取引事実として append-only Journal に保持する一次データ（正の数必須）  
  - **禁止:** Position 制御 / Risk 変更 / Time Exit 変更 / Entry・Exit 判定への利用
- `confirm_flag`

**Attached by Runtime（not Human-authored internal knowledge）:**

- `reported_at`
- `source`
- `report_id`
- `signal_date`（State/機会から。無ければ null / 補完規則は実装CR）
- `regime_at_report`
- `position_before` / `position_after`
- `routed_event`
- `reject_reason`（拒否時）

---

## 3. Fact Journal

| Property | Value |
|---|---|
| Role | Operational Evidence / Analysis Fact |
| Mutability | append-only / immutable records |
| Coverage | success **and** reject |
| Minimum saved fields | `report_id`, `asset`, `side`, `trade_date`, `trade_price`, **`quantity`**, `reported_at`, `source`, `confirm_flag`, `validation_result`, `routed_event`, `reject_reason` + Runtime 付与項目 |
| Not | Position State の代替 SoT |
| Not | Protocol 自動変更の入力 |
| Not | Ledger / 会計エンジン |

Offline Analysis → Human Review → 別 CR / 再 Freeze のみ。  
Fact Journal から Decision Engine へ直接フィードバックしない。

Schema: `docs/schemas/taxable_account_trade_fact.schema.json`

---

## 4. Routing Rules（frozen）

### Normal BUY

```text
ENTRY_READY
  → ENTRY_FILLED
  → POSITION_ACTIVE
```

### Delayed BUY（internal only）

External: Trade Fact BUY  
Internal Event: `DELAYED_FILL_RECOVERY`（人間非公開）

**Guards（all required）:**

- `regime == SWING_ACTIVE`
- `held_asset == CASH`
- position in WATCH-like（`WATCH` / `REENTRY_WAIT`）
- `confirm_flag` required
- `asset ∈ {NIKKEI_LEV_1570, SEMI_282A}`
- `entry_price` / `trade_price` required
- `entry_date` / `trade_date` required（実約定日；入力日で置換しない）

**Internal processing（State Machine invariant）:**

```text
technical READY restoration（Selection/Sensor 再評価なし）
  → existing ENTRY_FILLED path
  → POSITION_ACTIVE
```

Time Exit / Risk Stop 起算は**実約定** `entry_date` / `entry_price`（既存算式のまま）。

### SELL（既存 Exit 経路）

```text
Trade Fact(SELL)
  → Validation
  → Fact Journal
  → existing Exit path
  → EXIT_FILLED
  → Position State
```

| Case | Guard | Internal route（Human非公開） |
|---|---|---|
| A | `position_state == EXIT` かつ `held_asset == asset` | `EXIT_FILLED` only |
| B | `position_state == POSITION_ACTIVE` かつ `held_asset == asset` | existing `ABNORMAL_EXIT` → `EXIT_FILLED`（ops `--record-exit` と同経路） |

SELL は取引事実報告であり Exit 条件変更ではない。  
Exit 条件式・Risk・Time Exit 計算は変更しない。

### Forbidden

- `WATCH → POSITION_ACTIVE` direct transition
- `POSITION_ACTIVE → Flat` direct（EXIT 経由必須）
- Growth 中の通常 Delayed Recovery
- Selection / Detection / Sensor 再評価を Recovery で実行
- 新 `PositionState` 追加
- Live 運用での paper `auto_fill=True` 前提（Live は fill 確認入力前提）
- Human が内部 Event 名を指定すること

---

## 4.1 Additive extension — Asset Registry / Routing（2026-08-06）

Parent freeze routing semantics（§4）are preserved.
Dispatch mechanism upgraded:

```text
asset → Asset Registry → routing_policy → handler
```

See: `ASA-TAXABLE-ACCOUNT-PROTOCOL-ASSET-REGISTRY-ROUTING-1.0.md`

- SWING_POSITION: same ENTRY/EXIT/Delayed Recovery paths
- GROWTH_REGIME: TRANSFER_COMPLETE / RECOVERY_COMPLETE（Regime path）
- Protocol Rule Change: **NO**

---

## 5. Explicitly out of this freeze（別CR）

- 本格 Trade Ledger
- 平均取得単価 / 部分約定 / 残数量管理 / 実現損益 / 税務処理  
  （※ `quantity` の Fact 保存自体は **IN**。会計・Ledger 化のみ OUT）
- Broker Adapter
- Discord Dashboard（資産管理画面化）
- Protocol 自動改善
- Growth 例外SOPの自動化

**IN（Input Adapter）:** Discord Trade Report Interaction  
（slash + confirm → 既存 Port。Projection とは役割分離。Business Logic なし）

---

## 6. Classification vs Protocol Freeze

| Item | Status |
|---|---|
| Entry conditions | **UNCHANGED** |
| Exit conditions | **UNCHANGED** |
| Risk formula | **UNCHANGED** |
| Asset Selection | **UNCHANGED** |
| Detection | **UNCHANGED** |
| PositionState enum | **UNCHANGED**（追加禁止） |

本Freezeは Protocol Rule 変更ではない。

---

## 7. Re-review triggers（implementation中〜後）

以下が発生したら Implementation を止め、再 Design Review:

- Entry / Exit 条件変更
- Risk 計算変更
- State Machine 意味変更（FILLED が READY 前提でない直遷移の正式化など）
- PositionState 追加
- Fact を Decision Engine へ直接投入
- Journal の SoT 化

---

## 8. Implementation baseline

Implementation CR MUST stay within §2–4.1 and §5 OUT list.

Suggested package touchpoints（拘束ではなく実装ガイド）:

- `taxable_account/` Trade Report Port + Journal writer
- `domain/events.py` internal `DELAYED_FILL_RECOVERY`
- `engine` / `position_manager` recovery path preserving ENTRY_FILLED invariants
- CLI as transport for Trade Report（Event名選択UIにしない）
- Discord Trade Report Interaction transport（slash + confirm → Port；Business Logic なし）
- tests: routing / guards / journal append / no selection recompute

Live ops premise: `auto_fill=False`（paper/test のみ True）。

---

## 9. Unfreeze rule

1. Explicit Human authorization  
2. New Design Review（APPROVE）  
3. New version record（e.g. `…-PORT-1.2`）— 本 v1.1 および v1.0 を上書きしない  

---

## 10. Version tag

```text
ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.1
```

Canonical digest for this freeze record is published only in the registration report
（self-referential digest footer is intentionally omitted from this file）:

`docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.1.md`
