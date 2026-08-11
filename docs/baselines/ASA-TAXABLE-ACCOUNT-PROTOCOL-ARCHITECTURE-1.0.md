# ASA Knowledge Record — Taxable Account Protocol Architecture (Phase 1)

**Record ID:** ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0  
**Title:** 特定口座運用プロトコル再構築 Phase 1 — New Architecture  
**Document Type:** Knowledge / Design Architecture Record  
**ASA Domain:** Taxable Account Operations Architecture  
**Category:** Integrated Protocol Design  
**Status:** **CONFIRMED / RECORDED（DESIGN ONLY）**  
**Version:** 1.0  
**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:30:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE1-1.0  
**Companion:** ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Architecture Change:** **NONE**（ASA-ARCH-* 章の改変ではない。特定口座運用設計の新正本候補）

```text
Purpose = 新特定口座プロトコルの責務境界・状態・抽出仕様・Discord投影を定義
≠ Phase 3 以降の実装
≠ Legacy改修
≠ Growth / Entry / Sensor 変更
```

---

## 1. Design Principle

```text
旧: 個別プロトコル（SOX / NDX / Swing / Discord）が並立
新: 特定口座全体を単一の統合運用ロジックで管理
```

| Principle | Definition |
|---|---|
| Spec-first | Legacyコード構造をコピーせず、検証済み意味を仕様として再定義 |
| Layered | Detection → Decision → Selection → Position → Risk → State → ViewModel |
| Projection-only Discord | Discordは判断しない |
| Additive Risk | 1570 Risk Stop は Position Risk Control。Entry条件は不変 |
| No Legacy hot-path | 新フローは Legacy モジュールへ直接依存しない |

---

## 2. Architecture（責務境界）

```text
Market Detection
      ↓
Regime Decision
      ↓
Asset Selection
      ↓
Position Management
      ↓
Risk Control          ← 1570のみ
      ↓
State Management      ← 単一 SoT（運用状態）
      ↓
Discord ViewModel     ← 投影のみ
      ↓
Discord Display
```

| Layer | Responsibility | Must not do |
|---|---|---|
| **Market Detection** | `dd15_ma200`, `crash_15`, `semi_signal`, Recovery Model B の真偽を供給 | 売買判断、Asset決定 |
| **Regime Decision** | 口座級状態（Growth/Exit/Swing/Reentry） | 個別銘柄のStop管理 |
| **Asset Selection** | Regime×Signal → 対象Asset | 保有日数管理、Discord文面 |
| **Position Management** | 保有ライフサイクル状態 | 新規センサー発明 |
| **Risk Control** | 1570 Entry×0.85 事前逆指値 | crash_15 / Growth 条件変更 |
| **State Management** | 上記を単一状態オブジェクトに統合 | UI判断 |
| **Discord ViewModel** | State → 表示用DTO | BUY/SELL判定の再計算 |

---

## 3. Market Detection（抽出仕様）

既存コード構造はコピーしない。意味のみ再定義する。

| Signal | Spec meaning | Source of truth (knowledge) |
|---|---|---|
| `dd15_ma200` | SOXX系250d高値比DD≥15% かつ close\<SMA200 → Alert ON | Growth sensor validations |
| Recovery Model B | Alert解除候補: `dd15_ma200` OFF ∧ RSI14(Wilder)≥50 が20営業日 | reentry precision Model B |
| `crash_15` | 日経225 52週高値比 ≤ -15% | Swing Freeze / panel |
| `semi_signal` | Freeze定義の半導体スイング信号 | Swing Freeze / panel |

```text
Change policy: 意味変更禁止
New implementation may re-code the formulas under New package,
but must preserve validated semantics.
```

---

## 4. Regime Decision（新規）

| State | Condition | Capital intent |
|---|---|---|
| **GROWTH_ACTIVE** | Alert OFF かつ Recovery 完了後の通常局面 | 野村 100% |
| **EXIT_PENDING** | Alert ON 直後〜資産移行処理中 | 野村→Swing袖 移管中 |
| **SWING_ACTIVE** | Alert ON かつ移管完了 | Swing袖 100% |
| **REENTRY_PENDING** | Alert OFF 後、Model B 未充足 | Swing flatten / Growth復帰待ち |

遷移（概念）:

```text
GROWTH_ACTIVE
  -- dd15_ma200 ON --> EXIT_PENDING
  -- transfer done --> SWING_ACTIVE
  -- Recovery Model B satisfied --> GROWTH_ACTIVE
SWING_ACTIVE
  -- dd15_ma200 OFF --> REENTRY_PENDING
REENTRY_PENDING
  -- Model B complete --> GROWTH_ACTIVE
```

---

## 5. Asset Selection（確定・独立層）

| Context | Asset |
|---|---|
| Growth（GROWTH_ACTIVE） | 野村世界半導体株投資 |
| Swing かつ `crash_15` | **1570** |
| Swing かつ `semi_signal`（crash非成立） | **282A** |
| Swing かつ条件なし | **CASH** |

優先順位（Swing袖内）:

```text
Crash反発（1570）
  ↓
その他Swing（282A）
  ↓
CASH
（Growth復帰は Regime Decision 側）
```

```text
Asset Selection = 独立層
Freeze「概念」へのコード依存はしない。
優先規則の意味のみ継承する。
```

---

## 6. Position Management（新規 State）

| State | Meaning |
|---|---|
| **WAIT** | 口座が Growth、またはSwing非稼働 |
| **WATCH** | Swing稼働・Flat・シグナル監視 |
| **ENTRY_READY** | Entry条件成立・実行待ち/可 |
| **POSITION_ACTIVE** | 1570 or 282A 保有中 |
| **EXIT** | 決済完了処理 |
| **REENTRY_WAIT** | Exit後Flat・再評価待ち（主にStop後） |

遷移（概念）:

```text
WAIT → WATCH → ENTRY_READY → POSITION_ACTIVE → EXIT
                         ↘ REENTRY_WAIT → WATCH / ENTRY_READY
Alert OFF / Growth復帰 → WAIT
```

保有中の既定Exit（抽出・意味維持）:

| Asset | Default exit meaning |
|---|---|
| 1570 | 約20営業日 + abnormal |
| 282A | 約15営業日 + abnormal |
| Alert解除 | Sleeve flatten |

---

## 7. Risk Control — 1570 Position Risk Stop（独立仕様）

### 7.1 Identity

| Field | Value |
|---|---|
| Name | Taxable 1570 Position Risk Stop |
| Layer | **Risk Control**（Position附属） |
| Scope | **1570のみ** |
| Entry | 既存 Crash 判定（`crash_15`）による Entry — **変更禁止** |
| Order type | Entry時 **事前逆指値** |
| Stop price | `P × 0.85`（Entry比 **-15%**） |
| On trigger | Exit → Flat → 既存条件で再Entry評価 |
| Extra wait | **なし** |
| New sensors | **禁止** |

### 7.2 What this is / is not

```text
IS:
  レバ継続下落時の最大損失制御（Position Risk Control）

IS NOT:
  Entry条件変更
  Growth判定変更
  Freeze Entry優先の変更
  全Asset共通Stop
  Discord内判断
```

### 7.3 Effective range note（validation）

| Item | Value |
|---|---|
| Default | **-15%** |
| Validated effective band | **-15% 〜 -20%**（事前逆指値モデル） |
| Formal execution model | **A: 事前逆指値**（日中タッチ→Stop付近約定） |
| Non-formal | 終値判定 / 翌寄付（参考のみ） |

Evidence: temporary reviews 2026-08（repo code未改修の検証結果）。

### 7.4 Interaction with Position States

```text
POSITION_ACTIVE (asset=1570)
  + risk_stop_status = ACTIVE
  -- stop triggered --> EXIT --> REENTRY_WAIT
```

---

## 8. State Management（単一 SoT）

State Management は次を1オブジェクトに保持する（設計）。

```text
TaxableAccountState
  regime: GROWTH_ACTIVE | EXIT_PENDING | SWING_ACTIVE | REENTRY_PENDING
  position: WAIT | WATCH | ENTRY_READY | POSITION_ACTIVE | EXIT | REENTRY_WAIT
  asset: NOMURA_WORLD_SEMI | NIKKEI_LEV_1570 | SEMI_282A | CASH
  alert_on: bool
  signals: { dd15_ma200, crash_15, semi_signal, recovery_b_progress }
  entry_date, entry_px, last_px, pnl_pct
  risk: { enabled, stop_pct, stop_px, status }  # 1570のみ
  next_action: string
  as_of: timestamp
```

```text
State Management = 運用状態の単一 Source of Truth
Sensor / Decision / Selection / Position / Risk の出力を統合する
Discord はここを読むだけ
```

---

## 9. Discord ViewModel（投影方式）

### 9.1 Principle

```text
Sensor → Decision → State → ViewModel → Discord
Discordは判断しない（NDX Legacy UIパターンを踏襲、コードは新規）
```

Legacy Discord（SOX morning / NDX / portfolio notify）へフィールド追加しない。

### 9.2 TaxableAccountViewModel fields

| Section | Fields |
|---|---|
| Market | `regime`, `alert_on` |
| Decision | `BUY` / `HOLD` / `SELL` / `WAIT` + `reason` |
| Asset | 野村世界半導体株投資 / 1570 / 282A / CASH |
| Position | state, entry_date, entry_px, last_px, pnl_pct |
| Risk（1570） | stop_px, stop_status（ACTIVE/TRIGGERED/N/A） |
| Next Action | 例: Risk Stop監視 / Recovery待ち / Crash Entry待ち / Growth復帰待ち |

### 9.3 Update timing

| Trigger | Update |
|---|---|
| 営業日朝次 | 全面 |
| 状態遷移 | イベント通知 |
| 1570保有中 | 価格・損益・Stop状態 |

---

## 10. Implementation Phases（境界）

| Phase | Scope | Status after this record |
|---|---|---|
| **1** Legacy整理 + Architecture | **完了** |
| **2** 詳細仕様書（Regime/Asset/Position/Risk） | **完了** → `ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0` |
| **3** New Runtime Foundation（package骨格） | **完了** → `taxable_account/` |
| **4** Runtime Integration（Detection〜Discord投影） | **完了** → `taxable_account/runtime/` |
| 5 | 実運用接続（live data / webhook認可） | 未着手・要別認可 |

---

## 11. Prohibitions

- Legacyコードへの直接追加
- Discord側への判断ロジック追加
- Growth判定変更
- Entry条件（`crash_15` / `semi_signal`）変更
- Freeze仕様文書の改変による「裏口変更」
- 新規センサー追加
- 新フローからの Legacy hot-path 依存

---

## 12. Explainability without Legacy dependency

新設計は次の語彙だけで説明可能である（旧プロトコル名は参照注記に落とせる）。

```text
1) Alert = dd15_ma200
2) Growth復帰 = Recovery Model B
3) Swing中のAsset = crash優先1570 / それ以外semiなら282A / なければCASH
4) Growth中のAsset = 野村世界半導体
5) 1570保有中のみ Entry×0.85 事前逆指値
6) 状態は Regime × Position で単一管理
7) Discordは State の投影
```

---

## 13. Phase 1 Completion Checklist

| # | Criterion | Status |
|---|---|---|
| 1 | 既存プロトコルが Legacy として分離 | **YES**（Legacy Boundary record） |
| 2 | 新プロトコルの責務境界が定義 | **YES**（本§2） |
| 3 | 利用する既存ロジック要素が明確 | **YES**（§3 + Legacy Extraction Catalog） |
| 4 | 1570 Position Risk Control が独立仕様 | **YES**（§7） |
| 5 | Discordが ViewModel投影方式 | **YES**（§9） |
| 6 | 旧プロトコル依存なしで新設計が説明可能 | **YES**（§12） |

---

## 14. Next Action

Phase 2 詳細仕様は登録済み:

- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0.md`
- `docs/schemas/taxable_account_state.schema.json`
- `docs/schemas/taxable_account_viewmodel.schema.json`

Phase 3–4: `taxable_account/` Runtime Integration 完了（Discord dry-run）。  
次は Phase 5（明示ゴーサイン後）: live MarketData 接続・認可済み webhook・執行adapter。
