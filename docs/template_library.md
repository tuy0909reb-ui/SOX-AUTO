# Template Library（標準テンプレート集）

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Templates / Governance / Spec / ADR / Reports

---

## 1. Purpose

本書は、AI編集秘書 Framework における **公式文書テンプレートの正本**を提供する。

目的：

- 文書作成品質の統一
- Style Guide / Review Process / Checklist / Glossary との整合
- 新規文書作成の効率化
- Boundary / Ownership / Gate / ADR の遵守
- 長期運用での意味ドリフト防止

---

## 2. Template Categories

Template Library は以下の4カテゴリで構成される：

1. **Spec Template（仕様書）**
2. **ADR Template（設計判断記録）**
3. **Governance Template（ガバナンス文書）**
4. **Report Template（報告書）**

---

## 3. Spec Template（仕様書テンプレート）

```text
# <Document Title>
Version: <Major.Minor.Patch>
Status: Draft / Approved Candidate / Approved
Category: Specification
Phase: <Phase Number>
Owner: Primary Owner
Related: <Related Documents>

---

## 1. Purpose
本仕様書の目的を記述。

## 2. Scope
対象範囲を記述。

## 3. Requirements
機能要件・非機能要件を記述。

## 4. Design
構造・境界・フローを記述。

## 5. Constraints
Boundary / Gate / ADR との整合を記述。

## 6. Evidence
Requirements / Constraints / Validation の根拠を記述。

## 7. Version History
変更履歴を記述。
```

---

## 4. ADR Template（Architecture Decision Record）

```text
# Architecture Decision Record: <Title>
Version: <Major.Minor.Patch>
Status: Approved
Category: ADR
Owner: Primary Owner
Related: boundary_catalog / decision_gate_catalog

---

## 1. Context
判断が必要になった背景。

## 2. Decision
採用した設計判断。

## 3. Alternatives
検討した代替案。

## 4. Rationale
判断理由（Evidenceと紐付け）。

## 5. Consequences
採用による影響。

## 6. Related Documents
Boundary / Gate / Ownership / Spec など。

## 7. Version History
変更履歴。
```

---

## 5. Governance Template（ガバナンス文書）

```text
# <Governance Document Title>
Version: <Major.Minor.Patch>
Status: Approved
Category: Governance
Owner: Primary Owner
Related: style_guide / review_process / glossary

---

## 1. Purpose
文書の目的。

## 2. Roles & Responsibilities
Primary Owner / Reviewer / Approver / Contributor。

## 3. Rules
Boundary / Gate / Ownership / ADR との整合。

## 4. Process
手順・フロー。

## 5. Integration
他文書との関係。

## 6. Version History
変更履歴。
```

---

## 6. Report Template（報告書）

```text
# <Report Title>
Version: <Major.Minor.Patch>
Status: Approved
Category: Report / Evidence
Owner: Primary Owner
Related: operations / completion_report

---

## 1. Summary
報告の要約。

## 2. Evidence
Metrics / Logs / Review結果。

## 3. Findings
得られた知見。

## 4. Actions
必要な対応。

## 5. Impact
Boundary / Gate / Operations への影響。

## 6. Version History
変更履歴。
```

---

## 7. Maintenance Rules

Template Library は以下のタイミングで更新する：

- 新規文書カテゴリ追加時
- Style Guide変更時
- Review Checklist変更時
- ADR構造変更時
- Boundary / Gate変更時

---

## 8. Status

```text
Approved

This Template Library provides standardized,
high-quality templates for all documents in the
AI編集秘書 Framework, ensuring consistency,
efficiency, and governance integrity.
```
