# ASA-ARCH-22.0 Verification Mapping — Chapter 22 Construction Discovery

Architecture traceability: each Construction Discovery principle → specification → implementation → tests → verification.

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CDD-1 Discovery Identity | §6 | `ConstructionDiscovery.ts` / `CDD-1` + `discoveryId` | ConstructionDiscovery.test | Unique immutable identity |
| CDD-2 Discovery Elements | §6 | registry / `CDD-2` + `elements` | ConstructionDiscovery.test | Catalog references only |
| CDD-3 Construction Catalog References | §6 | registry / `CDD-3` + `catalogReference` | ConstructionDiscovery.test | Catalog identity only |
| CDD-4 Discovery Metadata | §6 | registry / `CDD-4` + `metadata` | ConstructionDiscovery.test | Declarative metadata only |
| CDD-5 Discovery Compatibility | §6 | registry / `CDD-5` + `compatibility` | ConstructionDiscovery.test | Frozen / prior / catalog compat |
| CDD-6 Discovery Scope | §6 | registry / `CDD-6` + `discoveryScope` | ConstructionDiscovery.test | No implementation / lookup |
| CDD-7 Discovery Integrity | §6 | registry / `CDD-7` + `integrity` | ConstructionDiscovery.test | Declarative integrity only |
| CDD-8 Declarative Restriction | §6 | registry / `CDD-8` | ConstructionDiscovery.test | No executable members |
| CDD-9 Runtime Isolation | §6 | registry / `CDD-9` | ConstructionDiscovery.test | No runtime refs |
| CDD-10 Boundary Preservation | §6 | registry / `CDD-10` | ConstructionDiscovery.test | Ch18–Ch21 preserved |
| CDD-11 Future Compatibility | §6 | registry / `CDD-11` | ConstructionDiscovery.test | Forward compatibility |
| CDD-12 Discovery Ownership | §6 | registry / `CDD-12` | ConstructionDiscovery.test | Ownership boundaries |
| Contract Registry | — | `ContractRegistry.ts` | ConstructionDiscovery.test | Principle-catalog only |
| Construction Discovery Verification | — | `CONSTRUCTION_DISCOVERY_VERIFICATION` | ConstructionDiscovery.test | Exclusion inventory |
| Construction Discovery Outcome | — | `CONSTRUCTION_DISCOVERY_OUTCOME` | ConstructionDiscovery.test | Outcome declarative |
| Frozen 20.8〜21.3 Ch1–Ch21 preserved | — | architecture_constraints | architecture_constraints | Backward compatibility |
