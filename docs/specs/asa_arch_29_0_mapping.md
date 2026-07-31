# ASA-ARCH-29.0 Verification Mapping — Chapter 29 Construction Planning Manifest

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Manifest Identity | §7 | `manifestId` / `ConstructionPlanningManifestId` | ConstructionPlanningManifest.test | Unique immutable identity |
| Manifest Metadata | §8 | `ConstructionPlanningManifestMetadata` | ConstructionPlanningManifest.test | Declarative metadata only |
| Manifest Contents | §9 | `ConstructionPlanningManifestContents` | ConstructionPlanningManifest.test | Specification reference only |
| Specification Preservation | §4 / §9 | `contents.constructionPlanningSpecification` | ConstructionPlanningManifestConformance.test | Same instance; no transform |
| Chain Consistency | §9 | via specification → definition → contract → plan | ConstructionPlanningManifestConformance.test | Full chain preserved |
| Manifest Props | — | `ConstructionPlanningManifestProps` | ConstructionPlanningManifest.test | Identity / metadata / contents |
| Declarative Restriction | §16 | package sources | ConstructionPlanningManifestBuilder.test | No executable semantics |
| Runtime Isolation | §10 / §15 | package sources | ConstructionPlanningManifestBuilder.test | No runtime imports |
| Boundary Preservation | §12 / §18 | frozen spot-checks | ASA-VERIFY-ARCH-29.0-001 | Ch11–Ch28 unchanged |
| Structural Builder | §11 | `ConstructionPlanningManifestBuilder` | ConstructionPlanningManifestBuilder.test | Required fields only |
| Immutable Construction | §1 / §10 | `Object.freeze` | ConstructionPlanningManifest.test | Frozen instance / nested fields |
| Serialization / Determinism | §10 | JSON shape | ConstructionPlanningManifest.test | Serializable / deterministic |
| Manifest Conformance | §4 / §18 | specification by identity | ConstructionPlanningManifestConformance.test | Conforms to Ch28 specification |
