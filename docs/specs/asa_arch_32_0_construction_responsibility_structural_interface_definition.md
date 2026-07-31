# ASA-ARCH-32.0 — Construction Responsibility Structural Interface Definition Boundary

**Draft 0.3**  
**Architecture ID:** ASA-ARCH-32.0（Construction Responsibility Structural Interface Definition Boundary）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 32（downstream of Structural Responsibility Boundary）  
**Parent:** ASA-ARCH-31.0 — Construction Structural Responsibility Boundary（FROZEN） / ASA-ARCH-21.3 Chapter 31  
**Status:** DRAFT 0.3 / **FROZEN**（ASA-FREEZE-ARCH-32.0-001）

Status: Draft 0.3 / FROZEN  
Registration: ASA-REGISTER-ARCH-32.0-001  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-32.0-001）

---

# 1. Scope

Chapter 32 introduces the architectural boundary responsible for defining the
structural interface definition between an established Construction Structural
Responsibility Boundary and subsequent architectural responsibility domains.

"Interface" refers exclusively to structural architectural relationships —
not runtime, executable, service, or implementation interfaces.

This chapter does not extend the Construction Planning Pipeline and does not
modify Chapters 29–31 artifacts.

---

# 2. Position

```text
… → Construction Structural Responsibility Boundary (Ch31)
        ↓
Construction Responsibility Structural Interface Definition Boundary (Ch32)
```

Planning Pipeline terminates at Chapter 29. Chapter 30 remains Manifest
acceptance. Chapter 31 remains structural responsibility classification.

---

# 3. Purpose

Establish deterministic structural connection requirements:

- responsibility input structure
- responsibility output structure
- structural relationship definition
- compatibility requirements

No execution contract, capability binding, implementation selection, runtime
preparation, or behavioral interpretation.

---

# 4. Architectural Responsibility

Responsible for receiving Chapter 31 output, defining structural interface
requirements, establishing immutable Structural Interface Definitions, and
preserving upstream identities.

Not responsible for planning, classification, capability/implementation
selection, execution graphs, runtime objects, scheduling, or execution readiness.

---

# 5. Input / Output

**Input:** Construction Structural Responsibility Boundary（Chapter 31 exclusive）.

**Output:** Construction Responsibility Structural Interface Definition —
structural definitions only; upstream artifacts remain authoritative.

---

# 6. Identity / Metadata

Identity: Interface Definition Identifier, Source Responsibility Boundary
Identifier, Source Manifest Identifier, Architecture Version, Structural Version.

Metadata remains structural（validationStatus: `defined`）.

---

# 7. Builder

`ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.define()`

Structural validation only. Consumes Chapter 31 exclusively.

---

# 8. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts` |
| Model | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition.ts` |
| Builder | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts` |

`ConstructionStructuralResponsibilityBoundary` is imported from Chapter 31 — not redefined.
