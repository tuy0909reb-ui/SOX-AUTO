# ASA-ARCH-26.0 Verification Mapping — Chapter 26 Construction Planning Contract

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Contract Identity | §6 | `contractId` / `ConstructionPlanningContractId` | ConstructionPlanningContract.spec | Unique immutable identity |
| Contract Metadata | §6 | `ConstructionPlanningContractMetadata` | ConstructionPlanningContract.spec | Declarative metadata only |
| Contract Definition | §4 / §6 | `ConstructionPlanningContractDefinition` | ConstructionPlanningContract.spec | Constraints + plan reference |
| ConstructionPlan Preservation | §4 / §7 | `definition.constructionPlan` | ConstructionPlanningContract.spec / Builder.spec | Same instance; no transform |
| Permitted Consumers | §6 | `permittedConsumers` | ConstructionPlanningContract.spec | Declarative constraint array |
| Architectural Relationships | §6 | `permittedArchitecturalRelationships` | ConstructionPlanningContract.spec | Declarative constraint array |
| Usage Constraints | §6 | `declarativeUsageConstraints` | ConstructionPlanningContract.spec | Declarative constraint array |
| Contract Props | §6 | `ConstructionPlanningContractProps` | ConstructionPlanningContract.spec | Identity / metadata / definition |
| Declarative Restriction | §2 | package sources | ConstructionPlanningContractBuilder.spec | No executable semantics |
| Runtime Isolation | §2 | package sources | ConstructionPlanningContractBuilder.spec | No runtime imports |
| Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-26.0-001 | Ch11–Ch25 unchanged |
| Structural Builder | §7 | `ConstructionPlanningContractBuilder` | ConstructionPlanningContractBuilder.spec | Required fields only |
| Immutable Construction | §1 / §4 | `Object.freeze` | ConstructionPlanningContract.spec | Frozen instance / nested fields |
