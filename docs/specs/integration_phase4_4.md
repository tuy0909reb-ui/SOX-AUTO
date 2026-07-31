# AI編集秘書 Integration仕様（Phase4-4）

**Version:** 1.0  
**Status:** Approved（Phase4-4）  
**Target:** `tools/secretary/destination_router.py`  
**Type:** 統合フェーズ（新規モデル・新規クラス・新規公開IFなし）

---

# 1. 目的

Phase4-4 Integration は、Phase4-1〜Phase4-3 で設計・実装されたコンポーネントを
**正しく結線（配線）する統合フェーズ**である。

本フェーズは新しいモデル・新しいクラス・新しい公開インターフェースを追加せず、
既存コンポーネント間の **委譲関係を完成させることのみ** を目的とする。

Integrationフェーズは新しい機能を追加するフェーズではなく、
既存コンポーネントを接続し、I/O層を完成させるための統合作業を担当する。

---

# 2. 責務

Integration の責務は以下に限定する。

```text
DestinationRouter
      │
      ▼
各 Connector への委譲を完成させる
```

具体的には、

1. `_Phase4ConnectorPlaceholder` を廃止する
2. `DestinationRouter.route()` が実際の Connector を呼び出すようにする
3. `DestinationResult` をそのまま返却する
4. 公開IFを変更しない

以上のみ。

---

# 3. 入力

Integrationフェーズは **新しい入力モデルを持たない。**

使用する既存モデル：

- `OutputRequest`（Phase4-0）
- `Destination`（Phase4-2）
- `DestinationResult`（Phase4-2）
- `ConnectorResult`（Phase4-3）

---

# 4. 出力

Integrationフェーズは **新しい出力モデルを持たない。**

既存の `DestinationResult` をそのまま返却する。

---

# 5. 公開インターフェース

Integrationフェーズは **新しい公開インターフェースを追加しない。**

既存の以下の公開IFをそのまま利用する。

```python
DestinationRouter.route(
    request: OutputRequest,
    destination: Destination,
    path: Path | None = None,
) -> DestinationResult
```

---

# 6. Integration が行うこと

Integrationフェーズは以下の処理のみを行う。

### ✔ 1. Router の委譲先を正式な Connector 実装へ置き換える

```text
旧：_Phase4ConnectorPlaceholder

新：
GitConnector
NotionConnector
SlackConnector
DiscordConnector
```

---

### ✔ 2. Destination に応じて適切な実装へ委譲する

```text
LOCAL
    ↓
FileWriter.write()

GIT
    ↓
GitConnector.send()

NOTION
    ↓
NotionConnector.send()

SLACK
    ↓
SlackConnector.send()

DISCORD
    ↓
DiscordConnector.send()
```

---

### ✔ 3. 実行結果から DestinationResult を生成して返却する

---

### ✔ 4. 公開インターフェースを変更しない

---

# 7. Integration が行わないこと（禁止）

Integrationフェーズは **配線以外の処理を一切行わない。**

以下は禁止する。

- 新しいモデル追加
- 新しいクラス追加
- 新しい公開IF追加
- Markdown生成
- Markdown加工
- 保存処理
- 外部API実装
- FileWriter変更
- Output変更
- Writer変更
- OutputRequest変更
- Destination変更
- Rule判定
- AI利用
- 内容補正
- 独自例外追加

Integration は **既存コンポーネントの接続のみ** を担当する。

---

# 8. エラー方針

Integrationフェーズは新しい例外を追加しない。

- Connector の例外はそのまま伝播する
- Router の例外方針を変更しない
- 内容補正は禁止する

---

# 9. 完了条件

以下を満たすこと。

- [x] `_Phase4ConnectorPlaceholder` を廃止した
- [x] Router が正式な Connector 実装へ委譲する
- [x] `DestinationResult` を返却できる
- [x] 公開インターフェースを変更していない
- [x] Phase4-1〜Phase4-3 と完全整合している
- [x] 単一責務（配線のみ）を維持している

---

# 10. 将来拡張方針

新しい保存先を追加する場合は以下のみ実施する。

1. Phase4-3 で Connector を追加する
2. Phase4-4 で DestinationRouter の委譲先を追加する

例：

```text
DestinationRouter
      │
      ├── FileWriter
      ├── GitConnector
      ├── NotionConnector
      ├── SlackConnector
      ├── DiscordConnector
      ├── ObsidianConnector
      ├── OneDriveConnector
      └── GoogleDriveConnector
```

Integrationフェーズは、I/O層全体の配線ポイントとして機能し、
新しい保存先追加時も既存コンポーネントの責務を変更することなく拡張できる構造を維持する。

---

# Version 1.0（Approved）

- Phase4-4 Integration を正式フェーズとして定義
- 新しいモデル・クラス・公開IFを追加しない方針を明文化
- `DestinationRouter` から正式な Connector 実装への委譲を定義
- `_Phase4ConnectorPlaceholder` の廃止を正式化
- Phase4-1〜Phase4-3 の統合作業を責務として明確化
- 単一責務（配線のみ）を維持
- I/O層全体の統合ポイントとしての構造を確立
