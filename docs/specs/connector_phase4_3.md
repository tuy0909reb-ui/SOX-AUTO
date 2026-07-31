# AI編集秘書 Connector仕様（Phase4-3）

**Version:** 1.0  
**Status:** Approved（Phase4-3）  
**Target:** `tools/secretary/connector.py`（仮）

---

# 1. 目的

Phase4-3 Connector は、Phase4-2 DestinationRouter から委譲された
`OutputRequest` を外部サービスへ送信する **外部接続層** を定義する。

本フェーズは I/O 層の最終工程として、

- 外部サービスへの保存
- 外部サービスへの送信

のみを担当する。

保存先の選択は Phase4-2、
Markdown生成は Phase3-2 の責務であり、
本フェーズでは扱わない。

---

# 2. 責務

```text
DestinationRouter
      │
      ▼
Connector（抽象インターフェース）
      │
      ├── GitConnector
      ├── NotionConnector
      ├── SlackConnector
      └── DiscordConnector
```

Connector の責務は以下に限定する。

- 保存要求を受け取る
- 外部サービスAPIを呼び出す
- 実行結果を返却する

以上のみ。

---

# 3. 入力

```python
request: OutputRequest
```

---

# 4. 出力

```python
ConnectorResult
```

## ConnectorResult（共通モデル）

```python
from dataclasses import dataclass
from typing import Any

@dataclass
class ConnectorResult:
    destination: Destination
    result: Any
```

### result の例

| Destination | result |
|------------|--------|
| GIT | CommitHash |
| NOTION | PageId |
| SLACK | MessageId |
| DISCORD | MessageId |

Phase4-2 の `DestinationResult` と対称構造を採用する。

---

# 5. 公開インターフェース

Connector は外部サービス接続の共通インターフェース（抽象基底）とする。

各サービス用 Connector は、このインターフェースを実装する。

```python
from abc import ABC, abstractmethod

class Connector(ABC):

    @abstractmethod
    def send(
        self,
        request: OutputRequest,
    ) -> ConnectorResult:
        ...
```

Connector の唯一の公開インターフェースとする。

---

# 6. Connector が行うこと

- OutputRequest を受け取る
- 各サービスAPIへ送信する
- ConnectorResult を返却する

処理イメージ：

```text
OutputRequest
      │
      ▼
Connector
      │
      ├── GitConnector
      ├── NotionConnector
      ├── SlackConnector
      └── DiscordConnector
                │
                ▼
        ConnectorResult
```

---

# 7. Connector が行わないこと（禁止）

以下は禁止する。

- Markdown生成
- Markdown加工
- 保存先判定
- Destination選択
- File保存
- Rule判定
- AI利用
- 要約
- OutputRequest生成
- WriterOutput生成
- ExtractResult再解釈
- 内容補正
- 独自例外追加

Connector は **サービス通信のみ** を担当する。

---

# 8. エラー方針

- API例外はそのまま伝播する
- 内容補正は禁止する
- 独自例外は追加しない

---

# 9. 完了条件

以下を満たすこと。

- [x] Connector インターフェースを定義できる
- [x] ConnectorResult を返却できる
- [x] DestinationRouter と整合している
- [x] 各サービス Connector が共通IFを実装できる
- [x] 単一責務（外部接続のみ）を維持している

---

# 10. 将来拡張方針

新しいサービスは Connector を追加するだけで対応可能とする。

推奨構成例：

```text
tools/
└── secretary/
    └── connectors/
        ├── base.py
        ├── git_connector.py
        ├── notion_connector.py
        ├── slack_connector.py
        ├── discord_connector.py
        ├── obsidian_connector.py
        ├── onedrive_connector.py
        └── google_drive_connector.py
```

Connector は外部サービス接続の抽象層として、
I/O 層の拡張性を最大化する。

---

# Version 1.0（Approved）

- Connector 抽象インターフェースを正式定義
- DestinationRouter から委譲された外部接続処理を定義
- ConnectorResult による共通戻り値モデルを採用
- Phase4-2 DestinationResult と対称構造を採用
- 各サービス Connector は共通インターフェースを実装する設計を明文化
- 推奨ディレクトリ構成を追加し、将来のサービス拡張方針を明確化
- 単一責務（外部サービス通信のみ）を維持
