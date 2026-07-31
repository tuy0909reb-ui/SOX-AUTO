# AI編集秘書 Orchestrator仕様（Phase2D-1：Extractor統合）

**Version:** 1.0
**Status:** Approved（Phase2D-1）
**Target:** `tools/secretary/extractor_orchestrator.py`

---

# 1. 目的

Phase2D-1では、Phase2C系列で実装された以下の分類器を統合し、

```text
list[AIMessage]
```

を入力として、

```text
ExtractResult
```

を返却する。

本フェーズは **分類器の呼び出しと結果統合のみ** を担当する。

---

# 2. 責務

```text
list[AIMessage]
        │
        ▼
ExtractorOrchestrator
        │
        ├── extract_decisions()
        ├── extract_ideas()
        ├── extract_backlogs()
        └── extract_changes()
                │
                ▼
          ExtractResult
```

Orchestrator は **分類ロジックを持たない。**

各分類器の結果を未加工のまま ExtractResult に格納する。

---

# 3. 入力

```python
list[AIMessage]
```

前提条件：

* Phase2C-2 の出力であること
* AIMessage は未加工
* content / metadata は未加工
* role は HUMAN / ASSISTANT のみ

---

# 4. 出力

```python
ExtractResult
```

ExtractResult は Phase2D-0 で定義されたデータモデルを使用する。

---

# 5. 呼び出し対象

以下の公開インターフェースを使用する。

```python
Extractor.extract_decisions(
    messages: list[AIMessage],
) -> list[Decision]

Extractor.extract_ideas(
    messages: list[AIMessage],
) -> list[Idea]

Extractor.extract_backlogs(
    messages: list[AIMessage],
) -> list[Backlog]

Extractor.extract_changes(
    messages: list[AIMessage],
) -> list[Change]
```

---

# 6. 呼び出し順序

以下の順番で固定する。

```text
1. extract_decisions()

2. extract_ideas()

3. extract_backlogs()

4. extract_changes()
```

禁止事項：

* 並列化
* スキップ
* 独自優先順位付け
* 呼び出し順変更

---

# 7. 公開インターフェース

```python
ExtractorOrchestrator.extract(
    messages: list[AIMessage],
) -> ExtractResult
```

公開インターフェース変更は禁止する。

---

# 8. Orchestrator が行うこと

* Phase2C-3〜C-6分類器の呼び出し
* 分類結果の取得
* ExtractResult生成
* 各フィールドへの格納
* ExtractResult返却

以上のみ。

---

# 9. Orchestrator が行わないこと

以下は禁止する。

* Rule判定
* Decision分類
* Idea分類
* Backlog分類
* Change分類
* AI利用
* content加工
* metadata加工
* AIMessage変更
* ParsedDocument変更
* Document変更
* 重複排除
* 優先順位付け
* 要約
* agent判定
* 外部サービス連携
* ログ生成
* 独自バリデーション
* データ変換

---

# 10. エラー方針

* 各分類器が `[]` を返す場合は正常
* ExtractResult の各フィールドは空リストを許容
* 分類器内部例外は握りつぶさず伝播
* 入力不正による処理不能時のみ例外

---

# 11. 実装原則

* 単一責務（分類器統合のみ）
* Rule Engineを持たない
* AI利用禁止
* 分類結果を未加工保持する
* ExtractResult構造を変更しない
* 分類器責務を侵害しない
* 呼び出し順序を変更しない

---

# 12. 完了条件

以下をすべて満たすこと。

* `ExtractorOrchestrator.extract()` が存在する
* `list[AIMessage]` を入力できる
* Phase2C-3〜C-6分類器を固定順で呼び出す
* `ExtractResult` を返却する
* AIMessageを変更しない
* 分類処理を持たない
* AI利用が存在しない
* Phase2D-0仕様と整合する

---

# 13. 将来拡張方針

分類器追加時は、

```text
ExtractResultへフィールド追加
↓
Orchestratorへ呼び出し追加
```

で対応する。

既存分類器の責務変更は行わない。

将来的に

```text
AIMessage.agent
```

が追加されても、Orchestratorの責務は分類器呼び出しと結果統合のみとする。

agent判定は分類器側の責務とする。

---

# Version 1.0

* Extractor統合フェーズを定義
* 入力を `list[AIMessage]` に統一
* 出力を `ExtractResult` に統一
* Phase2C-3〜C-6分類器統合構成を定義
* Orchestratorは分類せず統合のみ担当する設計を採用
* Phase2D-0 ExtractResultモデルとの接続仕様を定義

---
