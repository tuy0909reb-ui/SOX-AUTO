# ASA-ARCH-20.9.3 Verification Mapping

| Contract / Invariant | Spec § | Test | VP |
|---|---|---|---|
| Dispatcher no dependency resolution | §3.1 / §7 | arch INV-DISP-001 | VP-007 |
| Scheduler no engine assign | §3.2 / §7 | arch INV-SCH-001 | VP-002 |
| Scheduler no graph mutate | §3.2 / §7 | arch INV-SCH-002 | VP-002 |
| Scheduler no context mutate | §3.2 | scheduler.test | VP-002 |
| Scheduler deterministic | §3.2 / §7 | scheduling_policy / scheduler | VP-002 |
| Scheduler terminates (acyclic) | §3.2 / §7 | scheduler.test | VP-002 |
| Immutable CompletedNodeSet view | §3.2 / §7 | arch INV-SCH-003 | VP-002 |
| No partial queue on failure | §3.2 / §7 | scheduler.test | VP-002 |
| DependencyResolver no generate executable | §3.3 / §7 | dependency_resolver | VP-003 |
| Policy no priority mutate / no EnginePool | §3.4 / §7 | scheduling_policy | VP-004 |
| Priority equal → topo order | §3.5 / §7 | priority_resolver | VP-004 |
| Concurrency no reorder | §3.6 / §7 | concurrency_policy | VP-005 |
| Queue immutable / unique | §5 / §7 | scheduled_node_queue | VP-006 |
| Strategy consumes queue read-only | §5 / §7 | arch INV-DSQ-001 | VP-007 |
| Failure → ErrorPolicy | §3.2 / §7 | scheduler integration | VP-007 |
