# Change Request — ASA-CR-IMP-002

**CR ID:** ASA-CR-IMP-002  
**Title:** Architecture Consistency Alignment  
**Target:** ASA-IMPL-IMP-1.0 — Implementation Memory Specification  
**Parent Architecture:** ASA-ARCH-13.0 — Knowledge Architecture  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-IMP-1.0 と ASA-ARCH-13.0 の用語・列挙値・RelationType の不整合を解消する。  
Architecture Baseline（ASA-ARCH-13.0）を Source of Truth とし、Implementation Specification を完全準拠させる。

本CRは仕様の意味を変更するものではなく、Architecture との整合性を確保するための修正である。

---

## Changes Applied

### 1. DecisionStatus Alignment

| Before | After（ASA-ARCH-13.0） |
|---|---|
| `related_decision` … DEC status = **Accepted** | DEC status = **Active** |

### 2. ImplementationStatus Alignment

| Before | After（ASA-ARCH-13.0） |
|---|---|
| **Implemented** | **Completed** |

Updated in: Validation Matrix / Request Example / Example / Implementation Checklist

### 3. RelationType Alignment

独自列挙を削除し、ASA-ARCH-13.0 を参照：

```
implements
supersedes
reverts
related_to
derived_from
```

---

## Updated Documents

* `docs/specs/auto_scribe_ai_implementation_memory_specification.md`
* `docs/change_requests/asa_cr_imp_002.md`（本ファイル）

---

## Result

```text
CR Status: Applied
Implementation Specification is now fully consistent
with Architecture Baseline (ASA-ARCH-13.0).
Ready for: ASA-IMPL-REQ-IMP-001
```
