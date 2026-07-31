# ASA-ARCH-21.2 Verification Plan — Chapter 1 (Pipeline Invariants)

**Target:** Pipeline Invariants Draft 0.2（Chapter 1 only）  
**Parents:** ASA-ARCH-20.8〜21.1（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-001 | Artifact Presence（spec + PipelineInvariants module） |
| VP-002 | Every PI-1…PI-13 represented with frozen wording |
| VP-003 | No expansion / validation / failure-classification algorithms |
| VP-004 | No runtime / scheduling / engine / execution semantics |
| VP-005 | Read-only / immutable contract registry |
| VP-006 | Responsibility boundaries（20.9.x / 21.0 / 21.1 preserved） |
| VP-007 | orchestration / runtime_execution unchanged |
| VP-008 | Typecheck / Jest / Architecture / Regression |

---

# 2. Methods

- `tests/workflow/pipeline_invariants.test.ts`
- `tests/workflow/architecture_constraints.test.ts`
- Existing 20.8〜21.1 regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Chapter 2+（Public Contract / Expansion / Validation / Failure Contract）  
Git Commit / Tag（unless separately requested）
