# Financial Fact Fan-out Batch 4 — Selector Pattern Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-PATTERN-001`  
**Date:** 2026-08-16  
**Stage:** Selector Pattern Review only — no Fact Extraction, Observation, Fact Scope Freeze, or Commit  
**Authorization baseline:** Phase I Inventory COMPLETED (`SWING-EXEC-FINANCIAL-FACT-FANOUT-BATCH4-PHASE1-INVENTORY-001`)  
**Frozen Base Commit:** `cc7bea177a307417911c1c10857ee278a29ec723`  
**Verdict:** **APPROVE** (with Conditions) — path viable via **adjustment**; existing Batch 1 selector is **not** GO

## Scope checked

Frozen Phase I cohort only (5803 / 2026年3月期 Q1–Q3 / 3 Events). Compared against the **read-only** Batch 1 Fujikura fixture class (`fujikura` / `actual_revenue` / `single_page`) and the Batch 1 frozen Document `doc-30d27b92e5515686a4062726da7d133e` (FY2027 Q1) as a **layout reference only** — not as a reusable GO selector.

Probe artifact (additive):

```text
data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch4_phase1_inventory_001/selector_pattern_probe.json
```

NFKC-normalized PDF text used for marker checks (same normalization family as Batch 1 validator). No Observation / Fact rows written.

## Layout facts (page 1 cover table family)

All three Phase I PDFs share Batch 1 Fujikura cover-table family:

```text
section: 連結経営成績
table:   売上高
unit:    百万円
basis:   〔日本基準〕 / 連結
model:   single_page (page 1)
```

Period / current-year performance row labels differ:

| Event | Period basis | Current-year performance row (NFKC) | Notes |
|---|---|---|---|
| Q1 | Q1_cumulative | `2026年3月期第1四半期` | Same family as Batch1; fiscal year ≠ Batch1 `2027年3月期第1四半期` |
| Q2 | Q2_cumulative | `2026年3月期中間期` | Cover uses **中間期**, not `第2四半期` as the performance row |
| Q3 | Q3_cumulative | `2026年3月期第3四半期` | Period marker must be Q3-specific |

## Critical incompatibility (why existing selector is not GO)

Batch 1 Fujikura fixture markers as-is:

```text
連結経営成績 + 第1四半期 + 売上高 + 百万円
```

| Document | Page match for Batch1 fixture as-is | Safe? |
|---|---|---|
| Batch1 FY2027 Q1 | page 1 | Yes (its own frozen Document) |
| Phase I Q1 | page 1 | **Unsafe to reuse** — wrong Document / wrong FY row |
| Phase I Q2 | page 1 (**false positive**) | **No** — `第1四半期` appears in other cover text; performance row is `中間期` |
| Phase I Q3 | page 1 (**false positive**) | **No** — same false-positive class |

Therefore existing frozen Batch 1 selector cannot be declared GO for this cohort. Document-bound period/row adjustments are mandatory before any Fact Scope Proposal.

Adjusted marker conjunctions (location-only smoke; **not** approved selectors):

| Target | Markers | Unique page |
|---|---|---|
| Q1 | `連結経営成績` + `第1四半期` + `売上高` + `百万円` + `2026年3月期第1四半期` | 1 |
| Q2 | `連結経営成績` + `中間期` + `売上高` + `百万円` + `2026年3月期中間期` | 1 |
| Q3 | `連結経営成績` + `第3四半期` + `売上高` + `百万円` + `2026年3月期第3四半期` | 1 |

These are **review hypotheses**, not Architect-approved selector fixtures. Fail-closed negatives, unique value binding, and forecast/actual separation remain unfinished.

## Review Points

### 1. Existing Selector Compatibility — NEED REVISION

Existing Batch 1 Fujikura `actual_revenue` selector is Document-bound to FY2027 Q1 and fails closed for reuse: Q2/Q3 produce false page matches; Q1 still requires FY/row rebinding and separate fail-closed validation.

### 2. Event Classification

```text
Event 1: official-event-51acad93687c5010b1dd6baef0d4faff (Q1)
Selector Status: B — selector adjustment required
Reason: Same single_page JGAAP cover-table family, but Document/FY/row
        must be rebound to 2026年3月期第1四半期; Batch1 GO forbidden.

Event 2: official-event-d07fea2491fa5707a32e077f34c83e0d (Q2)
Selector Status: B — selector adjustment required
Reason: Same family, but period/row is 中間期 / 2026年3月期中間期.
        Batch1 fixture as-is false-positives on page 1.
        Not a new location_model, but not drop-in compatible.

Event 3: official-event-d01b67f7bdd85249ac0800fac0ed3bb5 (Q3)
Selector Status: B — selector adjustment required
Reason: Same family with Q3 period/row rebinding; Batch1 as-is false-positives.
```

None are A (existing GO). None require a wholly new location_model (C) on current evidence; if later fail-closed design cannot uniquify value binding on page 1 (売上高 appears twice; forecast block present), escalate that Event to C.

### 3. Fact Scope Proposal Readiness — NEED REVISION

Inventory terminals remain **C / classified** with snapshot. Selector GO is **not** met. Promotion rule still requires:

```text
work track = A
terminal = classified
snapshot + SHA-256 verified
selector pattern = separately approved and fail-closed
```

Fact Scope Proposal is **not** ready after this Review alone.

### 4. Boundary Validation — PASS

Review stayed in extraction-prep / provenance:

```text
Fact Extraction / Observation / Fact Scope Freeze / Validation / Commit: not done
Analysis / Ranking / Trading / PFOS / Decision: not started
Batch 0–3 / V002 / Event SoT / Gemini: untouched
```

### 5. Architecture Risk — 有

1. Reusing Batch 1 5803 selector/Document as template without fail-closed redesign (explicit Freeze Condition #8).  
2. Q2/Q3 false-positive page matches if `第1四半期` fixture is copied.  
3. Page-1 dual `売上高` + forecast block → actual/forecast ambiguity without row-level binding.  
4. Declaring track A before selector validation GO.  
5. Treating this Review as Fact Scope Freeze authorization.

Batch 0–3 impact of this Review: **none** (read-only baseline + additive probe JSON only).

## Modification proposal (for next gate, not implemented here)

| Item | Change |
|---|---|
| Reason | Existing selector not GO; document-bound adjustments required |
| Impact | New Batch 4 selector fixtures/validator only; Phase I inventory unchanged |
| Batch 0–3 impact | None — no mutation of frozen selectors, PDFs, Observations, or Facts |

Next authorized candidate gate (Architect decision):

```text
Batch 4 Selector Design + fail-closed Validation
  → only then Fact Scope Proposal for members that reach A + selector GO
```

## Final recommendation

```text
Batch 4 Selector Pattern Review Result:

1. Existing Selector Compatibility:
NEED REVISION
理由: Batch1 Fujikura selector は Document 固定。Q2/Q3 は as-is で
      false positive。Q1 も FY/row 再束縛が必要。

2. Event Classification:

Event 1:
Selector Status: B
Reason: same family; document-bound Q1 row adjustment required

Event 2:
Selector Status: B
Reason: 中間期 row/period variant; Batch1 as-is unsafe

Event 3:
Selector Status: B
Reason: Q3 row/period adjustment; Batch1 as-is unsafe

3. Fact Scope Proposal Readiness:
NEED REVISION
理由: selector GO 未達。Inventory は C/classified のまま。

4. Boundary:
PASS
理由: レビューのみ。Fact / Observation / Freeze / Commit なし。

5. Risk:
有
内容: Batch1 テンプレ流用、Q2/Q3 false positive、actual/forecast 曖昧性、
      早期 A 昇格、Review→Fact Scope 誤接続。

6. Final Recommendation:

Selector Review:
APPROVE

Conditions:
1. Do not declare existing Batch1/2/3 selectors GO for this cohort.
2. Treat all three as B — document-bound selector adjustment required.
3. Q2 must use 中間期 / 2026年3月期中間期 binding, not 第1四半期 fixture.
4. Next gate = Selector Design + fail-closed Validation (separate Authorization).
5. Fact Scope Proposal / Freeze / Extraction remain unauthorized.
6. Keep Batch 0–3 / V002 / Event SoT / Gemini read-only; additive only.
7. Do not use Batch1 5803 FY2027 Document/selectors as drop-in template.
```

## Stop state

```text
Phase I Inventory COMPLETED
        ↓
Selector Pattern Review APPROVE (B for all three)
        ↓
STOP — Selector Design / Validation Authorization required
        ↓
(only after selector GO) Fact Scope Proposal
```

No Fact Extraction, Observation, Fact Scope Freeze, Acceptance, or Commit is authorized by this record.
