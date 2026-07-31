# AI編集秘書 Extractor仕様（Phase2C-3：Decision分類）

**Version:** 1.1
**Status:** Approved（Phase2C-3）
**Target:** `tools/secretary/extractor_decision.py`（または `extractor.py` 内の専用メソッド）

---

# 1. 目的

Phase2C-3では、Phase2C-2 が抽出した

```text
list[AIMessage]
```

を入力とし、

**Decision（決定事項）を分類する。**

本フェーズは **Decision の分類のみ** を担当する。

Idea・Backlog・Change の分類は後続フェーズ（Phase2C-4〜Phase2C-6）の責務とする。

---

# 2. 責務

Extractor は以下までを担当する。

```text
list[AIMessage]
      │
      ▼
Decision分類（Rule Engine）
      │
      ▼
list[Decision]
```

AIMessage は変更しない。

---

# 3. 入力

Phase2C-2 が返却した

```text
list[AIMessage]
```

前提条件

* role は HUMAN または ASSISTANT
* content は未加工
* metadata は未加工
* ParsedDocument は参照しない
* Document は参照しない

---

# 4. 出力

Extractor は

```text
list[Decision]
```

を返却する。

Decision は Phase2A Version 1.3 の共通データモデルを使用する。

---

# 5. 判定対象

判定対象は

```text
AIMessage.content
```

のみ。

role は補助情報として参照可能である。

content の意味解析は行わない。

---

# 6. 判定方法

Rule Engine のみ使用する。

AI利用禁止。

自然言語推測禁止。

高度な意味解析禁止。

---

# 7. Rule（Decision分類）

適用順序

```text
Rule0（明示ラベル）

↓

Rule2（除外語句）

↓

Rule1（断定表現）

↓

Rule3（非Decision）
```

---

## Rule0（最優先）

以下の明示ラベルを含む場合

```text
決定:
決定事項:
Decision:
```

↓

Decision

---

## Rule2

以下の除外語句を含む場合

```text
検討
予定
案
候補
可能性
アイデア
```

↓

Decision と判定しない

Rule2 は Decision 判定に対する除外（veto）として扱う。

Rule2 に一致した場合は、
Rule1 に一致していても Decision と判定しない。

---

## Rule1

以下の断定表現を含む場合

```text
〜とする
〜に決定する
〜を採用する
〜を実施する
```

↓

Decision

---

## Rule3（最終）

上記すべてに一致しない場合

↓

Decision と判定しない

---

Rule が競合する場合は、
Rule2（除外語句）を Rule1（断定表現）より優先する。

これは日本語の否定表現や候補表現による誤判定を防止するためである。

---

# 8. Extractor が行うこと

* AIMessage の走査
* Rule Engine による Decision 判定
* Decision の生成
* list[Decision] の返却

---

# 9. Extractor が行わないこと

* Idea 判定
* Backlog 判定
* Change 判定
* role 更新
* AIMessage の変更
* ParsedDocument の変更
* content の加工
* metadata の加工
* AI利用
* 要約
* agent 判定
* Markdown解析
* 外部サービス連携

---

# 10. エラー方針

判定不能はエラーとしない。

Decision が存在しない場合は

```text
[]
```

を返却する。

入力が不正で処理不能な場合のみ例外を送出する。

---

# 11. 実装原則

* 単一責務（Decision分類のみ）
* Rule Engine のみ
* AI禁止
* 推測禁止
* AIMessage を変更しない
* ParsedDocument を変更しない
* Phase2A の Decision データモデルのみ生成する
* 他分類（Idea・Backlog・Change）は行わない

---

# 12. 完了条件

以下をすべて満たすこと。

* list[AIMessage] を入力できる
* Decision が Rule に従って分類される
* 非Decision が除外される
* list[Decision] が返却される
* AIMessage は変更されない
* Rule Engine のみで実装される
* AI利用が存在しない
* 意味解析が存在しない

---

# 13. 将来拡張方針

Phase2C-3 は **Decision分類のみ** を担当する。

後続フェーズでは同一構成で分類を行う。

```text
Phase2C-4  Idea分類
Phase2C-5  Backlog分類
Phase2C-6  Change分類
```

各フェーズは

```text
list[AIMessage]
```

を入力とし、

```text
list[○○]
```

を返却する共通構成とする。

将来的に

```text
AIMessage.agent
```

が追加された場合でも、本フェーズの責務は変更しない。

---

# Version 1.1

・Rule2（除外語句）を Rule1 より優先することを明文化
・Rule2 を Decision 判定に対する veto と定義
・日本語の否定表現・候補表現による誤判定防止ルールを追加
・その他の責務・公開インターフェース・データモデルは変更なし

# Version 1.0

* Decision分類専用フェーズを定義
* 入力を `list[AIMessage]` に統一
* 出力を `list[Decision]` に統一
* Rule Engine のみで分類する構成を採用
* 明示的な決定表現のみを Decision と判定し、曖昧な表現は分類対象外とした
* Phase2C-4〜Phase2C-6 と完全対称となる構成を採用

この形であれば、Idea・Backlog・Change もテンプレートをほぼ流用でき、4つの分類フェーズが同じ責務・同じインターフェースで統一されます。
