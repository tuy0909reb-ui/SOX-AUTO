# ASA Knowledge Record — Legacy SOX Sensor Seal

**Record ID:** ASA-LEGACY-SOX-SENSOR-SEAL-1.0  
**Title:** 旧SOXセンサー封印（Discord通知停止 / アーカイブ保持）  
**Document Type:** Operational Seal Record  
**ASA Domain:** Legacy SOX Sensor Operations  
**Status:** **SEALED**  
**Version:** 1.0  
**Date:** 2026-08-10  
**Authority:** HUMAN_ARCHITECT  

```text
Purpose = Legacy SOX Discord path の停止（封印）
≠ コード削除
≠ Webhook無効化
≠ taxable_account / FORTRESS-TAXABLE 変更
≠ NDX / Portfolio スケジューラ停止
```

---

## 1. Why sealed

運用の Source of Truth は特定口座用新センサー（`taxable_account/detection`）へ移管済み。  
旧SOXセンサー（朝プロトコル / 防衛シリコン / PM / morning bot）からの Discord 通知を止める。

Root cause（封印前）:

| Path | State on origin/main (pre-seal push) |
|---|---|
| `.github/workflows/sox_protocol.yml` | **cron active** → `sox_protocol.py` + `silicon_protocol.py` → `DISCORD_WEBHOOK_URL` |
| `.github/workflows/pm.yml` | **cron active** → `pm_sox_protocol.py` → webhook |
| `.github/workflows/discord_morning.yml` | **cron active** → `discord_morning_bot.py` → bot token |
| Windows Task Scheduler | **No** SOX protocol tasks (NDX/Portfolio only — out of scope) |

Local tree had already removed cron but was **uncommitted / unpushed**, so GitHub Actions on `origin/main` kept firing Discord.

---

## 2. Inventory (retained — not deleted)

| Artifact | Role |
|---|---|
| `sox_protocol.py` | Morning judgment text |
| `silicon_protocol.py` | Defense sensors (WSTS / TSMC YoY / 200MA) |
| `pm_sox_protocol.py` | PM futures checks |
| `discord_morning_bot.py` | Morning Discord bot |
| `sox_utils.py` | Shared util (`send_discord` — still used by NDX) |
| `.github/workflows/{sox_protocol,pm,discord_morning}.yml` | Former auto runners |
| `legacy_sox_sensor_seal.json` | Seal state (SEALED / ACTIVE) |
| `legacy_sox_sensor_seal.py` | Runtime + CI gate |

---

## 3. What was stopped

1. GitHub Actions **schedule (cron)** removed from the three Legacy SOX workflows.  
2. Workflow jobs **skip Discord path** when seal status is SEALED.  
3. Protocol / bot entrypoints **block Discord outbound** via `send_discord_if_allowed` / early exit.  

Not stopped:

- `taxable_account` ops / Discord projection  
- Shared webhook secret `DISCORD_WEBHOOK_URL` (infra reuse for taxable)  
- NDX (`SOXAUTO_NDX_*`) / Portfolio (`SOXAUTO_Portfolio_*`) Windows tasks  

---

## 4. Unseal (Human Architect only)

1. Set `legacy_sox_sensor_seal.json` → `"status": "ACTIVE"` (or delete the file).  
2. Confirm intentional Discord destination.  
3. Optionally restore workflow `schedule` (not recommended while taxable is live).  
4. Push to `origin` so Actions pick up the change.

Emergency override env: `LEGACY_SOX_SENSOR_SEAL=active` (forces ACTIVE for one process).

---

## 5. Relation to Legacy Boundary

Companion: `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0.md`  

This seal is an **operational freeze of Discord outbound**, not a deletion of LEGACY knowledge warehouse.
