# AI編集秘書 Monitoring / Operations仕様（Phase6-2）

**Version:** 1.0  
**Status:** Approved（Phase6-2）  
**Target:** CI通知設定 / ログ管理設定 / 運用ドキュメント  
**Type:** 運用監視基盤整備（既存機能変更なし）

---

# 1. 目的

Phase6-2 Monitoring / Operations は、Phase6-1 Deployment Automation により構築されたデプロイ環境に対して、  
**稼働状態・実行結果・障害状態を把握可能にする運用監視基盤を整備するフェーズ**である。

本フェーズは以下のみを担当する。

- Workflow実行状態の確認  
- 障害検知  
- ログ確認手順整備  
- 通知経路定義  
- 運用Runbook整備  

本番コード（`tools/secretary/`）の変更は行わない。

---

# 2. 責務

Monitoring / Operations の責務：

```text
Application / CI / Deployment
          │
          ▼
Monitoring Layer
          │
          ├── Status Check
          ├── Log Collection
          ├── Failure Detection
          └── Notification
```

具体的には：

1. Deployment結果を確認可能にする
2. CI失敗・Deploy失敗を検知する
3. 必要なログ確認方法を定義する
4. 障害時の確認手順を定義する

以上のみ。

---

# 3. 対象範囲

対象：

```text
.github/workflows/
通知設定
ログ管理設定
docs/
運用手順書
```

例：

```text
.github/
 └── workflows/

docs/
 └── operations.md
```

---

# 4. 実装内容

## 4-1 Workflow状態監視

対象：

* test workflow
* release workflow
* deploy workflow

要件：

* Success / Failure を確認可能にする
* Failure を隠蔽しない
* 実行履歴を保持する

---

## 4-2 ログ管理方針

対象ログ：

* CIログ
* Deployログ
* Applicationログ（取得可能な範囲）

要件：

* 障害調査時に確認可能であること
* Secrets値を含めないこと
* ログ保持方針を定義すること

---

## 4-3 障害通知

対象：

* Workflow Failure
* Deploy Failure
* Configuration Error

通知方式例：

* GitHub通知
* 外部通知サービス（将来拡張）

要件：

* 障害発生を把握可能にする
* 通知内容へSecretsを含めない
* 通知失敗を成功扱いにしない

---

# 4-4 運用Runbook整備

作成対象：

```text
docs/operations.md
```

内容：

* デプロイ確認手順
* 障害確認手順
* Rollback判断手順
* ログ確認方法

---

# 5. 公開インターフェース変更

なし。

対象：

```text
tools/secretary/
```

は既存動作を維持する。

---

# 6. Monitoring / Operations が行わないこと（禁止）

禁止：

* 本番コード変更
* 自動復旧
* AIによる障害判断
* 自動修正
* Infrastructure変更
* Database変更
* Secrets値変更
* デプロイ方式変更
* Auto Scaling
* Blue-Green / Canary 導入
* 既存Connectorを通知用途へ流用する実装

Monitoring / Operations は **状態把握と運用手順整備のみ担当する**。

---

# 7. エラー方針

* Workflow Failure → Failureとして記録
* Notification Failure → Failureとして記録
* Log取得失敗 → エラー記録

補正処理は禁止。

---

# 8. 完了条件

以下を満たすこと。

* [ ] CI / Release / Deploy状態を確認可能
* [ ] Failure状態を検知可能
* [ ] ログ確認手順が存在する
* [ ] 障害通知経路が定義されている
* [ ] 通知経路の動作確認が可能
* [ ] Rollback確認手順が存在する
* [ ] Secretsがログへ露出しない
* [ ] `tools/secretary/` 未変更

---

# 9. 将来拡張方針

```text
Phase6-1
Deployment Automation
        ↓
Phase6-2
Monitoring / Operations
        ↓
Phase6-3
Advanced Operations
```

将来的には：

* メトリクス監視
* Alertルール高度化
* 自動復旧
* SLA/SLO管理
* 分散トレーシング

などを追加可能。

---

# Version 1.0（Approved）

* Phase6-2 Monitoring / Operations を正式定義
* Deployment後の状態把握責務を明確化
* ログ・通知・運用手順を対象化
* 自動復旧や高度なSRE領域を対象外化
* 通知用途と既存Connector責務の分離を明確化
* Phase6-1 Deployment Automation後の運用基盤として位置付け
