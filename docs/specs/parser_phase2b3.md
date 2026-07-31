# AI編集秘書 Parser仕様（Phase2B-3）

**Version:** 1.0
**Status:** Approved（Phase2B-3）
**Target:** `tools/secretary/parser.py`

---

# 1. 目的

Phase2B-3では、Parser が `Document` をもとに `AIMessage` 一覧を生成し、`ParsedDocument` を完成させる。

Parser は入力データを共通データモデルへ変換する責務のみを持つ。

意味解析・業務ロジック・AI利用は一切行わない。

---

# 2. 責務

Parser は以下までを担当する。

```text
入力
    ↓
Document
    ↓
AIMessage[]
    ↓
ParsedDocument
```

Parser の責務はここまでとする。

---

# 3. 入力

Phase2B-2と同一。

対応入力

* UTF-8 で保存された Markdown（`.md`）

入力形式の追加は本フェーズでは行わない。

---

# 4. 出力

Parser は `ParsedDocument` を返す。

構造

```text
ParsedDocument

├── document
└── messages
```

`messages` は `AIMessage` の配列とする。

---

# 5. AIMessage生成

Parser は `Document.body` を機械的に分割し、`AIMessage` を生成する。

Parser は分割のみを担当する。

意味の解釈は行わない。

---

## 分割方針

本フェーズでは分割アルゴリズムを固定しない。

入力形式ごとに最も単純な方法で分割してよい。

ただし、

* 意味解析
* Markdown構文解析
* 見出し解析
* コードブロック解析

は行わない。

---

# 6. AIMessage生成項目

各 AIMessage は以下を保持する。

* id
* role
* content
* metadata

---

## id

Parser が生成する。

生成方式は任意。

一意性のみ保証する。

---

## role

本フェーズでは

```text
UNKNOWN
```

固定とする。

Human / Assistant / System の判定は行わない。

---

## content

Parser が分割した本文を加工せず保持する。

内容の補正・要約・整形は行わない。

---

## metadata

最低限

* message_index

を保持する。

将来

* line_start
* line_end
* raw_header

などを追加できる構造とする。

---

# 7. Parserが行うこと

* Document.body の分割
* AIMessage生成
* message_index付与
* ParsedDocument完成

---

# 8. Parserが行わないこと

* Human判定
* Assistant判定
* System判定
* Markdown解析
* 見出し解析
* コードブロック解析
* ノイズ除去
* Decision生成
* Idea生成
* Backlog生成
* Change生成
* 要約
* AI利用
* GitHub連携
* Discord連携
* Notion連携
* Git操作
* ファイル更新

---

# 9. エラー方針

Parser は可能な限り停止しない。

AIMessage の生成が困難な箇所は

```text
metadata
```

へ保持する。

ParsedDocument を生成できない場合のみ例外を送出する。

---

# 10. 実装原則

* 単一責務（Single Responsibility）を維持する。
* Parser は入力を共通データへ変換する責務のみを持つ。
* 業務ロジックを持たない。
* AIを利用しない。
* 外部サービスへアクセスしない。
* 入力内容を加工しない。
* 分割以外の意味解釈を行わない。

---

# 11. 完了条件

以下をすべて満たした場合、本フェーズは完了とする。

* Document.body から AIMessage が生成される。
* AIMessage.id を Parser が生成している。
* AIMessage.role は `UNKNOWN` 固定である。
* AIMessage.content は未加工で保持される。
* message_index が metadata に保持される。
* ParsedDocument.messages に AIMessage 一覧が格納される。
* Document の内容は変更されない。
* Parser に業務ロジックが存在しない。
* Phase2B-3 の責務を超える処理が存在しない。

---

# 12. 将来拡張方針

Human / Assistant / System の判定は将来フェーズで実装する。

Markdown 構造（見出し・コードブロック・表・引用など）の解析も将来フェーズの対象とする。

Parser は入力データを共通データモデルへ変換する責務を維持し、意味解析は後続モジュールへ委譲する。

---

## Version 1.0

* `Document.body` から `AIMessage` を生成する仕様を追加。
* `AIMessage.role` は `UNKNOWN` 固定とした。
* Parser は機械的な分割のみを担当し、意味解析を行わないことを明文化。
* `message_index` を `metadata` の必須項目として定義。
* Parser の責務と後続モジュールの責務を明確に分離。
