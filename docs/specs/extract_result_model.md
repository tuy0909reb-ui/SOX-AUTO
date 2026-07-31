# AI編集秘書 データモデル仕様（Phase2D-0：ExtractResult）

**Version:** **1.0**
**Status:** **Approved（Phase2D-0）**
**Target:** `tools/secretary/models/extract_result.py`

---

# 1. 目的

Phase2D-0では、Phase2C系列（Decision / Idea / Backlog / Change）の分類結果を統合して保持するための**共通データモデル**を定義する。

本フェーズは **データモデル定義のみ** を担当する。

---

# 2. 責務

```text
Decision
Idea
Backlog
Change
      │
      ▼
ExtractResult
```

ExtractResult は分類結果を束ねるコンテナであり、

* Rule判定
* 分類処理
* 加工処理

は一切行わない。

---

# 3. データモデル

```python
from dataclasses import dataclass, field

@dataclass
class ExtractResult:
    decisions: list[Decision] = field(default_factory=list)
    ideas: list[Idea] = field(default_factory=list)
    backlogs: list[Backlog] = field(default_factory=list)
    changes: list[Change] = field(default_factory=list)
```

各フィールドは **空リストを初期値** とする。

**None は使用しない。**

---

# 4. フィールド仕様

| フィールド     | 型              | 説明              |
| --------- | -------------- | --------------- |
| decisions | list[Decision] | Phase2C-3 の分類結果 |
| ideas     | list[Idea]     | Phase2C-4 の分類結果 |
| backlogs  | list[Backlog]  | Phase2C-5 の分類結果 |
| changes   | list[Change]   | Phase2C-6 の分類結果 |

すべて **Phase2C の分類結果を未加工のまま保持する。**

各フィールドは **空リストを初期値** とし、

**None は使用しない。**

---

# 5. 判定対象

ExtractResult は判定処理を持たない。

分類はすべて Phase2C 系列で完了しているため、

ExtractResult は保持のみを行う。

---

# 6. ExtractResult が行うこと

* 分類結果の保持
* Orchestratorへの返却

---

# 7. ExtractResult が行わないこと

* Rule判定
* AI利用
* content加工
* metadata加工
* AIMessage変更
* ParsedDocument変更
* Document変更
* 重複排除
* 優先順位付け
* 要約
* Markdown解析
* 外部サービス連携

---

# 8. エラー方針

ExtractResult はデータコンテナであり、

エラー処理は行わない。

各フィールドは

```text
[]
```

を正常値とする。

各フィールドは **空リストを初期値** とし、

**None は使用しない。**

---

# 9. 実装原則

* 単一責務（分類結果の保持のみ）
* Phase2A の設計思想に従う
* Phase2C の分類結果をそのまま保持する
* 加工・変換・フィルタリングを行わない
* 各フィールドは空リストを初期値とする
* None を使用しない

---

# 10. 完了条件

以下をすべて満たすこと。

* ExtractResult が定義されている
* Decision を保持できる
* Idea を保持できる
* Backlog を保持できる
* Change を保持できる
* Orchestrator が利用可能な構造になっている
* 加工処理を持たない
* AI利用が存在しない

---

# 11. 将来拡張方針

分類器が追加された場合は、

ExtractResult にフィールドを追加することで対応する。

Orchestrator の基本構造は変更しない。

---

# Version 1.0

* Phase2D の共通データモデルを定義
* Phase2C の分類結果を統合するコンテナとして設計
* 加工処理を持たない純粋な保持モデルとして定義
* Phase2A〜2C と完全対称の設計を採用
* 各フィールドは空リストを初期値とし、**None を使用しない**方針を明文化

---
