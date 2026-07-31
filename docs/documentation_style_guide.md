# Documentation Style Guide

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Architecture / Style & Structure

---

## 1. Purpose

本書は、AI編集秘書 Framework における **全公式文書の書き方・構造・表記ルール** を  
統一するための Style Guide である。

目的：

- 文書品質の統一
- 読みやすさ・検索性の向上
- Phase / Spec / Governance / Operations の一貫性確保
- Version管理の標準化
- Boundary / Ownership / Gate / ADR と整合する文書体系の維持

---

## 2. Document Categories（文書カテゴリ）

Framework の文書は以下の5カテゴリに分類される：

| Category | 説明 |
|---|---|
| Foundation Docs | Phase1（思想・原理） |
| Specification Docs | Phase2〜11（要件・設計・構造） |
| Governance Docs | Phase7〜11（ルール・判断・責務） |
| Operational Docs | Phase6〜11（運用・手順・インシデント） |
| Architecture Decisions | ADR（設計判断の正本） |

---

## 3. File Structure（ファイル構造）

### 3.1 Front Matter（必須）

すべての文書は以下の Front Matter を持つ：

```text
# Title
Version: X.Y
Status: Draft / Approved / Deprecated / Archived
Scope: （対象領域）
```

### 3.2 Section構造

文書は以下の構造を推奨する：

```text
1. Purpose
2. Scope
3. Definitions（必要な場合）
4. Main Content（仕様・ルール・手順）
5. Boundary（必要な場合）
6. Versioning
7. Status
```

---

## 4. Status Values（追加項目）

Framework 全体で Status の意味を統一するため、以下の値を採用する：

| Status | Meaning |
|---|---|
| Draft | 作成中（未承認） |
| Approved Candidate | レビュー待ち（承認候補） |
| Approved | 正式採用（正本） |
| Deprecated | 廃止予定（移行期間） |
| Archived | 保管のみ（参照可能だが非推奨） |

---

## 5. Naming Rules（命名規則）

### 5.1 ファイル名

- 英語小文字
- 単語は `_` で区切る
- 意味が明確な名前にする

例：

```text
incident_response.md
decision_gate_catalog.md
boundary_catalog.md
architecture_decision_record.md
```

### 5.2 セクション名

- Title Case
- 短く明確に
- Phase名は `PhaseX-Y` 形式で統一

---

## 6. Writing Rules（書き方の統一）

### 6.1 文体

- 一貫した説明文
- 主語は明確に
- “AIは〜しない” を明確に書く
- 境界は必ず明記する

### 6.2 用語統一

以下の用語は Framework 全体で統一する：

| 用語 | 説明 |
|---|---|
| Primary Owner | 文書の正本管理者 |
| Additive Section | 補足セクション |
| Decision Gate | 判断構造 |
| Lifecycle | Phase11の運用循環 |
| Knowledge Evolution | Phase11-4 |
| Production Boundary | AIが触れない領域 |
| Evidence | 判断・承認の根拠となる記録 |
| Traceability | Decision / Document / Version / Evidence の追跡可能性 |

用語の正規定義: `docs/glossary.md`

---

## 7. Versioning Rules（版管理）

Boundary Catalog と整合する形で以下を採用する：

```text
Major：Architecture / Governance構造変更
Minor：定義・ルール・Specの追加変更
Patch：表記修正・リンク修正・軽微な整合性調整
```

AIは Version決定を行わない。

---

## 8. Link Rules（リンク構造）

### 8.1 相互参照

文書間の参照は以下の形式で統一：

```text
See: docs/framework_navigation.md（§X）
See: docs/architecture_decision_record.md（Decision #X）
```

### 8.2 Hub連携

Hub文書（operations / governance / navigation）は  
必ず関連文書への逆リンクを持つ。

---

## 9. Boundary Integration（境界統合）

Documentation Style Guide は以下の境界と整合する：

- Human Boundary
- AI Boundary
- Automation Boundary
- Production Boundary
- Documentation Boundary
- Phase Boundary
- Lifecycle Boundary
- Version Boundary

特に **Production Boundary** と **AI Boundary** は必ず明記する。

関連: `docs/boundary_catalog.md`  
文書の作成・レビュー・承認フロー: `docs/documentation_review_process.md`  
標準テンプレート: `docs/template_library.md`

---

## 10. Status

```text
Approved

This Documentation Style Guide defines the
standard writing rules, structure, and naming
conventions for all documents in the AI編集秘書
Framework, ensuring consistency and clarity
across Specification, Governance, and Operations.
```
