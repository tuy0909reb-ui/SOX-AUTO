# ASA-LIVE-VERIFY-PLAN — Asset Registry / Routing Policy 1.0

**Status:** REQUIRED / IN PROGRESS  
**Date:** 2026-08-06  
**Baseline:** ASA-TAXABLE-ASSET-REGISTRY-ROUTING-1.0  
**Isolation:**
- State: data/ops/taxable_state_live_verify.json
- Journal: data/ops/taxable_trade_facts_live_verify.jsonl

---

## Status Ladder

`	ext
Trade Fact Port: COMPLETE
Taxable Account Fact Foundation: IMPLEMENTED
Live Verification: REQUIRED
`

---

## Scenarios

### LV-1 Growth SELL (NEW — GROWTH_REGIME)

**Seeded now:** EXIT_PENDING / held=NOMURA_WORLD_SEMI

Discord:
`	ext
/report_sell asset:NOMURA price:100 trade_date:2026-08-06 quantity:1
→ Confirm Fact
`

Expect:
- accepted=True
- events includes TRANSFER_COMPLETE
- regime=SWING_ACTIVE
- held=CASH
- position=WATCH
- Journal: side=SELL asset=NOMURA_WORLD_SEMI routed_event=TRANSFER_COMPLETE source=DISCORD

### LV-2 Growth BUY recovery (NEW)

After LV-1, operator (or agent) applies ALERT_OFF → REENTRY_PENDING.

Discord:
`	ext
/report_buy asset:NOMURA price:110 trade_date:2026-08-06 quantity:1
→ Confirm Fact
`

Expect:
- events includes RECOVERY_COMPLETE
- regime=GROWTH_ACTIVE
- held=NOMURA_WORLD_SEMI
- position=WAIT

### LV-3 Swing BUY regression

Seed ENTRY_READY 1570, then:
`	ext
/report_buy asset:1570 price:10000 trade_date:2026-08-06 quantity:1
→ Confirm Fact
`

Expect: ENTRY_FILLED → POSITION_ACTIVE

### LV-4 Swing SELL regression

From POSITION_ACTIVE:
`	ext
/report_sell asset:1570 price:9900 trade_date:2026-08-06 quantity:1
→ Confirm Fact
`

Expect: ABNORMAL_EXIT + EXIT_FILLED → CASH/WATCH

### LV-5 Alias (optional)

Use display alias on Growth path:
`	ext
asset:野村
`
Must resolve via Registry (same as NOMURA).

---

## PASS criteria

| ID | Result required |
|---|---|
| LV-1 | PASS |
| LV-2 | PASS |
| LV-3 | PASS |
| LV-4 | PASS |

All four PASS → Live Verification COMPLETE for Registry/Routing.

---

## STOP

- Do not write fictional trades into production journal
- Do not run two discord_trade_bot processes
- Do not treat unit tests as Live PASS
