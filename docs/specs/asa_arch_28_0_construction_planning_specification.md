# ASA-ARCH-28.0 — Construction Planning Specification

**Draft 0.4**  
**Architecture ID:** ASA-ARCH-28.0（Construction Planning Specification）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 28  
**Parent:** ASA-ARCH-27.0 — Construction Planning Definition（FROZEN） / ASA-ARCH-21.3 Chapter 27  
**Status:** DRAFT 0.4 / FROZEN（ASA-FREEZE-ARCH-28.0-001）

---

# 1. Purpose

Construction Planning Specification defines the immutable declarative
specification conforming to Construction Planning Definition.

Construction Planning Specification consumes only Construction Planning
Definition.

Construction Planning Specification introduces no planning, runtime,
behavioral, or execution semantics.

---

# 2. Responsibility

Responsible only for specification identity, metadata, specification contents,
and structural conformance to Construction Planning Definition.

Not responsible for planning algorithms, discovery, selection, lookup,
resolution, binding, loading, scheduling, dependency analysis, object
instantiation, construction execution, or runtime concerns.

---

# 3. Position

… → Construction Planning Definition → **Construction Planning Specification** →
Subsequent Declarative Architecture

---

# 4. Construction Planning Specification Contract

Construction Planning Specification SHALL be immutable.

Construction Planning Specification SHALL consume only Construction Planning
Definition.

Construction Planning Specification SHALL preserve Construction Planning
Definition integrity.

Construction Planning Specification SHALL NOT define executable behavior or
implementation.

---

# 5. Architectural Boundary

Construction Planning Definition defines the immutable declarative definition.

Construction Planning Specification defines only the immutable declarative
specification conforming to that definition.

Construction Planning Specification SHALL NOT absorb Definition, Contract, or
Plan responsibilities.

---

# 6. Frozen Contract Elements

| Element | Description |
|---|---|
| Identity | Immutable `specificationId` / `ConstructionPlanningSpecificationId` |
| Metadata | Immutable declarative `ConstructionPlanningSpecificationMetadata` |
| Contents | Immutable `ConstructionPlanningSpecificationContents` |
| Definition Reference | Chapter 27 `ConstructionPlanningDefinition`（preserved by reference） |
| Props | Declarative `ConstructionPlanningSpecificationProps` shape |
| Builder | Structural / required-field validation only |

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_planning_specification/ConstructionPlanningSpecificationTypes.ts` |
| Model | `src/construction_planning_specification/ConstructionPlanningSpecification.ts` |
| Builder | `src/construction_planning_specification/ConstructionPlanningSpecificationBuilder.ts` |

No additional production source files are included in this freeze.

`ConstructionPlanningDefinition` is imported from Chapter 27 — not redefined.

Builder performs structural validation only（required identity, metadata,
Construction Planning Definition; does not modify or transform the definition）.

---

# Architecture Status

Status: Draft 0.4 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-28.0-001）
