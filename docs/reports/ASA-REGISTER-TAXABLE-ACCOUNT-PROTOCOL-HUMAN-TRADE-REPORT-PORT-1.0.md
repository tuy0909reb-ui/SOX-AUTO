# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0

# Registration — Human Trade Report Port / Fact Journal v1.0 Freeze

**Date:** 2026-08-05  
**Timestamp:** 2026-08-05T22:59:00+09:00  
**Title:** Human Trade Report Port + Fact Journal Design Freeze + Implementation Freeze  
**Status:** **FROZEN IMPLEMENTATION / REGISTERED**（v1.0 CORRECTION: quantity Fact）  
**Freeze ID:** `ASA-TAXABLE-HTR-PORT-FJ-1.0`  
**Version Tag:** `ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0`  

**Human Decision:** APPROVE FREEZE  
**Final Design Review:** APPROVE（Architecture / Runtime Owner）  
**Human Correction:** quantity を Trade Fact 保存項目へ復元（2026-08-05）  
**Implementation Authorization:** **AUTHORIZED**（Freeze範囲内のみ）  
**Implementation Result:** **PASS → FROZEN IMPLEMENTATION**（correction applied）  
**Implementation Result Record:** `docs/reports/ASA-IMPLEMENT-RESULT-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
**Implementation Commit:** `1d6ee0ea7cfbbcfbdc4f4b3bfa4f6f1940e69638`（initial freeze）  
**Correction Note:** quantity Fact restoration is in working tree pending correction commit  

---

## Classification

```text
Operational Interface Extension
+ Runtime Extension
+ Operational Data Layer
```

**Protocol Rule Change:** NO  

Unchanged by this freeze:

- Entry conditions  
- Exit conditions  
- Risk formula  
- Asset Selection  
- Detection  
- PositionState enum（no new states）  

---

## Freeze artifact (Design)

| Field | Value |
|---|---|
| Design Record | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md` |
| SHA-256 Digest (current / corrected) | `9cf1d708280df88a0158065712795d47c99bb4fe9753b5dfeae61382754efafd` |
| Size (bytes) | `7635` |
| Prior Digest (initial freeze) | `c733dd740bdd4b0c1f54809e75e163b68b0ad71803f1b9eff92005ca4b921579` |
| Digest algorithm | SHA-256 over full file bytes（UTF-8, LF line endings） |

---

## Correction (2026-08-05) — quantity Fact restoration

**Reason:** 設計意図に対し、Trade Fact として保持すべき `quantity` が削減されていた。

**Nature:** Protocol 条件変更ではない。Human Trade Report 本来目的への復元。

| Item | Status |
|---|---|
| `quantity` Journal 保存 | **IN**（一次 Fact） |
| Position / Risk / Time / Entry-Exit への利用 | **禁止** |
| Ledger / 平均単価 / 部分約定 / 損益 / 税務 | **OUT** |

```text
Human Trade Report = Runtime 同期 + 取引 Fact 蓄積
```

Schema: `docs/schemas/taxable_account_trade_fact.schema.json`  
Tests after correction: **35 passed**

---

## Frozen scope (summary)

1. **Trade Fact Input Port** — external boundary for Human/Broker facts  
2. **Fact Journal** — append-only evidence/analysis facts（includes **quantity**; not Position SoT; not Ledger）  
3. **Routing** — normal BUY → ENTRY_FILLED；delayed BUY → internal `DELAYED_FILL_RECOVERY` only  
4. **Guards** — SWING + CASH + WATCH-like + confirm + asset∈{1570,282A}  
5. **Invariant** — no WATCH→POSITION_ACTIVE direct；technical READY then existing FILLED path  
6. **Responsibility** — Trade Fact = 取引事実；Position State = Runtime 状態のみ  

## Out of freeze（別CR）

本格 Ledger / 平均取得単価 / 部分約定 / 残数量管理 / 実現損益 / 税務 /  
Broker Adapter / Discord Interaction / Dashboard / Protocol自動改善  

（`quantity` の Fact 保存は OUT ではない）

---

## Implementation baseline → Implementation freeze

Design IN list was implemented and verified:

- Trade Report Input Port  
- Fact Journal（**quantity included**）  
- Validation  
- Routing  
- BUY processing  
- Internal DELAYED_FILL_RECOVERY  
- Regression + quantity Fact tests（35 passed）  

Live premise: `auto_fill=False`（paper/test may use True）.

**Implementation Status:** **FROZEN IMPLEMENTATION**（with quantity correction）  

Further changes to this Port / Journal / Recovery path require:

1. Explicit Human authorization  
2. Design Review（if Design meaning changes）  
3. New version record（do not overwrite v1.0）  

Re-Design Review required if Entry/Exit/Risk/Selection/Detection change,  
PositionState added, Fact fed into Decision Engine, or Journal made SoT.

---

## Parent baselines

- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0.md`  
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0.md`  
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0.md`  

---

## Completion

```text
ASA-TAXABLE-ACCOUNT-PROTOCOL
Human Trade Report Port / Fact Journal v1.0

Status: FROZEN IMPLEMENTATION (quantity Fact CORRECTION)
Freeze Record: ASA-TAXABLE-HTR-PORT-FJ-1.0
Digest: 9cf1d708280df88a0158065712795d47c99bb4fe9753b5dfeae61382754efafd
Prior Digest: c733dd740bdd4b0c1f54809e75e163b68b0ad71803f1b9eff92005ca4b921579
Implementation Commit (initial): 1d6ee0ea7cfbbcfbdc4f4b3bfa4f6f1940e69638
Tests: 35 passed
```
