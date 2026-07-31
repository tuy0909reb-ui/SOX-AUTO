# ASA-ARCH-21.3 Verification Mapping — Chapter 15

Architecture traceability: each Execution Definition Contract → specification → implementation → tests → verification.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| EDC-1 Definition Identity | §2 | `ExecutionDefinitionContract.ts` / `EDC-1` + `definitionId` | execution_definition_contract | Structural identity only |
| EDC-2 Definition Type | §2 | registry / `EDC-2` + `definitionType` | execution_definition_contract | Descriptive metadata only |
| EDC-3 Node Definition | §2 | registry / `EDC-3` + `nodes` | execution_definition_contract | Structural nodes only |
| EDC-4 Endpoint Definition | §2 | registry / `EDC-4` + `endpoints` | execution_definition_contract | Structural endpoints only |
| EDC-5 Structural Dependency Metadata | §2 | registry / `EDC-5` + `structuralDependencies` | execution_definition_contract | Structural deps only |
| EDC-6 Compatibility Declaration | §2 | registry / `EDC-6` + `compatibility` | execution_definition_contract | Compatibility metadata |
| EDC-7 Declarative Restriction | §2 | registry / `EDC-7` | execution_definition_contract | Declarative-only |
| EDC-8 Runtime Isolation | §2 | registry / `EDC-8` | execution_definition_contract | No runtime refs |
| EDC-9 Boundary Preservation | §2 | registry / `EDC-9` | execution_definition_contract | Ch11–Ch14 preserved |
| EDC-10 Future Runtime Compatibility | §2 | registry / `EDC-10` | execution_definition_contract | Stable consume interface |
| EDC-11 Definition Scope | §2 | registry / `EDC-11` + `definitionScope` | execution_definition_contract | Structural scope only |
| EDC-12 Definition Boundary | §2 | registry / `EDC-12` + `definitionBoundary` | execution_definition_contract | Structural boundary only |
| Execution Definition Verification | §4 | `EXECUTION_DEFINITION_CONTRACT_VERIFICATION` | execution_definition_contract | Exclusion inventory |
| Execution Definition Outcome | §5 | `EXECUTION_DEFINITION_CONTRACT_OUTCOME` | execution_definition_contract | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch14 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
