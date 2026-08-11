# ASA Minimum Runtime v0.1 Baseline

**Baseline ID:** ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001  
**Status:** **ESTABLISHED**  
**Version:** v0.1  
**Date:** 2026-08-01  
**Timestamp:** 2026-08-01T16:56:00+09:00  
**Authority:** HUMAN_ARCHITECT  

---

## Reference

| Artifact | Path | Status |
|---|---|---|
| Completion Report | `docs/reports/ASA-COMPLETE-MINIMUM-RUNTIME-V0.1-001.md` | COMPLETE |
| Acceptance | `docs/reports/ASA-ACCEPT-MINIMUM-RUNTIME-V0.1-001.md` | PASS |
| Implementation Plan | `docs/specs/asa_minimum_runtime_v0_1_implementation_plan.md` | COMPLETE |

```text
Reference: ASA-COMPLETE-MINIMUM-RUNTIME-V0.1-001
```

---

## Scope

```text
src/asa_minimum_runtime/
```

### Included

- RuntimeRecord
- HashService
- JsonFileStorage
- HistoryService
- VerifyService
- CLI（`status` / `record` / `history` / `verify`）

### Excluded

- `architecture_*`
- `runtime_execution`
- Investment Decision Logic
- AI Decision
- Web Interface
- Database

---

## Verification（Baseline Establishment）

| Gate | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS |
| Existing Architecture | UNCHANGED |
| Runtime source（this registration） | UNCHANGED |

---

## Baseline Purpose

```text
Future Runtime Extension Reference Point
```

Future Runtime evolution SHALL use this baseline as the comparison point.

Any extension requires:

```text
New plan
Review
Authorization
Implementation
Verification
```

This baseline does **not** create an ASA Architecture Chapter.  
This baseline does **not** authorize Architecture modification.

---

## Package Marker

| Field | Value |
|---|---|
| packageId | `asa_minimum_runtime` |
| version | `0.1.0` |
| recordContractVersion | `1.0` |
| hashAlgorithm | `sha256` |
| storageFormat | `json` |
| historyFormat | `jsonl` |
| defaultDataRoot | `data/asa_minimum_runtime` |
| CLI entry | `npm run asa -- <command>` |

---

## Final Status

```text
ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001

ASA Minimum Runtime v0.1

Baseline:

ESTABLISHED
```

---

## Additive Note（non-mutating）

v0.1.1 usability enhancement（templates / metadata / `asa show`）is documented in:

```text
docs/reports/ASA-COMPLETE-MINIMUM-RUNTIME-V0.1.1-001.md
```

This baseline remains **ESTABLISHED** / **PRESERVED**. Package marker may report `0.1.1`; Record contract version remains `1.0`.

---

# End of Baseline Record
