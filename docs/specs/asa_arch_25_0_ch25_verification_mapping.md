# ASA-ARCH-25.0 Verification Mapping — Chapter 25 Construction Plan

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Plan Identity | §6 | `planId` / `ConstructionPlanId` | ConstructionPlan.spec | Unique immutable identity |
| Plan Metadata | §6 | `ConstructionPlanMetadata` | ConstructionPlan.spec | Declarative metadata only |
| Plan Contents | §4 / §6 | `ConstructionPlanContents` | ConstructionPlan.spec | Ordered Selection Result refs |
| Plan Reference Reuse | §6 / §7 | `ConstructionPlanReference` = `SelectedReference` | ConstructionPlanBuilder.spec | No local redefinition |
| Plan Props | §6 | `ConstructionPlanProps` | ConstructionPlan.spec | Identity / metadata / contents |
| Construction Plan Contract | §4 | consumes Selection Result refs | ConstructionPlan.spec | No planning semantics |
| Declarative Restriction | §2 | package sources | ConstructionPlanBuilder.spec | No executable semantics |
| Runtime Isolation | §2 | package sources | ConstructionPlanBuilder.spec | No runtime imports |
| Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-25.0-001 | Ch11–Ch24 unchanged |
| Order Preservation | §4 | `withContents` | ConstructionPlan.spec / Builder.spec | Caller order preserved |
| Structural Builder | §7 | `ConstructionPlanBuilder` | ConstructionPlanBuilder.spec | Required fields only |
| Immutable Construction | §1 / §4 | `Object.freeze` | ConstructionPlan.spec | Frozen instance / nested fields |
