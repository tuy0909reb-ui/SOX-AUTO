# Audit / Compliance Preparation（Phase7-2）

仕様: `docs/specs/security_operations_phase7_2.md`  
Security ハブ: `docs/security.md`  
Governance: `docs/governance.md` / `docs/change_management.md`

監査・コンプライアンス**準備**に必要な情報の整理方針を定義する。  
自動監査基盤の構築は行わない。

---

## 1. 対象（Audit Preparation が整理するもの）

| カテゴリ | 内容 | 主なソース |
|---|---|---|
| 運用ログ | Workflow 実行履歴、Deploy 結果、Maintenance レポート | GitHub Actions、artifact |
| 変更履歴 | 運用・Security 関連の承認済み変更 | CHG 記録、git 履歴（文書・Workflow） |
| Security 記録 | Security Review、Secrets Review、Dependency Review、Security Incident 関連 | SEC- 記録、Incident 記録（Secret 値なし） |

---

## 2. 記録形式（最低限）

監査時に参照可能なよう、以下を揃える。

### 2-1 運用ログ

* Actions run URL、日時、Success/Failure、対象 Workflow 名
* Deploy: environment / release_tag / action（`deployment.md`）
* Daily Operation Report artifact（`automation.md`）

### 2-2 変更履歴

* Change ID（`CHG-…`）、起案・承認・適用日、変更概要
* 緊急変更の事後記録
* Risk 等級と承認者

### 2-3 Security 記録

* Security Review ID（`SEC-…`）
* Secrets Review 結果（キー名・整合性のみ、値なし）
* Dependency / Vulnerability 判断サマリ
* Security Incident 候補と Incident 記録へのリンク

---

## 3. 整備手順（手動）

1. Monthly Security Review 実施時に、上記カテゴリの欠損を確認する
2. 欠損があれば Improvement Item として記録し Change Management で補完計画を立てる
3. Reliability Review（`review_process.md`）と重複する材料は相互参照で足す
4. Secret 値・トークンは監査パッケージに含めない

---

## 4. 対象外

以下は本フェーズの Audit Preparation では扱わない。

* 法的 Compliance 適合の判断
* 認証取得（ISO / SOC 等）の対応そのもの
* 外部契約要件（SLA / DPA 等）の充足判断
* 自動 Compliance スキャン基盤の構築

必要になった場合は Governance / 法務 / 別 Phase で扱う。

---

## 5. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7-0 | 変更履歴・承認記録の形式 |
| Phase7-1 | Reliability Review 記録（運用品質の補助材料） |
| Phase6-2 / 6-3-C | 運用ログ・レポート artifact |
| Phase6-3-A | Incident 記録 |
| Phase7-2 Security Review | SEC- 記録の定期生成 |

---

## 6. 禁止事項

* 監査用に Secret 値をまとめたファイルを作成すること
* 記録の改ざん・Failure の Success 化
* 監査準備を理由とした無承認 Infrastructure 変更
