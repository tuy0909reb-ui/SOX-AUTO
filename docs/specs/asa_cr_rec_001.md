# Change Request — ASA-CR-REC-001

**CR ID:** ASA-CR-REC-001  
**Title:** Record ID Prefix と Event Taxonomy の整合性改善  
**Priority:** Medium  
**Type:** Specification Improvement (Non-Breaking)  
**Status:** Applied  
**Result Spec:** ASA-IMPL-REC-1.1  

## Summary

`record_id` pattern に `DISC` / `MEET` / `ANN` を追加し、Event Taxonomy と 1 対 1 対応にした。

## Applied To

* `docs/specs/auto_scribe_ai_record_json_schema.md` → ASA-IMPL-REC-1.1
* `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` → Record ID Prefix Mapping
* `auto-scribe-ai/src/schemas/record_schema.json`
* `auto-scribe-ai/src/config/constants.py` / Capture Engine
* `auto-scribe-ai/tests/test_runtime.py`

## Compatibility

* Backward Compatible
* Existing Record IDs remain valid
* No API / Storage schema migration required
