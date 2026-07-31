# AI編集秘書 I/O Core仕様（Phase4-0：OutputRequestモデル）

**Version:** 1.0  
**Status:** Approved（Phase4-0）  
**Target:** `tools/secretary/models/output_request.py`（仮）

---

# 1. 目的

Phase4-0では、Phase3-2で生成された Markdown成果物を  
保存処理へ受け渡すための **OutputRequestモデル** を定義する。

本フェーズは I/O層の最初の工程として、  
**保存要求（OutputRequest）のデータモデル定義のみ** を担当する。

保存処理（ファイル出力・外部連携）は Phase4-1 以降の責務とする。

---

# 2. 責務

```text
Markdown(str)
      │
      ▼
OutputRequest（Phase4-0）
      │
      ▼
FileWriter（Phase4-1）
      │
      ▼
DestinationRouter（Phase4-2）
      │
      ▼
Connector（Phase4-3）
```

Phase4-0 の責務は以下に限定する。

* Markdown文字列を保持する
* 保存要求として後続処理へ受け渡すための構造を提供する
* モデル定義のみを行う

以上のみ。

---

# 3. 入力

Phase4-0 は処理を持たないため、入力処理は行わない。

`OutputRequest` は、Phase3-2 `Output.render()` が生成した Markdown文字列を保持するためのモデルである。

前提条件：

* Phase3-2 Output.render() が生成した Markdown文字列であること
* 内容は未加工であること
* 保存処理は行わないこと

---

# 4. 出力

```python
OutputRequest
```

Phase4-0 で定義される保存要求モデル。

---

# 5. モデル定義

```python
from dataclasses import dataclass

@dataclass
class OutputRequest:
    content: str
```

保持フィールド：

| フィールド | 型 | 説明 |
|---|---|---|
| `content` | `str` | Markdown文字列（未加工） |

制約：

* `content` は必須
* `None` は使用しない

---

# 6. OutputRequest が行うこと

* Markdown文字列を保持する
* 後続層（FileWriter / DestinationRouter / Connector）へ受け渡すための構造を提供する

以上のみ。

---

# 7. OutputRequest が行わないこと（禁止）

以下は禁止する。

* Markdown生成
* Markdown加工
* 要約
* 情報削除
* 優先順位付け
* 重複排除
* ファイル出力（I/O）
* Document生成
* 外部サービス連携
* 保存先判定
* WriterOutput の再解釈
* ExtractResult の再解釈
* モデル構造変更

OutputRequest は **保存要求モデルのみ** を担当する。

---

# 8. エラー方針

* OutputRequest は処理を持たないため独自例外を定義しない
* モデル生成時の例外は標準Python例外に従う
* 内容補正は禁止する
* 例外は既存方針に従い伝播する

---

# 9. 完了条件

以下を満たすこと。

* [x] Markdown文字列を保持できる
* [x] OutputRequestモデルが定義されている
* [x] データ内容を変更しない
* [x] 保存処理を行わない
* [x] Phase3-2 と整合している
* [x] 単一責務（保存要求モデルのみ）を維持している

---

# 10. 将来拡張方針

* Phase4-1 FileWriter でローカル保存を行う
* Phase4-2 DestinationRouter で保存先切替を行う
* Phase4-3 Connector で Git / Notion / Slack / Discord 連携を行う
* OutputRequest に保存メタ情報を追加する場合は必要時のみ実施する

---

# Version 1.0（Approved）

* Markdown成果物を保持する保存要求モデルを定義
* 保存処理を Phase4-1 以降へ分離
* モデル定義のみの単一責務を維持
* Phase3-0 WriterOutput と対称となる構造を採用
* Phase3-2 Output接続との責務境界を明確化
