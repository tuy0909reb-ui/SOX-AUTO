# AI編集秘書 Extractor仕様（Phase2C-2）

**Version:** 1.0
**Status:** Approved（Phase2C-2）

---

# 1. 目的

Phase2C-2では、`ParsedDocument` に含まれる `AIMessage` を走査し、

**業務抽出の対象となる AIMessage を選別する。**

このフェーズでは **分類は行わない。**

Decision / Idea / Backlog / Change の判定は後続フェーズ（Phase2C-3〜Phase2C-6）の責務とする。

---

# 2. 責務

Extractor は以下までを担当する。

```text
ParsedDocument
      │
      ▼
抽出対象選別（HUMAN / ASSISTANT）
      │
      ▼
list[AIMessage]
```

`ParsedDocument` の内容は変更しない。

---

# 3. 入力

Phase2C-1 が生成した

```text
ParsedDocument
```

前提条件

* `document` が存在する
* `messages` が存在する
* `messages[*].role` が判定済みである

  * UNKNOWN
  * HUMAN
  * ASSISTANT
  * SYSTEM

---

# 4. 出力

Extractor は

```text
list[AIMessage]
```

を返す。

返却される AIMessage は **ParsedDocument.messages の参照**とし、新たなデータモデルは生成しない。

返却対象は

* HUMAN
* ASSISTANT

のみとする。

---

# 5. 判定対象

判定対象は

```text
AIMessage.role
```

のみ。

content・Document・metadata の内容による意味解析は行わない。

---

# 6. 判定方法

Rule Engine のみ使用する。

AI利用禁止。

自然言語推測禁止。

意味解析禁止。

---

# 7. Rule（抽出対象選別）

## Rule0

```text
role == HUMAN
```

↓

抽出対象

---

## Rule1

```text
role == ASSISTANT
```

↓

抽出対象

---

## Rule2

```text
role == UNKNOWN
```

↓

抽出しない

---

## Rule3

```text
role == SYSTEM
```

↓

抽出しない

---

# 8. Extractor が行うこと

* AIMessage の走査
* role による抽出対象選別
* HUMAN の抽出
* ASSISTANT の抽出
* 抽出対象 AIMessage の参照一覧を返却する

---

# 9. Extractor が行わないこと

* Decision 判定
* Idea 判定
* Backlog 判定
* Change 判定
* role 更新
* content の加工
* metadata の加工
* Document の変更
* ParsedDocument の変更
* AI利用
* 要約
* agent 判定
* 外部サービス連携

---

# 10. エラー方針

判定不能はエラーとしない。

抽出対象が存在しない場合は

```text
[]
```

を返却する。

**ParsedDocument が公開インターフェースの契約を満たさない場合のみ例外を送出する。**

---

# 11. 実装原則

* 単一責務（抽出対象の選別のみ）
* Rule Engine のみ
* AI禁止
* 推測禁止
* ParsedDocument を変更しない
* AIMessage を変更しない
* 新しいデータモデルを作成しない
* 共通データモデル（AIMessage）をそのまま利用する

---

# 12. 完了条件

以下をすべて満たすこと。

* HUMAN の AIMessage が抽出される
* ASSISTANT の AIMessage が抽出される
* UNKNOWN は除外される
* SYSTEM は除外される
* list[AIMessage] が返却される
* ParsedDocument は変更されない
* AIMessage は変更されない
* Rule Engine のみで実装される
* AI利用が存在しない
* 意味解析が存在しない
* 新しいデータモデルを生成していない

---

# 13. 将来拡張方針

Phase2C-2 は **抽出対象の選別のみ** を担当する。

分類は後続フェーズへ委譲する。

```text
Phase2C-3  Decision分類
Phase2C-4  Idea分類
Phase2C-5  Backlog分類
Phase2C-6  Change分類
```

将来的に

```text
AIMessage.agent
```

が追加された場合でも、

Phase2C-2 の責務は変更しない。

抽出対象の選別のみを担当する。

---

# Version 1.0

* HUMAN / ASSISTANT の AIMessage を抽出対象として選別する仕様を定義。
* 出力を `list[AIMessage]` に統一。
* `ExtractResult` / `ExtractCandidate` は採用しない。
* 共通データモデル（AIMessage）をそのまま利用する設計とした。
* 分類は後続フェーズへ委譲し、本フェーズでは抽出対象の選別のみを担当する。
