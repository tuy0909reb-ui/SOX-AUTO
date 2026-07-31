# ASA-ARCH-43.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_43_0_checksum_verification |
| Architecture | ASA-ARCH-43.0 — Architecture Validation Intelligence Layer（ASA-ARCH-21.3 Chapter 43） |
| Spec Status | Draft 0.7 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-43.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (22 files)

| SHA-256 | Path |
|---|---|
| `2783573e7e6f6c1758a9b9707283f06a213a09ef6ca8020b4db3370383808e6c` | `docs/baselines/ASA-ARCH-21.3.md` |
| `4186afe4befffe7223412a696de7a4951a7a45c093721e3c6621f9569953d43b` | `docs/specs/asa_arch_43_0_mapping.md` |
| `eee8948d8869b62680428baa8c60095db4c8a0cd4fe564838d360fd5556ae486` | `docs/specs/asa_arch_43_0_validation.md` |
| `3c98a31bd51ab80d55e88f0234d365d9cf574135b0c83ded52d2c0c817068d6b` | `jest.config.cjs` |
| `2171478c832d8d724e7371dcd29b689c3f0ccefdafd3faf6b8b736365aae3948` | `src/architecture_validation/ArchitectureHealthReport.ts` |
| `944eefb253e29b7286b564a23383dff1132eff18231e2f75150c3b3b41803928` | `src/architecture_validation/ArchitectureValidationBuilder.ts` |
| `961a17713ddb661f18bb4f0c0ebbfe0a2207c562fb8e8a7fd10f8ec49205764b` | `src/architecture_validation/ArchitectureValidationLayer.ts` |
| `e2ba302504520e31226328bb751a3e131568c0cac9b2f8ea8fd8036c154d4e3b` | `src/architecture_validation/ArchitectureValidationTypes.ts` |
| `47310599eac81d4430476777767ceb7ea030262d1c9fe9bfe9208aee08a978fa` | `src/architecture_validation/BoundaryValidator.ts` |
| `e257caaba20cbe0046a22340e0066313749ee361c689a2781d7479005e156e95` | `src/architecture_validation/ContractValidator.ts` |
| `092c0727a3572e970228fc3761e7322cbceefb004f88604722297d2dbfdeb8fc` | `src/architecture_validation/DriftDetector.ts` |
| `fe3cceb4e9a032cf28b6722669937f207391e8bf419652041c40a0971a6ebede` | `src/architecture_validation/EvidenceHealthRecorder.ts` |
| `283cd42b11473438efee33a8dc84769b24bb9e330523c046d13c15c8f64c9cf6` | `src/architecture_validation/FreezeIntegrityValidator.ts` |
| `712d6cf2f1b19eccca7738b2d649e4768efd622ebcfb7eae70d537b34bb08507` | `src/architecture_validation/HashIntegrity.ts` |
| `2ee3a83d98026ef83a49d9eb41f07b99dc68d93b8a99d8fa5126681eba686846` | `src/architecture_validation/ValidationEvidence.ts` |
| `427bec577958d479665f1ec44f6ceb6cab698340a2c50a2bfeb6428de3684dac` | `src/architecture_validation/ValidationResultContracts.ts` |
| `64675e1c8d444ea536c37d2102483ab7e37241ebeca78baebec455bdfd459f4f` | `src/architecture_validation/ValidationRuleEngine.ts` |
| `794fad41c6142597d4a2756f5630c7591385123155ad0ebcd11161bad886b6d0` | `src/architecture_validation/ValidationRules.ts` |
| `6d4650fc1e1e7cc13837b6aaa3622e1888041084897b88df4eb7d3ed6cc2a6e1` | `src/architecture_validation/index.ts` |
| `e748e986fc71f9c32908266934b5bcd07c7e7fea02ad5832af7f59a34c94b02f` | `tests/architecture_validation/ArchitectureValidation.test.ts` |
| `b8c7bfa3cd076fc5224192ad02f262c9d3311cbf82eef8f1f5ee62f13fa61473` | `tests/architecture_validation/validationFixtures.ts` |
| `80392287898edcdce8b626b7eeddab364c36d78bb7b67c09f55b0ab1e9608640` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
e67d0bdcb6c5256cbab5894d6b24df543a632cf02e89edbc07a378fcc630e9d1
```

| Field | Value |
|---|---|
| File Count | 22 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Freeze-time Implementation Combined | `59e5fcf5bc552e66367b19b187302fea8b977eb5ede86af17af2fe55b716a9bd`（19 files before freeze-status / architecture docs） |
| Verification-era Pre-freeze Combined | `d2fbc38b441321693d43987ff8ab7e3ac9d3cd1e6baca0baa48acc0cac7ae6a1`（historical；see ASA-VERIFY-ARCH-43.0-001） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ArchitectureValidationBuilder.ts` | `944eefb253e29b7286b564a23383dff1132eff18231e2f75150c3b3b41803928` | UNCHANGED |
| `ArchitectureValidationLayer.ts` | `961a17713ddb661f18bb4f0c0ebbfe0a2207c562fb8e8a7fd10f8ec49205764b` | UNCHANGED |
| `ValidationRules.ts` | `794fad41c6142597d4a2756f5630c7591385123155ad0ebcd11161bad886b6d0` | UNCHANGED |
| `ValidationRuleEngine.ts` | `64675e1c8d444ea536c37d2102483ab7e37241ebeca78baebec455bdfd459f4f` | UNCHANGED |
| Ch42 ArchitectureEvolutionBuilder | `6a6e964421aa08896eb3969b166b7a2ad99d1b33cd5801940aca71e83fc3106e` | UNCHANGED |
| Ch42 ArchitectureEvolutionLayer | `efd7cb4e4145f0505dcf49dcc412a4472a30f50984e3c76768389473bf2e04cf` | UNCHANGED |
| Ch42 ValidationRules | `184842c68b58a070a52f81778ac8c962f0ce3a5f567f87ff26859a01938181ec` | UNCHANGED |
| Ch42 EvolutionProposal | `20ed07479deb62cc1c72dbc112d6290f6bfa9025b89cc8cb8340ce5bd6f2bb48` | UNCHANGED |
| Ch41 ScenarioContract | `166ea5a693474aa97e89a5093b7be2cdbc4dedc3ecb441503f7c2efb0fb25242` | UNCHANGED |
| Ch41 ScenarioValidator | `bd6bd53e4a821b2658c89e4a5de4434a67798f46b5fe7fc811ddea40d8724881` | UNCHANGED |
| Ch41 AsaScenarioLayer | `9c8d55ab5ffbc2a3b6f73d5043b95541ff3a4e2ab36fa062fa9b9f2ba25c7092` | UNCHANGED |
| Ch40 CoordinatorContract | `257ff631be644d2a1cf3158ef7b812bbe6b98f702c2b2e084d916bce1777a120` | UNCHANGED |
| Ch40 CoordinationValidator | `899e66cff253211541285fb8cb49c809c6c2bf2ded8013de53d6c9a825567eb2` | UNCHANGED |
| Ch40 AsaCoordinationLayer | `5d40fae908d488d2c990d668533c6eb5d61e3639c8e43560cd22d788399fa4a3` | UNCHANGED |
| Ch39 ValidationExtensionContract | `a633453c3781ce2c53555a008836cfe70f6609f3723a7938e98d2993a13785db` | UNCHANGED |
| Ch39 ValidationValidator | `32d0a3017e206550de4b3a85ffac781e559e364caa8c27f9556505a4968e01b9` | UNCHANGED |
| Ch39 AsaValidationLayer | `77b59ec809b3f545a8ebc8795d0457e29a7a86f44a9f74ed2d76c40b6ba640a6` | UNCHANGED |
| Ch38 AiExtensionContract | `0a6d1d66be3bce507c85929499d2a2d32de37c7760bfa6c0236d6aad359265f3` | UNCHANGED |
| Ch38 AiValidator | `bca8c6a006992648b2e6a5cd1f8c44fc5cbe3e2348a30cbeca40ef83ac6e655c` | UNCHANGED |
| Ch38 AsaAiLayer | `f9fc9b90ba3c54edd849c3ede3093d0d77bc3dfd9da6dd58abe7eeeff3ab3229` | UNCHANGED |
| Ch37 ConnectExtensionContract | `de693e151b979d0a2ab3be507e3aa6cb60230458a7ed9cbb3c97c53307f54dc7` | UNCHANGED |
| Ch37 ConnectValidator | `bcf81c3ddc48df84fdbfbf611513ba3cee13c7b7195d56bc8128234b474dc8a5` | UNCHANGED |
| Ch37 AsaConnectLayer | `b28b7c7078e0d44bdbf0a96e7cef69776847b19894859bcd50517cf154528a8f` | UNCHANGED |
| Ch36 OpsExtensionContract | `df13e320b7b652c2ab0fa89908a35f8b936819b920c599676eeac6ba25978a0e` | UNCHANGED |
| Ch36 OpsValidator | `fb943da6556c403d0ceb125ef5ce6308cf9e98573f64328442619a20b22f46cc` | UNCHANGED |
| Ch36 AsaOpsLayer | `225ea458a6022f998ecc43e42d214d6f54675860fab9c974f2aae16988d25b48` | UNCHANGED |
| Ch35.1 Framework Types | `87436f97b4873f309163d542067767033cf02421a1863ac0eb38b96b418d305c` | UNCHANGED |
| Ch35.1 Framework Model | `b3d620d26eee055bfa6ebba6b0af5b1f7098ce98ed7e2fcb47a8da581adb49dc` | UNCHANGED |
| Ch35.1 Framework Builder | `e3e3ee5a7cf536013e911a5e1727db0fa11dcf0b2c141a72c57bab469f83ad19` | UNCHANGED |
| Ch35.0 Governance Types | `2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1` | UNCHANGED |
| Ch35.0 Governance Layer | `fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d` | UNCHANGED |
| Ch35.0 Governance Builder | `c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97` | UNCHANGED |
| Ch34 Normalization Types | `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | UNCHANGED |
| Ch34 Normalization Record | `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | UNCHANGED |
| Ch34 Normalization Builder | `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | UNCHANGED |

---

## 4. Notes

- Authorization / registration / verification reports are **excluded** from the combined inventory.
- Evidence remains separated from Canonical Architecture Source.
- Git commit / tag not issued unless separately requested.
