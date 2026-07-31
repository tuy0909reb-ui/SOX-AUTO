### AI編集秘書 Extractor仕様（Phase2C-4：Idea分類）

**Version:** 1.1
**Status:** Approved（Phase2C-4）
**Target:** `tools/secretary/extractor_idea.py`（または `extractor.py` 内の専用メソッド）

---

# 1. 目的

Phase2C-4では、Phase2C-2 が抽出した

```text
list[AIMessage]
```

を入力とし、

**Idea（アイデア）を分類する。**

本フェーズは **Idea分類のみ** を担当する。

Decision・Backlog・Change の分類は後続フェーズ（Phase2C-5〜Phase2C-6）の責務とする。

---

# 2. 責務

Extractor は以下までを担当する。

```text
list[AIMessage]
      │
      ▼
Idea分類（Rule Engine）
      │
      ▼
list[Idea]
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
list[Idea]
```

を返却する。

Idea は **Phase2A Version 1.3** の共通データモデルを使用する。

---

# 5. 判定対象

判定対象は

```text
AIMessage.content
```

のみ。

role は補助情報として参照可能。

content の意味解析は行わない。

---

# 6. 判定方法

Rule Engine のみ使用する。

AI利用禁止。

自然言語推測禁止。

高度な意味解析禁止。

---

# 7. Rule（Idea分類）

適用順序

```text
Rule0
↓
Rule2（veto）
↓
Rule1
↓
Rule3
```

Rule の優先順位は

```text
Rule0 → Rule2 → Rule1 → Rule3
```

で実装する。

---

## Rule0（最優先）

以下の明示ラベルを含む場合

```text
アイデア:
Idea:
提案:
```

↓

Idea

---

## Rule2（除外語句：veto）

以下の語句を含む場合

```text
決定
決定事項
確定
採用する
実施する
```

↓

Idea と判定しない

Rule2 は Idea 判定に対する veto として扱う。

Rule2 に一致した場合は、
Rule1 に一致していても
Idea と判定しない。

---

## Rule1

以下のアイデア表現を含む場合

```text
〜してはどうか
〜できるかもしれない
〜という案がある
〜の可能性がある
〜を検討したい
〜を考えている
```

↓

Idea

（ただし Rule2 に該当する場合は除外）

---

## Rule3（最終）

上記すべてに一致しない場合

↓

Idea と判定しない

---

# 8. Extractor が行うこと

* AIMessage の走査
* Rule Engine による Idea 判定
* Idea の生成
* `list[Idea]` の返却

---

# 9. Extractor が行わないこと

* Decision 判定
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

Idea が存在しない場合は

```text
[]
```

を返却する。

入力が不正で処理不能な場合のみ例外を送出する。

---

# 11. 実装原則

* 単一責務（Idea分類のみ）
* Rule Engine のみ
* AI禁止
* 推測禁止
* AIMessage を変更しない
* ParsedDocument を変更しない
* Phase2A Version 1.3 の Idea データモデルのみ生成する
* 他分類（Decision・Backlog・Change）は行わない

---

# 12. 完了条件

以下をすべて満たすこと。

* `list[AIMessage]` を入力できる
* Idea が Rule に従って分類される
* 非Idea が除外される
* `list[Idea]` が返却される
* AIMessage は変更されない
* Rule Engine のみで実装される
* AI利用が存在しない
* 意味解析が存在しない

---

# 13. 将来拡張方針

Phase2C-4 は **Idea分類のみ** を担当する。

後続フェーズでは同一構成で分類を行う。

```text
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

* Rule適用順序を明文化
* Rule2 を Idea 判定に対する veto と定義
* 実装との整合性を取るため仕様を更新

# Version 1.0

* Idea分類専用フェーズを定義
* 入力を `list[AIMessage]` に統一
* 出力を `list[Idea]` に統一
* Rule Engine のみで分類する構成を採用
* 明示的なアイデア表現のみを Idea と判定し、曖昧な表現は分類対象外とした
* Rule2 を **Idea 判定に対する veto** として定義し、Decision表現との競合時の優先順位を明文化
* Phase2C-3〜Phase2C-6 と完全対称となる構成を採用

---
