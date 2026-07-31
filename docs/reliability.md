# Reliability Management（Phase7-1）

仕様: `docs/specs/reliability_management_phase7_1.md`  
SLO 方針: `docs/slo.md`  
Review 手順: `docs/review_process.md`  
Observability: `docs/observability.md`（Phase6-3-B）  
Monitoring: `docs/operations.md`（Phase6-2）  
Governance: `docs/governance.md` / `docs/change_management.md`（Phase7-0）  
Security: `docs/security.md` / `docs/secrets_policy.md`（Phase7-2）

本ドキュメントは信頼性の**測定・評価・改善管理**のみを定義する。  
Metrics 収集基盤・Dashboard・自動計測・自動復旧・`tools/secretary/` 変更は行わない。

---

## 1. 責務境界

```text
Observability Data（Phase6-3-B / Automation レポート）
        │
        ▼
Reliability Layer（本フェーズ）
        │
        ├── SLI Definition
        ├── SLO Management（docs/slo.md）
        ├── Reliability Review（docs/review_process.md）
        ├── Trend Analysis
        └── Improvement Planning
```

| 本フェーズが行うこと | 行わないこと |
|---|---|
| SLI / SLO 方針 / Review / Trend / 改善サイクルの定義 | 収集基盤・Dashboard 実装 |
| 既存レポート・Incident 記録を用いた評価材料の整理 | AI による信頼性判断・自動制御 |
| 改善候補の記録（Change Management へ接続） | 無承認の改善適用 |

---

## 2. SLI Definition（指標定義）

数値目標は固定しない（成熟後に `docs/slo.md` で設定方法に従い決定）。

| SLI | 意味 | データ取得元 | 測定方法（設計） |
|---|---|---|---|
| Availability | 対象サービス／運用経路が意図どおり利用可能な割合の指標 | Deploy 成否・Health Check 結果・Incident（生産影響） | 期間内の「利用可能と判断できる区間」／全評価区間。データ不足は評価対象外として記録 |
| Workflow Success Rate | CI / 運用 Workflow が Success で完了する割合 | GitHub Actions（Test / Maintenance / Operations 等）、Daily Report | 期間内 Success 完了数／完了 run 数（`observability.md` Metrics と整合） |
| Deploy Success Rate | Deploy Workflow が意図どおり Success する割合 | Deploy runs、Deployment Summary | 期間内 Deploy Success／完了 Deploy run |
| Incident Response Time | 検知から初動確認開始（または Severity 確定）までの時間 | Incident 記録（`incident_template.md`） | 検知日時〜初動／Severity 確定日時の差分。未記入はデータ不足 |
| Recovery Time | 影響開始（または検知）から復旧確認までの時間 | Incident 記録の復旧日時 | 開始〜復旧確認の差分。未復旧・未記入は評価対象外として記録 |

共通ルール:

* 取得元は読み取りのみ（元データ変更禁止）
* 収集失敗・欠測は補正せず「データ不足／評価対象外」と記録
* 指標の意味と取得元が矛盾したら定義見直し（成功扱いしない）

---

## 3. Trend Analysis（傾向分析）

| 分析対象 | 目的 | 主なソース |
|---|---|---|
| Failure Count | 失敗件数の増減 | Actions 履歴、Daily Report Failure Summary |
| Incident Frequency | Incident 発生頻度 | Incident 記録 |
| Recovery Time | 復旧の長期化・短縮 | Incident 記録 |
| Deploy Failure Trend | デプロイ失敗の偏り | Deploy 履歴、Deployment Summary |
| Workflow Failure Count | Observability Metrics との突合 | `observability.md` / Maintenance レポート |

分析方法（手動・レビュー時）:

1. 対象期間を決める（原則 Monthly Review と同一）
2. 取得可能なデータのみ集計する（欠測を埋めない）
3. 増減・偏り・繰り返しパターンを記述する
4. 改善候補を `review_process.md` の Improvement Item に記録する

自動判断・自動改善適用は禁止。分析結果は人間の改善判断材料とする。

---

## 4. Improvement Cycle（改善サイクル）

```text
Measure（SLI / レポート / Incident）
 ↓
Analyze（Trend / Review）
 ↓
Improve（Change Management 経由の変更のみ）
 ↓
Review（効果確認・再評価）
```

| 段階 | 実施内容 | 記録 |
|---|---|---|
| Measure | SLI に沿って期間データを収集・列挙 | Review 記録 / レポート参照 |
| Analyze | Trend Analysis・SLO 達成状況の確認 | `review_process.md` |
| Improve | 改善候補を起案し Phase7-0 変更管理で承認・適用 | `change_management.md`（CHG-…） |
| Review | 適用後の SLI / 傾向を再確認 | 次回 Monthly Review |

改善判断基準（例）:

* SLO 未達が継続している
* Failure / Incident が同因で繰り返されている
* Recovery Time が悪化傾向にある

無秩序な改善・未承認変更は禁止。Governance / Risk 評価に従う。

---

## 5. エラー方針

| 状態 | 扱い |
|---|---|
| 信頼性データ不足 | 評価対象外として記録 |
| 指標不整合 | 定義見直し |
| SLO 未達 | 改善対象として記録（`slo.md`） |
| レビュー未実施 | 未完了として扱う |

---

## 6. 関連文書

| 文書 | 内容 |
|---|---|
| `docs/slo.md` | SLO 対象・評価・未達時・Error Budget 概念 |
| `docs/review_process.md` | Monthly Review・記録・承認経路 |
| `docs/observability.md` | Metrics / Alert 条件（取得設計） |
| `docs/automation.md` | Daily Report 等の収集補助 |
| `docs/incident_response.md` | Incident 対応・記録 |
| `docs/advanced_automation.md` | Improvement 実行時の Policy/Risk/Approval ゲート |
| `docs/knowledge_management.md` | Review / Incident の Knowledge 管理（Phase8-2） |
