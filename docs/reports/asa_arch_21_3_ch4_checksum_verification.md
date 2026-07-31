# ASA-ARCH-21.3 Chapter 4 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch4_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 4 — Composition Contract |
| Spec Status | Draft 0.7 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH4-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `43e01c697b484dec525efdb0bbe5f0fb72e17188a95a97b637c82922666db1a4` | `docs/baselines/ASA-ARCH-21.3.md` |
| `182c22398ffda535a12bc555af546b2d8f5a45ccfafeb734e01ae2ef09afb665` | `docs/specs/asa_arch_21_3_ch4_verification_mapping.md` |
| `5dacd84d0fb193dafeeffb52641fbc7dfb12ba02b6365795342cd88816516074` | `docs/specs/asa_arch_21_3_composition_contract.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | `src/workflow/CompositionContract.ts` |
| `afa5cdb11b0b239420338af282046f40d23c8534b38e602b15aed8ebf5a331a0` | `src/workflow/index.ts` |
| `c220a7655e6abe1e686b61e6def6998afadd5914119f658419596f61734784d8` | `tests/workflow/architecture_constraints.test.ts` |
| `8d9651415f70143b5a0a87a27038592b6a0e6d56a2a0720d02adc03dc9a6c227` | `tests/workflow/composition_contract.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
0ea974d5055c815f686871e28fb532174b33d7c52959ea1a343c547c3da40996
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
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged (Chapter 2) |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH4-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
