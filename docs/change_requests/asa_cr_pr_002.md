# Change Request — ASA-CR-PR-002

**CR ID:** ASA-CR-PR-002  
**Title:** Workflow Consistency Correction  
**Target:** ASA-IMPL-PR-1.0 — Pull Request Implementation Specification  
**Parent Architecture:** ASA-ARCH-14.0（Single Source of Truth）  
**Triggered By:** ASA-CHK-REL-001（Workflow Consistency = NG）  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

PR 仕様の Typical workflow を ASA-ARCH-14.0 が期待する Traceability Flow に一致させる。

---

## Background

```text
Incorrect（PR §10）:  COMMIT → PR → ISSUE → RELEASE
Correct（Architecture）:

DEC
 ↓
ISSUE
 ↓
COMMIT
 ↓
PR
 ↓
RELEASE
```

---

## Changes Applied

### 1. ASA-IMPL-PR-1.0

Delete:

```text
Typical workflow: COMMIT → PR → ISSUE → RELEASE.
```

Replace with Architecture-aligned Typical workflow（see Acceptance）。

### 2. ASA-ARCH-14.0

Add unique **Traceability Flow** section as Architecture SoT（end-to-end workflow を一意定義）。

### 3. Navigation / indexes

Align workflow references in:

* `docs/framework_navigation.md`
* `docs/documentation_index.md`
* `docs/specs/README.md`
* `docs/specs/auto_scribe_ai_issue_implementation_specification.md`（Integration path を RELEASE まで延長）

---

## Acceptance Criteria

* [x] PR workflow matches Architecture
* [x] Architecture defines workflow uniquely
* [x] Navigation documents have no conflicting workflow
* [x] ASA-CHK-REL-001 re-run → Workflow Consistency = PASS

---

## Result

```text
CR Status: Applied
Workflow Consistency: PASS（ASA-CHK-REL-001 re-check）
ASA-IMPL-RELEASE-1.0 registration: Eligible（awaiting RELEASE draft registration）
```
