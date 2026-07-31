# Secrets Management Policy（Phase7-2）

仕様: `docs/specs/security_operations_phase7_2.md`  
Phase6-0 継承: `docs/configuration_secrets.md`  
Security ハブ: `docs/security.md`  
変更管理: `docs/change_management.md`（Phase7-0）

Phase6-0 Configuration / Secrets Management 方式を継承する。  
本ポリシーは Security 観点での保存・更新・削除・露出禁止を定義する。  
**Secret 値は一切記載しない。** 自動更新・自動 Rotation の実装は行わない。

---

## 1. 対象

| 種別 | 管理場所 | 用途 |
|---|---|---|
| GitHub Actions Secrets | Repository / Environment Secret | CI/CD、Deploy、Release |
| GitHub Actions Variables | `vars.*`（非 Secret 設定） | チャンネル ID 等 |
| Environment Variables | Workflow `env:` 参照 | 実行時注入（値は Secret から） |
| Access Tokens | GitHub Secrets / `.env`（local のみ） | API・連携認証 |
| API Keys | 同上 | 外部サービス |
| ローカル開発 | `.env`（Git 管理外） | 開発者環境のみ |
| テンプレート | `.env.example`（Git 管理） | 項目名のみ、実値なし |

---

## 2. 保存ルール

* Secret 値をリポジトリ（コード・Workflow YAML・docs）に保存しない
* `.env` は Git 管理対象外（`.gitignore` 確認済み）
* `.env.example` には項目名のみ記載し、実値は空またはプレースホルダーに留める
* CI/CD では `${{ secrets.* }}` または Environment Secret を参照する
* production 用 Secret を開発用 `.env` に混入させない
* Environment（staging / production）ごとに Secret を分離する

---

## 3. 更新ルール

1. 更新必要性を Security Review または Incident で確認する
2. `change_management.md` で起案・影響確認・承認を得る
3. GitHub Settings → Secrets（または Environment Secrets）で値を更新する
4. Workflow 参照名（キー名）を変更する場合は `.env.example` と文書を同期する
5. 更新結果を記録する（値は書かず、キー名・日時・承認者のみ）

禁止:

* Workflow への Secret 直書き
* 未承認更新
* 自動 Rotation ジョブの追加（本フェーズ）

---

## 4. 削除ルール

* 不要になった Secret は Environment / Repository から削除する
* 削除も Change Management 経由（影響: 依存 Workflow の失敗）
* 削除記録にキー名・日時・理由を残す（値は記載しない）
* 削除後、Workflow が意図どおり失敗する場合は Failure を隠蔽しない

---

## 5. 露出禁止方針

| 場所 | 方針 |
|---|---|
| Git 履歴 | 誤コミット時はローテーション + 履歴対応は別プロセス |
| Actions ログ | `echo` 等で Secret を出力しない |
| Incident 記録 | キー名・「露出の有無」のみ |
| 通知 | Secret 値を含めない |
| Daily Report / Automation | 収集スクリプトは Secret をログに出さない |

露出疑い時:

1. Security Incident 候補として `docs/security.md` §4 に従う
2. Incident Response 初動フローへ接続
3. 必要に応じて Secret ローテーション（手動、Change Management 経由）

---

## 6. Phase6-0 との関係

| Phase6-0 | Phase7-2（本ポリシー） |
|---|---|
| 開発: `.env` / `.env.example` | Security 観点の保存・更新・削除・露出禁止を追加 |
| CI/CD: GitHub Actions Secrets | 更新・削除・Review 手順を Security 文書化 |
| 登録手順 | `configuration_secrets.md` を参照しつつ本ポリシーで Review |

実装変更（Connector 実装等）は対象外。
