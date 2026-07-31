# Glossary（用語辞書）

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Terminology / Boundary / Governance / Lifecycle

---

## 1. Purpose

本書は、AI編集秘書 Framework における **全公式用語の正規定義** を提供する Glossary である。

目的：

- 用語の意味ドリフト防止
- Boundary / Ownership / Gate / ADR / Style Guide との整合
- 文書間の語彙統一
- 読み手の理解負荷軽減
- Framework の長期運用に耐える辞書の提供

---

## 2. Terminology Categories（用語カテゴリ）

| Category | 説明 |
|---|---|
| Boundary Terms | Human / AI / Automation / Production / Documentation |
| Governance Terms | Ownership / Gate / Approval / Version / Evidence / Traceability |
| Lifecycle Terms | Phase11構造 / Knowledge Evolution |
| Specification Terms | Phase2〜11の要件・設計語彙 |
| Architecture Terms | ADR / Decision / Structure |

---

## 3. Boundary Terms（境界用語）

### Human Boundary

人間が担う責務の境界。Decision Gate・Production変更・Spec/Governance/ADR変更・Version管理・重大インシデント判断を含む。

### AI Boundary

AIが担う責務の境界。Evidence生成・Draft・構造化支援まで。Gate Decision・Production変更・Version決定は行わない。

### Automation Boundary

自動化が担う責務の境界。CI/CD（コード）・Lint/Link・Monitoring/Metrics収集・インシデント通知まで。判断は行わない。

### Production Boundary

本番環境・データ・構成・運用判断・本番仕様変更の領域。AIは変更できない。変更は Human Approval 必須。

### Documentation Boundary

Foundation / Spec / Governance / Operational / ADR の文書カテゴリ境界。

関連: `docs/boundary_catalog.md`

---

## 4. Governance Terms（ガバナンス用語）

### Primary Owner

文書の正本管理者。

### Additive Section

正本ではない補足セクション。Primary の定義を上書きしない。

### Secondary Reference

Primary SoT を参照し補足・要約・導線を提供する文書。構造変更は禁止。

### Decision Gate

判断構造。Input → Validation → Human Approval → Decision → Next Phase。

### Human Approval

Gateの最終判断。AIは承認しない。

### Version Boundary

Major / Minor / Patch の分類ルール。

関連: `docs/document_ownership_policy.md` / `docs/decision_gate_catalog.md`

---

## 5. Evidence（新規追加）

### Evidence

判断・承認の根拠となる記録。

含まれるもの：

- Metrics（数値指標）
- Logs（運用記録）
- Review結果
- Validation結果
- Operational結果
- Lifecycleで得られた知見

役割：

- Decision Gate の入力
- ADR の根拠
- Boundary判断の裏付け
- Lifecycle改善の材料

---

## 6. Traceability（新規追加）

### Traceability

Decision・Document・Version・Evidence の関係を  
**一貫して追跡可能にする仕組み**。

目的：

- なぜその判断になったかを後から説明できる
- Version変更の理由を明確化
- ADR と Evidence の紐付け
- Boundary / Gate / Ownership の整合性維持

Traceability は Governance の中核であり、  
Framework の長期運用に必須となる。

---

## 7. Lifecycle Terms（ライフサイクル用語）

### Operational Lifecycle

Phase11 の運用循環。Governance → Maintenance → Health → Incident & Recovery → Knowledge Evolution → Next Lifecycle。

### Lifecycle Governance（Phase11-0）

Production 採用後の Capability / Policy / AI / Automation / Knowledge の長期統制。

### Lifecycle Maintenance（Phase11-1）

定常保守。改善・Adoption・Optimization ではない。

### Operational Health Management（Phase11-2）

健全性の監視・評価・判断支援。Recovery 実行はしない。

### Operational Incident & Recovery（Phase11-3）

障害発生後の対応・復旧。Maintenance（定常保守）と区別する。

### Knowledge Evolution（Phase11-4）

運用知見の体系化・公開・Reuse。Lifecycle の一部として次サイクル Governance へ還元する。

### Maintenance ≠ Recovery

Maintenance = 定常保守（11-1）。Recovery = 障害復旧（11-3）。

### Health Classification ≠ Alert Level

Health Classification = 運用状態。Alert Level = 通知緊急度。

### Incident Classification ≠ Escalation Policy

Incident Classification = インシデント重大度。Escalation Policy = 組織的対応経路。

---

## 8. Specification Terms（仕様用語）

### Specification（Spec）

要件・境界・実装可能な構造・Phase Interface・Evidence/Approval 対象を満たす正式仕様。Phase2〜11 が対象。Phase1 は対象外。

### Foundation Docs

Phase1 の思想・原理・概念文書。Spec ではない。

### Requirements（Phase2）

「何を作るか」を定義する。Spec 管理体系の開始点。

### Design（Phase3）

「どう作るか」を定義する。実装境界に接続する。

### Research ≠ Production

Research（Phase9）成果は Production を直接変更しない。Adoption（Phase10）を経る。

### Adoption

Validated / Candidate の Production 採用統制。Adopt 後は Lifecycle（Phase11-0）へ逆リンク必須。

### Validated / Candidate / Proposal

Research 成果の扱い区分。いずれも Future Adoption（Phase10）へ流れる。

---

## 9. Architecture Terms（アーキテクチャ用語）

### Architecture Decision Record（ADR）

主要なアーキテクチャ判断の正本。Spec ではない。

### Framework Navigation

Framework 全体構造・Phase 流れ・Hub・逆リンクの案内文書。

### Document Ownership Policy

Primary SoT / Secondary Reference / Additive Section の所有方針。

### Decision Gate Catalog

Phase10〜11 Decision Gate の横断索引。

### Boundary Catalog

全境界の横断索引。

### Documentation Style Guide

文書の書き方・構造・Status・Naming・Versioning の正本。

### Documentation Review Process

文書の作成・レビュー・承認・登録・廃止プロセスの正本。

---

## 10. Status Values

| Status | Meaning |
|---|---|
| Draft | 作成中（未承認） |
| Approved Candidate | レビュー待ち（承認候補） |
| Approved | 正式採用（正本） |
| Deprecated | 廃止予定（移行期間） |
| Archived | 保管のみ（参照可能だが非推奨） |

関連: `docs/documentation_style_guide.md`（§4）

---

## 11. Integration

Glossary は以下の文書と整合する：

- Ownership Policy
- Boundary Catalog
- Decision Gate Catalog
- ADR
- Documentation Style Guide
- Documentation Review Process
- Framework Navigation

---

## 12. Status

```text
Approved

This Glossary defines the official terminology
for the AI編集秘書 Framework, ensuring consistent
language, boundaries, and governance across all
documents and lifecycle operations.
```
