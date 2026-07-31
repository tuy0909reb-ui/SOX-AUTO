# ASA-ARCH-21.3 Chapter 18 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch18_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 18 — Construction Contract |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH18-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `518793cadc00212d515611ae7295ab0b1a70aacbfbeab18d22b255aab49b718b` | `docs/baselines/ASA-ARCH-21.3.md` |
| `44e03b44f07c4e58dc7e22c007d2f7db6c56b493ad6d11990a0e8a57e0960fab` | `docs/specs/asa_arch_21_3_ch18_verification_mapping.md` |
| `95b6fc246fe46439624ce680b32752cca47c51218e7a8e3599e422d92924044b` | `docs/specs/asa_arch_21_3_construction_contract.md` |
| `b1a544b68c29728ba95bf182636dff5e25439ed6872f4e820f4ea70d9ae0b9ed` | `jest.config.cjs` |
| `4cfa99cedf35b92872c1b03db75be48a8be2a4be7f4da740e6ddf69d7f33a44c` | `src/contracts/construction/ConstructionContract.ts` |
| `c6d81b9c5f28adb5b54e08e0c265fdcf79d29364a4544ac3d69c703745166132` | `src/contracts/registry/ContractRegistry.ts` |
| `2d6c520bd0d9401baeae210ee5d40cd193803a3ea11f984ecb4a502502053750` | `tests/contracts/construction/ConstructionContract.test.ts` |
| `7fd95ac59b1de736095e68f5143186cdead6706bb9ab9d8beea68a4ac91f7247` | `tests/workflow/architecture_constraints.test.ts` |
| `0d275029886a2757bc753cfe13a17ac7a9b59caa7110f54c46b2ed12736fe7ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
e72fdcb5db5983ff92a5b5b04e8f6650218984d8f5f7c38d44b6cc06f93ec790
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `08a0caeddb288a994aa6ebaaf4273c636f344365ae72c747fada4f636f6c4215`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/contracts/construction/ConstructionContract.ts` | `4cfa99cedf35b92872c1b03db75be48a8be2a4be7f4da740e6ddf69d7f33a44c` | UNCHANGED |
| `src/contracts/registry/ContractRegistry.ts` | `c6d81b9c5f28adb5b54e08e0c265fdcf79d29364a4544ac3d69c703745166132` | UNCHANGED |
| `src/workflow/ExecutionGraphConstructionBoundaryContract.ts` | `e78dce8863e45097ac22a375ae9b394fa961c91343ff3e5bf8a7295a617036d8` | UNCHANGED (Chapter 17) |
| `src/workflow/ExecutionGraphContract.ts` | `ae7eef55bd59a7e141593779b29a12e3ef3b0d48cbad9f758e7473eeeb2c7d24` | UNCHANGED (Chapter 16) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH18-001.md` is outside this inventory.
- Chapter 18 source and registry were not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.

---

End of Checksum Verification
