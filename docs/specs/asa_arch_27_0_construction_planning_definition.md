# ASA-ARCH-27.0 — Construction Planning Definition

**Draft 0.5**  
**Architecture ID:** ASA-ARCH-27.0（Construction Planning Definition）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 27  
**Parent:** ASA-ARCH-26.0 — Construction Planning Contract（FROZEN） / ASA-ARCH-21.3 Chapter 26  
**Status:** DRAFT 0.5 / FROZEN（ASA-FREEZE-ARCH-27.0-001）

---

# 1. Purpose

Construction Planning Definition defines the immutable declarative definition
governed by Construction Planning Contract.

Construction Planning Definition consumes only Construction Planning Contract.

Construction Planning Definition introduces no planning, runtime, behavioral, or
execution semantics.

---

# 2. Responsibility

Responsible only for definition identity, metadata, definition contents, and
structural conformance to Construction Planning Contract.

Not responsible for planning algorithms, discovery, selection, lookup,
resolution, binding, loading, scheduling, dependency analysis, object
instantiation, construction execution, or runtime concerns.

---

# 3. Position

… → Construction Planning Contract → **Construction Planning Definition** →
Subsequent Declarative Architecture

---

# 4. Construction Planning Definition Contract

Construction Planning Definition SHALL be immutable.

Construction Planning Definition SHALL consume only Construction Planning Contract.

Construction Planning Definition SHALL preserve Construction Planning Contract
integrity and declarative contractual constraints.

Construction Planning Definition SHALL NOT define executable behavior or
implementation.

---

# 5. Architectural Boundary

Construction Planning Contract defines declarative contractual constraints.

Construction Planning Definition defines only the immutable declarative
definition governed by that contract.

Construction Planning Definition SHALL NOT absorb Contract or Plan
responsibilities.

---

# 6. Frozen Contract Elements

| Element | Description |
|---|---|
| Identity | Immutable `definitionId` / `ConstructionPlanningDefinitionId` |
| Metadata | Immutable declarative `ConstructionPlanningDefinitionMetadata` |
| Contents | Immutable `ConstructionPlanningDefinitionContents` |
| Contract Reference | Chapter 26 `ConstructionPlanningContract`（preserved by reference） |
| Props | Declarative `ConstructionPlanningDefinitionProps` shape |
| Builder | Structural / required-field validation only |

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_planning_definition/ConstructionPlanningDefinitionTypes.ts` |
| Model | `src/construction_planning_definition/ConstructionPlanningDefinition.ts` |
| Builder | `src/construction_planning_definition/ConstructionPlanningDefinitionBuilder.ts` |

No additional production source files are included in this freeze.

`ConstructionPlanningContract` is imported from Chapter 26 — not redefined.

Builder performs structural validation only（required identity, metadata,
Construction Planning Contract; does not modify or transform the contract）.

---

# Architecture Status

Status: Draft 0.5 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-27.0-001）
