# AI編集秘書 Orchestrator Integration仕様（Phase4-5）

**Version:** 1.0
**Status:** Approved（Phase4-5）
**Target:** `tools/secretary/orchestrator.py`
**Type:** 統合フェーズ（新規モデル・新規クラス・新規公開IFなし）

---

# 1. 目的

Phase4-5 Orchestrator Integration は、Phase2〜Phase4で設計・実装された
抽出 → 書き出し → 出力 → 保存 の一連の処理パイプラインを
**`orchestrator.py` 上で実際に接続し、動作可能にする統合フェーズ**である。

本フェーズは新しいモデル・新しいクラス・新しい公開インターフェースを追加せず、
既存コンポーネントを **正しい順序で呼び出す制御ロジックのみ** を定義する。

---

# 2. 責務

Orchestrator Integration の責務は以下に限定する。

```text
ExtractResult
      │
      ▼
Writer.write()
      │
      ▼
WriterOutput
      │
      ▼
Output.render()
      │
      ▼
Markdown(str)
      │
      ▼
OutputRequest
      │
      ▼
DestinationRouter.route()
      │
      ▼
DestinationResult
```

具体的には：

1. Extractor → Writer → Output → OutputRequest → DestinationRouter の順序を確定する
2. 各フェーズの公開インターフェースを呼び出す
3. 結果をそのまま返却する
4. 公開インターフェースを変更しない

以上のみ。

---

# 3. 入力

Orchestrator Integrationフェーズは **新しい入力モデルを持たない**。

使用する既存モデル：

* `AIMessage`（Phase2）
* `ExtractResult`（Phase2D）
* `WriterOutput`（Phase3-1）
* `str`（Markdown文字列・Phase3-2）
* `OutputRequest`（Phase4-0）
* `Destination`（Phase4-2）

---

# 4. 出力

Orchestrator Integrationフェーズは **新しい出力モデルを持たない**。

既存の `DestinationResult` をそのまま返却する。

---

# 5. 公開インターフェース

Orchestrator Integrationフェーズは **新しい公開インターフェースを追加しない**。

既存の `orchestrator.py` の公開インターフェース（例：`run()`）をそのまま利用する。

例：

```python
def run(
    self,
    messages: list[AIMessage],
    destination: Destination,
    path: Path | None = None,
) -> DestinationResult:
    ...
```

---

# 6. Orchestrator Integration が行うこと

Orchestrator Integrationフェーズは以下の処理のみを行う。

---

### ✔ 1. Extractor を呼び出す

```python
extract_result = extractor.extract(messages)
```

---

### ✔ 2. Writer を呼び出す

```python
writer_output = Writer.write(extract_result)
```

---

### ✔ 3. Output を呼び出す（Markdown生成）

```python
markdown = Output.render(writer_output)
```

---

### ✔ 4. OutputRequest を生成する

Phase4-0 で定義された `OutputRequest` を、生成済み Markdown文字列から生成する。

```python
request = OutputRequest(content=markdown)
```

`OutputRequest` の生成以外の加工・補正・内容変更は行わない。

---

### ✔ 5. DestinationRouter を呼び出す

```python
result = DestinationRouter.route(
    request=request,
    destination=destination,
    path=path,
)
```

---

### ✔ 6. DestinationResult を返却する

```python
return result
```

---

# 7. Orchestrator Integration が行わないこと（禁止）

以下は禁止する。

* 新しいモデル追加
* 新しいクラス追加
* 新しい公開インターフェース追加
* Extractロジック変更
* Writerロジック変更
* Outputロジック変更
* OutputRequestロジック変更
* DestinationRouterロジック変更
* Connector実装変更
* Markdown加工
* 保存判断
* AI利用
* Rule判定
* 内容補正
* 独自例外追加

Orchestrator は **制御のみ** を担当する。

---

# 8. エラー方針

* 各フェーズの例外はそのまま伝播する
* Orchestrator独自の例外は追加しない
* 補正処理は禁止する

---

# 9. 完了条件

以下を満たすこと。

* [x] Extract → Writer → Output → OutputRequest → DestinationRouter の順序が確定している
* [x] 各フェーズの公開インターフェースを正しく呼び出している
* [x] `DestinationResult` を返却できる
* [x] 公開インターフェースを変更していない
* [x] Phase2〜Phase4 と完全整合している
* [x] 単一責務（制御のみ）を維持している

---

# 10. 将来拡張方針

保存先を追加する場合は以下のみ実施する。

1. Phase4-3 で Connector を追加する
2. Phase4-4 で DestinationRouter の委譲先を追加する
3. Orchestrator は既存の `DestinationRouter.route()` を呼び出し続けるため、**原則として変更を必要としない**

Orchestrator Integration はシステム全体の制御層として、各フェーズを疎結合に保ちながら統合する役割を担う。

---

# Version 1.0（Approved）

* Phase4-5 Orchestrator Integration を正式フェーズとして定義
* 新しいモデル・クラス・公開インターフェースを追加しない方針を明文化
* Extract → Writer → Output → OutputRequest → DestinationRouter の処理順序を正式確定
* `OutputRequest` は既存Markdown文字列から生成するモデルであり、加工を行わないことを明文化
* Orchestrator は `DestinationRouter` を呼び出す制御層とし、保存先追加時も原則変更不要であることを明文化
* Phase2〜Phase4 の統合作業を責務として明確化
* 単一責務（制御のみ）を維持
* システム全体の最終統合ポイントとしての構造を正式確立
