# AI編集秘書 データモデル仕様書

## Version 1.3

**Status:** Approved（Phase2A）

---

# 1. 目的

AI編集秘書で利用する共通データモデルを定義する。

本仕様書は各モジュール間で受け渡されるデータ構造を規定するものであり、データモデル自身は業務ロジックを持たない。

Version 1.3では、Phase2C以降で利用する業務データモデルを追加する。

---

# 2. 設計原則

すべてのデータモデルは以下の原則に従う。

* 単一責務（Single Responsibility）
* 共通データモデルとして利用する
* 業務ロジックを持たない
* AIを利用しない
* 外部サービスへアクセスしない
* 判定・要約・更新処理を持たない

---

# 3. Document

（Version 1.2から変更なし）

```text
Document
├── id
├── source
├── title
├── body
└── metadata
```

---

# 4. AIMessage

（Version 1.2から変更なし）

```text
AIMessage
├── id
├── document_id
├── role
├── speaker
├── timestamp
├── content
└── metadata
```

role

```text
UNKNOWN
HUMAN
ASSISTANT
SYSTEM
```

---

# 5. 共通業務データモデル

Version 1.3より以下の共通データモデルを追加する。

```text
Decision
Idea
Backlog
Change
```

各データモデルは共通構造を持つ。

---

# 5.1 Decision

```text
Decision
├── id
├── document_id
├── message_id
├── content
└── metadata
```

| フィールド       | 内容                      |
| ----------- | ----------------------- |
| id          | 一意ID                    |
| document_id | 元Document.id            |
| message_id  | 元AIMessage.id           |
| content     | Decisionとして分類された本文（未加工） |
| metadata    | 補助情報                    |

---

# 5.2 Idea

```text
Idea
├── id
├── document_id
├── message_id
├── content
└── metadata
```

| フィールド       | 内容                  |
| ----------- | ------------------- |
| id          | 一意ID                |
| document_id | 元Document.id        |
| message_id  | 元AIMessage.id       |
| content     | Ideaとして分類された本文（未加工） |
| metadata    | 補助情報                |

---

# 5.3 Backlog

```text
Backlog
├── id
├── document_id
├── message_id
├── content
└── metadata
```

| フィールド       | 内容                     |
| ----------- | ---------------------- |
| id          | 一意ID                   |
| document_id | 元Document.id           |
| message_id  | 元AIMessage.id          |
| content     | Backlogとして分類された本文（未加工） |
| metadata    | 補助情報                   |

---

# 5.4 Change

```text
Change
├── id
├── document_id
├── message_id
├── content
└── metadata
```

| フィールド       | 内容                    |
| ----------- | --------------------- |
| id          | 一意ID                  |
| document_id | 元Document.id          |
| message_id  | 元AIMessage.id         |
| content     | Changeとして分類された本文（未加工） |
| metadata    | 補助情報                  |

---

# 6. metadata

業務データモデルの metadata は入力固有の補助情報を保持する辞書とする。

Version 1.3では内容を固定しない。

最低限

```text
metadata = {}
```

として利用できることを保証する。

後続フェーズで必要な項目を追加できる構造とする。

---

# 7. データモデル責務

Document

* 入力データ全体を保持する。

AIMessage

* Documentを機械的に分割した単位を保持する。

Decision

* 決定事項を保持する。

Idea

* アイデアを保持する。

Backlog

* 未対応事項・今後の作業候補を保持する。

Change

* 更新履歴・変更事項を保持する。

---

# 8. 共通ルール

すべての業務データモデルは以下を満たす。

* content は未加工で保持する。
* document_id により元Documentを参照する。
* message_id により元AIMessageを参照する。
* Document を保持しない。
* AIMessage を保持しない。
* 業務ロジックを持たない。
* AI利用を行わない。

---

# 9. 生成責務

| データモデル    | 初回生成フェーズ  |
| --------- | --------- |
| Document  | Phase2B-2 |
| AIMessage | Phase2B-3 |
| Decision  | Phase2C-3 |
| Idea      | Phase2C-4 |
| Backlog   | Phase2C-5 |
| Change    | Phase2C-6 |

---

# 10. Version 1.3

追加内容

* Decision データモデルを追加
* Idea データモデルを追加
* Backlog データモデルを追加
* Change データモデルを追加
* 各業務データモデルへ `document_id` を追加
* 各業務データモデルへ `message_id` を追加
* 業務データモデルの共通責務を定義
* 各分類フェーズとの対応関係を明文化

Version 1.2までに定義した Document および AIMessage の仕様は変更しない。
