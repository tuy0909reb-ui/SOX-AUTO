# ASA-ARCH-21.2 Verification Mapping — Chapter 2

Architecture traceability: each Public Contract → representation → test → VP.

| Contract | Spec § | Representation | Test | VP |
|---|---|---|---|---|
| PD-1 Definition Object | §2 | `PipelinePublicContract` | pipeline_public_contract | VP-202 |
| PD-2 Recognized Structural Elements | §3 | `RECOGNIZED_STRUCTURAL_ELEMENTS` | pipeline_public_contract | VP-203 |
| PD-3 Sequence | §4 | registry + `SequenceElement` | pipeline_public_contract | VP-202 |
| PD-4 Parallel | §4 | registry + `ParallelElement` | pipeline_public_contract | VP-202 |
| PD-5 Branch | §4 | registry + `BranchElement` | pipeline_public_contract | VP-202 |
| PD-6 Merge | §4 | registry + `MergeElement` | pipeline_public_contract | VP-202 |
| PD-7 NestedPipeline | §4 | registry + `NestedPipelineElement` | pipeline_public_contract | VP-202 |
| PD-8 Composition | §5 | registry + forbidden composition list | pipeline_public_contract | VP-202 |
| PD-9 Expansion Capability | §6 | registry（no expander） | pipeline_public_contract | VP-204 |
| PD-10 Expansion Boundary | §6 | registry（boundary only） | pipeline_public_contract | VP-204 |
| PD-11 Read-only Exposure | §7 | registry + Object.isFrozen | pipeline_public_contract | VP-205 |
| PD-12 WorkflowBuilder Compatibility | §8 | registry | pipeline_public_contract | VP-206 |
| PD-13 Structural Validity | §9 | registry（no validator / no fail impl） | pipeline_public_contract | VP-204 |
| PI-* preserved; 21.1 PipelineDefinition unchanged | §11 | architecture_constraints | architecture_constraints | VP-206 / VP-207 |
