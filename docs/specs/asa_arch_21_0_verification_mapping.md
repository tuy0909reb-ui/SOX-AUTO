# ASA-ARCH-21.0 Verification Mapping

| Contract | Spec § | Test | VP |
|---|---|---|---|
| Workflow immutable after validation | §3 / §4 | workflow_definition / lifecycle | VP-002 |
| Lifecycle Created→Ready | §4 / §7 | lifecycle_contract | VP-003 |
| Responsibility ends at Ready | §7 | lifecycle_contract | VP-003 |
| ExecutionPolicy declarative only | §6 | execution_policy | VP-004 |
| GraphBuilder I/O Workflow→Graph | §5 | graph_builder_contract | VP-005 |
| No partial graph on failure | §5 | graph_builder_contract | VP-006 |
| GraphBuilder read-only Workflow | §5 / §9 | graph_builder_contract | VP-007 |
| No scheduling/dispatch/engine in Workflow | §3 / §9 | architecture_constraints | VP-008 |
| orchestration / runtime_execution unchanged | §1 / §8 | architecture_constraints | VP-009 |
| Dependency workflow→GraphBuilder→Graph | §8 | architecture_constraints | VP-008 |
