# ASA-ARCH-44.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_44_0_checksum_verification |
| Architecture | ASA-ARCH-44.0 — Architecture Operations Layer（ASA-ARCH-21.3 Chapter 44） |
| Spec Status | Draft 0.6 / Contract 0.5 / Impl Design 0.18 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-44.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (45 files)

| SHA-256 | Path |
|---|---|
| `811bba14199f412de49d2ec0145dd4453ec1f7be9e743cdb045710eb2f29f631` | `docs/baselines/ASA-ARCH-21.3.md` |
| `307a9bb3c8d7c605cbc156936ebf5aac0ff5629ca2d6d2b14e000e6082054945` | `docs/baselines/ASA-ARCH-44.0.md` |
| `9e8ecb2c1614ee6c94b6d048c7a2874b7877dba90229579eff05be877c7b605e` | `docs/specs/asa_arch_44_0_contract_design.md` |
| `156d286b769fa2e3a81608e4cf03b7f1ef798ffbd8a2fa8dda680bfb2a190990` | `docs/specs/asa_arch_44_0_implementation_design.md` |
| `8f3e50b50c6c511691178781b149a511a8b598f054525b00af2466986193adaa` | `docs/specs/asa_arch_44_0_operations.md` |
| `130b93c8e8e9b01b1ee8db776e6f8fa7e9b295ec22288bbc8df7dff5fced04ce` | `jest.config.cjs` |
| `feba41766b40ce77b4ec75859a5330ad6683b5d7d9dec0fe002935f666842186` | `src/architecture_operations/compliance/AuthorityBoundaryValidator.ts` |
| `044502069f161e8715117fd3020080b80b3d989b65df191067c829c1f340c18b` | `src/architecture_operations/compliance/AuthorityValidationResult.ts` |
| `98b683b13c741facf98a34544f8714cef7a7858ceb9b541894da1de21228027d` | `src/architecture_operations/compliance/OperationalComplianceCheck.ts` |
| `c17aa696f3d73e9f5fbadf2a6361be603a2410c836441778e0e9a602fb659611` | `src/architecture_operations/compliance/TransitionValidationResult.ts` |
| `2e0ce853fe9075be0a72a786f7cd2413a2d263bf1be0a2bca099383fb79a9de0` | `src/architecture_operations/compliance/index.ts` |
| `623fac43945edc8a3acc515c374d686c96cb4c947c33932fba7cee0e49261703` | `src/architecture_operations/contracts/ApprovalReferenceContract.ts` |
| `76753d53e86081c71bacac9284e451a7e520219de82358de46d96513e2073d01` | `src/architecture_operations/contracts/ArchitectureLifecycleContract.ts` |
| `30224a539b922d3bf2670478b8011322ed8036c814ff6a4358ec909217b67149` | `src/architecture_operations/contracts/ArchitectureStateContract.ts` |
| `37a8993fbdcc34eb72aed82f79898e8e3650f54dacf8b5b38574ab156dc18062` | `src/architecture_operations/contracts/AuthorityContract.ts` |
| `eb314b17f724d7e071ba96da126be24833311a5facfaaa2fca87974047d10871` | `src/architecture_operations/contracts/ChangeControlContract.ts` |
| `680b0a850aa6de4daad6f1f86d6b98fc1884af2b4f3c2f96adb518c7267ef3d5` | `src/architecture_operations/contracts/LifecycleValidationResultContract.ts` |
| `89bfd040d37aa8e1ba92740c0032343affdbf13bba07b24286dc3ddb9ebcfdac` | `src/architecture_operations/contracts/RegistryContract.ts` |
| `d4f73b7dcb4dc8a17ce54541d14132df68e5daf66ef25434828849dafeedfdd2` | `src/architecture_operations/contracts/ValidationReferenceContract.ts` |
| `5f2bb279ab5121532e0d01e2335977c9b92082ffc8d69056885fd1d7bda54671` | `src/architecture_operations/contracts/index.ts` |
| `ea74d23ad46ed0cc7c0d90ecaa71e8d8aa658c36b3689531aabc831fdf694724` | `src/architecture_operations/events/LifecycleTransitionRecord.ts` |
| `e1a0b3abc97b99e78cb25245a64adeffd7a92f8c2b47e29dccfbb5519083ab96` | `src/architecture_operations/events/index.ts` |
| `d6875dbbf8e4b8902ca9eb39d58784e0ffc703e4a4efffe2ab54a36b81290f0b` | `src/architecture_operations/identity/ArchitectureIdentity.ts` |
| `c9c284b617083dce5630714eb80a7189c43d4e01fe2cfbf3a5cce9fc3cffe6fc` | `src/architecture_operations/identity/DeclarationIdentity.ts` |
| `abe3cff6a0b65634b5a977f79f1c3a24d0e11de113cd9d322914422a5162ca45` | `src/architecture_operations/identity/RecordIdentity.ts` |
| `c6b10d8f67564896079e056076899b1d15dc08b16ddf73c519e8471bbe9cc7ac` | `src/architecture_operations/identity/TransitionIdentity.ts` |
| `e01a2737c83d59505c095687b2a22ce69a6056450151f787de532c567289f33c` | `src/architecture_operations/identity/index.ts` |
| `ed17c353b92bd4aa5903969c0326e3c1cb8a8b552b5019be09a079ef6f008b76` | `src/architecture_operations/index.ts` |
| `b18ea000c9fd064f5bb712ba0d8fcafa8d4ccb87464fd1fc58791eac4881b23f` | `src/architecture_operations/lifecycle/LifecycleOperation.ts` |
| `a187b62c42b7df1acaf92e8c367eab42ec1a46344539362b37ccefcf3cf71faa` | `src/architecture_operations/lifecycle/LifecyclePolicy.ts` |
| `9a6f56a6571e882c35fcd4469982f41c35d3084d104f3c5de54d1b6ad413f7d3` | `src/architecture_operations/lifecycle/LifecycleState.ts` |
| `21a307bc1539dfb7ce8ff3d8a33b41c8da9aa9f8dc1ce1b3ccca3ef9f65d4833` | `src/architecture_operations/lifecycle/LifecycleTransition.ts` |
| `fee78e44189c7ceb03cfa93744de173ad390b4274647e1a1900fbf8ad3a82003` | `src/architecture_operations/lifecycle/LifecycleTransitionValidator.ts` |
| `5fba066b178ac4f8b8f8852e6468d2b322a545b87f6db3cfd953eb381690934b` | `src/architecture_operations/lifecycle/index.ts` |
| `66016b03a34d463ef4cbe501542c471bc1ddc7bf8755af6ee93cbeff3678d46e` | `src/architecture_operations/references/ApprovalReference.ts` |
| `42a5d7c60eb1a1ed0c715028da2002acc9976f81f37dbc06a976134bae5c1b00` | `src/architecture_operations/references/ValidationReference.ts` |
| `cb71cbfad341a2eb2567781e23edd40188a235419ca1b44c7774bceebc1badfc` | `src/architecture_operations/references/index.ts` |
| `04488260b6ba960e865dca8afdc74090e2f72ea9086bd3163d737eec354c6cd9` | `src/architecture_operations/registry/ArchitectureRegistry.ts` |
| `0a177498cbec5fc16daee0cd9d704303ddeffa11450d66dee3fd1d5d47dd6039` | `src/architecture_operations/registry/RegistryHistory.ts` |
| `32aa4b9293c612248367c21166b319ea59622291b37a7315d8b6c27e0c05c467` | `src/architecture_operations/registry/RegistryRecord.ts` |
| `9b072a399b147ad09f6f6a47e5a6d3d8f0f1651de1eb66b4c464492038df3689` | `src/architecture_operations/registry/RegistryRepositoryContract.ts` |
| `92cf057f71224a09a667b1eae83c85d132a81fb1a3c54c6577b3b0f7af89b54f` | `src/architecture_operations/registry/index.ts` |
| `f7686aa095d0568b8fe7f680d9af43ccadcb5a95addf43dcbf979aa17a7fbdbc` | `tests/architecture_operations/ArchitectureOperations.test.ts` |
| `5dddbf4784fcd1732334d1d01d7f8361e5ee78ccded19a55a99f884841fda491` | `tests/architecture_operations/architectureOperationsFixtures.ts` |
| `80392287898edcdce8b626b7eeddab364c36d78bb7b67c09f55b0ab1e9608640` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
e0fc8d5c6aba78e7a0b719104677e467b22b430bda79639566383a3f1bb3f5da
```

| Field | Value |
|---|---|
| File Count | 45 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Freeze-time Implementation Combined | `e4bf91c7bea50074769ef157edec5f0a0dd9c69dd314a8fba97c56d435d737b5`（40 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| Ch44 `index.ts` | `ed17c353b92bd4aa5903969c0326e3c1cb8a8b552b5019be09a079ef6f008b76` | FROZEN |
| Ch44 `LifecycleTransitionValidator.ts` | `fee78e44189c7ceb03cfa93744de173ad390b4274647e1a1900fbf8ad3a82003` | FROZEN |
| Ch44 `LifecycleOperation.ts` | `b18ea000c9fd064f5bb712ba0d8fcafa8d4ccb87464fd1fc58791eac4881b23f` | FROZEN |
| Ch44 `ArchitectureRegistry.ts` | `04488260b6ba960e865dca8afdc74090e2f72ea9086bd3163d737eec354c6cd9` | FROZEN |
| Ch44 `AuthorityBoundaryValidator.ts` | `feba41766b40ce77b4ec75859a5330ad6683b5d7d9dec0fe002935f666842186` | FROZEN |
| Ch43 ArchitectureValidationBuilder | `944eefb253e29b7286b564a23383dff1132eff18231e2f75150c3b3b41803928` | UNCHANGED |
| Ch43 ArchitectureValidationLayer | `961a17713ddb661f18bb4f0c0ebbfe0a2207c562fb8e8a7fd10f8ec49205764b` | UNCHANGED |
| Ch42 ArchitectureEvolutionBuilder | `6a6e964421aa08896eb3969b166b7a2ad99d1b33cd5801940aca71e83fc3106e` | UNCHANGED |
| Ch42 ArchitectureEvolutionLayer | `efd7cb4e4145f0505dcf49dcc412a4472a30f50984e3c76768389473bf2e04cf` | UNCHANGED |
| Ch35 Governance Types / Layer / Builder | — | UNCHANGED |

---

## 4. Notes

- Authorization / registration / verification reports are **excluded** from the combined inventory.
- Git commit / tag not issued unless separately requested.
