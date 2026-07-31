# AI編集秘書 Extractor仕様（Phase2C-5：Backlog分類）

**Version:** 1.0
**Status:** **Approved（Phase2C-5）**
**Target:** `tools/secretary/extractor_backlog.py`（または `extractor.py` 内の専用メソッド）

---

## 1. 目的

Phase2C-5では、Phase2C-2 が抽出した

```text
list[AIMessage]
```

を入力とし、

**Backlog（未実施タスク・TODO）を分類する。**

本フェーズは **Backlog分類のみ** を担当する。

Decision・Idea・Change の分類は他フェーズの責務とする。

---

## 2. 責務

```text
list[AIMessage]
      │
      ▼
Backlog分類（Rule Engine）
      │
      ▼
list[Backlog]
```

AIMessage は変更しない。

---

## 3. 入力

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

## 4. 出力

```text
list[Backlog]
```

Backlog は **Phase2A Version 1.3** の共通データモデルを使用する。

---

## 5. 判定対象

判定対象は

```text
AIMessage.content
```

のみ。

role は補助情報として参照可能。

content の意味解析は行わない。

---

## 6. 判定方法

* Rule Engine のみ使用
* AI利用禁止
* 自然言語推測禁止
* 高度な意味解析禁止

---

## 7. Rule（Backlog分類）

### Rule0（最優先）

以下の明示ラベルを含む場合

```text
Backlog:
TODO:
タスク:
```

↓

Backlog

---

### Rule1

以下の未実施・TODO表現を含む場合

```text
やる
対応する
実装する
追加する
修正する
作成する
確認する
調査する
対応予定
TODO
```

↓

Backlog

（ただし Rule2 に該当する場合は除外）

---

### Rule2（除外語句：veto）

以下の語句を含む場合

```text
完了
対応済み
実施済み
決定
決定事項
確定
```

↓

Backlog と判定しない。

Rule2 は **Backlog 判定に対する veto** として扱う。

Rule2 に一致した場合は Rule1 に一致していても Backlog と判定しない。

---

### Rule3（最終）

上記すべてに一致しない場合

↓

Backlog と判定しない。

---

## 8. Extractor が行うこと

* AIMessage の走査
* Rule Engine による Backlog 判定
* Backlog の生成
* `list[Backlog]` の返却

---

## 9. Extractor が行わないこと

* Decision 判定
* Idea 判定
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

## 10. エラー方針

Backlog が存在しない場合は

```text
[]
```

を返却する。

入力が不正で処理不能な場合のみ例外を送出する。

---

## 11. 実装原則

* 単一責務（Backlog分類のみ）
* Rule Engine のみ
* AI禁止
* 推測禁止
* AIMessage を変更しない
* ParsedDocument を変更しない
* Phase2A Version 1.3 の Backlog データモデルのみ生成
* 他分類は行わない

---

## 12. 完了条件

* `list[AIMessage]` を入力できる
* Backlog が Rule に従って分類される
* 非Backlog が除外される
* `list[Backlog]` が返却される
* AIMessage は変更されない
* Rule Engine のみで実装される
* AI利用が存在しない
* 意味解析が存在しない

---

## 13. 将来拡張方針

Phase2C-5 は **Backlog分類のみ** を担当する。

後続フェーズ

```text
Phase2C-6  Change分類
```

各フェーズは

```text
list[AIMessage]
```

↓

```text
list[○○]
```

を返却する共通構成とする。

将来的に

```text
AIMessage.agent
```

が追加されても責務は変更しない。

---

## Version 1.0

* Backlog分類専用フェーズを定義
* 入力を `list[AIMessage]`
* 出力を `list[Backlog]`
* Rule Engine のみ採用
* Rule2 を **veto** として定義
* Phase2C-3〜2C-6 と完全対称構成
