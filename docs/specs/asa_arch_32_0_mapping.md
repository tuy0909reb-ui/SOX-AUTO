# ASA-ARCH-32.0 Verification Mapping — Chapter 32 Structural Interface Definition Boundary

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Interface Definition Identity | §7 | `identity.interfaceDefinitionId` / versions / source ids | Definition.test | Immutable identity |
| Source Boundary Preservation | §5 / §11 | `sourceResponsibilityBoundary` | Conformance.test | Same Ch31 instance |
| Manifest Identity Preservation | §7 | `identity.sourceManifestId` | Builder / Conformance | Preserved via Ch31 |
| Responsibility Domain Structure | §6 / §9 | `responsibilityDomainStructure` | Builder.test | Required; compatible with Ch31 |
| Input / Output Structure | §6 / §9 | `inputStructureDefinition` / `outputStructureDefinition` | Builder.test | Required structure ids |
| Compatibility Constraints | §6 / §9 | `compatibilityConstraints` | Builder.test | Align with input/output |
| Structural Definition | §10 | Builder `define()` | Builder.test | Required-field validation |
| Chapter 31 Exclusive Entry | §11 | package imports | Builder.test | No direct Ch25–30 imports |
| Declarative Purity | §14 | package sources | Builder.test | No executable APIs |
| Runtime Isolation | §16 | package sources | Builder.test | No runtime imports |
| Behavioral Absence | §17 | package sources | Builder.test | No selection / interpretation |
| Boundary Preservation | §18 | frozen spot-checks | ASA-VERIFY-ARCH-32.0-001 | Ch1–Ch31 unchanged |
| Deterministic Definition | §9 / §19 | same inputs | Conformance.test | Equal JSON / same Ch31 ref |
