# ASA-ARCH-21.3 Chapter 6 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch6_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 6 — Composition Constraints |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH6-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `928f3d69ad72b8ac388f48905b3507175b5ea121c67d21118450b807134cbb8e` | `docs/baselines/ASA-ARCH-21.3.md` |
| `9ba4b5b3868be3456062057852a50294010b8944559cd73d94c8c12f6acb2ba0` | `docs/specs/asa_arch_21_3_ch6_verification_mapping.md` |
| `1da429dd2c8c52395c06656f411282295c45a837ec2abaf0b54a5852eef7922f` | `docs/specs/asa_arch_21_3_composition_constraints.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | `src/workflow/CompositionConstraints.ts` |
| `98ac15f27f683e81da3e650fc9b1e6684e8b89d5c1b7d7687bcd996dfa9bf813` | `src/workflow/index.ts` |
| `c3b6d1b81f1debcae1216fa0e32e151a66f691b843ac309fc5552a6a458fdf17` | `tests/workflow/architecture_constraints.test.ts` |
| `3d604a6e6b099f36ea8fa04733f5449805ce937398e1500936233210b4e111d7` | `tests/workflow/composition_constraints.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
5efeb897104e9ca7935ccd392c24c7e4c9ec8fd86252fc44c0e8241fb11fbf8a
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
| `src/workflow/CompositionConstraints.ts` | `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged (Chapter 2) |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged (Chapter 4) |
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | Unchanged (Chapter 5) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH6-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
