# ASA Runtime Operational Trial v0.1 — Observation Log

**Status:** OPEN  
**Trial:** ACTIVE  
**Runtime:** ASA Minimum Runtime v0.1.1  
**Start:** ASA-OP-TRIAL-START-V0.1-001  

Observations only. No Runtime changes from this log.

---

## How to use

Append dated notes under the sections below when usability issues or missing capabilities appear.

Issue path:

```text
Need identified → Record issue → Evaluate necessity → Future extension proposal
```

---

## Record Creation

| Date | Note | Severity |
|---|---|---|
| 2026-08-01 | Trial start seed Records created via `runCli` + templates. | info |
| 2026-08-01 | PowerShell/`node -e` string escaping produced literal `\\n` in first seeds（`a1111111-…`）. Preserved immutable; official superseding seeds via `scripts/asa_trial_seed_records.js`（`b2222222-…`）. Prefer `.js` + `runCli` for multiline content. | medium |

---

## History / Retrieval

| Date | Note | Severity |
|---|---|---|
| 2026-08-01 | Related Records via metadata `relatedRecords` + `asa show`; no search CLI yet（observation candidate）. | info |

---

## Verification

| Date | Note | Severity |
|---|---|---|
| 2026-08-01 | `asa verify` after seed create → VERIFY_PASS. | info |

---

## Missing Capability（observations only）

| Candidate | Observed need | Decision |
|---|---|---|
| Search | Retrieval by tag / title during trial | deferred |
| Export | Off-machine archive of Records | deferred |
| Snapshot | Point-in-time package of records+history | deferred |
| Backup | Operational backup procedure | deferred |
| Relationship visualization | Graph of relatedRecords | deferred |

---

## Critical Runtime Issues

| Date | Issue | Status |
|---|---|---|
| — | None detected at trial start | — |

---

# End of Observation Log
