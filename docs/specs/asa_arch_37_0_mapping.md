# ASA-ARCH-37.0 Verification Mapping — ASA-CONNECT External Integration Boundary Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §3 | `forbidsCoreMutation` + Core 34.0 | Conformance.test | Core non-mutation |
| Governance Preservation | §3 | `preservesGovernanceContract` | Conformance.test | Governance non-mutation |
| Framework Compliance | §2 | source Framework 35.1 | Validator.test | Framework required |
| OPS Preservation | §2 | `preservesOpsContract` + no asa_ops import | Validator.test | OPS non-mutation |
| Authority Declaration | §5 | `authority: REQUESTER` | Validator.test | Non-REQUESTER rejected |
| REQUESTER ≠ Execution | §5 | `requesterIsNotExecutionAuthority` | Layer.test | Flag true |
| Connector Contract | §8 | `ConnectorDefinition` | Validator.test | All types required |
| External Data Trust | §9 | `ExternalDataContract` | Layer.test | Untrusted + Validation Before Trust |
| Transformation | §10 | `DataTransformationContract` | Layer.test | Data conversion only |
| Routing Restriction | §11 | `ConnectorRouter` | Validator.test | No workflow selection |
| Authentication Boundary | §12 | `AuthenticationBoundary` | Layer.test | Secret isolation |
| Secret Ownership Separation | §13 | `SecretProtectionContract` | Validator.test | Not ownership |
| External Request Protection | §14 | `ExternalRequestGuard` | Layer.test | Observation/Validation only |
| Error Contract | §15 | `ConnectorErrorContract` | Layer.test | Classifications present |
| Outbound Boundary | §17 | `OutboundConnectorBoundary` | Layer.test | No Core direct access |
| Capability Separation | §18 | `ConnectCapabilitySeparation` | Layer.test | Not Capability Provider |
| Lifecycle Governance | §19 | `ConnectorLifecycleValidator` | Fixtures / establish | Ordered states |
| Declarative Purity | — | package sources | Validator.test | No runtime imports |
| Isolation | §22 | communication + regression flags | Conformance.test | External ≠ Core failure |
| Deterministic Establishment | — | same inputs | Conformance.test | Equal JSON |
