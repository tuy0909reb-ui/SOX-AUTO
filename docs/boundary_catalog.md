# Boundary Catalog

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Governance Boundary / Operational Boundary

---

## 1. Purpose

本書は、AI編集秘書 Framework における **全境界（Boundary）** を  
横断的に一覧化する Catalog である。

Boundary Catalog の目的：

- AI / Human / Automation の責務境界を明確化する
- Spec / Governance / Operations の境界を統一する
- Phase 間の境界を一枚で把握できるようにする
- Production Boundary を固定し、誤運用を防止する
- Architecture Decision Record（ADR）の境界判断を参照可能にする

---

## 2. Boundary Overview（全体構造）

Framework の境界は以下の5層に分類される：

```text
Human Boundary
AI Boundary
Automation Boundary
Production Boundary
Documentation Boundary
```

さらに、Phase・Spec・Lifecycle の境界がこれらに付随する。

---

## 3. Human Boundary（人間の責務）

### 3.1 Human Approval Boundary

人間はすべての以下の判断を行う：

- Decision Gate（Adoption / Lifecycle / Maintenance / Health / Recovery / Knowledge）
- Production変更
- Spec変更
- Governance変更
- ADR変更
- Version管理
- Operational判断（重大インシデント時）

### 3.2 Human Ownership Boundary

人間は以下の文書の Primary Owner となる：

- Spec（Phase2〜11）
- Governance Docs
- ADR
- Ownership Policy
- Boundary Catalog（本書）

---

## 4. AI Boundary（AIの責務）

### 4.1 AIは決定しない

AIは以下を行わない：

- Production変更
- Spec変更
- Gate Decision
- Governance判断
- ADR変更

### 4.2 AIの責務（Evidence Generation）

AIが行うのは以下のみ：

- Evidence生成
- Draft作成
- 文書統合
- 構造化支援
- Navigation支援
- Operational情報整理
- Knowledge Evolutionの補助

### 4.3 AIの禁止領域

AIは以下に触れない：

- Production Boundary
- Human Approval
- Version決定
- Lifecycle継続判断

---

## 5. Automation Boundary（自動化の責務）

Automationは以下に限定される：

- CI/CD（コードのみ）
- 文書のLint / Linkチェック
- Monitoring / Metrics収集
- インシデント検知（通知のみ）

Automationは **判断を行わない**。

---

## 6. Production Boundary（最重要境界）

### 6.1 AIはProductionを変更できない

Production Boundary は以下を含む：

- 本番環境の設定
- 本番データ
- 本番構成
- 本番の運用判断
- 本番の仕様変更

### 6.2 Production変更は必ず Human Approval

Production変更は以下の流れを必須とする：

```text
Proposal → Evidence → Human Approval → Production Update
```

### 6.3 Production BoundaryはGateと連動

Production変更は必ず以下のGateを通過する：

- Adoption Decision Gate
- Lifecycle Decision Gate
- Maintenance Decision Gate

---

## 7. Documentation Boundary（文書境界）

### 7.1 Foundation Docs Boundary

Phase1は Foundation Docs のみを持ち、Spec対象外。

### 7.2 Spec Boundary

Specは Phase2〜11 のみが対象。

### 7.3 Governance Boundary

Governance Docsは Phase7〜11 のみが対象。

### 7.4 Operational Docs Boundary

Operational Docsは Phase6〜11 のみが対象。

### 7.5 ADR Boundary

ADRは Architecture Decision のみを扱い、Specではない。

---

## 8. Phase Boundary（フェーズ境界）

### 8.1 Phase1 → Phase2 Boundary

Phase1は「思想」、Phase2は「要件」。  
Specは Phase2 から開始。

### 8.2 Phase9 → Phase10 Boundary

Research成果は必ず Adoption に流れる。

### 8.3 Phase10 → Phase11 Boundary

Adoptされたものは必ず Lifecycle に入る。

### 8.4 Phase11 閉ループ Boundary

```text
11-0 → 11-1 → 11-2 → 11-3 → 11-4 → 11-0
```

---

## 9. Lifecycle Boundary（運用境界）

### 9.1 Lifecycle継続判断は人間のみ

AIは Lifecycle継続判断を行わない。

### 9.2 Knowledge Evolution Boundary

Knowledge（11-4）は Lifecycle（11-0）へ戻る。

### 9.3 Incident Boundary

重大インシデントは必ず Human Approval。

---

## 10. Version Boundary（修正版 / Framework全体と整合）

### 10.1 Version分類

Framework全体の文書体系に合わせて、Version Boundary を以下に修正する：

```text
Major：Architecture / Governance構造変更
Minor：定義・ルール・Specの追加変更
Patch：表記修正・リンク修正・軽微な整合性調整
```

### 10.2 AIはVersion決定を行わない

Version決定は Human Approval のみ。

---

## 11. Status

```text
Approved

This Boundary Catalog defines all governance,
operational, and architectural boundaries of
the AI編集秘書 Framework and ensures safe and
consistent lifecycle operation.
```
