# ASA-ARCH-21.3 Verification Mapping — Chapter 2

Architecture traceability: each Composition Boundary contract → representation → test → acceptance section.

| Contract | Spec § | Representation | Test | Acceptance Section |
|---|---|---|---|---|
| CB-1 Structural Boundary | §2 | `CompositionBoundary` registry | composition_boundary | CB-1–CB-10 |
| CB-2 Runtime Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-3 Expansion Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-4 Validation Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-5 Failure Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-6 WorkflowBuilder Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-7 ExecutionGraph Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-8 Scheduling Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-9 Engine Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| CB-10 Downstream Boundary | §2 | registry | composition_boundary | CB-1–CB-10 |
| Boundary Verification | §3 | `COMPOSITION_BOUNDARY_VERIFICATION` | composition_boundary | Boundary Verification |
| Boundary Outcome | §4 | `COMPOSITION_BOUNDARY_OUTCOME` | composition_boundary | Boundary Outcome |
| Frozen 20.8〜21.3 Ch1 preserved | — | architecture_constraints | architecture_constraints | Backward Compatibility |
