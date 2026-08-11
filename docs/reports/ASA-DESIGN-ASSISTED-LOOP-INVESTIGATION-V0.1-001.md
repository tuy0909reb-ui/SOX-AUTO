# ASA Design Investigation — Assisted Loop（C）

**Record ID:** ASA-DESIGN-ASSISTED-LOOP-INVESTIGATION-V0.1-001  
**Title:** Assisted Loop — Design / Proposal Only  
**Document Type:** Design Investigation Report  
**Status:** **SUPERSEDED BY FREEZE** — 採択結果は `ASA-APPROVE-FREEZE-ASSISTED-LOOP-DESIGN-V0.1-001`  
**Date:** 2026-08-11  
**Authority:** HUMAN_ARCHITECT（Design Freezeへ移行済み）  
**Runtime:** ASA Minimum Runtime **v0.1.2**（Write Discipline COMPLETE）  
**Architecture:** ASA-ARCH-50.0 **FROZEN**  
**Baseline:** ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001（PRESERVED・今回未改訂）  
**Op Def:** ASA Runtime Operation Definition v0.1 APPROVED（PRESERVED・今回未改訂）  
**Operational Trial:** ACTIVE  

```text
Purpose = Assisted Loop の設計調査と最終推奨
≠ 実装
≠ Candidate / Adapter / Capture のコーディング
≠ Architecture / Baseline / Op Def / Hash / Storage / History / 既存Record 変更
≠ PFOS主系統化 / AI投資判断 / 自動売買
```

**Predecessor docs（参照・上書きしない）:**

- `ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001`（v0.1.1時点の自動記録調査）
- `ASA-PREDICTION-AUTO-RECORDING-ROADMAP-AFTER-P0-V0.1-001`
- `ASA-COMPLETE-WRITE-DISCIPLINE-SLICE-V0.1.2-001`

本報告は **Write Discipline完了後** の再評価である。

---

## Cursor最終推奨（先に読む）

```text
最初の入口 = Design Registration Assist（1入口のみ）
Confirm    = CommitAPIの直前（Commit内に埋め込まない）
Candidate  = 第1入口では「薄いDraft」で足りる。本格Storeは第2入口前
自動化上限 = 下書き生成・Evidence提案・メタ提案まで。Official確定はHuman
ドタバタ   = 結果だけでなく「方針を変えた判断点」を残す。全編集は残さない
投資方針   = Knowledge/Registration → Decision+Verification。PFOSは分析側
次依頼     = Assisted Loop Narrow Design Approval → その後の最小実装依頼
```

---

## 1. Repository investigation

### 1.1 ASA Minimum Runtime（現能力）

| 領域 | パス | 状態 |
|---|---|---|
| Models / Hash / Storage / History | `src/asa_minimum_runtime/{models,hash,storage,history}/` | 安定・意味変更禁止 |
| Templates | `templates/RecordTemplates.ts` | 4 type（Arch/Impl/Verif/Decision） |
| **RecordCommitAPI** | `commit/RecordCommitAPI.ts` | **v0.1.2 正規書込唯一経路** |
| Verify | `verify/VerifyService.ts` | hash + HISTORY_* findings |
| CLI | `cli/main.ts` | thin client → CommitAPI |
| Tests | `tests/asa_minimum_runtime/` | Write Discipline含む回帰緑 |

**重要変化（前回調査からの差分）:**  
書込経路は既に一本化済み。Assisted Loopが解くべき残問題は **Intake / Significance / Confirm** であり、Write pathではない。

### 1.2 FROZEN / 非接続層

| 領域 | 関係 |
|---|---|
| `src/runtime_execution`, `workflow`, `orchestration`, `contracts` | ARCH実行系。Minimum Runtimeと**非接続**。Assisted Loop入口にしない |
| `src/architecture_*`, `construction_*`, `extensions/asa_*` | FROZEN構造・契約。記録CLIではない |
| Architecture Ch.1–50 | 思想・境界の根拠。記録パイプライン実装場所ではない |

### 1.3 文書・運用資産

| 資産 | 役割 |
|---|---|
| `docs/baselines/ASA-*` | Knowledge（設計判断の本文SoTになりがち） |
| `docs/reports/ASA-REGISTER-*` | Registration（制約・証跡・Runtime ID紐付け） |
| `docs/specs/asa_runtime_operation_definition_v0_1.md` | いつRecordするかの運用規範 |
| `docs/specs/asa_runtime_operational_trial_v0_1.md` | Trial ACTIVE・観察枠 |
| `docs/reports/asa_runtime_operational_trial_observation_log_v0_1.md` | 観察ログ（Search等 deferred） |

### 1.4 Live Record状況（2026-08-11）

| 指標 | 値 |
|---|---|
| records | **32** |
| historyEvents | **22** |
| official | **22** |
| unofficial（orphan） | **10** |
| verify | FAIL（HASH_MISMATCH×10 + HISTORY_MISSING×10） |
| writePath | RecordCommitAPI |

**実Recordの支配的パターン:**

1. **Design Registration 対**（Decision + Verification）が大半  
2. Operational Trial seed（`a111…` → 正規 `b222…`）  
3. Runtime milestone（Completion / Op Def Approved）  
4. 最近例: Swing Asset 1570（Knowledge + Register + Runtime Decision/Verification + backtest evidence）

orphan 10件は主に旧「pending / 手書き投入」系。P0どおり **保持・Detectのみ**。Assisted Loopで昇格しない。

### 1.5 ASA外部の入口候補（絞り込み）

| 候補 | Assisted Loop入力として | 判定 |
|---|---|---|
| `docs/baselines` + `docs/reports` | **高い**（現行運用そのもの） | **第1入口** |
| Git | 変化検知の補助に有用。全commit自動Recordはノイズ大 | 第2入口以降の補助 |
| Cursor / Agent会話 | 要約→Draftは可能。生ログSoT化は禁止 | Confirm必須の補助 |
| Python / research / backtest reports | Verification Evidenceとして強い | 第2入口候補 |
| `portfolio/` | Fact/Hypothesis層。ASA主系統にしない | Adapter将来候補のみ |
| `auto-scribe-ai` / `docs/specs/auto_scribe_ai_*` | 捕捉思想の参照源。**別SoT復活禁止** | 仕様抽出のみ |
| Discord / FORTRESS ops | 運用画面。記録SoTではない | 初期対象外 |
| test/build全実行 | 失敗→修正・マイルストーン以外は低価値 | 初期対象外 |

---

## 2. Current Runtime capability

| 能力 | v0.1.2 |
|---|---|
| Official書込 | RecordCommitAPI（CLI/将来Adapter共通） |
| Official定義（運用） | Storage ∧ History ∧ Verify PASS（P0採択） |
| Unofficial Detect | HISTORY_MISSING / RECORD_FILE_MISSING / HASH_MISMATCH |
| Human Confirm | **なし**（意図的。Commit外） |
| Capture / Significance | **なし** |
| Candidate / Draft Store | **なし** |
| Search | **なし**（Trial deferred） |
| Evidence実在チェック | **なし**（文字列参照のみ） |

自動化レベル: **L1（正規Commit機械化）**。Intakeは依然 L0（人間起動）。

---

## 3. Activity definition

### 3.1 活動分類（記録価値）

| 活動クラス | 典型Record Type | 価値 | 自動下書き適性 |
|---|---|---|---|
| Architecture freeze / major design | Architecture | 高 | 中（文書起点） |
| Runtime / protocol 実装マイルストーン | Implementation | 高 | 中 |
| 検証・受入・制約確認 | Verification | 高（Op Def HIGH） | 高 |
| 人間の方針・採用判断 | Decision | 最高 | 中（Confirm必須） |
| Research / backtest 結論 | Verification（+ Decisionが要る場合） | 高 | 中〜高 |
| 投資方針変更 | Decision + related Verification | 最高 | 中 |
| 重要な失敗→修正 | Implementation / Verification | 高 | 中 |
| 通常会話・毎回緑テスト・autosave | — | 低 | **対象外** |

Op Def §5 と整合:

- 作る: major design / phase完了 / test・experiment・backtest結果 / strategic choice  
- 不要: routine / temporary / intermediate without future reference  

### 3.2 「作成のドタバタ劇」をどこまで残すか

実例（Swing 1570）:

```text
調査 → 比較 → ギャップ分析 → 仮説修正 → 方針決定
  ↓              ↓                ↓
report artifacts  gap報告     Knowledge + Register
                                      ↓
                         Runtime Decision + Verification
```

**残すべき粒度（推奨）:**

| 残す | 残さない |
|---|---|
| 最終採用判断（Decision） | 毎チャット発話 |
| 制約検証（Verification） | 毎ファイル保存 |
| 比較・ギャップの **Evidence参照** | 途中の捨て仮説すべて |
| **方針を変えた判断点**（例: 1579有利仮説の棄却） | 全テスト緑の繰り返し |
| 関連Baseline / Freeze接続 | scratch一時ファイル |

原則:

```text
過程の価値 = 「後から再現できる判断分岐」
過程のノイズ = 「作業の完全再現ログ」
```

完成結果のみでも、全編集ログでもない。  
**Milestone Judgment + Supporting Evidence** がASAの粒度。

---

## 4. Capture Source comparison

評価軸: 捕捉可能性 / 記録価値 / ノイズ / 実装コスト / 誤記録リスク / Human Confirm必要性  
（5=高, 1=低。Confirmは「必須度」）

| Source | 捕捉 | 価値 | ノイズ | コスト | 誤記録 | Confirm | 初期採用 |
|---|---|---|---|---|---|---|---|
| Design docs（baseline/register） | 5 | 5 | 2 | 2 | 2 | 必須 | **YES** |
| Explicit CLI / agent「登録して」 | 5 | 5 | 1 | 1 | 1 | 必須 | YES（既存） |
| Git milestone / tag / path差分 | 4 | 3 | 4 | 3 | 3 | 原則必須 | 後段 |
| Backtest/report filesystem | 4 | 4 | 3 | 3 | 2 | 原則必須 | 第2入口候補 |
| Cursor conversation summary | 3 | 3 | 4 | 3 | 4 | **必須** | 補助のみ |
| Python実行ログ全量 | 3 | 2 | 5 | 3 | 4 | 必須 | NO |
| portfolio DB/events | 2 | 3 | 3 | 4 | 3 | 必須 | NO（境界） |
| Auto-Scribe本番配線 | 2 | 3 | 4 | 5 | 4 | 必須 | NO（別SoT禁止） |
| test/build全PASS | 5 | 1 | 5 | 2 | 3 | — | NO |

**入口選定理由は「簡単さ」ではない。**  
実運用で既に価値が証明され、orphan主因クラスと直結し、投資執行と無関係な **Design Registration** を選ぶ。

---

## 5. Candidate necessity assessment

### 5.1 比較

| 形 | 概要 | 適性 |
|---|---|---|
| Activity→**Candidate**→Confirm→Commit | 可変下書き層・非ハッシュ | 複数ソース・差し戻し・非同期で強い |
| Activity→**Significance**→Confirm→Commit | フィルタ後すぐConfirm | 入口が狭く同期なら足りる |
| Source→**Draft**→Confirm→Commit | ファイル/JSON下書き | **第1入口に最適** |
| Activity→自動Commit→Verify | Confirmなし | **Decisionで禁止。初期全体で不採用** |

### 5.2 判断

**第1 Assisted Loopでは本格Candidate Storeは必須ではない。**

理由:

1. Write Disciplineで正式書込は既に安全  
2. 第1入口は人間が文書を見た直後の同期Confirmが現実的  
3. フルCandidate（Model/Lifecycle/Storage/History/Expiration/Dedup/Approval）は **過剰設計**  
4. ただし Confirm前の編集可能な下書きは必要 → **Draft（最小）**

**本格Candidateを導入するトリガー（第2入口前）:**

- 非同期捕捉（git watcher / CI）  
- 差し戻し・再編集が常態  
- 複数ソースの同一活動合流  
- 承認待ちキューが必要  

### 5.3 Candidateを導入する場合の最小セット（将来）

| 要素 | 初期Candidate | 後回し可 |
|---|---|---|
| Model（id, type提案, content, evidence[], status） | 要 | |
| Lifecycle（draft/ready/rejected/committed） | 要 | |
| Storage（records外・非ハッシュ） | 要 | |
| Dedup key | 要 | |
| Expiration | | 可 |
| Candidate History | | 可（Record Historyに混ぜない） |
| 複数承認者 | | 可（個人運用では不要） |

```text
Candidate ≠ Official
Candidate History ≠ Record History
```

---

## 6. Significance / Noise strategy

### 6.1 Significance Model（提案）

機械は **判定者ではなく提案者**。

```text
Score = ExplicitSignal × DomainWeight × Novelty × EvidenceRichness
```

| 因子 | 例（高） | 例（低） |
|---|---|---|
| ExplicitSignal | `ASA-REGISTER-*` 新規、Human「登録」 | 雑談 |
| DomainWeight | Decision/Architecture/投資方針 | フォーマッタのみ差分 |
| Novelty | 新Baseline ID / 方針変更 | 同一内容再生成 |
| EvidenceRichness | report path・制約表あり | 空content |

閾値運用（初期）:

| 帯 | 扱い |
|---|---|
| High | Draft生成 → **Confirm必須** |
| Mid | Draft候補一覧に出す（Confirmまで進まない） |
| Low | 無視（ログもOfficialにしない） |

### 6.2 記録すべき / しない

**すべき:** 重要意思決定、投資方針変更、検証結果、backtest結論、Architecture/Runtime重要変更、重要な失敗と修正、重要な比較結果（採用/棄却理由付き）

**しない:** 通常会話、毎回テスト成功、一時ファイル、取るに足らない編集、重複活動、秘密値の埋め込み

---

## 7. Human Confirmation boundary

### 7.1 位置（採用: A寄り + Draft）

```text
Activity / Source
    ↓
Significance（提案）
    ↓
Draft（薄いCandidate）
    ↓
Human Confirm（採否・編集）     ← ここに置く
    ↓
RecordCommitAPI
    ↓
Official Record → Verify
```

**CommitAPI内にConfirmを埋め込まない**（v0.1.2設計を維持）。

### 7.2 案比較

| 案 | 評価 |
|---|---|
| A Candidate→Confirm→Commit | 将来の標準形。第1入口はDraftで代替可 |
| B Significance→Confirm→Commit | Draftなしだと差し戻し編集が脆い |
| C 自動Commit→Verify | **不採用**（特にDecision） |

### 7.3 Decision Record

**無確認Official化は避ける。**  
Decision / Architecture 相当は Confirm **必須**。  
Verification も初期は必須（テンプレ固定+信頼蓄積後に緩和検討可）。  
hash/storage/history/verify実行自体は自動化してよい。

境界:

```text
ASA: 候補整理・Evidence提案・機械的整合
Human: 採否・意味・投資/設計判断の最終権威
```

---

## 8. Investment / PFOS boundary

```text
PFOS / portfolio / Human / research:
  Analysis → Judgement → Decision generation

ASA:
  Record → Evidence → Traceability → Verification
```

| 主題 | ASAへの記録価値 | 捕捉方法 |
|---|---|---|
| 投資方針検討 | Knowledge文書として高 | baseline起草（人間/Agent） |
| 比較・backtest | Verification Evidenceとして高 | report pathをEvidence提案 |
| 採用判断 | Decisionとして最高 | Registration → Confirm → Commit |
| 方針変更 | 新Decision + related | 旧Record不変、新ID |
| 売買執行 | ASA対象外（記録するなら別ドメイン・将来） | 初期禁止 |

**ASAが投資判断を生成する設計は禁止。**  
portfolioは将来Capture Sourceになり得るが **主系統化しない**。

---

## 9. Evidence automation

| Evidence種 | 自動提案 | 人間必須 |
|---|---|---|
| Git commit SHA | 可 | 意味説明は人間 |
| changed files（パス一覧） | 可 | 重要ファイル選定はConfirm |
| test/build結果サマリ | 可（パス/exit） | 合否解釈は人間 |
| script/version | 可 | |
| dataset / report path | 可 | |
| source document（baseline/register） | **第1入口で主** | |
| related Record ID | 部分可（同一登録対） | 関係意味は人間 |
| hash（Record自身） | Commit時自動 | |

原則: **参照を自動添付。評価・解釈はしない。**

---

## 10. Metadata automation

既存: `tags` / `relatedRecords` / `source`

| 項目 | 自動 | リスク |
|---|---|---|
| source | Adapter名を自動（例: `design-registration-assist`） | 低 |
| tags | path/typeから提案 | 中（誤分類） |
| relatedRecords | Register文書内のRuntime ID・対Recordから提案 | 中 |
| type | テンプレ推定 | 中（Confirmで確定） |

誤分類対策: **提案はConfirm画面で必ず編集可能。推測でCommitしない。**

---

## 11. Deduplication

| 重複種 | 推奨対処場所 | 備考 |
|---|---|---|
| 完全同一Draft | Draft生成時 | 同一source path + title |
| 同一登録の再実行 | Confirm時表示 | 既存Officialを見せる |
| 同一Commit二重押し | CommitAPI（既存: duplicate ID拒否） | Storage append-oriented |
| 内容類似 | Confirm時警告のみ | **自動破棄禁止** |
| 同一Decisionの再記録 | 人間判断 | 方針変更なら新Recordが正しい場合あり |

過剰自動Dedupは重要Recordを消す。  
**自動削除Dedupはしない。提示・警告まで。**

---

## 12. First Assisted Loop candidate

### 選定: Design Registration Assist（単一入口）

```text
docs/baselines/ASA-* 新規・更新
 + docs/reports/ASA-REGISTER-*
    ↓
Draft（Decision / Verification 提案）
    ↓
Human Confirm
    ↓
RecordCommitAPI × N
    ↓
Official + Verify
```

**なぜ最適か:**

1. Live Recordの大半が既にこのパターン  
2. orphanの主因クラス（手書き/pending登録）と直結 → Write Disciplineの次の自然な防御  
3. Evidenceパスが文書として明確  
4. 投資執行・PFOS・売買と無関係  
5. Trial観察と相性が良い（登録漏れ・二重登録が見える）

**複数入口の同時実装は不要。** 1入口でConfirm規則とDraft粒度を学習する。

置かない（初期）: git全量、test全PASS、conversation全量、portfolio、Auto-Scribe本番。

---

## 13. Auto-Scribe boundary

```text
Auto-Scribe（思想・旧仕様）:
  knowledge extraction / summarization / event capture rules
  → ASA Official SoT にしてはならない

ASA Minimum Runtime:
  Official Record / Hash / History / Verify
```

- Auto-Scribeを第二のSoTにしない  
- `auto_scribe_ai_*` は CAP-001等の **ノイズ原則の参照**に留める  
- 将来必要なら **Adapter（Draft生成器）** としてのみ接続し、CommitはRecordCommitAPI  

---

## 14. CLI boundary

CLIは廃止しない。

Assisted Loop後の役割:

| 役割 | 例 |
|---|---|
| Manual fallback | 入口が止まっても `asa record` で正規Commit可 |
| Inspection | `show` / `history` / `status` |
| Verification | `verify` |
| Recovery観察 | unofficial件数・findings確認（修復は別運用） |

```text
Assisted入口 = 主UX（限定領域）
CLI         = 正規の手動入口 + 監査ツール
CommitAPI   = 唯一の書込実体
```

---

## 15. Failure / Recovery

| 失敗 | Official化 | 扱い | Human |
|---|---|---|---|
| Capture失敗 | しない | 再試行可。Official不変 | 任意 |
| Draft生成失敗 | しない | ログ/再実行 | 任意 |
| Evidence取得失敗 | しない | Draftに欠落明示。Confirmで補完 | 要 |
| Duplicate Draft | しない | 警告 | Confirm |
| Commit duplicate ID | しない | 既存Storage規則で拒否 | 要（新ID） |
| Storage failure | しない | History未append | 要 |
| History failure | Unofficial残り得る | COMMIT_PARTIAL + HISTORY_MISSING Detect | 要（方針どおり削除しない） |
| Verify FAIL（新規） | Official未成立 | 内容修正は新Commit | 要 |
| Source unavailable | しない | Draft保留 | 要 |
| malformed input | しない | 拒否 | 要 |

既存orphan: Assisted Loopで触らない（削除/修復/昇格禁止）。

---

## 16. Operational Trial utilization

Trialは **実装許可ではなく観察枠**。

Assisted Loop設計への使い方（新機能前）:

| 観察 | 抽出できる要件 |
|---|---|
| 何を記録したか（type/title分布） | 第1入口=Design Registrationで正しいことの実証 |
| 何を忘れがちか | Register後のRuntime対漏れ、過程の棄却理由 |
| ノイズRecord | seed二重（a111/b222）→ Dedup警告の必要性 |
| orphan 10 | 正規経路外書込の実害 → Confirm+CommitAPI強制の根拠 |
| Observation log deferred | SearchはAssistedより後でよい（痛くなってから） |

**推奨:** Assisted Loop実装前に Observation Logへ「Write Discipline後のOfficial/Unofficial観測」を1回追記する運用（文書追記は別承認でも可）。本調査ではファイル変更しない。

Trial終了条件はまだ来ない。Narrow Assistedが安定観察できるまで **継続**。

---

## 17. Version / Governance impact（将来・今回変更なし）

| 項目 | 判断 | 時期 |
|---|---|---|
| Runtime **0.1.x加法** | Narrow Assisted（Draft+Confirm CLI）は可能 | 実装時 |
| Runtime **0.2** | 入口契約が実運用で固まった後 | Assisted安定後 |
| Op Def加法 | Official定義・Confirm必須規則の明文化 | 実装承認と前後可（別承認） |
| Baseline更新 | Write Discipline+Assistedを反映 | Acceptance後・別承認 |
| Trial | 継続観察。終了は拡大前ゲート | |

今回: **いずれも変更しない。**

---

## 18. Required implementation boundary

### 本当に分ける境界（3つで十分）

```text
1. Design（本報告）          … 承認ゲート
2. Implementation（Narrow）  … Draft+Confirm+Commit接続（1入口）
3. Observation               … TrialでConfirm疲れ・漏れ・ノイズを測る
```

これ以上の細Phase分割は不要。  
分離理由があるものだけ:

| 分離 | 理由 |
|---|---|
| Design ≠ Implementation | 入口選定とConfirm境界のHuman承認が先 |
| Implementation ≠ Expansion | 1入口学習前に多入口は確認疲れ |
| CommitAPI ≠ Confirm | 書込規律と承認権威の分離（済） |

**過剰分割しない:** Capture/Normalize/Classify/Dedup/Searchを別プロジェクト化しない。

### Narrow実装に含めてよいもの（将来・未実装）

- Design Registration → Draft生成  
- Confirm UX（CLI subcommandで可）  
- Confirm後のRecordCommitAPI呼び出し  
- Evidence/metadata **提案**  

### 含めないもの

- 本格Candidate Store  
- 複数Adapter  
- Auto-Scribe配線  
- Search/Export  
- orphan修復  
- PFOS接続  
- AI意思決定  

---

## 19. Future roadmap

```text
[Now] Write Discipline Live（v0.1.2）
        ↓
[C0] Assisted Loop Design Approved（本報告の承認）
        ↓
[C1] Narrow Implementation
     Design Registration Assist + Draft + Confirm → CommitAPI
        ↓
[C2] Observation Hardening（Trial）
     Confirm規則・Evidence提案・選択的orphan再登録判断
        ↓
[C3] Controlled Expansion
     第2入口（例: Verification report登録）± 最小Candidate Store
        ↓
[C4] Practical Assisted Recording
     活動把握→候補→Confirm→Official（全自動確定はしない）
```

---

## 20. Cursor自身の最終推奨

1. **第1入口は Design Registration Assist のみ。**  
2. **本格Candidateは後回し。薄いDraftで開始。**  
3. **Human Confirmは Commit直前。Decisionは無確認禁止。**  
4. **ドタバタは「方針変更点 + Evidence」を残し、作業全ログは残さない。**  
5. **投資方針は Knowledge/Register → Decision/Verification。ASAは生成しない。**  
6. **自動化上限は下書きと提案まで。Official確定はHuman。**  
7. **次の成果物は実装コードではなく、Narrow範囲の実装依頼（承認後）。**

---

# 最終明示（必須）

### A. 最初に何を実装すべきか

**Design Registration Assist（Narrow）:**  
baseline/register文書から Decision/Verification の Draftを作り、Human Confirm後に RecordCommitAPIへ流す最小ループ。

### B. 何はまだ実装しなくてよいか

本格Candidate Store、複数Capture Adapter、git/test全量捕捉、Auto-Scribe配線、Search/Export、orphan修復、PFOS接続、AI判断、自動売買、DB/Web UI。

### C. どこにHuman Confirmationを置くか

**Draft確定の直後・RecordCommitAPIの直前。**  
CommitAPI内部には置かない。Decision/Architectureは必須。

### D. 最初の自動記録入口は何か

**`docs/baselines/ASA-*` + `docs/reports/ASA-REGISTER-*` の設計登録アシスト（1入口）。**

### E. 投資方針・検討過程をどう記録するか

- 方針本文: Knowledge（baseline）  
- 登録制約: Registration report  
- 採用判断: Decision Record（Confirm必須）  
- 検証: Verification Record + report/backtest pathをEvidence  
- 分析生成: PFOS/Human側。ASAは保存と検証のみ  

### F. 作成過程のドタバタをどこまで記録するか

**残す:** 最終判断、棄却した有力代替とその理由、検証結果、根拠artifactへの参照、関連方針との接続。  
**残さない:** 全チャット、全編集、毎回の緑テスト、scratch。  
粒度 = Milestone Judgment + Evidence（完全作業ログではない）。

### G. 最終的にどこまで自動化するか

```text
自動化してよい:
  活動の検知提案、Draft生成、Evidence/metadata提案、
  Hash、Storage、History、Verify実行

自動化しない:
  Official確定、投資/設計の意味判断、orphanの勝手な修復、
  全活動の全量保存、Confirm省略のDecision
```

### H. 次にCursorへ出すべき依頼は何か

```text
# 推奨次依頼（実装ではない／または承認後の最小実装）

1) まず: 「Assisted Loop Narrow Design の承認」
   - 本報告 A–G の採否
   - Draft最小 vs Candidate Storeの採否確認

2) 承認後: 「Assisted Loop Narrow Implementation Request」
   - 入口: Design Registration Assist のみ
   - Draft + Confirm CLI（または同等）→ RecordCommitAPI
   - Candidate本格Store禁止、orphan非改変、Architecture非改変
   - Trial観察項目を定義
```

---

# End of Design Investigation

**STOP:** 調査・比較・提案まで。コード変更なし。既存Record変更なし。Architecture / Baseline / Op Def 変更なし。
