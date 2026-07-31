# Architecture Baseline Registry – ASA-ARCH-2.0

**Baseline ID:** ASA-ARCH-2.0  
**Document:** Phase12 – Auto Scribe AI  
**Version:** 2.0  
**Status:** Design Baseline  
**Category:** Runtime / Operation  
**Document Type:** Architecture Specification  
**Supersedes:** ASA-ARCH-1.3  
**Approved:** Pending Human Approval  
**Registered Path:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Registry Path:** `docs/baselines/ASA-ARCH-2.0.md`  
**Layer Architecture ID:** ASA-ARCH-12.0（Event Layer / Phase numbering）

---

## 1. Registration Declaration

本書は Auto Scribe AI の **正式な Architecture Baseline（Design Baseline）** である。

- Runtime Architecture の唯一の詳細ベースラインとする
- Phase 番号体系では **ASA-ARCH-12.0（Event Layer）** と等価
- 以降の設計・実装・レビューは本仕様を基準とする
- Design Freeze：アーキテクチャ影響変更は Change Request 経由のみ
- 下位仕様（API / Schema / Storage / Search / Auto Capture Rule）は本 Baseline と整合すること
- Knowledge Layer は **ASA-ARCH-13.0**（本 Baseline を親 Event Layer とする）

---

## 2. Supersession

| Baseline | Status | Path |
|---|---|---|
| ASA-ARCH-1.3 | Superseded（履歴） | `docs/baselines/ASA-ARCH-1.3.md` |
| **ASA-ARCH-2.0** | **Current Design Baseline** | 本ファイル / `docs/specs/auto_scribe_ai_architecture_phase12.md` |

---

## 3. Child / Next Implementation Specs

1. Record JSON Schema — **ASA-IMPL-REC-1.1**（Registered / Supersedes ASA-IMPL-REC-1.0 / ASA-CR-REC-001）→ `docs/specs/auto_scribe_ai_record_json_schema.md`
2. Runtime API Specification — **ASA-IMPL-API-1.0**（Registered / Depends On: ASA-IMPL-REC-1.1）→ `docs/specs/auto_scribe_ai_runtime_api_specification.md`
3. Storage Specification — **ASA-IMPL-STOR-1.0**（Registered / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0）→ `docs/specs/auto_scribe_ai_storage_specification.md`
4. Auto Capture Rule Specification — **ASA-IMPL-CAP-1.0**（Registered / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0）→ `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md`
5. Search Specification — **ASA-IMPL-SRCH-1.0**（Registered / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0）→ `docs/specs/auto_scribe_ai_search_specification.md`
6. Export Specification — **ASA-IMPL-EXP-1.0**（Registered / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0, ASA-IMPL-CAP-1.0）→ `docs/specs/auto_scribe_ai_export_specification.md`

---

## Child Architecture

| Baseline ID | Layer | Status | Path |
|---|---|---|---|
| **ASA-ARCH-13.0** | Knowledge Layer | Registered — Ready for Implementation | `docs/baselines/ASA-ARCH-13.0.md` |
| ASA-ARCH-14.0 | Traceability Layer | Registered — Ready for Implementation | `docs/baselines/ASA-ARCH-14.0.md` |

---

## 4. Boundary Note

Auto Scribe AI Architecture:

- Records development memory（Conversation → Record）
- Does **not** perform Human Approval
- Does **not** change Production Runtime / secretary / CI / Infrastructure by this baseline alone
- Character Layer has no effect on runtime logic（AC-001）

---

## 5. Status

```text
Design Baseline Registered

ASA-ARCH-2.0 is the current Architecture Baseline
for Phase12 Auto Scribe AI. Design Freeze is in effect.
Pending Human Approval for formal Adopt.
```
