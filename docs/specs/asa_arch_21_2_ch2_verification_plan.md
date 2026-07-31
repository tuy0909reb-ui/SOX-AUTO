# ASA-ARCH-21.2 Verification Plan — Chapter 2 (Public Contract)

**Target:** PipelineDefinition Public Contract Draft 0.2（Chapter 2 only）  
**Parents:** ASA-ARCH-20.8〜21.1 / ASA-ARCH-21.2 Chapter 1（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-201 | Artifact Presence（spec + Public Contract modules） |
| VP-202 | Every PD-1…PD-13 represented with frozen wording |
| VP-203 | Recognized Structural Elements initial set |
| VP-204 | No expansion / validation / failure / runtime algorithms |
| VP-205 | Read-only / deterministic contract surfaces |
| VP-206 | Subordinates to PI-1…PI-13; 21.1 PipelineDefinition untouched |
| VP-207 | orchestration / runtime_execution unchanged |
| VP-208 | Typecheck / Jest / Architecture / Regression |

---

# 2. Methods

- `tests/workflow/pipeline_public_contract.test.ts`
- `tests/workflow/architecture_constraints.test.ts`
- Existing 20.8〜21.2 Ch1 regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Chapter 3+（Expansion Rules / Validation / Failure Contract）  
Git Commit / Tag（unless separately requested）
