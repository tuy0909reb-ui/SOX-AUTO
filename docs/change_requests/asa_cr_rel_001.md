# Change Request — ASA-CR-REL-001

**CR ID:** ASA-CR-REL-001  
**Title:** Register ReleaseStatus Enumeration（Architecture SoT）  
**Target:** ASA-ARCH-14.0 — Traceability Layer  
**Triggered By:** ASA-CHK-REL-001  
**CR Type:** Architecture Consistency（Enum registration）  
**Status:** Applied  

---

## Purpose

ASA-CHK-REL-001 により、`ReleaseStatus` が ASA-ARCH-14.0 に未登録であることが判明した。  
RELEASE 実装仕様登録前に Architecture SoT へ正式追加する。

---

## Change

ASA-ARCH-14.0 に以下を追加する:

### ReleaseStatus

```text
Planned
Released
Deprecated
```

* RELEASE 派生モデルの状態空間（Architecture SoT）  
* Status 変更は TTP-003 / TTP-004 に従い、新 RELEASE + `supersedes` で表現する（実装仕様で詳細化）  

---

## Out of Scope

* ASA-IMPL-RELEASE-1.0 の本文登録（ASA-CHK-REL-001 Overall PASS 後）  
* Workflow narrative 修正（PR Design Notes 等）— 別途対応  

---

## Updated Documents

* `docs/baselines/ASA-ARCH-14.0.md`  
* `docs/change_requests/asa_cr_rel_001.md`（本ファイル）  
* `docs/change_requests/asa_chk_rel_001.md`  

---

## Result

```text
CR Status: Applied
ReleaseStatus is Registered on ASA-ARCH-14.0
ASA-CHK-REL-001 item 1: Registered
```
