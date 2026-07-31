# AI編集秘書 Extractor仕様（Phase2C-6：Change分類）

**Version:** **1.1**
**Status:** **Approved（Phase2C-6）**
**Target:** `tools/secretary/extractor_change.py`（または `extractor.py` 内の専用メソッド）

---

# 1. 目的

Phase2C-6では、Phase2C-2 が抽出した

```text
list[AIMessage]
```

を入力とし、

**Change（変更事項・更新内容）を分類する。**

本フェーズは **Change分類のみ** を担当する。

Decision・Idea・Backlog の分類は他フェーズの責務とする。

---

# 2. 責務

```text
list[AIMessage]
      │
      ▼
Change分類（Rule Engine）
      │
      ▼
list[Change]
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
list[Change]
```

を返却する。

Change は **Phase2A Version 1.3** の共通データモデルを使用する。

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

# 7. Rule（Change分類）

## Rule0（最優先）

以下の明示ラベルを含む場合

```text
変更:
Change:
更新:
修正内容:
```

↓

Change

---

## Rule1

以下の変更表現を含む場合

```text
修正する
変更する
更新する
差し替える
書き換える
入れ替える
改訂する
調整する
```

↓

Change

（ただし Rule2 に該当する場合は除外）

---

## Rule2（除外語句：veto）

以下の語句を含む場合

```text
案
候補
可能性
検討
予定
アイデア
```

↓

Change と判定しない

Rule2 は **Change 判定に対する veto** として扱う。

Rule2 に一致した場合は、

Rule1 に一致していても **Change と判定しない。**

---

## Rule3（最終）

上記すべてに一致しない場合

↓

Change と判定しない

---

# 8. Extractor が行うこと

* AIMessage の走査
* Rule Engine による Change 判定
* Change の生成
* `list[Change]` の返却

---

# 9. Extractor が行わないこと

* Decision 判定
* Idea 判定
* Backlog 判定
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

Change が存在しない場合は

```text
[]
```

を返却する。

入力が不正で処理不能な場合のみ例外を送出する。

---

# 11. 実装原則

* 単一責務（Change分類のみ）
* Rule Engine のみ
* AI禁止
* 推測禁止
* AIMessage を変更しない
* ParsedDocument を変更しない
* Phase2A Version 1.3 の Change データモデルのみ生成する
* 他分類（Decision・Idea・Backlog）は行わない

---

# 12. 完了条件

以下をすべて満たすこと。

* `list[AIMessage]` を入力できる
* Change が Rule に従って分類される
* 非Change が除外される
* `list[Change]` が返却される
* AIMessage は変更されない
* Rule Engine のみで実装される
* AI利用が存在しない
* 意味解析が存在しない

---

# 13. 将来拡張方針

Phase2C-6 は **Change分類のみ** を担当する。

Phase2C 系列の最終フェーズであり、

分類フェーズは以下の完全対称構成で完結する。

```text
Phase2C-3  Decision分類
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

* Rule1 から **「修正案」「変更案」** を削除
* Rule2 の **「案」** と競合し、Rule1 が到達不能となる仕様矛盾を解消
* Rule0→Rule2→Rule1→Rule3 の優先順位との整合性を維持
* 判定ロジック・公開インターフェース・データモデル・責務は変更なし

---

# Version 1.0

* Change分類専用フェーズを定義
* 入力を `list[AIMessage]` に統一
* 出力を `list[Change]` に統一
* Rule Engine のみで分類する構成を採用
* 明示的な変更表現のみを Change と判定し、曖昧な表現は分類対象外とした
* Rule2 を **Change 判定に対する veto** として定義し、Idea表現との競合時の優先順位を明文化
* Phase2C-3〜Phase2C-6 と完全対称となる構成を採用

---
