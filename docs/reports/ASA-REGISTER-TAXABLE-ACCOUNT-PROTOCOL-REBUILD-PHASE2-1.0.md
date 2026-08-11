# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE2-1.0

# Taxable Account Protocol Rebuild Phase 2 — Registration

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:39:00+09:00  
**Target:** ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0  
**Title:** 特定口座運用プロトコル再構築 Phase 2（Detailed Specification）  
**Status:** **APPROVED / REGISTERED — DESIGN PHASE COMPLETE（NOT RUNTIME）**  
**Parent:** ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0  
**Legacy Boundary:** ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Code Change:** **NONE**

---

## Registration Decision

```text
Register Phase 2 detailed specification + JSON schema drafts.
Design only. No Legacy / Discord / Runtime / Backtest mutation.
```

| Artifact | Path |
|---|---|
| Detailed Spec | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0.md` |
| State Schema | `docs/schemas/taxable_account_state.schema.json` |
| ViewModel Schema | `docs/schemas/taxable_account_viewmodel.schema.json` |
| This Registration | `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE2-1.0.md` |

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Regime State Machine定義 | **PASS** |
| 2 | Asset Selection独立仕様 | **PASS** |
| 3 | Position State Machine定義 | **PASS** |
| 4 | 1570 Risk が Position層として分離 | **PASS** |
| 5 | State が SoT として定義 | **PASS** |
| 6 | Discord が ViewModel投影 | **PASS** |
| 7 | Legacy依存なしで説明可能 | **PASS** |

```text
PHASE 2 = COMPLETE (detailed design)
PHASE 3 = NOT STARTED (sensor/backtest re-implementation under New specs)
```

---

## Design Highlights

| Topic | Decision |
|---|---|
| Regime states | GROWTH_ACTIVE / EXIT_PENDING / SWING_ACTIVE / REENTRY_PENDING |
| Swing asset priority | crash_15 → 1570 → else semi_signal → 282A → else CASH |
| Position states | WAIT / WATCH / ENTRY_READY / POSITION_ACTIVE / EXIT / REENTRY_WAIT |
| 1570 Risk | `stop_price = entry_price × 0.85`; status ACTIVE = RISK_CONTROL_ACTIVE mode |
| SoT | `TaxableAccountState` persistent vs derived vs events separated |
| Discord | `TaxableAccountViewModel` projection only; no Legacy embed patching |

---

## Explicit Non-Actions

- No code changes
- No Legacy edits
- No Discord edits
- No runtime activation
- No backtest engine changes
- No Growth / Entry / Sensor semantic changes

---

## Next Authorized Design/Build Step

```text
Phase 3 (requires explicit go-ahead):
  - Re-implement Market Detection semantics under New package
  - Validate State transitions via New backtest entrypoints
  - Keep Legacy runners for reproducibility only
```
