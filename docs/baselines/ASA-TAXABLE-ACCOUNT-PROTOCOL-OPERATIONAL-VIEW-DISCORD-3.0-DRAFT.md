# ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-VIEW-DISCORD-3.0-DRAFT

# 特定口座プロトコル — Operational View（Discord表示）再設計 Phase 1

**Status:** **DRAFT — Entry Timing + signal_date（Option B 実装済・表示接続）**  
**Date:** 2026-08-05  
**Revision:** signal_date SoT 追加 + Discord Entry状態 / 保有期間表示  
**Scope:** State加算 + Runtime保持 + View/Discord 投影（Entry/Exitルール変更なし）  
**Human decision:** Option B（`signal_date` 加算）を採用・実装  

---

## 0. Implementation Review（必須・今回）

### 0.1 結論サマリ

| 項目 | 判定 |
|---|---|
| 表示仕様としての Entry / Signal 分離 | **採用可（本Draftへ反映）** |
| 既存 SoT だけで完全実装 | **不可（下記 Issue）** |
| Protocol / Detection / Asset Selection 矛盾 | **なし** |
| Time Exit 保有日数（entry_date 基準） | **Runtime接続済**（`StepResult.time_exit`）→ 表示写像のみで可 |
| コード変更（本依頼） | **実施しない** |

### 0.2 Issue（Human判断待ち）

```text
Issue:
  signal_date / SIGNAL_DETECTED の SoT 欠落

対象:
  Operational View Discord Entry Timing 表示
  （条件成立日・投入待ち経過・SIGNAL_DETECTED）

問題:
  1) TaxableAccountState に signal_date（条件成立日）フィールドがない。
  2) PositionState に SIGNAL_DETECTED は存在しない
     （WATCH → ENTRY_READY → POSITION_ACTIVE のみ）。
  3) Runtime は entry_possible 時に同stepで ENTRY_READY へ遷移し得るため、
     「条件検出」を独立持続状態として投影できない。
  4) Entry遅延の「経過: X日」は signal_date 永続化なしでは正確に出せない。
     （ENTRY_READY 中の as_of を仮の Signal にすると、初日しか正しくない／
      プロセス再起動で失われる）。

影響:
  - 依頼 §1 SIGNAL_DETECTED / §1 ENTRY_READY の signal_date /
    §3 Entry遅延 / §4 Signal行 を「完全に仕様どおり」出すには
    表示層だけでは不足。
  - entry_date・保有 X/XX・Time Exit 監視・Risk Stop は既存情報で表示可能。

推奨対応（Humanが選択）:

  Option A — 表示仕様のみ先行（State変更なし）
    - SIGNAL_DETECTED を独立表示せず、ENTRY_READY（投入待ち）に統合
    - Signal: ENTRY_READY 期間中は「条件成立（日付未記録）」または
      運用メモ欄を使わず「—」（非表示）
    - Entry: 未投入時は「未投入」／投入後は entry_date
    - 保有期間・Time Exit は entry_date 基準のみ（依頼どおり）
    - コードは承認後に View/Discord のみ

  Option B — 加算 SoT（別CR・本依頼外）
    - 任意フィールド signal_date（ENTRY_READY 遷移時に一度セット、
      SIGNAL_LOST / ENTRY_FILLED / Flat でクリア）を追加
    - その後 §1–§4 を完全実装
    - Protocol「意味変更」ではなく additive SoT（別認可が必要）

  Option C — 本 Entry Timing 表示を保留
    - Discord 3.0 他セクションのみ先に進める
```

**Human 判断: Option B 採用済み。`signal_date` は TaxableAccountState に永続化し、Discord Entry状態へ投影する。**

---

## 1. Purpose

既存の売買ロジック・State・Detection・Asset Selectionは変更しない。

Discord を「資産管理画面」ではなく、

> **特定口座プロトコルの運用判断画面**

として完成させる。

オペレータが短時間で理解すること:

1. **現在何をしているフェイズか**  
2. **現在の保有方針（判断＋理由）**  
3. **Entry待機なのか保有中なのか／条件成立後に未投入なのか**  
4. **保有期間をどこから数えているか（entry_date 基準）**  
5. **次に何をする可能性があるか（候補＋発動条件）**  
6. **判断の背景となる市場環境**  

---

## 2. Hard Constraints

### 変更禁止

| Area | Rule |
|---|---|
| Trading protocol | 禁止 |
| Detection | 禁止 |
| State 遷移 / State 設計 | 禁止（本依頼範囲外。Option B は別CR） |
| Asset Selection | 禁止 |
| 1570 Risk Stop 規則 | 禁止 |
| Entry Logic | 禁止 |
| Legacy SOX コード | 禁止（Webhook 接続のみ継続可） |

### 変更対象（承認後の実装Phaseのみ）

| Layer | 内容 |
|---|---|
| Operational ViewModel（投影DTO） | 人間語ラベルへの写像 |
| Discord Adapter | Embed レイアウト / 文言 |
| 表示仕様ドキュメント | 本ファイル |

### 投影原則

```text
TaxableAccountState (+ runtime marks: time_exit, as_of)
  → Operational View (human labels)
  → Discord Adapter (format only)
```

- 表示は写像のみ。Discord で判断・センサー計算をしない  
- **内部センサー名の直接表示は禁止**  
- **予定購入日・推定投入期限は表示禁止**（運用実績ではない）

禁止例（Discord本文）:

```text
dd15_ma200
crash_15
semi_signal
Model B
GROWTH_ACTIVE 等の内部 enum 生値
planned_entry_date / 予定購入日 / 推定購入日
```

---

## 3. Discord の役割

| やること | やらないこと |
|---|---|
| 運用フェイズの把握 | 評価額・損益・口数の管理 |
| 保有方針と理由の確認 | 証券口座画面の代替 |
| Signal と Entry（購入実績）の区別 | 予定投入日の管理 |
| 保有期間（entry_date 基準）と Exit監視 | Time Exit を signal_date で数えること |
| 次候補と発動条件の提示 | 価格の精密モニタ |
| 市場環境の背景確認 | 自動発注 |

---

## 4. 表示順序（固定）

Discord Embed の field 順は以下に**固定**する。

```text
1. 運用フェイズ

2. Current Decision
   - 判断
   - 理由

3. Entry状態
   - Signal:（条件情報）
   - Entry:（投資実績）
   - 状態:

4. 現在ポジション

5. 保有期間 / Exit監視
   - 保有日数: X / XX営業日
   - Time Exit:
   - Risk:

6. 資金移動フロー

7. 市場環境
   - SOX:
   - 日経レバ:
```

`content` 行（短文）:

```text
【特定口座】{運用フェイズ} | {decision 短縮} | {現在ポジション短名}
```

例: `【特定口座】Growth Phase | 世界半導体株投資 維持 | 世界半導体株投資`

---

## 5. Section Specs

### 5.1 運用フェイズ

内部 State 名をそのまま出さない。

| 内部 `regime_state`（参照のみ・非表示） | Discord 表示名 |
|---|---|
| `GROWTH_ACTIVE` | Growth Phase |
| `EXIT_PENDING` | Crash Phase |
| `SWING_ACTIVE` | Swing Phase |
| `REENTRY_PENDING` | Recovery Phase |

任意の1行補足は人間語のみ（例: 「Growth撤退・Swing準備」「急落環境下の Swing」）。

---

### 5.2 現在判断（decision + decision_reason）

**結論だけでは不十分。必ず理由を付与する。**

Operational View フィールド:

| Field | 意味 |
|---|---|
| `decision` | 現在の運用結論（一文） |
| `decision_reason` | 人間向け理由（一文〜二文） |

#### 表示フォーマット

```text
現在判断:
{decision}

理由:
{decision_reason}
```

#### 例

```text
現在判断:
世界半導体株投資 維持

理由:
Growth Phase継続
```

```text
現在判断:
1570 エントリー待機

理由:
暴落反発フェイズ
```

```text
現在判断:
Recovery確認中

理由:
Growth復帰条件の確認中
```

#### decision 写像例（表示のみ）

| 状況（内部要約・非表示） | decision |
|---|---|
| Growth 維持 | 世界半導体株投資 維持 |
| EXIT_PENDING | Growth撤退・Swing移行中 |
| Swing・急落系候補 | 1570 エントリー待機 |
| Swing・半導体Swing候補 | 282A エントリー待機 |
| Swing・条件なし | CASH 待機 |
| 1570 保有 | 1570 保有・Risk監視 |
| 282A 保有 | 282A Swing監視 |
| Stop後再評価 | Freeze再評価待機 |
| Recovery | Recovery確認中 |

#### decision_reason 写像例（人間語のみ）

| 状況 | decision_reason 例 |
|---|---|
| Growth 継続 | Growth Phase継続 |
| Growth警戒で撤退準備 | Growth警戒によりSwingへ移行 |
| 急落環境 | 暴落反発フェイズ |
| 半導体Swing環境 | 半導体Swingフェイズ |
| Flat | 投資条件なし |
| 1570 Risk監視中 | 保有中Risk Stop監視 |
| Recovery | Growth復帰条件の確認中 |

**禁止:** `dd15_ma200` / `crash_15` / `semi_signal` / `Model B` 等の直接表示。

---

### 5.3 現在ポジション

```text
現在ポジション:
{display_name}
```

| held / 方針 | 表示 |
|---|---|
| 野村（Growth） | 世界半導体株投資 |
| 1570 | 1570 |
| 282A | 282A |
| Flat | CASH |

正式名称・種別は通常非表示（必要時のみ1行）。

---

### 5.4 資金移動フロー（候補＋発動条件）

単純な候補一覧ではなく、**何が起きたら次へ移るか**を示す。

#### 表示フォーマット

```text
現在:
世界半導体株投資

次候補:

1570:
暴落反発フェイズ

282A:
半導体Swingフェイズ

CASH:
投資条件なし

復帰:
世界半導体株投資
```

#### フィールド対応

| 表示 | View フィールド（予定） | 意味 |
|---|---|---|
| 現在 | `capital_flow.current` | いまの資金位置 |
| 次候補 + 発動条件 | `capital_flow.next_candidates[]` | 各候補と移動条件（人間語） |
| 復帰 | `capital_flow.return_to` | Growth 復帰先（固定: 世界半導体株投資） |

#### 次候補の発動条件（表示固定文言）

既存 Asset Selection 優先（1570 > 282A > CASH）と整合。**ロジック変更なし・表示文言のみ。**

| 次候補 | 発動条件（Discord表示） |
|---|---|
| 1570 | 暴落反発フェイズ |
| 282A | 半導体Swingフェイズ |
| CASH | 投資条件なし |

アクティブ候補の強調（任意）: 該当候補の行を `●`、他をそのまま、などでよい。

Swing 保有中の補足（任意1行）:

```text
保有中: 次の大規模移動は Exit / Freeze再評価後
復帰: 世界半導体株投資
```

---

### 5.5 市場環境

判断材料。目的は**価格確認ではなく、現在フェイズ判断の背景確認**。

対象:

- SOX  
- 日経レバ(1570)

#### 表示フォーマット（状態語を主とする）

```text
SOX:
状態:
上昇継続 / 警戒 / 調整

日経レバ:
状態:
上昇基調 / 調整 / 反発
```

#### 状態語彙（表示用・写像）

**SOX:**

| 表示状態 | 意図（実装時の写像方針・センサー名は非表示） |
|---|---|
| 上昇継続 | Growth 継続に整合する環境 |
| 警戒 | Growth 警戒・深い調整の背景 |
| 調整 | 調整局面 |

**日経レバ(1570):**

| 表示状態 | 意図 |
|---|---|
| 上昇基調 | レバリスクオン寄り |
| 調整 | 押し目・調整 |
| 反発 | 急落後の反発環境の背景 |

#### 数値表示

- **必須ではない**  
- 必要性を実装前に再確認する  
- 出す場合も補助1行まで（状態語が主、数値が従）  
- 損益・評価額は出さない  

---

### 5.6 Entry状態（Signal / Entry 分離）

条件成立と実際購入を**必ず分離**して表示する。

#### データソース（既存）

| 表示 | ソース | 備考 |
|---|---|---|
| Entry（購入日） | `entry_date` | ENTRY_FILLED 後のみ。未投入は「未投入」 |
| 対象Asset | `asset`（候補）/ `held_asset`（保有） | 表示名へ写像 |
| position 状態 | `position_state` | 人間語へ写像 |
| 保有日数 | `StepResult.time_exit.current_holding_days` | **entry_date 基準・営業日** |
| 最大保有 | `max_hold_business_days` / time_exit | 1570=20 / 282A=15 |
| Time Exit 状態 | `time_exit.time_exit_status` | MONITORING / TRIGGERED / N/A |
| Risk | `risk_control` | 1570のみ |
| Signal（条件成立日） | **SoTに無し** | Option A: 「—」または行省略 / Option B: 別CR |

#### 表示モード写像（Option A 既定）

| 内部状況 | Discord「状態」 | Signal行 | Entry行 |
|---|---|---|---|
| Growth / Recovery / Flat・条件なし | 待機 | — | — |
| Swing・条件成立・未投入（`ENTRY_READY`） | 投入待ち | —（日付未記録）※ | 未投入 |
| Swing・保有中（`POSITION_ACTIVE`） | 購入済み | — ※ | `entry_date` |
| Stop後 `REENTRY_WAIT` | Freeze再評価待機 | — | 前回Exit済 |

※ Option B 採用時のみ Signal: YYYY-MM-DD を必須表示。

#### ENTRY_READY（投入待ち）表示テンプレ

```text
■ Entry状態
Signal:
—

Entry:
未投入

状態:
投入待ち

対象:
1570

注意:
保有開始前（保有期間・Time Exit未起算）
```

Option B 時の Signal 行:

```text
Signal:
YYYY-MM-DD
```

#### ENTRY_FILLED（保有中）表示テンプレ

```text
■ Entry状態
Signal:
—（または Option B の成立日）

Entry:
YYYY-MM-DD

状態:
購入済み
```

#### SIGNAL_DETECTED について

依頼上の独立状態 `SIGNAL_DETECTED` は **Protocol PositionState に存在しない**。  
Option A: **ENTRY_READY（投入待ち）に統合**し、Discord に「条件検出」専用行を増やさない。  
Option B 後も、表示ラベルとして「条件検出」を使う場合は `ENTRY_READY` 当日の別名に留め、新Stateは作らない。

#### Entry遅延（未投入）

```text
状態: 投入待ち
Entry: 未投入
注意: 保有開始前
```

禁止:

- 未投入期間を「保有期間」にカウントしない  
- Time Exit 計算・表示に signal / 未投入経過を使わない  
- planned_entry_date / 予定購入日 / 推定購入日 / 未確定投入期限を出さない  

「経過: X日」は **signal_date 永続化（Option B）がある場合のみ**表示可。Option A では出さない。

---

### 5.7 保有期間 / Exit監視

保有中のみ本セクションを充実表示する。未投入時は `N/A` または「保有開始前」。

```text
■ 保有期間 / Exit監視
保有:
12 / 20営業日

状態:
Time Exit監視中

Exit監視:
Risk Stop
Time Exit

Risk:
−15%（1570のみ。282Aは N/A）
```

| Asset | max |
|---|---|
| 1570 | 20営業日 |
| 282A | 15営業日 |

規則:

- 分子 = `current_holding_days`（**entry_date** 起点の営業日）  
- 分母 = `max_hold_business_days`  
- signal_date を保有起算に使わない  
- カレンダー日数（旧 `reference.holding_days`）を主表示に使わない  

規則・閾値の変更は禁止（投影のみ）。

---

## 6. Asset 表示仕様

内部管理と表示を分離する。

### マスタ例

```text
asset_id:
NOMURA_SEMICONDUCTOR_FUND   … 表示マスタ上の論理キー（任意）

State SoT enum（変更禁止）:
NOMURA_WORLD_SEMI

display_name:
世界半導体株投資

正式名称:
野村世界業種別投資シリーズ
（世界半導体株投資）

種別:
投資信託
```

| asset_id / SoT enum | display_name | 正式名称 | 種別 |
|---|---|---|---|
| `NOMURA_WORLD_SEMI`（SoT） / `NOMURA_SEMICONDUCTOR_FUND`（表示キー可） | 世界半導体株投資 | 野村世界業種別投資シリーズ（世界半導体株投資） | 投資信託 |
| `NIKKEI_LEV_1570` | 1570 | 日経平均レバレッジ・インデックス上場投信（1570） | ETF |
| `SEMI_282A` | 282A | グローバルX 半導体 ETF（282A）※運用呼称 | ETF |
| `CASH` | CASH | 現金 | 現金 |

### Discord での使用

```text
世界半導体株投資
```

正式名称・種別は通常非表示。State SoT の enum 値は変更しない。

---

## 7. 表示対象外（明記）

以下は Discord 運用画面に**表示しない**。

| 非表示 | 理由 |
|---|---|
| 評価額 | 資産管理は証券画面の役割 |
| 損益 | 同上 |
| 保有口数 | 同上 |
| 証券口座管理情報 | 同上 |
| planned_entry_date | 予定情報（運用実績ではない） |
| 予定購入日 / 推定購入日 | 同上 |
| 未確定の投入期限 | 同上 |
| 未投入期間の「保有期間」表示 | Time Exit 起算と混同するため |

Discord の役割は資産管理ではなく、**特定口座プロトコルの判断確認**であるため。

---

## 8. Operational View DTO（表示専用・予定）

実装承認後の表示DTOイメージ（SoT意味変更なし / Option A）:

```text
phase                 … "Growth Phase" 等
decision              … 現在判断
decision_reason       … 理由（人間語）
entry_status_block:
  signal_date         … null（Option A）/ ISO date（Option B）
  entry_date          … null | ISO date（投資実績）
  status_label        … 待機 | 投入待ち | 購入済み | …
  target_asset        … 表示名
  note                … 例: 保有開始前
position_display      … 現在ポジション短名
hold_exit_monitor:
  current_holding_days
  max_hold_business_days
  time_exit_status    … N/A | MONITORING | TRIGGERED
  risk_summary        … 1570 Stop / N/A
capital_flow: …
market_context: …
```

現行 ViewModel 2.1 の `reference`（P/L等）は本画面の主表示から外す。  
保有日数は `time_exit`（営業日・entry_date基準）を用いる。

---

## 9. Discord Embed モック（承認用）

### 例 A — Growth 維持

```text
【特定口座】Growth Phase | 世界半導体株投資 維持 | 世界半導体株投資

■ 運用フェイズ
Growth Phase

■ Current Decision
判断:
世界半導体株投資 維持

理由:
Growth Phase継続

■ Entry状態
Signal:
—

Entry:
—

状態:
待機

■ 現在ポジション
世界半導体株投資

■ 保有期間 / Exit監視
N/A（Growth保有・Swing Time Exit対象外）

■ 資金移動フロー
現在:
世界半導体株投資

次候補:

1570:
暴落反発フェイズ

282A:
半導体Swingフェイズ

CASH:
投資条件なし

復帰:
世界半導体株投資

■ 市場環境
SOX:
状態:
上昇継続

日経レバ:
状態:
上昇基調
```

### 例 B — Swing・1570 投入待ち（ENTRY_READY / Option A）

```text
【特定口座】Swing Phase | 1570 エントリー待機 | CASH

■ 運用フェイズ
Swing Phase

■ Current Decision
判断:
1570 エントリー待機

理由:
暴落反発フェイズ

■ Entry状態
Signal:
—

Entry:
未投入

状態:
投入待ち

対象:
1570

注意:
保有開始前（保有期間・Time Exit未起算）

■ 現在ポジション
CASH

■ 保有期間 / Exit監視
N/A（保有開始前）

■ 資金移動フロー
現在:
CASH

次候補:

1570:
暴落反発フェイズ          ← アクティブ

282A:
半導体Swingフェイズ

CASH:
投資条件なし

復帰:
世界半導体株投資

■ 市場環境
SOX:
状態:
警戒

日経レバ:
状態:
反発
```

### 例 C — 1570 保有・Exit監視

```text
【特定口座】Swing Phase | 1570 保有・Risk監視 | 1570

■ 運用フェイズ
Swing Phase

■ Current Decision
判断:
1570 保有・Risk監視

理由:
保有中Exit監視

■ Entry状態
Signal:
—

Entry:
2024-03-05

状態:
購入済み

■ 現在ポジション
1570

■ 保有期間 / Exit監視
保有:
12 / 20営業日

状態:
Time Exit監視中

Exit監視:
Risk Stop
Time Exit

Risk:
−15% / 監視中

■ 資金移動フロー
現在:
1570

次候補:
（保有中）Exit / Freeze再評価後に再選定

復帰:
世界半導体株投資

■ 市場環境
SOX:
状態:
調整

日経レバ:
状態:
調整
```

---

## 10. 完了条件（PASS）

| # | Criterion |
|---|---|
| 1 | Entry条件成立（待機）と実際購入を区別できる |
| 2 | ENTRY_READY（投入待ち・未投入）がDiscordで理解できる |
| 3 | 保有日数が entry_date 基準で `X / XX営業日` 表示される |
| 4 | Time Exit / Risk Stop 監視状態が理解できる |
| 5 | 現在何を待っているフェイズか数秒で判断できる |
| 6 | Protocol / Detection / State / Asset Selection 変更なし |
| 7 | planned_entry_date 等の予定日を表示しない |
| 8 | Implementation Review Issue について Human 判断済み |

表示仕様ドキュメントとしての今回更新: **Draft反映完了**。  
コード実装: **未着手（承認＋ Option A/B 決定後）**。

---

## 11. 実装ゲート

```text
1. Human が §0 Issue で Option A / B / C を決定
2. 本 DRAFT を APPROVED に更新
3. その後にのみ View / Discord Adapter 実装（コード）
4. 表示テスト追加・既存 protocol テスト維持
5. Option B を選ぶ場合は別CRで signal_date 加算後に完全表示
```

**現時点: ドキュメント修正のみ。コード変更なし。Human判断待ち。**

---

## 12. Approval Checklist

- [ ] §0 Issue: Option A / B / C のいずれかを選択した  
- [ ] Signal / Entry 分離表示でよい  
- [ ] Option A なら Signal 日付は「—」、経過日は非表示でよい  
- [ ] 保有は `X / 20`（1570）・`X / 15`（282A）、entry_date 基準でよい  
- [ ] Embed 順（フェイズ→Decision→Entry状態→ポジション→保有/Exit→資金→市場）でよい  
- [ ] 予定購入日・投入期限は非表示でよい  
- [ ] 評価額・損益・口数は非表示でよい  
- [ ] コード実装は承認後のみでよい  

**Option selected:** A / B / C  
**Approval:** ________________  **Date:** ________________  
