# Silicon cycle monitor (shared materials)

Baseline: `docs/baselines/ASA-SILICON-CYCLE-MONITOR-MATERIALS-1.0.md`

Shared **Review materials** for:

- NISA annual ③ cycle gate (`scripts/nisa_annual/build_cycle_gate.py`)
- Ongoing watch + Discord digest (`run_notify.py`)

Materials only. No lump-sum / redesign auto-label. Does **not** unseal legacy `silicon_protocol.py`.

## Build materials

```bash
python scripts/silicon_cycle/build_materials.py --as-of 2026-10-17 --no-legacy
python scripts/nisa_annual/build_cycle_gate.py --as-of 2026-10-17 --plan-year 2027 --no-legacy
```

Outputs:

- `data/ops/silicon_cycle/materials/materials_YYYYMMDD.{json,md}`
- `data/nisa/annual/<plan_year>/cycle_gate_YYYYMM.{json,md}`
- `data/nisa/annual/latest/pointer.json` → `cycle_gate`

## Watch notify

| Mode | Cadence |
|---|---|
| `normal` | 1st of month |
| `elevated` | Mondays (`watch_hint` or Human force) |

```bash
python scripts/silicon_cycle/run_notify.py --auto
python scripts/silicon_cycle/run_notify.py --as-of 2026-11-01 --auto
python scripts/silicon_cycle/run_notify.py --force-today --discord-live
python scripts/silicon_cycle/run_notify.py --human-force-elevated
```

Webhook (dedicated — not NISA annual / monthly / legacy SOX):

1. Create Discord webhook  
2. Save `logs/silicon_cycle/discord_webhook.json`:
   `{"webhook_url":"https://discord.com/api/webhooks/...","channel_name":"…"}`  
3. Or set `SILICON_CYCLE_DISCORD_WEBHOOK`  
4. CI secret: `SILICON_CYCLE_DISCORD_WEBHOOK`

State: `data/ops/silicon_cycle_watch.json`  
Workflow: `.github/workflows/silicon-cycle-watch.yml`
