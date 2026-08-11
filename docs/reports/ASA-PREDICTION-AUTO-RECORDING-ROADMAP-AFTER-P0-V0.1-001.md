# ASA Prediction / Roadmap — Auto-Recording After P0 Approval

**Record ID:** ASA-PREDICTION-AUTO-RECORDING-ROADMAP-AFTER-P0-V0.1-001  
**Title:** P0承認後の自動記録実用化ロードマップ予測  
**Document Type:** Prediction / Roadmap Report（設計・予測のみ）  
**Status:** **PREDICTION**（実装未着手・既存資産未変更）  
**Date:** 2026-08-11  
**Authority:** Cursor recommendation for HUMAN_ARCHITECT  
**Parents:**  
- ASA-DESIGN-P0-POLICY-CONFIRMATION-AND-P1-IMPLEMENTATION-PLAN-V0.1-001  
- ASA-DESIGN-P0-ORPHAN-BYPASS-POLICY-V0.1-001  
- ASA-DESIGN-AUTO-RECORDING-INVESTIGATION-V0.1-001  
**Runtime:** ASA Minimum Runtime v0.1.1  
**Architecture:** ASA-ARCH-50.0 FROZEN — unchanged  
**Baseline / Op Def:** PRESERVED — change only via later approved revisions  

```text
Purpose = P0承認後の到達経路予測と推奨依頼の明確化
≠ 実装開始
≠ Architecture / Baseline / Op Def / Record / Hash / History の変更
≠ Phaseを細かく切ること自体を目的化しない
```

Companion canvas: `asa-auto-recording-roadmap.canvas.tsx`

---

## 0. Cursorの結論（先に読む）

### 0.1 本当に分ける境界は3つだけ

人工的な P1/P2/P3 の細分割は不要。Repository上の自然境界は次の3つ。

```text
境界A — Policy Lock（P0承認）
  定義だけ。コードなし。

境界B — Write Discipline Slice（一括実装）
  RecordCommitAPI + Verify History整合 + CLI薄化
  ※ここは分割するとDetectなき書込、または書込なきDetectになり後戻りする

境界C — Assisted Recording Loop（初回実用化）
  狭い入口1つ + Human Confirm + CommitAPI再利用
  ※Candidate Storeは「必要になったら」同梱。先に必須化しない

その後は拡張（入口追加・Search・範囲拡大）であり、
新しい「憲法」ではなく運用の幅を広げる段階。
```

### 0.2 P0承認後、次にCursorへ依頼すべきこと（1つ）

```text
推奨依頼（具体）:

「P0方針（Official=Storage∧History∧Verify PASS / orphan非改変）を前提に、
 Write Discipline Slice を実装せよ。
 範囲: RecordCommitAPI + Verify HISTORY_* 加法 + CLIをCommitAPI経由へ移行。
 禁止: orphan削除/修復、Candidate、自動捕捉Adapter本番、Architecture/Baseline/Op Def無断変更、既存Record改変。
 Acceptance: 新規CommitはOfficial条件を満たし、verifyがorphanをHISTORY_MISSINGとして報告でき、既存hash/storage/history仕様は不変。」
```

これが最短で「正式に書ける・非正式を見つけられる」状態を作る。

---

## 1. P0承認によって確定する事項

P0はコードを増やさない。次を **規範として固定** する。

| # | 確定内容 |
|---|---|
| 1 | Official Record = Storage ∧ History ∧ Verify PASS |
| 2 | Storageのみ = Unofficial |
| 3 | orphanは削除しない |
| 4 | orphanをHistory後付けで昇格しない |
| 5 | orphanをその場hash修復しない |
| 6 | 必要内容は新ID・正規経路で再登録。旧証跡は保持 |
| 7 | CLIは廃止しない |
| 8 | Bypassは完全防止せず Detect 中心 |
| 9 | Candidateは自動記録段階の任意部品（P0必須ではない） |
| 10 | 正式書込の組成単位 = hash → storage → history |
| 11 | 既存Official/History/Hash仕様は改変しない |
| 12 | Architecture / FROZEN artifacts は変更しない |

P0承認で **まだ確定しないもの:**

- CommitAPIの関数シグネチャ詳細  
- Candidateの永続化形式  
- どの活動を自動捕捉するか  
- Search UI  
- Runtimeを0.2に上げる日  

これらは実装/運用の学習後に決める。

---

## 2. P0承認後の最初の実装候補

**最初の実装 = Write Discipline Slice（境界B）を一括。**

| 含む | 含まない |
|---|---|
| RecordCommitAPI | Candidate Store |
| Verify: HISTORY_MISSING / RECORD_FILE_MISSING /（推奨）HISTORY_HASH_MISMATCH | orphan一括再登録 |
| CLI → CommitAPI 移行 | Capture Adapter本番 |
| （推奨）`asa status` に Official/Unofficial件数 | Search / Discovery |
| テスト一時dir上の回帰 | Baseline/Op Defファイルの無断改訂 |

**なぜ最初か:**  
今の実害は「自動生成不足」ではなく **正式性の崩壊（verifyAllがUnofficialで汚染）** と **書込経路がCLI内に閉じていること**。  
自動捕捉を先に作ると、同じbypass（Storage直）を増やす。

---

## 3. 実装を分けるべき境界

| 境界 | 分ける理由 | 分けないと起きること |
|---|---|---|
| **A Policy vs B Code** | 規範未承認のまま実装すると定義が実装に引きずられる | 「動いたものが正式」に逆戻り |
| **B Write+Detect vs C Assisted Loop** | 入口がなくても書ける/見つけられる状態が先 | 捕捉を先に作ると非正式Recordが増殖 |
| **C Assisted Loop vs 範囲拡大** | 最初の入口でConfirm/Evidence規則を学習する | 全ソース同時接続で確認疲れ・ノイズ |

**分けない（一括）境界:**

- CommitAPI と Verify History整合  
- CommitAPI と CLI移行  

片方だけだと「きれいな入口がないDetect」または「Detectなき新入口」になる。

---

## 4. 一括実装してよい範囲

```text
一括してよい = Write Discipline Slice 全体
```

理由:

1. CLIが既に実質同じ3手を持っている → 抽出コストが低い  
2. Verify加法は既存inspectionモデルに乗る  
3. セットで初めて Official が機械検査可能になる  
4. 分割PRにしても依存が強く、レビュー利点が薄い  

一括して **はいけない** もの:

- 全Knowledge文書のorphan Runtime再登録  
- 全リポジトリ活動の自動捕捉  
- Candidate + Adapter + Search の同時導入  

---

## 5. RecordCommitAPIの位置付け

```text
RecordCommitAPI = 正式Record作成の唯一のプログラム入口
目的 = 書込規律の単一化
≠ 自動生成エンジン
≠ コンテンツ起草AI
```

スコープ（推奨）:

- 入力検証 → payload確定 → hash → save → history append  
- 既存 Hash/Storage/History を呼ぶだけ（再実装しない）  
- id/createdAt は既定自動生成  

やらない:

- Evidence実在チェックの高度化（後で可）  
- Dedup  
- Human Confirm  
- orphan修復  

---

## 6. Verify拡張の位置付け

**Write Discipline Slice と同時実装すべき。**

| Finding | 役割 |
|---|---|
| HASH_MISMATCH | 現行 |
| HISTORY_MISSING | orphan検出（今の10件の正しい名前） |
| RECORD_FILE_MISSING | History-only破損 |
| HISTORY_HASH_MISMATCH | Historyとファイルのhash不一致（推奨） |

性質:

- inspection-only / doesNotDecide 維持  
- 自動修復しない  
- 「verifyAllがFAIL」はUnofficial混在の正常な信号として解釈可能になる  

Verifyだけ先でも一時的に有用だが、**CommitAPIなしではプログラム入口が単一化されず**、次の自動記録で再発する。よって同時推奨。

---

## 7. CLIの位置付け

```text
CLI = Human UX / 第一クライアント
CommitAPI = 実体
```

移行方針:

1. 振る舞い互換（`asa record/show/history/verify/status`）  
2. 内部をCommitAPI呼び出しへ置換  
3. 廃止しない  
4. 将来も「手動の正式入口」として残す（自動が止まっても記録できる）

---

## 8. Candidate導入時期

**最初のAssisted Loopで「下書きが必要になった瞬間」に導入。先送り前提にも必須前提にもしない。**

| 状況 | Candidate |
|---|---|
| Write Disciplineのみ | **不要** |
| 入口が「人間がConfirm画面で即Commit」 | 薄いConfirmバッファで足りるなら **後回し可** |
| 入口が非同期・複数ソース・差し戻しあり | **この時点で導入** |

Cursor予測:  
最初の実用入口が「設計登録アシスト（文書パスから下書き）」なら、ファイル1つ or JSON下書きで足り、本格Candidate Storeは **2つ目の入口** の前でよい。

---

## 9. 自動記録入口

### 9.1 置いてはいけない場所

- Architecture / runtime_execution / 売買系パイプライン直結  
- Storage.save 直呼び  
- Auto Scribe別SoTの復活  

### 9.2 置くべき場所

```text
薄い Capture Adapter（repo活動の観察）
  → （任意）Candidate
  → Human Confirm Gate
  → RecordCommitAPI
```

### 9.3 最初の入口の推奨（狭い）

後戻りが少ない第一入口:

```text
Design Registration Assist
対象: docs/baselines/ASA-* と docs/reports/ASA-REGISTER-* の新規/更新
出力: Decision/Verification 下書き
Confirm: Human
Commit: RecordCommitAPI
```

理由:

- 既にKnowledge/Registration運用がある  
- orphanの主因クラス（pending-local設計登録）と直結  
- 投資判断・売買と無関係  
- Evidenceパスが明確  

置かない（初期）:

- git全コミット自動Record化  
- テスト全PASSの自動Record化  
- Discord/運用ログの全量捕捉  

---

## 10. Human confirmation

| Record種別 | Confirm |
|---|---|
| Decision / Architecture相当 | **必須** |
| Verification（制約確認） | 原則必須（テンプレ固定なら半自動+最終承認でも可） |
| Implementation（作業完了証跡） | 初期は必須。信頼後に緩和検討 |
| hash/storage/history/verify実行 | **自動化してよい** |

Confirmの位置:

```text
コンテンツ確定の直前（CommitAPIの前）
CommitAPIの中にConfirmを埋め込まない
```

---

## 11. Evidence / Metadata自動化

| 項目 | Write Discipline | Assisted Loop初期 | 実運用拡大後 |
|---|---|---|---|
| Evidence | 人間指定（現行） | 入口がパスを提案 | テンプレ別自動添付 |
| tags | 人間/CLI | 入口が推定、Confirmで編集 | 規則ベース |
| relatedRecords | 人間 | 登録文書から提案 | グラフが必要ならSearch後 |
| source | CLI引数 | Adapter名を自動 | 固定 |

**原則:** 自動で埋めてよいのは「再現可能な参照」。意味判断（なぜ関連か）はConfirm側。

---

## 12. orphan処理

### 12.1 今すぐやること

- **何もしない（削除・修復・昇格しない）** — P0の帰結  

### 12.2 Write Discipline直後

- Verifyが `HISTORY_MISSING` で10件を明示  
- unofficial inventory（レポート）を1回作る（任意だが有用）  

### 12.3 Assisted Loopと同時〜直後

- Knowledgeが「Runtime Decision」として指している orphan のうち、**Runtime Officialが本当に必要なものだけ** 新ID再登録  
- 全10件の機械的再登録はしない（二重表現コスト）  
- 旧ファイルは保持  

予測: 実際に再登録が急がれるのは、運用がRuntime IDを参照し始めた数件。文書だけのものは Knowledge/Registration がSoTのままでよい。

---

## 13. Operational Trialの利用方法

Trialは **実装許可ではなく観察枠** として使う。

| 段階 | Trialの使い方 |
|---|---|
| Write Discipline後 | Official/Unofficial件数、verify finding内訳を観察ログへ |
| Assisted Loop | 「下書き→Confirm→Commit」所要時間・差し戻し理由を観察 |
| 拡大前ゲート | Trial観察が安定するまで入口を増やさない |

Trial中にやってはいけないこと:

- Trialを理由にArchitecture解凍  
- Trialを理由にorphan修復を正当化  
- Trialを本番自動売買に接続  

---

## 14. Operation Definition / Baseline / Runtime version

| 文書・版 | いつ触るか | なぜ |
|---|---|---|
| **Op Def 加法リビジョン** | P0承認直後〜Write Discipline実装と並行（別承認PR） | Official定義を運用規範へ落とす。コードより先でも可 |
| **Baseline更新** | Write DisciplineがAcceptance通過した後 | 「確立されたMinimum Runtime」に書込単一化+Detectを反映 |
| **Runtime package 0.1.x** | Write Disciplineは **0.1.2** 程度の加法で十分 | 破壊変更がない |
| **Runtime 0.2.0** | Assisted Loopが実運用で回り、入口契約が固まった後 | 「記録パイプライン接続」が品質の変わり目 |

勝手な更新はしない。それぞれ **承認付き改訂**。

---

## 15. 自動記録ロードマップ（予測）

細Phase名より、状態遷移で示す。

```text
[State 0] 現状
  CLI手動 / Official曖昧 / orphanがverifyを汚染

[State 1] P0 Approved
  定義固定。コード変化なし。

[State 2] Write Discipline Live
  CommitAPI + Verify HISTORY_* + CLI薄化
  → 正式に書ける / 非正式を見つけられる

[State 3] Assisted Recording (narrow)
  設計登録アシスト入口1つ + Confirm + CommitAPI
  （Candidateは必要ならここで最小導入）
  → 「毎回CLIを一から組み立てる」からの脱出（限定領域）

[State 4] Operational Hardening
  Trial観察に基づくConfirm規則・Evidence提案の改善
  必要orphanの選択的再登録
  Op Def/Baselineの承認済み更新
  Searchが痛くなったら導入

[State 5] Controlled Expansion
  入口を慎重に追加（実装完了証跡、検証レポート登録など）
  それでも Decision はHuman Confirm必須
  Runtime 0.2 検討

[State 6] Practical Auto-Recording
  活動→候補把握→情報収集→必要Confirm→Official→Verify
  ただし「全活動の全自動確定」は目指さない
```

---

## 16. Cursor自身の推奨進行

### 16.1 どう進めるか

1. **P0承認を取る**（本予測の前提）  
2. **Write Discipline Slice を一括実装依頼**（次の唯一の実装依頼）  
3. Op Def加法を短PRで承認（定義の文書化）  
4. TrialでOfficial率・findingを観察  
5. **設計登録アシスト**だけAssisted Loopを開始  
6. 安定後に入口を1つずつ追加  
7. Searchは「見つけられない苦痛」が出てから  

### 16.2 なぜその順序か

- 定義なき自動化はorphanを増やす（既に証拠がある）  
- DetectなきCommitAPIは「正式のつもり」を増やす  
- 広い捕捉を先にするとConfirmが破綻する  
- 設計登録入口は既存運用とorphan病因に最も近い  

### 16.3 最終自動化の現実解

```text
現実的な完成形:
  起草・分類・Evidence提案・Commit実行・Verify = 自動化しうる
  Decisionの採否・Architecture的判断 = 人間が残る
  全リポジトリ活動の無確認Official化 = 非推奨（目指さない）
```

---

## 17. リスク

### 17.1 技術的最大リスク

```text
history.append 失敗後に Storage だけ残る
→ 新しいUnofficialの生成経路
```

緩和: Commit順序の厳守、失敗時自動削除をしない（P0）、Detectで可視化、運用で調査。

### 17.2 設計上最大リスク

```text
「自動記録 = 自動決定」への滑落
```

緩和: ConfirmをCommitAPIの外に固定。Decision必須ConfirmをState 5以降も維持。Architecture解凍要求を拒否。

### 17.3 その他

| リスク | 緩和 |
|---|---|
| orphan全件再登録の衝動 | 選択的・必要時のみ |
| Candidate早期肥大 | 2つ目の入口まで遅延可 |
| Search先行 | 件数痛が出てから |
| Baseline早すぎ更新 | Write Discipline Acceptance後 |

---

## 18. 今決めるべきこと / 後で決めてよいこと

### 今決めるべき（P0承認時）

- Official / Unofficial / orphan禁止事項  
- 次実装が Write Discipline Slice であること  
- Candidateを必須化しないこと  
- Architecture非変更  

### 後で決めてよい

- Candidate永続化の物理形式  
- 2つ目以降のCapture対象  
- Searchの実装方式  
- Confirm UIの形態（CLIプロンプト vs 別UI）  
- Runtime 0.2の日付  
- orphanのquarantineディレクトリ要否  

---

## 19. 自動記録完成時の想定運用フロー

```text
活動（例: 設計登録文書の追加）
  ↓
Capture Adapter が変化を検知
  ↓
必要情報を収集（title/type/evidence候補/related候補）
  ↓
（任意）Candidate として保持・編集
  ↓
Human Confirm
  - Decision: 必須
  - 内容・Evidence・関連の最終確認
  ↓
RecordCommitAPI
  ↓
Hash → Storage → History
  ↓
Verify（Official条件の機械確認）
  ↓
Trial/運用ダッシュボードでOfficial率を観察
```

人間が毎回やることから外れるもの:

- hash手計算  
- JSON手書き  
- history手追記  
- UUID手発行  

人間が残すもの:

- 「これを正式判断として残すか」  
- 文言の最終責任  
- 範囲外活動を記録しない判断  

---

## 20. P0承認から自動記録実用化までの予測

| 到達点 | 予測内容 | 依存 |
|---|---|---|
| P0承認直後 | 規範固定。実装ゼロでも方針は使える | Architect承認 |
| 次の実装完了 | Write Discipline Live。新規はOfficial化可能。orphanは命名付きDetect | 実装認可 |
| 初回実用化 | 設計登録アシストで「CLI一から」を一部代替 | Confirm規則 |
| 実用化（狭義） | 週次でAssisted Commitが回り、verifyが運用可能 | Trial安定 |
| 実用化（広義） | 複数入口でもConfirmが壊れない | 段階拡大 |
| 「完成」 | 上記フローが通常経路。手動CLIは例外経路 | 0.2と文書改訂 |

時間見積は環境依存のため日付固定しない。  
順序固定が本質で、カレンダー固定は本質ではない。

---

## 15問への直接回答（索引）

| # | 問い | Cursor回答 |
|---|---|---|
| 1 | 最初に実装すべき機能 | **Write Discipline Slice**（CommitAPI+Verify+CLI） |
| 2 | CommitAPIをどこまで | hash→save→historyの単一入口。起草/Confirm/Dedupは含めない |
| 3 | Verify同時か | **はい（同時一括）** |
| 4 | CLI移行 | 薄クライアント化。廃止しない |
| 5 | Candidate時期 | Assisted Loopで必要になった時。必須先送りしない |
| 6 | 自動記録入口 | CommitAPIの前段Adapter。第一入口は設計登録アシスト |
| 7 | Evidence/Metadata自動化 | 初期は提案まで。確定はConfirm |
| 8 | Human confirmation | Commit前。Decision必須 |
| 9 | 対象範囲 | 最初は設計登録のみ。段階拡大 |
| 10 | Search | 発見コストが痛くなってから |
| 11 | orphan | 今は保持。Detect後に選択的再登録 |
| 12 | Trial | 観察枠。拡大ゲートに使う |
| 13 | Op Def改訂 | P0承認後すぐ方針承認、Write Disciplineと近接 |
| 14 | Baseline更新 | Write Discipline Acceptance後 |
| 15 | Runtime 0.2 | Assisted Loop実用後。Write Disciplineは0.1.x加法 |

---

## Closing — 次の依頼文（再掲）

P0を承認したあと、Cursorへ出す次の依頼はこれ一択でよい。

```text
P0承認済み前提で Write Discipline Slice を実装してください。
RecordCommitAPI + Verify HISTORY_MISSING/RECORD_FILE_MISSING/(推奨)HISTORY_HASH_MISMATCH
+ CLIのCommitAPI移行。
orphan削除・修復・昇格禁止。Candidate/自動捕捉Adapter/Architecture/Baseline/Op Def無断変更/既存Record改変は禁止。
Acceptance: 新規CommitはOfficial、Detectでorphan可視化、Hash/Storage/History仕様不変、既存テスト回帰PASS。
```

それ以外（Candidate設計、入口一覧、Search、orphan一括再登録）は、このSliceが緑になってからで遅くない。
