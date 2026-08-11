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

- Human Trade Report Port / Fact Journal **v1.1（current Design SoT）**:  
  Design: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.1.md`  
  Registration: `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.1.md`  
  Freeze ID: `ASA-TAXABLE-HTR-PORT-FJ-1.1`  
  Design Digest: `aedc3288bd5c350d74531150a799d63671a476daece0f5d0b9f1468dcd095150`  
  Delta vs 1.0: Asset Registry routing note + Discord Trade Report Input Adapter **IN**（Protocol Rule Change: NO）  
- Human Trade Report Port / Fact Journal **v1.0（preserved historical Freeze）**:  
  Design: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Registration: `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Implementation Result: `docs/reports/ASA-IMPLEMENT-RESULT-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
  Status: **FROZEN IMPLEMENTATION**（Design `ASA-TAXABLE-HTR-PORT-FJ-1.0`；BUY/SELL common Port）  
  Implementation Commit: `1d6ee0ea7cfbbcfbdc4f4b3bfa4f6f1940e69638`  
  Correction Commit: `1c876d7513b76c6b765d47feed132c38b3ffec19`（quantity Fact）  
  BUY/SELL Completion Commit: `1a97622d1bdebf328cd7641bef905b914d7faa19`  
  Design Digest: `5b499d9b47ccc9b56adc8a4db21ca75b61c18db2ee529e6bb1574c70ce108e06`  
  Live fill confirmation premise: `auto_fill=False`（paper/test may differ）  
  Ops transport: `--report-buy` / `--report-sell` + `--quantity --confirm --trade-date`（Journal Fact only）  
  Discord Interaction transport: `python -m taxable_account.ops.discord_trade_bot`  
  （slash primary: `/購入報告` / `/売却報告` → confirm → `DiscordTradeInputAdapter` → Port；Projection webhook とは分離）  
  Discord Adapter Commit: `6d6d0eb0334da25d72672616723ca33b007225d9`  

### Live Position completion premise（additive — 2026-08-08）

**Authority:** `FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0` /  
`FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-CR-1.0` /  
`FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-AUTH-1.0`

Live daily CLI (`python -m taxable_account.ops --as-of …`) uses:

```text
auto_fill = False
auto_transfer = False
auto_exit_fill = False
```

via `live_ops_runtime_config()`.

Position completion events (`ENTRY_FILLED` / `EXIT_FILLED` / Growth `TRANSFER_COMPLETE` from HTR SELL)  
occur only after Human Trade Report + Trade Fact (Journal) acceptance.

Paper / Replay / Readiness may set `auto_transfer` / `auto_exit_fill` / `auto_fill` True for **Simulation** only  
（not interpreted as broker fills）.

**Out of this update:** Alert-OFF automatic `RECOVERY_COMPLETE`（separate CR candidate）.

Protocol Rule Change: **NO**（Entry/Exit/Risk/Selection conditions unchanged）.

### Explicitly not authorized by this freeze

- Broker auto-order / live trading authorization
- Legacy protocol mutation or re-coupling
- New sensors / thresholds / strategy optimization

---

## Normal operations

```text
1. Update / ensure market CSVs
2. python -m taxable_account.ops --as-of <today> --state-file <path>
   (Live: no auto_transfer / auto_exit_fill / auto_fill)
3. Read one-screen ViewModel / Discord projection（命令）
4. Operator executes broker action manually if needed
5. Record broker fact via --report-buy / --report-sell
   (or Discord trade bot) + --quantity --confirm --trade-date
   → Trade Fact Journal → Position completion
6. Admin shortcuts (not normal Live): --record-entry / --record-exit
```

---

## Unfreeze rule

Any change to frozen protocol items requires:

1. Explicit user authorization  
2. New ASA registration report  
3. Re-run Phase 6 replay + Phase 7 readiness (or successor gates)
