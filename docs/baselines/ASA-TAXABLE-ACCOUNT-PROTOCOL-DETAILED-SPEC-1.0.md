# ASA Knowledge Record — Taxable Account Protocol Detailed Specification (Phase 2)

**Record ID:** ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0  
**Title:** 特定口座運用プロトコル再構築 Phase 2 — Detailed Specification  
**Document Type:** Knowledge / Detailed Design Specification  
**ASA Domain:** Taxable Account Operations Architecture  
**Category:** State Machines / Selection / Risk / ViewModel  
**Status:** **CONFIRMED / RECORDED（DESIGN ONLY）**  
**Version:** 1.0  
**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:39:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE2-1.0  
**Parent:** ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0  
**Companion:** ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
**Schema Draft:** `docs/schemas/taxable_account_state.schema.json`  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Code Change:** **NONE**（本Phaseは仕様書のみ）

```text
Purpose = Regime / Asset / Position / Risk / State / ViewModel の詳細仕様
≠ Legacy改修
≠ Discord改修
≠ Runtime接続
≠ Backtest変更
≠ Growth / Entry / Sensor 意味変更
```

---

## 0. Layer Responsibility Recap

```text
Market Detection → Regime Decision → Asset Selection
  → Position Management → Risk Control → State Management
  → Discord ViewModel
```

| Layer | Input | Output |
|---|---|---|
| Market Detection | market series | signal booleans / recovery progress |
| Regime Decision | signals + transfer flags | `regime_state` |
| Asset Selection | regime + signals + flatness | `selected_asset` |
| Position Management | selection + fills + exits | `position_state` + entry/exit fields |
| Risk Control | 1570 entry | `risk_control` |
| State Management | all above | `TaxableAccountState` (SoT) |
| ViewModel | State | `TaxableAccountViewModel` |

Legacy依存: **なし**（仕様意味のみ継承）。

---

## 1. Market Detection Inputs（参照仕様）

本層は State Machine の入力のみ。判断・Asset選択はしない。

| Signal ID | Type | True when | Notes |
|---|---|---|---|
| `dd15_ma200` | bool | Growth Alert ON | 変更禁止 |
| `recovery_model_b_met` | bool | OFF ∧ RSI14≥50 が20営業日継続 | 変更禁止 |
| `recovery_b_days` | int | 上記連続日数 0..20 | derived progress |
| `crash_15` | bool | 日経52週高値比 ≤ -15% | Entry条件変更禁止 |
| `semi_signal` | bool | 半導体スイング信号 | Entry条件変更禁止 |
| `as_of` | datetime | 評価時刻 | JST営業日想定 |

Eventへの正規化は §5。

---

## 2. Regime State Machine

### 2.1 States

| State | Meaning | Capital intent |
|---|---|---|
| `GROWTH_ACTIVE` | 通常運用 | 野村世界半導体 100% |
| `EXIT_PENDING` | Growth終了処理中（移管未完了） | 野村解消〜Swing移管中 |
| `SWING_ACTIVE` | Swing運用 | Swing袖 100% |
| `REENTRY_PENDING` | Recovery後・Growth復帰待ち | Sleeve解消〜野村復帰待ち |

### 2.2 Held data（Regime slice）

| Field | Persistence | Description |
|---|---|---|
| `regime_state` | Persistent | 上記4値 |
| `alert_on` | Persistent/mirror | `dd15_ma200` の直近確定値 |
| `transfer_completed` | Persistent | EXIT_PENDING→SWING 完了フラグ |
| `reentry_completed` | Persistent | REENTRY→GROWTH 完了フラグ |
| `regime_entered_at` | Persistent | 現Regime開始時刻 |

### 2.3 Entry / Exit conditions per state

| State | Enter when | Exit when |
|---|---|---|
| `GROWTH_ACTIVE` | 初期、または `RECOVERY_COMPLETE` 後に復帰処理完了 | `ALERT_ON` |
| `EXIT_PENDING` | `ALERT_ON` from GROWTH | `TRANSFER_COMPLETE` |
| `SWING_ACTIVE` | `TRANSFER_COMPLETE` | `ALERT_OFF` |
| `REENTRY_PENDING` | `ALERT_OFF` from SWING | `RECOVERY_COMPLETE` かつ復帰処理完了 |

### 2.4 Regime Transition Table

| From | Event | Guard | To | Action intent |
|---|---|---|---|---|
| `GROWTH_ACTIVE` | `ALERT_ON` | — | `EXIT_PENDING` | 野村 Exit / Swing移管開始 |
| `EXIT_PENDING` | `TRANSFER_COMPLETE` | — | `SWING_ACTIVE` | 袖運用開始 |
| `EXIT_PENDING` | `ALERT_OFF` | 移管未完了のまま解除 | `REENTRY_PENDING` | 例外経路：移管中止〜復帰準備 |
| `SWING_ACTIVE` | `ALERT_OFF` | — | `REENTRY_PENDING` | Sleeve flatten 開始 |
| `REENTRY_PENDING` | `RECOVERY_COMPLETE` | Model B 充足 | `GROWTH_ACTIVE` | 野村 100% 復帰完了後 |
| `REENTRY_PENDING` | `ALERT_ON` | 復帰前に再Alert | `EXIT_PENDING` | 復帰中断、再移管 |

### 2.5 Forbidden transitions

| Forbidden | Reason |
|---|---|
| `GROWTH_ACTIVE` → `SWING_ACTIVE`（直接） | 必ず `EXIT_PENDING` を経由 |
| `SWING_ACTIVE` → `GROWTH_ACTIVE`（直接） | 必ず `REENTRY_PENDING` + Recovery |
| `GROWTH_ACTIVE` → `REENTRY_PENDING` | Growth中にReentryは定義しない |
| `EXIT_PENDING` → `GROWTH_ACTIVE`（Recoveryなし） | 移管未完了のままGrowth復帰禁止 |
| Any → Any on Discord **Projection** | 表示UIは遷移を起こさない |
| Discord **Trade Report Adapter** → Domain Event | 許可（輸送のみ）。Adapterは判断せず `TradeReportPort` 経由のみ |

### 2.6 Regime × default Asset intent

| Regime | Default asset intent（Selection前） |
|---|---|
| `GROWTH_ACTIVE` | `NOMURA_WORLD_SEMI` |
| `EXIT_PENDING` | transitional（表示は前Asset/CASH可） |
| `SWING_ACTIVE` | Selection結果（1570/282A/CASH） |
| `REENTRY_PENDING` | flatten → 復帰処理中は CASH または移行中 |

---

## 3. Asset Selection Specification（独立層）

### 3.1 Canonical assets

| Code | Display |
|---|---|
| `NOMURA_WORLD_SEMI` | 野村世界半導体株投資 |
| `NIKKEI_LEV_1570` | 1570 |
| `SEMI_282A` | 282A |
| `CASH` | CASH |

### 3.2 Selection table

| Regime | Priority rule | Selected asset |
|---|---|---|
| `GROWTH_ACTIVE` | fixed | `NOMURA_WORLD_SEMI` |
| `EXIT_PENDING` | no new risk entry | `CASH`（または移行中表示） |
| `SWING_ACTIVE` | see §3.3 | 1570 / 282A / CASH |
| `REENTRY_PENDING` | no new swing entry | `CASH`（flatten後） |

### 3.3 Swing sleeve priority（排他）

評価順（上を優先、排他）:

```text
1) crash_15 == true  → NIKKEI_LEV_1570
2) semi_signal == true → SEMI_282A
3) else → CASH
```

| Rule ID | Definition |
|---|---|
| AS-P1 | `crash_15` と `semi_signal` 同時成立時は **1570のみ**（282A選ばない） |
| AS-P2 | 保有中の局面切替でAssetを差し替えない（PositionがFlatになるまで Selection は「次Entry候補」） |
| AS-P3 | `EXIT_PENDING` / `REENTRY_PENDING` では新規 Swing Entry 候補を出さない |

### 3.4 Entry-possible conditions

| Selected | Entry possible when |
|---|---|
| `NOMURA_WORLD_SEMI` | `regime=GROWTH_ACTIVE` かつ未保有/復帰実行時 |
| `NIKKEI_LEV_1570` | `regime=SWING_ACTIVE` かつ `position∈{WATCH,REENTRY_WAIT}` かつ `crash_15` |
| `SEMI_282A` | `regime=SWING_ACTIVE` かつ Flat系 かつ `semi_signal` かつ not `crash_15` |
| `CASH` | Entryなし（Flat維持） |

### 3.5 Flat conditions

Flat（実質CASH）とする場合:

- Selection結果が `CASH`
- Position が `WAIT` / `WATCH` / `REENTRY_WAIT` / `EXIT` 完了後
- Regime が `REENTRY_PENDING` で sleeve flatten 済み

### 3.6 Output to State

Asset Selection は Decision（Regime）から独立し、結果のみ State に書く:

```text
selected_asset  → TaxableAccountState.asset（次Entry候補または保有意図）
selection_reason → e.g. "crash_15", "semi_signal", "growth_default", "flat"
```

保有中の実Assetは Position の `held_asset` が正（§4）。

---

## 4. Position State Machine

### 4.1 States

| State | Meaning |
|---|---|
| `WAIT` | Growth側、またはSwing非稼働 |
| `WATCH` | Swing稼働・Flat・監視 |
| `ENTRY_READY` | Entry条件成立・実行可/待ち |
| `POSITION_ACTIVE` | 実保有中（282A、または1570でStop未武装の瞬間） |
| `EXIT` | 決済処理中/完了イベント処理 |
| `REENTRY_WAIT` | Exit後Flat・再評価待ち |

**1570保有中の Risk 武装時:**  
`position_state` は `POSITION_ACTIVE` を維持し、`risk_control.status=ACTIVE` で「RISK_CONTROL_ACTIVE」を表現する（§5 derived `display_position_mode`）。  
Position列挙を増やして Entry/Exit 条件を二重化しない。

### 4.2 Held data（Position slice）

| Field | Persistence |
|---|---|
| `position_state` | Persistent |
| `held_asset` | Persistent（`CASH` if flat） |
| `signal_date` | Persistent nullable（Entry条件成立日。Time Exit / 保有日数 / Risk に使用禁止） |
| `entry_date` | Persistent（実際購入日。Time Exit 起算） |
| `entry_price` | Persistent（raw fill） |
| `exit_date` | Persistent nullable |
| `exit_price` | Persistent nullable |
| `exit_reason` | Persistent nullable |
| `hold_business_days` | Derived from **entry_date** only |
| `max_hold_business_days` | Persistent on entry（1570:20 / 282A:15） |

### 4.3 Events（Position）

| Event | Meaning |
|---|---|
| `REGIME_ENTER_SWING` | → 通常 `WATCH` |
| `REGIME_ENTER_GROWTH` | → `WAIT` |
| `SIGNAL_ENTRY_AVAILABLE` | Selectionが1570/282A |
| `ENTRY_FILLED` | 約定 |
| `TIME_EXIT_DUE` | 保有日数上限 |
| `ABNORMAL_EXIT` | 異常撤退条件 |
| `ALERT_FLATTEN` | Alert解除等による flatten |
| `STOP_TRIGGERED` | 1570 Risk（§5） |
| `EXIT_FILLED` | 決済完了 |
| `REENTRY_SIGNAL` | Flat後に再度 Entry 可能 |

### 4.4 Position Transition Table

| From | Event | Guard | To |
|---|---|---|---|
| `WAIT` | `REGIME_ENTER_SWING` | — | `WATCH` |
| `WATCH` | `SIGNAL_ENTRY_AVAILABLE` | AS Entry-possible | `ENTRY_READY` |
| `WATCH` | `REGIME_ENTER_GROWTH` | — | `WAIT` |
| `ENTRY_READY` | `ENTRY_FILLED` | — | `POSITION_ACTIVE` |
| `ENTRY_READY` | signal lost / regime leave | not filled | `WATCH` or `WAIT` |
| `POSITION_ACTIVE` | `TIME_EXIT_DUE` / `ABNORMAL_EXIT` / `ALERT_FLATTEN` / `STOP_TRIGGERED` | — | `EXIT` |
| `EXIT` | `EXIT_FILLED` | `exit_reason=STOP_TRIGGERED` かつ `SWING_ACTIVE` | `REENTRY_WAIT` |
| `EXIT` | `EXIT_FILLED` | その他 / Growth復帰系 | `WATCH` or `WAIT` |
| `REENTRY_WAIT` | `REENTRY_SIGNAL` | AS Entry-possible | `ENTRY_READY` |
| `REENTRY_WAIT` | `REGIME_ENTER_GROWTH` | — | `WAIT` |
| `REENTRY_WAIT` | no signal | stay | `REENTRY_WAIT` |

### 4.5 Forbidden transitions

| Forbidden | Reason |
|---|---|
| `WAIT` → `POSITION_ACTIVE` | Entry経路必須 |
| `WATCH` → `POSITION_ACTIVE` | `ENTRY_READY` 経由 |
| `POSITION_ACTIVE` → `WATCH`（EXITなし） | 決済イベント必須 |
| `REENTRY_WAIT` で新規センサー待ちを追加 | 禁止（既存信号のみ） |

### 4.6 Exit reasons（enum）

```text
TIME | ABNORMAL | ALERT_FLATTEN | STOP_TRIGGERED | MANUAL | TRANSFER
```

---

## 5. Risk Control — 1570 Position Risk Stop

### 5.1 Placement

```text
Position Management
  └── Risk Control (1570 only)
```

独立センサー層ではない。`held_asset == NIKKEI_LEV_1570` のときのみ有効。

### 5.2 Spec

| Item | Definition |
|---|---|
| Scope | 1570のみ |
| Arm timing | `ENTRY_FILLED` と同時（事前逆指値） |
| Formula | `stop_price = entry_price × 0.85` |
| Default pct | `0.15`（有効帯ノート: 0.15–0.20、既定0.15） |
| Execution model | 事前逆指値（日中タッチ→Stop付近約定） |
| On trigger | `STOP_TRIGGERED` → Position `EXIT` → Flat → 既存信号で再Entry評価 |
| Extra wait | **なし** |

### 5.3 risk_control object

| Field | Values |
|---|---|
| `enabled` | bool |
| `stop_pct` | 0.15 |
| `stop_price` | number \| null |
| `status` | `N/A` \| `ACTIVE` \| `TRIGGERED` \| `CANCELLED` |

| status | When |
|---|---|
| `N/A` | 非1570、または未Entry |
| `ACTIVE` | 1570保有中・Stop注文稼働（= 運用上 RISK_CONTROL_ACTIVE） |
| `TRIGGERED` | Stop到達〜EXIT完了まで |
| `CANCELLED` | 通常Exit等でStop取消 |

### 5.4 Flow

```text
ENTRY_FILLED (1570)
  → position_state = POSITION_ACTIVE
  → risk_control.status = ACTIVE
  → stop_price = P × 0.85

STOP reach
  → risk_control.status = TRIGGERED
  → event STOP_TRIGGERED
  → position_state = EXIT
  → EXIT_FILLED → REENTRY_WAIT (if SWING_ACTIVE)
  → risk_control reset to N/A after flat
  → re-evaluate crash_15 / semi_signal（条件変更なし）
```

### 5.5 Prohibitions

- `crash_15` 変更
- Entry条件変更
- Freeze条件変更
- Growth判定変更
- 新規Sensor追加
- 282A / 野村への同Stop適用

---

## 6. State Management — Single Source of Truth

### 6.1 Principle

```text
TaxableAccountState = 運用状態の唯一の正本
State と Event を混在させない
Derived は保存しない（またはキャッシュ明示）
```

### 6.2 Persistent State

| Field | Type |
|---|---|
| `regime_state` | enum |
| `position_state` | enum |
| `asset` | selected_asset code |
| `held_asset` | held code |
| `entry_date` | date \| null |
| `entry_price` | number \| null |
| `exit_date` / `exit_price` / `exit_reason` | nullable |
| `risk_control` | object §5.3 |
| `alert_on` | bool |
| `transfer_completed` | bool |
| `signals_snapshot` | object（直近確定信号） |
| `updated_at` | datetime |

### 6.3 Derived State（非永続）

| Field | Derivation |
|---|---|
| `current_price` | market feed |
| `pnl_pct` | `current/entry - 1`（保有時） |
| `market_condition` | Growth/Correction/Crash/Recovery 表示ラベル |
| `decision` | BUY/HOLD/SELL/WAIT（§7規則） |
| `decision_reason` | 固定フレーズID |
| `next_action` | 規則ベース文字列 |
| `display_position_mode` | `RISK_CONTROL_ACTIVE` if pos=ACTIVE & risk=ACTIVE & 1570 else position_state |
| `recovery_b_progress` | days / 20 |

### 6.4 Domain Events（永続ログ可・State本体に埋め込まない）

| Event | Typical writers |
|---|---|
| `ALERT_ON` / `ALERT_OFF` | Market Detection |
| `TRANSFER_COMPLETE` | ops / execution ack |
| `RECOVERY_COMPLETE` | Market Detection Model B |
| `ENTRY_FILLED` / `EXIT_FILLED` | execution |
| `STOP_TRIGGERED` | Risk / broker fill |
| `SIGNAL_ENTRY_AVAILABLE` | Asset Selection |

### 6.5 decision derivation（ViewModel用・Discord再計算禁止）

| decision | When |
|---|---|
| `BUY` | `position_state=ENTRY_READY` |
| `HOLD` | `POSITION_ACTIVE`（含 risk ACTIVE） |
| `SELL` | `EXIT` または `risk_control.status=TRIGGERED` |
| `WAIT` | `WAIT` / `WATCH` / `REENTRY_WAIT` / `EXIT_PENDING` / `REENTRY_PENDING` など |

### 6.6 next_action examples

| Situation | next_action |
|---|---|
| GROWTH + HOLD | Growth条件維持 / Alert監視 |
| EXIT_PENDING | 野村売却・Swing移管完了待ち |
| WATCH | Crash Entry待ち / semi_signal待ち |
| 1570 ACTIVE+risk ACTIVE | 1570 Risk Stop監視中 |
| REENTRY_WAIT | crash_15再成立で再Entry判定 |
| REENTRY_PENDING | Recovery Model B待ち / Growth復帰待ち |

---

## 7. JSON Schema草案

正本ファイル:

`docs/schemas/taxable_account_state.schema.json`

論理必須フィールド:

```text
regime_state
position_state
asset
held_asset
entry_date
entry_price
current_price          # derived in runtime payload可
pnl_pct                # derived
risk_control
market_condition       # derived
next_action            # derived
decision               # derived
alert_on
signals
updated_at
```

Runtime実装時は本schemaを SoT とする（Phase 3以降）。

---

## 8. Discord ViewModel

### 8.1 Flow

```text
TaxableAccountState
      ↓  (pure projection)
TaxableAccountViewModel
      ↓
Discord Display
```

### 8.1.1 Discord role separation

| Role | Surface | Authority |
|---|---|---|
| **Projection** | ViewModel → webhook / display | 判断なし。Event発行なし。State変更なし |
| **Trade Report Interaction** | slash + confirm → Input Adapter | Fact輸送のみ。判断なし。Internal Event名入力なし |

Discord Projection は Event を発行しない。判断ロジックを持たない。

Discord Trade Report Interaction は Domain Event を**直接**発行しない。  
必ず `TradeReportPort.submit(TradeReportRequest)` へ渡し、Port / Engine のみが既存 Routing を実行する。  
`source=DISCORD`。CLI と同一 Schema。

### 8.2 TaxableAccountViewModel

| Section | Fields |
|---|---|
| **Market** | `regime_state`, `market_condition`, `alert_on` |
| **Decision** | `decision` ∈ {BUY,HOLD,SELL,WAIT}, `decision_reason` |
| **Asset** | display name from `held_asset` or `asset` |
| **Position** | `position_state` or `display_position_mode`, entry_*, current_price, pnl_pct |
| **Risk Control** | 1570のみ: stop_price, status；他は N/A |
| **Next Action** | `next_action` |

### 8.3 Projection rules

| Rule | Definition |
|---|---|
| VM-1 | ViewModelは State/Derived の部分集合 + 表示ラベル変換のみ |
| VM-2 | `decision` を Discord側で再計算しない |
| VM-3 | Legacy SOX/NDX Embed にフィールド追加しない（新規経路） |
| VM-4 | 1570以外で Risk セクションは `N/A` または非表示 |

---

## 9. End-to-end explainability（Legacy名なし）

```text
1. Alert = dd15_ma200
2. Growth中は野村を持つ
3. Alert後はSwingへ移し、crashなら1570、semiなら282A、なければ現金
4. 1570はEntryと同時に -15% 逆指値
5. Stopまたは通常Exit後、同じ信号規則で再評価
6. Recovery Model B 完了で野村へ戻る
7. 画面は状態の投影だけ
```

---

## 10. Implementation boundary（本Phase）

| Allowed | Forbidden |
|---|---|
| 本仕様書・schema草案の作成 | 任意の production code 変更 |
| Phase 3 設計準備ノート | Legacy改修 |
| | Discord改修 |
| | Runtime接続 |
| | Backtest変更 |

---

## 11. Phase 2 Completion Checklist

| # | Criterion | Status |
|---|---|---|
| 1 | Regime State Machine定義 | **YES** §2 |
| 2 | Asset Selection独立仕様 | **YES** §3 |
| 3 | Position State Machine定義 | **YES** §4 |
| 4 | 1570 Risk が Position層として分離 | **YES** §5 |
| 5 | State が SoT として定義 | **YES** §6 |
| 6 | Discord が ViewModel投影 | **YES** §8 |
| 7 | Legacy依存なしで説明可能 | **YES** §9 |

---

## 12. Next（Phase 3 予告・未着手）

- New package への Sensor/評価ロジック再実装（仕様準拠）
- Backtest を New State 遷移で再評価
- Legacy runners は再現用に維持（hot-path非依存）
