# AI編集秘書 Writer仕様（Phase3-1：Writer統合）

**Version:** 1.0  
**Status:** Approved（Phase3-1）  
**Target:** `tools/secretary/writer.py`（仮）

---

# 1. 目的

Phase3-1では、Phase2Dで生成された `ExtractResult` を  
Phase3-0で定義された `WriterOutput` へ接続する **Writer統合処理** を定義する。

本フェーズは Writerフェーズの最初の処理層として、  
**入力データの受け取りと出力モデル生成のみ** を担当する。

Markdown生成、ファイル出力、Document更新などの Output処理は  
**Phase3-2 の責務**とする。

---

# 2. 責務

```text
ExtractResult
      │
      ▼
Writer統合（Phase3-1）
      │
      ▼
WriterOutput
      │
      ▼
Output接続（Phase3-2）
```

Phase3-1 の責務は以下に限定する。

* ExtractResult を受け取る
* WriterOutput を生成する
* WriterOutput を返却する

以上のみ。

---

# 3. 入力

```python
ExtractResult
```

前提条件：

* Phase2D-0 で定義されたモデルであること
* `decisions` / `ideas` / `backlogs` / `changes` を保持していること
* 内容は変更されていないこと
* 加工・要約・情報削除が行われていないこと

---

# 4. 出力

```python
WriterOutput
```

Phase3-0 で定義されたモデルを使用する。

---

# 5. 公開インターフェース

```python
Writer.write(
    result: ExtractResult,
) -> WriterOutput
```

Writerフェーズの統合処理として公開する唯一のインターフェースとする。

---

# 6. Writer統合が行うこと

Writer統合は以下の処理のみを行う。

* ExtractResult を受け取る
* WriterOutput を生成する
* 各フィールドを対応付ける

対応関係：

```text
ExtractResult.decisions
        ↓
WriterOutput.decisions

ExtractResult.ideas
        ↓
WriterOutput.ideas

ExtractResult.backlogs
        ↓
WriterOutput.backlogs

ExtractResult.changes
        ↓
WriterOutput.changes
```

データ内容の変更・加工・要約は行わない。

---

# 7. Writer統合が行わないこと（禁止）

以下は禁止する。

* Rule判定
* 分類処理
* AI利用
* 要約
* 情報削除
* 優先順位付け
* 重複排除
* Markdown生成
* ファイル出力
* Document更新
* 外部サービス連携
* Output接続処理
* ExtractResult構造変更
* WriterOutput構造変更
* WriterOutput内容の加工
* WriterOutput内容の再解釈

Writer統合は **単純な対応付けとモデル生成のみ** を担当する。

---

# 8. エラー方針

* 入力された ExtractResult が処理不能な場合のみ例外とする
* 独自例外処理は追加しない
* 内容変更を伴う補正処理は禁止
* 例外伝播は既存方針に従う

---

# 9. 完了条件

以下を満たすこと。

* [x] ExtractResult を入力できる
* [x] WriterOutput を生成できる
* [x] 各フィールドが正しく対応付けられる
* [x] データ内容を変更しない
* [x] Markdown生成を行わない
* [x] Output処理を行わない
* [x] Phase3-0 仕様と整合している

---

# 10. 将来拡張方針

* Phase3-2 で WriterOutput から成果物生成を行う
* Markdownテンプレート処理は Output層で扱う
* WriterOutput の保持項目追加は必要時のみ実施する
* Writer統合は常に「対応付けとモデル生成」を維持する

---

# Version 1.0（Approved）

* Writer統合フェーズを正式定義
* ExtractResult から WriterOutput を生成する接続処理を確立
* Output処理を Phase3-2 へ分離
* 単一責務設計を維持
* Phase2D 系列と完全対称の構造を採用
