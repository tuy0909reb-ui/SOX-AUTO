# Change Request — ASA-CR-DEC-001

**CR ID:** ASA-CR-DEC-001  
**Title:** Synchronize DecisionStatus / ActorType / SourceType between ASA-ARCH-13.0 and ASA-IMPL-DEC-1.0  
**Type:** Consistency Fix  
**Impact:** Low  
**Breaking Change:** No  
**Migration Required:** No  
**Status:** Applied  

## Summary

Architecture Baseline（ASA-ARCH-13.0）を enum の唯一の正本とし、ASA-IMPL-DEC-1.0 の Request Example を正式 enum に同期した。

## Applied Mapping

| Field | Before (Example) | After（ASA-ARCH-13.0） |
|---|---|---|
| `status` | Accepted | **Active** |
| `created_by.actor` | Cursor | **AI** |
| `created_by.source` | Runtime | **Cursor** |

## Updated Documents

* `docs/specs/auto_scribe_ai_decision_memory_specification.md` — Request Example + SoT note
* `docs/baselines/ASA-ARCH-13.0.md` — enum SoT 明示（値変更なし）

## Runtime

変更なし（既存実装が既に ASA-ARCH-13.0 enum を正としていた）。

## Compatibility

* Record Schema / API / Storage / Search / Runtime Flow 変更なし
* 既存テスト維持目標: 13 passed
