# Changelog

All notable architecture and platform changes for Auto Scribe AI are recorded here.

---

## [arch-17.1-freeze] — 2026-07-24

### Architecture 17.1 — Presentation Core — Frozen

Architecture Baseline **ASA-ARCH-17.0** Phase **17.1**（Presentation Core）is accepted and frozen.

| Phase | Component | Status |
|---|---|---|
| 17.1 | Presentation Core | Frozen / Accepted |
| 17.2 | （Open） | Open |

**Freeze:** ASA-IMPL-REQ-ARCH-FREEZE-17.1-001  
**Acceptance:** ASA-VERIFY-ARCH-17.1-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Baseline:** `docs/baselines/ASA-ARCH-17.0.md`（Phase 17.1 Frozen）  
**Git tag:** `arch-17.1-freeze`  

Acceptance completed. No contract violations. No blocking issues.

**NB-1（Non-blocking）:** Packaging dependency — `FrozenEvidence` imported as shared type utility. Future Packaging Cleanup. No architecture impact. No implementation change required.

Production source unchanged（governance documents only）. Phase 17.2 remains Open.

---

## [arch-16.0-final] — 2026-07-24

### Architecture 16.0 — Decision / Audit / Reasoning / Recommendation — CLOSED

Architecture Baseline **ASA-ARCH-16.0**（Final 1.0）is complete and frozen.

| Phase | Component | Status |
|---|---|---|
| 16.1 | Decision Engine | Closed |
| 16.2 | Audit Layer | Closed |
| 16.3 | Trace Reasoning | Closed |
| 16.4 | Recommendation | Closed |

**Closeout:** ASA-IMPL-REQ-ARCH-CLOSEOUT-16.0-001  
**Baseline:** `docs/baselines/ASA-ARCH-16.0.md`（immutable）  
**Git tag:** `arch-16.0-final`  
**Verification:** ASA-VERIFY-ARCH-16.0-BASELINE-001 — PASS  
**Successor placeholder:** ASA-ARCH-17.0  

Future architectural evolution begins from **Architecture 17.0**.

---

## [arch-15.0-final] — 2026-07-23

### Architecture 15.0 — Trace Intelligence Layer — CLOSED

Architecture Baseline **ASA-ARCH-15.0**（Final v9）is complete and frozen.

| Component | Status |
|---|---|
| Trace Query Layer | Closed |
| Trace Graph Engine | Closed |
| Trace Consistency Checker | Closed |
| Repository Facade | Closed |

**Closeout:** ASA-IMPL-REQ-ARCH-CLOSEOUT-15.0-001  
**Baseline:** `docs/baselines/ASA-ARCH-15.0.md`（immutable）  
**Git tag:** `arch-15.0-final`  
**Successor placeholder:** ASA-ARCH-16.0  

Future architectural evolution begins from **Architecture 16.0**.
