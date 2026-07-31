# Operational Automation（Phase6-3-C）

仕様: `docs/specs/operational_automation_phase6_3_c.md`  
Observability: `docs/observability.md`  
Incident Response: `docs/incident_response.md`  
Operations hub: `docs/operations.md`  
Advanced Automation（Phase7-3）: `docs/advanced_automation.md`

本ドキュメントは定型運用の自動化と情報提供のみを定義する。  
自動復旧・自動 Rollback・AI 障害判断・既存 CI/Release/Deploy 責務変更は行わない。

**Phase7-3 との境界:** 本フェーズは「定型作業の自動化」。Policy / Risk / Approval 付きの制約実行・判断支援は `docs/advanced_automation.md` を用いる。

---

## 1. Workflow 一覧

| Workflow | ファイル | トリガー | 役割 |
|---|---|---|---|
| Maintenance | `.github/workflows/maintenance.yml` | `schedule`（毎日 00:00 UTC） / `workflow_dispatch` | 定期 Health Check・状態確認・Daily Report |
| Operations | `.github/workflows/operations.yml` | `workflow_dispatch` | Status Collection / Runbook 補助 |

既存の Test / Release / Deploy Workflow の処理内容は変更しない。

---

## 2. Scheduled Operation Automation

### 実行周期

* Maintenance: 毎日 `0 0 * * *`（UTC）
* 手動再実行: Actions → Maintenance → Run workflow

### 実施内容

1. Test / Release / Deploy / Maintenance / Operations の最新状態を収集
2. Failure Summary / Deployment Summary をレポートへ記録
3. `ops-report/` を artifact として保管
4. 収集失敗、または Deploy / Maintenance / Operations の直近 Failure 検知時は **job Failure**（成功補正しない）

### 結果確認

* Actions → Maintenance → 当該 run
* Artifacts → `daily-operation-report-<run_id>`

---

## 3. Status Collection Automation

Operations Workflow（`mode=status_collect`）で実施する。

収集対象（Phase6-3-B 整合）:

| 対象 | ソース |
|---|---|
| CI状態 | `test.yml` run 履歴 |
| Deploy状態 | `deploy.yml` run 履歴 |
| Workflow履歴 | test / release / deploy / maintenance / operations |
| Incident情報 | Workflow Failure イベントの提示（人間の Incident 記録は変更しない） |

* 元の Workflow データは読み取りのみ
* 取得失敗は ERROR として記録し、job を Failure にする

---

## 4. Report Generation Automation

| レポート | 生成元 | 形式 |
|---|---|---|
| Daily Operation Report | Maintenance | Markdown artifact `ops-report/daily-operation-report.md` |
| Deployment Summary | Maintenance 内セクション | 同上（Deploy 履歴の列挙） |
| Failure Summary | Maintenance 内セクション | 同上（Failure run の列挙） |
| Status Collection | Operations | Markdown + JSON snapshot under `ops-assist/` |

生成失敗・パース失敗は Error / Failure。元データ（アプリ・Release 成果物）は変更しない。

---

## 5. Notification Automation

既存通知経路（Phase6-2）を利用する。

| 事象 | 連携方式 |
|---|---|
| Workflow Failure | GitHub Actions 失敗通知 / UI |
| Deploy Failure | 同上（Deploy run）+ Maintenance が検知して Failure |
| Scheduled Task Failure | Maintenance / Operations の Failure → 同上 |

要件:

* Secrets を通知・レポート本文へ含めない
* 通知基盤の再設計・新規チャネル追加はしない
* 通知失敗（例: artifact 未アップロードで調査不能）は成功扱いにしない — run を Failure のまま残す

---

## 6. Runbook Automation Support

Operations Workflow（`mode=runbook_assist`）:

```text
Incident発生（または手動起動）
      ↓
状態情報取得（Status Collection）
      ↓
確認項目チェックリスト提示
      ↓
人間が Severity / Rollback を判断
```

* 判断材料の提供のみ
* 復旧・Rollback 実行は自動化しない（Rollback は Phase6-1 Deploy）
* 詳細手順: `docs/incident_response.md`

---

## 7. 自動処理と人間判断の境界

| Automation が行う | 人間が行う |
|---|---|
| 状態収集・レポート生成・チェックリスト提示 | Severity 判定 |
| Workflow Failure の Failure 記録 | Rollback 要否判断 |
| 既存 GitHub 通知経路への Failure 露出 | Rollback 実行（Deploy）、Incident 記録完成 |

---

## 8. 禁止事項（再掲）

* `tools/secretary/` 変更
* 自動復旧 / 自動 Rollback / 無条件デプロイ
* AI による障害判断・原因の自動確定
* Infrastructure / Database / Secrets / Security 設定の自動変更
* 既存 CI / Release / Deploy Workflow の責務変更

## 9. Phase7-3 への引き継ぎ

制約付き実行・変更適用・承認付き Automation は `docs/advanced_automation.md` / `docs/automation_policy.md` / `docs/automation_audit.md` を用いる。  
本ドキュメントの定型 Workflow は Trigger / 情報収集として利用し、責務を重複させない。
