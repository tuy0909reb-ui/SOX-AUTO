# ASA-ARCH-21.3 Verification Mapping — Chapter 6

Architecture traceability: each Composition Constraint → representation → test → acceptance section.

| Contract | Spec § | Representation | Test | Acceptance Section |
|---|---|---|---|---|
| CT-1 Structural Constraint | §2 | `CompositionConstraints` registry | composition_constraints | CT-1–CT-10 |
| CT-2 Identity Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-3 Hierarchy Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-4 Encapsulation Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-5 Dependency Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-6 Responsibility Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-7 Coupling Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-8 Recursive Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-9 Downstream Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| CT-10 Behavioral Exclusion Constraint | §2 | registry | composition_constraints | CT-1–CT-10 |
| Constraint Verification | §3 | `COMPOSITION_CONSTRAINT_VERIFICATION` | composition_constraints | Constraint Verification |
| Constraint Outcome | §4 | `COMPOSITION_CONSTRAINT_OUTCOME` | composition_constraints | Constraint Outcome |
| Frozen 20.8〜21.3 Ch1–Ch5 preserved | — | architecture_constraints | architecture_constraints | Backward Compatibility |
