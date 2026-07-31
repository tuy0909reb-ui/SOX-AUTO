# AI編集秘書 Writer仕様（Phase3-0：Writer Core）

**Version:** 1.0  
**Status:** Approved（Phase3-0）  
**Target:** `tools/secretary/models/writer_output.py`（仮）

---

# 1. 目的

Phase3-0では、Writerフェーズの基盤となる **出力モデル（Writer Core）** を定義する。

本フェーズは、Phase2Dで生成された `ExtractResult` を後続の Writer統合（Phase3-1）および Output接続（Phase3-2）で利用するための **出力データ構造** を提供する。

Writer Core は **データモデル定義のみ** を担当し、変換処理・生成処理・出力処理は行わない。

---

# 2. 責務

```text
ExtractResult
      │
      ▼
Writer Core（出力モデル）
      │
      ▼
Writer（Phase3-1）
      │
      ▼
Output接続（Phase3-2）
```

Writer Core の責務は以下に限定する。

* Writerフェーズで使用する出力モデルの定義
* ExtractResultを保持可能な出力構造の提供
* Writer統合（Phase3-1）で利用されるデータ型の提供

Writer Core は **変換・生成・加工を一切行わない。**

---

# 3. 入力

Writer Coreは入力処理を持たない。

Phase3-0ではモデル定義のみを担当し、`ExtractResult` から `WriterOutput` を生成する処理は Phase3-1 の責務とする。

---

# 4. 出力モデル定義

## 4.1 WriterOutputモデル

Writer Coreでは `WriterOutput` を定義する。

```python
@dataclass
class WriterOutput:
    decisions: list[Decision]
    ideas: list[Idea]
    backlogs: list[Backlog]
    changes: list[Change]
```

## 目的

* Phase2D-0 `ExtractResult` と対応した出力保持構造を提供する
* Writer統合後の成果物生成前段階のデータモデルとして利用する
* 元分類モデルの情報を保持する

---

# 5. ExtractResultとの関係

Phase2D-0で定義された：

```python
@dataclass
class ExtractResult:
    decisions: list[Decision]
    ideas: list[Idea]
    backlogs: list[Backlog]
    changes: list[Change]
```

と対応する。

Phase3-0では以下を行わない。

* 文字列化
* Markdown化
* 要約
* 情報削除
* データ変換

ExtractResultの内容保持を優先する。

---

# 6. Writer Coreが行うこと

* WriterOutputモデルの定義
* Decision / Idea / Backlog / Change保持構造の提供
* Phase3-1で利用可能な型定義の提供

以上のみ。

---

# 7. Writer Coreが行わないこと（禁止）

以下は禁止する。

* Rule判定
* 分類処理
* AI利用
* 要約
* 優先順位決定
* 抽出処理
* Document解析
* ExtractResult加工
* ExtractResult変換
* Markdown生成
* ファイル出力
* Document更新
* 外部サービス連携
* Writer統合処理
* Output接続処理

Writer Core は **データモデル定義のみ** を担当する。

---

# 8. エラー方針

* Writer Coreは処理を持たないため独自例外を定義しない
* モデル生成時のエラーは標準Python例外または利用モデル側の例外に従う

---

# 9. 完了条件

以下を満たすこと。

* [x] WriterOutputモデルが定義されている
* [x] ExtractResultの分類結果を保持できる
* [x] Decision / Idea / Backlog / Changeの型情報を保持する
* [x] 変換処理を持たない
* [x] 生成処理を持たない
* [x] Output処理を持たない
* [x] Phase2D-0 / Phase2D-1 / Phase2D-2 と整合している

---

# 10. 将来拡張方針

* Phase3-1 Writer統合で ExtractResult から WriterOutput を生成する処理を実装する
* Phase3-2 Output接続で Markdown生成・ファイル出力・Document更新を実装する
* WriterOutputの保持項目追加は後続フェーズで判断する
* 出力形式ごとのモデルはOutput層で定義する

---

# Version 1.0（Approved）

* Writerフェーズの基盤モデルを定義
* ExtractResultを保持するWriterOutput構造を採用
* 文字列化・Markdown化を後続フェーズへ分離
* Phase3-1 / Phase3-2 の基盤となる構造を確立
* 単一責務（モデル定義のみ）を維持する設計を採用
