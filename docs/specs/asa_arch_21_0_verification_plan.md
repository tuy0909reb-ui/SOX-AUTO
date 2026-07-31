# ASA-ARCH-21.0 Verification Plan

**Target:** Workflow Core  
**Parents:** ASA-ARCH-20.8〜20.9.3（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-001 | Artifact Presence |
| VP-002 | Workflow immutability after validation |
| VP-003 | Workflow lifecycle Created→Ready |
| VP-004 | ExecutionPolicy declarative only |
| VP-005 | GraphBuilder Workflow→ExecutionGraph contract |
| VP-006 | GraphBuilder failure / no partial graph |
| VP-007 | GraphBuilder read-only Workflow |
| VP-008 | No reverse dependency to orchestration internals misuse |
| VP-009 | Frozen contract preservation（20.8〜20.9.3） |
| VP-010 | Typecheck / Jest / Architecture Tests / Regression |

---

# 2. Methods

- `tests/workflow/*`
- Existing `tests/runtime_execution` + `tests/orchestration` regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Freeze / Acceptance / Commit / Tag / Runtime Workflow Engine / Retry-Timeout
