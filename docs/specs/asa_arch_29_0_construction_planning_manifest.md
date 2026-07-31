# ASA-ARCH-29.0 — Construction Planning Manifest

**Draft 0.3**  
**Architecture ID:** ASA-ARCH-29.0（Construction Planning Manifest）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 29  
**Parent:** ASA-ARCH-28.0 — Construction Planning Specification（FROZEN） / ASA-ARCH-21.3 Chapter 28  
**Status:** DRAFT 0.3 / FROZEN（ASA-FREEZE-ARCH-29.0-001）

---

# 1. Purpose

Construction Planning Manifest defines the immutable declarative manifest
conforming to Construction Planning Specification.

Construction Planning Manifest consumes only Construction Planning
Specification.

Construction Planning Manifest introduces no planning, runtime, behavioral, or
execution semantics.

---

# 2. Responsibility

Responsible only for manifest identity, metadata, manifest contents, and
structural conformance to Construction Planning Specification.

Not responsible for planning algorithms, discovery, selection, lookup,
resolution, binding, loading, scheduling, dependency analysis, object
instantiation, construction execution, or runtime concerns.

---

# 3. Position

… → Construction Planning Specification → **Construction Planning Manifest** →
Subsequent Declarative Architecture

---

# 4. Construction Planning Manifest Contract

Construction Planning Manifest SHALL be immutable.

Construction Planning Manifest SHALL consume only Construction Planning
Specification.

Construction Planning Manifest SHALL preserve Construction Planning
Specification integrity.

Construction Planning Manifest SHALL NOT define executable behavior or
implementation.

---

# 5. Architectural Boundary

Construction Planning Specification defines the immutable declarative
specification.

Construction Planning Manifest defines only the immutable declarative manifest
conforming to that specification.

Construction Planning Manifest SHALL NOT absorb Specification, Definition,
Contract, or Plan responsibilities.

---

# 6. Frozen Contract Elements

| Element | Description |
|---|---|
| Identity | Immutable `manifestId` / `ConstructionPlanningManifestId` |
| Metadata | Immutable declarative `ConstructionPlanningManifestMetadata` |
| Contents | Immutable `ConstructionPlanningManifestContents` |
| Specification Reference | Chapter 28 `ConstructionPlanningSpecification`（preserved by reference） |
| Props | Declarative `ConstructionPlanningManifestProps` shape |
| Builder | Structural / required-field validation only |

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_planning_manifest/ConstructionPlanningManifestTypes.ts` |
| Model | `src/construction_planning_manifest/ConstructionPlanningManifest.ts` |
| Builder | `src/construction_planning_manifest/ConstructionPlanningManifestBuilder.ts` |

No additional production source files are included in this freeze.

`ConstructionPlanningSpecification` is imported from Chapter 28 — not redefined.

Builder performs structural validation only（required identity, metadata,
Construction Planning Specification; does not modify or transform the
specification）.

---

# Architecture Status

Status: Draft 0.3 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-29.0-001）
