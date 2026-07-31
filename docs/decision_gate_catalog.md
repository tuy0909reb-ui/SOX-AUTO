# Decision Gate Catalog

**Version:** 1.1  
**Status:** Approved  
**Scope:** Phase10〜Phase11 Operational Governance

---

## 1. Purpose

本書は、AI編集秘書 Framework における **Decision Gate** を横断的に一覧化し、  
各 Gate の役割・判断対象・入力・出力・承認者・関連文書を統一的に整理する。

Decision Gate は **自律変更防止・Human Approval・Traceability** を保証する  
Operational Governance の中心要素である。

---

## 2. Gate Overview

Decision Gate は以下の Phase に存在する。

| Phase | Gate名 | 目的 |
|---|---|---|
| Phase10 | Adoption Decision Gate | 採用可否の判断 |
| Phase11-0 | Lifecycle Decision Gate | ライフサイクル継続判断 |
| Phase11-1 | Maintenance Decision Gate | 保守実施判断 |
| Phase11-2 | Health Decision Gate | 健全性評価と次工程判断 |
| Phase11-3 | Recovery Decision Gate | 復旧完了判断 |
| Phase11-4 | Knowledge Decision Gate | 知識公開判断 |

---

## 3. Gate Catalog（詳細）

### 3.1 Adoption Decision Gate（Phase10）

| 項目 | 内容 |
|---|---|
| 判断対象 | Production Adoption の可否 |
| 入力 | Evidence / Risk / Governance Check |
| 出力 | Adopt / Reject / Revise |
| Human承認 | 必須 |
| 次工程 | Production Runtime |
| 関連文書 | `production_adoption_governance.md` |

---

### 3.2 Lifecycle Decision Gate（Phase11-0）

| 項目 | 内容 |
|---|---|
| 判断対象 | ライフサイクル継続可否 |
| 入力 | Operational Metrics / Governance Evidence |
| 出力 | Continue / Adjust / Escalate |
| Human承認 | 必須 |
| 次工程 | Maintenance（11-1） |
| 関連文書 | `operational_lifecycle_governance.md` |

---

### 3.3 Maintenance Decision Gate（Phase11-1）

| 項目 | 内容 |
|---|---|
| 判断対象 | 保守実施の可否 |
| 入力 | Maintenance Plan / Evidence |
| 出力 | Execute / Defer / Escalate |
| Human承認 | 必須 |
| 次工程 | Health（11-2） |
| 関連文書 | `maintenance_decision_gate.md` |

---

### 3.4 Health Decision Gate（Phase11-2）  
（レビュー反映済）

| 項目 | 内容 |
|---|---|
| 判断対象 | 健全性評価と次工程判断 |
| 入力 | Health Metrics / Thresholds |
| 出力 | Continue / Incident（11-3） / Escalate |
| Human承認 | 必須 |
| 次工程 | Continue / Incident & Recovery（11-3） / Escalation |
| 関連文書 | `health_decision_gate.md` |

---

### 3.5 Recovery Decision Gate（Phase11-3）  
（レビュー反映済）

| 項目 | 内容 |
|---|---|
| 判断対象 | 復旧完了の可否 |
| 入力 | Incident Evidence / Recovery Steps |
| 出力 | **RECOVERED / PARTIAL / ROLLBACK / ESCALATE** |
| Human承認 | 必須 |
| 次工程 | Knowledge Evolution（11-4） |
| 関連文書 | `recovery_decision_gate.md` |

---

### 3.6 Knowledge Decision Gate（Phase11-4）

| 項目 | 内容 |
|---|---|
| 判断対象 | 知識公開の可否 |
| 入力 | Evidence / Validation / Review |
| 出力 | Publish / Revise / Reject / Escalate |
| Human承認 | 必須 |
| 次工程 | Lifecycle Governance（11-0） |
| 関連文書 | `knowledge_decision_gate.md` |

---

## 4. Gate Principles（共通原則）

```text
All operational decisions require human approval.
AI may recommend, but never approve.
Automation may collect evidence, but never decide.
Decision Gate prevents autonomous production changes.
```

---

## 5. Gate Flow（統一構造）

```text
Input
    ↓
Validation
    ↓
Human Approval
    ↓
Decision
    ↓
Next Phase
```

---

## 6. Governance Integration

Decision Gate は以下の Governance 要素と連携する。

* Evidence
* Approval
* Traceability
* Boundary（Human / AI / Automation）
* Metrics
* Lifecycle Interface

---

## 7. Status

```text
Approved

This catalog defines the unified structure of
Decision Gates across Phase10〜Phase11.
```
