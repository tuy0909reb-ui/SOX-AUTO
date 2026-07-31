# ASA-ARCH-21.3 Chapter 16 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch16_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 16 — Execution Graph Contract |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH16-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `c8ac348d91798de96ba4e32aaee7ccd7f5604537cbc9ddb84122a75021d79c98` | `docs/baselines/ASA-ARCH-21.3.md` |
| `37df16650ba6302fc03bf8d0e7756a5b13a7d813e5cc33032f49a55413451162` | `docs/specs/asa_arch_21_3_ch16_verification_mapping.md` |
| `c7c487555631ec6fc2ee8fb2c878b53b8aaf11113f756fc51d6a371432abb826` | `docs/specs/asa_arch_21_3_execution_graph_contract.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `ae7eef55bd59a7e141593779b29a12e3ef3b0d48cbad9f758e7473eeeb2c7d24` | `src/workflow/ExecutionGraphContract.ts` |
| `0c01b55221a65e623f3b8a5a151b073dedf873e6c86b6cdcd025b55c51c81d5e` | `src/workflow/index.ts` |
| `69ae7bb5e142050bbd6ef8817d856d579aca03d9168a1aea597ea2cefff2972e` | `tests/workflow/architecture_constraints.test.ts` |
| `e672908fa601c67b0ba15a58676217bd9414108dfcf56d530bf936345a5be187` | `tests/workflow/execution_graph_contract.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
290a2f1d3a221f62167f628200345d0c2a6bb79b06811e8ce90489561c3cd0d9
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `8e26a767712967ff6c92364b4895a5f44a263cce88e3e98ad488dce9f96770ac`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/workflow/ExecutionGraphContract.ts` | `ae7eef55bd59a7e141593779b29a12e3ef3b0d48cbad9f758e7473eeeb2c7d24` | UNCHANGED |
| `src/workflow/ExecutionDefinitionContract.ts` | `6119c693997e014e289ca4390a19f3f2d3b498b2fc1c2981952674fa68d6caad` | UNCHANGED (Chapter 15) |
| `src/workflow/PipelineExecutionContract.ts` | `1773fec89ede207c0bf5ed8648b31a22d09a286172e6f9a5674b7e669331f6bb` | UNCHANGED (Chapter 14) |
| `src/workflow/PipelineExecutionBoundaryContract.ts` | `5199ae45622e2f90033484e900f4cb15df9a25d5452dbe205dcefd3c77e5debf` | UNCHANGED (Chapter 13) |
| `src/workflow/PipelineCompositionContract.ts` | `a1caa487fe6e52d72da3412c396dcfce362cb67d0ecbe5d0060e7535c9627548` | UNCHANGED (Chapter 12) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH16-001.md` is outside this inventory.
- Chapter 16 source was not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.

---

End of Checksum Verification
