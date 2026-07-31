# ASA-ARCH-32.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_32_0_checksum_verification |
| Architecture | ASA-ARCH-32.0 — Construction Responsibility Structural Interface Definition Boundary（ASA-ARCH-21.3 Chapter 32） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-32.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `b039993b661d365bc3a18dc88b585c58f57dd73be3186be4f05d1a8eaac94bc2` | `docs/baselines/ASA-ARCH-21.3.md` |
| `4ca2a518a96f89e3d1afb0778ed4778c57c2e8d1d047369b2baa33ed528d7bc1` | `docs/specs/asa_arch_32_0_construction_responsibility_structural_interface_definition.md` |
| `2d135bb6cd703a8cd74bb986aaa791137466a569a4a5ccc6f85b29eebc59312e` | `docs/specs/asa_arch_32_0_mapping.md` |
| `b2609a2224794d47a0d509b9947b16e33fea12f109b51d86451c08ffb9b46c49` | `jest.config.cjs` |
| `5a5f047e92418455ddbdb52e2b443d1c3a8d8c330a8ba27a6dcd5bb7ac7c8971` | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition.ts` |
| `bf53ead91b708b74cc6097a7785ac01e20650ac4c3b9bce3c77be91f964b2135` | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts` |
| `5a08c3dbffc18d62d84641e566deb4c4ffd12e9494718956aa3e85cb71df903f` | `src/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts` |
| `a035878c7838d289290d7e812657d69c6390677a4c929e79b9304ad5cae894f4` | `tests/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinition.test.ts` |
| `59e89cca0d863154c883370c06e999779bd182c2231538bf47bca9c2492caaa3` | `tests/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.test.ts` |
| `8c3248fce5958e3fb3ff420193a1ea33fd1d779174b67221bad1d339c055b1fb` | `tests/construction_responsibility_structural_interface_definition/ConstructionResponsibilityStructuralInterfaceDefinitionConformance.test.ts` |
| `5d5c8ac10daa5892b95b98cc70aa7e2356c098d0507bf62a861cdb04837e90ea` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
62e2811266bbe730783aca23a161fcb8bc1ee0e079c2a8dd9263501109f92d63
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `f7baffa461f2a1e7efd89b01524871de4737e52cfbd2d30393c627db5792d96e`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionResponsibilityStructuralInterfaceDefinition.ts` | `5a5f047e92418455ddbdb52e2b443d1c3a8d8c330a8ba27a6dcd5bb7ac7c8971` | UNCHANGED |
| `ConstructionResponsibilityStructuralInterfaceDefinitionBuilder.ts` | `bf53ead91b708b74cc6097a7785ac01e20650ac4c3b9bce3c77be91f964b2135` | UNCHANGED |
| `ConstructionResponsibilityStructuralInterfaceDefinitionTypes.ts` | `5a08c3dbffc18d62d84641e566deb4c4ffd12e9494718956aa3e85cb71df903f` | UNCHANGED |
| `ConstructionStructuralResponsibilityBoundaryTypes.ts`（Chapter 31） | `4e3fd26f7956ff0e654a1b96a27a0f2d4304d48bda66e9719713a23af052b9b5` | UNCHANGED |
| `ConstructionStructuralResponsibilityBoundary.ts`（Chapter 31） | `954071b4014d7f7e2a9c774f7e98a6f07179f8ebd708b2ecdac1a0d707585949` | UNCHANGED |
| `ConstructionStructuralResponsibilityBoundaryBuilder.ts`（Chapter 31） | `9a1061264ae8f0e450f3c2b1fe81866c6a6e16f7b27f1d00a27b2f31e9b31e62` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-32.0-001.md` is outside this inventory.
- Chapter 32 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–32 FROZEN.

---

End of Checksum Verification
