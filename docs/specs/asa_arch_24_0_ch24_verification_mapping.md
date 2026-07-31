# ASA-ARCH-24.0 Verification Mapping — Chapter 24 Construction Selection Result

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| CSR-1 Result Identity | §6 | `resultId` | ConstructionSelectionResult.spec | Unique immutable identity |
| CSR-2 Result Elements | §6 | result model fields | ConstructionSelectionResult.spec | Declarative elements only |
| CSR-3 Result Contents | §6 | `contents` | ConstructionSelectionResult.spec | Ch23 SelectedReference only |
| CSR-4 Result Metadata | §6 | `ResultMetadata` | ConstructionSelectionResult.spec | Declarative metadata |
| CSR-5 Result Compatibility | §6 | `ResultCompatibility` | ConstructionSelectionResult.spec | Compatibility flags |
| CSR-6 Result Contract | §4 | consumes Selected References | ConstructionSelectionResult.spec | No selection semantics |
| CSR-7 Result Integrity | §6 | `ResultIntegrity` | ConstructionSelectionResult.spec | Declarative integrity |
| CSR-8 Declarative Restriction | §2 | package sources | ConstructionSelectionResultBuilder.spec | No executable semantics |
| CSR-9 Runtime Isolation | §2 | package sources | ConstructionSelectionResultBuilder.spec | No runtime imports |
| CSR-10 Boundary Preservation | §5 | frozen spot-checks | ASA-VERIFY-ARCH-24.0-001 | Ch11–Ch23 unchanged |
| CSR-11 Future Compatibility | §1 | immutable outputs | ConstructionSelectionResult.spec | Declarative outputs only |
| CSR-12 Result Ownership | §2 | ownership metadata | ConstructionSelectionResult.spec | Owns result artifacts only |
| SelectedReference Reuse | §7 | import from Ch23 | ConstructionSelectionResultBuilder.spec | No local redefinition |
| Structural Builder | — | `ConstructionSelectionResultBuilder` | ConstructionSelectionResultBuilder.spec | Required fields only |
