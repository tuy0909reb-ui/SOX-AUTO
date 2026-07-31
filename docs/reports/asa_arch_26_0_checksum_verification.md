# ASA-ARCH-26.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_26_0_checksum_verification |
| Architecture | ASA-ARCH-26.0 — Construction Planning Contract（ASA-ARCH-21.3 Chapter 26） |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-26.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (10 files)

| SHA-256 | Path |
|---|---|
| `aad0c45fb4bdee6dc0f1a1d5d017ced2b129c75e3c8df7ba031d61bda4602e1a` | `docs/baselines/ASA-ARCH-21.3.md` |
| `17b4cab12ffcf92d43797c7924a71399a97413dc20cb0f26f01e750768518566` | `docs/specs/asa_arch_26_0_ch26_verification_mapping.md` |
| `2bb8b3bf72d21eae0cbd32f13d6e723ecc7acbe03724dced8b05c711b9e69f1a` | `docs/specs/asa_arch_26_0_construction_planning_contract.md` |
| `9cd6638d57b02e430bd1e103cd54ea0381ba79b355bc10c848b4a8954c0a8973` | `jest.config.cjs` |
| `299c105f834dd2ac0e10fdccfd2f5606aa272f2dd48554d1b8cd62498c0e9aa8` | `src/construction_planning_contract/ConstructionPlanningContract.ts` |
| `2072a1ab46fc0086fe0d2a9b7aa34f0b5eea8a91d430b1c625d8b850f833f10a` | `src/construction_planning_contract/ConstructionPlanningContractBuilder.ts` |
| `2bc00dfad9704d0e18adb8636a1d89bf78287fedf14729b32a89bc8a148906a5` | `src/construction_planning_contract/ConstructionPlanningContractTypes.ts` |
| `17fb3ae9cefa20b1bfed856d5b9696be03ebdbc196d8745dfef6ef3f792d147f` | `tests/construction_planning_contract/ConstructionPlanningContract.spec.ts` |
| `49d7d9214be1a2be426c4beffe1254ed9d3b01b7c0cee2e3b06198b9c6b6ba61` | `tests/construction_planning_contract/ConstructionPlanningContractBuilder.spec.ts` |
| `fe644287cfbac192122a8ff5ad81bccd03e70ade98d5bb9f39131ca24647de96` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
7ab67672ea66efa3446ce117ab5944b5f51213187ac4b37aacc4ffefd05c2e34
```

| Field | Value |
|---|---|
| File Count | 10 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `9d3e3921a923e66f9fc0353f6be9e21cd3743b67730785ca546850b78fcdabba`（implementation inventory; 7 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlanningContract.ts` | `299c105f834dd2ac0e10fdccfd2f5606aa272f2dd48554d1b8cd62498c0e9aa8` | UNCHANGED |
| `ConstructionPlanningContractBuilder.ts` | `2072a1ab46fc0086fe0d2a9b7aa34f0b5eea8a91d430b1c625d8b850f833f10a` | UNCHANGED |
| `ConstructionPlanningContractTypes.ts` | `2bc00dfad9704d0e18adb8636a1d89bf78287fedf14729b32a89bc8a148906a5` | UNCHANGED |
| `ConstructionPlan.ts`（Chapter 25） | `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | UNCHANGED |
| `ConstructionPlanBuilder.ts`（Chapter 25） | `9d1c21f9b2e4fd95dbbfdb3305e37914f077dcccb89d311e84a676ba16530785` | UNCHANGED |
| `ConstructionPlanTypes.ts`（Chapter 25） | `c5dc725cfe49951dcb51529a6dc9f8321289110ed3e8004bb8439712eb5f7396` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-26.0-001.md` is outside this inventory.
- Chapter 26 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–26 FROZEN.

---

End of Checksum Verification
