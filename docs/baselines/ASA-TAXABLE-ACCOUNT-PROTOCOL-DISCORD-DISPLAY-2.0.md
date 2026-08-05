# ASA-TAXABLE-ACCOUNT-PROTOCOL-DISCORD-DISPLAY-2.0

# Discord Operational Display Spec

**Status:** APPROVED (Phase 5-2)  
**Adapter:** `taxable_account/view/discord_adapter.py`  
**Input:** TaxableAccountViewModel 2.0 only

---

## Principle

Discord **Projection** is a display surface. It must not:

- compute sensors
- call Asset Selection / Regime Decision
- invent BUY/SELL beyond ViewModel `current_state.decision`
- import Legacy bots (`discord_morning`, `sox_*`, …)
- accept Trade Facts or mutate Position State

Discord **Trade Report Interaction** is a separate input surface  
（`taxable_account/trade/discord_input.py` + ops bot）:

- slash + confirm only
- maps to existing `TradeReportPort`（no Business Logic）
- does not replace this Projection spec

---

## Payload

| Part | Content |
|---|---|
| `content` | `【特定口座】{decision} \| {asset} \| {position_state}` |
| Embed title | `特定口座 運用判断` |
| Fields | Current State / Decision Reason / Capital Flow / Entry Timing / Position |

Default: **dry-run** (`RuntimeConfig.discord_dry_run=True`).  
Live send requires explicit non-dry-run / `--discord-live` / Phase 8 `--phase8-send`.

Webhook resolution (infra only — no Legacy protocol import):

1. `TAXABLE_DISCORD_WEBHOOK`
2. `DISCORD_WEBHOOK_URL` (shared SOX / CI webhook secret)
3. Optional gitignored `logs/*/discord_webhook.json` (`webhook_url` key)

---

## Runtime connection

```text
Market Data → Detection → Decision → State
  → ViewModel (2.0) → DiscordProjection
```

CLI paper view: `python -m taxable_account.ops --as-of YYYY-MM-DD`
