# Governance Maintenance Plan（Documentation Governance 保守計画）

**Version:** 1.1  
**Status:** Approved Candidate  
**Category:** Governance / Lifecycle  
**Owner:** Primary Owner  
**Related:** documentation_review_process / documentation_index / governance_self_review / operations

---

## 1. Purpose

本書は、AI編集秘書 Framework の **Documentation Governance を長期的に維持するための保守計画（Maintenance Plan）** を定義する。

目的：

- 文書体系の長期健全性維持
- 意味ドリフト防止
- Version / Status / Owner / Category / Phase の正本性維持
- Index / Navigation の整合性維持
- Review / Self Review の周期管理
- 変更時の Gate / Boundary / ADR 整合性確保

---

## 2. Scope

本計画は以下の文書群を対象とする：

- Documentation Governance
- Architecture Governance
- Navigation / Traceability
- Operational / Lifecycle
- Evidence / Reports
- Index（正本）

---

## 3. Maintenance Structure（保守構造）

Documentation Governance の保守は以下の3層で構成される：

1. **Routine Review（Monthly）**
2. **Change Review（Event-driven）**
3. **Self Review（Quarterly）**

---

## 4. Routine Review（Monthly）

### 4.1 実施周期

- **月次（Monthly）**
- 毎月1回、Documentation Governance 全体を確認する

### 4.2 対象

- Style Guide
- Review Process
- Review Checklist
- Glossary
- Template Library
- Documentation Index
- Navigation
- Governance Hub
- Operations

### 4.3 チェック項目

- Version整合
- Status整合
- Owner整合
- Boundary整合
- Gate整合
- ADR整合
- Index整合
- Navigation整合

### 4.4 記録

- `docs/reports/monthly_governance_review_<YYYYMM>.md` を作成
- Evidence として保存

初回記録: `docs/reports/monthly_governance_review_202607.md`（2026-07 / Approved Candidate）

---

## 5. Change Review（Event-driven）

### 5.1 トリガー

以下の変更が発生した場合に実施：

- 新規文書追加
- Version変更
- Status変更
- Owner変更
- Category変更
- Phase変更
- Navigation変更
- Index更新
- ADR追加
- Boundary更新
- Gate更新

### 5.2 Gate

変更時レビューは以下の Gate を通過する：

```text
Evidence → Validation → Human Approval → Decision
```

### 5.3 記録

- `docs/reports/change_review_<ID>.md` を作成
- Index に反映

---

## 6. Index Update Rules（索引更新ルール）

Index は **正本（Primary SoT）** であるため、以下のルールで更新する。

### 6.1 更新タイミング

- 新規文書登録時
- Status変更時
- Owner変更時
- Category変更時
- Phase変更時
- Navigation更新時
- Related Documents変更時

### 6.2 更新内容

- Path
- Title
- Category
- Phase
- Owner
- Status
- SoT
- Related Documents

### 6.3 逆リンク

Index更新時は以下も更新する：

- Navigation
- Governance Hub
- Operations
- Completion Report（必要時）

---

## 7. Self Review（Quarterly）

### 7.1 実施周期

- **四半期（Quarterly）**
- 年4回実施

### 7.2 対象

Documentation Architecture 全体：

- Foundation
- Architecture Governance
- Documentation Governance
- Navigation
- Operational / Lifecycle
- Evidence / Reports

### 7.3 チェック項目

`documentation_review_checklist.md` をそのまま使用  
（監査基準の二重化を防ぐ）

### 7.4 記録

- `docs/governance_self_review.md` を更新
- Completion Report に Evidence として反映

---

## 8. Production Adoption Readiness（本番導入準備確認）

以下の条件を満たした場合、Documentation Architecture は Production Adoption 可能：

- Boundary整合
- Gate整合
- ADR整合
- Style整合
- Template整合
- Checklist整合
- Index整合
- Navigation整合
- Operations整合
- Completion Report（Version 2.0）完了

判定証跡: `docs/reports/documentation_architecture_production_adoption_readiness.md`（Version 1.0 / Approved Candidate / **Production Adoption Ready**）

---

## 9. Phase10 → Phase11 接続確認

以下を確認する：

- Integration Flow（Phase10）
- Lifecycle Flow（Phase11）
- Governance Flow
- Evidence Flow
- Version Flow

Phase10 → Phase11 の接続が成立している場合、  
Documentation Lifecycle は完全に閉じる。

接続検証証跡: `docs/reports/phase10_phase11_connection_validation.md`（Version 1.1 / Approved Candidate / **Valid** / Lifecycle **Closed**）

---

## 10. Version History

| Version | 内容 |
|---|---|
| 1.0 | 初版 |
| **1.1** | **Routine Review（Monthly）へラベル変更（対称構造の明確化）** |

---

## 11. Status

```text
Approved Candidate

This Governance Maintenance Plan defines the
long-term maintenance structure for the
Documentation Architecture, ensuring stability,
traceability, and governance integrity.
```
