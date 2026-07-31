# ASA-ARCH-21.2 Verification Plan — Chapter 3 (Expansion Rules)

**Target:** Expansion Rules Draft 0.2（Chapter 3 only）  
**Parents:** ASA-ARCH-20.8〜21.1 / ASA-ARCH-21.2 Chapter 1–2（Frozen — unchanged）

---

# 1. Scope

| ID | Item |
|---|---|
| VP-301 | Artifact Presence |
| VP-302 | Every ER-1…ER-15 represented with frozen wording |
| VP-303 | Principles / Boundary / Structural / Composition / Validity coverage |
| VP-304 | No expansion engine / algorithm / cycle detection / graph construction |
| VP-305 | Read-only / deterministic registry |
| VP-306 | Preserves PI-* / PD-*; WorkflowBuilder boundary declarative only |
| VP-307 | orchestration / runtime_execution unchanged |
| VP-308 | Typecheck / Jest / Architecture / Regression |

---

# 2. Methods

- `tests/workflow/expansion_rules.test.ts`
- `tests/workflow/architecture_constraints.test.ts`
- Existing 20.8〜21.2 Ch1–Ch2 regression
- `npm run typecheck` / `npm test`

---

# 3. Out of Scope

Chapter 4+（Validation / Failure Contract）  
Git Commit / Tag（unless separately requested）
