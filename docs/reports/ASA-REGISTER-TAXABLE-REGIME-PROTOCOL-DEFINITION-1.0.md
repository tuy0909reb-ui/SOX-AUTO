# ASA-REGISTER-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0

# Taxable Regime Protocol Definition Confirmation — Registration

**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T22:40:00+09:00  
**Target:** ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0  
**Title:** 特定口座局面運用プロトコル定義確認  
**Status:** **APPROVED / REGISTERED — KNOWLEDGE CONFIRMED（NOT IMPLEMENTATION FROZEN）**  
**Request:** ASA-RECORD-REQUEST / KNOWLEDGE CONFIRMATION  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Architecture Change:** **NONE**

---

## Registration Decision

```text
Register ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0
as ASA Knowledge / Design Record
State: CONFIRMED / RECORDED
Implementation Frozen: NO
Architecture mutation: NONE
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0.md`

---

## Why Knowledge Record（not Architecture / not Freeze）

| Option | Decision |
|---|---|
| ASA-ARCH-* chapter | **REJECTED** — definition confirmation ≠ architecture evolution |
| Change dd15_ma200 / Re-entry | **REJECTED** — explicitly prohibited |
| Replace C_70_30 design candidate | **REJECTED** — PROTO100 is a separate benchmark model |
| Implementation Freeze | **REJECTED** — confirmation only |
| Knowledge definition record | **SELECTED** |

---

## Confirmed Content Checklist

| Item | Confirmed |
|---|---|
| 「既存プロトコル100%」正式名 = `CASE_C_PROTO100` | YES |
| 移管先 = スイング袖100%（≠282A単純保有） | YES |
| Exit = `dd15_ma200` | YES（変更なし） |
| Re-entry = OFF + RSI14>=50 × 20日 | YES（変更なし） |
| BULL = 野村100% | YES |
| RANGE = スイング袖 | YES |
| BEAR sleeve | NOT DEFINED |
| 282A full-park | REJECTED |
| 282A swing-component role | RETAINED |
| Standard axis = 野村BH vs 野村+PROTO100 | YES |
| Distinction from `C_70_30` | YES |

---

## Evidence Linked（Read-only）

| Evidence | Path |
|---|---|
| 282A rotation validation | `data/common_backtest/reports/nomura_282A_rotation_validation/` |
| Exit protocol allocation | `data/common_backtest/reports/nomura_exit_protocol_allocation_validation/` |
| Re-entry precision | `data/common_backtest/reports/longterm_growth_end_reentry_precision_validation/` |

---

## Non-Authorization Statement

```text
This registration does NOT authorize:
  - live trading
  - capital transfer automation
  - product selection finalization
  - ASA Architecture revision
  - Exit / Re-entry parameter changes
```

---

## Registration Complete

| Field | Value |
|---|---|
| Record ID | ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0 |
| Status | CONFIRMED / RECORDED |
| Benchmark model | CASE_C_PROTO100（既存プロトコル100%） |
| Comparison axis | Nomura BH vs Nomura + PROTO100 |
