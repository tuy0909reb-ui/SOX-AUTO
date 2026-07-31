# AI編集秘書 Deployment Automation仕様（Phase6-1）

**Version:** 1.0  
**Status:** Approved（Phase6-1）  
**Target:** `.github/workflows/` / デプロイ設定  
**Type:** 運用工程整備（既存機能変更なし）

---

# 1. 目的

Phase6-1 Deployment Automation は、Phase5-4 Release Automationで生成された成果物と、Phase6-0 Configuration / Secrets Managementで整備された設定・Secretsを前提に、staging / production へのデプロイ工程を自動化するフェーズである。

本フェーズは以下のみを担当する。

- デプロイ対象の定義
- デプロイ方式の定義
- 対象環境（staging / production）の定義
- Rollback方針の定義
- Quality Gate結果を利用したデプロイ条件管理

本番コード（`tools/secretary/`）の処理内容変更は行わない。

---

# 2. 責務

Deployment Automation の責務：

```text
Quality Gate Result
        │
        ▼
Release Artifact
        │
        ▼
Deploy Workflow
        │
        ├── Environment Select (staging / production)
        ├── Configuration Apply
        ├── Artifact Deploy
        └── Result Report / Rollback Option
```

具体的には：

1. デプロイ対象（Release Artifact・Deployment Package・Environment Configuration）の扱いを定義する
2. GitHub Actionsによるデプロイ方式を定義する
3. staging / production 環境へのデプロイ経路を定義する
4. Rollback方針（前バージョン復帰・tag単位管理）を定義する
5. Phase5-3 Quality Gate結果をデプロイ条件として利用する

以上のみ。

---

# 3. 対象範囲

対象：

```text
.github/workflows/
Deployment設定
Environment設定（staging / production）
```

例：

```text
.github/
 └── workflows/
      ├── release.yml
      └── deploy.yml
```

---

# 4. デプロイ対象

デプロイ対象は Phase5-4 で生成された成果物および設定ファイルとする。

対象：

```text
Release Artifact
Deployment Package
Environment Configuration
```

要件：

* Release Artifactをそのまま利用する（内容変更しない）
* Deployment Packageは定義された形式で管理する
* Environment ConfigurationはPhase6-0の方針に従い環境別に適用する
* デプロイ対象を明示的に定義する
* 成果物生成工程とデプロイ工程を分離する

---

# 5. デプロイ方式

## 5-1 GitHub Actions経由

デプロイはGitHub Actions Workflowを用いて実行する。

例：

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options:
          - staging
          - production
```

要件：

* GitHub Actionsをデプロイ経路とする
* 手動トリガー（workflow_dispatch）を基本とする
* 必要に応じてtagベースの自動トリガーを追加可能とする
* Quality Gate通過済み成果物のみ対象とする

---

## 5-2 Environment利用

GitHub Environmentsを利用して環境を分離する。

対象：

```text
staging
production
```

要件：

* 環境ごとにSecrets・設定を分離する
* stagingは検証用環境として利用する
* productionは本番環境として利用する
* production deploymentには承認ゲートを設定可能とする
* 本番反映前に明示的な承認ポイントを設ける

---

# 6. 対象環境

対象環境：

```text
staging
      │
      ▼
production
```

要件：

* stagingは検証環境として利用する
* productionは本番環境として利用する
* staging → production の段階的反映を前提とする
* 環境ごとの設定・Secretsを分離する

---

# 7. Secrets利用

Secrets利用はPhase6-0の方式を継承する。

```text
Development
    ↓
.env / .env.example

CI/CD / Deployment
    ↓
GitHub Actions Secrets
(Environment Secrets含む)
```

要件：

* デプロイ時に必要な認証情報はGitHub Secretsから取得する
* SecretsをWorkflow内へ直接記載しない
* ログへSecrets値を出力しない
* 環境ごとにSecret管理を分離する

---

# 8. Quality Gate連携

Deployment AutomationはPhase5-3 Quality Gate結果を利用する。

要件：

* Quality Gate未通過状態ではproductionデプロイを実行しない
* Coverage基準未達状態を許容しない
* CI成功状態をデプロイ前提条件とする
* 品質判定自体はPhase5-3の責務とする

責務分離：

```text
Phase5-3
Quality Gate判定

        ↓

Phase6-1
Deployment可否判定
```

---

# 9. Rollback方針

Rollbackは前バージョンへの復帰を基本とし、tag単位で管理する。

例：

```text
v1.2.0
 ↓
v1.1.0へ復帰
```

要件：

* Release tagを単位とした復帰を可能にする
* Rollback用デプロイ経路を定義する
* RollbackもGitHub Actions経由で実行する
* Rollback対象を明示的に指定可能にする

---

# 10. 禁止事項

以下は禁止する。

* 自動無制限デプロイ
* Secret値のコード・Workflowへの埋め込み
* 本番コード（`tools/secretary/`）の直接変更
* Quality Gate未通過状態でのproductionデプロイ
* 手動承認なしのproduction直接デプロイ
* デプロイ結果の改ざん
* 成果物内容のデプロイ時変更

Deployment Automationは、成果物の環境反映のみを担当し、品質判定やコード変更は担当しない。

---

# 11. エラー方針

* デプロイ失敗 → Deploy Workflow Failure
* Secrets取得失敗 → デプロイ中断
* 対象環境不整合 → エラー
* Quality Gate未通過 → デプロイ中断
* Rollback失敗 → エラーとして記録し再試行可能な状態を維持する

補正処理（自動再設定・自動修正）は行わない。

---

# 12. 完了条件

以下を満たすこと。

* [ ] `deploy.yml`等のDeployment Workflowが存在する
* [ ] staging / production環境が定義されている
* [ ] GitHub Environmentsまたは同等の環境分離が設定されている
* [ ] Secrets利用方式がPhase6-0と整合している
* [ ] Release Artifactからのデプロイ経路が定義されている
* [ ] Phase5-3 Quality Gate結果がデプロイ条件として利用されている
* [ ] Rollback方針が定義されている
* [ ] 本番コード（`tools/secretary/`）変更がない

---

# 13. 将来拡張方針

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

* Blue-Green Deployment
* Canary Deployment
* 環境別デプロイ戦略
* 自動承認フロー
* デプロイ履歴管理
* デプロイ失敗時の自動通知

などを追加可能。

---

# Version 1.0（Approved）

* Phase6-1 Deployment Automationを正式定義
* Release Artifactと設定管理基盤を前提としたデプロイ工程を明確化
* staging / productionの二段階環境構成を採用
* Secrets利用方式をPhase6-0と一貫化
* Quality Gateとの接続条件を明文化
* Rollback方針をtag単位で定義
* Phase6-2 Monitoring / Operationsへの基盤を確立
