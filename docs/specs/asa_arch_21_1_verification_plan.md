# ASA-ARCH-21.1 Verification Plan

**Target:** Workflow Builder (Draft 0.2)  
**Parents:** ASA-ARCH-21.0 / 20.8〜20.9.3（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-001 | Artifact Presence |
| VP-002 | Workflow / PipelineDefinition read-only |
| VP-003 | Deterministic identical Workflow → identical Graph |
| VP-004 | Globally unique NodeIDs |
| VP-005 | Acyclic / complete / exactly-once Step conversion |
| VP-006 | Sequence / Parallel / Branch edge semantics |
| VP-007 | Failure: invalid Step / no partial graph / Workflow unchanged |
| VP-008 | No execution / scheduling / engine semantics |
| VP-009 | orchestration / runtime_execution unchanged |
| VP-010 | Typecheck / Jest / Architecture / Regression |

---

# 2. Methods

- `tests/workflow/*`（21.1 suite）
- Existing 20.8〜21.0 regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Freeze / Commit / Tag / Runtime scheduling / Engine assignment
