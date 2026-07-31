# ASA-ARCH-21.3 Chapter 14 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch14_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 14 — Pipeline Execution Contract |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH14-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `47cb4dfa61efb8896a8b5faaaf273c1d9d9477e70b3c15eec62cc637d7122f12` | `docs/baselines/ASA-ARCH-21.3.md` |
| `f93e25d0d213cc10f38494cfdccf057f2c8af80de6e2838e2a4996ab4dbd219e` | `docs/specs/asa_arch_21_3_ch14_verification_mapping.md` |
| `3cb83da8207984eecf2096fe881942ed327799e350748f5e888ba64e44c53f26` | `docs/specs/asa_arch_21_3_pipeline_execution_contract.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `1773fec89ede207c0bf5ed8648b31a22d09a286172e6f9a5674b7e669331f6bb` | `src/workflow/PipelineExecutionContract.ts` |
| `6ae0c5352dab9114902a2fd2f6e676a2b80053cd1e43d0e78ea6a914b9c4d52e` | `src/workflow/index.ts` |
| `7b30ba16e606b1face43d6d62cd51c225403b8a3ed02fe1fc0176dc9d8141dd7` | `tests/workflow/architecture_constraints.test.ts` |
| `4ed36708c91c1aebd05f74d76783eebd03e697a0f48ab0b5bc6784b1dbf0d1e5` | `tests/workflow/pipeline_execution_contract.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
4cc970b555b44b0a4e2e4f17966794bd140c9b658c5b8aa0610422cbc841fb29
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/workflow/PipelineExecutionContract.ts` | `1773fec89ede207c0bf5ed8648b31a22d09a286172e6f9a5674b7e669331f6bb` | UNCHANGED |
| `src/workflow/PipelineExecutionBoundaryContract.ts` | `5199ae45622e2f90033484e900f4cb15df9a25d5452dbe205dcefd3c77e5debf` | UNCHANGED (Chapter 13) |
| `src/workflow/PipelineCompositionContract.ts` | `a1caa487fe6e52d72da3412c396dcfce362cb67d0ecbe5d0060e7535c9627548` | UNCHANGED (Chapter 12) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH14-001.md` is outside this inventory.
- Chapter 14 source was not modified after freeze authorization; only status documentation changed.

---

End of Checksum Verification
