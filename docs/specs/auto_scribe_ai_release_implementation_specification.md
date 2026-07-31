# ASA-IMPL-RELEASE-1.0 — Release Implementation Specification

**Spec ID:** ASA-IMPL-RELEASE-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Implemented)  
**Parent Baseline:** ASA-ARCH-14.0  
**Derived From:** ASA-IMPL-TRACE-1.0（Base Trace abstraction）  
**Depends On:** ASA-ARCH-14.0, ASA-IMPL-TRACE-1.0, **ASA-IMPL-COMMIT-1.0**, **ASA-IMPL-PR-1.0**, **ASA-IMPL-ISSUE-1.0**, ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-DSEARCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase14 / Traceability Layer  
**Path:** `docs/specs/auto_scribe_ai_release_implementation_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-14.0.md`  
**CR Applied:** **ASA-CR-REL-001**（ReleaseStatus）；**ASA-CR-PR-002**（Workflow）；**ASA-CHK-REL-001** PASS  
**Registration ID:** ASA-IMPL-REG-RELEASE-001  
**IMPL-REQ:** ASA-IMPL-REQ-RELEASE-001  

---

# 1. Purpose

RELEASE は TRACE 抽象の **具象派生モデル**であり、検証済み PR / COMMIT を集約するデプロイ可能成果物・版証跡を append-only で永続化する。

```text
TRACE（abstract — not persisted）
  ├── COMMIT / PR / ISSUE
  └── RELEASE（this specification）
```

* TRACE は直接インスタンス化・永続化しない（TTP-001）
* Knowledge（DEC / IMP / REV）および ISSUE は改変しない
* Traceability Flow（ASA-ARCH-14.0 §7.3）: DEC → ISSUE → COMMIT → PR → RELEASE

---

# 2. Inheritance（Base Trace）

RELEASE SHALL inherit ASA-IMPL-TRACE-1.0 Base Trace contracts.

`record_type` MUST be **`RELEASE`**.  
`record_id` Runtime: **`REL-[0-9]{5}`**.  
Value `TRACE` is forbidden.

---

# 3. RELEASE-Specific Schema

```json
{
  "record_id": "REL-xxxxx",
  "record_type": "RELEASE",
  "project_id": "PRJ-xxxxx",

  "version": "v1.2.0",
  "release_date": "ISO8601",
  "status": "ReleaseStatus",

  "related_pr": [
    { "record_type": "PR", "record_id": "PR-xxxxx" }
  ],
  "related_commit": [
    { "record_type": "COMMIT", "record_id": "CMT-xxxxx" }
  ],
  "related_issue": [
    { "record_type": "ISSUE", "record_id": "ISSUE-xxxxx" }
  ],
  "decision_ref": {
    "record_type": "DEC",
    "record_id": "DEC-xxxxx"
  },

  "created_by": {
    "actor": "ActorType",
    "source": "TraceSourceType"
  },
  "timestamp": "ISO8601"
}
```

---

# 4. Required / Optional

**Required:** record_id, record_type, project_id, summary, version, release_date, status, created_by, timestamp  

**Optional:** related_pr, related_commit, related_issue, decision_ref, description, relations, related_knowledge, external_ref, title  

---

# 5. Validation Matrix

| Field | Required | Validation |
|---|---|---|
| version | Yes | Semantic Version `vMAJOR.MINOR.PATCH`；unique among non-superseding creates in project（same version OK on status supersedes） |
| release_date | Yes | ISO8601 UTC；immutable after status=Released |
| related_pr | Optional | Existing PR same project；each SHALL be merged（`merge_ref` present） |
| related_commit | Optional | Existing COMMIT same project；each SHALL belong to ≥1 related merged PR（`related_commits` or `merge_ref`） |
| related_issue | Optional | Existing ISSUE same project；**latest** ISSUE in supersedes chain SHALL be Resolved or Closed |
| decision_ref | Optional | Existing DEC same project |
| status | Yes | ReleaseStatus: Planned / Released / Deprecated |
| related_* arrays | — | No duplicate refs within each array |

---

# 6. Enums

**ReleaseStatus**（ASA-ARCH-14.0 §7.2）:

```text
Planned
Released
Deprecated
```

---

# 7. Runtime

* Validate merged PR / COMMIT inclusion / latest ISSUE status as above  
* Status transition → new RELEASE + `supersedes`（append-only）  
* Runtime MAY suggest Released successor when validation conditions satisfied  
* RELEASE SHALL NOT modify DEC / ISSUE / COMMIT / PR  

---

# 8. Graph

| Edge | RelationType |
|---|---|
| RELEASE → PR | `related_to` |
| RELEASE → COMMIT | `related_to` |
| RELEASE → ISSUE | `related_to` |
| RELEASE → RELEASE | `supersedes` |

Allowed relation types on RELEASE: `derived_from`, `related_to`, `supersedes`.  
Bidirectional traversal required.

---

# 9. Search（DSEARCH）

Filters: `project_id`, `version`, `status`, `release_date`, `decision_ref`, `record_id`

---

# 10. Storage

```text
/data/projects/{project_id}/records/REL-{xxxxx}.json
```

---

# 11. Design Notes

* Final Traceability node: DEC → ISSUE → COMMIT → PR → RELEASE  
* PR aggregates COMMITs；RELEASE integrates merged PR evidence  
* Append-only；status via supersedes  

---

# 12. Implementation Checklist

（Implemented via ASA-IMPL-REQ-RELEASE-001）

- [x] Model / Schema / Store / Repository  
- [x] Runtime validation（merged PR, COMMIT inclusion, latest ISSUE）  
- [x] Graph + DSEARCH  
- [x] Tests  

---

# 13. Completion Status

| Item | Status |
|---|---|
| Spec registration | Complete |
| CHK | ASA-CHK-REL-001 PASS |
| Coding | ASA-IMPL-REQ-RELEASE-001 |
