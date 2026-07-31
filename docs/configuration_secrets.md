# Configuration / Secrets Management（Phase6-0）

仕様: `docs/specs/configuration_secrets_management_phase6_0.md`

---

## 方針

| 環境 | 設定 | Secrets |
|---|---|---|
| 開発（local） | `.env`（Git管理外） | `.env` にのみ実値を保持 |
| 開発テンプレート | `.env.example`（Git管理対象） | 項目名のみ・実値なし |
| CI/CD | Workflow `env` | GitHub Actions Secrets（`${{ secrets.* }}`） |
| 本番 | 環境変数 / Environment Secrets | 開発環境へ混入させない |

---

## ローカル開発

1. `.env.example` をコピーして `.env` を作成する
2. 必要な値を `.env` にのみ記入する
3. `.env` をコミットしない

```bash
cp .env.example .env
```

アプリケーションは環境変数から取得する（例: `os.environ.get("API_KEY")`）。
必須設定が不足している場合は起動／処理失敗とし、値の補正は行わない。

---

## CI/CD（GitHub Actions）

* Secret 値を Workflow YAML へ直接記載しない
* Repository Secret または Environment Secret を参照する
* ログへ Secret 値を出力しない

参照形式の例:

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
  DISCORD_TOKEN: ${{ secrets.DISCORD_TOKEN }}
  DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

### 既存 Workflow で利用中の Secrets

| Secret 名 | 利用 Workflow |
|---|---|
| `DISCORD_TOKEN` | `discord_morning.yml` |
| `DISCORD_WEBHOOK_URL` | `pm.yml`, `sox_protocol.yml` |
| `SOX_MOTOMOTO` | `sox_protocol.yml` |
| `SOX_HYOKA` | `sox_protocol.yml` |

非Secret設定（例: チャンネル ID）は GitHub Actions Variables（`vars.*`）でも可。

### Secret 登録手順（Repository）

1. GitHub → Settings → Secrets and variables → Actions
2. New repository secret
3. Name は `.env.example` / Workflow の参照名と一致させる
4. Value に実値を設定する（リポジトリには保存しない）

Release（Phase5-4）でも同様に Actions Secrets を利用し、Workflow へ直書きしない。

---

## 本番 / デプロイ

* 本番用 Secret は開発用 `.env` と分離する
* CI 用 Secrets も本番と独立管理する
* staging / production の Environment Secrets は分離する（Phase6-1）
* デプロイ手順: `docs/deployment.md`

---

## 禁止事項

* Secret のハードコード
* `.env` のコミット
* Workflow への Secret 直書き
* ログへの Secret 出力
* 設定値の自動補正
* `tools/secretary/` のビジネスロジック変更（本フェーズ対象外）
