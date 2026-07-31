# AI編集秘書 Extractor仕様（Phase2C-1）

**Version:** 1.1
**Status:** Approved（Phase2C-1）
**Target:** `tools/secretary/extractor.py`

---

# 1. 目的

Phase2C-1では、`ParsedDocument` に含まれる `AIMessage` の **role** を判定し付与する。

Extractor は **役割判定のみ** を担当する。

Decision・Idea・Backlog・Change などの業務上の意味解析は行わない。

---

# 2. 責務

```text
ParsedDocument
      │
      ▼
AIMessage.role 判定
      │
      ▼
更新済み ParsedDocument
```

`Document` の内容は変更しない。

### 公開インターフェース

```python
Extractor.assign_roles(
    parsed: ParsedDocument,
) -> ParsedDocument
```

---

# 3. 入力

入力は Phase2B-3 が生成した

```text
ParsedDocument
```

とする。

前提条件

* `document` が存在する
* `messages` が存在する
* `messages[*].role` が設定されている

---

# 4. 出力

返却値は

```text
ParsedDocument
```

とする。

更新対象は

```text
AIMessage.role
```

のみとする。

Document および AIMessage のその他のフィールドは変更しない。

---

# 5. role

利用できる値は以下とする。

```text
UNKNOWN
HUMAN
ASSISTANT
SYSTEM
```

---

# 6. 判定方法

Extractor は **Rule-based** のみで判定を行う。

AIによる推論・意味解析・自然言語推測は行わない。

---

# 7. 判定優先順位

Rule は**上から順に評価**する。

最初に一致した Rule を採用し、それ以降の Rule は評価しない。

---

# 8. Rule一覧

## Rule0（最優先）

`AIMessage.role` が

```text
UNKNOWN
```

以外である場合は変更しない。

再実行時も既存の判定結果を保持する。

---

## Rule1

`AIMessage.metadata.role_hint`

が存在する場合はその値を採用する。

---

## Rule2

判定対象は **AIMessage.content の先頭文字列** とする。

metadata は Rule1 のみ参照し、Rule2〜Rule4では利用しない。

以下のような Human を示す明示ラベルを検出した場合

```text
User:
ユーザー:
Human:
```

↓

```text
HUMAN
```

---

## Rule3

判定対象は **AIMessage.content の先頭文字列** とする。

以下のような Assistant を示す既知の識別子を検出した場合

```text
ChatGPT:
Gemini:
Claude:
Cursor:
Copilot:
Assistant:
```

↓

```text
ASSISTANT
```

上記は**初期実装例**である。

対応する識別子は将来追加可能とする。

---

## Rule4

判定対象は **AIMessage.content の先頭文字列** とする。

以下を検出した場合

```text
System:
SYSTEM:
```

↓

```text
SYSTEM
```

---

## Rule5

上記すべてに一致しない場合

```text
UNKNOWN
```

を維持する。

---

# 9. Extractor が行うこと

* Rule-based による role 判定
* role の更新
* 判定不能時は UNKNOWN を維持する

---

# 10. Extractor が行わないこと

* Decision 抽出
* Idea 抽出
* Backlog 抽出
* Change 抽出
* 要約
* Markdown解析
* Markdown構造解析
* AI利用
* GitHub連携
* Discord連携
* Notion連携
* Git操作
* ファイル更新

---

# 11. エラー方針

判定不能はエラーとしない。

判定できない場合は

```text
UNKNOWN
```

を維持する。

`ParsedDocument` を返却できない場合のみ例外を送出する。

---

# 12. 実装原則

* 単一責務（Single Responsibility）を維持する
* Rule Engine のみを使用する
* AI を利用しない
* 推測を行わない
* Document を変更しない
* content を変更しない
* role 以外のフィールドを変更しない
* 外部サービスへアクセスしない
* 業務ロジックを持たない

---

# 13. 完了条件

以下をすべて満たした場合、本フェーズは完了とする。

* `ParsedDocument` を入力できる
* `AIMessage.role` を更新できる
* 判定不能時は `UNKNOWN` を維持する
* Rule0 により既存判定を上書きしない
* `Document` を変更しない
* `AIMessage.content` を変更しない
* `AIMessage.metadata` を変更しない（role_hint の参照のみ）
* AI を利用しない
* Phase2C-1 の責務を超える処理が存在しない

---

# 14. 将来拡張方針

将来的に

```text
AIMessage.agent
```

を追加する可能性がある。

例

```text
role = ASSISTANT
agent = ChatGPT

role = ASSISTANT
agent = Gemini

role = ASSISTANT
agent = Claude

role = ASSISTANT
agent = Cursor
```

Phase2C-1では **agent は実装しない**。

role のみを扱う。

また、

**role と agent は独立した属性**であり、互いの値に依存してはならない。

agent の判定および管理は将来フェーズの責務とする。

---

## Version 1.1

・公開インターフェースを
  Extractor.extract()
  から
  Extractor.assign_roles()
  へ変更。

・Phase2C-2 の Extractor.extract() と責務を明確に分離。

・role判定専用メソッドであることを明確化。

## Version 1.0

* AIMessage.role の Rule-based 判定を追加
* 判定順序を明文化
* Rule0（既存判定を保持）を追加
* AIMessage.metadata.role_hint の優先利用を定義
* Rule による Human / Assistant / System 判定を定義
* Rule2〜Rule4 の判定対象を **AIMessage.content の先頭文字列** と明記
* Rule3 の識別子一覧は**初期実装例**であり将来追加可能であることを明記
* 判定不能時は UNKNOWN を維持することを明文化
* role と agent の責務分離を定義
* 将来の agent 拡張方針を追加
