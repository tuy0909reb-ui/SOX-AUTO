# ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0

# Taxable Account Protocol — Runtime Freeze Baseline

**Status:** **AUTHORIZED** (after Phase 7 Operational Readiness PASS)  
**Date:** 2026-08-04  
**Parent reports:**

- Phase 6: `docs/reports/ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-REPLAY-PHASE6-1.0.md`
- Phase 7: `docs/reports/ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-READINESS-PHASE7-1.0.md`

---

## Freeze meaning

The following are **frozen for normal operations**. Changes require a new change request / registration — not ad-hoc “improvement” work.

### Frozen (protocol)

- Growth Decision / `dd15_ma200` / Recovery Model B
- `crash_15` / `semi_signal`
- Asset Selection priority (Growth→野村; Swing 1570 > 282A > CASH)
- Freeze Entry / Exit / ReEntry conditions
- 1570 Position Risk Stop: `stop_price = entry × 0.85`
- ViewModel schema **2.1** display contract (projection only)

### Frozen interface (ops)

- Runtime chain: Market → Detection → Decision → State → ViewModel → Discord
- Daily CLI: `python -m taxable_account.ops`
- State persistence: `FileStateStore` JSON SoT
- Discord: dry-run default; live webhook optional

### Related freeze（additive interface — not a protocol-rule change）

- Human Trade Report Port / Fact Journal **v1.0**:  
  Design: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Registration: `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Implementation Result: `docs/reports/ASA-IMPLEMENT-RESULT-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Status: **FROZEN IMPLEMENTATION**（Design `ASA-TAXABLE-HTR-PORT-FJ-1.0`；quantity Fact CORRECTION）  
  Implementation Commit: `1d6ee0ea7cfbbcfbdc4f4b3bfa4f6f1940e69638`  
  Design Digest: `9cf1d708280df88a0158065712795d47c99bb4fe9753b5dfeae61382754efafd`  
  Live fill confirmation premise: `auto_fill=False`（paper/test may differ）  
  Ops transport: `--report-buy` + optional `--quantity`（Journal Fact only）; `--record-entry` remains ENTRY_READY-only  

### Explicitly not authorized by this freeze

- Broker auto-order / live trading authorization
- Legacy protocol mutation or re-coupling
- New sensors / thresholds / strategy optimization

---

## Normal operations

```text
1. Update / ensure market CSVs
2. python -m taxable_account.ops --as-of <today> --state-file <path>
3. Read one-screen ViewModel / Discord projection
4. Operator executes broker action manually if needed
5. Record broker BUY fact via --report-buy <asset> <price> --trade-date <YYYY-MM-DD> --confirm
   (ENTRY_READY-only shortcut: --record-entry; Exit: --record-exit)
```

---

## Unfreeze rule

Any change to frozen protocol items requires:

1. Explicit user authorization  
2. New ASA registration report  
3. Re-run Phase 6 replay + Phase 7 readiness (or successor gates)
