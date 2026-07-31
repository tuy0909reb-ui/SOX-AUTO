# AI編集秘書 E2E Test仕様（Phase5-0）

**Version:** 1.0
**Status:** Approved（Phase5-0）
**Target:** `tests/e2e/`
**Type:** E2Eテスト仕様（新規モデル・新規クラス追加なし）

---

# 1. 目的

Phase5-0 E2E Test仕様は、Phase2〜Phase4で構築された
抽出 → 書き出し → 出力 → 保存 の一連の処理パイプラインが
**システム全体として契約どおり動作することを検証するフェーズ**である。

本フェーズはコンポーネント内部ロジックのテストではなく、
**「入力 → 出力 → 保存」までの流れが壊れていないことを保証する**ための統合テストを定義する。

---

# 2. 責務

E2Eテストの責務は以下に限定する。

1. 各Phase間の契約（IF・データ構造）が正しく連携しているか確認する
2. Orchestrator が正しい順序で各Phaseを呼び出すことを確認する
3. DestinationRouter が正しい保存先へ委譲することを確認する
4. 結果または例外が不必要に加工されず伝播することを確認する

---

# 3. 入力

E2Eテストは **新しい入力モデルを持たない**。

使用する既存モデル：

* `AIMessage`（Phase2）
* `Destination`（Phase4-2）
* `Path`（LOCAL保存時のみ）

---

# 4. 出力

E2Eテストは **新しい出力モデルを持たない**。

既存の `DestinationResult` を検証対象とする。

---

# 5. テスト対象フロー

E2Eテストは以下のフローを対象とする。

```text
AIMessage
  ↓
Extractor
  ↓
ExtractResult
  ↓
Writer
  ↓
WriterOutput
  ↓
Output.render()
  ↓
Markdown
  ↓
OutputRequest生成
  ↓
DestinationRouter
  ↓
DestinationResult
```

---

# 6. テストケース一覧（最低限）

---

## Case1：LOCAL保存成功

### 入力

* AIMessage（任意のテキスト）
* Destination.LOCAL
* 保存可能なpath（一時ディレクトリ等）

### 期待結果

* FileWriter が呼ばれる
* Markdownファイルが生成される
* 内容が `Output.render()` の生成結果と一致する
* UTF-8で保存されている
* DestinationResult が返却される
* Orchestrator はデータ加工を行わない

---

## Case2：Connector委譲確認（GIT / NOTION / SLACK / DISCORD）

### 入力

* AIMessage
* Destination.GIT（または各外部Destination）

### 期待結果

* DestinationRouter が正しい Connector を呼び出す
* Router が通信処理を行わない
* Connector.send() が呼ばれる
* Connector の結果または例外が DestinationResult生成処理まで正しく扱われる
* Orchestrator は結果を加工しない

※ Phase4-3未実装期間では、各Connectorの `NotImplementedError` が補正されず伝播することを確認する。
※ Connector実装後は、正常結果の伝播確認へ更新する。

---

## Case3：エラー伝播（補正禁止）

### 入力

* Destination.LOCAL
* FileWriter が保存不能となる状態のpath

例：

* 書込権限不足
* ファイルシステムエラー
* その他 `FileWriter` が `OSError` 系例外を発生する状態

### 期待結果

* FileWriter が例外を発生する
* DestinationRouter は補正しない
* Orchestrator は補正しない
* 例外がそのまま上位へ伝播する

---

## Case4：OutputRequest生成の不変性

### 入力

* AIMessage

### 期待結果

* `Output.render()` の結果が、そのまま `OutputRequest.content` に設定される
* 加工・補正・要約が行われない
* OutputRequest の構造が維持されている

---

## Case5：Orchestrator呼び出し順序保証

### 入力

* 任意のAIMessage

### 期待結果

Orchestrator が以下の順序で処理することを確認する。

1. Extractor呼び出し
2. Writer.write()呼び出し
3. Output.render()呼び出し
4. OutputRequest生成
5. DestinationRouter.route()呼び出し

順序が崩れていないことを保証する。

---

# 7. E2Eテストが行わないこと（禁止）

以下は禁止する。

* 各コンポーネント内部ロジックの単体テスト
* AI品質評価
* 要約品質評価
* 外部API品質評価
* 保存先の自動推測
* 内容補正
* 独自例外追加

E2Eテストは **「システム全体の契約と流れが維持されていること」だけを確認する。**

---

# 8. 完了条件

以下を満たすこと。

* [ ] LOCAL保存の成功が確認できる
* [ ] Router → Connector の委譲が確認できる
* [ ] 結果・例外が不必要に加工されず伝播することを確認できる
* [ ] OutputRequest の不変性が確認できる
* [ ] Orchestrator の呼び出し順序が正しい
* [ ] Phase2〜Phase4 の契約がすべて守られている

---

# 9. 将来拡張方針

新しい保存先を追加した場合：

1. Phase4-3：Connector追加
2. Phase4-4：Router委譲追加
3. Phase4-5：Orchestrator制御確認
4. Phase5：E2Eテストに新しい保存先のテストケースを追加

E2Eテストは I/O層全体の品質保証ポイントとして機能する。

---

# Version 1.0（Approved）

* Phase5-0 E2E Test仕様を正式定義
* 新しいモデル・クラスを追加しない方針を明文化
* 全体パイプラインの契約確認を責務として定義
* LOCAL保存・外部委譲・エラー伝播・順序保証の最低限テストを定義
* Phase2〜Phase4の統合品質を保証する層として位置づけ
* Connector実装前後で利用可能なテスト方針へ調整
