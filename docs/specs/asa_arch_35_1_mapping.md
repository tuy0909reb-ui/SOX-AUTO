# ASA-ARCH-35.1 Verification Mapping — Extension Development Framework

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §3 | `identity.coreVersion` = ASA-CORE-34.0 | Conformance.test | Core non-mutation |
| Governance Preservation | §3 | `preservesGovernanceContract` + source layer | Conformance.test | Governance non-mutation |
| Extension Template Contract | §4 | `extensionTemplate` | Builder.test / Layer.test | Required fields present |
| Extension Metadata | §5 | `metadata` + `governanceOwner` | Framework.test | Required metadata |
| Contract Template | §6 | Input / Processing / Output / Error | Builder.test | Error Contract fields |
| Capability Binding | §7 | `capabilityBinding` | Builder.test | No direct capability mutation |
| Authority Declaration | §8 | Declared ≤ Approved | Builder.test / Conformance.test | Escalation forbidden |
| AI Authority Restriction | §8 | ASA-AI ≠ EXECUTOR | Builder.test | EXECUTOR rejected for AI |
| Lifecycle Template | §9 | `lifecycle` states | Types / Builder | Required |
| Dependency Model | §10 | `dependency` + no self-cycle | Builder.test | Circular dependency rejected |
| Compatibility Declaration | §11 | Core 34.0 + Governance 35.x | Builder.test | Version match required |
| Communication Contract | §12 | Boundary-only; no direct internal API | Framework.test | Flags true |
| Validation Pipeline | §13 | Ordered stages | Builder.test | Incomplete stages rejected |
| Security Validation | §14 | Required flags | Builder.test | All flags true |
| Regression Standard | §15 | Unit/Contract/Integration/Isolation | Framework.test | Isolation required |
| Declarative Purity | — | package sources | Builder.test | No runtime imports |
| Ch25–34 Isolation | §3 | package imports | Builder.test | No construction_* imports |
| Governance-only upstream | §2 | imports | Builder.test | Only extension_governance |
| Deterministic Definition | — | same inputs | Conformance.test | Equal JSON |
