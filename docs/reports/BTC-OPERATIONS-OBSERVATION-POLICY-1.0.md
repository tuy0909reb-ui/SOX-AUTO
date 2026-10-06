# BTC Operations — Observation Continuation Policy

**Record ID:** `BTC-OPERATIONS-OBSERVATION-POLICY-1.0`  
**Status:** **ACTIVE** — Human Architect 2026-08-28  
**Parent:** `BTC-DESIGN-DCA-HALVING-CYCLE-ANALYSIS-CONTRACTS-001` (`v1.1-sm-once-per-cycle`)  
**Prior phases:** A1 → A2 → A3 (FROZEN) → B (PASS) → C → D — **COMPLETE**  
**Mode:** **Observation Continuation** (≠ new analysis phase, ≠ adoption, ≠ refit)

---

## 1. Purpose

```text
2027〜2028年頃の国内BTC投資信託等を想定した実運用判断まで、
ETF後レジームを含む観測サンプルを増やす。

現時点の目的:
  戦略候補を固定したまま、同一定義でデータを蓄積・再適用・記録する。

現時点でやらないこと:
  戦略採用 / 変更 / X・E・R再最適化 / 新売買ルール / H2024フィッティング
```

---

## 2. Frozen baseline (immutable)

### 2.1 candidate_set

**Do not change** until a future Human-authorized new Contract Version + new `candidate_set_id`.

| rule_id | E | X | R | mode |
|---|---:|---:|---:|---|
| `E0_X540_R180` | 0 | 540 | 180 | once_per_cycle |
| `E0_X365_R180` | 0 | 365 | 180 | once_per_cycle |
| `E0_X730_R180` | 0 | 730 | 180 | once_per_cycle |

**SoT:** `research/btc_dca_halving/a3/a3-2026-08-27/candidate_set.json`  
**SM SoT:** `btc-dca-halving-contracts-v1.1-sm-once-per-cycle`

### 2.2 Completed analysis artifacts (append-only)

Do **not** overwrite:

- A1 / A2 / A3 / B / C / D versioned directories under `research/btc_dca_halving/`
- Contract documents and completion reports under `docs/reports/BTC-*`

New observation runs add **dated** outputs only (e.g. `a1/a1-YYYY-MM-DD/`, `c/cd-YYYY-MM-DD/`).

---

## 3. Current understanding (2026-08-28 snapshot)

Human Architect shared recognition — **descriptive, not adoption**:

| Item | Status |
|---|---|
| X=540 mechanically applied in H2024 (dsh=540 exit) | Observed |
| Persistent X=540 superiority | **Not proven** |
| H2020: X=365 ranked above X=540 on cycle excess | Observed |
| H2024: X=540 ranked above X=365/730 | Observed |
| W=540 dsh-matched window: H2024 excess ≈ pure DCA | Observed |
| BTC–QQQ co-movement post-ETF | Descriptive correlation only |
| ETF changed halving-cycle structure | **Not concluded** |
| H2024 cycle evaluation | **Incomplete** — too early for final judgment |

**Confound (mandatory in all post-ETF outputs):**  
`T_primary=2024-01-11`, halving SoT `2024-04-19`, 99-day ETF/halving proximity.  
Do not attribute outcomes to ETF alone.

**Classification:** v1 has no fixed numeric thresholds for `comparable` / `degraded` / `inconclusive`.  
Observation period continues with **`inconclusive` + quantitative diffs recorded** unless Human fixes OPEN-EV3.

---

## 4. Observation continuation — what to collect

### 4.1 Core panel (required each refresh)

| Field | SoT (current) |
|---|---|
| BTC-USD | Yahoo Finance `BTC-USD` |
| USDJPY | Yahoo Finance `JPY=X` |
| BTC-JPY | derived |
| Halving calendar / `cycle_id` | Contract §3.2 |
| `days_since_halving` | derived |
| Cycle price paths | A1 panel |
| MDD | derived (Review-style recompute) |
| Frozen rule fixed-application | `run_cd_fixed_application.py` engine |

### 4.2 ETF / market structure (descriptive layer)

| Series | Priority | Current gap |
|---|---|---|
| US BTC spot ETF **official net flow** | 1 | **Not in repo** — D used IBIT volume×close proxy only |
| QQQ / Nasdaq | 2 | Yahoo — partial |
| US 10Y | 3 | Yahoo `^TNX` — partial |
| Real yields | 3 | **Not in repo** (nominal 10Y only) |
| DXY | 5 | Yahoo `DX-Y.NYB` — partial |

### 4.3 On-chain (descriptive layer)

| Series | Status |
|---|---|
| MVRV / Realized Price | **Not in repo** — external source TBD |
| OI / Funding / Netflow / Fear & Greed | **Not in repo** — as needed |

**Prohibition:** None of the above may be introduced as **trading signals** or candidate_set inputs during observation.

---

## 5. H2024 focus paths (continue watching)

Until H2024 cycle completes and beyond:

```text
- Post–540-day price path (540 rule exited 2025-10-11)
- ~730-day vicinity (730 rule exit 2026-04-19)
- Remainder of H2024 cycle through next halving
- Post–next-halving behavior (calendar update additive only)
```

Comparison method for incomplete cycles:

- Prefer **dsh-matched windows** W ∈ {180, 365, 400, 540}
- Do not rely on naive final-return compare vs completed cycles alone

---

## 6. Operational workflow

```text
新データ取得
  → A1 panel refresh（日付版ディレクトリ）
  → 同一 Frozen candidate_set で固定適用再実行
  → 前回 run との差異を記録（Exit / FLAT / excess / MDD / post-exit BTC path）
  → 意味のある差異のみ D 型の記述説明（相関・期間統計；因果断定禁止）
  → データ蓄積（上書き禁止）
```

**Naming:** use **Observation Refresh** — not Phase E/F, not “next optimization step”.

**Cursor / agent rule:**

```text
観測 → 既存仮説との差異 → 必要なら差異説明 → データ蓄積
```

Do **not** pre-fix hypotheses such as “ETF → US-equity-linked” or “540 is optimal”.

---

## 7. Pre–live-deployment checklist (2027–2028)

Re-evaluate **only when** domestic BTC investment trust / similar products are actually purchasable:

1. Additional BTC cycle data (incl. completed H2024)
2. Post-ETF regime observations
3. Frozen-rule stability under extended sample
4. Product specs (domestic BTC fund)
5. Trust fees / tracking difference
6. DCA implementability
7. Sell / re-buy operational feasibility
8. Tax treatment

Analysis track and product/ops track stay **separate until integration gate**.

---

## 8. Known implementation gaps (non-strategic)

These do **not** block the observation policy; they affect **data quality and future verifiability**.

### 8.1 Data acquisition

| Gap | Risk | Mitigation (when authorized) |
|---|---|---|
| No official ETF net-flow SoT | D-layer explains poorly | Add external SoT + retention policy before 2027 gate |
| Real yield not fetched | Macro explanation incomplete | Add TIPS / breakeven source alongside ^TNX |
| MVRV / on-chain absent | On-chain layer empty | External provider contract; still descriptive-only |
| Yahoo single-source BTC/FX | Revision / outage | Log fetch timestamps; optional secondary cross-check |
| IBIT proxy ≠ net flow | Misread as “ETF flow signal” | Label proxy explicitly in all outputs |

### 8.2 Observation design

| Gap | Risk | Mitigation |
|---|---|---|
| ~~No scheduled refresh cadence~~ | Ad-hoc drift | **CLOSED 2026-10-06:** monthly cadence (below) |
| “Observation Refresh” unnamed in contract | Accidental new “Phase E” | This document + agent rule |
| OPEN-EV3 thresholds open | Permanent `inconclusive` | Accept during observation; fix before adoption gate only |
| Next halving ~2028 | `cycle_id` boundary | Additive calendar row; **no** candidate refit |

#### 8.2.1 Monthly cadence (Human authorized 2026-10-06 / expanded 2026-10-07)

```text
頻度: 月1回
Orchestrator: .github/workflows/monthly-data-refresh.yml
  1) python scripts/common_backtest/run_monthly_refresh.py
  2) python research/btc_dca_halving/run_observation_refresh.py
BTC-only manual: .github/workflows/btc-observation-refresh.yml (workflow_dispatch)
手動:
  npm run data:monthly-refresh
  npm run btc:obs-refresh
```

各回の成果物（上書き禁止・日付ディレクトリ）:

- `research/btc_dca_halving/a1/a1-YYYY-MM-DD/`
- `research/btc_dca_halving/c/cd-YYYY-MM-DD/`
- `research/btc_dca_halving/d/cd-YYYY-MM-DD/`
- `research/btc_dca_halving/obs/obs-YYYY-MM-DD/`（memo）

禁止は §9 のまま（candidate_set 変更・再最適化・採用判断なし）。

### 8.3 Future verifiability

| Gap | Risk | Mitigation |
|---|---|---|
| Engine drift if reimplemented | Non-reproducible obs | Reuse `run_a2_exploration.py` / `run_cd_fixed_application.py` |
| Dependency unpinned | 2027 replay differs | Record env / lockfile on each `run_meta.json` |
| Overwriting LATEST pointers | Lost history | Keep dated dirs; LATEST.txt is pointer only |

---

## 9. Prohibitions (observation period)

- candidate_set change
- E / X / R re-optimization on new data
- New trading rules or post-hoc rules fitted to H2024
- Investment adoption / strategy change from observation outputs
- Causation claims (ETF, QQQ, etc.)
- Writing judgment into portfolio Fact / PFOS Decision layers

---

## 10. References

| Artifact | Path |
|---|---|
| Design contracts | `docs/reports/BTC-DESIGN-DCA-HALVING-CYCLE-ANALYSIS-CONTRACTS-001.md` |
| Frozen candidate_set | `research/btc_dca_halving/a3/a3-2026-08-27/candidate_set.json` |
| Latest C | `research/btc_dca_halving/c/cd-2026-08-27/` |
| Latest D | `research/btc_dca_halving/d/cd-2026-08-27/` |
| Fixed-application engine | `research/btc_dca_halving/run_cd_fixed_application.py` |
| Panel builder | `research/btc_dca_halving/run_a1_descriptive.py` |

---

**End of policy.** Strategy remains frozen; time extends the sample.
