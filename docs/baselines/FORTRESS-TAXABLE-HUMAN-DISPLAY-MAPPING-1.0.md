# FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0

**Document ID:** `FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0`  
**Title:** 特定口座プロトコル — Human Display Mapping Baseline  
**Status:** **FROZEN DISPLAY SPEC**（表示写像の正本）  
**Date:** 2026-08-07  
**Wording Revision:** 2026-08-08（Architect: 命令から「報告」除去 / 売却理由・戦力表記 / CASH非露出）  
**Path:** `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md`  
**Classification:** Human Interface Layer / Presentation Mapping  

**Parent Authority:**

- `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`  
- `docs/principles/FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0.md`  

**Domain:** 特定口座プロトコル（戦術運用ドメイン / 日常司令の主戦場）  

**Protocol Rule Change:** **NO**  
本仕様は Internal State → Human Display の写像のみを固定する。  
Sensor / Decision / Protocol Logic / Runtime / Trade Fact / Registry / Routing / Execution は変更しない。

---

## 0. Pre-creation Review（文書確定時の確認）

| # | 確認 | 結果 |
|---|---|---|
| 1 | 用語が Human 理解を阻害しないか | **PASS**（骨格は判断直結。CASH は「予備戦力（現金）」と併記） |
| 2 | 軍事メタファーが装飾化していないか | **PASS**（命令・司令・戦力に限定。壊滅系は不使用） |
| 3 | 初見5秒判断可能か | **PASS 条件**（平時4項目のみ・命令先頭） |
| 4 | 既存 Protocol Logic と矛盾しないか | **PASS**（写像のみ。状態遷移条件は不変） |
| 5 | より良い表現 | 下記 §0.1（任意改善・本版では括弧内を採用） |

### 0.1 表現上の注記（本版の採用）

| 項目 | 採用 | 備考 |
|---|---|---|
| CASH | **予備戦力（現金）** | 「予備戦力」単独より初見理解が速い |
| Growth 作戦理由 | **成長方針を継続** | 「Growth継続」より内部語感が弱い |
| Sell Ready 司令判断 | **撤退準備** | Architect 案を採用（移管準備より命令＝売却と一致） |
| 戦力状況（Reject） | **現在の保有をそのまま表示** | 「現在状態維持」はメタ表現のため、実装時は実銘柄／予備戦力（現金）を出す |

---

## 1. Human Display 骨格（変更禁止）

見出し:

```text
【大要塞｜特定口座】
```

本文（表示順固定・項目追加禁止・平時）:

```text
命令:
〇〇

司令判断:
〇〇

作戦理由:
〇〇

戦力状況:
〇〇
```

表示順は Human 判断順に固定する。

```text
行動確認 → 判断確認 → 理由確認 → 状態確認
```

Discord 実装時、本骨格以外の平時フィールドを主画面へ追加してはならない。

---

## 2. Mapping Table

### 2.1 Growth運用

| | |
|---|---|
| **Internal 対象（例）** | `GROWTH_ACTIVE` + 野村保有 + 操作不要（Maintain / Hold 相当） |
| **Human 判断** | 介入不要。成長方針を維持する |

```text
命令:
待機（介入不要）

司令判断:
防衛維持

作戦理由:
成長方針を継続

戦力状況:
世界半導体株投資
```

---

### 2.2 Swing保有

| | |
|---|---|
| **Internal 対象（例）** | `SWING_ACTIVE` + `POSITION_ACTIVE`（1570 / 282A） |
| **Human 判断** | 介入不要。Exit 条件の監視のみ |

```text
命令:
待機（介入不要）

司令判断:
前線維持

作戦理由:
Exit条件監視中

戦力状況:
{保有銘柄}
```

`{保有銘柄}` = `1570` または `282A`（表示名。内部 enum 生値は出さない）。

---

### 2.3 Entry Ready

| | |
|---|---|
| **Internal 対象（例）** | `ENTRY_READY`（BUY READY） |
| **Human 判断** | 対象銘柄の購入が必要 |

```text
命令:
{対象銘柄}購入

司令判断:
出撃準備

作戦理由:
投入条件成立

戦力状況:
予備戦力（現金）
```

`{対象銘柄}` = Selection 上の候補表示名（`1570` / `282A`）。  
「報告」は Input 操作名に限り、命令ラベルには使わない。

---

### 2.4 Growth Recovery

| | |
|---|---|
| **Internal 対象（例）** | `REENTRY_PENDING` かつ復帰条件成立（購入が有効なとき） |
| **Human 判断** | 世界半導体株投資の購入が必要 |

```text
命令:
世界半導体株投資 購入

司令判断:
帰投準備

作戦理由:
復帰条件成立

戦力状況:
予備戦力（現金）
```

注: `REENTRY_PENDING` でも復帰条件未成立の間は §2.5 Waiting 系（介入不要）へ写像する。  
条件の真偽判定自体は Protocol / Detection の責務であり、本 Mapping は結果の表示のみを定義する。

---

### 2.5 Waiting

| | |
|---|---|
| **Internal 対象（例）** | Swing `WATCH` / 条件監視・操作不要 / Recovery 条件待ち 等 |
| **Human 判断** | 今は購入不要。条件を待つ |

```text
命令:
待機（条件確認）

司令判断:
警戒監視

作戦理由:
投入条件待ち

戦力状況:
予備戦力（現金）
```

`REENTRY_WAIT`（Stop 後再評価・操作不要）も本カテゴリに含めてよい。  
その場合の作戦理由候補: `Exit後の再評価`（司令判断は警戒監視のままで可）。

---

### 2.6 Sell Ready

| | |
|---|---|
| **Internal 対象（例）** | Growth `EXIT_PENDING`（移管の売却待ち） / Swing `EXIT`（売り待ち） |
| **Human 判断** | 対象銘柄の売却が必要（市場全体からの撤退ではない） |

```text
命令:
{対象銘柄}売却

司令判断:
撤退準備

作戦理由:
運用局面変更

戦力状況:
予備戦力（現金）
```

「市場撤退」は使用しない。売却は戦力再配置・Swing移行準備の一工程として扱う。  
`{対象銘柄}` = 世界半導体株投資 / 1570 / 282A。

---

### 2.7 Trade Result（BUY / SELL 結果）

同一骨格を使用する。

**禁止:** 内部イベント名の Human 表示  
（例: `ENTRY_FILLED` / `EXIT_FILLED` / `DELAYED_FILL_RECOVERY` / `ABNORMAL_EXIT` / `TRANSFER_COMPLETE` / `RECOVERY_COMPLETE`）

#### BUY 受理例

```text
命令:
待機（介入不要）

司令判断:
買い反映完了

作戦理由:
保有開始

戦力状況:
{保有銘柄}
```

#### SELL 受理例

```text
命令:
待機（介入不要）

司令判断:
売り反映完了

作戦理由:
保有終了

戦力状況:
予備戦力（現金）
```

（移管完了後の戦力は状況に応じ `予備戦力（現金）` または次の配備表示。内部イベント名は出さない。）

---

### 2.8 Reject（BUY / SELL 拒否）

| | |
|---|---|
| **Internal 対象** | Trade Report 検証拒否（状態不一致等） |
| **Human 判断** | いまは報告を通さない。現状を再確認する |

```text
命令:
待機（再確認）

司令判断:
報告不受理

作戦理由:
現在状態と不一致

戦力状況:
{現在の保有表示}
```

`{現在の保有表示}` = 拒否時点の戦力状況（世界半導体株投資 / 1570 / 282A / 予備戦力（現金））。  
「現在状態維持」というメタ文言は Human 主画面に出さない。

---

## 3. 平時に表示しないもの（再掲）

平時主画面・通常結果画面では以下を出さない。

- Sensor 名（`dd15_ma200` / `crash_15` / `semi_signal` 等）  
- Phase / Regime enum 生値（`GROWTH_ACTIVE` 等）  
- 条件日数・保有日数の詳細  
- Risk Stop 価格・距離の詳細  
- 候補一覧・資金移動フロー  
- 市場状態ブロック  
- 内部イベント名  
- 技術的メタ説明  

異常時のみ、命令〜戦力状況のあとに必要最小限の詳細を展開してよい  
（例: 約定不一致、報告拒否の対処、State 不一致）。

---

## 4. Discord 実装時の位置付け

本 Document は、特定口座 Discord Operator Dashboard 実装時の  
**唯一の表示写像基準（Human Display Mapping SoT）** とする。

| Layer | 役割 |
|---|---|
| Protocol / Runtime / Fact | 不変（本仕様の対象外） |
| `human_display` / Discord Adapter / Trade 通知文 | 本 Mapping に従う |

旧 ViewModel フィールド名や英語 Phase ラベルを Human 主画面へ残してはならない。

---

## 5. Completion Criteria

| 条件 | 状態 |
|---|---|
| Mapping 仕様として独立している | YES（本ファイル） |
| Logic 非変更を明記 | YES |
| Discord 実装時の唯一の表示基準になる | YES（§4） |
| 骨格4項目が変更禁止 | YES（§1） |

```text
Status: FROZEN DISPLAY SPEC
FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0
```

改訂時は本ファイルを上書きせず、新バージョンを発行する。  
変更には明示的な Human Architect 承認を要する。
