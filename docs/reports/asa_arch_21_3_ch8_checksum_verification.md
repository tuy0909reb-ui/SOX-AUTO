# ASA-ARCH-21.3 Chapter 8 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch8_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 8 — Composition Lifecycle |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH8-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `8a77bab832845faa5d21237784341be13c78ecddf5a14dbae49acde8524e2433` | `docs/baselines/ASA-ARCH-21.3.md` |
| `608851e7afc12c932b35fcaa21ce0227ce853fdec57bf8a9150a068eda18a54e` | `docs/specs/asa_arch_21_3_ch8_verification_mapping.md` |
| `e8b97b16e594163ad54916ad6eef555236ad4227cf300a0ccac36e6a6464c7f8` | `docs/specs/asa_arch_21_3_composition_lifecycle.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `d20b9c939475e8ec1159978a81b190bbe3a7c8db0527898f15e0be312956aa18` | `src/workflow/CompositionLifecycle.ts` |
| `a15cf9b9f1ad00dae84aba80b91d006c1421052fae11721f92c9f0c385066b0d` | `src/workflow/index.ts` |
| `d432012ab4bc0e1b4d640d60531cfcb1b60f5319741d84088ad36eafbc2980ab` | `tests/workflow/architecture_constraints.test.ts` |
| `2beb03f6d015526aee1874f7cdbe4c9fbcaefd8f84eb8fa9865992597bdef9cb` | `tests/workflow/composition_lifecycle.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
c7a754703bae0ba9c86a7a82c9779cf876da6a7101636c434c5b8369f5bb7b6f
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
| `src/workflow/CompositionLifecycle.ts` | `d20b9c939475e8ec1159978a81b190bbe3a7c8db0527898f15e0be312956aa18` | Unchanged at authorization |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged (Chapter 4) |
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | Unchanged (Chapter 5) |
| `src/workflow/CompositionConstraints.ts` | `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | Unchanged (Chapter 6) |
| `src/workflow/CompositionValidation.ts` | `7da36455203245de1bc29c8c6734106de4b2cd6c47a3c944347c2bf5ed44aa1b` | Unchanged (Chapter 7) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH8-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
