# ASA-REGISTER-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0

# LongTerm Swing Integrated Strategy Knowledge Record Registration

**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T18:01:00+09:00  
**Target:** ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Title:** LongTerm Swing Integrated Strategy Record  
**Status:** **APPROVED / REGISTERED — DESIGN VALIDATED（NOT IMPLEMENTATION FROZEN）**  
**Request:** ASA保存依頼 / LongTerm Swing Integrated Strategy Record  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Implementation Freeze:** **NOT ISSUED**  
**Investment Decision Status:** **DESIGN CANDIDATE ONLY**

---

## Registration Decision

```text
Register ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0
as official ASA Knowledge Record
（NISA / 特定口座統合運用設計 — LongTerm Strategy Architecture）
State: DESIGN VALIDATED
Implementation Frozen: NO
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md`

---

## Why Knowledge Record（not ASA-ARCH-* / not Implementation Freeze）

| Option | Decision |
|---|---|
| ASA-ARCH-* new chapter | **REJECTED** — design judgment preservation ≠ architecture evolution |
| Implementation Freeze | **REJECTED** — request explicitly states Implementation Frozenではない |
| Trading rule finalization | **REJECTED** — 売買ルール確定ではない |
| ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0 | **SELECTED** — request-specified strategy architecture record |
| Storage under `docs/baselines/` + `docs/reports/` | **SELECTED** — existing ASA document locations |

```text
Design Validated Knowledge Record
≠ Architecture Chapter
≠ Implementation Frozen
≠ Trading Authorization
≠ Product Selection Finalization
```

---

## Registration Scope

| Scope Element | Registered |
|---|---|
| Core philosophy（成長保有 + 警戒時一部スイング移動） | YES |
| Candidate model C_70_30 × dd15_ma200 | YES（design candidate） |
| Sensor philosophy + primary dd15_ma200 | YES |
| Integrated validation summary（+1.62% / ~13pt DD） | YES |
| Robustness summary（4/5 periods; 2016–2020 weakness） | YES |
| Design trade-offs | YES |
| Unresolved items list | YES |
| Connection to SWING-PROTOCOL-FREEZE-1.0 | YES |
| New trading rules / capital-transfer live rules | **NO** |
| Implementation Freeze | **NO** |
| Mutation of existing datasets / protocols | **NO** |
| Runtime activation | **NO** |

---

## Registration Constraints（Enforced）

```text
No Trading Rule Finalization
No Implementation Freeze Claim
No Live Capital Transfer Authorization
No Product Selection Finalization
No Future Return Guarantee
No Modification of Existing Protocols or Datasets
No Implementation Authorization
No Runtime Activation
No Architecture Chapter Creation
```

This registration preserves design judgment and validation evidence only.

---

## Evidence References（Read-only）

| Evidence | Path |
|---|---|
| Integrated Validation | `data/common_backtest/reports/longterm_swing_integrated_validation/` |
| Robustness Validation | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/` |
| Robustness Report | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/robustness_report.md` |
| Period Split | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/period_split.csv` |
| Allocation Sensitivity | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/allocation_sensitivity.csv` |
| Hysteresis Analysis | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/hysteresis_analysis.csv` |
| Regime Analysis | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/regime_analysis.csv` |
| Swing Component Record | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` |

Confirmed in evidence (summary):

- C_70_30 × dd15_ma200: after-tax CAGR vs BH +1.62%; MaxDD ~13pt better
- Period split win rate 4/5; weakness = 2016–2020-type rebound
- Hysteresis 10/20/40 and allocation 80/20–50/50 remain operable; 70/30 is philosophy–performance intersection

---

## Connection to Related ASA Records

| Related ID | Connection State |
|---|---|
| ASA-BASELINE-INVESTMENT-DECISION-V1.0-001 | **CONNECTED** — parent design knowledge |
| ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0 | **CONNECTED** — LT product analysis（selection still open） |
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED** — swing sleeve validated component |
| Medium/Long × Swing design candidate | **CONNECTED** — this record |
| Integrated Operations Protocol freeze | **NOT CONNECTED** — Implementation Frozen = NO |
| Live trading authorization | **NOT CONNECTED** |

---

## Handoff State（Next Process）

```text
Handoff READY for:
  1. Product selection linkage（NISA / taxable LT sleeves）
  2. Operational judgment memo（esp. 2016–2020-type regimes）
  3. Optional sensor auxiliaries
  4. Separate request if Implementation Freeze is desired
```

```text
Next process = design refinement / product linkage
≠ immediate trading authorization
≠ automatic freeze
```

---

## Registration Verification

| Check | Result |
|---|---|
| Record Identity | **PASS** — ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0 |
| Classification | **PASS** — LongTerm Strategy Architecture / DESIGN VALIDATED |
| Domain | **PASS** — NISA / 特定口座統合運用設計 |
| Storage Location | **PASS** — `docs/baselines/` + `docs/reports/` |
| Not Implementation Frozen | **PASS** |
| No Trading Rules Finalized | **PASS** |
| No Existing Protocol Mutation | **PASS** |
| Evidence Linked Read-only | **PASS** |
| Implementation Not Authorized | **PASS** |
| Related Records Linked | **PASS** |

---

## ASA Minimum Runtime Records

| Role | id | type | hash |
|---|---|---|---|
| Decision | `bf1e459f-ede9-4634-8542-fc6f04d0db76` | Decision Record | `49d59981554a8aabe152ac133c3a277048462033fbda5df166727ad9135fda89` |
| Verification | `0f7f8fbc-cb46-42e3-87e6-f5e102f8b69f` | Verification Record | `c0121d996f1e468ebfc7e7be125589640a8e704ae51f13be5adb686ac45c233c` |

Paths:

- `data/asa_minimum_runtime/records/bf1e459f-ede9-4634-8542-fc6f04d0db76.json`
- `data/asa_minimum_runtime/records/0f7f8fbc-cb46-42e3-87e6-f5e102f8b69f.json`

---

## Closing

```text
REGISTERED
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
Git-managed paths under docs/baselines and docs/reports
Runtime Records: CREATED
Existing datasets/protocols: UNCHANGED
Commit requires separate human request
```
