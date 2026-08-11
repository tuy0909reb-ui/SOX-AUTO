# FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0

**Document ID:** `FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0`  
**Title:** 特定口座プロトコル — Human Display Evidence Layer Specification  
**Status:** **FROZEN**（Design + Implementation Freeze）  
**Date:** 2026-08-08  
**Design Freeze Authorization:** APPROVED  
**Implementation Freeze Authorization:** AUTHORIZED  
**Path:** `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0.md`  
**Classification:** Human Interface Layer / Evidence（根拠補足層）  

**Parent Authority:**

- `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0.md`  
- `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md`  

**Upstream Principles:**

- `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`  
- `docs/principles/FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0.md`  

**Implementation Anchors（Implementation Freeze 範囲）:**

- `taxable_account/view/human_display.py`  
- `taxable_account/view/discord_adapter.py`  
- Evidence-related tests（例: `tests/test_taxable_account_evidence_layer.py`）  

**Protocol Rule Change:** **NO**  
本仕様は表示層における根拠補足のみを定義する。  
Sensor / Decision / Protocol Logic / Runtime / Execution / Schema / Fact / Journal / Routing / Registry 構造は変更しない。

---

## Freeze Record

```text
FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0

Evidence Implementation Verification: VERIFIED

Decision: IMPLEMENTATION FREEZE AUTHORIZED

Freeze:

AUTHORIZED

Baseline: FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0
Parent:   FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0 (REOPEN: NO)
Mapping:  FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0

Freeze Scope:
- Evidence Mapping implementation
- taxable_account/view/human_display.py
- taxable_account/view/discord_adapter.py
- Evidence-related tests

Boundary:
- Protocol Logic: UNCHANGED
- Sensor: UNCHANGED
- Decision: UNCHANGED
- Runtime: UNCHANGED
- Execution: UNCHANGED
- Trade Fact / State / ViewModel Schema: UNCHANGED
- Journal / Routing: UNCHANGED

Verification:
- Architecture / Boundary: PASS
- Main Display Regression: PASS
- Evidence State Mapping: PASS
- 1570 Risk Stop → Time Exit priority: PASS
- Token Leakage: PASS
- Discord Payload: PASS
- Regression Tests: 75 passed

Changes after Freeze: NONE
```

### Design Freeze Conditions（正式・維持）

1. 主表示4項目（命令 / 司令判断 / 作戦理由 / 戦力状況）は  
   `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` の Freeze を維持する。  
2. Evidence は主表示に従属する詳細層であり、主表示を変更・置換しない。  
3. 平時の常時詳細表示は禁止する。  
4. 1570 Swing の Exit 監視は二軸を正式仕様とする。  
   - Risk Stop: 15% 下落  
   - Time Exit: 保有日数上限  
   Human Evidence 優先順位: 第一 Risk Stop / 第二 Time Exit  
5. Entry Ready / Sell Ready / Growth Recovery / Waiting /  
   Trade Result / Reject / Error の Evidence 条件は本文記載を正式仕様とする。  
6. 現在の ViewModel に存在しない SOX DD% / RSI14 / MA200 乖離等の生市場数値は対象外。  
7. Protocol Logic / Sensor / Decision / Runtime / Execution /  
   Trade Fact / State Schema / Journal / Routing は変更しない。  
8. 内部 enum / Sensor 名 / Protocol 名 / 内部イベント名 / 生例外コード等を Human 面へ露出させない。  
9. 旧8フィールド表示へ戻さない。  

### Implementation Freeze Conditions（正式）

1. Evidence Mapping 実装は本 SoT に一致した状態で凍結する。  
2. Freeze 後に Evidence の設計・実装を変更しない。  
3. `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` を REOPEN しない。  
4. 本 Freeze の一部として Protocol / Sensor / Decision / Runtime / Schema を変更しない。  

Parent Display Freeze（`…-HUMAN-DISPLAY-1.0`）は **REOPEN しない**。

---

## 0. Purpose

`FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` の凍結済み主表示4項目を変更せず、  
必要な状態に限って最小限の判断根拠を「詳細」として付加する。

```text
主表示 = 5秒判断（命令 → 司令判断 → 作戦理由 → 戦力状況）
Evidence = なぜその判断なのかを検証するための最小根拠
```

Evidence は主表示を置き換えない。  
Evidence は主表示に従属する詳細情報である。  
旧8フィールド表示の復活ではない。

---

## 1. 主表示（Freeze 維持・変更禁止）

```text
【大要塞｜特定口座】

命令:
司令判断:
作戦理由:
戦力状況:
```

- 順序・ラベル・基本構造を変更しない  
- `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` は **REOPEN しない**  
- Mapping の基本写像（`…-MAPPING-1.0`）は維持する  

---

## 2. Evidence 基本原則

1. **常時詳細表示は禁止**  
2. 主表示4項目だけで判断可能な平時状態では Evidence を表示しない  
3. 行動要求・異常・結果確認など、追加根拠に意味がある状態だけ表示する  
4. Evidence は最小限とする  
5. 内部 enum / Sensor 名 / Protocol 名 / 内部イベント名を表示しない  
6. 生の内部状態をそのまま出さず、Human 向け作戦語へ写像する  
7. 数値を出す場合も、判断に直接必要なものだけに限定する  
8. 旧8フィールド表示へ戻さない  
9. Evidence の追加によって5秒判断を阻害しない  
10. 新しい判断・条件判定・Protocol 複製を Evidence 内で行わない  

責務境界:

```text
Evidence = 既存 State / ViewModel 情報の表示写像のみ
```

禁止:

- 新しい判断の生成  
- 新しい Sensor の追加  
- Evidence 内での条件判定ロジック  
- Protocol Logic の複製  
- Internal State の単純置換大量表示  
- Debug 情報の混入  

---

## 3. 状態別 Evidence

### 3.1 Growth HOLD

| | |
|---|---|
| **Evidence** | **なし** |
| **主表示** | 「待機（介入不要） / 防衛維持」等で完結 |

表示しない: P/L、候補一覧、Sensor、SOX 等の数値、保有日数、内部 enum  

警戒状態であっても、主表示の作戦理由で判断可能なら Evidence を追加しない。

---

### 3.2 Swing HOLD

| | |
|---|---|
| **基本** | 平時 Evidence **なし** |

#### 1570（二軸 Exit 監視 — 重要）

1570 Swing の Exit 判定は次の二軸で監視する。

| 軸 | 内容 |
|---|---|
| **Risk Stop** | 15% 下落 |
| **Time Exit** | 保有日数上限 |

「Risk Stop のみを監視する」という意味にはしない。

Human Evidence が必要な場合の**表示優先順位**:

1. **第一:** Risk Stop  
2. **第二:** Time Exit  

平時に両方を常時表示する必要はない。  
必要時に判断上重要な情報だけを最大限簡潔に表示する。

| 必要時の例 | Evidence |
|---|---|
| Risk Stop 側を示す必要がある場合 | Risk Stop 情報 |
| Time Exit 側を示す必要がある場合 | 保有日数 / 上限 |
| 両方が同時に判断材料として必要な場合のみ | **最大2項目** |

損益概況は常時表示しない。

#### 282A

Time Exit を主軸とする。

| 必要時 Evidence | 保有日数 / 上限 |
|---|---|

#### Swing HOLD で表示しないもの

enum、Sensor 名、全 Sensor 数値、資金フロー全体、常時 P/L  

---

### 3.3 Entry Ready

| | |
|---|---|
| **Evidence** | **必須** |

最小3項目:

1. **投入局面** — 「暴落反発」 / 「半導体Swing」等（Human 向け作戦語）  
2. **投入状態** — 「未保有・投入待ち」  
3. **条件成立日** — `YYYY年M月D日`（`signal_date` が存在する場合のみ）  

条件付き:

4. **警戒局面: 継続** — `alert_on` の場合のみ  

目的: 「なぜ今 Entry なのか」を最低限説明する。

表示しない: SOX DD%、RSI14、MA200 乖離、Sensor 名、候補一覧、P/L、不要な Risk 情報  

現行 ViewModel に存在しない生市場数値を得るための Sensor / VM 拡張は行わない。

---

### 3.4 Growth Recovery

| | |
|---|---|
| **表示タイミング** | **成立時のみ** |
| **必須** | `復帰条件: 成立` |

- 進捗表示（例: 8/20）は **不要**  
- 未成立は Waiting として扱い、Evidence **なし**  

表示しない: Model 名、内部 enum、内部 Recovery token  

---

### 3.5 Waiting

| | |
|---|---|
| **Evidence** | **なし** |

条件進捗・数値・Sensor 状態を必要以上に表示しない。  
主表示「待機（条件確認） / 警戒監視」で判断できる状態を維持する。

---

### 3.6 Sell Ready

| | |
|---|---|
| **Evidence** | **必須** |
| **内容** | **対象銘柄** |

命令と Evidence の対象銘柄が一致することを確認できるようにする。

例:

```text
命令:
1570売却

詳細:
対象銘柄: 1570
```

「市場撤退」等の抽象表現は使用しない。  
現在保有の確認は Preview 等で可能な場合があるが、Sell Ready の主 Evidence として常時 P/L 等は不要。

表示しない: 全 Sensor、P/L 常時表示、内部 enum  

---

### 3.7 Trade Result

| | |
|---|---|
| **基本** | 主表示だけで完結 |
| **必要時 Evidence** | 約定日 / 約定価格 / 数量 |

内部イベント名（`ENTRY_FILLED` / `EXIT_FILLED` 等）は Human 面に出さない。

---

### 3.8 Reject

| | |
|---|---|
| **Evidence** | **必須** |

- 対処説明（日本語）  
- 現在保有  

目的: 何が受理されなかったか、次に何を確認すべきかを明確にする。

表示しない: 生の例外コード、内部イベント名、Stack trace、内部 Protocol 情報  

---

### 3.9 Error

| | |
|---|---|
| **Evidence** | **必須** |

- 対処可能な短い日本語説明  

表示しない: `ERROR:`、Stack trace、内部コード、内部例外名、内部イベント名  

---

## 4. Evidence 表示条件（一覧）

| 状態 | Evidence |
|---|---|
| Growth HOLD | なし |
| Waiting | なし |
| Swing HOLD | なし（必要時のみ銘柄別 1〜2 項目。1570 は Risk Stop 優先・Time Exit 第二） |
| Entry Ready | あり（必須3＋条件付き1） |
| Sell Ready | あり（対象銘柄） |
| Growth Recovery 成立 | あり（復帰条件: 成立） |
| Trade Result | 必要時のみ（約定3点） |
| Reject | あり |
| Error | あり |

Evidence は常時表示しない。

---

## 5. Discord 表示仕様

形式:

```text
【大要塞｜特定口座】

命令:
〇〇

司令判断:
〇〇

作戦理由:
〇〇

戦力状況:
〇〇

詳細:
〇〇
```

規則:

- `detail` が空の場合、「詳細:」そのものを表示しない（空欄フィールド禁止）  
- 主4項目の順序・ラベルは完全固定  
- Evidence は `FortressDisplay.detail` に格納可能な従属情報として扱う  
- Embed を用いる場合も、詳細は主4項目の**後**にのみ置く  

---

## 6. 用語（Human 面）

使用してよい例:

- 購入 / 売却 / 待機  
- 防衛維持 / 前線維持 / 出撃準備 / 帰投準備 / 警戒監視 / 撤退準備  
- 予備戦力（現金）  
- Risk Stop / Time Exit / 保有日数 / 条件成立日  

軍事語は判断ラベルとしてのみ使用する。  
「市場撤退」等、意味が広すぎる抽象表現は使用しない。

---

## 7. 数値根拠の境界

- **使用可:** 現在の ViewModel / State に存在する情報のみ  
- **対象外（今回）:** SOX DD%、RSI14、MA200 乖離  

これら生市場数値を追加する場合は Evidence Layer の範囲を超え、  
Sensor / ViewModel 拡張の**別 Design Review** を要する。

本仕様の実装では Logic / Sensor / VM を変更しない。

---

## 8. 1570 重要仕様（再掲）

```text
Risk Stop  : 15% 下落
Time Exit  : 保有日数上限
```

表示優先順位（Evidence が必要な場合）:

1. Risk Stop  
2. Time Exit  

これは「Risk Stop だけを表示する」という意味ではない。  
平時は Evidence なしを基本とし、必要時に判断上重要な軸を表示する。  
両方が同時に必要な場合のみ最大2項目。

---

## 9. 変更禁止範囲

以下は変更しない。

- Protocol Logic / Sensor Logic / Decision Logic  
- Runtime Logic / Execution  
- Trade Fact Schema / State Schema / Journal  
- Routing / Registry 構造  
- `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` の主表示4項目  
- `FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0` の基本写像  

本ファイルの成果物は **Evidence Layer の仕様文書** である。

---

## 10. Freeze との関係

| 文書 | 扱い |
|---|---|
| `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` | **REOPEN しない**（主表示 Freeze 維持） |
| 本 Evidence-1.0 | Parent に従属。Design + Implementation **FROZEN** |

Evidence Layer のライフサイクル:

```text
文書作成 → Design Review → 文書 Freeze → 実装 → Verification (VERIFIED)
  → Implementation Freeze (AUTHORIZED / 本段階完了)
```

Freeze 後は Evidence の設計・実装を変更しない。  
変更には新バージョン発行と Human Architect 承認を要する。

---

## 11. 実装前ゲート（チェックリスト）

文書・実装前に以下を確認する。

| # | 確認 | 本文書 |
|---|---|---|
| 1 | 1570 の Risk Stop + Time Exit 二軸が正しく記載 | §3.2 / §8 |
| 2 | Risk Stop 優先・Time Exit 第二の優先順位が明確 | §3.2 / §8 |
| 3 | 平時の詳細常時表示に戻っていない | §2 / §4 |
| 4 | Entry Ready の根拠3項目（＋警戒条件付き）が維持 | §3.3 |
| 5 | Recovery 成立時が「復帰条件: 成立」のみ | §3.4 |
| 6 | Waiting に不要な進捗・数値を追加していない | §3.5 |
| 7 | Sell Ready の対象銘柄が明確 | §3.6 |
| 8 | Reject / Error に対処可能な日本語詳細 | §3.8 / §3.9 |
| 9 | 内部 Token が Human 面へ漏れない | §2 / §6 |
| 10 | 主表示4項目の Freeze を侵害していない | §1 / §10 |

---

## 12. Version

```text
Status: FROZEN (Design + Implementation)
FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0
Parent: FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0 (REOPEN: NO)
Mapping: FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0
Implementation Freeze: AUTHORIZED
Verification: VERIFIED
Changes after Freeze: NONE
Logic Changes: NONE
Schema Changes: NONE
```

改訂時は本ファイルを意味上書きせず、新バージョンを発行する。  
変更には明示的な Human Architect 承認を要する。
