# AI編集秘書 DestinationRouter仕様（Phase4-2）

**Version:** 1.1  
**Status:** Approved（Phase4-2）  
**Target:** `tools/secretary/destination_router.py`（仮）

---

# 1. 目的

Phase4-2 DestinationRouter は、Phase4-0で生成された `OutputRequest` を  
**どの保存先へ受け渡すかを決定する Routing 層**を定義する。

本フェーズは I/O 層の第三工程として、**保存先の選択と処理委譲のみ**を担当する。

実際の保存処理は Phase4-1 FileWriter、外部サービスへの送信は Phase4-3 Connector の責務とする。

---

# 2. 責務

```text
OutputRequest
      │
      ▼
DestinationRouter
      │
      ├── FileWriter（Local）
      ├── GitConnector
      ├── NotionConnector
      ├── SlackConnector
      └── DiscordConnector
```

DestinationRouter の責務は以下に限定する。

* Destination に対応する Writer / Connector を選択する
* 選択した Writer / Connector へ処理を委譲する
* 実行結果をそのまま返却する

以上のみ。

---

# 3. 入力

```python
request: OutputRequest
destination: Destination
path: Path | None
```

path は Destination.LOCAL の場合のみ必須とする。

LOCAL 以外では使用されない。

## Destination（Enum）

```python
from enum import Enum, auto

class Destination(Enum):
    LOCAL = auto()
    GIT = auto()
    NOTION = auto()
    SLACK = auto()
    DISCORD = auto()
```

### Enum採用理由

* タイプミスを防止する
* 保存先追加時の拡張性を高める
* SoT（Source of Truth）として曖昧さを排除する
* Router の分岐を明確にする

---

# 4. 出力

```python
DestinationResult
```

## DestinationResult（案）

```python
@dataclass
class DestinationResult:
    destination: Destination
    result: Any
```

DestinationResult は、DestinationRouter が各 Writer / Connector の実行結果を保持するための共通モデルとする。

`result` に格納される値の例：

| Destination | result |
|-------------|--------|
| LOCAL | Path |
| GIT | CommitHash |
| NOTION | PageId |
| SLACK | MessageId |
| DISCORD | MessageId |

Destination ごとの戻り値は保持するが、Router 自身では解釈・加工を行わない。

---

# 5. 公開インターフェース

```python
DestinationRouter.route(
    request: OutputRequest,
    destination: Destination,
    path: Path | None = None,
) -> DestinationResult
```

DestinationRouter の唯一の公開インターフェースとする。

---

# 6. DestinationRouter が行うこと

DestinationRouter は以下の処理のみを行う。

* Destination に対応する Writer / Connector を選択する
* 選択した実装へ処理を委譲する
* 実行結果から DestinationResult を生成する
* DestinationResult を返却する

Destination.LOCAL の場合は
受け取った path を FileWriter.write() へそのまま委譲する。

処理イメージ：

```text
OutputRequest
      │
      ▼
DestinationRouter
      │
      ├── LOCAL    → FileWriter
      ├── GIT      → GitConnector
      ├── NOTION   → NotionConnector
      ├── SLACK    → SlackConnector
      └── DISCORD  → DiscordConnector
                │
                ▼
        DestinationResult
```

---

# 7. DestinationRouter が行わないこと（禁止）

以下は禁止する。

* Markdown生成
* Markdown加工
* OutputRequest生成
* 保存処理
* Git API実装
* Notion API実装
* Slack API実装
* Discord API実装
* AI利用
* Rule判定
* 要約
* ファイル名決定
* 保存先の自動推測
* OutputRequest の再解釈
* WriterOutput の再解釈
* ExtractResult の再解釈
* 内容補正
* 独自例外追加

DestinationRouter は **保存先の選択と処理委譲のみ** を担当する。

---

# 8. エラー方針

* 未対応 Destination のみ例外とする
* 呼び出し先の例外はそのまま伝播する
* 内容補正は禁止する
* 独自例外処理は追加しない

---

# 9. 完了条件

以下を満たすこと。

* [x] Destination を入力できる
* [x] Destination に対応する Writer / Connector を選択できる
* [x] 処理を適切な実装へ委譲できる
* [x] DestinationResult を返却できる
* [x] 自身では保存処理を持たない
* [x] Phase4-1 と整合している
* [x] 単一責務（保存先選択・処理委譲のみ）を維持している

---

# 10. 将来拡張方針

新しい保存先を追加する場合は、

* Destination Enum へ保存先を追加する
* 対応する Writer / Connector を追加する
* DestinationRouter の対応付けを追加する

のみで対応できる。

```text
OutputRequest
      │
      ▼
DestinationRouter
      │
      ├── FileWriter（Local）
      ├── GitConnector
      ├── NotionConnector
      ├── SlackConnector
      ├── DiscordConnector
      ├── ObsidianConnector
      ├── OneDriveConnector
      └── GoogleDriveConnector
```

DestinationRouter は保存先を一元管理し、Writer／Connector の追加による拡張を容易にすることで、I/O 層全体の保守性と拡張性を維持する。

---

# Version 1.1

・LOCAL保存時に必要となる path 引数を公開インターフェースへ追加
・入力仕様へ path を追加
・LOCAL時のみ path 必須であることを明文化
・Phase4-1 FileWriter 仕様との整合性を確保

# Version 1.0（Approved）

* Destination に基づく保存先選択処理を正式定義
* Writer / Connector への処理委譲責務を明文化
* DestinationResult を共通戻り値モデルとして採用
* 保存処理を Phase4-1、外部連携を Phase4-3 へ明確に分離
* Destination Enum により拡張性と型安全性を確保
* 単一責務（保存先選択・処理委譲のみ）を維持
* Phase4-0〜Phase4-3 と整合した I/O 層のルーティング構造を確立
