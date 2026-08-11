# ASA Runtime Operation Definition v0.1
# Draft 0.2 — APPROVED

Status: **APPROVED**  
Version: v0.1  
Document Revision: Draft 0.2  
Approval: ASA-APPROVE-RUNTIME-OPERATION-DEFINITION-V0.1-001  
Date: 2026-08-01  
Authority: HUMAN_ARCHITECT  

Purpose:

Define the operational usage rules for ASA Minimum Runtime v0.1.

This document does not modify ASA Architecture.  
This document does not define new Runtime implementation.

Scope:

ASA Minimum Runtime v0.1 Baseline

Reference:

- `ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001`
- `ASA-COMPLETE-MINIMUM-RUNTIME-V0.1-001`

Classification: **Operational Governance**

---

# 1. Overview

ASA Minimum Runtime v0.1 provides:

- Record creation
- JSON persistence
- Hash integrity
- History tracking
- Verification

The Runtime responsibility is:

```text
Create, preserve, and verify records containing
decisions, evidence, and verification history.
```

The Runtime does not perform:

- Decision making
- Investment judgement
- AI judgement
- Automated execution
- Strategy optimization

---

# 2. Operational Principle

ASA Record follows:

```text
Decision / Event
        |
        v
Record Creation
        |
        v
Evidence Attachment
        |
        v
Hash Generation
        |
        v
Storage
        |
        v
Verification
```

The purpose is reproducibility and traceability.

ASA preserves records of decisions and events.

ASA does not generate decisions.

---

# 3. Record Types

Initial supported operational types:

---

## 3.1 Architecture Record

Purpose:

Record architecture decisions, milestones, and frozen states.

Example:

```text
ASA Minimum Runtime v0.1 Completion
```

Required:

- title
- content
- evidence

---

## 3.2 Implementation Record

Purpose:

Record implementation activities.

Example:

```text
Phase 1 Hash Service Implementation
```

Required:

- title
- content
- evidence

Evidence examples:

- changed files reference
- test result
- build result

---

## 3.3 Verification Record

Purpose:

Record verification results.

Priority: **HIGH**

Example:

```text
Backtest Verification Result
Runtime Acceptance Result
```

Required:

- title
- verification target
- verification method
- expected criteria
- result
- evidence

Evidence examples:

- dataset reference
- script version
- execution result
- hash

Verification Record example:

```text
Target: SOX Protocol
Method: Historical simulation
Expected criteria: Defined acceptance condition
Result: PASS
```

---

## 3.4 Decision Record

Purpose:

Record important human decisions.

Example:

```text
Architecture direction selection
Investment strategy review
```

Required:

- decision
- rationale
- evidence

Boundary:

ASA records decision history.

ASA does not generate investment decisions.

---

# 4. Evidence Policy

Evidence represents the basis supporting a Record.

Evidence may include:

```text
File path
Document reference
Test result
Execution result
Dataset reference
Hash
External source reference
```

Evidence is descriptive.

ASA does not evaluate evidence quality automatically.

Evidence responsibility belongs to the Record creator.

---

# 5. Record Creation Timing

Record should be created at:

## Architecture

- Major design decision
- Freeze
- Baseline creation

## Implementation

- Phase completion
- Acceptance result
- Important implementation decision

## Verification

- Test completion
- Experiment result
- Backtest result

## Decision

- Strategic choice
- Direction change

Record creation is not required for:

- Routine execution without significance
- Temporary experiments without retained value
- Intermediate work logs without future reference

---

# 6. Verification Operation

Verification confirms:

```text
Record exists
        +
Canonical representation remains unchanged
        +
Stored hash matches calculated hash
```

Verification result:

PASS:

```text
Record integrity confirmed
```

FAIL:

```text
Record integrity violation detected
```

ASA verification does not modify records.

---

# 7. History Operation

History is append-oriented.

Rules:

- Existing records are immutable
- New events append new records
- Previous records are not overwritten

Correction policy:

Corrections are performed by creating a new Record.

Existing records are preserved.

History purpose:

Maintain chronological trace.

---

# 8. PFOS Integration Boundary

Future integration may connect:

```text
PFOS Decision System
        |
        v
ASA Record Creation
        |
        v
Evidence / Verification Storage
```

Current policy:

No direct integration.

Reason:

ASA remains an independent evidence and traceability layer.

Future integration must preserve:

```text
PFOS: Decision generation
ASA: Record preservation and verification
```

---

# 9. Runtime Extension Policy

ASA Minimum Runtime v0.1 is the baseline.

Future extensions require:

```text
Operational need identified
        ↓
Extension proposal
        ↓
Impact analysis
        ↓
Authorization
        ↓
Implementation
```

Examples of possible future extensions:

- Export
- Search
- Metadata
- Snapshot

No extension is added without operational necessity.

---

# 10. Governance Boundary

ASA Runtime Operation Definition does not override:

- ASA Architecture Freeze
- ASA Runtime Baseline
- Existing Contracts
- Existing Verification Records

Operational rules must remain within established Architecture and Runtime boundaries.

---

# 11. Version Policy

Operation Definition version is independent from Runtime version.

Example:

```text
Runtime: ASA Minimum Runtime v0.1
Operation Definition: ASA Runtime Operation Definition v0.1
```

Version numbers may evolve independently.

---

# 12. Current Operational State

```text
Architecture: FROZEN（ASA-ARCH-50.0）
Minimum Runtime: COMPLETE
Baseline: ESTABLISHED（ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001）
Operation Definition: APPROVED（Draft 0.2）
```

Positioning:

```text
ASA-ARCH-50.0
        |
        v
Architecture

ASA Minimum Runtime v0.1
        |
        v
Baseline

ASA Runtime Operation Definition v0.1
        |
        v
Operational Governance
```

---

# 13. Operational Readiness

```text
DRAFT
 ↓
APPROVED
 ↓
運用開始可能状態
```

This approval establishes **運用開始可能状態** for operational guideline use.

It does not authorize Runtime feature changes or Architecture changes.

Initial Record creation remains a separate operational action（Option C）.

---

# End of ASA Runtime Operation Definition v0.1（APPROVED）
