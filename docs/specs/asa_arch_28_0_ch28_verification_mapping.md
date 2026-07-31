# ASA-ARCH-28.0 Verification Mapping — Chapter 28 Construction Planning Specification

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Specification Identity | §6 | `specificationId` / `ConstructionPlanningSpecificationId` | ConstructionPlanningSpecification.test | Unique immutable identity |
| Specification Metadata | §6 | `ConstructionPlanningSpecificationMetadata` | ConstructionPlanningSpecification.test | Declarative metadata only |
| Specification Contents | §4 / §6 | `ConstructionPlanningSpecificationContents` | ConstructionPlanningSpecification.test | Definition reference only |
| Definition Preservation | §4 / §7 | `contents.constructionPlanningDefinition` | ConstructionPlanningSpecificationConformance.test | Same instance; no transform |
| Chain Consistency | §4 | via definition → contract → plan | ConstructionPlanningSpecificationConformance.test | Plan / contract preserved |
| Specification Props | §6 | `ConstructionPlanningSpecificationProps` | ConstructionPlanningSpecification.test | Identity / metadata / contents |
| Declarative Restriction | §2 | package sources | ConstructionPlanningSpecificationBuilder.test | No executable semantics |
| Runtime Isolation | §2 | package sources | ConstructionPlanningSpecificationBuilder.test | No runtime imports |
| Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-28.0-001 | Ch11–Ch27 unchanged |
| Structural Builder | §7 | `ConstructionPlanningSpecificationBuilder` | ConstructionPlanningSpecificationBuilder.test | Required fields only |
| Immutable Construction | §1 / §4 | `Object.freeze` | ConstructionPlanningSpecification.test | Frozen instance / nested fields |
| Serialization / Determinism | §10 | JSON shape | ConstructionPlanningSpecification.test | Serializable / deterministic |
