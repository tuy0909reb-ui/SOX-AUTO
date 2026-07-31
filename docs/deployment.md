# Deployment Automation（Phase6-1）

仕様: `docs/specs/deployment_automation_phase6_1.md`  
Secrets: `docs/configuration_secrets.md`（Phase6-0）

---

## Workflow

| Workflow | ファイル | 役割 |
|---|---|---|
| Release | `.github/workflows/release.yml` | tag / 手動で成果物生成・GitHub Release作成（デプロイしない） |
| Deploy | `.github/workflows/deploy.yml` | Release成果物を staging / production へ反映（内容変更なし） |

---

## GitHub Environments（必須セットアップ）

リポジトリ Settings → Environments で以下を作成する。

| Environment | 用途 | 推奨保護 |
|---|---|---|
| `staging` | 検証 | なし、または軽量 |
| `production` | 本番 | **Required reviewers**（承認ゲート） |

Environment Secrets は環境ごとに分離し、Workflow へ直書きしない。

---

## Deploy 手順

1. Release Workflow または `v*` tag で GitHub Release と成果物を作成する
2. Actions → **Deploy** → Run workflow
3. 入力:
   - `environment`: `staging` または `production`
   - `action`: `deploy` または `rollback`
   - `release_tag`: 例 `v1.0.0`（rollback 時は復帰先 tag）
4. production は Environment 承認後に実行される（Settings で reviewer 設定時）

### Quality Gate

* `production` デプロイ前に、対象 tag の commit で **Test** workflow（`test.yml`）の成功実行が必須
* 未通過・未実行なら Deploy は Failure（隠蔽しない）
* `staging` は Quality Gate job をスキップ（検証用）

---

## Rollback

* `action=rollback` とし、復帰先の `release_tag`（例: `v1.1.0`）を指定する
* 同一 Deploy Workflow 経由（自動補正なし）
* 成果物は当該 Release から再取得し、内容変更しない

```text
v1.2.0
 ↓
v1.1.0（release_tag に指定）
```

---

## 成果物経路

```text
Release (tag v*)
  → GitHub Release assets
  → Deploy: download（未加工）
  → deploy-package + DEPLOYMENT_META.txt
  → workflow artifact として保管
```

ホスト／ランタイムへの最終 publish は Environment 側の運用設定に委ねる。  
本 Workflow は成果物の環境反映準備と監査用パッケージ化を担い、アプリコードは変更しない。

---

## 禁止事項（再掲）

* Secrets の Workflow 直書き・ログ出力
* Quality Gate 未通過での production デプロイ
* 承認なし production（Environment 保護で制限）
* `tools/secretary/` のデプロイ時改変
* エラーの Success 化

障害時の判断・初動: `docs/operations.md` / `docs/incident_response.md`（Phase6-3-A）  
Rollback **実行**は本ドキュメントの Deploy 手順に従う（判断基準は Incident Response）。
