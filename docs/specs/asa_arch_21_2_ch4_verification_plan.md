# ASA-ARCH-21.2 Verification Plan — Chapter 4 (Validation)

**Target:** Validation Draft 0.2（Chapter 4 only）  
**Parents:** ASA-ARCH-20.8〜21.1 / ASA-ARCH-21.2 Chapter 1–3（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-401 | Artifact Presence |
| VP-402 | Every VL-1…VL-20 represented with frozen wording |
| VP-403 | Principles / Boundary / Pipeline / Workflow / Classification coverage |
| VP-404 | No validation engine / algorithm / expansion / graph / cycle detection impl |
| VP-405 | Read-only / deterministic registry |
| VP-406 | Preserves PI-* / PD-* / ER-*; outcome classification only |
| VP-407 | orchestration / runtime_execution unchanged |
| VP-408 | Typecheck / Jest / Architecture / Regression |

---

# 2. Methods

- `tests/workflow/validation_contracts.test.ts`
- `tests/workflow/architecture_constraints.test.ts`
- Existing 20.8〜21.2 Ch1–Ch3 regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Chapter 5（Failure Contract）  
Git Commit / Tag（unless separately requested）
