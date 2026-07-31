# ASA-ARCH-36.0 Verification Mapping — ASA-OPS Operational Extension Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §3 | `forbidsCoreMutation` + Core 34.0 | Conformance.test | Core non-mutation |
| Governance Preservation | §3 | `preservesGovernanceContract` | Conformance.test | Governance non-mutation |
| Framework Compliance | §2 | source Framework 35.1 | Validator.test | Framework required |
| Authority Declaration | §5 | `authority: OBSERVER` | Validator.test | Non-OBSERVER rejected |
| Observation Targets | §6 | `OpsObservation` | Layer.test | Observation-only |
| Logging Contract | §8 | `OpsLogger` | Validator.test | Immutable record shape |
| Audit Contract | §9 | `OpsAudit` | Validator.test | Who/What/When/Why fields |
| Audit Integrity | §9 | `immutableRecord` | Validator.test | Incomplete fields rejected |
| Monitoring Contract | §10 | `OpsMonitoring` | Layer.test | No state mutation |
| Health Contract | §11 | `OpsHealth` | Validator.test | No Execution Permission change |
| Execution Trace | §12 | `OpsExecutionTrace` | Validator.test | Ordered path stages |
| Security Boundary | §13 | `OpsSecurityBoundary` | Layer.test | No Secret/Exec/Policy auth |
| Extension Interaction | §14 | `OpsExtensionInteractionContract` | Layer.test | Boundary-only path |
| Reporting Contract | §15 | `OpsReporting` | Layer.test | Display/notification only |
| Isolation | §17 | Framework isolation + forbid flags | Conformance.test | Core independent |
| Declarative Purity | — | package sources | Validator.test | No runtime imports |
| Ch25–34 Isolation | §3 | package imports | Validator.test | No construction_* imports |
| Deterministic Establishment | — | same inputs | Conformance.test | Equal JSON |
