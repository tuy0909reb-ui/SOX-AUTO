# ASA-ARCH-25.0 — Construction Plan

**Draft 0.3**  
**Architecture ID:** ASA-ARCH-25.0（Construction Plan）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 25  
**Parent:** ASA-ARCH-24.0 — Construction Selection Result（FROZEN） / ASA-ARCH-21.3 Chapter 24  
**Status:** DRAFT 0.3 / FROZEN（ASA-FREEZE-ARCH-25.0-001）

---

# 1. Purpose

Construction Plan defines the declarative architectural responsibility for the
immutable declarative plan artifact prepared from a frozen Construction
Selection Result.

Construction Plan consumes only Construction Selection Result references.

Construction Plan introduces no planning, runtime, behavioral, or execution
semantics.

---

# 2. Responsibility

Responsible only for plan identity, metadata, contents, and declarative boundary.

Not responsible for planning algorithms, discovery, selection, lookup,
resolution, binding, loading, scheduling, dependency analysis, object
instantiation, construction execution, or runtime concerns.

---

# 3. Position

… → Construction Selection Result → **Construction Plan** →
Subsequent Declarative Architecture

---

# 4. Construction Plan Contract

Construction Plan SHALL be immutable.

Construction Plan SHALL consume only Construction Selection Result.

Contents SHALL preserve selected references and their established ordering.

Construction Plan SHALL NOT define executable behavior or implementation.

---

# 5. Architectural Boundary

Construction Selection Result defines Selected References / result contents.

Construction Plan defines only the immutable declarative plan artifact.

Construction Plan SHALL NOT absorb Selection Result or Selection responsibilities.

---

# 6. Frozen Contract Elements

| Element | Description |
|---|---|
| Identity | Immutable `planId` / `ConstructionPlanId` |
| Metadata | Immutable declarative `ConstructionPlanMetadata` |
| Contents | Immutable ordered `ConstructionPlanContents` |
| Reference | `ConstructionPlanReference` = Chapter 23 `SelectedReference`（reuse） |
| Props | Declarative `ConstructionPlanProps` shape |
| Builder | Structural / required-field validation only |

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_plan/ConstructionPlanTypes.ts` |
| Model | `src/construction_plan/ConstructionPlan.ts` |
| Builder | `src/construction_plan/ConstructionPlanBuilder.ts` |

No additional public artifacts are included in this freeze.

`ConstructionPlanReference` is a type alias of Chapter 23 `SelectedReference` —
not redefined.

Builder performs structural validation only（required identity, metadata,
non-empty contents; preserves caller-supplied order）.

---

# Architecture Status

Status: Draft 0.3 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-25.0-001）
