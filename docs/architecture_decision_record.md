# Architecture Decision Record (ADR)

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Architecture / Operational Architecture Decisions

---

## 1. Purpose

本書は、AI編集秘書 Framework における **主要なアーキテクチャ判断（Architecture Decisions）** を  
正本として記録する。

ADR は以下を目的とする：

- Framework の構造・境界・思想に関する重大な判断を永続化する
- 後続フェーズの判断基準を統一する
- 設計判断の履歴を残し、変更理由を明確化する
- Documentation Architecture の整合性を維持する

---

## 2. Decision List（主要判断一覧）

| # | Decision | Status |
|---|---|---|
| 1 | Phase1 は Spec を持たない（Foundation扱い） | Approved |
| 2 | Spec 管理体系は Phase2 Requirements から開始 | Approved |
| 3 | Document Ownership Model（Primary / Secondary / Additive）を採用 | Approved |
| 4 | Decision Gate は **Operational Governance Layer** に統一構造を持つ | Approved |
| 5 | Adoption → Lifecycle の逆リンクを必須とする | Approved |
| 6 | Research → Adoption の逆リンクを必須とする | Approved |
| 7 | Phase11 は閉ループ構造（11-0 → 11-4 → 11-0）を持つ | Approved |
| 8 | AI は決定しない（Human Approval 必須） | Approved |
| 9 | Production Boundary を明確化（AIは変更不可） | Approved |
| 10 | Knowledge Evolution は Lifecycle の一部として扱う | Approved |

---

## 3. Detailed Decisions（詳細）

### 3.1 Phase1 は Spec を持たない（Foundation扱い）

**Decision:**  
Phase1 は Conceptual Origin であり、Spec の対象外とする。

**Reason:**  
Spec の定義（要件・境界・実装可能性）を満たさないため。

**Impact:**  
Spec は Phase2 から開始し、Documentation Architecture の整合性が保たれる。

関連: `docs/phase1_documentation_positioning.md`

---

### 3.2 Spec 管理体系は Phase2 Requirements から開始

**Decision:**  
Spec の正本管理は Phase2 から開始する。

**Reason:**  
Phase2 で初めて要件・境界・構造が確定するため。

**Impact:**  
Spec の階層構造（Requirements → Design → Implementation）が成立する。

---

### 3.3 Document Ownership Model を採用

**Decision:**  
Primary / Secondary / Additive の3区分を採用する。

**Reason:**  
意味ドリフト防止・責務分離・Specの一貫性維持のため。

**Impact:**  
複数フェーズが同一文書を扱う際の混線が解消される。

関連: `docs/document_ownership_policy.md`

---

### 3.4 Decision Gate は Operational Governance Layer に統一構造を持つ  
（拡張性を考慮した修正済）

**Decision:**  
Decision Gate は Operational Governance Layer に属し、以下の統一構造を持つ：

```text
Input → Validation → Human Approval → Decision → Next Phase
```

**Reason:**  
自律変更防止・Traceability・Governance統一のため。  
Phase10〜11に限定せず、将来の拡張にも耐えるため。

**Impact:**  
Gateの判断語彙・流れが統一され、運用が安定する。

関連: `docs/decision_gate_catalog.md`

---

### 3.5 Adoption → Lifecycle の逆リンク

**Decision:**  
Adoptされたものは必ず Phase11-0 Lifecycle に入る。

**Reason:**  
採用後の運用責務を明確化するため。

**Impact:**  
Production → Lifecycle の閉ループが成立する。

関連: `docs/framework_navigation.md` / `docs/production_adoption_governance.md`

---

### 3.6 Research → Adoption の逆リンク

**Decision:**  
Validated / Candidate / Proposal は必ず Adoption に流れる。

**Reason:**  
改善案が Production に直接流れないようにするため。

**Impact:**  
Research → Adoption → Lifecycle の流れが確立する。

関連: `docs/framework_navigation.md` / `docs/research_governance.md`

---

### 3.7 Phase11 は閉ループ構造を持つ

**Decision:**  
Phase11 は以下の閉ループを持つ：

```text
11-0 → 11-1 → 11-2 → 11-3 → 11-4 → 11-0
```

**Reason:**  
運用の継続性・知識進化・改善サイクルの維持のため。

**Impact:**  
Operational Lifecycle が循環構造として成立する。

関連: `docs/reports/operational_lifecycle_completion_report.md`

---

### 3.8 AI は決定しない（Human Approval 必須）

**Decision:**  
AI は Evidence を生成するが、Decision は行わない。

**Reason:**  
Governance原則・責任所在・安全性のため。

**Impact:**  
すべての Gate が Human Approval を必須とする。

関連: `docs/boundary_catalog.md`（§3 Human / §4 AI）

---

### 3.9 Production Boundary の明確化

**Decision:**  
AI は Production を変更できない。

**Reason:**  
自律変更防止・安全性・監査可能性のため。

**Impact:**  
Adoption / Lifecycle / Maintenance の境界が明確化される。

関連: `docs/boundary_catalog.md`（§6 Production Boundary）

---

### 3.10 Knowledge Evolution は Lifecycle の一部

**Decision:**  
Knowledge Evolution（Phase11-4）は Lifecycle の一部として扱う。

**Reason:**  
知識公開は運用の継続判断に直結するため。

**Impact:**  
Knowledge → Lifecycle の閉ループが成立する。

関連: `docs/operational_knowledge_evolution.md`

---

## 4. Versioning

ADR の変更は以下で管理する：

- Major：新しい設計判断の追加
- Minor：既存判断の補足・修正
- Patch：表記修正・軽微な整合性調整

---

## 5. Status

```text
Approved

This Architecture Decision Record defines the
core architectural decisions of the AI編集秘書
Framework and establishes the foundation for
consistent governance and lifecycle operation.
```
