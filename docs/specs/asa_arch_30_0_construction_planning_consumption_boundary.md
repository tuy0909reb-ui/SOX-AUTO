# ASA-ARCH-30.0 — Construction Planning Consumption Boundary

**Draft 0.3**  
**Architecture ID:** ASA-ARCH-30.0（Construction Planning Consumption Boundary）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 30（downstream of Planning Pipeline）  
**Parent:** ASA-ARCH-29.0 — Construction Planning Manifest（FROZEN） / ASA-ARCH-21.3 Chapter 29  
**Status:** DRAFT 0.3 / **FROZEN**（ASA-FREEZE-ARCH-30.0-001）

---

# 1. Purpose

Establish the first deterministic architectural boundary through which
downstream architecture may consume an immutable Construction Planning Manifest.

Chapter 30 does **not** extend the Construction Planning Pipeline.

Chapter 30 does **not** introduce another declarative planning artifact.

---

# 2. Position

… → Construction Planning Manifest → **Construction Planning Consumption Boundary** →
Downstream Architecture

The Planning Pipeline terminates at Chapter 29.

---

# 3. Responsibility

Responsible for:

- accepting an immutable Construction Planning Manifest
- structural compatibility validation
- establishing the Consumption Boundary
- preserving Manifest declarative structure
- preventing bypass of the boundary

Not responsible for planning, rebuilding manifests, interpretation,
scheduling, orchestration, runtime, dependency resolution, or execution.

---

# 4. Input / Output

**Input:** exactly one frozen, immutable, structurally valid Construction Planning Manifest.

**Output:** Architecturally Accepted Manifest — the **same** original Manifest
after successful structural acceptance. No new artifact is created.

---

# 5. Boundary Identity

- Boundary Identifier
- Manifest Identifier（preserved; never redefined）
- Architecture Version
- Structural Version

---

# 6. Builder

`ConstructionPlanningConsumptionBoundaryBuilder` establishes the boundary.

It does not construct another Manifest or planning artifact.

---

# 7. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryTypes.ts` |
| Model | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary.ts` |
| Builder | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder.ts` |

`ConstructionPlanningManifest` is imported from Chapter 29 — not redefined.

---

# Architecture Status

Status: Draft 0.3 / FROZEN  
Registration: ASA-REGISTER-ARCH-30.0-001  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-30.0-001）
