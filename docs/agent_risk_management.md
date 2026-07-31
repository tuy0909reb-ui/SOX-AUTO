# Agent Risk Management（Phase9-1）

仕様: `docs/specs/ai_agent_collaboration_research_phase9_1.md`

AI Agent の研究に伴うリスクを整理し、研究が隔離された状態を維持する。

---

## 1. Risk Types

* Agent Runaway
* Agent Boundary Violation
* Excessive Autonomy
* Wrong Prediction
* Wrong Recommendation
* Governance Violation
* Data Leakage
* Agent Responsibility Confusion

---

## 2. Mitigations（対策）

### Agent Runaway

* Sandbox / 隔離環境で実行する
* 実行範囲・停止条件を明確化し、逸脱時は停止する

### Boundary Violation

* Production 権限を付与しない
* 入出力・権限チェックを行い、境界逸脱があれば研究を停止する

### Excessive Autonomy

* Human Approval を必須とする
* 協調ログと意思決定記録を残し、無承認拡張を許さない

### Wrong Prediction / Wrong Recommendation

* Validation / 評価指標で裏取りする
* Evidence を保持し、Human Review で採用可否を判断する

### Governance Violation

* Phase9-0 の Experiment Governance / Research Audit に従う
* 記録・分類・Exit Criteria のいずれかが満たせない場合は停止する

### Data Leakage

* 本番データを扱わない
* ログ・成果物へ秘匿情報が混入しないことを確認する

