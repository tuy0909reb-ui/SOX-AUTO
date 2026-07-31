# ASA-ARCH-23.0 Verification Mapping — Chapter 23 Construction Selection

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CSE-1 Selection Identity | §6 | `selectionId` | ConstructionSelection.spec | Unique immutable identity |
| CSE-2 Selection Elements | §6 | selection model fields | ConstructionSelection.spec | Declarative elements only |
| CSE-3 Selected References | §6 | `SelectedReference` | ConstructionSelection.spec | Definition-reference id only |
| CSE-4 Selection Metadata | §6 | `SelectionMetadata` | ConstructionSelection.spec | Declarative metadata |
| CSE-5 Selection Compatibility | §6 | `SelectionCompatibility` | ConstructionSelection.spec | Compatibility flags |
| CSE-6 Construction Selection Contract | §4 | discovery-result reference | ConstructionSelection.spec | Consumes discovery result only |
| CSE-7 Selection Integrity | §6 | `SelectionIntegrity` | ConstructionSelection.spec | Declarative integrity |
| CSE-8 Declarative Restriction | §2 | package sources | ConstructionSelectionBuilder.spec | No selection algorithm |
| CSE-9 Runtime Isolation | §2 | package sources | ConstructionSelectionBuilder.spec | No runtime imports |
| CSE-10 Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-23.0-001 | Ch11–Ch22 unchanged |
| CSE-11 Future Compatibility | §1 | immutable outputs | ConstructionSelection.spec | Declarative outputs only |
| CSE-12 Selection Ownership | §2 | ownership metadata | ConstructionSelection.spec | Owns selection artifacts only |
| Structural Builder | — | `ConstructionSelectionBuilder` | ConstructionSelectionBuilder.spec | Structural validation only |
