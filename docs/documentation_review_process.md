# Documentation Review Process

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Governance / Review & Approval Flow

---

## 1. Purpose

本書は、AI編集秘書 Framework における **全公式文書の作成・レビュー・承認・登録・廃止** の  
標準プロセスを定義する。

目的：

- 文書品質の永続的維持
- Review / Approval の一貫性確保
- Version管理の統一
- Boundary / Ownership / Gate / ADR / Style Guide と整合する運用
- 文書追加時のリスク低減（品質ばらつき・責務混乱の防止）

---

## 2. Document Lifecycle（文書ライフサイクル）

```text
Contributor（任意）
   ↓
Draft（Primary Owner）
   ↓
Review（Approved Candidate）
   ↓
Human Approval（Approved）
   ↓
Repository登録
   ↓
Deprecated
   ↓
Archived
```

---

## 3. Status Definitions（Statusの意味）

Documentation Style Guide の定義を正式採用する：

| Status | Meaning |
|---|---|
| Draft | 作成中（未承認） |
| Approved Candidate | レビュー待ち（承認候補） |
| Approved | 正式採用（正本） |
| Deprecated | 廃止予定（移行期間） |
| Archived | 保管のみ（参照可能だが非推奨） |

---

## 4. Roles & Responsibilities（役割と責務）

### 4.1 Contributor（任意）

- Primary Owner の補助として Draft の一部を作成
- Additive Section の作成が可能
- Version決定は行わない
- Human Approval は行わない

※Contributor は必須ではなく、規模拡大時の補助役。

---

### 4.2 Primary Owner（正本管理者）

- 文書の作成・更新・廃止を主導
- Version管理を実施
- Boundary / Ownership / Gate と整合性を確認
- Human Approval を依頼する責務を持つ
- Contributor の作業内容を統合する

---

### 4.3 Reviewer（レビュー担当）

- Approved Candidate の内容を確認
- Style Guide / Boundary / ADR / Ownership と整合性を確認
- 修正提案を行う
- 必要に応じて差分レビューを実施

---

### 4.4 Approver（承認者）

- Human Approval Boundary に基づき、最終承認を行う
- AIは承認しない（Boundary Catalogに基づく）
- Approved 文書として正式採用する

---

## 5. Review Flow（レビュー手順）

### 5.1 Contributor（任意）

必要に応じて、Primary Owner の補助として Draft の一部を作成する。

### 5.2 Draft作成（Primary Owner）

Primary Owner が文書を作成し、以下を満たす：

- Style Guide に準拠
- Boundary Catalog と整合
- Ownership Policy に準拠
- Gate構造と矛盾しない
- ADR と矛盾しない
- 可能な場合 Template Library（`docs/template_library.md`）の該当テンプレートを起点とする

### 5.3 Review（Approved Candidate）

Reviewer が以下を確認：

- 内容の正確性
- Boundary / Ownership / Gate / ADR との整合
- Style Guide の遵守
- Version分類の妥当性
- リンク構造の正しさ

標準確認項目の正本: `docs/documentation_review_checklist.md`

問題なければ **Approved Candidate** に昇格。

### 5.4 Human Approval（Approved）

Approver が最終承認を行う。

承認基準：

- Framework全体との整合
- Production Boundary に抵触しない
- Governance / Spec / Operations の整合性
- Version分類が正しい

承認後、文書は **Approved（正本）** となる。

### 5.5 Repository登録

Approved 文書は以下の流れで登録：

```text
Repository登録
   ↓
Navigation更新
   ↓
Governance / Operations / ADR への参照追加（必要に応じて）
```

長期保守（Monthly / Change / Quarterly）: `docs/governance_maintenance_plan.md`

---

## 6. Versioning Process（版管理プロセス）

Boundary Catalog の Version Boundary を採用する：

```text
Major：Architecture / Governance構造変更
Minor：定義・ルール・Specの追加変更
Patch：表記修正・リンク修正・軽微な整合性調整
```

Version変更は必ず以下を通過する：

```text
Draft → Review → Human Approval → Repository登録
```

AIは Version決定を行わない。

---

## 7. Deprecation & Archival（廃止・保管）

### 7.1 Deprecated

以下の場合に文書は Deprecated となる：

- 新しい文書に置き換えられる
- 構造変更により不要になる
- Governance変更により役割が変わる

### 7.2 Archived

Deprecated 文書が完全に不要になった場合、Archived へ移行する。

Archived 文書は参照可能だが、更新されない。

---

## 8. Boundary Integration（境界統合）

Documentation Review Process は以下の境界と整合する：

- Human Boundary
- AI Boundary
- Automation Boundary
- Production Boundary
- Documentation Boundary
- Phase Boundary
- Lifecycle Boundary
- Version Boundary

---

## 9. Status

```text
Approved

This Documentation Review Process defines the
standard workflow for creating, reviewing,
approving, and maintaining all documents in the
AI編集秘書 Framework, ensuring consistent quality
and governance across the entire system.
```
