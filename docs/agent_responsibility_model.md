# Agent Responsibility Model（Phase9-1）

仕様: `docs/specs/ai_agent_collaboration_research_phase9_1.md`

Agent 間で責務を明確に分離し、境界侵害やガバナンス逸脱が起きない状態を研究で検証するためのモデルを整理する。

---

## 1. Responsibility Separation（責務分離モデル）

| Agent | Responsibility | Boundary | Interaction | Non-Scope |
|---|---|---|---|---|
| Editor Agent | 文書生成 / 仕様書編集 / 知識統合 | Production変更権限なし、研究成果の編集に限定 | Research / Analysis / Coordinator の指示を受けて成果物を作成 | 本番変更、実験実行、最終判断 |
| Research Agent | 実験実行 / 検証補助 / 評価補助 | Sandbox / Staging に限定し、Productionデータへアクセスしない | Agentログ・実験結果を Coordinator 経由で共有 | 本番データアクセス、無承認での昇格判断 |
| Analysis Agent | ログ解析 / リスク分析 / 予測補助 | 入力データは研究範囲に限定、評価根拠を保持 | 実験ログ・指標をもとに分析結果を提示 | 最終判断（採用/不採用）、承認の代替 |
| Automation Agent | 自律運用候補の研究 / 条件付き自動化の研究 | Production権限なし、実行は研究段階 | エージェント間の研究タスクを支援 | 自律運用の実行、本番実行経路への直接接続 |

---

## 2. Boundary（境界の要点）

```text
Agent Boundary is strict.
Agent never crosses Production Boundary.
```

---

## 3. Interaction（協調時の原則）

* 協調は人間の指示を前提とする
* Agent間の境界を維持する
* Agent間の責務を混同しない
* 協調ログを必ず記録する

---

## 4. Non-Scope（対象外）

* 本番環境でのAgent実行
* Agentによる本番変更
* Agentによる自律運用
* Agentの本番権限付与
* Agentの本番データアクセス
* Agentの本番ポリシー変更

