# AI Agent Collaboration（Phase9-1）

仕様: `docs/specs/ai_agent_collaboration_research_phase9_1.md`

本ドキュメントは、Phase9-1 AI Agent Collaboration Research の概要と、Phase9-0 Research Governance からの接続、研究対象、Human主導原則を整理する。

---

## 1. Agent Collaboration概要

AI Agent Collaboration Research では、複数の AI Agent を協調させる前提で、
責務分離、境界維持、協調方式、リスクを研究する。

本フェーズは研究のみを担当し、AI Agent に本番権限を付与しない。

---

## 2. Phase9-0との接続

研究は `Research Governance（Phase9-0）` の原則（`Research ≠ Production`、Productionを直接変更しない、Evidence-driven、Human Approval必須）に従う。

また、研究の成果が将来フェーズへ昇格する際も、Research Transition（Exit Criteria）に従う。

---

## 3. Research Scope（研究対象）

Phase9-1 の研究対象は以下を含む。

* AI Agentの責務分離
* Multi-Agent構成
* Agent間協調方式
* Agent境界（Boundary）
* Agentの安全性
* Agentの運用適合性
* Agentのガバナンス適合性
* Agentのリスク評価
* Agentの将来採用可能性（Phase10候補）

---

## 4. Human主導原則

本フェーズでは Human を最上位の意思決定者とし、Coordinator が Agent 間の調整のみを担う。

* Human が常に最上位の意思決定者である
* Agent は Human の承認なく実行判断を行わない
* 協調は人間の指示を前提とする

