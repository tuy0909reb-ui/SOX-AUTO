# ASA-ARCH-21.3 Verification Mapping — Chapter 17

Architecture traceability: each Execution Graph Construction Boundary Contract → specification → implementation → tests → verification.

Note: Chapter 17 CBC-* IDs denote Construction Boundary Contract elements and are distinct from Chapter 11 Composition Boundary Contract CBC-* IDs（separate TypeScript id unions / registries）.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CBC-1 Boundary Identity | §2 | `ExecutionGraphConstructionBoundaryContract.ts` / `CBC-1` + `boundaryId` | execution_graph_construction_boundary_contract | Structural identity only |
| CBC-2 Construction Ownership | §2 | registry / `CBC-2` | execution_graph_construction_boundary_contract | Ownership metadata only |
| CBC-3 Construction Input Boundary | §2 | registry / `CBC-3` + `inputBoundary` | execution_graph_construction_boundary_contract | Accepted types only |
| CBC-4 Output Boundary | §2 | registry / `CBC-4` + `outputBoundary` | execution_graph_construction_boundary_contract | Declarative output only |
| CBC-5 Responsibility Boundary | §2 | registry / `CBC-5` + `responsibilityBoundary` | execution_graph_construction_boundary_contract | Transition only |
| CBC-6 Compatibility | §2 | registry / `CBC-6` + `compatibility` | execution_graph_construction_boundary_contract | Compatibility metadata |
| CBC-7 Construction Scope | §2 | registry / `CBC-7` + `constructionScope` | execution_graph_construction_boundary_contract | Structural scope only |
| CBC-8 Declarative Restriction | §2 | registry / `CBC-8` | execution_graph_construction_boundary_contract | Declarative-only |
| CBC-9 Runtime Isolation | §2 | registry / `CBC-9` | execution_graph_construction_boundary_contract | No runtime refs |
| CBC-10 Boundary Preservation | §2 | registry / `CBC-10` | execution_graph_construction_boundary_contract | Ch11–Ch16 preserved |
| CBC-11 Future Construction Compatibility | §2 | registry / `CBC-11` | execution_graph_construction_boundary_contract | Stable consume interface |
| CBC-12 Construction Transition | §2 | registry / `CBC-12` | execution_graph_construction_boundary_contract | Transition only |
| Construction Boundary Verification | §4 | `EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_VERIFICATION` | execution_graph_construction_boundary_contract | Exclusion inventory |
| Construction Boundary Outcome | §5 | `EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME` | execution_graph_construction_boundary_contract | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch16 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
