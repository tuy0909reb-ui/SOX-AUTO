# Financial Fact Fan-out Batch 4 — Fact Scope Proposal 001

**Record ID:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH4-FACT-SCOPE-PROPOSAL-001`  
**Date:** 2026-08-16  
**Stage:** Fact Scope Proposal only — no Scope Freeze, Extraction, Observation, Acceptance, or Commit  
**Selector-GO:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-GO-001` → **APPROVE**  
**Frozen Base Commit:** `cc7bea177a307417911c1c10857ee278a29ec723`  
**Verdict:** **APPROVE** (Proposal only)

## 1. Proposal meaning

This record proposes which Facts may later be authorized for generation. It does **not**:

```text
freeze Fact Scope
authorize Fact Extraction
emit Observation / Fact
accept / commit
```

## 2. Proposed Fact Scope (candidate set)

```text
Company:  5803 (Fujikura)
FY label: 2026-03
Metric:   actual revenue (売上高)
Members:  Q1 / Q2 / Q3 cumulative — three Events, three Documents, three selectors
```

| # | Period | Event | Document | Snapshot SHA-256 | Selector | Exact row |
|---|---|---|---|---|---|---|
| 1 | Q1_cumulative / fiscal_period_end `2025-06-30` | `official-event-51acad93687c5010b1dd6baef0d4faff` | `doc-8cc5ba087bc65cad9b57aadbb7802607` | `32ac32bb…912e6c` | `batch4-5803-actual-revenue-q1` | `2026年3月期第1四半期` |
| 2 | Q2_cumulative / fiscal_period_end `2025-09-30` | `official-event-d07fea2491fa5707a32e077f34c83e0d` | `doc-c13419293b865b8eb1f83311dd0b2660` | `b88c7405…a9c1d3` | `batch4-5803-actual-revenue-q2` | `2026年3月期中間期` |
| 3 | Q3_cumulative / fiscal_period_end `2025-12-31` | `official-event-d01b67f7bdd85249ac0800fac0ed3bb5` | `doc-1467205d56d15181a56a163e278528e2` | `62596375…246bed` | `batch4-5803-actual-revenue-q3` | `2026年3月期第3四半期` |

Official URLs (TDnet primary only):

```text
Q1: https://www2.jpx.co.jp/disc/58030/140120250806532719.pdf
Q2: https://www2.jpx.co.jp/disc/58030/140120251106589866.pdf
Q3: https://www2.jpx.co.jp/disc/58030/140120260206550168.pdf
```

Scope key rule (Batch 1–3 aligned):

```text
candidate_document_id = doc-*
financial-document-*  = not used as Batch 4 scope key
```

## 3. Preconditions (restated)

Phase I Inventory historically recorded `work_track=C` while the selector gap was open. Selector-GO closed that gap. This Proposal restates promotion accounting for the three members:

```text
work_track = A
terminal   = classified
snapshot   = verified (Phase I inventory SHA-256)
selector   = GO (SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-GO-001)
```

| Event | A | classified | snapshot | selector GO |
|---|---|---|---|---|
| Q1 | YES (restated) | YES | YES | YES |
| Q2 | YES (restated) | YES | YES | YES |
| Q3 | YES (restated) | YES | YES | YES |

Event SoT rows are **not** mutated by this restatement. Promotion state lives in Batch 4 proposal / future Freeze artifacts only.

## 4. Fact definition (candidate payload shape)

Common for all three:

```text
security_id:           5803
accounting_standard:   JGAAP
consolidation:         consolidated
measure_kind:          actual
metric_name:           revenue
metric_name_raw:       売上高
unit_code:             JPY_million
currency:              JPY
candidate_page:        1
section:               連結経営成績
source:                official TDnet PDF snapshot (Phase I)
extraction_authority:  Batch 4-only selector (not Batch 1 fujikura fixture)
```

Per-member period binding:

| Member | period_basis | fiscal_year_label | fiscal_period_end | period / row binding |
|---|---|---|---|---|
| Q1 | Q1_cumulative | 2026-03 | 2025-06-30 | `第1四半期` + `2026年3月期第1四半期` |
| Q2 | Q2_cumulative | 2026-03 | 2025-09-30 | `中間期` + `2026年3月期中間期` |
| Q3 | Q3_cumulative | 2026-03 | 2025-12-31 | `第3四半期` + `2026年3月期第3四半期` |

**Numeric value:** not fixed in this Proposal. Selector-local validation was structural only (`numeric_value_read=false`). Candidate values become binding only under a later Extraction authorization with fail-closed unique numeric bind.

## 5. Explicit exclusions

```text
company_forecast / revised_forecast selectors
5803 FY2026 full_year Event
Batch 1 5803 FY2027 Q1 Document / selector (frozen; not a template)
7735 / 8306 / index-only Holds
unsupported selector patterns
Analysis / Ranking / Trading / PFOS / Decision / ASA Decision
```

## 6. Review Points

### 1. Proposal Scope — PASS

5803 2026年3月期 Q1–Q3 `actual revenue` is a bounded, additive Fact-layer cohort: one issuer, one FY, three consecutive cumulative periods, Selector-GO already APPROVE, distinct from Frozen Batch 1 5803 Document.

### 2. Preconditions — PASS

All three members satisfy `A ∧ classified ∧ snapshot ∧ selector GO` under the restatement above.

### 3. Fact Definition — PASS

Metric, period, official source Document, selector path, and expected payload shape are explicit. Numeric literals are intentionally deferred to Extraction.

### 4. Scope Boundary — PASS

This is a **candidate authorization proposal** only. It is not Fact Scope Freeze and not Fact Extraction permission.

### 5. Architecture Risk — 有（bounded）

1. Treating Proposal APPROVE as Freeze or Extraction.  
2. Importing Batch 1 5803 selector/values into Batch 4.  
3. Expanding to forecast / FY / other issuers without a new Proposal.  
4. Emitting Facts without fail-closed numeric uniqueness at Extraction.  
5. Merging with V002 or mutating Event SoT / Frozen Base.

Batch 0–3 impact: **none** (proposal artifact only).

## 7. Final recommendation

```text
Batch 4 Fact Scope Proposal Result:

1. Proposal Scope:
PASS
理由: 5803 Q1–Q3 actual revenue は bounded / additive / Selector-GO 済み。

2. Preconditions:
PASS
理由: 3 Event とも A（再掲）∧ classified ∧ snapshot ∧ selector GO。

3. Fact Definition:
PASS
理由: metric / period / Document / selector / payload shape を明示。
      数値は Extraction まで固定しない。

4. Boundary:
PASS
理由: Proposal = 候補認可提案のみ。Freeze / Extraction ではない。

5. Risk:
有
内容: Proposal→Freeze/Extraction 誤読、Batch1 テンプレ流用、
      範囲拡大、数値非一意のまま Fact 化、SoT/V002 汚染。

6. Final Recommendation:

Fact Scope Proposal:
APPROVE

Conditions:
1. Proposed members = the three rows in §2 only (actual revenue only).
2. This APPROVE does not freeze Scope, authorize Extraction, or emit Facts.
3. Next gate = separate Fact Scope Freeze Authorization (Architect).
4. Freeze (if approved later) must lock Event/Document/URL/SHA/selector IDs
   and candidate_fact_boundaries without numeric Fact emission.
5. Extraction (if ever authorized after Freeze) must fail-closed on unique
   numeric bind; structural Selector-GO alone is insufficient.
6. Keep Batch 0–3 / V002 / Event SoT / Gemini read-only; additive only;
   no merge/replace of frozen Facts.
7. Do not include forecast, FY full-year, or Batch1 5803 FY2027 Document.
```

## Stop state

```text
Selector-GO APPROVE
        ↓
Fact Scope Proposal APPROVE (this record)
        ↓
STOP — Fact Scope Freeze is a separate Architect gate
        ↓
(no Extraction / Observation / Fact / Commit)
```

No Fact Scope Freeze, Fact Extraction, Observation, Fact generation, Acceptance, or Commit is authorized by this record.
