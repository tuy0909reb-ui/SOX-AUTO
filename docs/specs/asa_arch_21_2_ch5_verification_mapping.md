# ASA-ARCH-21.2 Verification Mapping — Chapter 5

Architecture traceability: each Failure Contract → representation → test → acceptance section.

| Contract | Spec § | Representation | Test | Acceptance Section |
|---|---|---|---|---|
| FL-1 Declarative Failure | §2 | `FailureContracts` registry | failure_contracts | Failure Principles |
| FL-2 Structural Failure Only | §2 | registry + forbidden list | failure_contracts | Failure Principles |
| FL-3 Pre-runtime Detectability | §2 | registry | failure_contracts | Failure Principles |
| FL-4 Deterministic Failure | §2 | registry | failure_contracts | Failure Principles |
| FL-5 Failure Is Not Behavior | §3 | registry | failure_contracts | Failure Boundary |
| FL-6 Failure Is Not Recovery | §3 | registry | failure_contracts | Failure Boundary |
| FL-7 Structural Scope Only | §3 | registry | failure_contracts | Failure Boundary |
| FL-8 Invalid Structure | §4 | category definition | failure_contracts | Failure Categories |
| FL-9 Invalid Expansion | §4 | category definition | failure_contracts | Failure Categories |
| FL-10 Invariant Violation | §4 | category definition | failure_contracts | Failure Categories |
| FL-11 Compatibility Violation | §4 | category definition | failure_contracts | Failure Categories |
| FL-12 Structural Non-continuability | §5 | registry | failure_contracts | Failure Semantics |
| FL-13 Structurally Terminal | §5 | registry | failure_contracts | Failure Semantics |
| FL-14 Semantically Non-recoverable | §5 | registry | failure_contracts | Failure Semantics |
| FL-15 Structural Validation Determines Failure | §6 | registry | failure_contracts | Failure Determination |
| FL-16 Deterministic Determination | §6 | registry | failure_contracts | Failure Determination |
| FL-17 Failure Category | §7 | category enum | failure_contracts | Failure Category Contract |
| Frozen Ch1–Ch4 preserved | §9 | architecture_constraints / hash checks | architecture_constraints | Backward Compatibility |
