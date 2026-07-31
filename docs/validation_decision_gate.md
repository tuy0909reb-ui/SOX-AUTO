# Validation Decision Gate（Phase10-2）

仕様: `docs/specs/operational_validation_phase10_2.md`（Version 1.1）  
親文書: `docs/operational_validation.md`  
Rollback: `docs/rollback_execution.md`（Phase10-1）

---

## 1. Decision Flow

```text
Validation Result
        ↓

PASS
    ↓
Continue

MINOR ISSUE
    ↓
Improvement Plan

MAJOR ISSUE
    ↓
Suspend Review

CRITICAL ISSUE
    ↓
Rollback Recommendation
```

---

## 2. 制約

* Evidence に基づく
* Rollback 判断は Human Approval 必須
* Suspend 中も Monitoring 継続
* Validation 結果による Production 自動変更は禁止

Operational Review 結果（Continue / Improve / Suspend / Rollback Recommendation）と整合する。

---

## 3. Validation Decision Criteria（Version 1.1）

Decision Gate への入力は、以下の客観的評価基準に基づく。

評価対象:

```text
KPI Threshold
Reliability Threshold
Security Threshold
Operational Risk
Business Impact
Evidence Completeness
```

原則:

```text
Decision criteria shall be objective.

Threshold definition requires Human Review.

Threshold changes must be version controlled.
```

日本語:

* 判断基準は客観的評価に基づく
* Threshold 定義変更には Human Review が必要
* Threshold 変更履歴は Version 管理する

評価フロー:

```text
Evidence
    ↓
Decision Criteria
    ↓
Decision Gate
    ↓
Human Decision
```

### Threshold Management（考え方のみ）

本文書では Threshold Management の考え方のみを定義する。  
KPI / SLA / SLO / Response Time / Availability 等の具体数値は定義しない（運用設定または別文書で管理）。

Human Approval は引き続き必須。Decision Gate 本体の分岐構造は変更しない。
