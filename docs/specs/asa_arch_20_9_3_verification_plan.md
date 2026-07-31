# ASA-ARCH-20.9.3 Verification Plan

**Target:** Scheduler / Workflow Control (Draft 0.4)  
**Parents:** ASA-ARCH-20.8 / 20.9.0 / 20.9.1 / 20.9.2（Frozen contracts preserved）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-001 | Artifact Presence |
| VP-002 | Scheduler contracts |
| VP-003 | DependencyResolver contracts |
| VP-004 | SchedulingPolicy / PriorityResolver |
| VP-005 | ConcurrencyPolicy |
| VP-006 | ScheduledNodeQueue immutability |
| VP-007 | Dispatch loop integration |
| VP-008 | Frozen contract preservation |
| VP-009 | Architecture Tests |
| VP-010 | Regression / Typecheck / Jest |

---

# 2. Methods

- `tests/orchestration/scheduler.test.ts` ほか個別テスト
- `tests/orchestration/arch_20_9_3_invariants.test.ts`
- 既存 20.8〜20.9.2 回帰
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Workflow / Pipeline 詳細、Observability、Freeze / Commit / Tag
