# ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0

# NISA Long-Term Portfolio Decision — Registration

**Date:** 2026-08-10  
**Timestamp:** 2026-08-10T17:39:00+09:00  
**Target:** ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0  
**Title:** NISA LONG-TERM PORTFOLIO DECISION RECORD  
**Status:** **APPROVED / REGISTERED — DECISION RECORDED（NOT EXECUTION AUTHORIZED）**  
**Request:** ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-REGISTRATION-REQUEST-1.0  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous / Related Records:**  
- ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
- ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
**Investment Execution:** **NOT AUTHORIZED**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Implementation Freeze:** **NOT ISSUED**  
**Runtime Activation:** **NONE**

---

## Registration Decision

```text
Register ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0
as official ASA Decision Record
（NISA Long-Term Portfolio Decision）
State: DECISION REGISTERED
Investment Execution: NOT AUTHORIZED
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0.md`

---

## Why Decision Record（not ranking / not execution）

| Option | Decision |
|---|---|
| Product CAGR ranking baseline | **REJECTED** |
| Investment execution authorization | **REJECTED** |
| Permanent semiconductor theme lock | **REJECTED** |
| NISA↔FORTRESS role-separated portfolio decision | **SELECTED** |

```text
DECISION RECORD
≠ Trading authorization
≠ Product league table
≠ Permanent theme lock
```

---

## Registered Decision（Summary）

| Frame | Amount | Asset | Role |
|---|---:|---|---|
| つみたて | 6,000,000 | FANG+系 | 大型成長株コア |
| 成長 | 12,000,000 | 野村世界半導体 | 半導体成長サイクル集中 / 期待値最大化 |

**Rejected now:**

| Alternative | Reason (recorded) |
|---|---|
| 野村900 + 情報エレ300 | 分散は確認（CAGR〜−1.4pt / MDD〜+1.5pt）だが、期待値低下を許容するほどの低減ではない |
| メガ10 / S&P500 Top10 | FANG+と重複大。独立リスク源泉として弱い |

**Grounds:** 20年超 / 緊急資金でない / FORTRESS側でリスク管理 / 半導体サイクル仮説（時限的）

**Re-eval triggers:** 半導体仮説崩壊 / 競争優位変化 / NISA集中リスク許容超過

---

## Registration Scope

| Element | Registered |
|---|---|
| Adopted NISA allocation (600/1200) | YES |
| Role split NISA vs FORTRESS | YES |
| Rejection of Info-Elec 300 mix (current) | YES |
| Rejection of Mega10 / Top10 as diversifiers | YES |
| Re-evaluation triggers | YES |
| Broker execution / auto trading | NO |
| ASA-ARCH-* chapter | NO |
| Freeze of taxable PROTO100 | NO |

---

## Evidence Linked

| Evidence | Path |
|---|---|
| Decision Record | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0.md` |
| Prior Design Record | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0.md` |
| Info complementarity | `scratch/nisa_7fund_comparison_001/reports/info_electronics_complementarity_check.md` |
| Full PF comparison | `scratch/nisa_7fund_comparison_001/reports/nisa_full_pf_comparison_report.md` |
| Pre-decision verification | `scratch/nisa_7fund_comparison_001/reports/investment_decision_analysis_003_verification.md` |

---

## Runtime Records

| Type | ID |
|---|---|
| Decision Record | `f6d40001-ede9-4634-8542-fc6f04d0db80` |
| Verification Record | `f6d40002-cb46-42e3-87e6-f5e102f8b673` |

---

## Post-Registration State

```text
Record: ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0
State: DECISION REGISTERED
Investment Execution: NOT AUTHORIZED
Implementation Frozen: NO
Runtime Activation: NONE
```

Registration complete.
