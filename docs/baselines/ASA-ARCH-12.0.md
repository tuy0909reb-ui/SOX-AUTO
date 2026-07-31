# Architecture Baseline Registry – ASA-ARCH-12.0

**Baseline ID:** ASA-ARCH-12.0  
**Title:** Event Layer Architecture  
**Document:** Phase12 – Auto Scribe AI（Event Layer）  
**Version:** 1.0  
**Status:** Architecture Baseline（Registered）  
**Category:** Event Layer / Runtime Recording  
**Document Type:** Architecture Baseline  
**Equivalence:** ASA-ARCH-2.0（Design Baseline / detailed Auto Scribe Architecture）  
**Registered Path:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Registry Path:** `docs/baselines/ASA-ARCH-12.0.md`  
**Detailed Registry:** `docs/baselines/ASA-ARCH-2.0.md`

---

## 1. Registration Declaration

本書は Phase 番号体系における **Event Layer Architecture Baseline（ASA-ARCH-12.0）** である。

- Phase12 Event Layer の正式な Architecture ID とする
- 詳細設計・実装仕様の正本は **ASA-ARCH-2.0** およびその子仕様（ASA-IMPL-*）とする
- ASA-ARCH-12.0 はレイヤー識別子であり、ASA-ARCH-2.0 を置き換えない（互換・並存）
- 後続レイヤー（ASA-ARCH-13.0 Knowledge / ASA-ARCH-14.0 Traceability）の親 Baseline とする

---

## 2. Layer Position

```text
ASA-ARCH-12.0  Event Layer（本 Baseline）
      ↓
ASA-ARCH-13.0  Knowledge Layer
      ↓
ASA-ARCH-14.0  Traceability Layer
```

### Event Layer Scope

* Project / Session / Record
* Capture / Normalize / Classify / Trigger
* Storage（Append-only Repository / Index / Cache / Relation Mapping）
* Search / Export
* Record JSON Schema（ASA-IMPL-REC-1.1）

---

## 3. Continuity with ASA-ARCH-2.0

| Item | Value |
|---|---|
| Detailed Design Baseline | ASA-ARCH-2.0 |
| Spec Path | `docs/specs/auto_scribe_ai_architecture_phase12.md` |
| Child Implementation Specs | ASA-IMPL-REC-1.1 / API / STOR / CAP / SRCH / EXP |

---

## 4. Child Architecture

| Baseline ID | Layer | Status |
|---|---|---|
| **ASA-ARCH-13.0** | Knowledge Layer | Registered — Ready for Implementation |
| ASA-ARCH-14.0 | Traceability Layer | Registered — Ready for Implementation |

---

## 5. Status

```text
Architecture Baseline Registered

ASA-ARCH-12.0 is the Event Layer Architecture ID
for Phase12. Detailed SoT remains ASA-ARCH-2.0.
```
