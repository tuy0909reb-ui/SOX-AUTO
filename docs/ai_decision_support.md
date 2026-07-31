# AI Decision Support（Phase8-1）

仕様: `docs/specs/ai_decision_support_phase8_1.md`  
Recommendation Policy: `docs/ai_recommendation_policy.md`  
Validation: `docs/ai_validation.md`  
AI Governance（Phase8-0）: `docs/ai_governance.md`  
AI Audit: `docs/ai_audit.md`  
Change Management: `docs/change_management.md`  
Advanced Automation: `docs/advanced_automation.md`  
Knowledge Operations（Phase8-2）: `docs/knowledge_management.md` / `docs/knowledge_source_policy.md`

本ドキュメントは AI による**分析・候補提示・検証・人間判断接続**の運用フローを定義する。  
AI 最終判断・本番変更・Rollback / Secrets / Security 操作・自動 Deploy は行わない。  
Input / Evidence は Knowledge Source Policy・Trust Level に従う（Draft 不可、Historical は参考のみ）。

---

## 1. Phase8-0 との境界

| | Phase8-0 AI Operations Governance | Phase8-1 AI Decision Support |
|---|---|---|
| 役割 | AI を安全に使う統制（Policy / Risk / Audit / Compliance） | AI で判断支援する方法（Analysis / Recommendation / Validation） |
| 出力 | 利用可否・境界・監査必須 | 候補・根拠・Human Review 接続 |

---

## 2. AI Analysis Workflow（固定順）

```text
Input Data
    ↓
AI Analysis
    ↓
Candidate Generation
    ↓
Evidence Check
    ↓
Human Review
    ↓
Decision
```

| 段階 | 内容 | 詳細 |
|---|---|---|
| Input Data | 許可された運用データのみ投入 | §3 Input Boundary |
| AI Analysis | 整理・要約・パターン仮説（断定しない） | 分析結果と根拠を分離して記録 |
| Candidate Generation | 複数候補の提示 | `ai_recommendation_policy.md` |
| Evidence Check | 根拠の突合 | `ai_validation.md` |
| Human Review | Approve / Reject / Edit | §5 |
| Decision | 人間の最終判断 + Decision Record | §6 → 必要時 CHG / AA- |

未確認情報を確定情報として扱わない。Confidence が高くても Review を省略しない。

---

## 3. AI Input Data Boundary

### 3-1 利用可能

| データ | ソース例 |
|---|---|
| Observability Metrics | `observability.md`、Daily Report |
| Incident Records | INC- / `incident_template.md`（Validated 以上） |
| Runbook | Official / Approved（`runbook_integration.md`） |
| Reliability Reports | REL- / `review_process.md` |
| Security Records | SEC- / `security.md`（Secret 値なし） |
| Automation Audit Records | AA- / `automation_audit.md` |
| Knowledge（Phase8-2） | Official / Validated。Trust・Version を記録 |

要件:

* 出所（URL / ID / 文書パス / Version / Trust Level）を確認可能にする
* `knowledge_source_policy.md` に従う
* Phase8-0 AI Risk（`ai_risk_management.md`）と整合する

### 3-2 禁止入力

```text
Secrets
Credential情報
未承認データ
未確認個人情報
```

誤って投入した場合は中止し、Security Incident 候補化を検討する（値は記録しない）。

---

## 4. Decision Support 全体フロー（運用）

```text
AI Suggestion
        ↓
Human Review
        ↓
Approve / Reject
        ↓
Decision Record（+ AIA-）
        ↓
Change Management（変更時）
        ↓
Advanced Automation（実行時）
```

AI 提案のみで変更実行しない。Automation 実行は Phase7-3 経由。

---

## 5. Human Review Workflow

| 項目 | 要件 |
|---|---|
| 承認者 | 氏名またはアカウントを記録 |
| 判断理由 | 採否・修正の理由を記録 |
| Validation | Evidence Check 完了が前提（`ai_validation.md`） |
| Low Confidence | 追加確認必須（`ai_recommendation_policy.md`） |

結果: Approve / Reject / Approve-with-edits。  
Reject も Decision Record に残す（履歴不明化禁止）。

---

## 6. Decision Record Integration

記録（AIA- と接続、または AIA- 内に含める）:

```text
AI Suggestion
Evidence
Human Decision
Final Action
```

| 項目 | 内容 |
|---|---|
| AI Suggestion | 候補一覧・推奨理由（確定表現にしない） |
| Evidence | Reference Data / Logs / Metrics / Incident / Review |
| Human Decision | 採否、承認者、理由、日時 |
| Final Action | 却下 / 記録のみ / CHG-… / AA-… / Deploy 等 |

要件:

* Phase8-0 AI Audit と接続（相互参照）
* Governance Review で判断経緯を追跡可能
* AI 提案履歴と最終判断を関連付け可能

---

## 7. Change Management Connection

変更実施へ進む場合:

```text
AI Suggestion
      ↓
Human Review
      ↓
Decision Record
      ↓
Phase7-0 Change Management
      ↓
Phase7-3 Advanced Automation
```

* CHG に AIA- / Decision Record ID を関連付ける
* 承認なし変更は禁止

---

## 8. 禁止事項（再掲）

* AI 最終判断・本番変更・Rollback・Security 修正・Secrets 操作
* Human Approval 省略
* Evidence なしの推奨採用
* Confidence のみを根拠とした自動実行
* `tools/secretary/` 変更

---

## 9. 関連文書

| 文書 | 内容 |
|---|---|
| `docs/ai_recommendation_policy.md` | 候補提示・Confidence |
| `docs/ai_validation.md` | Evidence Based Validation |
| `docs/ai_audit.md` | AIA- 記録 |
| `docs/ai_governance.md` | 統制・HITL |
| `docs/change_management.md` | 変更承認 |
| `docs/advanced_automation.md` | 実行ゲート |
| `docs/intelligent_automation.md` | AI 支援 Automation 統合（Phase8-3） |
| `docs/automation_workflow_policy.md` | Recommendation → Execution Workflow |
