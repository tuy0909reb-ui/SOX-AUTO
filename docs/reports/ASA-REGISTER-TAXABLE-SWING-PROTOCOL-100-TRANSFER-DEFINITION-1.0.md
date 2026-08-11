# ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0

# Taxable Swing Protocol 100% Transfer Definition — Registration

**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T23:20:00+09:00  
**Target:** ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
**Title:** 特定口座局面運用 Swing Protocol 100%移管定義確認  
**Status:** **APPROVED / REGISTERED — KNOWLEDGE CONFIRMED**  
**Request:** ASA-RECORD-REQUEST / KNOWLEDGE / DESIGN CONFIRMATION  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Architecture Change:** **NONE**  
**Swing Freeze Mutation:** **NONE**

---

## Registration Decision

```text
Register ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0
State: CONFIRMED / RECORDED
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0.md`

---

## Confirmed Answers（Request Checklist）

| # | Item | Result |
|---|---|---|
| 1A | Alert時 Swing Protocol 100%か | **YES** |
| 1B | 282A単独100%か | **NO** |
| 1C | 袖内 1570/282A/CASH か | **YES** |
| 2 | CASE_C_PROTO100構成 | Normal=野村100% / Alert=Swing100% / Re-entry=野村100% |
| 3 | FREEZE vs LONGTERM境界 | Component vs Integrated parent — recorded |
| 4 | C_70_30位置付け | **Alert時部分移管**（非AlertはLT100%） |
| 5 | 今後の比較軸 | BH / Swing100% / Swing部分（70/30等） |

---

## Non-Authorization

```text
NOT authorized:
  - implementation
  - trading
  - ASA-ARCH mutation
  - Swing Freeze content change
  - dd15_ma200 / Re-entry change
```

---

## Registration Complete

| Field | Value |
|---|---|
| Record ID | ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0 |
| Formal name | Swing Protocol 100%移管 |
| Validation ID | CASE_C_PROTO100 |
| Legacy alias | 既存プロトコル100% |
