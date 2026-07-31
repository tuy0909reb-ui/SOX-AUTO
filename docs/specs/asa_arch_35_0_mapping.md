# ASA-ARCH-35.0 Verification Mapping — Chapter 35 Extension Governance Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §3 | `identity.coreVersion` = ASA-CORE-34.0 | Builder.test | Core non-mutation |
| Extension Boundary Contract | §4 | `extensionBoundaryContract` | Layer.test | Isolation + forbidden mutation |
| Extension Identifier Contract | §5.1 | `ASA-{DOMAIN}` pattern | Builder.test | Invalid id rejected |
| Extension Domain Model | §5 | `extensionDescriptors` | Conformance.test | OPS / AI / CONNECT |
| Authority Model | §6 | `authority` levels | Conformance.test | No ADMINISTRATOR |
| AI Authority Restriction | §7 | ASA-AI ≠ EXECUTOR | Builder.test | EXECUTOR rejected for AI |
| Executor Separation | §6.4 | EXECUTOR ≠ decision authority | Conformance.test | No decisionAuthority field |
| Compatibility Model | §8 | `compatibilityMatrix` | Builder.test | Required; Core 34.0 |
| Lifecycle | §9 | `lifecycle` states | Types / Builder | Required on descriptors |
| Regression Boundary | §10 | `regressionBoundary` | Builder.test | All flags required true |
| Version Policy | §11 | descriptor `version` | Conformance.test | Present |
| Declarative Purity | §12 | package sources | Builder.test | No runtime imports |
| Ch25–34 Isolation | §3 | package imports | Builder.test | No construction_* imports |
| Deterministic Establishment | §13 | same inputs | Conformance.test | Equal JSON |
