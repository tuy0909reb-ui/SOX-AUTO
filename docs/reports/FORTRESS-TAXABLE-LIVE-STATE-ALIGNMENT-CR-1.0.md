# FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0

**Document ID:** `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0`  
**CR ID:** `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0`  
**Title:** Live Runtime Position Update Alignment（HTR + Trade Fact 後）  
**種別:** Change Request Review + Freeze Impact Review  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0.md`  

**Parent:**

| 文書 | 役割 |
|---|---|
| `FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0` | Ownership 方針（D1/D2/D3） |
| `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-PLAN-1.0` | 影響範囲 Plan（R1 推奨） |

**制約遵守（本文書）:** Code変更なし / Schema変更なし / Freeze変更なし  

**本文書の役割:** 実装範囲と Freeze 影響を**確定**する。実装着手そのものは Human Authorization 後。

---

## 判定

### **CONDITIONAL**

**CR スコープ（Live: `auto_transfer=False` / `auto_exit_fill=False`、Recovery 対象外、Paper/Replay Simulation 維持）は承認可能。**

実装・マージを進める条件:

| # | 条件 |
|---|---|
| C1 | **Recovery `RECOVERY_COMPLETE` 自動発火は本 CR 対象外**（別 CR 候補のまま） |
| C2 | **Protocol Logic / Decision 条件 / Sensor / Display / Evidence / Trade Fact・Journal Schema を変更しない** |
| C3 | **Paper / Replay / Readiness は `auto_*` Simulation 用途を維持**（破壊しない） |
| C4 | **実装と同梱または直後に Runtime Freeze の運用節追随**（新規 Freeze は不要。HTR/Display/Evidence は更新不要） |
| C5 | 受け入れテストで Live Case A/B（未報告時 EXIT_PENDING/EXIT 残留、HTR 後のみ Fill/Transfer）を確認 |

条件を満たさない実装（Recovery まで巻き込む、Schema 変更、Display Freeze 改訂等）は **RETURN FOR REVISION** 扱いとする。

---

## 1. 変更概要（確定スコープ）

### IN

```text
Live ops（python -m taxable_account.ops --as-of …）:
  RuntimeConfig.auto_transfer   = False
  RuntimeConfig.auto_exit_fill  = False
  RuntimeConfig.auto_fill       = False  # 既存維持

効果:
  ALERT_ON 後も TRANSFER_COMPLETE を自動発火しない
  PositionState.EXIT 後も EXIT_FILLED を自動発火しない
  上記の Position / 移管完了は HTR + Trade Fact 確定後のみ
```

### OUT（本 CR）

| 項目 | 扱い |
|---|---|
| Alert OFF → `RECOVERY_COMPLETE` 自動発火 | **別 CR 候補**（触らない） |
| `--record-entry` / `--record-exit` 削除 | OUT（文書で通常 Live 非推奨可） |
| 新 Domain Event / イベント改名 | OUT |
| 3層 Schema 分離（D3） | OUT（将来） |
| Broker Adapter | OUT |

### 維持（変更禁止）

- Protocol Logic / Decision 条件 / Sensor  
- Human Display / Evidence（写像・Freeze 契約）  
- Trade Fact Schema / Journal Schema  
- HTR Port 外部契約  

---

## 2. 確認1 — 変更対象ファイル一覧

### Must change（実装時）

| ファイル | 変更内容 |
|---|---|
| `taxable_account/ops/__main__.py` | `--as-of` 経路の `RuntimeConfig`: `auto_transfer=False`, `auto_exit_fill=False`（`auto_fill` は既存 False 維持）。任意: Paper オプトイン flag |

### Should change（文書・誤用防止）

| ファイル | 変更内容 |
|---|---|
| `taxable_account/runtime/session.py` | ロジック削除は不要。コメントを D2（Paper/Simulation）明示に更新してよい |
| `taxable_account/README.md` | Live vs Paper 前提の追記 |

### May change（Simulation 明示・回帰）

| ファイル | 変更内容 |
|---|---|
| `taxable_account/validation/live_dry_run.py` | Simulation ラベル維持（`auto_transfer=True` 可）。Live ops と混線しないコメント |
| `taxable_account/validation/operational_replay.py` | Simulation 用途として `auto_*` True **維持** |
| `tests/test_taxable_account_*.py`（Live 契約） | Case A/B 回帰テスト**追加**（既存 paper テストは壊さない） |

### Must not change

| ファイル / 領域 |
|---|
| `taxable_account/trade/port.py`, `routing.py`, `journal.py`, `facts.py`, `discord_input.py` |
| `taxable_account/ops/discord_trade_bot.py`（輸送のみ） |
| `taxable_account/view/human_display.py`, `discord_adapter.py`, `view_model.py` |
| `taxable_account/decision/*`, `detection/*`, `domain/states.py`, schema JSON |
| `position/risk_control.py` 条件式、Entry/Exit 条件 |

---

## 3. 確認2 — Runtime 上の状態遷移影響

### Live（本 CR 適用後）

| トリガ | 現行（問題） | 適用後 |
|---|---|---|
| Alert OFF→ON（Growth 保有中） | `ALERT_ON` → 即 `TRANSFER_COMPLETE` → `SWING_ACTIVE` | `ALERT_ON` → **`EXIT_PENDING` で停止**。Human 売却報告（HTR SELL）後に `TRANSFER_COMPLETE` → `SWING_ACTIVE` |
| STOP / TIME_EXIT | `…` → `EXIT` → 即 `EXIT_FILLED`（mark） | `…` → **`EXIT` で停止**。HTR SELL 後に `EXIT_FILLED` |
| ENTRY_READY | `auto_fill=False` なら待機（既存） | **変更なし**（HTR BUY 後 `ENTRY_FILLED`） |
| Alert ON→OFF | `ALERT_OFF` →（EXIT なら auto exit fill）→ **`RECOVERY_COMPLETE`** | Exit fill は止まる。**`RECOVERY_COMPLETE` 自動は本 CR では残る**（OUT） |

### Decision 進行（報告前に残す）

```text
ALERT_ON / ALERT_OFF
EXIT_PENDING / EXIT（条件成立まで）
ENTRY_READY / WATCH / REENTRY_WAIT
STOP_TRIGGERED / TIME_EXIT_DUE
Selection / Risk arming
Display 投影
```

### Case A / B（本 CR が保証する差分）

| Case | Decision | Journal | Position（Live State） |
|---|---|---|---|
| A: 売却→報告 | 売却指示 | ACCEPTED Fact | HTR 後に更新 |
| B: 未実行 | 売却指示のまま | なし | **EXIT_PENDING または EXIT のまま**（完了に進まない） |

### Paper / Replay

| 用途 | `auto_transfer` / `auto_exit_fill` | 可否 |
|---|---|---|
| operational_replay / paper 試験 | True 明示 | **維持可能（確認済み）** — Simulation。実約定とは解釈しない |
| readiness 既定 `RuntimeConfig()` | クラス既定 True | Simulation ゲートとして維持可。Live 契約ゲートにするなら別途明示 config |

---

## 4. 確認3 — HTR / Trade Report Port との整合

| 項目 | 判定 |
|---|---|
| Growth SELL → `EXIT_PENDING` 必須 | **整合改善** — Live で `EXIT_PENDING` が残るため `growth_sell_requires_exit_pending` Reject が減る |
| Swing SELL → `EXIT` または ACTIVE→ABNORMAL→FILLED | **整合** — `EXIT` 滞留後の報告が正経路になる |
| BUY → ENTRY_READY / Delayed Recovery | **既存どおり**（`auto_fill` 既に False） |
| Port / Journal / Routing 契約 | **変更なし** |
| Fact ≠ command / No direct State write | **維持** |

本 CR は HTR を「唯一の Live Position 完了経路」へ寄せるものであり、HTR Freeze の外部契約を変えず **思想と実装を一致**させる。

---

## 5. 確認4 — 既存 Freeze 影響

| Freeze | 影響 | REOPEN | 本 CR での扱い |
|---|---|---|---|
| **Runtime Freeze** | Live 日次 step の完了イベントが変わる | **運用節の追随更新が必要**（Protocol 条件の Unfreeze ではない） | 実装と同梱または直後に更新（条件 C4） |
| **HTR Freeze** | なし（強化方向） | **不要** | 更新不要 |
| **Human Display Freeze** | 観測上、売却指示状態の滞在が延び得る | **不要** | 写像・4項目契約不変 |
| **Evidence Freeze** | 同上 | **不要** | 規則不変 |

Protocol Rule Change: **NO**  
Entry/Exit/Risk/Selection 条件式: **UNCHANGED**

---

## 6. 確認5 — 実装後に必要な Freeze

### 確定回答: **Runtime Freeze のみ更新**

| 選択肢 | 判定 |
|---|---|
| 更新不要 | **却下** — frozen normal operations の Live 結果が変わるため |
| **Runtime Freeze のみ更新** | **採用** — Live premise に `auto_transfer=False` / `auto_exit_fill=False` を明記。`--record-*` は管理経路と注記可 |
| 新規 Freeze 必要 | **不要** — Ownership Decision + 本 CR + Runtime Freeze 追随で足りる |
| HTR / Display / Evidence 更新 | **不要** |

Runtime Freeze 更新の最小追記イメージ（いまは書かない・実装時）:

```text
Live ops premise:
  auto_fill = False
  auto_transfer = False
  auto_exit_fill = False
Position completion (TRANSFER_COMPLETE / EXIT_FILLED) via
  Human Trade Report Port + Fact Journal only.
Paper/Replay may enable auto_* for Simulation.
Recovery auto path: unchanged in this CR (separate candidate).
```

---

## 7. 確認6 — Rollback 手順

実装後に問題がある場合:

### 即時 Rollback（設定戻し）

```text
1. taxable_account/ops/__main__.py の RuntimeConfig を
   auto_transfer=True / auto_exit_fill=True（変更前）に戻す
2. 関連テスト・README の Live 記述を戻す
3. デプロイ / 運用手順を前版に戻す
4. Runtime Freeze 追随を入れていた場合は当該追記を revert
```

### 状態ファイル

```text
本 CR は Schema を変えない。
Rollback 後、既に EXIT_PENDING/EXIT で止まっている State は
  - 再 step で旧 auto_* が再び完了させる、または
  - HTR / 管理 record で完了
のいずれかを運用で選択する。
自動マイグレーションは本 CR に含めない。
```

### データ損失

Journal / Trade Fact は本 CR で消さない。Rollback で Fact が無効化されることはない。

---

## 8. 受け入れ基準（Authorization 後の実装ゲート）

```text
[ ] Live ops: auto_transfer=False, auto_exit_fill=False, auto_fill=False
[ ] Live: ALERT_ON 後 EXIT_PENDING 残留（TRANSFER_COMPLETE なし）
[ ] Live: EXIT 後 EXIT_FILLED なし（mark 自動なし）
[ ] Live: HTR SELL/BUY 後のみ該当完了イベント
[ ] Paper/Replay: auto_* True シナリオが従来どおり通る
[ ] trade/* view/* decision/* detection/* schema: 意図しない Diff なし
[ ] Recovery 自動経路: Diff なし（本 CR）
[ ] Runtime Freeze 追随ドラフト準備または同梱
[ ] Rollback 手順が README または CR 結果に残っている
```

---

## 9. Authorization

| 項目 | 状態 |
|---|---|
| Change Request Review | **CONDITIONAL**（本判定） |
| Implementation Authorization | **NOT GRANTED by this document** — Human / Owner の明示承認が必要 |
| Freeze 本文改訂（いま） | **禁止**（制約どおり。実装フェーズで Runtime Freeze のみ） |

---

## Version

```text
Status: CONDITIONAL
FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0

IN:  Live auto_transfer=False, auto_exit_fill=False
OUT: Recovery auto RECOVERY_COMPLETE
Maintain: Protocol / Display / Evidence / HTR contract / Schemas
Freeze after impl: Runtime Freeze only (no new freeze)
Paper/Replay: Simulation auto_* retained

Code: NONE / Schema: NONE / Freeze: NONE (this document)
```
