# AI編集秘書 Research Governance仕様（Phase9-0）

**Version:** 1.0
**Status:** Approved（Phase9-0）
**Target:** Research Governance / Experiment Management / Validation / Research Transition
**Type:** 研究成熟化（既存機能変更なし）

---

# 1. 目的

Phase9-0 Research Governance は、

* Phase7-0 Operational Governance
* Phase8-0 AI Operations Governance

を前提に、

**研究活動を安全かつ統制された形で実施するためのガバナンス基盤を整備するフェーズ**である。

本フェーズは以下のみを担当する。

* Research Scope定義
* Experiment Governance
* Research Validation
* Research Risk Management
* Research Audit
* Research Transition
* Research Classification
* Research Artifact Management
* Research Principles

本番コード（`tools/secretary/`）の変更は行わない。

---

# 2. 責務

```text
Operational Governance
        │
        ▼
Research Governance Layer
        │
        ├── Research Principles
        ├── Research Scope
        ├── Experiment Governance
        ├── Validation
        ├── Risk Management
        ├── Artifact Management
        ├── Research Audit
        └── Research Transition
```

具体的には、

1. 研究対象を定義する
2. 実験活動を統制する
3. 研究成果を評価する
4. 研究リスクを管理する
5. 研究成果物を管理する
6. 研究履歴を監査可能にする
7. 将来フェーズへの橋渡しを定義する

以上のみ。

---

# 3. Research Principles

Phase9では以下を基本原則とする。

## Principle 1

```text
Research is isolated from Production.
```

研究環境は本番環境から完全に分離する。

---

## Principle 2

```text
Research never modifies Production.
```

研究活動は本番運用を直接変更しない。

---

## Principle 3

```text
Research must be evidence-driven.
```

研究結果は客観的根拠に基づいて評価する。

---

## Principle 4

```text
Human Approval is mandatory.
```

研究成果の採用判断は人間が行う。

---

## Principle 5

```text
Validated Research may become Future Adoption.
```

検証済み研究のみ将来フェーズへ昇格できる。

---

# 4. Research Scope

## 研究対象

* 次世代AIOps
* AI Agent
* Policy as Code
* 自律運用候補
* 予測モデル
* 新しい運用方式
* 新しいガバナンス方式

## 対象外

* 本番変更
* 本番データ操作
* 本番ポリシー改変
* 本番自律運用導入
* 本番AI権限拡張

原則

```text
Research ≠ Production
```

---

# 5. Research Classification

研究の成熟度を統一基準で管理する。

```text
Concept
    ↓
PoC
    ↓
Pilot
    ↓
Candidate
```

## Concept

* アイデア段階
* 実装前
* 技術調査

## PoC

* 仮説検証
* Sandbox環境
* 実現可能性確認

## Pilot

* 限定環境評価
* 運用適合性確認
* リスク評価

## Candidate

* 正式採用候補
* Future Adoption対象
* Phase10候補

### 要件

* ClassificationをResearch Auditへ記録する
* Classification変更はValidation結果に基づく
* Human Reviewを必須とする

---

# 6. Experiment Governance

管理対象

* PoC開始条件
* 仮説・目的・評価指標
* Sandbox / Staging利用
* 本番データ利用禁止
* 実験ログ
* PoC終了条件

原則

```text
Experiment is isolated from Production.
```

---

# 7. Research Validation

評価軸

* 技術的有効性
* 安全性
* 再現性
* 運用適合性
* ガバナンス適合性
* コスト・効果
* リスク

Validationフロー

```text
Hypothesis
    ↓
Experiment
    ↓
Validation
    ↓
Result
```

---

# 8. Research Risk Management

管理対象

* 本番環境への影響
* 誤作動
* 過剰自律性
* 誤予測
* ガバナンス逸脱
* データ漏洩
* Agent境界逸脱

原則

* 研究は本番環境から隔離する
* Agentは本番権限を持たない
* 自律運用は研究段階に限定する

---

# 9. Research Artifact Management

研究成果物を統一形式で管理する。

対象

```text
Research Proposal
Experiment Plan
Experiment Result
Validation Report
Risk Assessment
Recommendation
Knowledge Update Proposal
Transition Record
```

要件

* 成果物を識別可能とする
* 出所・Versionを保持する
* Research Auditと関連付ける
* Phase7-0 Change Managementと整合する

---

# 10. Research Audit

記録対象

* PoC開始理由
* 実験内容
* 評価結果
* リスク評価
* Decision Record
* 採用・不採用理由
* 将来フェーズへの推薦理由
* Classification履歴

目的

* 研究の透明性
* 意思決定の説明責任
* 将来フェーズへの引き継ぎ

---

# 11. Research Transition（Research Exit Criteria）

研究成果の昇格条件を定義する。

```text
Research
    │
    ├─ アイデア段階
    └─ PoC前
        │
        ▼
Validated
    ├─ PoC成功
    ├─ 再現性確認
    └─ 安全性確認
        │
        ▼
Candidate
    ├─ Human Approval
    ├─ ガバナンス整合
    ├─ リスク許容
    └─ 本番適用可能性
        │
        ▼
Future Adoption
    ├─ Phase10対象
    └─ 正式仕様へ昇格
```

---

# 12. 禁止事項

禁止事項

* 本番コード変更
* 本番環境での研究実施
* AIによる本番変更
* AIによる最終判断
* AIによる自律運用導入
* Human Approval省略
* Research Audit削除
* Secrets・Credentialの研究利用

Research Governance は、

**研究活動を安全に統制するための管理基盤であり、本番運用を変更することを目的としない。**

---

# 13. 完了条件

以下を満たすこと。

* [ ] Research Principlesが定義されている
* [ ] Research Scopeが定義されている
* [ ] Research Classificationが定義されている
* [ ] Experiment Governanceが定義されている
* [ ] Research Validationが定義されている
* [ ] Research Risk Managementが定義されている
* [ ] Research Artifact Managementが定義されている
* [ ] Research Auditが定義されている
* [ ] Research Transition（Exit Criteria）が定義されている
* [ ] Phase7-0 Governanceと整合する
* [ ] Phase8-0 AI Governanceと整合する
* [ ] `tools/secretary/`未変更

---

# 14. 将来拡張方針

```text
Phase9-0
Research Governance
        ↓
Phase9-1
AI Agent Collaboration Research
        ↓
Phase9-2
Policy as Code Research
        ↓
Phase9-3
Autonomous Operations Research
        ↓
Phase9-4
Predictive AIOps Research
        ↓
Phase10
Production Adoption
```

---

# Version 1.0（Approved）

* Phase9 Research Governanceを正式定義
* Research Principlesを追加
* Research Classificationを追加
* Research Artifact Managementを追加
* Research AuditとDecision Recordを接続
* Research Exit Criteriaを正式定義
* ResearchとProductionの境界を明確化
* Phase10への橋渡しを定義
* Phase7・Phase8との整合を維持
