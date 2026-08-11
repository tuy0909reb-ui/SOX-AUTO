# ASA-IMPLEMENT-RESULT — Asset Registry / Routing Policy 1.0

**Date:** 2026-08-06  
**Baseline:** ASA-TAXABLE-ASSET-REGISTRY-ROUTING-1.0  
**Parent:** ASA-TAXABLE-HTR-PORT-FJ-1.0  
**Protocol Rule Change:** **NO**

---

## Completion Report

### Modified files

| Path | Change |
|---|---|
| 	axable_account/domain/asset_registry.py | **NEW** Asset Registry (metadata) |
| 	axable_account/trade/routing.py | **NEW** SWING_POSITION / GROWTH_REGIME handlers |
| 	axable_account/trade/port.py | Registry lookup → policy dispatch |
| 	axable_account/trade/discord_input.py | Alias → Registry.resolve |
| 	axable_account/position/position_manager.py | Delayed Recovery swing check via Registry policy |
| 	axable_account/domain/__init__.py | Export Registry types |
| 	axable_account/trade/__init__.py | Export routing handlers |
| 	ests/test_taxable_account_asset_registry_routing.py | **NEW** registry / Growth / alias tests |
| docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-ASSET-REGISTRY-ROUTING-1.0.md | Freeze record |

### Tests

`	ext
tests/test_taxable_account_trade_report_port.py
tests/test_taxable_account_discord_trade_input.py
tests/test_taxable_account_asset_registry_routing.py
tests/test_taxable_account_phase45_validation.py
tests/test_taxable_account_phase8_live_dry_run.py
→ 58 passed
`

Covered:

- 1570 BUY / SELL / 282A（既存維持）
- Registry経由 Swing 処理
- 野村 Growth SELL → TRANSFER_COMPLETE
- 野村 Growth BUY → RECOVERY_COMPLETE
- alias 解決（1570 / NOMURA / 表示名）
- 未登録 asset reject
- Port に銘柄ハードコード無し（static assert）

### Migration status

| Item | Status |
|---|---|
| Fact Journal Schema | **UNCHANGED** |
| Discord slash Schema | **UNCHANGED** |
| Existing Swing Live path | **Compatible**（同一 Event 経路） |
| Growth Fact path | **Enabled**（Regime events） |
| Data migration | **N/A**（コード境界のみ） |

### Protocol impact

| Layer | Impact |
|---|---|
| Detection | NONE |
| Decision / Regime conditions | NONE |
| Selection rules | NONE |
| Risk / Time Exit | NONE |
| PositionState enum | NONE |
| Trade Fact contract | NONE（fields unchanged） |

Additive only: Asset metadata + Port dispatch refactor + Growth Regime Fact routing.

### Architecture after change

`	ext
Trade Fact (asset, side, date, price, qty, source)
        ↓
Trade Fact Port
        ↓
Asset Registry lookup
        ↓
routing_policy dispatch
   ├─ SWING_POSITION  → ENTRY_FILLED / EXIT_FILLED / Delayed Recovery
   └─ GROWTH_REGIME   → TRANSFER_COMPLETE / RECOVERY_COMPLETE
        ↓
Existing Runtime
`
