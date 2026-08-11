# ASA-TAXABLE-ACCOUNT-PROTOCOL-DISCORD-TEST-SEND-PHASE8.1-1.0

# Phase 8.1 — Discord Test Send

**Date:** 2026-08-05  
**Timestamp (attempt):** 2026-08-05T00:36:36+09:00  
**Title:** Controlled Discord UI / delivery test (deterministic sample)  
**Status:** **SUPERSEDED for delivery by Phase 8.2 PASS**  
*(8.1 first attempt: HTTP 403 via urllib; fixed by aligning POST to `requests` like SOX ops. Confirmed send in Phase 8.2.)*  
**Parent:** Phase 8 Live Operation Dry Run  

---

## Objective

Single controlled Discord test send to verify actual display.  
UI / delivery validation only. **No trading protocol changes.**

---

## Hard Constraints (confirmed)

| Item | Status |
|---|---|
| Growth / Detection / Asset Selection / Entry-Exit / Risk / State rules | **UNCHANGED** |
| ViewModel schema 2.1 | **UNCHANGED** |
| Legacy Protocol modules | **UNTOUCHED** |
| New logic / parameter changes | **NONE** (delivery User-Agent header only) |

---

## Execution path

```text
Deterministic sample TaxableAccountViewModel 2.1
  → Discord Adapter
  → Existing Webhook Infrastructure
  → Discord Channel
```

Command:

```text
python -m taxable_account.ops --phase8-send
```

Test data: deterministic Growth / MAINTAIN / 野村 sample (**NOT a trading signal**).  
Banner: `【TEST SEND / 特定口座】…`

Webhook source observed: `logs/portfolio/discord_webhook.json`

---

## Delivery result (first attempt)

| Item | Result |
|---|---|
| Webhook configured | **YES** |
| HTTP POST | **FAIL — HTTP Error 403: Forbidden** |
| `sent` | `false` |

Mitigation applied after attempt (delivery infra only, not protocol):

- Add `User-Agent: ASA-TaxableAccountProtocol/1.0` on webhook POST  
  (`discord_adapter.py`, `discord_test_send.py`)

**Re-run required** (operator / approval) to confirm live delivery:

```text
python -m taxable_account.ops --phase8-send
```

If 403 persists after User-Agent fix → webhook URL may be revoked or channel-restricted; rotate `DISCORD_WEBHOOK_URL` / `logs/portfolio/discord_webhook.json` (infra only).

---

## Display result (payload verified before/without successful HTTP)

### Field order — **PASS**

```text
Current State
Decision
Current Asset
Capital Flow
Next Action
Entry Timing
Reference Numbers
Risk Control
```

### Message snapshot

```text
Content:
【TEST SEND / 特定口座】HOLD | 野村世界半導体株投資 | MAINTAIN

Title: 特定口座 Protocol
Description: Phase 8.1 controlled UI test — deterministic sample (NOT a trading signal)

Current State:
  State: MAINTAIN
  Asset: 野村世界半導体株投資
  Decision: HOLD

Decision: HOLD / Growth条件維持
Current Asset: 野村世界半導体株投資
Capital Flow: Previous/Current/Next 野村… / Reason Growth条件維持
Next Action: dd15_ma200 Alert monitoring
Entry Timing: WAIT / Growth維持（新規Swing Entry対象外）
Reference: Entry 2024-01-04 @ 100 / Current 108.5 / P/L +8.50% / Holding 176 days / High DD -3.12%
Risk Control: N/A
```

Evidence files:

- `data/common_backtest/reports/taxable_account_phase81_discord_test_send/summary.json`
- `…/message_snapshot.json`
- `…/discord_test_send.log`

### Readability — **PASS** (payload)

| Check | Result |
|---|---|
| One-screen structure (8 fields) | PASS |
| No field truncation (≤1024) | PASS |
| Total embed field chars ~361 | PASS |
| Important numbers visible (108.5, +8.50%) | PASS |
| Risk N/A for Growth sample | PASS |

---

## Completion Criteria

| Criterion | Result |
|---|---|
| Webhook delivery | **FAIL / PENDING re-run** (403 on first send) |
| Discord rendering (payload / layout) | **PASS** |
| ViewModel fields displayed | **PASS** |
| One-screen readability | **PASS** |
| No protocol changes | **PASS** |

**Overall gate:** incomplete until a successful HTTP send (`sent=true`).

---

## Operator action

1. Confirm webhook URL is still valid (SOX Discord channel).  
2. Re-run once: `python -m taxable_account.ops --phase8-send`  
3. Visually confirm message in Discord.  
4. If `sent=true`, update this report status to **PASS** and record new timestamp.

---

## Interim confirmation

```text
Discord Test Send — PARTIAL.

Webhook delivery:
PENDING (403 on first attempt; User-Agent fix applied)

ViewModel Display (payload):
VERIFIED

Trading Protocol:
UNCHANGED
```
