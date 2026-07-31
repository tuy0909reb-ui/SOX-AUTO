# ASA-ARCH-21.3 Verification Mapping — Chapter 16

Architecture traceability: each Execution Graph Contract → specification → implementation → tests → verification.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| EGC-1 Graph Identity | §2 | `ExecutionGraphContract.ts` / `EGC-1` + `graphId` | execution_graph_contract | Structural identity only |
| EGC-2 Graph Node | §2 | registry / `EGC-2` + `GraphNode` | execution_graph_contract | Structural nodes only |
| EGC-3 Graph Edge | §2 | registry / `EGC-3` + `GraphEdge` | execution_graph_contract | Structural edges only |
| EGC-4 Entry Node | §2 | registry / `EGC-4` + `entryNodes` | execution_graph_contract | Entry points only |
| EGC-5 Exit Node | §2 | registry / `EGC-5` + `exitNodes` | execution_graph_contract | Exit points only |
| EGC-6 Graph Compatibility | §2 | registry / `EGC-6` + `compatibility` | execution_graph_contract | Compatibility metadata |
| EGC-7 Graph Scope | §2 | registry / `EGC-7` + `graphScope` | execution_graph_contract | Structural scope only |
| EGC-8 Graph Boundary | §2 | registry / `EGC-8` + `graphBoundary` | execution_graph_contract | Structural boundary only |
| EGC-9 Runtime Isolation | §2 | registry / `EGC-9` | execution_graph_contract | No runtime refs |
| EGC-10 Boundary Preservation | §2 | registry / `EGC-10` | execution_graph_contract | Ch11–Ch15 preserved |
| EGC-11 Future Runtime Compatibility | §2 | registry / `EGC-11` | execution_graph_contract | Stable consume interface |
| EGC-12 Graph Integrity | §2 | registry / `EGC-12` + `integrity` | execution_graph_contract | Declarative integrity only |
| Execution Graph Verification | §4 | `EXECUTION_GRAPH_CONTRACT_VERIFICATION` | execution_graph_contract | Exclusion inventory |
| Execution Graph Outcome | §5 | `EXECUTION_GRAPH_CONTRACT_OUTCOME` | execution_graph_contract | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch15 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
