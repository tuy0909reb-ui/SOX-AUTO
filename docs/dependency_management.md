# Dependency / Vulnerability Management（Phase7-2）

仕様: `docs/specs/security_operations_phase7_2.md`  
Security ハブ: `docs/security.md`  
変更管理: `docs/change_management.md`（Phase7-0）

依存関係・脆弱性の**管理方針**のみを定義する。  
自動 Patch・自動修正・AI による脆弱性判断は行わない。  
Infrastructure 脆弱性管理は対象外。

---

## 1. 対象範囲

| 分類 | 対象 | 例 |
|---|---|---|
| Application Dependencies | アプリケーションが直接利用する依存 | Python パッケージ（`requirements-dev.txt` 等） |
| Managed Software Dependencies | リポジトリで管理するソフトウェア依存 | CI で `pip install` するパッケージ、Workflow 実行環境のツール |

対象外:

* OS / ホスト / クラウド Infrastructure の脆弱性パッチ管理
* `tools/secretary/` の機能変更を伴う依存更新（別 Change プロセス）

---

## 2. 脆弱性情報の取得方法

人手または既存ツールで取得可能な範囲とする（自動スキャナ基盤の導入は本フェーズ対象外）。

| 方法 | 内容 |
|---|---|
| 公開 Advisory | PyPI / GitHub Advisory / CVE データベースの確認 |
| 依存ファイル確認 | `requirements-dev.txt` 等のバージョン固定状況 |
| CI / ローカル | `pip audit` 等が利用可能な場合は結果を Review 材料とする（導入は Change Management 経由） |
| 上流通知 | 利用サービス・GitHub Dependabot 等の通知（設定変更は別 Phase） |

取得失敗・未確認は「未評価」と記録し、安全と断定しない。

---

## 3. 更新判断基準

| 状況 | 判断目安 | 対応 |
|---|---|---|
| Critical / High（悪用可能性が高い） | 早急に人間が影響評価 | Security Review + Change 起案 |
| Medium | 計画的に評価 | Dependency Risk Review で記録 |
| Low / 情報のみ | 次回 Review で確認 | Improvement Item 化可 |
| 不明・データ不足 | 評価保留 | 追加情報取得後に再判断 |

更新実施時:

1. 影響範囲（テスト・CI・Deploy）を確認
2. Risk 評価（`risk_management.md`）
3. Change Management で承認
4. 依存ファイル更新（必要時）— **本フェーズでは方針のみ。実際の更新は別 Change**
5. 結果確認（pytest / CI 等）

---

## 4. 対応フロー

```text
脆弱性情報取得（人間 / 既存経路）
        ↓
影響評価（対象依存・利用箇所）
        ↓
Risk 分類（Low / Medium / High）
        ↓
Change Management（更新・回避策・監視強化）
        ↓
適用（承認後のみ）
        ↓
Security Review / Dependency Risk Review に記録
```

Security Incident 候補（悪用疑い・重大 CVE 悪用）の場合は `docs/security.md` §4 へ接続し、Incident Response 初動と並行する。

---

## 5. 禁止事項

* 自動 Patch 適用
* 自動脆弱性修正
* AI による脆弱性深刻度の正式確定
* 未承認の依存バージョン変更
* Infrastructure パッチを本ポリシーの対象として扱うこと（対象外）

---

## 6. 記録

Dependency Risk Review または Security Review に以下を残す:

* 確認日
* 対象依存（名前・バージョン範囲。Secret は含めない）
* 脆弱性 ID（CVE 等、わかる範囲）
* 判断（更新 / 監視 / 保留）
* 関連 CHG ID
