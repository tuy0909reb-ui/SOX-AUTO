# Agent Boundary（Phase9-1）

仕様: `docs/specs/ai_agent_collaboration_research_phase9_1.md`

Permission / Data / Execution / Governance / Risk の各境界を定義する。

---

## 1. Permission Boundary

Agent は Production の権限を持たない。

---

## 2. Data Boundary

Agent は本番データへアクセスしない（研究対象は隔離された環境に限定する）。

---

## 3. Execution Boundary

Agent は Sandbox / Staging 等の隔離環境でのみ研究実行を行う。
Production 側の実行経路には接続しない。

---

## 4. Governance Boundary

Phase9-0 の Experiment Governance と Research Audit の枠組みに従い、
Agent 協調ログ、評価結果、リスク評価、分類履歴を記録する。

---

## 5. Risk Boundary

境界逸脱・過剰自律性・データ漏洩が疑われる場合、研究は停止する（無理に継続しない）。

---

## 6. 明示ルール（必須）

```text
Agent never crosses Production Boundary.
```

