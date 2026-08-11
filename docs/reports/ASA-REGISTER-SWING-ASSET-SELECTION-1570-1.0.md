# ASA-REGISTER-SWING-ASSET-SELECTION-1570-1.0

# Swing Asset Selection — 1570 Standard Continuation — Registration

**Date:** 2026-08-11  
**Timestamp:** 2026-08-11T07:13:00+09:00  
**Target:** ASA-SWING-ASSET-SELECTION-1570-1.0  
**Title:** 特定口座 Swing Asset 選定判断記録 — 1570 標準継続  
**Status:** **APPROVED / REGISTERED — DESIGN VALIDATED（NOT IMPLEMENTATION FROZEN）**  
**Request:** ASA-RECORD-REQUEST / KNOWLEDGE / DESIGN RECORD  
**Registration Authority:** OPERATIONS_COORDINATOR  
**Final Authority:** HUMAN_ARCHITECT  
**Previous Related Records:**  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Implementation Freeze:** **NOT ISSUED**  
**Existing Freeze Mutation:** **NONE**

---

## Registration Decision

```text
Register ASA-SWING-ASSET-SELECTION-1570-1.0
as official ASA Knowledge Record
（特定口座 / Swing Protocol — Swing Asset Selection）
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
Selected Standard Swing Asset: 1570
```

```text
APPROVED
Registration: ISSUED / COMPLETE
```

Artifact: `docs/baselines/ASA-SWING-ASSET-SELECTION-1570-1.0.md`

---

## Why Knowledge Record（not protocol mutation / not trading lock）

| Option | Decision |
|---|---|
| ASA-ARCH-* chapter | **REJECTED** |
| FREEZE-1.0 mutation | **REJECTED** |
| Entry/Holding/Exit/Re-entry/Sensor change | **REJECTED** |
| Growth Asset change | **REJECTED** |
| Implementation Freeze | **REJECTED** |
| Trading / capital-transfer authorization | **REJECTED** |
| Design Judgment Record（asset selection） | **SELECTED** |

```text
Design Validated selection judgment
≠ Protocol rewrite
≠ Trading authorization
≠ Permanent lock
```

---

## Registration Scope

| Scope Element | Registered |
|---|---|
| Selected Standard Swing Asset = 1570 | YES |
| Continue under current FREEZE-1.0 / PROTO100 | YES |
| Product comparison evidence linked | YES |
| 1579 issuer/TER misinfo correction | YES |
| 1579 +0.55pt not structural superiority | YES |
| 3x / 4.3x not adopted under current Protocol | YES |
| Future re-evaluation triggers | YES |
| FREEZE-1.0 rule change | **NO** |
| Live trading / capital rules | **NO** |
| Permanent product freeze | **NO** |

---

## Evidence References（Read-only）

| Evidence | Path |
|---|---|
| Swing asset product comparison | `data/common_backtest/reports/swing_asset_product_comparison/` |
| Final comparison table | `.../08_final_comparison_table.csv` |
| Technical opinion / ranking | `.../09_technical_opinion.md` / `.../10_adoption_ranking.md` |
| 1570 vs 1579 gap analysis | `data/common_backtest/reports/swing_asset_product_comparison/1570_vs_1579_gap/` |
| Gap opinion | `.../1570_vs_1579_gap/09_1570_vs_1579_gap_opinion.md` |
| FREEZE baseline | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` |
| PROTO100 strategy | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md` |
| Growth selection | `docs/baselines/ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` |

---

## Connection to Related ASA Records

| Related ID | Connection State |
|---|---|
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED** — unchanged component |
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 | **CONNECTED** — unchanged |
| ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0 | **CONNECTED** — Growth unchanged |

---

## Key Corrections Registered

1. **1579 identity/TER:** 「日興 / TER 0.385%」情報は撤回。公的扱いではシンプレクス・TER約0.825%。
2. **1579 change rationale:** 「低コストだから変更」は採用しない。
3. **High leverage:** 現行Protocol下で3x/4.3xは非採用。単純置換禁止。

---

## Registration Constraints（Enforced）

```text
No Trading Authorization
No Capital Transfer Authorization
No FREEZE-1.0 Mutation
No Entry/Holding/Exit/Re-entry/Sensor Change
No Growth Asset Change
No Implementation Freeze Claim
No Architecture Chapter Creation
No Synthetic NAV Substitution Claim for SBI 4.3x completeness
```

---

## Handoff State

```text
Handoff READY for:
  1. Keep 1570 as standard Swing Asset candidate in design
  2. Re-evaluate only on Future Re-evaluation Triggers
  3. Do NOT treat 3x/4.3x as drop-in replacement without new Protocol design
```

---

## Registration Verification

| Check | Result |
|---|---|
| Record Identity | **PASS** |
| Status DESIGN VALIDATED / Frozen NO | **PASS** |
| Trading NOT AUTHORIZED | **PASS** |
| Selected Asset = 1570 | **PASS** |
| 1579 correction recorded | **PASS** |
| 3x/4.3x non-adoption recorded | **PASS** |
| FREEZE-1.0 unchanged | **PASS** |
| Evidence linked (read-only) | **PASS** |

---

## Registration Complete

| Field | Value |
|---|---|
| Record ID | ASA-SWING-ASSET-SELECTION-1570-1.0 |
| Selected Standard Swing Asset | **1570** |
| Role | Taxable Swing Asset（標準採用候補） |
| Implementation Frozen | NO |
| Trading Authorization | NOT AUTHORIZED |
| FREEZE-1.0 Mutation | NONE |
| Runtime Decision | `ffc983b9-94e9-480d-a9c2-58f84079efe6` |
| Runtime Verification | `ff97d515-9ad9-4d10-8968-9f86e8a71bd8` |
