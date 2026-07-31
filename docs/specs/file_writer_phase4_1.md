# AI編集秘書 FileWriter仕様（Phase4-1：FileWriter）

**Version:** 1.0  
**Status:** Approved（Phase4-1）  
**Target:** FileWriter実装（実装先未確定）

---

# 1. 目的

Phase4-1では、Phase4-0で生成された `OutputRequest` を受け取り、  
Markdown成果物をローカルファイルへ保存する **FileWriter** を定義する。

本フェーズは I/O層の第二工程として、**ローカル保存処理のみ** を担当する。

保存先の決定や外部サービス連携は Phase4-2 以降の責務とする。

---

# 2. 責務

```text
OutputRequest
      │
      ▼
FileWriter
      │
      ▼
Markdown File
```

FileWriter の責務は以下に限定する。

* OutputRequest の `content` を受け取る
* 指定された保存先へ Markdown を保存する
* 必要に応じて親ディレクトリを作成する
* 保存した `Path` を返却する

以上のみ。

---

# 3. 入力

```python
request: OutputRequest
path: Path
```

前提条件：

* `request.content` は Phase3-2 が生成した Markdown文字列であること
* `path` は保存先の完全パスであること
* ファイル名および保存先の決定は Phase4-2 の責務とする

---

# 4. 出力

```python
Path
```

保存したファイルのパスを返却する。

---

# 5. 公開インターフェース

```python
FileWriter.write(
    request: OutputRequest,
    path: Path,
) -> Path
```

FileWriter における唯一の公開インターフェースとする。

---

# 6. FileWriter が行うこと

FileWriter は以下の処理のみを行う。

* `request.content` を保存する
* 保存先ディレクトリが存在しない場合は作成する
* 保存した `Path` を返却する

---

## 保存要件

* 保存時の文字コードは **UTF-8** とする
* 上書き保存を基本とする
* 保存対象は Markdown文字列のみとする

---

# 7. FileWriter が行わないこと（禁止）

以下は禁止する。

* Markdown生成
* Markdown加工
* 保存先選択
* ファイル名決定
* Git連携
* Notion連携
* Slack連携
* Discord連携
* 外部サービス連携
* OutputRequest の再解釈
* WriterOutput の再解釈
* ExtractResult の再解釈
* AI処理
* Rule処理
* 例外補正
* 独自例外追加

FileWriter は **ローカル保存処理のみ** を担当する。

---

# 8. エラー方針

* ファイル保存時の `IOError` / `OSError` はそのまま伝播する
* 内容補正は禁止する
* 独自例外は追加しない
* 例外は既存方針に従う

---

# 9. 完了条件

以下を満たすこと。

* [x] OutputRequest を入力できる
* [x] 指定パスへ保存できる
* [x] UTF-8 で保存できる
* [x] 親ディレクトリを自動作成できる
* [x] 保存した `Path` を返却できる
* [x] Phase4-0 と整合している
* [x] 単一責務（ローカル保存処理のみ）を維持している

---

# 10. 将来拡張方針

FileWriter はローカル保存のみを担当する。

保存先の切替は Phase4-2 DestinationRouter が担当する。

```text
OutputRequest
      │
      ▼
DestinationRouter
      │
      ├── FileWriter（Local）
      ├── GitWriter
      ├── NotionWriter
      ├── SlackWriter
      └── DiscordWriter
```

FileWriter に保存先判定や外部連携を持たせず、I/O層の単一責務を維持する。

---

# Version 1.0（Approved）

* OutputRequest を受け取る FileWriter を正式定義
* ローカルファイル保存処理を担当
* 保存要件（UTF-8・上書き保存）を明文化
* 保存先決定を Phase4-2 へ分離
* 外部サービス連携を Phase4-3 へ分離
* 単一責務（ローカル保存処理のみ）を維持
* Phase4 全体の責務分離構造を確立
