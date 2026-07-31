# AI編集秘書 Output仕様（Phase3-2：Output接続）

**Version:** 1.0  
**Status:** Approved（Phase3-2）  
**Target:** `tools/secretary/output.py`（仮）

---

# 1. 目的

Phase3-2では、Phase3-1で生成された `WriterOutput` を  
成果物として利用可能な形式へ整形する **Output接続処理** を定義する。

本フェーズは Writerフェーズの最終工程として、  
**Markdown成果物の生成のみ** を担当する。

保存処理（ファイル書き込み・外部サービス連携）は  
**Phase4（I/O層）へ分離**し、本フェーズでは扱わない。

---

# 2. 責務

```text
WriterOutput
      │
      ▼
Output接続（Phase3-2）
      │
      ▼
Markdown（str）
```

責務は以下に限定する。

* WriterOutput を受け取る
* Markdown成果物を生成する
* Markdown文字列を返却する

以上のみ。

---

# 3. 入力

```python
WriterOutput
```

前提条件：

* Phase3-0 で定義されたモデルであること
* Phase3-1 Writer統合で生成されたものであること
* 内容は未加工であること
* `decisions` / `ideas` / `backlogs` / `changes` を保持していること

---

# 4. 出力

```python
str  # Markdown文字列
```

Phase3-2では **Markdown文字列のみ** を返却する。

保存処理（Document生成・ファイル出力・外部連携）は  
Phase4で扱うため、本フェーズでは行わない。

---

# 5. 公開インターフェース

```python
Output.render(
    writer_output: WriterOutput,
) -> str
```

Output接続における唯一の公開インターフェースとする。

---

# 6. Output接続が行うこと

Output接続は以下の処理のみを行う。

* WriterOutput を受け取る
* Markdownテンプレートへ各フィールドを対応付ける
* Markdown文字列を生成する
* 整形結果を返却する

処理イメージ：

```text
WriterOutput
      │
      ▼
Markdownテンプレートへマッピング
      │
      ▼
Markdown文字列生成
```

Markdown整形例（参考）：

```text
# Decisions
- ...

# Ideas
- ...

# Backlogs
- ...

# Changes
- ...
```

※ Markdownテンプレートは Phase4 で差し替え可能とする。

---

# 7. Output接続が行わないこと（禁止）

以下は禁止する。

* Rule判定
* 分類処理
* AI利用
* 要約
* 情報削除
* 優先順位付け
* 重複排除
* WriterOutput内容の変更
* ExtractResult内容の変更
* Document生成
* ファイル出力
* 外部サービス連携
* 保存処理（I/O）
* Outputテンプレートの高度な加工
* Writer統合処理の再実行

Output接続は **Markdownテンプレートへの対応付けとMarkdown文字列生成のみ** を担当する。

---

# 8. エラー方針

* WriterOutput が処理不能な場合のみ例外とする
* 内容補正は禁止する
* 独自例外処理は追加しない
* 例外は既存方針に従い伝播する

---

# 9. 完了条件

以下を満たすこと。

* [x] WriterOutput を入力できる
* [x] Markdown文字列を生成できる
* [x] Markdownテンプレートへ正しく対応付けられる
* [x] データ内容を変更しない
* [x] 保存処理を行わない
* [x] Phase3-1 と整合している
* [x] 単一責務（Markdown生成のみ）を維持している

---

# 10. 将来拡張方針

* Phase4 で保存処理（I/O）を担当する
* Markdownテンプレート差し替え機能を追加可能
* HTML / PDF などの別形式出力は Phase4 で扱う
* Git連携・Notion連携などは Phase4 に委譲する
* Output接続は常に「整形のみ」を維持する

---

# Version 1.0（Approved）

* WriterOutput → Markdown文字列生成処理を正式定義
* Markdownテンプレートへの対応付け責務を明文化
* 保存処理を Phase4（I/O層）へ分離
* 公開インターフェースを `Output.render()` として統一
* 単一責務（Markdown整形・生成のみ）を維持
* Phase2D / Phase3 系列と完全対称の構造を採用
