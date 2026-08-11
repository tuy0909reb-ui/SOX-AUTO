# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE3-1.0

# Taxable Account Protocol Rebuild Phase 3 — Registration

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:44:00+09:00  
**Title:** New Runtime Foundation（骨格 + 最小domain実装）  
**Status:** **APPROVED / REGISTERED — FOUNDATION ONLY（NOT LIVE RUNTIME）**  
**Parent Specs:**  
- ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
- ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0  
- ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0  
**Implementation Authorization:** **FOUNDATION CODE ONLY**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Discord / Legacy mutation:** **NONE**

---

## Deliverables

| Artifact | Path |
|---|---|
| Package | `taxable_account/` |
| Domain | `taxable_account/domain/` |
| Decision | `taxable_account/decision/` |
| Position + Risk | `taxable_account/position/` |
| State store | `taxable_account/state/` |
| ViewModel | `taxable_account/view/` |
| Engine glue | `taxable_account/engine.py` |
| Tests | `tests/test_taxable_account_foundation.py` |
| Package note | `taxable_account/README.md` |

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | 新package境界が確定 | **PASS** |
| 2 | Legacy依存なし | **PASS**（import禁止テスト含む） |
| 3 | State Modelがschemaと一致 | **PASS**（enum/keys整合） |
| 4 | Transition定義が仕様通り | **PASS**（regime/position engine + tests） |
| 5 | Risk ControlがPosition層として分離 | **PASS**（`RiskControlState` / status） |
| 6 | Asset Selectionが独立 | **PASS**（`decision/asset_selection.py`） |

```text
PHASE 3 = COMPLETE (foundation)
NOT included: Discord send, live feeds, Legacy edits, broker IO
```

---

## Design Notes

### Asset Selection priority

```text
Regime gate first:
  GROWTH_ACTIVE -> Nomura
  EXIT/REENTRY  -> CASH
  SWING_ACTIVE  -> crash_15:1570 > semi_signal:282A > CASH
```

（依頼文の「1570 > 282A > Growth > CASH」は Swing袖内優先として解釈。GrowthはRegimeゲートで先に確定。）

### Risk Control

```text
position_state remains POSITION_ACTIVE
risk_control.status = ACTIVE  # display mode RISK_CONTROL_ACTIVE
stop_price = entry_price * 0.85
```

---

## Explicit Non-Actions

- No Legacy imports or edits
- No Discord implementation
- No operational activation
- No new sensors

---

## Next（Phase 4 候補）

- ViewModel → Discord adapter（送信のみ、判断なし）
- New Detection adapters（仕様意味の再実装、Legacy非依存）
- Transition backtest harness under `taxable_account`
