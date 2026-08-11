# ASA Assisted Loop Design — Approval / Freeze / Roadmap Confirmation

**Record ID:** ASA-APPROVE-FREEZE-ASSISTED-LOOP-DESIGN-V0.1-001  
**Title:** Assisted Loop Design v0.1 — 正式採択・Design Freeze・拡張ロードマップ確定  
**Document Type:** Design Approval + Design Freeze + Roadmap  
**Status:** **APPROVED / DESIGN-FROZEN**  
**Date:** 2026-08-11  
**Authority:** Cursor design determination for HUMAN_ARCHITECT confirmation  
**Source Investigation:** `docs/reports/ASA-DESIGN-ASSISTED-LOOP-INVESTIGATION-V0.1-001.md`  

```text
This document = Assisted Loop Design v0.1 Freeze
≠ Architecture Freeze change
≠ Baseline / Op Def / Runtime code change
≠ Implementation start
≠ orphan repair
```

---

## 0. Current State Confirmed

| Item | State |
|---|---|
| Architecture | ASA-ARCH-50.0 **FROZEN**（UNCHANGED） |
| Minimum Runtime | **v0.1.2** COMPLETE / Write Discipline COMPLETE |
| Baseline | ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001 ESTABLISHED（未改訂） |
| Op Def | v0.1 APPROVED（未改訂） |
| Operational Trial | ACTIVE |
| Live Official / Unofficial | 22 / 10 |
| writePath | RecordCommitAPI |
| Assisted Loop Investigation | COMPLETE |

---

## 1. A–G Re-evaluation（単純承認ではない）

| ID | 内容 | 判定 | 注記 |
|---|---|---|---|
| **A** | 最初の実装 = Design Registration Assist（Narrow） | **採用** | Live Recordの支配パターンと一致 |
| **B** | 本格Candidate / 複数Adapter / git・test全量 / Auto-Scribe / Search / orphan修復 / PFOS / AI判断は未実装 | **採用** | Narrow完了まで固定禁止リスト |
| **C** | Confirm = Draft確定後・CommitAPI直前 | **採用** | CommitAPI内埋込禁止を維持 |
| **D** | 入口 = `docs/baselines/ASA-*` + `docs/reports/ASA-REGISTER-*` | **採用** | 1入口のみ |
| **E** | 投資方針は Knowledge/Registration + Decision/Verification。判断生成はHuman/外部 | **採用** | PFOS主系統化しない |
| **F** | 重要検討・採用/棄却・検証・Evidence・方針変更・重要失敗は残す。全チャット/全編集/毎回緑は残さない | **採用** | Milestone Judgment + Evidence |
| **G** | 自動化上限 = Draft/Evidence提案/Metadata提案/Hash/Storage/History/Verify。Official確定=Human | **採用** | |

**修正して採用する点（Investigationからの微修正）:**

1. 「Investment Registration」を Design Registration と別Stageとして最初から分離しない。  
   現行の投資方針Recordは既に **同一入口（ASA-REGISTER）** で成立している。  
2. Narrow後の次拡張は「投資登録の別系統」ではなく、**Verification / Backtest Evidence Assist** を優先する（§4）。

---

## 2. Design要素の正式採否

| 対象 | 判定 | 理由 |
|---|---|---|
| Design Registration Assist | **採用** | 実運用・orphan主因クラス・Evidence明確性 |
| Draft（薄い下書き） | **採用** | Confirm前の編集面。非ハッシュ・Record外 |
| Evidence proposal | **採用** | パス提案まで。評価しない |
| Metadata proposal | **採用** | source/tags/related の提案。Confirmで確定 |
| Human Confirmation | **採用** | Official前の必須ゲート（特にDecision） |
| RecordCommitAPI | **採用**（既存） | 唯一の正規書込。再実装しない |
| Official Record定義 | **採用**（P0） | Storage ∧ History ∧ Verify PASS |
| CandidateをP2とする判断 | **採用** | NarrowではDraftで足りる。導入トリガーは§5 |
| DecisionのHuman Confirmation必須 | **採用** | ASAは意思決定しない |
| CLI維持 | **採用** | manual fallback / inspection / verify |
| orphan非改変 | **採用** | 削除・修復・昇格・History後付け禁止 |

**却下:** Activity→自動Commit→Verify（Confirmなし）  
**保留:** Confirmation緩和ルールの実装時期（方針は§6でDesign固定、実装はObservation後）

---

## 3. Design Freeze — Assisted Loop Design v0.1

### 3.1 Freeze宣言

```text
Assisted Loop Design v0.1 = DESIGN-FROZEN
Effective: 2026-08-11
Scope: future Assisted Loop implementation policy only
```

このFreezeは **Designレベルの方針固定** である。

| Freeze種別 | 今回 |
|---|---|
| Architecture Freeze（Ch.1–50） | **触らない** |
| Runtime Baselineファイル更新 | **しない**（別承認） |
| Op Defファイル更新 | **しない**（別承認） |
| Assisted Loop Design v0.1 | **固定する** |

### 3.2 Frozen Design Boundary

```text
Source（ASA baseline / register docs）
    ↓
Design Registration Assist
    ↓
Draft（mutable, non-hash, outside Official Storage）
    ↓
Evidence / Metadata proposal
    ↓
Human Confirmation          ← Official確定の権威
    ↓
RecordCommitAPI             ← 唯一の書込実体（既存）
    ↓
Hash → Storage → History
    ↓
Verify
    ↓
Official Record
```

**Frozen invariants:**

1. RecordCommitAPIが唯一のOfficial書込経路  
2. ConfirmはCommitAPIの外・直前  
3. DecisionはConfirm必須  
4. ASAは意思決定・投資判断・売買をしない  
5. Draft ≠ Official。Draftはハッシュしない  
6. Candidate本格StoreはP2（§5トリガーまで導入禁止）  
7. Narrowは入口1つのみ  
8. orphanはDetectのみ（非改変）  
9. Auto-Scribeを第二SoTにしない  
10. PFOSをASA主系統にしない  

### 3.3 Unfreeze条件（将来）

Design v0.1の変更が必要な場合のみ、**明示的な Design Amendment** で改訂する。  
実装都合や場当たり拡張では解凍しない。

---

## 4. Narrow Implementation Boundary

### 4.1 実装判断

```text
今回（本文書）: Design承認 + Design Freeze + Roadmap確定 までで停止可能
実装: 別途「Assisted Loop Narrow Implementation」明示依頼が必要
```

本Freezeは実装開始許可ではない。ただし実装範囲はここに固定済み。

### 4.2 Narrowで作るもの

| 要素 | 範囲 |
|---|---|
| 対象入口 | `docs/baselines/ASA-*` および `docs/reports/ASA-REGISTER-*` のみ |
| Assist | 文書から Decision / Verification Draftを生成（提案） |
| Draft | 一時的な編集可能下書き（ファイル or 同等の最小表現）。本格Store不要 |
| Evidence | 文書パス・関連reportパスの**提案** |
| Metadata | `source` / `tags` / `relatedRecords` の**提案** |
| Human Confirmation | Draft採否・編集・確定（CLIサブコマンド想定可） |
| Commit | 確定後のみ既存 `RecordCommitAPI` |
| Verify | 既存 Verify（history-aware）を利用 |
| CLI | 維持。Assist/ConfirmをCLIに加法。`asa record` はmanual fallback |

### 4.3 Narrowで作らないもの

- 本格Candidate Store（lifecycle/queue/expiration）  
- 第2入口以降のAdapter  
- Git / test / build 全量捕捉  
- Auto-Scribe配線  
- Search / Export / Snapshot  
- orphan修復・削除・昇格  
- PFOS / portfolio主系統接続  
- AI判断・自動Official確定  
- ConfirmのCommitAPI内埋込  
- Architecture / Baseline / Op Def / Hash / Storage / History意味変更  
- Database / Web UI  

### 4.4 受け入れの核

```text
Humanが Register文書を見て Confirm すると
  → Official Decision (+ Verification) が CommitAPI経由で成立
  → Verify PASS
  → CLI直書きと同じ正規経路
```

---

## 5. Post-Narrow Roadmap（最適順・Cursor提案）

前提のStage番号は使わない。  
**記録価値 × Evidence明確性 × ノイズ逆数 × Confirm負荷耐性 × 現行運用との連続性** で並べる。

### 推奨順序

```text
N0  Design Freeze（本文書）                    ← 今ここ
N1  Narrow: Design Registration Assist         ← 次の実装
N2  Verification / Backtest Evidence Assist
N3  Selective Development Milestone Assist
N4  Research / Experiment Campaign Assist（N2の拡張）
N5  Conversation Summary → Draft（高Confirm）
N6  External Adapter（portfolio等・読み取りのみ）
—   Search等のRetrieval能力は「痛くなってから」（捕捉Stageではない）
```

### なぜこの順か

| 順 | 対象 | 根拠 |
|---|---|---|
| **N1 Design Registration** | ASA baseline/register | Live 22 Officialの大半。投資方針も既にここ。入口重複を避ける |
| **N2 Verification/Backtest** | report path → Verification Draft | Evidence取得が強い。Swing比較等の実資産あり。ノイズはパス規則で制御可 |
| **N3 Dev Milestone** | phase完了・明示タグのみ | 全gitはノイズ大。マイルストーン限定なら実装証跡として価値 |
| **N4 Research Campaign** | N2の拡張（複数artifact束ね） | N2安定後。Dedup/Confirm負荷が増えるためCandidate検討点 |
| **N5 Cursor/document activity** | 会話要約→Draft | 誤記録リスク最高。Confirm必須のまま後段 |
| **N6 External Adapter** | portfolio等 | ASA主系統化禁止。読み取りEvidence源のみ |

### 明示的に繰り下げ / 統合

| 候補Stage | 扱い |
|---|---|
| Investment / Research Registration（別入口） | **N1に統合**。別Stageにしない |
| Development / Git全量 | **却下**。N3はselectiveのみ |
| その他外部Adapter早期導入 | **N6まで禁止** |

### 各拡張のゲート（場当たり防止）

次Stageに進む条件（すべて満たす）:

1. 前StageがTrial観察で「Confirm疲れ・重大漏れ・ノイズ増」が許容内  
2. 新入口のEvidence規則が文書化されている  
3. Decision Confirm必須が破られていない  
4. Candidateトリガー（§5）未達なら本格Storeを増やさない  
5. Design AmendmentなしにFrozen invariantsを破らない  

---

## 6. Candidate導入トリガー（P2明確条件）

本格Candidate Storeは、以下の **すべて** が同時に観測されたとき導入する。

```text
T1  有効なCapture入口が 2 以上
AND
T2  Draft/候補が同時に複数滞留する（Human Confirm待ちキューが発生）
AND
T3  同一活動の重複候補が繰り返し発生し、Confirm時警告だけでは運用コストが高い
AND
T4  Narrowの「単発Draftファイル」では差し戻し・再編集・期限管理が破綻する
```

**導入しない条件（いずれか）:**

- 入口が1つで同期Confirmが主  
- 候補滞留が稀  
- Dedupが「表示警告」で足りる  

曖昧な「将来必要かも」では導入しない。

導入時の最小セット: Model + lifecycle + non-hash storage + dedup key。  
Candidate History / 複数承認者 / 長期Expirationはさらに後。

---

## 7. Human Confirmation — 将来境界

### 7.1 Narrow〜当面（固定）

| Record種 | Confirm |
|---|---|
| Decision | **必須** |
| Architecture | **必須** |
| Verification | **必須** |
| Implementation | **必須** |

全Officialについて Human Confirmation を維持する。

### 7.2 将来の緩和（Design上の上限・実装はObservation後）

| 種別 | 緩和の可否 | 条件 |
|---|---|---|
| Decision / Architecture | **緩和しない** | 常に必須 |
| Verification | 条件付きで「一括承認」検討可 | テンプレ固定・Evidence機械添付・Trial安定 |
| Implementation | 条件付きで「一括承認」検討可 | マイルストーン定義が明確な場合のみ |
| Evidence-only補助Draft | Confirm簡略化可 | Official Decisionを代替しないこと |
| 自動Commit（Confirmなし） | **永久禁止（Decision/Architecture）** | ASAが意思決定を代替しない |

緩和しても **ASAが採否を決定したことにはならない。**  
一括承認は「人間が規則を事前承認した運用」であり、AI判断ではない。

---

## 8. 最終到達形（現実的）

目指す現実解（全活動の全自動Official化ではない）:

```text
External Activity / Documents / Selective Signals
              ↓
        Capture（入口ごと・狭い）
              ↓
        Significance（提案スコア）
              ↓
        Draft（必要なら Candidate Store）
              ↓
        Evidence / Metadata proposal
              ↓
        Human Confirmation（Decision/Architecture は常時）
              ↓
        RecordCommitAPI
              ↓
        Hash → Storage → History
              ↓
        Verify
              ↓
        Official Record
```

**到達しないもの:**

- 全チャット・全git・全テストの自動Official化  
- ConfirmなしのDecision  
- ASAによる投資判断生成  
- Auto-Scribe並列SoT  
- PFOSのASA主系統化  

---

## 9. Governance Impacts（今回実施しない・将来承認事項）

| 項目 | 今回 | 将来 |
|---|---|---|
| Architecture | UNCHANGED | 変更しない方針維持 |
| Runtime code | 変更なし | N1実装時に 0.1.x加法 |
| Baseline | 未改訂 | N1 Acceptance後に別承認で更新検討 |
| Op Def | 未改訂 | Confirm必須・Official定義の加法を別承認 |
| Trial | ACTIVE継続 | N1観察をログへ |

---

## 10. 次アクション（分割しない）

本文書で **Design承認 + Design Freeze + Roadmap** は完了する。  
追加の「Freeze依頼」は不要。

```text
次に必要な明示依頼（実装するなら）:

Assisted Loop Narrow Implementation Request
  - Design: Assisted Loop Design v0.1（本Freeze準拠）
  - 入口: Design Registration のみ
  - Draft + Confirm → RecordCommitAPI
  - 禁止: Candidate本格 / 複数入口 / orphan改変 / Architecture変更
```

実装しない場合: 本Freezeを保持し、Trial手動運用を継続。

---

## 11. Approval Checklist

```text
[x] A–G re-evaluated（単純承認ではない）
[x] Design elements adopted / rejected / deferred
[x] Assisted Loop Design v0.1 DESIGN-FROZEN
[x] Narrow implementation boundary defined
[x] Post-Narrow roadmap ordered（Cursor最適順）
[x] Candidate introduction triggers defined
[x] Human Confirmation future boundary defined
[x] Realistic end-state defined
[x] Architecture / Baseline / Op Def / code UNCHANGED this turn
```

---

# End

**Assisted Loop Design v0.1 — APPROVED / DESIGN-FROZEN**
