# ASA-ARCH-21.3 Chapter 19 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch19_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 19 — Construction Definition |
| Spec Status | Draft 1.1 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH19-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `c586eb36a068a0309266e03683ecc3dee369dd7388b3f260cbbedac4c96ed236` | `docs/baselines/ASA-ARCH-21.3.md` |
| `63919a1d85971421b567618d3c4355f07e90997e1e14370288f6a823a895a146` | `docs/specs/asa_arch_21_3_ch19_verification_mapping.md` |
| `0bcfd5d0aaacf72ef199b33b001f56c5b90e42dbec69c5fb07d65fe5bcec54ea` | `docs/specs/asa_arch_21_3_construction_definition.md` |
| `b1a544b68c29728ba95bf182636dff5e25439ed6872f4e820f4ea70d9ae0b9ed` | `jest.config.cjs` |
| `56f06a0e52c903bb147fe98c8075f479b5f8a95c87373eb015c794bf32c844a0` | `src/contracts/construction/ConstructionDefinition.ts` |
| `057c284ab972269733ee1fd29dcd5275b0c0886163b5ef842b3080494ff401cd` | `src/contracts/registry/ContractRegistry.ts` |
| `952dad218c3677339a06daed02e13199de552637fb7c9b163734f5a70f56d698` | `tests/contracts/construction/ConstructionDefinition.test.ts` |
| `82791a26ad9eaeda213e395e4dd832d8a836652f0929e30d1a302ad579e068d4` | `tests/workflow/architecture_constraints.test.ts` |
| `0d275029886a2757bc753cfe13a17ac7a9b59caa7110f54c46b2ed12736fe7ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
27ecc2fe284a1c2570e491a9f07540a747651ce1884a07925ced334ae40b56b9
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `77826ec53b788fb9043c3d863864d7ce61a2509db6c48137729e83cf5d87fd34`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/contracts/construction/ConstructionDefinition.ts` | `56f06a0e52c903bb147fe98c8075f479b5f8a95c87373eb015c794bf32c844a0` | UNCHANGED |
| `src/contracts/construction/ConstructionContract.ts` | `4cfa99cedf35b92872c1b03db75be48a8be2a4be7f4da740e6ddf69d7f33a44c` | UNCHANGED (Chapter 18) |
| `src/workflow/ExecutionGraphConstructionBoundaryContract.ts` | `e78dce8863e45097ac22a375ae9b394fa961c91343ff3e5bf8a7295a617036d8` | UNCHANGED (Chapter 17) |
| `src/workflow/ExecutionGraphContract.ts` | `ae7eef55bd59a7e141593779b29a12e3ef3b0d48cbad9f758e7473eeeb2c7d24` | UNCHANGED (Chapter 16) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH19-001.md` is outside this inventory.
- Chapter 19 source was not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.

---

End of Checksum Verification
