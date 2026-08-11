# ASA Runtime Operational Trial v0.1

**Status:** **ACTIVE**  
**Version:** v0.1  
**Date:** 2026-08-01  
**Runtime:** ASA Minimum Runtime v0.1.1  
**Authority:** HUMAN_ARCHITECT  
**Start Report:** `docs/reports/ASA-OP-TRIAL-START-V0.1-001.md`  
**Observation Log:** `docs/reports/asa_runtime_operational_trial_observation_log_v0_1.md`  


---

## Purpose

Validate practical usability, Record quality, and operational workflow of ASA Minimum Runtime v0.1.1.

This trial does **not** add new Runtime functionality.

ASA is exercised as:

```text
Decision Record System
+ Evidence Preservation System
+ Verification History System
```

---

## Reference State at Start

| Item | State |
|---|---|
| Architecture | FROZEN（ASA-ARCH-50.0-FROZEN） |
| Minimum Runtime | v0.1.1 COMPLETE |
| Baseline | ESTABLISHED / PRESERVED |
| Operation Governance | APPROVED |
| Initial Records | ESTABLISHED |

---

## ASA Responsibility During Trial

ASA **does**:

- Preserve decision history
- Preserve evidence references
- Preserve verification results
- Maintain immutable records

ASA **does not**:

- Generate decisions
- Recommend investments
- Optimize strategies
- Predict markets
- Execute transactions

Boundary:

```text
PFOS / Human: Analysis → Judgement → Decision
ASA:          Record → Evidence → Verification → History
```

ASA remains a **Decision Preservation Layer**, not a Decision Generation Layer.

---

## Trial Scope（operational use cases）

### 3.1 Investment Policy Records

Preserve human investment policy decisions, allocation rationale, strategy changes, and long-term assumptions.

Examples: NISA policy, semiconductor allocation, portfolio structure review.

### 3.2 Research / Verification Records

Preserve backtest / protocol validation / analysis / experiment outcomes as Verification Records.

Examples: SOX protocol verification, ETF comparison analysis.

### 3.3 Development Records

Preserve ASA / protocol / implementation milestones.

Example: Runtime enhancement evaluation（v0.1.1）.

---

## Record Policy

Use existing types only:

```text
Architecture Record
Implementation Record
Verification Record
Decision Record
```

Use templates where applicable. Use metadata when useful:

```json
{
  "tags": [],
  "relatedRecords": [],
  "source": ""
}
```

---

## Trial Rules

**Allowed:** create Records; attach evidence references; verify; observe usability.

**Not allowed:** Runtime feature expansion; schema redesign; hash change; storage migration; Architecture modification.

**Issue handling:**

```text
Need identified → Record issue → Evaluate necessity → Future extension proposal
```

Missing capabilities（search, export, snapshot, backup, relationship visualization）are **observations only** during this trial.

---

## Observation Areas

| Area | Evaluate |
|---|---|
| Record Creation | required fields, template usability, evidence attachment |
| History | traceability, related-record navigation, retrieval |
| Verification | frequency, burden, integrity confirmation |
| Missing Capability | observations only（no implementation in trial） |

---

## Completion Criteria

Trial completes when:

```text
Operational Records created
+ Real usage experience collected
+ Improvement candidates identified
+ No critical Runtime issues detected
```

Output at completion:

```text
ASA Runtime Operational Trial Report v0.1
```

---

## Expected State（after start）

```text
Architecture: FROZEN
Minimum Runtime: v0.1.1 COMPLETE
Baseline: ESTABLISHED
Operation Governance: APPROVED
Operational Trial: ACTIVE
```

---

# End of Operational Trial Definition
