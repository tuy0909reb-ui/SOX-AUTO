# ASA-REGISTER-ARCH-37.0-001

**Title:** Architecture Registration — ASA-ARCH-37.0 ASA-CONNECT External Integration Boundary Layer  
**Target:** ASA-ARCH-37.0 — ASA-CONNECT External Integration Boundary Layer  
**Draft:** 0.3  
**Status:** **REGISTERED / FREEZE COMPLETE**  
**Date:** 2026-07-30  
**Registration ID:** ASA-REGISTER-ARCH-37.0-001  
**Implementation Request:** ASA-IMPL-REQ-ARCH-37.0-001  
**Dependency:** ASA-ARCH-34.0 / 35.0 / 35.1 / 36.0 FROZEN  
**Freeze Authorization:** ASA-FREEZE-ARCH-37.0-001（COMPLETE）

────────────────────────────────

## Registration Decision

ASA-ARCH-37.0 Draft 0.3 is hereby registered as the second Extension Domain
Architecture（ASA-CONNECT External Integration Boundary Layer） following
Frozen ASA-OPS（ASA-ARCH-36.0） and Frozen Extension Development Framework
（ASA-ARCH-35.1）.

Chapter 37 provides External Integration Boundary without mutating Core,
Governance, Framework, or OPS contracts.

────────────────────────────────

## Architectural Position

```
ASA Core (ARCH-34.0 Frozen)
        |
Extension Governance Layer (ARCH-35.0 Frozen)
        |
Extension Development Framework (ARCH-35.1 Frozen)
        |
ASA-OPS (36.0 Frozen)     ASA-CONNECT (37.0)
```

────────────────────────────────

## Registration Guarantees

| Guarantee | Result |
|---|---|
| ASA-ARCH-34.0 Core unchanged | CONFIRMED |
| ASA-ARCH-35.0 Governance unchanged | CONFIRMED |
| ASA-ARCH-35.1 Framework unchanged | CONFIRMED |
| ASA-ARCH-36.0 OPS unchanged | CONFIRMED |
| Authority fixed to REQUESTER（≠ Execution） | CONFIRMED |
| Connector / Data / Transform / Route / Auth / Error / Guard / Outbound / Lifecycle defined | CONFIRMED |
| Capability Separation / Secret Ownership Separation | CONFIRMED |
| No runtime / networking semantics in CONNECT package | CONFIRMED |
| ASA-AI not started | CONFIRMED |

────────────────────────────────

## Registered Artifacts

| Kind | Path |
|---|---|
| Specification | `docs/specs/asa_arch_37_0_asa_connect.md` |
| Traceability Mapping | `docs/specs/asa_arch_37_0_mapping.md` |
| Source Package | `src/extensions/asa_connect/` |
| Tests | `tests/extensions/asa_connect/` |
| Verification Report | `docs/reports/ASA-VERIFY-ARCH-37.0-001.md` |
| This Registration | `docs/reports/ASA-REGISTER-ARCH-37.0-001.md` |

────────────────────────────────

## Registration Status

```text
ASA-ARCH-37.0
Status: FROZEN
Registration: ASA-REGISTER-ARCH-37.0-001
Verification: ASA-VERIFY-ARCH-37.0-001
Freeze: COMPLETE（ASA-FREEZE-ARCH-37.0-001）
```

Git Commit / Tag: NOT ISSUED
