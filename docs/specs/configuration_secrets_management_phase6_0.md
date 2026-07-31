# AI編集秘書 Configuration / Secrets Management仕様（Phase6-0）

**Version:** 1.0  
**Status:** Approved（Phase6-0）  
**Target:** 設定管理・Secrets管理基盤  
**Type:** 運用基盤整備（既存機能変更なし）

---

# 1. 目的

Phase6-0 Configuration / Secrets Management は、Phase5-4 Release Automation以降の運用工程に向けて、アプリケーション設定値および秘密情報を安全かつ再現可能に管理するための基盤を定義するフェーズである。

本フェーズは以下のみを担当する。

- 環境設定管理
- Secrets管理方針定義
- 設定値取得方法の標準化
- 開発・CI・本番環境の分離

本番ロジック（`tools/secretary/`）の処理内容変更は行わない。

---

# 2. 責務

Configuration / Secrets Managementの責務：

```text
Environment
     │
     ▼
Configuration Layer
     │
     ├── Application Settings
     ├── Environment Variables
     ├── Secrets Provider
     └── Runtime Configuration
```

具体的には：

1. 設定値の管理場所を定義する
2. 秘密情報の管理方法を定義する
3. 環境ごとの設定分離を定義する
4. アプリケーションへ安全に提供する方法を定義する

以上のみ。

---

# 3. 対象範囲

対象：

```text
.env.example
.env
.github/workflows/
Configuration files
Secret管理設定
```

例：

```text
.env.example
.github/
 └── workflows/
      └── secrets利用設定
```

---

# 4. Secrets管理方式

本プロジェクトでは以下の方式を採用する。

## 開発環境

```text
.env
.env.example
```

を利用する。

用途：

* ローカル開発用設定
* 開発者ごとの環境差分管理
* 必要な設定項目の提示

要件：

* `.env` はGit管理対象外とする
* `.env.example` はGit管理対象とする
* 実際のSecret値は記載しない

---

## CI/CD環境

GitHub Actions Secretsを利用する。

用途：

* CI実行時の認証情報
* Release処理時のSecret利用
* 外部サービス連携情報

要件：

* Repository SecretまたはEnvironment Secretを利用する
* Workflowへ直接Secret値を記載しない
* ログへSecret値を出力しない

---

# 5. 実装内容

## 5-1 環境変数管理

設定値は環境変数を基本とする。

例：

```text
APP_ENV
LOG_LEVEL
API_ENDPOINT
```

要件：

* 秘密情報をコードへ記載しない
* 環境ごとに変更可能にする
* 設定項目を明示する

---

## 5-2 Secrets管理

秘密情報は以下で管理する。

```text
Development
    ↓
.env

CI/CD
    ↓
GitHub Actions Secrets
```

対象例：

```text
API_KEY
TOKEN
PASSWORD
```

要件：

* リポジトリへ保存しない
* ログへ出力しない
* 通常設定と分離する

---

## 5-3 Environment分離

以下の環境を想定する。

```text
development
      │
      ▼
CI
      │
      ▼
production
```

要件：

* 環境ごとに設定を分離する
* CI用Secretsを独立管理する
* 本番設定を開発環境へ混入させない

---

## 5-4 設定取得方式

アプリケーションは環境から設定値を取得する。

例：

```python
os.environ.get("API_KEY")
```

または設定管理モジュール経由。

要件：

* 取得方法を統一する
* 必須設定の存在確認を可能にする
* 不足設定はエラーとして扱う

---

# 6. 公開インターフェース変更

なし。

対象：

```text
tools/secretary/
```

は既存動作を維持する。

---

# 7. Configuration / Secrets Managementが行わないこと（禁止）

以下は禁止する。

* ビジネスロジック変更
* AI処理変更
* Connector API実装
* デプロイ処理
* 秘密情報のハードコード
* Secretsの自動生成
* 設定値の自動補正
* 本番環境への直接変更

本フェーズは**設定管理基盤のみ担当する**。

---

# 8. エラー方針

* 必須設定不足 → 起動失敗
* Secret取得失敗 → 処理失敗
* 設定不整合 → エラー
* 補正処理は禁止

---

# 9. 完了条件

以下を満たすこと。

* [ ] `.env.example` が存在する
* [ ] 開発環境設定方法が定義されている
* [ ] CI/CD Secrets管理方法が定義されている
* [ ] 秘密情報がリポジトリへ保存されない
* [ ] 環境ごとの設定分離方針が定義されている
* [ ] Phase5-4 Release Automationと整合する
* [ ] 本番コード変更がない

---

# 10. 将来拡張方針

```text
Phase6-0
Configuration / Secrets Management
        ↓
Phase6-1
Deployment Automation
        ↓
Phase6-2
Monitoring / Operations
```

将来的には：

* Vault連携
* AWS Secrets Manager連携
* Azure Key Vault連携
* 環境別デプロイ設定
* Observability基盤

などを追加可能。

---

# Version 1.0（Approved）

* Phase6-0 Configuration / Secrets Managementを正式定義
* 開発環境は`.env`方式、CI/CDはGitHub Actions Secrets方式を採用
* 秘密情報と通常設定の分離を明文化
* 環境ごとの設定分離方針を確立
* Phase5-4 Release Automationとの接続点を定義
* Phase6-1 Deployment Automationへの基盤を構築
