# ASA-ARCH-21.3 Chapter 20 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch20_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 20 — Construction Registry |
| Spec Status | Draft 1.0 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH20-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `fb0ab35adc5faf1098443cea939ab64e6b9d594a64491a5ee91ed0367d16c144` | `docs/baselines/ASA-ARCH-21.3.md` |
| `efe18905d1f6460bcbb6cd39ebc6ab6742d25b230693beb9d29807f6384a0d2f` | `docs/specs/asa_arch_21_3_ch20_verification_mapping.md` |
| `0a8eb60fd914f4e3f16d8a315427798a97ec44655f99b07706ce01fe0f538243` | `docs/specs/asa_arch_21_3_construction_registry.md` |
| `b1a544b68c29728ba95bf182636dff5e25439ed6872f4e820f4ea70d9ae0b9ed` | `jest.config.cjs` |
| `c7285f57707e5b077cfade328f240f3f4dcbe2e71352a8282262163e4c4dec30` | `src/contracts/construction/ConstructionRegistry.ts` |
| `e78443f46811fd0111b916664a63818c2102aca79954cfd7dfec7ee7b6684e19` | `src/contracts/registry/ContractRegistry.ts` |
| `b5e70c8357407e46351f6b9427b49e6fdbbb5433f0e014983a7ca7d63871bd65` | `tests/contracts/construction/ConstructionRegistry.test.ts` |
| `02cd1abd407dd5b8ca005364d433942b44a329ca1d133041e502b80af2689df2` | `tests/workflow/architecture_constraints.test.ts` |
| `0d275029886a2757bc753cfe13a17ac7a9b59caa7110f54c46b2ed12736fe7ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
8f863d03ef2e869fcbc15869ee3b460bc6144e82ca00e3dad0fc2e826fee3f3d
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `e4510748deae1bc62e367e8a699bd388179d45e633d513e1264aa87d68c3050c`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/contracts/construction/ConstructionRegistry.ts` | `c7285f57707e5b077cfade328f240f3f4dcbe2e71352a8282262163e4c4dec30` | UNCHANGED |
| `src/contracts/construction/ConstructionDefinition.ts` | `56f06a0e52c903bb147fe98c8075f479b5f8a95c87373eb015c794bf32c844a0` | UNCHANGED (Chapter 19) |
| `src/contracts/construction/ConstructionContract.ts` | `4cfa99cedf35b92872c1b03db75be48a8be2a4be7f4da740e6ddf69d7f33a44c` | UNCHANGED (Chapter 18) |
| `src/workflow/ExecutionGraphConstructionBoundaryContract.ts` | `e78dce8863e45097ac22a375ae9b394fa961c91343ff3e5bf8a7295a617036d8` | UNCHANGED (Chapter 17) |
| `src/workflow/ExecutionGraphContract.ts` | `ae7eef55bd59a7e141593779b29a12e3ef3b0d48cbad9f758e7473eeeb2c7d24` | UNCHANGED (Chapter 16) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH20-001.md` is outside this inventory.
- Chapter 20 source was not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.

---

End of Checksum Verification
