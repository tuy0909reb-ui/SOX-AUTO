# Security Operations（Phase7-2）

仕様: `docs/specs/security_operations_phase7_2.md`  
Secrets Policy: `docs/secrets_policy.md`  
Dependency / Vulnerability: `docs/dependency_management.md`  
Audit Preparation: `docs/audit_preparation.md`  
Governance: `docs/governance.md` / `docs/change_management.md`（Phase7-0）  
Configuration / Secrets（Phase6-0）: `docs/configuration_secrets.md`  
Incident Response: `docs/incident_response.md`（Phase6-3-A）

本ドキュメントはセキュリティ**運用・監査の管理基盤**のみを定義する。  
自動 Patch・自動脆弱性修正・Secrets 自動更新・`tools/secretary/` 変更・Infrastructure 変更は行わない。

---

## 1. Security Responsibility（責務定義）

| 責務 | 担当文書 | 内容 | 担当外 |
|---|---|---|---|
| Secrets 管理方針 | `secrets_policy.md` | 保存・更新・削除・露出禁止 | Secret 値の記載、自動 Rotation 実装 |
| Dependency 管理 | `dependency_management.md` | 依存関係・脆弱性の取得と更新判断 | 自動 Patch、Infrastructure 脆弱性 |
| Security Review | 本ドキュメント §2 | 定期レビュー・記録・改善候補 | 技術実装方式の決定 |
| Audit 準備 | `audit_preparation.md` | 運用・変更・Security 記録の整理 | 法的 Compliance 判断、認証取得 |
| Security Incident 境界 | 本ドキュメント §4 | 定義・エスカレーション・Runbook 接続 | 自動復旧、Rollback 実行 |

Governance（Phase7-0）との重複回避:

* Governance: 変更承認フロー・リスク受容・境界維持
* Security Operations: セキュリティ観点の方針・レビュー・監査準備（実装判断は行わない）

---

## 2. Security Review Process

### 2-1 レビュー種別

| 種別 | 周期 | 主な評価項目 |
|---|---|---|
| Monthly Security Review | 毎月 1 回 | Secrets 方針遵守、Workflow ログ露出、Review 記録、改善 Item |
| Dependency Risk Review | Monthly または重大 CVE 時 | `dependency_management.md` に沿った依存・脆弱性状況 |
| Secrets Review | Monthly または露出疑い時 | 登録キー名の整合、Environment 分離、`.env` 非コミット |

### 2-2 評価項目（固定）

* [ ] Secrets がリポジトリ・ログ・通知・Incident 記録に含まれていない
* [ ] Phase6-0 / `secrets_policy.md` との整合
* [ ] 未承認の Secrets / Security 関連変更がない（Change Management）
* [ ] Dependency / 脆弱性の確認結果（取得可能な範囲）
* [ ] Security Incident 候補の有無と Incident Response への接続
* [ ] Audit 準備に必要な記録が欠けていない（`audit_preparation.md`）

### 2-3 記録方法

レビューごとに最低限記録する:

```text
Review ID: SEC-YYYYMM-NNN
実施日:
実施者:
承認者:（Phase7-0 Governance に従う）
Secrets Review 結果:
Dependency / Vulnerability 要約:
Security Incident 候補:
Improvement Items:
  - ID / 内容 / 関連 CHG（あれば）
次回までのアクション:
```

改善を伴う場合は `docs/change_management.md` と `docs/risk_management.md` を経由する。

### 2-4 承認経路

Phase7-0 Governance に従う。未承認の Security 方針変更・Secrets 登録変更は適用禁止。

---

## 3. Phase 接続

| Phase | 接続内容 |
|---|---|
| Phase6-0 | Secrets 方式（`.env` / GitHub Actions Secrets）を継承 |
| Phase6-2 / 6-3-B | Monitoring / Observability のログ・通知における Secret 非露出 |
| Phase6-3-A | 一般 Incident 初動・Severity・Rollback 判断 |
| Phase7-0 | Change Management / Risk / 境界 |
| Phase7-1 | Reliability Review と並行可能。Security 観点は Security Review（Phase7-2） |
| Phase7-2 | Security Review / Audit 記録は信頼性 Review の補助材料になり得る |
| Phase7-3 | Advanced Automation の Policy/Audit（`advanced_automation.md` / `automation_audit.md`）を Security Review で参照 |
| Phase8-0 | AI 利用時の Secret 非露出・AIA- 記録・AI による Security 判断禁止（`ai_governance.md` / `ai_compliance.md`） |
| Phase8-2 | Security Review 記録の Knowledge Trust/Version（`knowledge_management.md`）。Secret は Knowledge 化しない |

---

## 4. Security Incident Boundary

Security Incident は、セキュリティ侵害またはその疑いを要する事象とする。  
**対応判断は人間が行う。** 自動復旧・自動 Rollback は禁止。

### 4-1 定義例

| 種別 | 例 | 備考 |
|---|---|---|
| Secrets 露出 | ログ・Issue・コミットへの Secret 値混入 | 値は記録に含めず「露出の有無」のみ |
| 不正アクセス疑い | 想定外の Workflow 実行、権限逸脱の疑い | 証拠は Actions 履歴等 |
| 脆弱性悪用疑い | 既知 CVE の悪用が疑われる事象 | 判断は人間 |
| 依存関係の重大脆弱性 | 管理対象依存の Critical 相当の公表 | `dependency_management.md` 参照 |

### 4-2 Incident Response（Phase6-3-A）との境界

| 観点 | Security Operations | Incident Response |
|---|---|---|
| 役割 | Security 事象の定義・エスカレーション条件 | 初動・Severity・Rollback 判断・記録 |
| Severity | Security 観点でエスカレーション推奨を記述 | SEV1〜SEV4 を人間が確定 |
| Rollback | 判断材料の提供のみ | Phase6-1 Deploy で実行 |
| 記録 | Security Review / SEC- 記録 | `incident_template.md` |

### 4-3 エスカレーション条件

以下のいずれかに該当する場合、Security Incident 候補とし Incident Response 初動フローへ接続する:

1. Secrets 露出が確認された（または強く疑われる）
2. production または Secrets 境界に関わる未承認変更が確認された
3. 重大脆弱性が悪用された疑いがある
4. 不正アクセスまたは権限逸脱の疑いがある

手順:

```text
Security 事象検知 / Review で候補化
        ↓
docs/incident_response.md 初動フロー（固定順）
        ↓
Severity 確定（人間）
        ↓
必要時 Rollback 判断 → Phase6-1 Deploy
        ↓
Incident 記録 + Security Review 記録
```

Secret ローテーションが必要な場合も Change Management 経由とし、自動更新は行わない。

---

## 5. 禁止事項（再掲）

* 本番コード（`tools/secretary/`）変更
* Secret 値の文書・ログ・通知への記載
* 自動 Patch / 自動脆弱性修正 / Secrets 自動 Rotation
* AI による脆弱性・Security Incident の正式確定
* Security 設定の無承認変更
* Infrastructure 変更
