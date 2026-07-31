# ASA-ARCH-21.3 Verification Mapping — Chapter 18

Architecture traceability: each Construction Contract → specification → implementation → tests → verification.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CCC-1 Contract Identity | §2 | `ConstructionContract.ts` / `CCC-1` + `contractId` | ConstructionContract.test | Stable structural identity |
| CCC-2 Input Contract | §2 | registry / `CCC-2` + `inputContract` | ConstructionContract.test | Declarative reference only |
| CCC-3 Output Contract | §2 | registry / `CCC-3` + `outputContract` | ConstructionContract.test | Declarative output only |
| CCC-4 Construction Metadata | §2 | registry / `CCC-4` + `constructionMetadata` | ConstructionContract.test | No config/options/behavior |
| CCC-5 Construction Responsibility Metadata | §2 | registry / `CCC-5` + `constructionResponsibilityMetadata` | ConstructionContract.test | Ch17-associated only |
| CCC-6 Compatibility | §2 | registry / `CCC-6` + `compatibility` | ConstructionContract.test | Compatibility metadata |
| CCC-7 Construction Scope | §2 | registry / `CCC-7` + `constructionScope` | ConstructionContract.test | No runtime behavior |
| CCC-8 Declarative Restriction | §2 | registry / `CCC-8` | ConstructionContract.test | No executable members |
| CCC-9 Runtime Isolation | §2 | registry / `CCC-9` | ConstructionContract.test | No runtime refs |
| CCC-10 Boundary Preservation | §2 | registry / `CCC-10` | ConstructionContract.test | Ch11–Ch17 preserved |
| CCC-11 Future Construction Compatibility | §2 | registry / `CCC-11` | ConstructionContract.test | Forward compatibility |
| CCC-12 Contract Scope | §2 | registry / `CCC-12` | ConstructionContract.test | Declarative scope only |
| Contract Registry | — | `ContractRegistry.ts` | ConstructionContract.test | Lookup only |
| Construction Contract Verification | §4 | `CONSTRUCTION_CONTRACT_VERIFICATION` | ConstructionContract.test | Exclusion inventory |
| Construction Contract Outcome | §5 | `CONSTRUCTION_CONTRACT_OUTCOME` | ConstructionContract.test | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch17 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
