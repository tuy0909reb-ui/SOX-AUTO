# ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0

# Taxable Nomura + Swing Protocol 100% Transfer Strategy — Registration

**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T23:50:00+09:00  
**Target:** ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
**Title:** 特定口座 野村世界半導体 + Swing Protocol 100%移管 設計判断記録  
**Status:** **APPROVED / REGISTERED — DESIGN VALIDATED（NOT IMPLEMENTATION FROZEN）**  
**Request:** ASA-RECORD-REQUEST / KNOWLEDGE / DESIGN RECORD  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Implementation Freeze:** **NOT ISSUED**  
**Swing Freeze Mutation:** **NONE**

---

## Registration Decision

```text
Register ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0
as official ASA Knowledge Record
（特定口座局面運用設計 — LongTerm Growth Asset + Swing Integration）
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md`

---

## Why Knowledge Record（not ASA-ARCH-* / not Implementation Freeze）

| Option | Decision |
|---|---|
| ASA-ARCH-* new chapter | **REJECTED** — design judgment preservation ≠ architecture evolution |
| Implementation Freeze | **REJECTED** — explicitly not requested |
| Trading / capital-transfer authorization | **REJECTED** |
| Modify ASA-SWING-PROTOCOL-FREEZE-1.0 | **REJECTED** |
| Design Validation Knowledge Record | **SELECTED** |

```text
Design Validated Knowledge Record
≠ Architecture Chapter
≠ Implementation Frozen
≠ Trading Authorization
≠ Freeze Mutation
```

---

## Registration Scope

| Scope Element | Registered |
|---|---|
| PROTO100 integrated architecture（Normal / Alert / Re-entry） | YES |
| Connection to ASA-SWING-PROTOCOL-FREEZE-1.0 | YES（CONNECTED COMPONENT） |
| Durability evidence summary（+3.95億 / +3.93pt / 4/5） | YES |
| Design objective YES/NO | YES |
| Trade-offs as design costs | YES |
| Distinction from C_70_30 | YES |
| Live capital / trading rules | **NO** |
| Implementation Freeze | **NO** |
| Existing Freeze content change | **NO** |

---

## Evidence References（Read-only）

| Evidence | Path |
|---|---|
| Durability validation | `data/common_backtest/reports/nomura_proto100_durability_validation/` |
| Durability report | `.../durability_validation_report.md` |
| Ratio optimization | `data/common_backtest/reports/nomura_swing_transfer_ratio_optimization/` |
| 282A rotation（negative control） | `data/common_backtest/reports/nomura_282A_rotation_validation/` |
| Definition record | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0.md` |

Confirmed in evidence (summary):

- After-tax final 9.68億 vs BH 5.73億（+3.95億）; CAGR +3.93pt
- Period split 4/5; weakness = 2017–2020-type rebound / reentry lag
- MaxDD not guaranteed to improve vs BH（recorded trade-off）
- Durability judgment: 採用候補（耐久性確認）

---

## Connection to Related ASA Records

| Related ID | Connection State |
|---|---|
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0 | **CONNECTED** — naming/definition |
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED COMPONENT** |
| ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0 | **Parent Design Reference** |
| C_70_30 | **Alternative Partial Transfer**（separate model） |
| Integrated Operations Protocol freeze | **NOT CONNECTED** |
| Live trading authorization | **NOT CONNECTED** |

---

## Registration Constraints（Enforced）

```text
No Trading Rule Finalization
No Implementation Freeze Claim
No Live Capital Transfer Authorization
No Modification of ASA-SWING-PROTOCOL-FREEZE-1.0
No dd15_ma200 / Re-entry Mutation
No Implementation Authorization
No Runtime Activation
No Architecture Chapter Creation
```

---

## Handoff State（Next Process）

```text
Handoff READY for:
  1. Operational judgment memo（2017–2020-type regimes）
  2. Optional total-PF linkage with NISA fixed sleeves
  3. Separate request if Implementation Freeze is desired
```

```text
Next process = design refinement / ops memo
≠ immediate trading authorization
≠ automatic freeze
```

---

## Registration Verification

| Check | Result |
|---|---|
| Record Identity | **PASS** — ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 |
| Classification | **PASS** — DESIGN VALIDATED / Implementation Frozen = NO |
| Domain | **PASS** — 特定口座局面運用設計 |
| Evidence linked | **PASS** — durability + ratio + rotation |
| Freeze untouched | **PASS** |
| Trading not authorized | **PASS** |

---

## Registration Complete

| Field | Value |
|---|---|
| Record ID | ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 |
| Status | DESIGN VALIDATED |
| Model | CASE_C_PROTO100 / Swing Protocol 100%移管 |
| Implementation Frozen | NO |
| Trading Authorization | NOT AUTHORIZED |
