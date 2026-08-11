# FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-AUTH-1.0

**Document ID:** `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-AUTH-1.0`  
**Title:** Live State Alignment — Implementation Authorization + Result  
**種別:** Implementation Authorization  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-AUTH-1.0.md`  

**Target CR:** `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0`（CONDITIONAL → conditions satisfied）  
**Parent Decision:** `FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0`  

---

## 判定

### **IMPLEMENTATION AUTHORIZED**

本記録は承認範囲内の実装を認可し、実装結果を同梱する。

---

## 承認範囲（確定）

### 変更対象

- `taxable_account/ops/__main__.py`
- 必要最小限の Runtime 関連: `taxable_account/runtime/session.py`（`live_ops_runtime_config` + コメント）
- `taxable_account/runtime/__init__.py`（export）
- `taxable_account/README.md`（Live 前提注記）
- `tests/test_taxable_account_live_state_alignment.py`（Case A/B）
- Runtime Freeze 運用節追随（下記 §3）

### 実装内容

1. **Live:** `auto_transfer=False`, `auto_exit_fill=False`（`auto_fill=False` 維持）via `live_ops_runtime_config()`  
2. **Paper / Replay:** `RuntimeConfig` クラス既定および validation の Simulation `auto_*` **維持**  
3. **Recovery:** **変更なし**（Alert OFF → `RECOVERY_COMPLETE` 自動発火は対象外）

### 禁止（遵守）

| 項目 | 結果 |
|---|---|
| Protocol 変更 | なし |
| Decision 条件変更 | なし |
| Sensor 変更 | なし |
| Human Display 変更 | なし |
| Evidence 変更 | なし |
| Trade Fact Schema 変更 | なし |
| Journal Schema 変更 | なし |

---

## 1. 変更概要

| ファイル | Diff 要旨 |
|---|---|
| `runtime/session.py` | `live_ops_runtime_config()` 追加。`RuntimeConfig` コメントを Simulation 既定と明示 |
| `ops/__main__.py` | `--as-of` が `live_ops_runtime_config(...)` を使用（transfer/exit_fill off） |
| `runtime/__init__.py` | export 追加 |
| `README.md` | Live 三フラグ off を記載 |
| `tests/test_taxable_account_live_state_alignment.py` | Case A/B + paper sim + stop 非 auto-fill |
| `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0.md` | Live Position completion premise 追記 |

```text
Live daily:
  Market → Detection → Decision（EXIT_PENDING / EXIT まで可）
  → Display
  → Human broker
  → HTR + Trade Fact
  → Position completion
```

---

## 2. Test 結果

### 必須 Case

| Case | 期待 | 結果 |
|---|---|---|
| **A** Decision=`EXIT_PENDING` + HTR SELL | Trade Fact 後 `TRANSFER_COMPLETE` / Position 更新 | **PASS** `test_case_a_trade_report_then_position_updates` |
| **B** Decision=`EXIT_PENDING` + 未実行 | Position 維持（野村保有）、誤った `EXIT` にならない、`TRANSFER_COMPLETE` なし | **PASS** `test_case_b_exit_pending_without_trade_report_keeps_position` |

### 追加

| 項目 | 結果 |
|---|---|
| Live config 三フラグ False | PASS |
| Live: STOP 後 `EXIT` 残留（`EXIT_FILLED` なし） | PASS |
| Paper: `auto_transfer=True` Simulation 維持 | PASS |

### Regression（実行）

```text
pytest tests/test_taxable_account_live_state_alignment.py
      tests/test_taxable_account_trade_report_port.py
      tests/test_taxable_account_asset_registry_routing.py
      tests/test_taxable_account_runtime_integration.py
      tests/test_taxable_account_discord_trade_input.py
      tests/test_taxable_account_evidence_layer.py -q

→ 上記スイート 実行時 PASS（live_state_alignment 5 + 関連 HTR/runtime/evidence）
  初回コア 40 passed in ~16s（alignment + port + routing + runtime_integration）
```

### Freeze 非侵害確認

| Freeze | 侵害 |
|---|---|
| HTR Port | **なし**（契約・Schema 不変。整合強化） |
| Human Display | **なし**（view コード未変更） |
| Evidence | **なし**（evidence コード未変更） |
| Runtime Freeze | **運用節のみ additive 更新**（Protocol 条件 Unfreeze ではない） |

---

## 3. Runtime Freeze 更新案（適用済み）

対象ファイル: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0.md`

追記内容（要約）:

```text
### Live Position completion premise（additive — 2026-08-08）

Live ops:
  auto_fill = False
  auto_transfer = False
  auto_exit_fill = False
  → live_ops_runtime_config()

Position completion only after HTR + Trade Fact.
Paper/Replay may enable auto_* for Simulation.
Recovery auto path: out of scope (separate CR).
Protocol Rule Change: NO
```

Normal operations 手順を HTR 完了ステップに合わせて更新。

**新規 Freeze:** 不要  
**HTR / Display / Evidence Freeze:** 更新不要  

---

## 4. Rollback 方法

```text
1. ops/__main__.py
   live_ops_runtime_config(...) をやめ、旧:
     RuntimeConfig(auto_transfer=True, auto_fill=..., discord_dry_run=...)
   に戻す（auto_exit_fill は既定 True に戻る）

2. 任意: live_ops_runtime_config / テスト / README / Runtime Freeze 追記を revert

3. 既に EXIT_PENDING / EXIT で止まっている State:
   - Rollback 後の再 step で Simulation auto が完了させる、または
   - HTR / --record-* で完了
   （自動マイグレーションなし）

4. Journal / Trade Fact は削除しない
```

---

## CR 条件対応

| CR 条件 | 対応 |
|---|---|
| C1 Recovery OUT | 遵守（未変更） |
| C2 Protocol/Display/Evidence/Schema 非変更 | 遵守 |
| C3 Paper/Replay Simulation 維持 | 遵守 + テスト |
| C4 Runtime Freeze 追随 | **適用済み** |
| C5 Case A/B テスト | **PASS** |

---

## Version

```text
Status: IMPLEMENTATION AUTHORIZED + IMPLEMENTED
FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-AUTH-1.0

Live: auto_transfer=False, auto_exit_fill=False (auto_fill=False)
Paper/Replay: Simulation auto_* retained
Recovery: unchanged
Runtime Freeze: additive ops premise updated
HTR/Display/Evidence: not reopened
```
