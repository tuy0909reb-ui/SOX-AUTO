# ASA-ARCH-20.9.2 Verification Mapping

Maps Draft 0.4 contracts to architecture tests and verification plan items.

| Contract / Invariant | Spec § | Test ID | VP |
|---|---|---|---|
| EnginePool no flow control | §3.1 / §11 | INV-EP-001 | VP-002 |
| EnginePool no ExecutionGraph mutate | §3.1 / §11 | INV-EP-002 | VP-002 |
| No concurrent same-instance alloc | §3.1 / §11 | INV-EP-003 | VP-002 |
| EnginePool no definition ownership | §3.1 / §11 | INV-EP-004 | VP-002 |
| Pool state transitions | §4 | INV-EP-005 | VP-002 |
| DispatchStrategy no graph mutate | §3.2 / §11 | INV-DS-001 | VP-003 |
| DispatchStrategy no priority mutate | §3.2 / §11 | INV-DS-002 | VP-003 |
| DispatchStrategy no retained state | §3.2 / §11 | INV-DS-003 | VP-003 |
| DET-001 deterministic assignment | §6 | INV-DS-004 | VP-007 |
| Coordinator no engine create | §3.3 / §11 | INV-EC-001 | VP-004 |
| Acquire/Release via Pool | §5 | INV-EC-002 | VP-004 |
| Coordinator owns assignment | §3.3 | INV-EC-003 | VP-004 |
| Single-dispatch | §11 | INV-EC-004 | VP-004 |
| Registry definitions only | §3.4 / §11 | INV-ER-001 | VP-005 |
| ResultCollector no dispatch | §3.5 / §11 | INV-RC-001 | VP-006 |
| ResultCollector no graph mutate | §3.5 / §11 | INV-RC-002 | VP-006 |
| ResultCollector no state transition | §3.5 / §11 | INV-RC-003 | VP-006 |
| ErrorPolicy no EnginePool manipulate | §3.6 / §11 | INV-ERR-001 | VP-006 |
| ErrorPolicy notifies LifecycleController | §3.6 / §7 | INV-ERR-002 | VP-006 |
| LifecycleController sole owner | §3.7 / §11 | INV-LC-001 | VP-006 |
| Runtime semantics 20.8 | §11 | INV-RT-001 | VP-009 |
| STOP_ON_ERROR acquire stop | §7 | INV-STOP-001 | VP-008 |
| Graph read-only | §11 | INV-GRAPH-001 | VP-009 |
