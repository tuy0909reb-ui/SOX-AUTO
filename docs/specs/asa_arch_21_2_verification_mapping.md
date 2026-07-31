# ASA-ARCH-21.2 Verification Mapping — Chapter 1

Architecture review traceability: each Pipeline Invariant → representation → test → VP.

| Invariant | Spec § | Representation | Test | VP |
|---|---|---|---|---|
| PI-1 Immutable Lifecycle | §2 | `PipelineInvariants` registry | pipeline_invariants | VP-002 |
| PI-2 Read-only Exposure | §2 | registry + Object.isFrozen | pipeline_invariants | VP-005 |
| PI-3 Determinism | §2 | registry statement | pipeline_invariants | VP-002 |
| PI-4 Structure Only | §2 | registry + SHALL NOT runtime list | pipeline_invariants | VP-004 |
| PI-5 Single Expansion | §2 | registry（no expander） | pipeline_invariants | VP-003 |
| PI-6 Acyclic Expansion | §2 | registry（no cycle detector） | pipeline_invariants | VP-003 |
| PI-7 Compatibility with WorkflowBuilder | §2 | registry + 21.1 import edge | pipeline_invariants / architecture_constraints | VP-006 |
| PI-8 Implementation Independence | §2 | registry | pipeline_invariants | VP-002 |
| PI-9 Semantic Independence | §2 | registry | pipeline_invariants | VP-002 |
| PI-10 Complete Structural Definition | §3 | registry | pipeline_invariants | VP-002 |
| PI-11 Recognized Structural Elements | §3 | registry initial set note | pipeline_invariants | VP-002 |
| PI-12 No Runtime-dependent Branching | §3 | registry | pipeline_invariants | VP-004 |
| PI-13 Immediate Failure on Violation | §4 | registry（no failure taxonomy） | pipeline_invariants | VP-003 |
| No algorithms in Chapter 1 module | §5 | source scan | pipeline_invariants | VP-003 |
| Frozen layers unchanged | §6 | architecture_constraints | architecture_constraints | VP-007 |
