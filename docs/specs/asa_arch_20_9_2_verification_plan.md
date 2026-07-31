# ASA-ARCH-20.9.2 Verification Plan

**Target:** EnginePool & Dispatch Strategy Extension (Draft 0.4)  
**Parents:** ASA-ARCH-20.8 / 20.9.0 / 20.9.1（Frozen contracts preserved）

---

# 1. Scope

Verify additive 20.9.2 components and extensions without modifying frozen contracts.

| ID | Item |
|---|---|
| VP-001 | Artifact Presence |
| VP-002 | EnginePool contracts |
| VP-003 | DispatchStrategy contracts |
| VP-004 | ExecutionCoordinator extensions |
| VP-005 | EngineRegistry definition ownership |
| VP-006 | ResultCollector / ErrorPolicy boundaries |
| VP-007 | DET-001 assignment determinism |
| VP-008 | STOP_ON_ERROR acquire stop |
| VP-009 | Frozen contract preservation (20.8 / 20.9.0 / 20.9.1) |
| VP-010 | Dependency direction / acyclic graph |
| VP-011 | Architecture Tests |
| VP-012 | Regression / Typecheck / Jest |

---

# 2. Methods

- Architecture tests under `tests/orchestration/arch_20_9_2_invariants.test.ts`
- Existing 20.9.0 / 20.9.1 behavioral tests
- 20.8 `tests/runtime_execution` regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Scheduler / Workflow / Pipeline / Observability / Freeze / Commit / Tag
