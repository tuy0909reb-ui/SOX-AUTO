# ASA-ARCH-21.2 Chapter 5 — Failure Contract

**Draft 0.2**  
**Architecture ID:** ASA-ARCH-21.2（Chapter 5）  
**Parent:** ASA-ARCH-21.2 Chapter 4 — Validation（FROZEN）  
**Status:** DRAFT 0.2（Implementation Target — Chapter 5 only）

---

## 1. Purpose

Failure Contract は、PipelineDefinition（Chapter 2）、Expansion Rules（Chapter 3）、Validation（Chapter 4）に基づき、  
**構造的に継続不能な状態（Failure）を分類し、その意味論と境界を定義する契約** である。

Failure Contract は **Failure の動作（例外・停止・ログ等）を一切定義しない。**  
動作は実装責務であり、21.2 の範囲外である。

---

## 2. Failure Principles

### FL-1 — Declarative Failure

Failure Contract SHALL define failure categories and semantics only.

### FL-2 — Structural Failure Only

Failure SHALL be defined only in terms of structural semantics.

### FL-3 — Pre-runtime Detectability

Failure SHALL be detectable before runtime execution.

### FL-4 — Deterministic Failure

Failure SHALL be deterministic.

---

## 3. Failure Boundary

### FL-5 — Failure Is Not Behavior

Failure Contract SHALL NOT define exception types, error codes, logging, UI display,  
runtime stop behavior, Orchestrator error handling, or Retry / Timeout / Backoff.

### FL-6 — Failure Is Not Recovery

Failure Contract SHALL NOT define recovery behavior.

### FL-7 — Structural Scope Only

Failure Contract applies only to structural processing.

---

## 4. Failure Categories

### FL-8 — Invalid Structure

Invalid Structure SHALL be defined as:  
PipelineDefinition が Chapter 2 の構造契約に適合しない状態。

### FL-9 — Invalid Expansion

Invalid Expansion SHALL be defined as:  
WorkflowDefinition が Chapter 3 の展開契約に適合しない状態。

### FL-10 — Invariant Violation

Invariant Violation SHALL be defined as:  
Pipeline Invariants（PI-1〜PI-13）のいずれかに違反する状態。

### FL-11 — Compatibility Violation

Compatibility Violation SHALL be defined as:  
Downstream structural contracts に適合しない状態。

---

## 5. Failure Semantics

### FL-12 — Structural Non-continuability

Failure indicates structural non-continuability.

### FL-13 — Structurally Terminal

Failure SHALL be structurally terminal.

### FL-14 — Semantically Non-recoverable

Failure SHALL be semantically non-recoverable at the structural level.

---

## 6. Failure Determination

### FL-15 — Structural Validation Determines Failure

Failure categories are determined through structural validation.

### FL-16 — Deterministic Determination

Failure determination SHALL be deterministic.

---

## 7. Failure Category Contract

### FL-17 — Failure Category

Failure Category SHALL be one of:

- Invalid Structure  
- Invalid Expansion  
- Invariant Violation  
- Compatibility Violation  

---

## 8. Out of Scope

Failure handling, exception classes, error codes, recovery, retry, logging,  
runtime behavior, validation / expansion algorithms, WorkflowBuilder logic,  
ExecutionGraph construction, any runtime execution semantics.

---

## 9. Compatibility

SHALL preserve complete compatibility with ASA-ARCH-20.8〜21.1 and  
ASA-ARCH-21.2 Chapter 1–4. No frozen architectural contract may be modified. Extension only.
