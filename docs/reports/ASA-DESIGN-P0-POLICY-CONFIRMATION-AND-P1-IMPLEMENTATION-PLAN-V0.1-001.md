# ASA Design — P0 Policy Confirmation & P1 Implementation Plan

**Record ID:** ASA-DESIGN-P0-POLICY-CONFIRMATION-AND-P1-IMPLEMENTATION-PLAN-V0.1-001  
**Title:** P0方針確定（Official/orphan/bypass）および P1 Implementation Plan  
**Document Type:** Design Confirmation + Implementation Plan（設計のみ）  
**Status:** **PROPOSED FOR ARCHITECT APPROVAL**（コード未変更・既存仕様未変更）  
**Date:** 2026-08-11  
**Authority:** HUMAN_ARCHITECT（承認待ち）  
**Parents:**  
- ASA-DESIGN-P0-ORPHAN-BYPASS-POLICY-V0.1-001  
- ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001  
**Runtime:** ASA Minimum Runtime v0.1.1  
**Baseline:** ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001 — **PRESERVED（本作業で変更しない）**  
**Op Def:** ASA Runtime Operation Definition v0.1 — **PRESERVED（変更提案のみ）**  
**Architecture:** ASA-ARCH-50.0 FROZEN — **変更しない**

```text
Purpose =
  1) P0方針の最終確認・確定提案
  2) P1 Implementation Plan の作成
≠ P0実装
≠ P1コード変更
≠ Architecture / Baseline / Op Def / Hash / Storage / History / 既存Record の変更
```

Companion canvas: `asa-p0-p1-policy-plan.canvas.tsx`

---

## 0. Cursor最終推奨（先に読む）

### 0.1 P0再調査推奨の採否

**判定: P0再調査時の推奨方針を、実質そのまま採用する。**

再確認（2026-08-11 再計測・ソース再読）の結果、推奨を覆す反証は見つからなかった。  
修正は「方針の否定」ではなく、**運用上の明確化（Clarify）** に限定する。

| 論点 | 最終判断 |
|---|---|
| Official = Storage ∧ History ∧ Verify PASS | **採用** |
| orphan = Unofficial | **採用** |
| orphan削除禁止 | **採用** |
| orphanその場修復禁止 | **採用** |
| CLI維持 | **採用** |
| Candidate = P2 | **採用** |
| Bypass = Detect中心 | **採用** |
| RecordCommitAPI = P1主対象 | **採用（再評価後も維持）** |

### 0.2 Clarify（方針修正ではなく明確化）

1. **Verify PASSの意味（段階）**  
   - **規範定義（今すぐ運用採用）:** Officialは三条件。  
   - **現行Verify実装:** hash + 存在のみ（History未検査）。  
   - **機械的完全検査:** P1で `HISTORY_MISSING` 等を加法し、Official判定を機械化する。  
   - したがって「定義は今確定 / 機械検査の完成はP1」と分離する。

2. **quarantine**  
   - P0で「可能」と認めるが、**P1必須実装にはしない**。  
   - 当面は「Unofficial認定 + 削除禁止 + 必要なら新ID再登録」で十分。

3. **verifyAllの解釈**  
   - 現状の恒久FAILは「システムの破綻」ではなく、**Unofficial混在の正しい症状**として扱う。  
   - P1で inventory findings と official-fleet health を区別可能にする（設計提案）。

4. **Knowledge文書が指す Runtime ID**  
   - Growth/PROTO100等の Knowledge が `pending-*` orphan ID を Artifact表に載せている。  
   - これは **文書上のRuntime証跡がUnofficial** であることを意味する。  
   - P0でファイルを消さず、必要なら後続で **新ID Official再登録**（本Planの範囲外の運用作業）。

---

## 1. P0再確認結果

### 1.1 再計測スナップショット（2026-08-11）

| 指標 | P0再調査時 | 本確認時 | 差分 |
|---|---:|---:|---|
| Storage records | 30 | **32** | +2（正規CLIで作成されたOfficial） |
| History `RECORD_CREATED` | 20 | **22** | +2 |
| orphan（Storageのみ） | 10 | **10** | 不変 |
| History欠ファイル | 0 | **0** | 不変 |
| orphan Verify | 10×HASH_MISMATCH | **10×HASH_MISMATCH** | 不変 |

orphan内訳（不変）:

| Class | 件数 | 例 |
|---|---:|---|
| A pending hash | 8 | `pending-local-registration-…` / `pending-local-verification-…` |
| B SHA形式だが不一致 | 2 | `0f7f8fbc-…`, `bf1e459f-…` |

### 1.2 実装再確認（変更なしの事実）

| 層 | 事実 |
|---|---|
| CLI `asa record` | hash → `storage.save(wx)` → `history.appendRecordCreated` を同一コマンド内で実行 |
| Storage | ファイルSoT。History非参照 |
| History | append-only。Record存在非検証 |
| Verify | 存在 + hash再計算のみ。History非参照 |
| Templates/Metadata | 生成支援。正式性定義には非関与 |

### 1.3 再確認で変わらなかった結論

- 問題の中心は「自動生成不足」ではなく **正式性定義の欠如 + bypass容易性**  
- orphanは空ではなく、設計登録意図の痕跡を持つ  
- ファイルSoTである以上、直書きの完全防止は不可能  
- Candidateは正式性問題を解かない  

### 1.4 再確認で追加された観察

- 正規CLI経路は **Officialを増やせる**（今回 +2）  
- 一方、既存 Knowledge が参照する一部 Runtime ID は依然 orphan（Unofficial）  
- よって「文書登録済み ≠ Official Runtime Record」を明示する必要がある  

---

## 2. P0-1〜12 最終判断

| # | 決定事項 | 最終判断 | 理由（要約） |
|---|---|---|---|
| P0-1 | Official定義 | **Storage ∧ History ∧ Verify PASS** | Planのcreate組と整合。単条件はbypass/偽正式を許す |
| P0-2 | Storageのみ | **Unofficial** | ファイル存在≠正式 |
| P0-3 | orphan削除 | **禁止** | 証跡・説明可能性の喪失 |
| P0-4 | History後付け昇格 | **禁止** | 偽の正式性。特にpending/mismatch |
| P0-5 | その場再hash修復 | **禁止** | immutability曖昧化。誰が直したかHistoryに残らない |
| P0-6 | orphan処置 | **保持 + Unofficial認定**。必要内容は **新ID正規再登録**。quarantineは将来オプション | 削除/修復/昇格より安全 |
| P0-7 | 正式書込経路 | **hash+storage+history を組む経路のみ** | CLIはその一形態 |
| P0-8 | CandidateをP0必須に | **しない（P2）** | 正式性問題を解かない。自動記録用 |
| P0-9 | CLI | **維持** | 人間入口。廃止すると運用が退行 |
| P0-10 | bypass | **Detect中心** | 完全防止不可。Detect+定義で「正式にならない」を保証 |
| P0-11 | Op Def加法 | **要（提案のみ・本作業では未変更）** | 定義を運用文書へ反映するため |
| P0-12 | 既存History付きRecord | **不変のままOfficial候補/正式** | 改変しない |

**P0完了条件（提案）:**  
Human Architectが上記を採否承認すること。コード変更は不要。

---

## 3. Official / Unofficial Record定義（確定提案）

### 3.1 Official Record（正式Record）

```text
Official Record ⇔
  (1) data/asa_minimum_runtime/records/<id>.json が存在する
  ∧ (2) history.jsonl に RECORD_CREATED{id, hash, at} が存在する
  ∧ (3) 格納hashが Canonical SHA-256 として Verify PASS
```

補足:

- CLI経由は **十分条件の典型**であり、必要条件ではない（同じ組成のAPIでも可）。  
- 「人間がそう呼ぶ」「Knowledgeに書いてある」だけではOfficialにならない。  
- Historyのhashとファイルhashの一致も、完全なOfficial検査では必要（P1で検出）。

### 3.2 Unofficial Record / Artifact

```text
Unofficial =
  Storageに存在するが Official条件を満たさないもの
```

典型:

- orphan（Historyなし）  
- HASH_MISMATCH  
- placeholder (`pending-*`) hash  
- （将来）Historyはあるがhash不一致  

### 3.3 破損状態（現状0件だが定義する）

```text
History-only =
  HistoryにRECORD_CREATEDがあるが records/<id>.json が無い
```

→ Officialではない。異常。P1で `RECORD_FILE_MISSING` として検出。

### 3.4 用語の使い分け

| 用語 | 意味 |
|---|---|
| Storage artifact | `records/*.json` ファイル |
| History event | `history.jsonl` 行 |
| Official Record | 三条件を満たすもの |
| Unofficial artifact | Storage上の非正式物（orphan等） |

---

## 4. orphan処理方針（確定提案）

### 4.1 現状orphan（10件）

| 禁止 | 許可 |
|---|---|
| 削除 | Unofficialとして保持・一覧化 |
| History後付け昇格 | 新IDで正規Commit（内容が必要な場合） |
| その場hash書換 | evidence/relatedで旧パスを参照 |
| 「Verify PASS扱いにする」特別ルール | （将来）認可付きquarantine |

### 4.2 なぜ削除禁止か

1. 設計登録意図の痕跡が消える  
2. 「なぜverifyAllがFAILだったか」が後から説明不能  
3. Knowledge Artifact表との突合が不能になる  
4. 問題の再現研究ができなくなる  

### 4.3 なぜその場修復禁止か

1. RuntimeRecordは immutable 前提（訂正は新Record）  
2. 修復は「いつ・誰が・なぜ」をHistoryに残さない  
3. Class B（SHA風mismatch）を「直せば正式」にするのは改ざん検知を弱める  
4. pending hashを正しいhashに書き換えてHistory追記すると、**bypassを後から正当化する手順**になる  

### 4.4 正規Recordへの再登録方法

```text
1) 旧Unofficialの内容・Knowledge/Registrationを読む（Read-only）
2) 正規経路（現行CLI / 将来CommitAPI）で新IDを発行してCommit
3) evidence / relatedRecords / source に旧IDまたは旧ファイルパスを残す
4) 旧ファイルは削除しない（必要なら後続でquarantine）
```

再登録は **自動昇格ではない**。人間判断で「Runtime Officialが必要か」を決める。

---

## 5. bypass検出方針（確定提案）

### 5.1 前提

File StorageをSoTとする以上、OS/エディタによる直書きを技術的に完全防止することは困難。

### 5.2 戦略

```text
Prefer（単一Commit組成）
+ Define（Official三条件）
+ Detect（Verify整合）
+ Contain（Unofficialを正式扱いにしない）
```

Prevention単独（権限のみ）に賭けない。

### 5.3 Detect対象（P1設計）

| Finding | 意味 |
|---|---|
| `HASH_MISMATCH` | 現行どおり。内容とhash不一致 |
| `HISTORY_MISSING` | Storageにあるが HistoryにRECORD_CREATEDがない（orphan） |
| `RECORD_FILE_MISSING` | Historyにあるがファイルがない |
| `HISTORY_HASH_MISMATCH` | History記載hash ≠ ファイルhash（提案） |
| `RECORD_MISSING` / `RECORD_LOAD_FAILED` | 現行どおり |

自動修復はしない。inspection-only / doesNotDecide を維持。

---

## 6. RecordCommitAPIの必要性評価（再評価）

### 6.1 問い

P1第一候補として妥当か？ 決め打ちせず再評価する。

### 6.2 評価

| 観点 | 評価 |
|---|---|
| P0問題（正式性）への寄与 | **高** — 書込組成を単一化し、CLI以外の入口でも同じ規律を強制できる |
| 自動記録のためだけか | **否** — 主目的は「正式Recordへの書込規律の単一化」 |
| 既存資産再利用 | **高** — CLI中の3手を抽出するだけ。Hash/Storage/History意味不変 |
| Candidateなしで成立するか | **Yes** |
| 代替（Verifyのみ） | Detectは進むが、書込単一化が進まずP2自動記録で再発 |
| 代替（CLIのみ強化） | 人間入口は守れるが、プログラム入口がsubprocess依存になる |

### 6.3 結論

**RecordCommitAPIをP1の主実装対象として採用する。**  
理由は自動生成のためではなく、**正式書込経路の単一化**のため。

同時に **Verify History整合** をP1に含め、Detectを完成させる。

---

## 7. CandidateのP2化判断

| 問い | 判断 |
|---|---|
| P0必須か | **No** |
| P1必須か | **No** |
| いつ必要か | 自動記録が「人間が毎回CLIしない」段階（P2+） |
| Recordとの境界 | Candidate=可変下書き / Record=不変・hash付き |
| History汚染 | CandidateをRecord Historyへ混ぜない |

**採用: CandidateはP2以降。**

---

## 8. 既存Runtimeへの影響（実装前評価）

| 資産 | P0（本確定） | P1実装時（提案） |
|---|---|---|
| Hash仕様 | 影響なし | **変更しない**（呼ぶだけ） |
| Storage仕様 | 影響なし | **変更しない**（`save`再利用） |
| History仕様 | 影響なし | **変更しない**（`append`再利用） |
| Verify | 影響なし | **加法**（finding追加）。自動修復なし |
| CLI | 影響なし | CommitAPIの薄いクライアントへリファクタ |
| Templates / Metadata | 影響なし | Commit入力として通過。意味変更なし |
| 既存Official（History付き） | 不変 | 不変 |
| 既存orphan | 不変（削除/修復なし） | 検出が明確化されるのみ |
| Minimum Runtime package | 文書上の方針追加 | 加法コンポーネント |

---

## 9. 既存仕様への影響

| 資産 | 変更要否 | 扱い |
|---|---|---|
| Architecture Ch.1〜50 | **不要** | 触らない |
| ASA Foundation | **不要** | 触らない |
| `src/runtime_execution` | **不要** | 触らない |
| ASA Minimum Runtime v0.1.1（現行コード） | P0不要 / P1で加法 | 本作業では未実装 |
| Record Contract | **不要**（意味不変） | 新フィールド追加しない方針 |
| Baseline | **変更しない** | 拡張が必要なら別認可・新plan |
| Operation Definition | **変更提案あり・未実施** | Official定義の加法リビジョンを承認事項に |
| Operational Trial | 観察追記が望ましい | 実装拡大は別認可 |
| Existing Records / History | **変更しない** | — |
| FROZEN artifacts | **変更しない** | — |

### Op Def 加法提案（実装せず記録）

| 項目 | 内容 |
|---|---|
| 対象 | `docs/specs/asa_runtime_operation_definition_v0_1.md` の新リビジョン（別承認） |
| 理由 | Official/Unofficial/orphan/bypassが未記載で運用が壊れている |
| 内容 | 本ドキュメント§3–5を規範として転記 |
| 本作業 | **ファイル変更しない** |

---

## 10. P1 Architecture / Component設計

### 10.1 目標構造

```text
Human CLI  ──┐
             ├──→ RecordCommitAPI ──→ HashService
Future Auto ─┘         │              JsonFileStorage.save
   (P2 Adapter)         │              HistoryService.append
                        └──→ (optional) VerifyService post-check

VerifyService（拡張）──→ HASH_* / HISTORY_* findings（修復しない）
```

**設計原則:** CLIと将来の自動記録入口が、異なる方法でRecordを書かない。

### 10.2 コンポーネント責務

| Component | 責務 | 非責務 |
|---|---|---|
| **RecordCommitAPI** | 入力検証 → id/createdAt決定方針適用 → hash → save → history append を原子的連続として実行 | コンテンツ起草、人間承認、Candidate管理、bypassのOS防止 |
| **HashService** | 現行どおり canonical hash | Commitオーケストレーション |
| **JsonFileStorage** | 現行どおり永続化 | History連携 |
| **HistoryService** | 現行どおり append-only | Record修復 |
| **VerifyService** | 検査（+History整合） | 自動修正・意思決定 |
| **CLI** | UX / 引数parse / CommitAPI呼び出し | 独自の二重書込経路 |

### 10.3 非採用構造

```text
❌ CLIが独自にsaveし、Adapterが別経路でsave+history
❌ Storage直書き後に事後History修復を正規化
❌ CandidateをP1必須にする
```

---

## 11. P1 Implementation Plan

### 11.1 目的

```text
正式Recordへの書込規律を単一化し、
Official / Unofficial を機械検出可能にする。
```

自動記録本体・Candidate・Architecture変更は含めない。

### 11.2 責務

RecordCommitAPIは「正式Recordを1件作成する唯一のプログラム入口」となる。  
Verify拡張は「正式性の欠落を検出する」。

### 11.3 入力（CommitAPI）

最小入力（CLI現状と同等）:

| フィールド | 必須 | 備考 |
|---|---|---|
| `type` | Yes | templateまたは明示 |
| `title` | Yes | |
| `content` | Yes（空禁止方針は現行に合わせる） | |
| `evidence` | Yes（1件以上推奨 / 現行template要件に合わせる） | |
| `tags` / `relatedRecords` / `source` | No | metadata |
| `id` | No（通常自動生成） | 指定を許すなら衝突時は失敗 |
| `createdAt` | No（通常自動生成） | テスト注入可 |

### 11.4 出力

成功時:

```text
RuntimeRecord（frozen）
+ 副作用: records/<id>.json 作成
+ 副作用: history.jsonl に RECORD_CREATED 追記
```

失敗時: 例外/Result。**部分成功を残さない**（下記エラー処理）。

### 11.5 Record生成責務

- payload組み立て（version `1.0`、metadata正規化）  
- Templates適用はCLI側でもCommit前でも可。ただし **hash前に最終payloadを確定**  
- `freezeRuntimeRecord` は既存関数を再利用  

### 11.6 Hashとの関係

- CommitAPIが `HashService.hashPayload` を呼ぶ  
- Hashアルゴリズム・canonical JSON規則は **変更しない**  
- 呼び出し側がhashを持ち込んで「信じ込む」経路は作らない（持ち込みhashは検証必須、または禁止）

### 11.7 Storageとの関係

- `JsonFileStorage.save`（`wx`）を唯一の永続化として使用  
- overwrite APIを新設しない  
- Commit以外の内部コードが安易に `save` しないよう、**公開推奨経路をCommitに寄せる**（強制は言語レベルで完全不可）

### 11.8 Historyとの関係

- `appendRecordCreated({id, hash, at})` をCommit成功の必須段とする  
- History仕様変更なし  
- orphan救済のための不正hash追記はしない  

### 11.9 Verifyとの関係

- Commit後の任意verifyは推奨（失敗しても書込は既に完了しうるため、順序は save+history が先）  
- P1の主眼は **Verify拡張によるDetect**  
- VerifyはCommit成功の必要条件にしてもよいが、現行CLI互換を優先するなら post-check は warning でも可（Acceptanceで固定）

**推奨（Cursor）:** Commitは hash+save+history 成功で完了。直後に `verifyRecord(id)` を実行し、FAILならエラーとして返す（通常は起きない）。部分書込のロールバックはファイル削除で「消す」ことになるため、**削除ロールバックはしない**。代わりに失敗モードを最小化（hash確定後にsave、成功後にhistory）。

順序:

```text
1) build payload
2) hash
3) storage.save  （失敗→何も残らない）
4) history.append （失敗→StorageにUnofficialが残る可能性）
```

`4` 失敗時の扱い（P1設計）:

- エラーを返す  
- **自動削除しない**（証跡優先。UnofficialとしてDetect）  
- 運用で再実行せず、調査する（id衝突でない限り再Commitは新ID）

### 11.10 CLIとの関係

```text
asa record → parse/template → RecordCommitAPI.commit → 表示
```

CLI固有のsave/history直呼びは廃止（内部実装移管）。振る舞い・出力文言は互換維持を目標。

### 11.11 将来の自動記録入口との関係

```text
P2 Adapter / Candidate Confirm
        ↓
 RecordCommitAPI  （同一）
```

P1完了時点で、自動記録は未実装でも **接続点は用意される**。

### 11.12 エラー処理

| 状況 | 動作 |
|---|---|
| 必須フィールド欠落 | 失敗（書込なし） |
| id衝突（`wx` EEXIST） | 失敗 |
| hash生成失敗 | 失敗 |
| history append失敗 | 失敗を返す。Storage残存はUnofficialとしてDetect |
| 不正template | 現行同様失敗 |

### 11.13 重複Recordへの対応

- 同一title/contentの重複作成は **禁止しない**（現行どおり。意味重複は人間判断）  
- 同一idの再作成は **禁止**（`wx`）  
- DedupはP2 Candidate層の関心域  

### 11.14 ID生成

- 既定: `crypto.randomUUID()`  
- テスト: 注入可能  
- 外部指定id: 許可するなら衝突で失敗。P1推奨は **自動生成のみ**（単純さ優先）でも可  

**Cursor推奨:** 当面自動生成のみ（CLI現状）。指定idはテスト用DIに限定。

### 11.15 createdAtの扱い

- 既定: `new Date().toISOString()`（Commit時点）  
- History `at` は record.createdAt と一致させる（現行）  
- 事後変更しない  

### 11.16 Metadataの扱い

- 既存 `normalizeMetadata` を再利用  
- 空metadataのhash互換規則は変更しない  
- CommitAPIが独自metadata意味を追加しない  

### 11.17 Evidenceの扱い

- 配列として保存。実ファイル存在チェックは現行どおり必須ではない  
- template要件（evidence必須）はCLI/template層で担保  

### 11.18 既存Recordへの影響

- **読取のみ**  
- orphanの一括変換・改変・削除を実装しない  
- 既存テストデータ・本番recordsを書き換えない  

### 11.19 実装タスク分解（未着手）

| Task | 内容 |
|---|---|
| T1 | `RecordCommitAPI` モジュール追加（加法） |
| T2 | CLIをCommitAPI呼び出しへ置換 |
| T3 | VerifyにHistory整合finding追加 |
| T4 | `asa status` に Official/Unofficial件数表示（任意だが推奨） |
| T5 | テスト追加（下記） |
| T6 | 文書: 実装完了後に実装記録（別Record）。本Planの承認が前提 |

### 11.20 非目標（P1）

- Candidate  
- Capture Adapter / Hook大量導入  
- quarantine自動実行  
- orphan一括再登録  
- Op Def/Baselineファイル編集（別承認）  
- Architecture変更  

---

## 12. P1 Test Plan

| ID | 観点 | 期待 |
|---|---|---|
| PT1 | Commit成功 | ファイル作成 + History追記 + hash PASS |
| PT2 | Commit後verifyRecord | PASS |
| PT3 | id衝突 | 失敗、追加Historyなし |
| PT4 | CLI回帰 | 既存Cliテスト相当がPASS |
| PT5 | Hash規則回帰 | 既存hashテストPASS（変更なし） |
| PT6 | HISTORY_MISSING検出 | Storageのみfixtureでfinding |
| PT7 | RECORD_FILE_MISSING検出 | Historyのみfixtureでfinding |
| PT8 | HISTORY_HASH_MISMATCH | 不一致fixtureでfinding |
| PT9 | 既存HASH_MISMATCH | 従来どおり検出 |
| PT10 | 自動修復が無いこと | findingのみ。ファイル/ history非改変 |
| PT11 | metadata空互換 | v0.1 digest互換維持 |
| PT12 | 部分失敗（history mock fail） | エラー。自動削除なし |

Fixtureは **テスト用一時ディレクトリ** に限定し、本番 `data/asa_minimum_runtime` を汚さない。

---

## 13. P1 Acceptance Criteria

```text
AC1: Record作成のプログラム経路が RecordCommitAPI に単一化されている
AC2: CLIはCommitAPI経由でのみRecordを作成する
AC3: Hash / Storage / History の仕様（意味・フォーマット）が不変
AC4: 新規CommitしたRecordは Official条件を満たす
AC5: Verifyが HISTORY_MISSING を検出できる
AC6: Verifyが RECORD_FILE_MISSING を検出できる
AC7: Verifyは自動修復しない（inspection-only維持）
AC8: 既存records/historyファイルがテスト以外で改変されない
AC9: 既存orphan 10件が削除・その場修復されない
AC10: Candidate / Adapter自動記録が未導入でも受け入れ可能
AC11: Architecture / Baseline / Op Def ファイルが未変更（別承認がない限り）
AC12: 回帰テスト（hash/storage/history/cli）がPASS
```

---

## 14. P1実装前に必要な追加承認事項

| # | 承認事項 | なぜ必要か |
|---|---|---|
| A1 | **本P0方針（§2–5）の採択** | 実装の規範 |
| A2 | **P1範囲（CommitAPI + Verify加法）の認可** | コード変更開始条件 |
| A3 | Op Def加法リビジョンの方針承認（実施は別PR可） | 運用文書と実装の乖離防止 |
| A4 | `asa status` 分類表示の要否 | UX範囲 |
| A5 | history append失敗時にStorage残存を許容するか | 失敗セマンティクス |
| A6 | orphan quarantineをP1範囲に含めないことの確認 | 過剰実装防止 |
| A7 | Knowledgeが指すorphan Runtime IDの再登録をP1に含めないことの確認 | 範囲爆発防止 |

**承認されるまでコード変更を開始しない。**

---

## 15. P2自動記録への接続方法

```text
Sources → Capture Adapters → Normalize/Dedup
        → Candidate Store（mutable）
        → Human Confirm（Decision/Architecture必須）
        → RecordCommitAPI（P1で用意）
        → Verify
```

接続契約:

- P2は **CommitAPI以外にRecordを書かない**  
- CandidateはRecord Historyを汚染しない  
- Confirm前にhashしない（確定後にCommit）  
- Auto Scribe / 別SoTを復活させない  

P1が提供する接続点:

```text
commitRecord(CreateInput) → Official Record
```

---

## 16. Cursor自身の最終推奨

### 16.1 今すぐやること（実装なし）

1. **本ドキュメントのP0-1〜12をArchitectが承認**する  
2. P1実装認可（A2）を別途出す  
3. 既存orphanは触らない  

### 16.2 P1でやること（認可後）

1. RecordCommitAPI抽出  
2. CLIを薄いクライアント化  
3. VerifyにHistory整合findingを加法  
4. （推奨）statusにOfficial/Unofficial件数  

### 16.3 P1でやらないこと

- orphan削除/修復/昇格  
- Candidate  
- 自動記録Adapter本番導入  
- Architecture/Baseline/Op Defの無断変更  

### 16.4 一枚で言うと

```text
P0 = 正式とは何かを定義し、偽の修復を禁止する（今ここで確定提案）
P1 = その定義に沿って「書く」と「見つける」を実装する
P2 = 自動で集めて、人間が確認して、同じCommitで書く
```

### 16.5 推奨方針が「そのまま採用」でよい理由

再計測でも orphan構造（10 / 全HASH_MISMATCH / History欠0）は不変で、  
実装も「CLIは組を作るがVerifyはHistoryを見ない」緊張が継続している。  
したがってP0再調査推奨は **反証されておらず**、本確定でも維持する。  
変更点は定義の段階的機械化とquarantineの非必須化という **明確化のみ**。

---

## Appendix A — Official判定フロー（運用）

```text
for each records/<id>.json:
  if no HISTORY RECORD_CREATED(id): Unofficial (HISTORY_MISSING)
  else if hash verify FAIL: Unofficial (HASH_MISMATCH)
  else if history.hash != file.hash: Unofficial (HISTORY_HASH_MISMATCH)
  else: Official
```

現行（P1前）の近似:

```text
Storage ∩ History を作り、各idを現行 asa verify --id で確認
```

---

## Appendix B — 成果物チェックリスト

| # | 成果物 | 本ドキュメント節 |
|---|---|---|
| 1 | P0再確認結果 | §1 |
| 2 | P0-1〜12最終判断 | §2 |
| 3 | Official/Unofficial定義 | §3 |
| 4 | orphan処理方針 | §4 |
| 5 | bypass検出方針 | §5 |
| 6 | RecordCommitAPI必要性評価 | §6 |
| 7 | Candidate P2化 | §7 |
| 8 | 既存Runtime影響 | §8 |
| 9 | 既存仕様影響 | §9 |
| 10 | P1 Architecture/Component | §10 |
| 11 | P1 Implementation Plan | §11 |
| 12 | P1 Test Plan | §12 |
| 13 | P1 Acceptance Criteria | §13 |
| 14 | P1追加承認事項 | §14 |
| 15 | P2接続方法 | §15 |
| 16 | Cursor最終推奨 | §16 |

---

## Closing Stamp

```text
ASA-DESIGN-P0-POLICY-CONFIRMATION-AND-P1-IMPLEMENTATION-PLAN-V0.1-001
Status: PROPOSED FOR ARCHITECT APPROVAL
Code changes: NONE
Architecture / Baseline / Op Def / Existing Records: UNCHANGED
P0 policy: CONFIRM prior recommendation (with clarifications)
P1 primary: RecordCommitAPI + Verify History integrity detection
Candidate: P2+
Next step: Human Architect approval of P0-1..12 and P1 authorization
```
