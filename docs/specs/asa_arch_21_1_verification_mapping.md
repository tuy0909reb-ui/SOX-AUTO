# ASA-ARCH-21.1 Verification Mapping

| Contract | Spec § | Test | VP |
|---|---|---|---|
| Convert Workflow → ExecutionGraph | §2 / §4 | workflow_builder / graph_builder_contract | VP-003 |
| Read-only Workflow / PipelineDefinition | §3 / §9 | architecture_constraints / pipeline_definition | VP-002 |
| Unique NodeIDs | §2 / §9 | node_factory / workflow_builder | VP-004 |
| Edges from Pipeline semantics only | §5 / §9 | edge_factory | VP-006 |
| Exactly-once Step → Node | §6 / §9 | step_definition / node_factory | VP-005 |
| Acyclic / deterministic / immutable graph | §7 / §9 | graph_builder_contract | VP-003 |
| Invalid StepFailure | §4 / §9 | step_definition / workflow_builder | VP-007 |
| No partial graph; Workflow unchanged on fail | §4 / §9 | graph_builder_contract | VP-007 |
| No schedule/dispatch/engine embed | §3 / §9 | architecture_constraints | VP-008 |
| orchestration / runtime unchanged | §1 | architecture_constraints | VP-009 |
