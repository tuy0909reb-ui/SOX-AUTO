# SOX-AUTO V' Phase 2 Completion Report

Date: 2026-08-11  
Model: V' (GitHub Software SoT + Lean OneDrive Vault + Commit-Gate)  
Execution SoT unchanged: `C:\Users\User\SOX-AUTO`

---

## 1. GitHub Software SoT化

Pushed to `origin/main` (tip includes `__init__.py` fix):

| Commit | Purpose |
|---|---|
| `b659193` | ASA runtime + `.gitignore` harden |
| `aaa242d` | portfolio package, ops/NDX/scheduler/backup CLIs, taxable_account |
| `4ddfdd7` | docs/baselines·principles·reports·schemas, Actions, secretary, cursor rules |
| `4d6c988` | ASA specs + pytest/requirements |
| `ac91408` | Fix `_*.py` gitignore swallowing `__init__.py`; add `portfolio/__init__.py` |

### Classification applied

| Destination | Examples |
|---|---|
| **GitHub** | `src/asa_minimum_runtime/**`, `portfolio/**`, ops CLIs, taxable_account, tests, docs, workflows, `tools/secretary` |
| **OneDrive Vault** | ASA runtime data, DB backups, common_backtest datasets, backtest data, research, webhook JSON |
| **Local only** | Active `portfolio.db`, `node_modules`, `dist`, caches, scratch, `_tmp_*`, many `run_*` / `analyze_*` research runners |
| **Not dual-copied to Vault** | Google Drive collaboration SoT (pointers in Vault runbook only) |

### `.gitignore` notes

Added: `node_modules/`, `dist/`, `.pytest_cache/`, `data/asa_minimum_runtime/`, reports under common_backtest, `data/ops/`, etc.  
Critical fix: `!**/__init__.py` so package markers are not excluded by `_*.py`.

### Secret handling

- No hardcoded Discord webhook URLs / private keys found in staged Software SoT paths.
- Workflows reference `${{ secrets.* }}` only.
- Webhook JSON remains Local + Vault (not Git).

---

## 2. Clone Smoke Test

Fresh clone: `C:\Users\User\_sox_smoke_clone`

| Check | Result |
|---|---|
| ASA / portfolio / ops / NDX / scheduler / taxable / secretary present | PASS |
| Durable data absent from clone (`data/asa_minimum_runtime`, Active DB) | PASS |
| `npm ci` + `npm run build` | PASS |
| `from portfolio.db import connect` + ops module import | PASS (after `__init__.py` fix) |
| Sample ASA Jest (`RuntimeRecordHash`) | PASS |

Initial smoke **failed** until `portfolio/__init__.py` was un-ignored — treated as Software SoT gap; fixed and re-verified.

---

## 3. Lean OneDrive Vault

Created: `C:\Users\User\OneDrive\SOX-VAULT` (~43 MB lean)

```text
SOX-VAULT/
  ASA/asa_minimum_runtime/
  portfolio_backup/          # from logs/portfolio/backups (8 backup DBs)
  common_backtest/
  backtest/
  research/
  semiconductor_holdings/
  webhook_recovery/{portfolio,ndx}/
  recovery/PC-REPLACEMENT-RECOVERY-RUNBOOK.md
  other_required_assets/
```

Old full copy `OneDrive\SOX-AUTO` **retained** (not deleted).

---

## 4. Vault include / exclude

**Included:** ASA durable records, portfolio DB backups, common_backtest + backtest data, research tree, semiconductor_holdings, Discord webhook JSON, recovery runbook.

**Excluded:** `node_modules`, `dist`, caches, Active `portfolio.db` as execution DB, scratch/tmp, full source tree (Software SoT = GitHub).

---

## 5. Google Drive boundary

Collaboration SoT stays on Google Drive. Vault runbook has a pointer table for Human to fill concrete Drive paths. No wholesale Drive→OneDrive dual SoT.

---

## 6. Impact on current protocols

| Item | Change |
|---|---|
| Local Execution SoT path | None |
| Task Scheduler | None |
| Active DB location | None |
| ASA / Portfolio / FORTRESS / NDX / Discord live ops | None |
| OneDrive as production runtime | Not enabled |

---

## 7. PC replacement recovery path

Documented in Vault: `SOX-VAULT/recovery/PC-REPLACEMENT-RECOVERY-RUNBOOK.md`  
Summary: clone GitHub → restore Vault durable assets into Local → rebuild runtime → recreate Scheduler on Local → restore webhooks/secrets.

---

## 8. Level 3 status

| Level | Status |
|---|---|
| L1 asset restore path (GitHub + Vault + GDrive pointers) | **Established** |
| L2 manual run path | **Documented**; smoke shows Software rebuild works |
| L3 full automation restore | **Path established**; not executed on a second PC in this phase (no Scheduler rewrite on current PC) |

Remaining Human work for a real PC swap: fill Google Drive pointer table; re-auth Discord/API secrets; run `setup_*scheduler` against **new** Local path only.

---

## 9. Old OneDrive full copy

Recommend: **keep** until Human confirms one successful restore drill (or calendar buffer). Then archive or delete. Do not promote to Vault or production.

---

## Intentionally left Local (not Git)

Research runners (`run_*`, `analyze_*`, `evaluate_*`, …), `scripts/` scrapers, `scratch/`, `auto-scribe-ai/`, tmp outputs. Optional later: selective Git add of frozen research tools, or keep under Vault `research/` only.
