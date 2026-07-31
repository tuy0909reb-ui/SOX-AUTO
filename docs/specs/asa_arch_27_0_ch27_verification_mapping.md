# ASA-ARCH-27.0 Verification Mapping — Chapter 27 Construction Planning Definition

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Definition Identity | §6 | `definitionId` / `ConstructionPlanningDefinitionId` | ConstructionPlanningDefinition.test | Unique immutable identity |
| Definition Metadata | §6 | `ConstructionPlanningDefinitionMetadata` | ConstructionPlanningDefinition.test | Declarative metadata only |
| Definition Contents | §4 / §6 | `ConstructionPlanningDefinitionContents` | ConstructionPlanningDefinition.test | Contract reference only |
| Contract Preservation | §4 / §7 | `contents.constructionPlanningContract` | ConstructionPlanningDefinitionContract.test | Same instance; no transform |
| Constraint Preservation | §4 | via contract definition | ConstructionPlanningDefinitionContract.test | Consumers / relationships / usage unchanged |
| Structural Consistency | §4 | plan via contract | ConstructionPlanningDefinitionContract.test | Plan identity / contents preserved |
| Definition Props | §6 | `ConstructionPlanningDefinitionProps` | ConstructionPlanningDefinition.test | Identity / metadata / contents |
| Declarative Restriction | §2 | package sources | ConstructionPlanningDefinitionBuilder.test | No executable semantics |
| Runtime Isolation | §2 | package sources | ConstructionPlanningDefinitionBuilder.test | No runtime imports |
| Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-27.0-001 | Ch11–Ch26 unchanged |
| Structural Builder | §7 | `ConstructionPlanningDefinitionBuilder` | ConstructionPlanningDefinitionBuilder.test | Required fields only |
| Immutable Construction | §1 / §4 | `Object.freeze` | ConstructionPlanningDefinition.test | Frozen instance / nested fields |
