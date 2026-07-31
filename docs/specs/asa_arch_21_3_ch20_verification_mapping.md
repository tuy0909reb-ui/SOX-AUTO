# ASA-ARCH-21.3 Verification Mapping — Chapter 20

Architecture traceability: each Construction Registry → specification → implementation → tests → verification.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CRG-1 Construction Registry Identity | §2 | `ConstructionRegistry.ts` / `CRG-1` + `registryId` | ConstructionRegistry.test | Stable architectural identity |
| CRG-2 Registry Entries | §2 | registry / `CRG-2` + `entries` | ConstructionRegistry.test | Declarative relationships only |
| CRG-3 Construction Definition References | §2 | registry / `CRG-3` + `definitionReferences` | ConstructionRegistry.test | Identity-only references |
| CRG-4 Construction Registry Metadata | §2 | registry / `CRG-4` + `metadata` | ConstructionRegistry.test | Descriptive only |
| CRG-5 Registry Compatibility | §2 | registry / `CRG-5` + `compatibility` | ConstructionRegistry.test | Contract-level compatibility |
| CRG-6 Registry Scope | §2 | registry / `CRG-6` + `registryScope` | ConstructionRegistry.test | No procedures / runtime |
| CRG-7 Registry Integrity | §2 | registry / `CRG-7` + `integrity` | ConstructionRegistry.test | Declarative integrity only |
| CRG-8 Declarative Restriction | §2 | registry / `CRG-8` | ConstructionRegistry.test | No register/resolve/load |
| CRG-9 Runtime Isolation | §2 | registry / `CRG-9` | ConstructionRegistry.test | No runtime refs |
| CRG-10 Boundary Preservation | §2 | registry / `CRG-10` | ConstructionRegistry.test | Ch11–Ch19 preserved |
| CRG-11 Future Registry Compatibility | §2 | registry / `CRG-11` | ConstructionRegistry.test | Forward compatibility |
| CRG-12 Registry Ownership | §2 | registry / `CRG-12` | ConstructionRegistry.test | Declarative ownership only |
| Contract Registry | — | `ContractRegistry.ts` | ConstructionRegistry.test | Principle-catalog only |
| Construction Registry Verification | §4 | `CONSTRUCTION_REGISTRY_VERIFICATION` | ConstructionRegistry.test | Exclusion inventory |
| Construction Registry Outcome | §5 | `CONSTRUCTION_REGISTRY_OUTCOME` | ConstructionRegistry.test | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch19 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
