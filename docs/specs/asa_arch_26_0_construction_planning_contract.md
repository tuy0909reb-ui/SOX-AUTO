# ASA-ARCH-26.0 — Construction Planning Contract

**Draft 0.4**  
**Architecture ID:** ASA-ARCH-26.0（Construction Planning Contract）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 26  
**Parent:** ASA-ARCH-25.0 — Construction Plan（FROZEN） / ASA-ARCH-21.3 Chapter 25  
**Status:** DRAFT 0.4 / FROZEN（ASA-FREEZE-ARCH-26.0-001）

---

# 1. Purpose

Construction Planning Contract defines the declarative architectural contract
governing permitted declarative consumption of Construction Plan by subsequent
declarative architectural stages.

Construction Planning Contract consumes only Construction Plan.

Construction Planning Contract introduces no planning, runtime, behavioral, or
execution semantics.

---

# 2. Responsibility

Responsible only for contract identity, metadata, contract definition, and
declarative contractual constraints.

Not responsible for planning algorithms, discovery, selection, lookup,
resolution, binding, loading, scheduling, dependency analysis, object
instantiation, construction execution, or runtime concerns.

---

# 3. Position

… → Construction Plan → **Construction Planning Contract** →
Subsequent Declarative Architecture

---

# 4. Construction Planning Contract

Construction Planning Contract SHALL be immutable.

Construction Planning Contract SHALL consume only Construction Plan.

Construction Planning Contract SHALL preserve Construction Plan integrity.

Construction Planning Contract SHALL NOT define executable behavior or
implementation.

---

# 5. Architectural Boundary

Construction Plan defines the immutable declarative plan artifact.

Construction Planning Contract defines only the immutable declarative
contractual constraints governing Construction Plan consumption.

Construction Planning Contract SHALL NOT absorb Plan or Selection
responsibilities.

---

# 6. Frozen Contract Elements

| Element | Description |
|---|---|
| Identity | Immutable `contractId` / `ConstructionPlanningContractId` |
| Metadata | Immutable declarative `ConstructionPlanningContractMetadata` |
| Definition | Immutable `ConstructionPlanningContractDefinition` |
| Plan Reference | Chapter 25 `ConstructionPlan`（preserved by reference） |
| Constraints | Permitted consumers / relationships / usage constraints |
| Props | Declarative `ConstructionPlanningContractProps` shape |
| Builder | Structural / required-field validation only |

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_planning_contract/ConstructionPlanningContractTypes.ts` |
| Model | `src/construction_planning_contract/ConstructionPlanningContract.ts` |
| Builder | `src/construction_planning_contract/ConstructionPlanningContractBuilder.ts` |

No additional production source files are included in this freeze.

`ConstructionPlan` is imported from Chapter 25 — not redefined.

Builder performs structural validation only（required identity, metadata,
Construction Plan; does not modify or transform the plan）.

---

# Architecture Status

Status: Draft 0.4 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-26.0-001）
