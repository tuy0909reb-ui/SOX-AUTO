# ASA-ARCH-21.3 Chapter 3 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch3_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 3 — Composition Model |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH3-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `8e63db08b62507a932a3043fa4c508c95dfab108419be461728e3a684bf2154f` | `docs/baselines/ASA-ARCH-21.3.md` |
| `2bea86a13eea308807913bcfcf9920d98a190bbfe129c732bf5e32c23efa5423` | `docs/specs/asa_arch_21_3_ch3_verification_mapping.md` |
| `6a30000796aa085d2168aeb28a0254d89e1a1b56e99b95c5119af20e87a3df3d` | `docs/specs/asa_arch_21_3_composition_model.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | `src/workflow/CompositionModel.ts` |
| `de41bfed3a93a4d44cf9e883f04589c58f86c166c8701afeaa11ebae662f2112` | `src/workflow/index.ts` |
| `4480c8846e68c0fbb02eeeb9c826caf719725af17bf2e1d5812ad8e3bc998714` | `tests/workflow/architecture_constraints.test.ts` |
| `54cf53072c100aca65e6d8dfffe732007eead7f8a432449fbd02467dcc4c9865` | `tests/workflow/composition_model.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
aa1b55e4ce303608768a21cdab951c94405afc740937aa1bd219b57cb766c8bc
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
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged (Chapter 2) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH3-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
