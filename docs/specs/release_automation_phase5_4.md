# AI編集秘書 Release Automation仕様（Phase5-4）

**Version:** 1.0  
**Status:** Approved（Phase5-4）  
**Target:** `.github/workflows/` / Release設定  
**Type:** リリース自動化基盤整備（既存機能変更なし）

---

# 1. 目的

Phase5-4 Release Automation は、Phase5-2 CI/CD Integration および Phase5-3 Coverage / Quality Gate により品質確認された状態から、リリース作業を自動化するフェーズである。

本フェーズは以下のみを担当する。

- リリース条件確認
- バージョン情報管理
- リリース成果物生成
- Release情報作成

本番コード（`tools/secretary/`）には一切変更を加えない。

---

# 2. 責務

Release Automation の責務：

```text
Quality Gate Pass
        │
        ▼
Release Workflow
        │
        ├── Version Check
        ├── Artifact Build
        ├── Release Creation
        └── Result Report
```

具体的には：

1. リリース開始条件を定義する
2. バージョン情報を確認する
3. 成果物を生成する
4. リリース情報を作成する
5. 結果をCIへ反映する

以上のみ。

---

# 3. 対象範囲

対象：

```text
.github/workflows/
Release設定
Version管理ファイル
```

例：

```text
.github/
 └── workflows/
      ├── test.yml
      └── release.yml
```

---

# 4. 実装内容

## 4-1 Release Workflow定義

Release用Workflowを追加する。

Release Triggerは以下の両方を対応する。

```yaml
on:
  workflow_dispatch:
  push:
    tags:
      - "v*"
```

要件：

* Git tag（`v1.0.0`等）による自動リリース起動に対応する
* workflow_dispatchによる手動リリース起動に対応する
* CI成功状態を前提条件とする
* 自動デプロイは行わない

---

## 4-2 Version管理

リリースバージョンを一元管理する。

例：

```text
VERSION
pyproject.toml
package metadata
```

要件：

* バージョン不整合を検出可能にする
* リリース情報へ反映する
* Release対象バージョンを明確化する

---

## 4-3 Artifact生成

リリース対象成果物を生成する。

例：

```text
source archive
package archive
documentation bundle
```

要件：

* 再現可能な生成処理とする
* 生成失敗はRelease Failureとして扱う
* 成果物内容を自動変更しない

---

## 4-4 Release作成

GitHub Release等へリリース情報を作成する。

要件：

* Version情報を付与する
* 成果物を紐付ける
* 作成結果をCIへ反映する

---

# 5. 公開インターフェース変更

なし。

対象：

```text
tools/secretary/
```

は変更しない。

---

# 6. Release Automationが行わないこと（禁止）

以下は禁止する。

* 本番コード変更
* デプロイ処理
* サーバー更新
* 外部サービス公開
* 秘密情報管理変更
* CI結果改ざん
* 品質判定変更
* AIによるリリース判断
* 自動承認

Release Automationは**成果物作成とリリース処理のみ担当する**。

---

# 7. エラー方針

* Quality Gate失敗 → Release不可
* Artifact生成失敗 → Release Failure
* Version不整合 → Release Failure
* 補正処理は禁止

---

# 8. 完了条件

以下を満たすこと。

* [ ] Release Workflowが存在する
* [ ] Git tagによるRelease Triggerが動作する
* [ ] workflow_dispatchによる手動実行が可能
* [ ] リリース条件が定義されている
* [ ] Version管理方法が定義されている
* [ ] Artifact生成が可能
* [ ] Release情報作成が可能
* [ ] CI/CD既存フローと整合する
* [ ] 本番コード変更がない

---

# 9. 将来拡張方針

```text
Phase5-3
Coverage / Quality Gate
        ↓
Phase5-4
Release Automation
        ↓
Phase6
Deployment / Operations
```

将来的には：

* 自動デプロイ
* 環境別リリース
* 承認ワークフロー
* Rollback
* Changelog自動生成

などを追加可能。

---

# Version 1.0（Approved）

* Phase5-4 Release Automationを正式定義
* CI/CDパイプラインのリリース工程を明確化
* Git tagおよびworkflow_dispatchによるRelease Trigger方式を採用
* 成果物生成とデプロイを分離
* 本番コード変更禁止を明文化
* Phase6以降の運用工程への基盤を確立
