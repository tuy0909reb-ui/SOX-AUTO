# AI編集秘書 Orchestrator仕様（Phase2D-2：Extraction Pipeline接続）

**Version:** 1.0  
**Status:** Approved（Phase2D-2）  
**Target:** 上位Orchestrator接続層（実装先未確定）

---

# 1. 目的

Phase2D-2では、既存の上位処理フローへ

```text
list[AIMessage]
```

から

```text
ExtractResult
```

を返す抽出パイプラインを接続する。

本フェーズは **抽出パイプラインの上位接続のみ** を担当する。

分類・加工・要約・Action生成などの処理は行わない。

---

# 2. 責務

```text
Phase2C-2
 │
 ▼
list[AIMessage]
 │
 ▼
Phase2D-2 上位接続層
 │
 ▼
Phase2D-1 ExtractorOrchestrator
 │
 ▼
ExtractResult
 │
 ▼
後続処理
```

Phase2D-2 の責務は以下に限定する。

* Phase2C-2 の出力（`list[AIMessage]`）を受け取る
* Phase2D-1 ExtractorOrchestrator を呼び出す
* ExtractResult を受領する
* ExtractResult を上位へ返却する

以上のみ。

---

# 3. Phase2D-1との責務境界

## Phase2D-1 の責務

* Phase2C-3〜C-6分類器の呼び出し
* 各分類結果の取得
* ExtractResult の生成
* 分類結果の統合

---

## Phase2D-2 の責務

* 上位処理フローへの接続
* Phase2D-1 の呼び出し
* ExtractResult の受け渡し

---

Phase2D-2 は Phase2D-1 の分類処理・統合処理を変更しない。

---

# 4. 入力

```python
list[AIMessage]
```

前提条件：

* Phase2C-2 の出力であること
* AIMessage は未加工
* content / metadata は未加工
* role は HUMAN / ASSISTANT のみ

---

# 5. 出力

```python
ExtractResult
```

Phase2D-0 で定義されたデータモデルをそのまま返却する。

ExtractResult の内容変更・加工・検証は行わない。

---

# 6. 呼び出し対象

Phase2D-1 ExtractorOrchestrator の公開インターフェースを使用する。

```python
ExtractorOrchestrator.extract(
    messages: list[AIMessage],
) -> ExtractResult
```

---

# 7. 公開インターフェース

本フェーズでは公開インターフェースを確定しない。

理由：

* 実装先となる上位Orchestrator構造が未確定のため
* 既存入口を確認した上で確定するため

本フェーズでは **接続責務のみを定義する。**

---

# 8. Phase2D-2 が行うこと

* Phase2C-2 の出力を受け取る
* Phase2D-1 ExtractorOrchestrator を呼び出す
* ExtractResult を受領する
* ExtractResult を上位へ返却する

以上のみ。

---

# 9. Phase2D-2 が行わないこと

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
* Action生成
* 外部サービス連携
* ログ生成
* 独自バリデーション
* ExtractResult内容検証
* データ変換

---

# 10. エラー方針

* Phase2D-1 の例外は握りつぶさず伝播させる
* 独自の例外処理は追加しない
* 入力不正による処理不能時のみ標準例外を許容する
* ExtractResult の内容検証は行わない

---

# 11. 実装原則

* 単一責務（抽出パイプライン接続のみ）
* AI利用禁止
* データ加工禁止
* ExtractResult の構造を変更しない
* Phase2D-1 の返却値を変更しない
* 上位Orchestratorの責務を侵害しない
* 分類処理を追加しない

---

# 12. 完了条件

以下をすべて満たすこと。

* Phase2C-2 → Phase2D-1 の接続が完了している
* `ExtractResult` が上位へ返却される
* Phase2D-1 を直接変更しない
* 分類処理を持たない
* AI利用が存在しない
* Phase2D-0 / Phase2D-1 と整合している

---

# 13. 将来拡張方針

* 上位Orchestratorが確定した時点で公開IFを確定する
* 後続フェーズ（Writer / Action等）との接続を考慮する
* 抽出パイプラインの構造は変更しない
* agent判定は分類器側の責務とする

---

# Version 1.0（Approved）

* 抽出パイプラインの上位接続フェーズを定義
* 入力を `list[AIMessage]` に統一
* 出力を `ExtractResult` に統一
* Phase2D-1 の呼び出し責務のみを定義
* 公開IFは未確定として保留
* Phase2D-1との責務境界を明文化
* Phase2A〜2D の単一責務設計を維持する構成を採用
