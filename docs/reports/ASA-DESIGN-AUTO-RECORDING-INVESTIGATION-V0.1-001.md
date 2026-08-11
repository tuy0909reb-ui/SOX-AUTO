# ASA Design Investigation — Auto-Recording Capability

**Record ID:** ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001  
**Title:** ASA自動記録機能 — Implementation Design Report（調査・設計・提案）  
**Document Type:** Design Investigation / Implementation Design Report  
**Status:** **PROPOSED**（実装未着手）  
**Date:** 2026-08-11  
**Authority:** HUMAN_ARCHITECT（承認待ち）  
**Runtime baseline:** ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001（PRESERVED）  
**Runtime package:** ASA Minimum Runtime v0.1.1  
**Architecture:** ASA-ARCH-1〜50 **FROZEN — 変更しない**  

```text
Purpose = 自動記録の設計調査と推奨案
≠ 実装開始
≠ Architecture / Baseline / Op Def / Hash / History / 既存Record の変更
≠ PFOS中心設計
≠ AI投資判断 / 自動売買 / DB / Web UI
```

Companion canvas: workspace canvases `asa-auto-recording-design.canvas.tsx`

---

## 0. Cursor 推奨結論（先に読む）

**ASAの自動記録は「決定の自動化」ではなく、「記録パイプラインの自動化」である。**

現在の v0.1.1 は「正しい SoT（Record + Hash + History + Verify）」まで到達している。  
足りないのは **活動を Record にするまでの入口（Intake）と、人間確認付き候補層（Candidate）** である。

```text
推奨コア構造（Cursor）:

Sources → Capture Adapters → Normalize/Classify/Significance/Dedup
        → Candidate Store（mutable, 非ハッシュ）
        → Human Confirm Gate
        → Record Commit API → Hash → JsonFileStorage → History
        → Verify（+ history整合）
```

- **唯一の Record SoT** = 既存 Minimum Runtime（変更せず拡張で接続）  
- **FROZEN Architecture / Auto Scribe 並列ストアを復活させない**  
- **Decision / Architecture は必ず人間確認**  
- **Hash / Storage / History append / post-commit Verify は完全自動化してよい**

---

## 1. Repository調査結果

### 1.1 構造（ASA関連）

| 領域 | パス | 役割 |
|---|---|---|
| Minimum Runtime | `src/asa_minimum_runtime/` | Record / Hash / Storage / History / Verify / Templates / CLI |
| Architecture packages | `src/architecture_*`, `construction_*`, `contracts`, `extension_*` | Ch.系 FROZEN 構造（記録CLIではない） |
| Pipeline | `src/workflow`, `orchestration`, `runtime_execution` | ARCH-20.8/20.9/21.x — Minimum Runtime と非接続 |
| Extensions | `src/extensions/asa_*` | Ch.36–41。契約上 automatic decision/execution 禁止 |
| Specs / Baselines / Reports | `docs/specs`, `docs/baselines`, `docs/reports` | 大量の ASA 文書資産 |
| Data | `data/asa_minimum_runtime/records`, `.../history` | 実 Record / jsonl |
| Tests | `tests/asa_minimum_runtime/` | Hash/Storage/History/Verify/CLI/v0.1.1 |
| Auto Scribe lineage | `docs/specs/auto_scribe_ai_*` | **別系統**の自動捕捉仕様（未配線） |

### 1.2 Architecture Ch.1–50（記録との関係）

- Freeze map: `docs/baselines/ASA-ARCH-21.3.md`（Ch.1–50 FROZEN）
- Completion: `docs/baselines/ASA-ARCH-50.0.md` — *System evaluates completion evidence. Human controls evolution.* Runtime Authority: **NONE**
- Ch.1–50 は **構造・契約・トレーサビリティ思想** を定義するが、Minimum Runtime の CLI Record 層ではない
- **別系統:** ASA-ARCH-2.0 / Auto Scribe（Event–Knowledge / auto capture）は知識倉庫として有用だが、**現行 RuntimeRecord SoT とは別モデル**

### 1.3 Minimum Runtime v0.1.1（現状）

| 項目 | 内容 |
|---|---|
| Marker | version `0.1.1`, contract `1.0`, sha256, json, jsonl |
| CLI | `status` / `record` / `show` / `history` / `verify` |
| Templates | architecture / implementation / verification / decision |
| Metadata | tags / relatedRecords / source（空なら hash 互換） |
| Write path | CLI 内で hash → save → history append |
| Automation | **人間起動のみ**（watcher / hook / adapter なし） |

### 1.4 実データ観測（2026-08-11）

| 指標 | 値 |
|---|---|
| Record ファイル | **30** |
| History 行 | **20** |
| History 未登録（orphan） | **10** |

Orphan 例: `c3a10001-…` 等。一部は `"hash": "pending-local-registration-…"` のような **非SHA**。  
→ CLI 外の手書き投入が既に発生し、`asa verify` 失敗対象になっている。  
**自動記録を論じる前に「Write path の単一化」が必須**であることを示す実証データ。

### 1.5 Operational Trial

- Trial ACTIVE: `docs/specs/asa_runtime_operational_trial_v0_1.md`
- Observation: Search / Export / Snapshot / Backup / Relationship viz は **deferred**
- Trial中の禁止: schema redesign / hash change / storage migration / Architecture modification / feature expansion without proposal

---

## 2. 現在のASA自動化レベル

| 段階 | 状態 |
|---|---|
| 活動検出 | なし |
| 候補生成 | なし |
| Evidence収集 | 手動文字列 |
| Metadata付与 | 手動 CLI flags |
| Related付与 | 手動 |
| Hash / Storage / History | **CLI成功時のみ自動** |
| Verify | 手動実行（inspection only） |
| Search / Discovery | なし |
| 外部連携 | 文書境界のみ（PFOS deferred） |

**自動化レベル判定: L0（手動記録）＋ L0.5（CLI内部の技術処理のみ自動）**

---

## 3. 現在の問題点

1. **記録コストが高い** — 人間が内容整理→CLI flags 組み立て→実行  
2. **入口がCLI一本** — Agent/CI/git から正規経路で書けない（結果、不正直書きが発生）  
3. **History と Record の結合が運用強制のみ** — 技術的に orphan 可能  
4. **Verify が狭い** — hash/存在のみ。history整合・evidence実在・テンプレ充足は見ない  
5. **Auto Scribe 知識が未統合** — 自動捕捉の思想はあるが Runtime と二重化リスク  
6. **Significance ポリシーが薄い** — Op Def §5 はあるが機械適用不能  
7. **History イベント種が `RECORD_CREATED` のみ** — 候補拒否・検証実行などの運用痕跡を残せない  
8. **Trial deferred 項目（Search等）が自動記録の効果測定を阻害**しうる  

---

## 4. 自動記録の目的

```text
目的:
  周囲で起きる重要な活動・検討・判断・検証・実装・変更・失敗・修正・成果を
  適切な粒度で Record 化し、Evidence / Hash / History / Verify で追跡可能にする。

非目的:
  ASAが意思決定する
  ASAが投資判断する
  ASAが自動売買する
  PFOSの代替になる
```

成功条件（Cursor）:

1. 重要イベントを **逃さない**（再現可能な粒度）  
2. ノイズで SoT を汚染しない  
3. 人間の最終権威を壊さない  
4. 既存 Record の検証可能性を落とさない  
5. 将来の Search / 外部 Adapter に耐える識別子とメタデータを持つ  

---

## 5. 自動記録対象の整理

| 対象 | 推奨 Type | 自動化度 | 備考 |
|---|---|---|---|
| Architecture freeze / baseline / major design | Architecture | 候補自動 + **必須確認** | |
| Phase完了・重要実装 | Implementation | 候補自動 + 確認（または低リスク承認） | git milestone / agent summary |
| テスト・試験・受入結果 | Verification | 候補自動（CI）+ 確認/一括承認 | Op Def HIGH |
| 戦略・方向の人間決定 | Decision | 候補下書き + **必須確認** | ASAは生成しない、記録する |
| 失敗・欠陥発見 | Implementation or Issueタグ | 候補自動 | 新規Typeは後段 |
| 修正・是正 | Implementation + related | 候補自動 + 確認 | 旧Recordは不変、新Record |
| Research / 検証キャンペーン結果 | Verification | 候補自動 | evidenceに報告パス |
| 運用Trial観察の重要項 | Implementation/Decision | 半自動 | observation log → candidate |

---

## 6. 自動記録対象外の整理

| ノイズ | 理由 |
|---|---|
| 毎チャット発話 / 毎キー入力 | 意味密度が低い・会話妨害（Auto Scribe CAP-001 思想） |
| 毎ファイル保存 / autosave | 再現価値なし |
| 毎テスト緑（変化なし） | 冗長。失敗→修正、またはマイルストーンのみ |
| 一時実験・捨てブランチ | Op Def §5「retained valueなし」 |
| 依存インストール・フォーマッタのみの差分 | 意義なし |
| 秘密情報・Webhook・token | Evidence禁止（参照のみ、値を書かない） |
| FORTRESS売買判断そのもの | ASAは記録層。判断は人間/他システム |

---

## 7. 推奨Architecture / Component構成

### 7.1 原則

1. **Minimum Runtime = 唯一の Record SoT**  
2. **Capture は Runtime 横の新パッケージ**（Architecture chapter にしない）  
3. **Candidate はハッシュ対象外**（確定前は書き換え可）  
4. **Commit 後は現行不変規則**（訂正は新Record）  
5. **Auto Scribe は仕様抽出のみ** — 別ストレージを実装しない  

### 7.2 コンポーネント案

| Component | 責務 |
|---|---|
| `CaptureAdapter` | git / CI / agent / docs / manual → IntakeEvent |
| `NormalizeService` | フィールド正規化、パス正規化、時刻 |
| `ClassifyService` | Type/template 提案 + confidence |
| `SignificancePolicy` | 記録すべきか判定（閾値・ルール） |
| `DedupService` | candidate fingerprint / 近傍重複抑制 |
| `EvidenceHarvester` | 変更ファイル、テストログ、報告パスの提案 |
| `CandidateStore` | drafts（別ディレクトリ） |
| `ConfirmGate` | 人間 accept/reject/edit |
| `RecordCommitAPI` | **既存** Hash/Storage/History を呼ぶ唯一書込 |
| `VerifyService`（拡張提案） | + history orphan / batch |
| `IndexProjector`（将来） | search用投影。SoTではない |

```text
禁止: Capture が直接 records/*.json を書く
禁止: Architecture_* を改変して記録機能を埋め込む
禁止: ASA が Decision を「採択」する
```

---

## 8. Record生成フロー

```text
[Activity]
   │
   ▼
Adapter emits IntakeEvent
   │
   ▼
Normalize → Classify → Significance?
   │ no → drop / noise log（SoT外）
   ▼ yes
Dedup → Evidence harvest → Candidate upsert
   │
   ▼
Human Confirm Gate
   │ reject → Candidate closed（理由付）
   ▼ accept（編集可）
RecordCommitAPI
   │
   ├─ HashService.hashPayload
   ├─ JsonFileStorage.save（create-only）
   └─ HistoryService.appendRecordCreated
   │
   ▼
VerifyService.verifyRecord(id)
```

CLI は CommitAPI の薄いラッパに再配置（挙動互換維持）。

---

## 9. Evidence取得フロー

```text
Candidate作成時:
  Adapter文脈 → 候補 evidence[] を提案
    - 変更ファイル相対パス
    - docs/reports|baselines 参照
    - テスト結果ファイル / CI run URL（秘密なし）
    - 関連 Record id

Human Confirm時:
  evidence の追加・削除・精査（品質責任は人間 = Op Def §4）

Commit後:
  ASA は evidence 品質を評価しない（現行方針維持）
  将来オプション: evidence パス存在チェック（警告のみ、自動修正なし）
```

---

## 10. Human-in-the-loop設計

| 処理 | 自動化 | 人間 |
|---|---|---|
| Hash / Storage / History append | **完全自動** | — |
| post-commit Verify | **完全自動** | FAIL時に通知を見る |
| Evidence 収穫提案 | 自動 | 採否 |
| Metadata 提案 | 自動 | 採否 |
| Implementation / Verification Candidate | ソフトキュー | 一括承認可 |
| Decision / Architecture Candidate | 下書きまで | **必須個別承認** |
| Correction / supersedes 宣言 | 提案 | **必須承認** |
| Significance  borderline | — | 必須 |

```text
境界の一文:
  「機械は候補と技術的確定処理まで。意味の採択は人間。」
```

---

## 11. 自動化レベルの段階設計

| Phase | 内容 | 成果 |
|---|---|---|
| **P0** | 現状観測の正式化（orphan問題）、Write bypass 禁止ポリシー案 | 運用安全 |
| **P1** | `RecordCommitAPI` を CLI から抽出（単一書込経路） | 自動記録の土台 |
| **P2** | Candidate モデル + `asa candidate list/show/accept/reject` | HITL |
| **P3** | Adapter: git milestone / CI verification / agent session summary | 実入口 |
| **P4** | EvidenceHarvester + Verification soft-auto | 実用密度 |
| **P5** | Verify 拡張（history整合）+ Search index 投影 | Trial deferred解消方向 |
| **P6+** | 外部 Adapter（必要なら PFOS も「多数の一つ」） | 接続 |

各 Phase は **plan → review → authorization → implement → verify**（Baseline拡張ポリシー準拠）。

---

## 12. 既存Runtimeとの接続方法

```text
推奨:
  src/asa_minimum_runtime/  … SoT（原則非破壊・API抽出は可）
  src/asa_auto_recording/   … Capture/Candidate（新パッケージ案）

接続点:
  asa_auto_recording → 公開 RecordCommitAPI / Hash / Storage / History / Verify
  CLI `asa record` → RecordCommitAPI（互換）
  テストは両パッケージを分離
```

**接続しないもの:** `architecture_*` FROZEN、`runtime_execution` の意思決定、PFOS 内部。

---

## 13. 既存仕様への影響

| 資産 | 影響 | 方針 |
|---|---|---|
| ARCH Ch.1–50 / Foundation | **なし** | 触らない |
| Hash アルゴリズム | **なし** | 維持 |
| Record contract 1.0 必須フィールド | **原則なし** | 追加は optional metadata / 別 Candidate 契約 |
| Baseline v0.1 | **PRESERVED** | 拡張は新plan+認可 |
| Op Def v0.1 | **提案として追記が必要** | Candidate / Confirm / Write path 単一化 |
| Operational Trial | 継続観察 + 新 Trial または拡張提案 | Trial禁止事項を破らない |
| 既存 Record | **不変** | orphan は新規Correction Recordで扱う案 |
| Auto Scribe specs | 参照のみ | 実装再起動しない |

### 変更が必要と判断した場合の提案（未実施）

1. **Op Def 加法セクション:** Candidate、Confirm Gate、禁止 bypass write  
2. **History イベント拡張（将来）:** `RECORD_CREATED` 維持 + 別ファイルで Candidate 履歴、または新 event 種（要認可・互換設計）  
3. **Verify 加法:** `HISTORY_ORPHAN` / `HASH_FORMAT_INVALID`（inspection only 維持）  

いずれも **実装前に Impact + Authorization** が必要。

---

## 14. 必要となる新規機能

1. RecordCommitAPI（単一書込）  
2. IntakeEvent 契約  
3. Candidate CRUD + 状態機械（draft/ready/accepted/rejected）  
4. Confirm CLI / 将来は薄いUIでも可（必須ではない）  
5. Adapters（git / CI / agent）  
6. Significance + Dedup policy engine  
7. EvidenceHarvester  
8. Verify 整合チェック（提案）  
9. （将来）Search projector  

---

## 15. 必要となる新規ファイル / ディレクトリ案

```text
docs/specs/asa_auto_recording_v0_1_design.md          # 本調査の正式仕様化（次工程）
docs/specs/asa_auto_recording_v0_1_implementation_plan.md
docs/reports/ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001.md  # 本書類

src/asa_auto_recording/
  models/IntakeEvent.ts
  models/Candidate.ts
  policy/SignificancePolicy.ts
  policy/DedupService.ts
  adapters/{git,ci,agent,manual}.ts
  harvest/EvidenceHarvester.ts
  store/CandidateStore.ts
  gate/ConfirmGate.ts
  commit/RecordCommitBridge.ts   # → asa_minimum_runtime
  cli/...

data/asa_auto_recording/
  candidates/*.json              # mutable drafts（SoT外）
  noise_log.jsonl                # optional, 非SoT

tests/asa_auto_recording/
```

既存 `data/asa_minimum_runtime/` の意味は変えない。

---

## 16. Test / Verification方針

| 層 | 検証 |
|---|---|
| Unit | Dedup / Significance / Classify confidence |
| Contract | Candidate → Commit が必ず Hash+History を通る |
| Negative | CandidateStore から records/ 直書き不可 |
| Compat | 既存 Record の `asa verify` 継続 PASS（正当なもの） |
| Integration | Adapter fixture → candidate → accept → verify |
| Regression | `tests/asa_minimum_runtime/*` 全通 |
| Ops | orphan 検出テスト（現状FAILを可視化） |

Verify は引き続き **doesNotDecide / inspection only**。

---

## 17. Operational Trialとの関係

- 現行 Trial は **手動記録の使用性観測**が主目的  
- 自動記録は Trial の「feature expansion禁止」に抵触しうる → **別 Extension Proposal / 新 Trial フェーズ**として切り出す  
- Observation log の deferred（Search等）は自動記録 Phase 5 と整合  
- Trial中に実装しない場合でも、**本 Design Report を Observation「missing capability」に追記候補**として扱える  

---

## 18. Cursor自身の推奨案（A–J 詳細）

### A. 最大のボトルネック

**Intake→Candidate→Confirm の不在。**  
技術的ボトルネックは Hash ではない。人間が毎回「記録文章とCLI」を組み立てねばならない点と、正規経路以外の書込が許されてしまっている点。

### B. 再利用と不足

**再利用可:** RuntimeRecord、Templates、Metadata、Hash、create-only Storage、append History、Verify inspection、Op Def の「記録し決定しない」原則。  

**不足:** Candidate、Adapter、Commit API 公開、Significance/Dedup、history整合 Verify、検索投影。

### C. 推奨構成

Runtime横の Capture パッケージ + 単一 CommitAPI。Architecture に埋め込まない。Auto Scribe を第二 SoT にしない。

### D. 入口

**すべての入口は Candidate。**  
git / CI / agent / docs / manual は Adapter。Record ファイルへの直接書込は禁止（ポリシー＋将来は技術的ガード）。

### E. 人間確認境界

技術処理は自動。意味の採択（特に Decision/Architecture）は人間。Verification/Implementation はキュー承認で効率化。

### F. ノイズ

Significance policy + dedup + 「マイルストーン単位」。チャット全量記録はしない。

### G. Record Type

現行4種で運用開始可能。Issue/Correction は **まず template + tags + relatedRecords**。Candidate は Type ではない。型追加は運用データで必要性が出てから。

### H. Hash / History / Verify 耐性

- Hash: **耐える**（変更不要）  
- Storage: 規模は当面耐える。同時書込は CommitAPI で直列化検討  
- History: 自動記録の候補ライフサイクルには **不足**（別 Candidate 履歴推奨）  
- Verify: orphan/形式不正の検出が必要（加法提案）

### I. Search / 外部連携で今考えること

- 安定 UUID、tags/source/related を Candidate 段階から埋める  
- evidence は参照文字列（中身を埋め込まない）  
- IntakeEvent に `adapter` / `externalRef` / `fingerprint`  
- 外部システムは Adapter 経由のみ。ASA は決定権限を受け取らない  

### J. 既存資産への影響

Additive extension。Baseline PRESERVED。Op Def は加法更新が必要（要認可）。ARCH 不変。既存 Record 不変。Trial とは提案分離。

---

## 19. 推奨する次工程

1. Human Architect が本 Design Report をレビュー  
2. Observation log に「Auto-recording capability needed」を記録（任意）  
3. **P0:** orphan / bypass 問題の扱い方針決定（修正Record vs 隔離）  
4. **正式仕様化:** `asa_auto_recording_v0_1_design.md` + implementation plan  
5. Authorization 後に **P1 RecordCommitAPI** のみ実装（最小の次コード）  
6. 続けて P2 Candidate + Confirm  

**最初の実装PRは「自動生成」ではなく「単一書込API + 候補層」に限定すべき。**

---

## 20. 実装前に決めるべき事項

| # | 決定事項 | 選択肢例 |
|---|---|---|
| 1 | Candidate の保管場所 | `data/asa_auto_recording/candidates` |
| 2 | Decision/Architecture の必須確認を崩さないこと | 必須で固定推奨 |
| 3 | Verification soft-auto の承認単位 | 個別 / 日次バッチ |
| 4 | orphan 10件の扱い | 新Correction Record / quarantine メモ |
| 5 | History 拡張 vs Candidate別履歴 | Cursor推奨: 当面 Candidate別 |
| 6 | Agentセッション記録の粒度 | セッション終了サマリのみ |
| 7 | git Adapter の発火条件 | tag / release / `ASA-RECORD` trailer |
| 8 | Op Def 更新タイミング | 実装P1前に加法承認 |
| 9 | Trial との関係 | 新 Trial / Extension Proposal |
| 10 | Auto Scribe 仕様の扱い | 知識抽出のみ（再実装しない） |
| 11 | 秘密情報の Evidence 禁止リスト | webhook/token/.env |
| 12 | 最初の Adapter 優先順位 | CI verify → git milestone → agent |

---

## Appendix A — 主要参照パス

- `docs/baselines/ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001.md`
- `docs/reports/ASA-COMPLETE-MINIMUM-RUNTIME-V0.1.1-001.md`
- `docs/specs/asa_runtime_operation_definition_v0_1.md`
- `docs/specs/asa_runtime_operational_trial_v0_1.md`
- `docs/reports/asa_runtime_operational_trial_observation_log_v0_1.md`
- `src/asa_minimum_runtime/**`
- `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md`（知識のみ）
- `docs/baselines/ASA-ARCH-50.0.md`

---

## Appendix B — 本調査の境界遵守

| 禁止事項 | 本調査 |
|---|---|
| Architecture変更 | 未実施 |
| Runtime実装 | 未実施 |
| Baseline変更 | 未実施 |
| Op Def変更 | 未実施（提案のみ） |
| 既存Record変更 | 未実施 |
| Hash/History仕様変更 | 未実施（拡張提案のみ） |
| コード変更 | 未実施（本Report文書の追加のみ） |

---

# End of Design Investigation Report
