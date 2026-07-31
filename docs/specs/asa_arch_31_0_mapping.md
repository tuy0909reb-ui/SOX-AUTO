# ASA-ARCH-31.0 Verification Mapping — Chapter 31 Construction Structural Responsibility Boundary

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Boundary Identity | §7 | `identity.boundaryId` / versions / `sourceManifestId` | ConstructionStructuralResponsibilityBoundary.test | Immutable boundary identity |
| Manifest Identity Preservation | §5 / §7 | `identity.sourceManifestId` + Ch30 accepted Manifest | Conformance.test | Original Manifest ID preserved |
| Chapter 30 Exclusive Entry | §5 / §11 | `sourceConsumptionBoundary` | Builder.test / Conformance.test | No direct Ch25–29 imports |
| Structural Responsibility Mapping | §9 | `structuralResponsibilityMappings` | Conformance.test | Element → domain only |
| Structural Acceptance | §9 / §10 | Builder `establish()` | Builder.test | Required fields + immutability checks |
| Exactly One Consumption Boundary | §5 / §10 | `withConsumptionBoundary` | Builder.test | Missing boundary rejected |
| Declarative Purity | §14 | package sources | Builder.test | No executable / planning APIs |
| Runtime Isolation | §16 | package sources | Builder.test | No runtime imports |
| Behavioral Absence | §17 | package sources | Builder.test | No interpretation / planning |
| Boundary Preservation | §18 | frozen spot-checks | ASA-VERIFY-ARCH-31.0-001 | Ch1–Ch30 unchanged |
| Deterministic Establishment | §9 / §19 | same inputs | Conformance.test | Equal JSON / same Ch30 ref |
| No New Planning Artifact | §1 / §13 | sources | Builder.test | No Manifest / Ch30 construction |
| Responsibility Separation | §15 | boundary only | ASA-REGISTER / VERIFY | Planning pipeline ends at Ch29; Ch30 exclusive acceptance |
