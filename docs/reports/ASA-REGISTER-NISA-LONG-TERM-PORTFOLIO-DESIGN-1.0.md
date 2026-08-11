# ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0

# NISA Long Term Portfolio Design — Registration

**Date:** 2026-08-03  
**Timestamp:** 2026-08-03T06:55:00+09:00  
**Target:** ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0  
**Title:** 新NISA 1800万円枠 長期ポートフォリオ設計記録  
**Status:** **APPROVED / REGISTERED — DESIGN VALIDATED（NOT EXECUTION AUTHORIZED）**  
**Request:** ASA-NISA-PORTFOLIO-DESIGN-REGISTRATION-REQUEST-1.0  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
**Investment Execution:** **NOT AUTHORIZED**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Implementation Freeze:** **NOT ISSUED**  
**Runtime Activation:** **NONE**

---

## Registration Decision

```text
Register ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0
as official ASA Knowledge / Design Record
（NISA長期運用設計 — Long Term Portfolio Design）
State: DESIGN VALIDATED
Investment Execution: NOT AUTHORIZED
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0.md`

---

## Why Design Record（not execution lock）

| Option | Decision |
|---|---|
| ASA-ARCH-* chapter | **REJECTED** |
| Investment execution authorization | **REJECTED** |
| Permanent semiconductor lock | **REJECTED** — philosophy explicitly temporary to 2031 review |
| Design / analysis record of allocation & schedule | **SELECTED** |

```text
ANALYSIS / DESIGN RECORD ONLY
≠ Trading authorization
≠ Binding execution plan
≠ Permanent theme lock
```

---

## Registered Allocation（Summary）

| Frame | Amount | Asset | Status |
|---|---:|---|---|
| つみたて | 6,000,000 | ニッセイNYSE FANG+ | 固定候補 |
| 成長 | 12,000,000 | 野村世界半導体 | 固定候補 |
| Schedule | 2027–2031 | 年360万（120+240） | 設計記録 |

---

## Registration Scope

| Element | Registered |
|---|---|
| NISA allocation design | YES |
| 2027–2031 contribution schedule | YES |
| Philosophy（not permanent semi lock） | YES |
| 2031+ review framework | YES |
| NISA reuse / staged rotation awareness | YES |
| Role split vs taxable PROTO100 | YES |
| Buy/sell execution rules | **NO** |
| Post-2031 replacement product lock | **NO** |

---

## Note on Incomplete Request Text

依頼原文 §9 は `REGISTER: - NISA allocation design -` で途切れていた。  
NOT REGISTER 側は依頼 Purpose（実行拘束なし）および既存ASA登録慣行で補完した。  
REGISTER 本体（配分・スケジュール・思想・再評価枠）は依頼本文 §2–§8 に従う。

---

## Connection to Related ASA Records

| Related ID | Connection |
|---|---|
| ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0 | CONNECTED — prior semiconductor judgment material |
| ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0 | CONNECTED — taxable Growth Asset（role-separated） |
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 | CONNECTED — taxable regime protocol（not NISA action） |

---

## Registration Constraints（Enforced）

```text
No Investment Execution Authorization
No Trading Authorization
No Future Return Guarantee
No Permanent Theme Lock
No ASA-ARCH-* Creation
No Existing Freeze Mutation
```

---

## Registration Verification

| Check | Result |
|---|---|
| Record Identity | **PASS** |
| Execution NOT AUTHORIZED | **PASS** |
| Allocation + schedule recorded | **PASS** |
| 2031 review framework recorded | **PASS** |
| Role split NISA vs Taxable recorded | **PASS** |

---

## Registration Complete

| Field | Value |
|---|---|
| Record ID | ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0 |
| Status | DESIGN VALIDATED |
| Investment Execution | NOT AUTHORIZED |
| NISA Total Design | 18,000,000（FANG+ 6M + Nomura Semi 12M） |
| Horizon | 2027–2031 contribution; 2031+ review |
