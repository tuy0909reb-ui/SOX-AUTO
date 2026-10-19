# NISA annual plan — P0 notify + P1/P2 materials

Rules: `docs/baselines/ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0.md`  
Scope reply: `docs/reports/NISA-ANNUAL-PLAN-AI-TEAM-RESPONSE-2026-10-17.md`  
③ cycle baseline: `docs/baselines/ASA-SILICON-CYCLE-MONITOR-MATERIALS-1.0.md`

## P1 materials (① market + ② item compare)

```bash
python scripts/nisa_annual/build_p1_reports.py --as-of 2026-10-17 --plan-year 2027
```

Output: `data/nisa/annual/<plan_year>/market_trend_YYYYMM.{md,json}`  
and `item_compare_YYYYMM.{md,json}` (+ `data/nisa/annual/latest/pointer.json`).

Materials only. No adopt / switch / order.

## P2 materials (③ silicon cycle gate)

Shared core: `scripts/silicon_cycle/` (also feeds ongoing watch notify).

```bash
python scripts/nisa_annual/build_cycle_gate.py --as-of 2026-10-17 --plan-year 2027 --no-legacy
```

Output: `data/nisa/annual/<plan_year>/cycle_gate_YYYYMM.{md,json}`  
Pointer key: `cycle_gate`. Human judgment checkboxes only — no auto 一括／再設計.

## What P0 does

| Schedule (JST 09:00) | Kind | Purpose |
|---|---|---|
| 11/1 | `kick` | Start ①②③ for next plan year |
| 12/1 | `remind_dec1` | Item lock reminder |
| 12/8 | `remind_dec8` | Hard-deadline warning |
| (credit) | — | Hard deadline = **previous-month day 10** (Jan → Dec 10) |

No auto-adopt. No trade authorization.

## Local

```bash
# Dry-run (print message)
python scripts/nisa_annual/run_notify.py --kind kick
python scripts/nisa_annual/run_notify.py --as-of 2026-11-01 --auto
python scripts/nisa_annual/run_notify.py --as-of 2026-12-01 --auto
python scripts/nisa_annual/run_notify.py --as-of 2026-12-08 --auto

# Live send (needs dedicated webhook)
python scripts/nisa_annual/run_notify.py --kind kick --discord-live
```

Webhook (dedicated — not monthly / not 投資レビュー):

Human (2026-10-17): 未使用だった既存チャンネルを改修してNISA年次用に使用してよい。

1. そのチャンネルで「連携サービス → ウェブフックを作成」  
2. Save `logs/nisa_annual/discord_webhook.json`:
   `{"webhook_url":"https://discord.com/api/webhooks/...","channel_name":"…"}`  
3. Or set `NISA_ANNUAL_DISCORD_WEBHOOK`  
4. GitHub Actions secret: `NISA_ANNUAL_DISCORD_WEBHOOK`  
5. Test: `python scripts/nisa_annual/run_notify.py --kind kick --discord-live`

Idempotency: `data/ops/nisa_annual_notify_sent.json`  
Re-send: `--force`

## CI

`.github/workflows/nisa-annual-notify.yml` — schedule + `workflow_dispatch`
