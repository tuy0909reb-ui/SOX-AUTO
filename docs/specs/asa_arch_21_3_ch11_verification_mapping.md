# ASA-ARCH-21.3 Verification Mapping — Chapter 11

Architecture traceability: each Composition Boundary Contract → requirement → implementation → verification.

| Contract | Requirement Reference | Implementation Reference | Verification Reference |
|---|---|---|---|
| CBC-1 Boundary Scope | Spec §2 CBC-1 | `CompositionBoundaryContract.ts` / `CBC-1` | `composition_boundary_contract.test.ts` |
| CBC-2 Ownership Boundary | Spec §2 CBC-2 | `CompositionBoundaryContract.ts` / `CBC-2` | `composition_boundary_contract.test.ts` |
| CBC-3 Responsibility Separation | Spec §2 CBC-3 | `CompositionBoundaryContract.ts` / `CBC-3` | `composition_boundary_contract.test.ts` |
| CBC-4 Contract Exposure | Spec §2 CBC-4 | `CompositionBoundaryContract.ts` / `CBC-4` | `composition_boundary_contract.test.ts` |
| CBC-5 Structural Isolation | Spec §2 CBC-5 | `CompositionBoundaryContract.ts` / `CBC-5` | `composition_boundary_contract.test.ts` |
| CBC-6 Boundary Determinism | Spec §2 CBC-6 | `CompositionBoundaryContract.ts` / `CBC-6` | `composition_boundary_contract.test.ts` |
| CBC-7 Compatibility Preservation | Spec §2 CBC-7 | `CompositionBoundaryContract.ts` / `CBC-7` | `composition_boundary_contract.test.ts` |
| CBC-8 Downstream Boundary | Spec §2 CBC-8 | `CompositionBoundaryContract.ts` / `CBC-8` | `composition_boundary_contract.test.ts` |
| CBC-9 Evolution Boundary | Spec §2 CBC-9 | `CompositionBoundaryContract.ts` / `CBC-9` | `composition_boundary_contract.test.ts` |
| CBC-10 Behavioral Exclusion | Spec §2 CBC-10 | `CompositionBoundaryContract.ts` / `CBC-10` | `composition_boundary_contract.test.ts` |
| Boundary Verification | Spec §3 | `COMPOSITION_BOUNDARY_CONTRACT_VERIFICATION` | `composition_boundary_contract.test.ts` |
| Boundary Outcome | Spec §4 | `COMPOSITION_BOUNDARY_CONTRACT_OUTCOME` | `composition_boundary_contract.test.ts` |
| Frozen 20.8〜21.3 Ch1–Ch10 preserved | — | architecture_constraints | architecture_constraints.test.ts |
