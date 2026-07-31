# ASA-ARCH-21.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_0_checksum_verification |
| Architecture | ASA-ARCH-21.0 — Construction Catalog（ASA-ARCH-21.3 Chapter 21） |
| Spec Status | Draft 0.5 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `eff3b7fb5a0198b23b405ede4d9af7bb9bf29bcc7d846472f0e332a42222a694` | `docs/baselines/ASA-ARCH-21.3.md` |
| `da4f056c77d5baf346ab8ba7b74db3d287a60aeaf6993244a85bfa5a6728586c` | `docs/specs/asa_arch_21_0_ch21_verification_mapping.md` |
| `1df0fe37de620b40fccd62853ee58d7bb246e0b82a62401093a153348c4b16fb` | `docs/specs/asa_arch_21_0_construction_catalog.md` |
| `b1a544b68c29728ba95bf182636dff5e25439ed6872f4e820f4ea70d9ae0b9ed` | `jest.config.cjs` |
| `7d86872e2d825c597c7c9e3694ce6b30fa1edebf8f1ae0dc9f7aefb13b010809` | `src/contracts/construction/ConstructionCatalog.ts` |
| `2245e724304ef7346a25899ae261b5a706283172771e9d51e3004a8e947bfce2` | `src/contracts/registry/ContractRegistry.ts` |
| `68a1dd332aacd7f85400a811b93512864b0957142502c060854e0bfbfb9fc8a8` | `tests/contracts/construction/ConstructionCatalog.test.ts` |
| `8081de6c9a60a5a6c086dfca28aa2cf78afdcb4ebe3db10fc53100b697d7bcb0` | `tests/workflow/architecture_constraints.test.ts` |
| `0d275029886a2757bc753cfe13a17ac7a9b59caa7110f54c46b2ed12736fe7ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
04b2f6124d234486297f40a0596f28ebcb230fcd02b6ff68fc2cfa99a215b520
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `1a6ff57ba5981f4d0afb5d28a82f387375ac382ba2fa88736fd7de1ea555d87a`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/contracts/construction/ConstructionCatalog.ts` | `7d86872e2d825c597c7c9e3694ce6b30fa1edebf8f1ae0dc9f7aefb13b010809` | UNCHANGED |
| `src/contracts/construction/ConstructionRegistry.ts` | `c7285f57707e5b077cfade328f240f3f4dcbe2e71352a8282262163e4c4dec30` | UNCHANGED (Chapter 20) |
| `src/contracts/construction/ConstructionDefinition.ts` | `56f06a0e52c903bb147fe98c8075f479b5f8a95c87373eb015c794bf32c844a0` | UNCHANGED (Chapter 19) |
| `src/contracts/construction/ConstructionContract.ts` | `4cfa99cedf35b92872c1b03db75be48a8be2a4be7f4da740e6ddf69d7f33a44c` | UNCHANGED (Chapter 18) |
| `src/workflow/ExecutionGraphConstructionBoundaryContract.ts` | `e78dce8863e45097ac22a375ae9b394fa961c91343ff3e5bf8a7295a617036d8` | UNCHANGED (Chapter 17) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.0-001.md` is outside this inventory.
- Chapter 21 source was not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.
- Architecture baseline now: Chapter 11–21 FROZEN.

---

End of Checksum Verification
