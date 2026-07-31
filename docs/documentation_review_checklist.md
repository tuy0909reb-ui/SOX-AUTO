# Documentation Review Checklist

**Version:** 1.0  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Governance / Review Quality Assurance

---

## 1. Purpose

本書は、AI編集秘書 Framework における **文書レビュー時の確認項目** を  
統一するための Checklist である。

目的：

- Review品質の標準化
- Reviewer間のばらつき防止
- Boundary / Ownership / Gate / ADR / Style Guide / Glossary との整合性確認
- Human Approval 前の品質保証
- 長期運用での意味ドリフト防止

---

## 2. Review Checklist（標準確認項目）

Reviewer は以下の項目をすべて確認する。

### 2.1 Front Matter

- Title が正しい
- Version が正しい（Major / Minor / Patch）
- Status が正しい（Draft / Approved Candidate / Approved / Deprecated / Archived）
- Scope が正しい

---

### 2.2 Style Guide準拠

- セクション構造が正しい
- 用語が Glossary と一致
- 表記ゆれがない
- 命名規則に従っている
- リンク形式が正しい（Navigation準拠）

---

### 2.3 Boundary整合

- Human Boundary を侵していない
- AI Boundary を侵していない
- Automation Boundary を誤用していない
- Production Boundary に抵触していない
- Documentation Boundary に分類できる

---

### 2.4 Ownership整合

- Primary Owner が明記されている
- Additive Section が正しく扱われている
- 正本と補足の境界が明確

---

### 2.5 Gate整合

- Decision Gate の流れに矛盾がない
- Evidence → Validation → Human Approval → Decision の順序が正しい
- Gateを通過すべき内容が Gate外で決定されていない

---

### 2.6 ADR整合

- ADR と矛盾がない
- Architecture Decision の理由と一致
- Structure / Boundary / Flow が ADR と整合

---

### 2.7 Version整合

- Version分類（Major / Minor / Patch）が正しい
- Version変更理由が明確
- Version履歴が正しく記録されている

---

### 2.8 Evidence整合

- 判断の根拠が明記されている
- Metrics / Logs / Review結果が正しく引用されている
- Evidence が Gate と紐付いている

---

### 2.9 Traceability整合

- Decision と Evidence が紐付いている
- Version変更理由が追跡可能
- 文書間の関係が Navigation と一致

---

### 2.10 Repository整合

- 登録パスが正しい
- Navigation更新が必要か確認
- Governance / Operations / ADR への逆リンクが必要か確認
- Documentation Index（`docs/documentation_index.md`）更新が必要か確認

---

## 3. Extended Checklist（拡張項目）

※後続で追加される確認項目を吸収するための拡張枠。

Reviewer は必要に応じて以下も確認する：

- Phase固有Boundaryとの整合
- Lifecycle（Phase11）との整合
- Operational Flowとの整合
- Monitoring / Metricsとの整合
- Incident / Maintenanceとの整合

---

## 4. Status

```text
Approved

This Review Checklist ensures consistent,
high-quality review across all documents in the
AI編集秘書 Framework, preventing drift and
maintaining governance integrity.
```
