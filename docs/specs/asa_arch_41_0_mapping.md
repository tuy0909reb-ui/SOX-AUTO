# ASA-ARCH-41.0 Verification Mapping — ASA-SCENARIO Extension Scenario Definition Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core / Framework Preservation | §27 | preserve flags + Framework 35.1 | Conformance.test | Non-mutation |
| Sibling Preservation 36–40 | §2 | preserve + peer flags | Conformance.test | Sibling independence |
| Authority SCENARIO_DESIGNER | §5–6 | local authority | Validator.test | Non-designer rejected |
| Execution Isolation | §6 / §8 | forbidsExecute / Output | Validator.test / Layer.test | No execution |
| Scenario Definition | §11 | Definition contract | Layer.test | Required fields |
| Capability Reference Isolation | §11 | non-activation flags | Validator.test | No activation |
| Scenario Composition | §12 | Composition contract | Layer.test | static/dynamic/conditional |
| Dynamic Composition Boundary | §12 | dynamic ≠ execution | Validator.test | Boundary enforced |
| Lifecycle Boundary | §13 | Scenario lifecycle | Layer.test | Released ≠ Executable |
| Coordination Compatibility | §15 | Coordination boundary | Layer.test | Read-only / optional |
| Validation Compatibility | §16 | Validation boundary | Layer.test | Read-only |
| AI Boundary | §17 | AI boundary | Layer.test | No AI authority |
| Memory Boundary | §18 | Memory contract | Layer.test | Not Core state |
| Security Compliance | §19 | Security contract | Layer.test | No forge |
| Registration Compliance | §20 | Registration contract | Layer.test | Identification only |
| Determinism | §23 | Determinism policy | Layer.test | Required metadata |
| Self Scenario Restriction | §24 | Self restriction | Layer.test | Independent validation |
| Result Reproducibility | — | establish | Conformance.test | Equal JSON |
| Registry Compatibility | §20–22 | discovery / selection | Layer.test | Metadata / recommendation |
| Non Execution | §8 | provider + output | Validator.test | forbidsExecute |
