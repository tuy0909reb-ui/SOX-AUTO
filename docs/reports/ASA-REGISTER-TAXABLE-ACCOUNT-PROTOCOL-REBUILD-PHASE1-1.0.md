# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE1-1.0

# Taxable Account Protocol Rebuild Phase 1 — Registration

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:30:00+09:00  
**Targets:**  
- ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
- ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0  
**Title:** 特定口座運用プロトコル再構築 Phase 1（Legacy化 + New Architecture）  
**Status:** **APPROVED / REGISTERED — DESIGN PHASE COMPLETE（NOT RUNTIME）**  
**Request:** ASA-RECORD-REQUEST / PHASE1 DESIGN BOUNDARY  
**Final Authority:** HUMAN_ARCHITECT  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Architecture Change:** **NONE**（ASA-ARCH-* 非改変）

---

## Registration Decision

```text
Register Phase 1 design pair:
  1) Legacy Boundary
  2) New Taxable Account Architecture

State: CONFIRMED / RECORDED
Implementation: NOT AUTHORIZED
Legacy hot-path dependency: FORBIDDEN
```

| Artifact | Path |
|---|---|
| Legacy Boundary | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0.md` |
| New Architecture | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0.md` |
| This Registration | `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE1-1.0.md` |

---

## Why Phase 1 is Design-only

| Option | Decision |
|---|---|
| Patch SOX / NDX / Swing Discord into unified ops | **REJECTED** — Legacy改修禁止 |
| Mutate Freeze Entry / Growth Sensor | **REJECTED** — 変更禁止 |
| ASA-ARCH-* chapter rewrite | **REJECTED** — 今回は特定口座運用設計の新正本候補 |
| Knowledge / Design records for rebuild | **SELECTED** |

---

## Completion Criteria Verification

| # | Criterion | Result |
|---|---|---|
| 1 | 既存プロトコルが Legacy として分離 | **PASS** |
| 2 | 新プロトコル責務境界が定義 | **PASS** |
| 3 | 抽出利用要素が明確 | **PASS** |
| 4 | 1570 Position Risk Control が独立仕様 | **PASS** |
| 5 | Discord = ViewModel投影 | **PASS** |
| 6 | 旧依存なしで新設計が説明可能 | **PASS** |

```text
PHASE 1 = COMPLETE (design boundary)
PHASE 2+ = NOT STARTED
```

---

## Extracted Logic (summary)

| New Layer | Extracted meaning |
|---|---|
| Market Detection | `dd15_ma200`, `crash_15`, `semi_signal`, Recovery Model B |
| Asset Selection | Growth=野村 / Crash=1570 / Other=282A / else CASH |
| Risk Control | 1570 only, Entry×0.85 preset stop |
| Discord | Projection-only ViewModel（NDX pattern参照、コード新規） |

---

## Explicit Non-Actions

- No edits to `sox_protocol.py` / `ndx_*` / Freeze baseline for feature add
- No Discord judgment logic in UI
- No runtime activation
- No trading authorization

---

## Next Authorized Design Step

```text
Phase 2: detailed specs
  Regime transitions
  Asset selection decision table
  Position transitions
  Risk Control operating procedure
  State / ViewModel schema draft
```

Implementation remains unauthorized until a later explicit authorization record.
