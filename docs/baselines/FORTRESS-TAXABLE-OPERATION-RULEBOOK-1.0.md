# FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0

**Document ID:** `FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0`  
**Title:** 特定口座プロトコル — 運用ルールブック（責務境界・運用原則）  
**Status:** **FROZEN**  
**Date:** 2026-08-08  
**Path:** `docs/baselines/FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0.md`  
**Classification:** Operation Authority（運用の読み方・責務境界）  

---

## Freeze

```text
FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0

Status: FROZEN
Freeze: COMPLETE
Freeze Authorization: GRANTED（Human Request 2026-08-08）
Final Freeze Review: PASS

Canonical baseline:
  docs/baselines/FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0.md

Freeze Record (registration):
  docs/reports/FORTRESS-REGISTER-TAXABLE-OPERATION-RULEBOOK-1.0.md

Confirmed at authorization:
  - State Ownership 反映
  - Live / Simulation 分離
  - Trade Report 運用反映
  - Input Test PASS
  - Code / Schema / Logic 変更なし

Frozen scope:
  State Ownership / Live·Simulation分離 / Trade Report運用 /
  未実行ケース / 禁止・人間境界 / 監視〜報告の流れ / Freeze関係

Unfreeze requires:
  1. Explicit Human authorization
  2. New version record (e.g. …-RULEBOOK-1.1) — do not overwrite 1.0 meaning
  3. No silent REOPEN of Display / Evidence / Protocol / Schema / Runtime boundary
```

**Parent / Related Authority（競合時は各 Freeze / Spec が優先）:**

| 領域 | 文書 |
|---|---|
| Protocol / Runtime | `ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0` / `ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0`（Live Position completion premise 含む） |
| Human Trade Report | `ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0` |
| Human Display | `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` / Mapping / `FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0` |
| State Ownership | `FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0` |
| Live Alignment | `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0` / Implementation Auth |
| Trade Report 入力確認 | `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0` |
| Principles | `FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0` / `FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0` |

**Protocol Rule Change:** **NO**  
本 Rulebook は運用境界の読み方を固定する。  
Protocol Logic / Decision 条件 / Sensor / Schema / Execution Logic / Human Display / Evidence を変更しない。  
Rulebook は上記 Freeze に**追随**する運用文書であり、上書きしない。

---

## Scope of this version

### 本 Freeze が確定する範囲

- 目的・運用原則  
- State Ownership（Decision / Human Action / Trade Fact / Actual Position）  
- Live / Simulation 分離  
- Trade Report 運用（購入・売却・Reject・Cancel）  
- 未実行ケース  
- 禁止事項・人間操作境界・監視〜報告の流れ  
- 既存 Freeze との関係  

### 本版で決めない（保留・別文書）

- 具体的な UI 表現の改訂  
- Discord 導線の新規改善  
- Evidence の新規追加（Evidence-1.0 範囲外）  
- 新規センサー追加  
- Recovery 自動発火の扱い（Runtime Freeze 明示の別 CR 候補）  
- 3層 Schema 分離（Ownership Decision D3 = 将来）  

本 Rulebook を理由に Display / Evidence / Protocol Freeze を REOPEN しない。

---

## 1. 目的

特定口座プロトコルを、Human Operator が**迷わず継続運用できる**ための運用正本とする。

本 Rulebook が答える問い:

1. 今、システムは何をしているか（監視・判断 = Decision）  
2. 今、人間は何をすべきか（実行・報告・待機）  
3. 何をしてはならないか（自動化・責務越境・Live/Simulation 混同）  
4. 事実はどこに残るか（Trade Fact / Journal）  
5. 保有はいつ更新されるか（Actual Position = Trade Fact 確定後）  

本 Rulebook は「内部状態を全部説明すること」が目的ではない。  
**運用判断と人間操作・実約定の境界を誤らせないこと**が目的である。

---

## 2. 運用原則

1. **Decision と Actual Position を混同しない** — 判断の成立だけでは保有を進めない。  
2. **Decision は人間に命令しない** — Protocol / Engine は状態遷移と表示用結論を出す。Broker への発注命令は出さない。  
3. **Execution は人間** — 市場での購入・売却は Human Operator が行う。システムは自動発注しない。  
4. **Trade Report は事実同期** — Discord / CLI の購入・売却報告は Fact 入力境界であり、新たな売買判断ではない。  
5. **Live Position 更新は HTR + Trade Fact 後のみ** — Runtime Freeze Live Position completion premise に従う。  
6. **Display は5秒判断** — 主表示は凍結済み4項目（命令 → 司令判断 → 作戦理由 → 戦力状況）。  
7. **Evidence は従属** — 根拠詳細は必要な状態のみ。常時詳細・旧8フィールド復帰は禁止。  
8. **Live と Simulation を混同しない** — Paper / Replay の `auto_*` を Live 実約定と同一視しない。  
9. **設計一貫性優先** — 短期の便利さより、責務分離と検証可能性を優先する。  

---

## 3. State Ownership（責務境界）

### 3.1 四つの意味

| 概念 | 意味 | 備考 |
|---|---|---|
| **Decision** | Protocol が判断する状態（機会・段階・命令源） | Human 未実行でも存在し得る |
| **Human Action** | 人間が市場で実行する行動 | システム外の証券執行 |
| **Trade Fact** | Trade Report 確定後に記録される実約定事実 | Journal に ACCEPTED として残る |
| **Actual Position** | Trade Fact 確定後に更新される保有状態 | Live では HTR 経路でのみ完了イベント適用 |

**禁止:** Decision 成立のみで Actual Position を更新しない。

### 3.2 運用フロー

```text
Detection / Sensor
      ↓
Decision（判断・段階。未実行でも表示可能）
      ↓
ViewModel → Human Display (+ Evidence)     ← 作戦表示のみ
      ↓
Human Action（市場約定）                   ← 人間のみ
      ↓
Human Trade Report (Discord / CLI) → Port  ← 事実入力
      ↓
Trade Fact（Journal 確定）
      ↓
Actual Position 更新（約定完了相当イベント）
```

| 層 | 責務 | やってはならないこと |
|---|---|---|
| **Decision** | 検知に基づく判断・段階・表示用結論 | Broker 発注、Decision だけで保有完了 |
| **Human Action** | 市場での約定 | 内部イベント名の捏造、Confirm 前の「完了」扱い |
| **Trade Fact** | 実約定の証拠（ACCEPTED） | Fact から Decision 条件を再発明 |
| **Actual Position** | Fact 確定後の保有同期 | Live で Simulation `auto_*` による完了 |
| **Trade Report Port** | 検証・Journal・正規ルート適用 | Adapter の Port 迂回 |
| **Human Display / Evidence** | Internal → 作戦語 | Logic 変更、内部トークン露出 |

永続コンテナ `TaxableAccountState` は Runtime SoT として Decision 段階と同期後 Position を保持し得る。  
読み方として **Decision 進行**と **Actual Position 完了**を混同してはならない。

---

## 4. Live / Simulation 分離

### 4.1 Live（実運用）

```text
auto_fill = False
auto_transfer = False
auto_exit_fill = False
```

- Position 更新（約定完了相当）は **Human Trade Report 経由のみ**  
- 日次 CLI は `live_ops_runtime_config()`（Runtime Freeze Live Position completion premise）  
- Broker 自動発注は禁止  

### 4.2 Paper / Replay（Simulation）

- `auto_fill` / `auto_transfer` / `auto_exit_fill` の Simulation 動作を**許可**する  
- 実約定・証券執行が起きたとは**解釈しない**  
- Decision 進行・試験短縮の用途に限定する  

### 4.3 混同禁止

| 禁止 |
|---|
| Live 日次で Simulation `auto_*` を有効にしたまま運用する |
| Simulation の自動完了を「人間が約定した」と記録・会話する |
| Live と Paper の前提を同一手順書に曖昧に混在させる |

---

## 5. Trade Report 運用

入力経路の確認記録: `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0`（PASS）。  
正経路: Discord slash / CLI → Input Adapter → Preview → Confirm → `TradeReportPort` → Journal。

### 5.1 購入報告

1. 銘柄 Choice 選択  
2. 約定価格入力  
3. 約定日入力（YYYYMMDD 推奨 / YYYY-MM-DD 可）  
4. 数量入力  
5. Preview 確認（購入対象 / 現在保有 / 約定内容）  
6. Confirm 後に Trade Fact 化（ACCEPTED 時）→ Actual Position 更新  

### 5.2 売却報告

1. 銘柄 Choice 選択  
2. **現在保有**を Preview で確認  
3. 約定価格入力  
4. 約定日入力  
5. 数量入力  
6. Confirm 後に Trade Fact 化（ACCEPTED 時）→ Actual Position 更新  

### 5.3 Reject

| 結果 | 規則 |
|---|---|
| State（Actual Position） | **変更なし** |
| Trade Fact ACCEPTED | **なし** |
| Journal | Port 到達後の Reject は HTR どおり `REJECTED` 行のみ（`routed_event` なし）。Position 完了 Fact ではない |
| 運用 | 詳細を読み、入力・保有・状態を正して再報告 |

典型: 不正銘柄、不正日付、保有不一致、重複報告。

### 5.4 Cancel

| 結果 | 規則 |
|---|---|
| Fact 生成 | **なし**（Confirm 前の下書き取消） |
| State | **変更なし** |

Confirm 前の下書きを約定完了とみなしてはならない。

---

## 6. 未実行ケース

```text
Decision: 成立（例: EXIT_PENDING / ENTRY_READY / 売却・購入命令の表示）
Human:    未実行（市場約定なし・Trade Report なし）
```

| 結果 | 規則 |
|---|---|
| Display | **可能**（命令・判断を表示してよい） |
| Decision 状態 | **維持**（判断段階は進んでいてよい） |
| Actual Position | **不変** |
| Trade Fact | **なし** |

Decision だけ見て「すでに約定した」と扱ってはならない。

---

## 7. 禁止事項

### 7.1 システム側

- Broker **自動発注** / Live 取引権限の暗黙付与  
- Live で Decision のみによる Actual Position 完了（`auto_transfer` / `auto_exit_fill` / `auto_fill` による本番完了）  
- Discord Projection からの状態遷移・再判定  
- Trade Report Adapter の `TradeReportPort` 迂回  
- Fact Journal を Protocol 自動改善の入力にすること  
- Human Display 主画面への内部 enum / Sensor 名 / 内部イベント名の露出  
- 凍結済み主表示4項目の順序・ラベル改変（Display Freeze 改訂なしに）  
- 旧8フィールド運用画面への回帰  

### 7.2 人間側

- 命令が「待機」のときに不要な約定・報告を行うこと  
- Confirm 前の下書きを「約定完了」とみなすこと  
- Reject / Error を無視して同一内容を連打すること  
- 内部イベント名（例: `ENTRY_FILLED`）を運用会話の主語にすること  

### 7.3 本 Rulebook が命じないこと

- UI 文言の即時改訂  
- Discord 導線の新規実装  
- Evidence / Sensor の新規追加  
- Recovery 自動経路の改訂（別 CR）  
- 自動化範囲の拡大  

---

## 8. 人間操作が必要な境界

| 局面 | 人間の操作 | システム |
|---|---|---|
| **購入が必要** | 市場購入 → 購入報告 → Confirm | Display・検証・ACCEPTED Fact・Position 更新 |
| **売却が必要** | 市場売却 → 売却報告 → Confirm | 同上 |
| **待機 / 未実行** | 介入しない | Decision 表示のみ。Position / Fact 不変 |
| **Reject** | 再確認のうえ再報告 | State 不変。ACCEPTED Fact なし |
| **Cancel** | 必要ならやり直す | Fact なし。State 不変 |
| **Live 約定の真実** | 証券会社側の約定が一次事実 | 報告 Confirm 後に Fact 化 |

自動で行ってよいもの（人間操作不要）:

- 市場データ取得〜 Detection 〜 **Decision** 更新（定められた Runtime）  
- ViewModel / Discord 投影（表示のみ）  
- 報告 ACCEPTED 後の Journal 追記と正規イベントによる Actual Position 更新  
- Paper / Replay の Simulation `auto_*`（演習のみ）  

---

## 9. 監視・判断・報告の流れ（Live）

```text
1. 監視
   市場データ → Detection → Decision 更新
   （Actual Position 完了はまだ行わない）

2. 判断（表示）
   命令 → 司令判断 → 作戦理由 → 戦力状況
   （必要時のみ Evidence）

3. 行動分岐
   A. 待機 / 未実行 → 何もしない（§6）
   B. 購入 → 市場約定 → 購入報告（§5.1）
   C. 売却 → 市場約定 → 売却報告（§5.2）

4. 報告後
   ACCEPTED: Fact + Actual Position 更新。追加操作不要へ
   REJECTED: §5.3。再報告
   Cancel: §5.4
```

報告は「買う／売る決断」ではない。  
**すでに市場で起きたことの記録と Actual Position 同期**である。

---

## 10. 既存 Freeze との関係

本 Rulebook は運用境界文書として追随する。次を**変更しない / REOPEN しない**:

| 対象 | 扱い |
|---|---|
| Human Display Freeze | 主表示・入力表面の正。不変 |
| Evidence Freeze | 詳細根拠の正。不変 |
| Protocol / Decision 条件 | 不変 |
| Sensor | 不変 |
| Schema（State / Trade Fact / Journal） | 不変 |
| Execution Logic（条件式） | 不変 |
| HTR Port Freeze | 報告 Port の正。不変 |
| Runtime Freeze | Live Position completion premise を含む ops 正。本 Rulebook はそれに追随 |

衝突時: 各 Freeze / Spec が優先。Rulebook は運用の読み順を束ねる。

---

## 11. Final Freeze Review（2026-08-08）

| # | 確認項目 | 判定 |
|---|---|---|
| 1 | State Ownership — 四責務明確 / Decision のみで Actual Position 不変 | **PASS**（§3 / §6） |
| 2 | Live / Simulation 分離 — Live は HTR+Fact 後のみ / `auto_*` 非混同 | **PASS**（§4） |
| 3 | Trade Report 運用 — 購入・売却・Reject・Cancel が Input Test と一致 | **PASS**（§5 ↔ INPUT-TEST-1.0） |
| 4 | Freeze 整合 — 変更は Rulebook のみ / 他 Freeze・Protocol・Schema・Runtime 境界維持 / 追加ゲートなし | **PASS**（§10） |

**総合:** **PASS → Freeze Authorization**

---

## 12. Version

```text
Status: FROZEN
FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0

Final Freeze Review: PASS
Freeze Authorization: GRANTED 2026-08-08（Human Request）
Freeze Record: docs/reports/FORTRESS-REGISTER-TAXABLE-OPERATION-RULEBOOK-1.0.md

Code: NONE / Logic: NONE / Schema: NONE
Does not reopen: Display / Evidence / Protocol / Sensor / Schema / Runtime boundary
```
