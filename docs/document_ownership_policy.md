# Document Ownership Policy

**Version:** 1.1  
**Status:** Approved  
**Scope:** Documentation Architecture / Source of Truth Policy

---

## 1. Purpose

本書は、AI編集秘書 Framework における **文書の所有（Source of Truth, SoT）構造**を定義し、  
複数フェーズから参照される文書の **責務混線・意味ドリフト・改訂衝突**を防ぐことを目的とする。

---

## 2. Ownership Model

**Each document has one ownership role.  
A document may additionally contain one or more Additive Sections.**

文書は以下の3種の所有区分を持つ。

---

### 2.1 Primary Source of Truth (Primary SoT)

* 文書の内容・構造・定義の唯一の正本
* 構造変更・定義変更が許可される
* 他フェーズが参照する場合でも、Primaryが絶対優先

---

### 2.2 Secondary Reference

* Primary SoT の内容を参照し、補足・要約・導線を提供する文書
* **構造変更は禁止**
* Primary の内容が更新された場合、必要に応じて同期する
* Secondary は Primary の「鏡像」であり、独自定義を持たない

---

### 2.3 Additive Section（レビュー反映済）

Additive Section は **Ownership の種類ではなく、Primary SoT または Secondary Reference の中に追加される拡張セクション**である。

Additive Section は次の条件を満たすものとする。

* Primary SoT の定義を変更しない
* Phase 固有の補足・例・運用観点を追加する
* Primary の内容と矛盾してはならない
* Primary または Secondary のどちらにも追加できる
* 文書の末尾または専用節として追加する

---

## 3. Ownership Rules

### 3.1 Primary SoT の変更権限

```text
Primary SoT の構造変更・定義変更は Primary 所有フェーズのみ可能。
```

---

### 3.2 Secondary の制約

```text
Secondary は Primary の内容を変更してはならない。
Additive Section の追加のみ許可される。
```

---

### 3.3 Additive Section の原則

```text
Additive は Primary の定義を上書きしてはならない。
Primary の内容と矛盾する場合は追加不可。
```

---

### 3.4 共通概念の扱い

```text
共通概念は Primary に反映 → Secondary に同期 の順で更新する。
```

---

## 4. Ownership Mapping（現行文書）

| 文書 | Primary SoT | Secondary | Additive | 備考 |
|---|---|---|---|---|
| `incident_response.md` | Phase6 | Phase11 | Phase11節 | Phase6が主体、11は補足 |
| `lessons_learned.md` | Phase10 | Phase11 | Phase11節 | Phase10が主体 |
| `knowledge_lifecycle.md` | Phase8 | Phase11 | Phase11節 | Phase8が主体 |
| `knowledge_validation.md` | Phase8 | Phase11 | Phase11節 | Phase8が主体 |

---

## 5. Update Workflow

```text
Primary SoT 更新
        ↓
Secondary の同期確認
        ↓
必要に応じて Additive Section 更新
        ↓
Hub へのリンク更新
```

---

## 6. Governance

* Primary SoT の変更には **Human Approval 必須**
* Secondary / Additive の追加は **軽量レビュー**
* Production Boundary（secretary / CI / Infra）は影響外
* Traceability は Primary → Secondary → Hub の順で維持

---

## 7. Versioning

* Primary SoT の変更は **Minor / Major Version**
* Secondary / Additive の追加は **Patch Version**
* Versionは文書ヘッダに記載

---

## 8. Status（レビュー反映済）

```text
Approved

This policy is established as the common
Source of Truth ownership policy for the
AI編集秘書 Documentation Architecture.
```
