# ASA-ARCH-20.8 Verification Mapping

本書は ASA-ARCH-20.8 — Frozen Baseline (ID Version) の契約と  
Runtime Execution Model Specification v1.3 の設計、  
および Verification Plan の検証項目を対応付ける。

Baseline は契約、Specification は設計、Verification は検証である。

---

# 1. Architecture Invariants → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| INV-001 | Section 1 Overview | 20.8 は additive である |
| INV-002 | Section 1 Overview | 既存 Runtime の意味論を変更しない |
| INV-003 | Section 3.2 Requirements | External Runtime は read-only である |
| INV-004 | Section 8 Semantic Equivalence | Event/Pipeline/Scheduler の意味論を保持する |
| INV-005 | Section 6 Determinism Model | Runtime の決定性を保持する |
| INV-006 | Section 1 Overview | 依存方向は 20.8 → 20.0〜20.7 のみ |
| INV-007 | Section 1 Overview | 循環依存は禁止される |

---

# 2. Dependency Rules → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| DEP-001 | Section 1 Overview | 20.8 は既存 Runtime に依存するが、逆依存は許されない |
| DEP-002 | Section 1 Overview | 20.8 は既存 Runtime の API を変更しない |
| DEP-003 | Section 3.2 Requirements | 20.8 は既存 Runtime の内部状態に書き込まない |

---

# 3. Responsibility Boundaries → Specification

## Execution Engine

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| RB-ENG-001 | Section 4.2 Requirements | Engine は Execution Layer の実行を担う |
| RB-ENG-002 | Section 4.2 Requirements | Engine はスケジューリングを行わない |
| RB-ENG-003 | Section 4.2 Requirements | Engine はキューを所有しない |
| RB-ENG-004 | Section 4.2 Requirements | Engine は Event を生成しない |
| RB-ENG-005 | Section 4.2 Requirements | Engine は Pipeline を変更しない |
| RB-ENG-006 | Section 4.2 Requirements | Engine は Scheduler の順序を変更しない |
| RB-ENG-007 | Section 4.2 Requirements | Engine は External Runtime を変更しない |

## Execution Context

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| RB-CTX-001 | Section 3.2 Requirements | Context は External Runtime を read-only として扱う |
| RB-CTX-002 | Section 3.2 Requirements | Context は意味論的同値性を保持する |
| RB-CTX-003 | Section 3.2 Requirements | Context の状態遷移は仕様に従う |
| RB-CTX-004 | Section 3.2 Requirements | Context は External Runtime を変更しない |

## Adapter

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| RB-ADP-001 | Section 5.2 Requirements | Adapter は External Runtime の安全な投影を提供する |
| RB-ADP-002 | Section 5.2 Requirements | Adapter は副作用を持たない |
| RB-ADP-003 | Section 5.2 Requirements | Adapter は双方向依存を作らない |
| RB-ADP-004 | Section 5.2 Requirements | Adapter は Execution Layer と External Runtime の接続契約を提供する |

---

# 4. Determinism → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| DET-001 | Section 6 Determinism Model | 同一入力・同一 Context・同一 External Runtime 状態 → 同一結果を返す |

---

# 5. Semantic Equivalence → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| SEM-001 | Section 8 Semantic Equivalence | Event の順序・優先度・意味論は保持される |
| SEM-002 | Section 8 Semantic Equivalence | Pipeline と Scheduler の意味論は保持される |

---

# 6. Error Handling → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| ERR-001 | Section 7 Error Model | エラーは定義された分類体系に従う |
| ERR-002 | Section 7 Error Model | エラーは External Runtime に伝播しない |
| ERR-003 | Section 7 Error Model | エラー発生時も Pipeline の意味論は保持される |

---

# 7. Frozen Logical Components → Specification

| Baseline ID | Specification 対応箇所 | 説明 |
|-------------|--------------------------|------|
| FLC-001 | Section 9 Frozen Items | Execution Engine の論理契約は凍結される |
| FLC-002 | Section 9 Frozen Items | Execution Context の論理契約は凍結される |
| FLC-003 | Section 9 Frozen Items | Adapter の論理契約は凍結される |

---

# 8. Verification Requirements → Verification Plan

| Baseline ID | Verification Plan 対応箇所 | 説明 |
|-------------|------------------------------|------|
| VFY-001 | Architecture Tests | Architecture Tests が PASS すること |
| VFY-002 | Dependency Tests | Dependency Verification が PASS すること |
| VFY-003 | Regression | Regression が PASS すること |
| VFY-004 | Checksum | Checksum Verification が PASS すること |
| VFY-005 | Production Verification | Production Verification が PASS すること |

---

# 9. Freeze Criteria → Verification Plan

| Baseline ID | Verification Plan 対応箇所 | 説明 |
|-------------|------------------------------|------|
| FRC-001 | Freeze Checklist | 全検証が PASS |
| FRC-002 | Freeze Checklist | Freeze Commit ID が固定されている |
| FRC-003 | Freeze Checklist | Freeze Tag が発行されている |
| FRC-004 | Freeze Checklist | Blocking Issues = 0 |
