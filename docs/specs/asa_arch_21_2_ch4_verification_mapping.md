# ASA-ARCH-21.2 Verification Mapping — Chapter 4

Architecture traceability: each Validation Contract → representation → test → VP.

| Contract | Spec § | Representation | Test | VP |
|---|---|---|---|---|
| VL-1 Declarative Validation | §2 | `ValidationContracts` registry | validation_contracts | VP-402 |
| VL-2 Structure Only | §2 | registry + forbidden list | validation_contracts | VP-403 |
| VL-3 Deterministic Validation | §2 | registry | validation_contracts | VP-402 |
| VL-4 Pipeline / Workflow Validation | §2 | registry | validation_contracts | VP-403 |
| VL-5 No Execution | §2 | registry | validation_contracts | VP-404 |
| VL-6 Not Expansion | §3 | registry | validation_contracts | VP-404 |
| VL-7 Not WorkflowBuilder | §3 | registry | validation_contracts | VP-404 |
| VL-8 Not Runtime | §3 | registry | validation_contracts | VP-404 |
| VL-9 Recognized Elements Compliance | §4 | registry | validation_contracts | VP-403 |
| VL-10 Structural Completeness Compliance | §4 | registry | validation_contracts | VP-403 |
| VL-11 Branch/Parallel/Nested Consistency | §4 | registry | validation_contracts | VP-403 |
| VL-12 Deterministic Workflow | §5 | registry | validation_contracts | VP-403 |
| VL-13 Acyclic Workflow | §5 | registry（no cycle detector） | validation_contracts | VP-404 |
| VL-14 Completeness After Expansion | §5 | registry | validation_contracts | VP-403 |
| VL-15 Downstream Compatibility | §5 | registry | validation_contracts | VP-403 |
| VL-16 Invalid Structure | §6 | classification id | validation_contracts | VP-403 |
| VL-17 Invalid Expansion | §6 | classification id | validation_contracts | VP-403 |
| VL-18 Invariant Violation | §6 | classification id | validation_contracts | VP-403 |
| VL-19 Compatibility Violation | §6 | classification id | validation_contracts | VP-403 |
| VL-20 Outcome Classification | §7 | outcome enum | validation_contracts | VP-406 |
| Frozen Ch1–Ch3 preserved | §9 | architecture_constraints / hash checks | architecture_constraints | VP-406 / VP-407 |
