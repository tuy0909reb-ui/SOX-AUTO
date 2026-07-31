# ASA-ARCH-30.0 Verification Mapping — Chapter 30 Construction Planning Consumption Boundary

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Boundary Identity | §7 | `identity.boundaryId` / versions / `manifestId` | ConstructionPlanningConsumptionBoundary.test | Immutable boundary identity |
| Manifest Identity Preservation | §6 / §7 | `identity.manifestId` + accepted Manifest | Conformance.test | Original Manifest ID preserved |
| Architecturally Accepted Manifest | §6 | `architecturallyAcceptedManifest` | Conformance.test | Same instance; no new artifact |
| Structural Acceptance | §9 / §10 | Builder `establish()` | Builder.test | Required fields + immutability checks |
| Exactly One Manifest | §5 / §9 | `withManifest` | Builder.test | Missing Manifest rejected |
| Declarative Purity | §14 | package sources | Builder.test | No executable / planning APIs |
| Runtime Isolation | §16 | package sources | Builder.test | No runtime imports |
| Behavioral Absence | §17 | package sources | Builder.test | No interpretation / planning |
| Boundary Preservation | §11 / §18 | frozen spot-checks | ASA-VERIFY-ARCH-30.0-001 | Ch11–Ch29 unchanged |
| Deterministic Establishment | §9 / §19 | same inputs | Conformance.test | Equal JSON / same Manifest ref |
| No New Planning Artifact | §1 / §13 | sources | Builder.test | No Manifest construction |
| Responsibility Separation | §15 | boundary only | ASA-REGISTER / VERIFY | Planning pipeline ends at Ch29 |
