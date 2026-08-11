# ASA Design Decision Report — P0 Orphan / Bypass Policy

**Record ID:** ASA-DESIGN-P0-ORPHAN-BYPASS-POLICY-V0.1-001  
**Title:** P0 — Formal Record定義 / 書込経路 / orphan・bypass方針  
**Document Type:** Design Decision Report（調査・判断・提案）  
**Status:** **PROPOSED**（実装未着手・既存資産未変更）  
**Date:** 2026-08-11  
**Authority:** HUMAN_ARCHITECT（承認待ち）  
**Parent:** ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001  
**Runtime:** ASA Minimum Runtime v0.1.1  
**Baseline:** ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001 — PRESERVED  

```text
Purpose = P0方針の設計判断
≠ 実装
≠ Architecture / Baseline / Op Def / Hash / History / 既存Record の変更
≠ Candidate必須の決め打ち
≠ CLI廃止の決め打ち
≠ orphan削除の決め打ち
```

---

## 1. Repository / 実装再確認

### 1.1 再計測（2026-08-11）

| 指標 | 値 | 確認方法 |
|---|---|---|
| `records/*.json` | **30** | filesystem |
| `history.jsonl` events | **20** | HistoryService.list |
| Storage∩History | **20** | id照合 |
| Storageのみ（orphan） | **10** | id照合 |
| Historyのみ（欠ファイル） | **0** | id照合 |
| `asa verify --all` findings | **10 × HASH_MISMATCH** | VerifyService.verifyAll |

Design Investigation の `30 / 20 / 10` は **再確認で一致**。

### 1.2 orphan 内訳（実データ）

| Class | 件数 | 特徴 | Verify |
|---|---|---|---|
| **A. Placeholder hash** | **8** | `pending-local-registration-…` / `pending-local-verification-…` | FAIL（HASH_MISMATCH） |
| **B. SHA-looking but wrong** | **2** | 64hex だが再計算不一致（`0f7f8fbc…`, `bf1e459f…`） | FAIL（HASH_MISMATCH） |

全orphanに共通:

- `records/` に存在
- **History に `RECORD_CREATED` なし**
- metadata / evidence / 意味のある title・content は持つ（「空ファイル」ではない）
- `source` は主に `ASA-REGISTER-*` 系（設計登録の意図痕跡）

### 1.3 現行実装が実際に保証していること

| 層 | 実装事実 |
|---|---|
| CLI `asa record` | hash生成 → `storage.save`（`wx`）→ `history.appendRecordCreated` を **同一コマンド内で連続実行** |
| Storage | ファイル存在すれば読める。History連携は **しない** |
| History | append-only。Record存在チェックは **しない** |
| Verify | 存在 + hash再計算のみ。History所属は **見ない** |
| Templates / Metadata | 生成支援。正式性の定義には使われない |

Implementation Plan（create手順）:

```text
1) write records/<id>.json
2) append history.jsonl line
```

→ **意図上は組**だが、**技術的には Storage単独書込が可能**（OS/エディタ直書き）。

### 1.4 仕様上の緊張（矛盾に近いギャップ）

| 観点 | 仕様・実装が示すもの |
|---|---|
| Plan / CLI | 正式作成経路 = hash + storage + history |
| Op Def | Recordは immutable、訂正は新Record、検証は存在+hash |
| Verify | History非所属でも「ファイルさえありhash一致なら」理論上PASSしうる |
| 現実 | orphanは History外かつ **全件 hash FAIL** → verifyAll が常時汚染 |

**矛盾の本質:**  
「正式Record」が **運用意図（CLI組）** と **Verify実装（Storage+hash）** と **ディレクトリ上のJSON** の三重で一致していない。P0で定義を揃える必要がある。

### 1.5 Architecture / 他Runtime境界

- Ch.1–50 / Foundation / `runtime_execution` / orchestration / workflow: **Record書込に関与しない**
- Minimum Runtime は独立の記録層
- 本P0は Architecture改変を要求しない

---

## 2. 現状問題

1. **正式性の定義が曖昧** — ファイルがあるだけで「Record」と呼ばれうる  
2. **bypassが容易** — `records/` へJSONを置けばStorage一覧に入る  
3. **Historyが正式性の必要条件になっていない**（Verifyが未検査）  
4. **orphan 10件が verifyAll を恒久FAILにする** — 運用監視が機能しない  
5. **placeholder hash** は「登録意図」はあるが **改ざん検知対象として無効**  
6. **自動記録を進めると、同じbypassが増えるリスク**がある  

P0の仕事は「自動生成」ではなく、**正式Recordと書込規律を固定すること**。

---

## 3. 正式Recordの定義案

### 3.1 候補定義の比較

| 定義ID | 定義 | 長所 | 短所 |
|---|---|---|---|
| D1 | Storageに存在する | 単純 | hash不正・bypassを正式化してしまう |
| D2 | Historyに存在する | 作成痕跡 | ファイル欠落・不正hashでも「正式」になりうる（現状欠落0件） |
| D3 | CLI経由のみ | 経路明確 | API/将来Adapterを排除しすぎ。CLIはUIに過ぎない |
| D4 | Verify PASS（現行Verify） | 改ざん耐性 | History外でもPASSしうる。現行orphanは全滅FAIL |
| D5 | Storage ∧ History ∧ Verify PASS | 三条件一致 | Verify拡張が必要（History検査）。最も厳密 |
| D6 | 「人間がそう呼ぶもの」 | 柔軟 | 機械検証不能 |

### 3.2 Cursor推奨定義（Normative提案）

```text
ASA Official Record（正式Record）=
  (1) records/<id>.json が存在する
  ∧ (2) history.jsonl に RECORD_CREATED{id, hash, at} がある
  ∧ (3) 格納hashが Canonical SHA-256 として Verify PASS
```

補足:

- **CLI経由は十分条件の典型例**であり、必要条件ではない（同じ組を組むAPIでも可）  
- Storageのみ = **Unofficial storage artifact**（正式Recordではない）  
- Historyのみ = **破損状態**（現状0件。検出すべき異常）  
- hash形式不正 / mismatch = 正式Recordではない  

これは **現行コードを変更せずとも運用定義として採用可能**。  
VerifyがHistoryを見ない点は **仕様ギャップ（変更提案）** として後述。

### 3.3 現行仕様との関係

- Planのcreate手順と整合  
- Op Defの「integrity = 存在 + hash」を **必要条項**とし、Historyを **運用上の必要条項**として明示する加法が望ましい  
- 「CLIで作ったもの＝正式」は **実装事故で揺れる**ため非採用  

---

## 4. 書込経路の選択肢

| 経路 | 説明 | 正式Recordを作れるか | 備考 |
|---|---|---|---|
| CLI `asa record` | 現行の人間入口 | **Yes**（正しく使えば） | UI |
| RecordCommitAPI | hash→save→historyを関数化 | **Yes** | CLIの中核抽出 |
| Candidate→Confirm→Commit | 下書き→承認→CommitAPI | **Yes**（Commit時） | 自動記録向け。P0必須ではない |
| 直接 Storage.save | historyなし | **No**（D5定義下） | 内部から呼んでも不完全 |
| エディタ直書き `records/*.json` | OS書込 | **No** | 現状orphanの主因クラス |
| Adapter直Commit | CI/gitがCommitAPI呼ぶ | **Yes** | 将来。Confirmは別問題 |

**Cursor判断（書込）:**  
正式書込の **組成単位**は「hash + storage + history」のトランザクション的連続である。  
それを誰が呼ぶか（CLI / API / Adapter）は二次問題。  
**直接Storage / 直書きJSONは正式経路に含めない。**

---

## 5. Candidateの必要性評価（Design Investigationの再評価）

| 問い | Cursor回答 |
|---|---|
| 本当に必要か | **自動記録のIntakeには有用。P0の正式性・bypass問題の解決には不要。** |
| どの段階で必要か | Adapterが「人間が毎回CLIを打たない」段階（概ねP2以降） |
| Human Confirm必須か | Decision/Architectureは推奨必須。Verificationの全部必須は過剰になりうる |
| Recordとの境界 | Candidate = 未確定・可変。Record = 確定・不変・hash付き |
| 永続化必要か | キュー運用するならYes。人間がすぐCLIするだけなら不要 |
| Candidate History必要か | 当面不要。Record Historyを汚染しないこと優先 |

**再評価結論:**  
Design InvestigationのCandidate提案は **自動記録フェーズ向けとして維持**するが、  
**P0必須コンポーネントからは外す。**  
「Candidateなしでは正式Recordを定義できない」は誤り。

---

## 6. orphan / non-CLI処理案

### 6.1 選択肢比較

| 案 | 内容 | 証跡 | verifyAll | リスク |
|---|---|---|---|---|
| O1 そのまま保持 | records/に残す | 残る | **恒久FAIL** | 監視不能 |
| O2 正式扱い | History追記や「PASS扱い」 | 偽の正式性 | 危険 | 改ざん検知破壊 |
| O3 別種別として扱う | Official vs Unofficial 分類 | 残る | 分類次第 | 定義が必要（推奨方向） |
| O4 修復可能なものだけ修復 | その場でhash直しHistory追記 | ファイル改変 | 改善しうる | **immutability違反**に近い |
| O5 新Recordとして再登録 | 正規経路で新ID発行 | 新旧追跡可 | 改善 | 二重表現。関連付け必要 |
| O6 削除 | ファイル削除 | **喪失** | 改善 | 証跡破壊。非推奨 |
| O7 隔離（quarantine） | records外へ移動 | 内容保持 | Official集合がPASS | 要認可。移動は運用処置 |

### 6.2 Class別の扱い（Cursor）

**Class A（8件, pending hash）**

- 正式Recordではない  
- 削除しない  
- Historyに pending hash で追記しない（Historyを汚染）  
- 意味内容が必要なら **O5: 正規経路で新Official Recordを作成**し、evidence/relatedに旧ファイルパスとREGISTER文書を残す  
- 旧ファイルは **O7 quarantine** または「unofficial inventory」文書化のうえ records 外へ  

**Class B（2件, sha形式だが mismatch）**

- 「直せば正式」に見えて危険  
- その場hash書換（O4）は **非推奨**（何時誰が直したかHistoryに残らず、immutabilityが曖昧）  
- 同様に **O5 + O7**  

### 6.3 削除について

削除は:

- 設計登録の意図痕跡を消す  
- 後から「なぜverifyが汚れていたか」を説明不能にする  

**Cursor: 削除は採用しない。**

### 6.4 「正式へ昇格」について

History追記だけで昇格（hash不正のまま）は **採用しない**。  
昇格に見える行為は、必ず **新IDでの正規Commit**（O5）とする。

---

## 7. bypass対策案

| 手段 | 実現性 | 効果 | 備考 |
|---|---|---|---|
| 運用ルール「CLI/CommitAPI以外禁止」 | 高 | 中 | 破られうる（現状が証拠） |
| VerifyでHistory整合検出 | 高（加法） | 高 | inspection only維持可 |
| CommitAPI以外からStorage.saveを呼ばない構造 | 中 | 高 | 直書きは防げない |
| records/ の書込権限制限 | 環境依存 | 中 | CI/ローカルで差 |
| quarantine + verifyAllはofficialのみ | 高 | 高 | 運用定義 |
| pre-commit hookで不正JSON検出 | 中 | 中 | git管理するなら |
| 「検出してエラー」 | Verify拡張 | 高 | 自動修正はしない |

**Cursor判断:**  
ファイルSoTでは **完全防止は不可能**。  
戦略は **Detect（Verify整合）＋ Contain（official定義）＋ Prefer（単一Commit組成）**。  
Prevention単独（権限のみ）に賭けない。

---

## 8. 各案の比較（方針オプション）

### Option A — 既存CLI中心拡張

```text
構造: 人間/スクリプト → asa record → (内部でhash/storage/history)
```

| 軸 | 評価 |
|---|---|
| メリット | 現状資産最大活用、学習コスト低 |
| デメリット | プログラムから呼びにくい、bypass抑制は弱い |
| 難易度 | 低 |
| 自動記録相性 | 弱（subprocess CLIは可能だが脆い） |
| 証跡性 | CLI成功時は高い |
| 拡張性 | 中 |
| Runtime影響 | 小 |
| 運用 | orphan問題は別途運用で残る |

### Option B — RecordCommitAPI中心統一

```text
構造: CLI / Adapter / 将来Candidate → RecordCommitAPI → hash+storage+history
```

| 軸 | 評価 |
|---|---|
| メリット | 書込組成の単一化、自動記録の土台、テスト容易 |
| デメリット | 直書きは依然可能（Detect必要） |
| 難易度 | 低〜中（CLIリファクタ） |
| 自動記録相性 | **強** |
| 証跡性 | 高（組成が強制） |
| 拡張性 | 高 |
| Runtime影響 | 加法（公開API抽出）。Hash/Storage意味は不変 |
| 運用 | official定義とセットで効く |

### Option C — Candidate → Human Confirm → Commit

```text
構造: Sources → Candidate → Confirm → CommitAPI
```

| 軸 | 評価 |
|---|---|
| メリット | 自動記録のHITLに最適 |
| デメリット | P0問題（orphan/bypass定義）には過剰。導入コスト高 |
| 難易度 | 中〜高 |
| 自動記録相性 | 最良（将来） |
| 証跡性 | 高（ただしCandidate設計次第） |
| 拡張性 | 高 |
| Runtime影響 | 新パッケージ必要 |
| 運用 | Confirm疲れのリスク |

### Option D — Verify強化のみ（書込は現状CLI）

```text
構造: 現状CLI維持 + VerifyがHistory整合/orphan報告
```

| 軸 | 評価 |
|---|---|
| メリット | 最小変更で検出可能、P0に直結 |
| デメリット | 書込単一化は進まない |
| 難易度 | 低 |
| 自動記録相性 | 弱 |
| 証跡性 | 検出は強い |
| 拡張性 | 中（Bと併用可） |
| Runtime影響 | Verify加法提案 |
| 運用 | orphan quarantine方針が別途必要 |

### Option E — Storage直＋事後History修復運用

```text
構造: 好きにJSON配置 → 後でhistory/hash修復
```

| 軸 | 評価 |
|---|---|
| メリット | 見かけの記録速度 |
| デメリット | **現行問題の再現**。immutability曖昧 |
| 難易度 | 一見低い |
| 自動記録相性 | 見かけ上楽、実は破綻 |
| 証跡性 | **低い** |
| Cursor | **不採用** |

### Option F — Official定義の運用固定 + quarantine +（次に）B/D

```text
構造: 定義D5を運用採用 → orphanは非公式扱い/隔離方針
      → 次工程でCommitAPIとVerify整合を加法実装
```

| 軸 | 評価 |
|---|---|
| メリット | P0で決定すべき核に集中。過剰設計しない |
| デメリット | 定義文書化と隔離のArchitect承認が必要 |
| 難易度 | P0は意思決定中心 |
| 自動記録相性 | Bへの橋渡しになる |
| 証跡性 | 高い（削除しない） |
| Cursor | **P0推奨パッケージの中核** |

---

## 9. 既存仕様への影響

| 資産 | 影響 | 変更提案の要否 |
|---|---|---|
| Architecture Ch.1–50 | なし | 変更しない |
| ASA Foundation | なし | 変更しない |
| Runtime Execution | なし | 変更しない |
| Minimum Runtime v0.1.1 コード | P0では変更しない | P1でCommitAPI抽出は加法提案 |
| Baseline | PRESERVED | 拡張時は新plan+認可 |
| Operation Definition v0.1 | **加法が望ましい** | 下記提案 |
| Operational Trial | 観察追記が望ましい | Trial中の実装拡大は別認可 |
| 既存Official Record（20） | 不変 | 変更しない |
| 既存History（20行） | 不変 | pending追記で汚染しない |
| 既存orphanファイル | **削除しない** | quarantineは認可後の運用処置提案 |

### Op Def 加法提案（未実施）

| 項目 | 内容 |
|---|---|
| 変更対象 | `asa_runtime_operation_definition_v0_1.md`（新リビジョン） |
| 変更理由 | Official Record定義とbypass/orphan扱いが未記載で運用が壊れている |
| 変更内容 | Official = Storage∧History∧Verify PASS；Unofficialの定義；訂正は新Record；直書き禁止の運用規範 |
| 影響 | 運用明確化。Runtime必須改変はなし |
| 変更しない場合の問題 | verifyAll汚染、自動記録で同型事故が再発 |

### Verify 加法提案（未実施・P1候補）

| 項目 | 内容 |
|---|---|
| 変更対象 | VerifyService（新finding code） |
| 変更理由 | 現行VerifyはHistory整合を見ない |
| 変更内容 | `HISTORY_MISSING` / `RECORD_FILE_MISSING` 等をinspectionとして追加。自動修復なし |
| 影響 | verifyAllが「正しい失敗」を報告。doesNotDecide維持 |
| 変更しない場合の問題 | Official定義を機械検査できない |

### History仕様

- **アルゴリズム/追記規約は変更しない**  
- orphan救済のために不正hashをHistoryへ書かない  

### Hash仕様

- **変更しない**  
- placeholder / mismatch は「壊れたartifact」として扱う  

---

## 10. Cursor自身の推奨案

### 10.1 採用する方式

**P0: Option F（Official定義の固定 + orphan非公式化/隔離方針）**  
**P1: Option B（RecordCommitAPI）+ Option DのDetect部分（Verify整合）**  
**P2以降: 必要になったら Option C（Candidate）を自動記録用に導入**

CLIは **廃止しない**。CLIはCommitAPIの第一クライアントとして残す。

### 10.2 なぜか

1. 実データが示す緊急問題は「自動生成不足」ではなく **正式性の崩壊（verifyAll=FAIL）**  
2. Candidateは自動記録の道具であり、P0の定義問題を解かない（再評価で降格）  
3. 削除は証跡破壊。その場hash修復はimmutabilityを溶かす  
4. CommitAPIは「CLI中心」を捨てず、**組成を単一化**するだけなので過剰でない  
5. 完全なbypass防止はファイルSoTでは不可能 → Detect必須  

### 10.3 Design InvestigationのRecordCommitAPI推奨は変わるか？

```text
判断: 変わらない（CommitAPIは依然推奨）
ただしスコープを修正する。
```

| 点 | Design Investigation | 本P0再調査後 |
|---|---|---|
| CommitAPI | 自動記録の第一実装 | **書込規律の第一実装**としても正当。推奨維持 |
| Candidate | 早期中核 | **P0/P1必須から外す**（自動記録P2+） |
| 最大ボトルネック | Intake欠如 | P0時点の最大実害は **orphanによる正式性汚染**。Intakeは次段 |
| CLI | 薄くする | **残す**（廃止しない） |

つまり: **CommitAPI推奨は同じ。Candidateの優先順位とP0の主題がシャープになった。**

### 10.4 他案より優れる点

- Aだけ: プログラム入口と単一組成が弱い  
- Cを今やる: P0に対して過剰  
- E: 問題再現  
- F+B+D: 定義→検出→単一書込の順で、自動記録に壊さない土台になる  

### 10.5 懸念と処理

| 懸念 | 処理 |
|---|---|
| quarantineが「削除に見える」 | 内容保持・パス記録・Architect認可・理由をObservation/新Recordに残す |
| 再登録で二重表現 | relatedRecords / evidenceで旧unofficialパスを明示 |
| Verify拡張が仕様変更に見える | inspection-only加法。自動修復なし。要認可 |
| CommitAPIが「巨大化」 | CLIから抽出するだけ。振る舞い同等 |
| 直書きは防げない | Detect + Official定義で「正式にならない」ことを保証 |

### 10.6 P0で決めるべきこと / P1実装 / 次工程

次節11–13に分離。

---

## 11. P0で決定すべき事項（意思決定リスト）

実装なし。Architect承認用。

| # | 決定事項 | Cursor推奨 |
|---|---|---|
| P0-1 | Official Recordの定義 | **D5:** Storage ∧ History ∧ Verify PASS |
| P0-2 | Storageのみの位置づけ | **Unofficial storage artifact**（正式でない） |
| P0-3 | orphan 10件の削除 | **しない** |
| P0-4 | orphanのHistory追記による昇格 | **しない**（特にpending/mismatch） |
| P0-5 | orphanのその場hash書換 | **しない** |
| P0-6 | orphanの推奨処置 | **内容保持 + 非公式認定**。可能なら後続でquarantine。必要内容は **新Official再登録** |
| P0-7 | 今後の正式書込経路 | **hash+storage+history を組む経路のみ**（CLIまたは将来CommitAPI） |
| P0-8 | CandidateをP0必須にするか | **しない** |
| P0-9 | CLI廃止か | **しない** |
| P0-10 | bypass戦略 | **Detect中心**（Verify整合をP1提案）+ 運用禁止 |
| P0-11 | Op Def加法の要否 | **要（提案）** — 実装前に方針承認 |
| P0-12 | 既存20 Official | **不変のまま正式** |

P0完了条件（Cursor）:

```text
上記P0-1〜12がHuman Architectにより採否決定されていること。
コード変更はまだ不要。
```

---

## 12. P1 Implementation Plan（推奨・未認可）

P0承認後の **最小実装**案。ここも決め打ち固定ではなくCursor推奨。

### P1目標

```text
正式書込組成の単一化 + Official集合の機械検出
（自動記録・Candidateは含めない）
```

### P1-1 RecordCommitAPI

- CLI `asa record` の中核を `commitRecord(input) → RuntimeRecord` に抽出  
- 必ず: hash → storage.save → history.append  
- 既存テスト互換  
- **Hash/Storage/Historyの意味変更なし**

### P1-2 Verify整合（加法）

- finding例: `HISTORY_MISSING`, `RECORD_FILE_MISSING`  
- `verifyAll` がorphanを明示  
- 自動修復・自動History追記は **しない**  
- doesNotDecide維持  

### P1-3 orphan運用処置（コードより運用）

- unofficial inventory 文書（report）  
- quarantineディレクトリ案（認可後）  
- 必要なら `asa record` / CommitAPIで意味内容を再登録（新ID）  

### P1非目標

- Candidate  
- Adapter / Hook大量導入  
- Hashアルゴリズム変更  
- 既存Official Record改変  
- orphan削除  

### P1完了条件案

```text
- CommitAPI経由とCLI経由で同等のOfficial Recordが作れる
- VerifyがHistory欠落を検出できる
- 既存20 Officialは引き続きPASS
- unofficialの扱いが文書化されている
```

---

## 13. P2以降の自動記録ロードマップ（推奨）

P1土台の上でのみ進める。

| 段 | 内容 |
|---|---|
| **P2** | Candidate最小（draft/accept/reject）+ Confirm CLI。Decision/Architectureは必須確認 |
| **P3** | Adapter第一号（推奨: CI Verification結果 → Candidate） |
| **P4** | Evidence harvest提案、Dedup/Significance |
| **P5** | Search投影、関連可視化（Trial deferred） |
| **P6+** | 外部Adapter（PFOSはオプションの一つ） |

```text
自動記録へ進む条件（Cursor）:
  Official定義が承認済み
  書込がCommit組成に寄っている
  orphanがOfficial集合を汚染しない状態
  Candidateは「必要になった入口」に対して導入
```

---

## 14. 実装判断サマリ

```text
P0:
  決定すべきは実装ではなく定義と方針。
  Official Record = Storage ∧ History ∧ Verify PASS。
  orphanは削除せず、正式昇格させず、非公式として扱う。
  Candidate必須化・CLI廃止はしない。
  CommitAPIは「次の実装」として維持推奨（Design Investigationと同方向、優先理由を書込規律に修正）。

P1:
  RecordCommitAPI抽出 + Verify History整合検出。
  orphanは運用quarantine/再登録。コードで勝手に消さない。

P2:
  自動記録の入口としてCandidate最小を導入。
  その前にP0/P1の正式性を安定させる。
```

---

## Appendix — 再確認コマンド証跡（要約）

```text
records=30 history=20 orphans=10 history_without_file=0
verifyAll_passed=false findings=10 (all HASH_MISMATCH)
Class A pending hash: 8
Class B sha64 but mismatch: 2
```

主要参照:

- `src/asa_minimum_runtime/{cli,storage,history,verify,hash,models}/*`
- `docs/specs/asa_minimum_runtime_v0_1_implementation_plan.md` §6 Append方式  
- `docs/specs/asa_runtime_operation_definition_v0_1.md`  
- `data/asa_minimum_runtime/records/*`  
- `data/asa_minimum_runtime/history/history.jsonl`  

---

## Boundary compliance（本報告書）

| 禁止 | 本調査 |
|---|---|
| Architecture / Foundation / FROZEN 変更 | 未実施 |
| Runtime Execution 変更 | 未実施 |
| 既存Record / History / Hash仕様変更 | 未実施 |
| Baseline / Op Def 変更 | 未実施（提案のみ） |
| 実装 | 未実施 |
| 本Report追加 | 設計成果物として作成 |

---

# End of Design Decision Report
