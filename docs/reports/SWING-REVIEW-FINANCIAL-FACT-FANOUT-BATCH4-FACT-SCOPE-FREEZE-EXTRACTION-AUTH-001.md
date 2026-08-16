# Financial Fact Fan-out Batch 4 — Fact Scope Freeze & Extraction Authorization Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-FACT-SCOPE-FREEZE-EXTRACTION-AUTH-001`  
**Date:** 2026-08-16  
**Stage:** Authorization review only — this record neither materializes a Scope Freeze nor extracts Facts  
**Proposal:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH4-FACT-SCOPE-PROPOSAL-001`  
**Verdict:** **Fact Scope Freeze authorization APPROVE (with Conditions) / Extraction HOLD**

## Evidence checked

```text
Phase I Inventory: classified + official snapshot / SHA-256 for Q1–Q3
Selector-GO:       APPROVE for the three Batch 4-only selectors
Scope Proposal:    APPROVE for actual revenue only
```

Critical evidence limitation:

```text
Current selector validator: structural checks only
numeric_value_read:          false
numeric candidate uniqueness: not yet tested
```

The last point is decisive for Extraction. Structural selector GO is not
numeric binding GO.

## 1. Fact Scope Freeze — PASS (authorization only)

The proposed frozen membership is bounded, complete, and appropriate:

```text
Issuer: 5803
Metric: actual revenue / 売上高 only
Members: Q1 / Q2 / Q3 cumulative only
Documents: three specified doc-* TDnet primary Documents only
Selectors: batch4-5803-actual-revenue-q1/q2/q3 only
```

Excluded scope remains:

```text
forecast / revised forecast
FY full-year
other metrics / Events / issuers
Batch 1 5803 FY2027 Q1 Document or selector
Analysis / Ranking / Trading / PFOS / Decision
```

This is sufficient to **authorize** a subsequent Scope Freeze artifact. It is
not itself the Freeze artifact: no immutable Batch 4 scope JSON or SHA-256
exists yet, so the scope must not be described as already frozen.

## 2. Extraction Authorization — NEED REVISION

**HOLD.** The request requires `numeric candidate unique`, but existing proof
does not establish it:

```text
validate_financial_fact_batch4_selectors.py
  → structural row identity only
  → explicitly returns numeric_value_read = false
```

The three PDFs contain more than one numeric field on the actual row and more
than one `売上高` context on page 1. Before any Fact can be emitted, the
implementation must prove that the selected **first revenue column** is unique
within the exact actual row, and that no other numeric column, prior-year row,
or forecast table can bind.

## 3. Numeric Fail-Closed — NEED REVISION

The requested rule is correct but unimplemented. A numeric-binding validator
must first provide:

```text
positive:
  exact actual row + first 売上高 column → exactly one numeric candidate

negative:
  wrong column / second metric column
  prior-year row
  forecast row or forecast table
  duplicated numeric candidate
  missing / malformed numeric token
  wrong period / document / SHA / selector
```

It must emit no Observation or Fact while under validation. Only a later,
separate Extraction authorization may consume the approved numeric binding.

## 4. Boundary — PASS

The scope is Fact-layer only. Neither the Freeze authorization nor the
numeric-binding remediation authorizes Analysis, Ranking, Trading, PFOS, or
Decision.

## 5. Frozen Impact — PASS

Batch 0–3, V002, Event SoT, and Gemini ledger remain read-only. The required
work is Batch 4-only and additive:

```text
new Batch 4 scope manifest + SHA-256 (when Freeze is executed)
new Batch 4 numeric-binding validator/tests/log only
```

No frozen selector, snapshot, Fact, or Observation is changed or merged.

## 6. Architecture Risk — 有

1. **Premature Extraction:** treating a structurally unique row as a uniquely
   bound revenue value can select another field from that same row.
2. **Freeze ambiguity:** calling the Proposal an executed Freeze before an
   immutable scope artifact and scope hash exist.
3. **Scope creep:** allowing forecasts, full-year, or Batch 1 template
   material into the three-member actual-revenue scope.
4. **Boundary drift:** treating Fact extraction as authorization for Analysis
   or Decision.

## Modification proposal

| Item | Required change |
|---|---|
| Reason | Numeric uniqueness is a stated Extraction prerequisite but has not been proved. |
| Impact | Add a Batch 4-only numeric-binding design and local fail-closed validator; then run a separate numeric-binding GO review. |
| Batch 0–3 impact | None — all new work is additive; frozen artifacts stay read-only. |

## Final recommendation

```text
Batch 4 Fact Scope Freeze & Extraction Authorization Result:

1. Fact Scope Freeze:
PASS (authorization only)
理由: 3 Event / 3 Document / actual revenue only の境界は妥当。
      ただし Scope JSON + SHA を作成するまで「実行済 Freeze」ではない。

2. Extraction Authorization:
NEED REVISION
理由: numeric candidate unique が未証明。現 validator は
      numeric_value_read=false の構造検証のみ。

3. Numeric Fail-Closed:
NEED REVISION
理由: actual row 内の第一 売上高 column の数値一意性、wrong column、
      prior-year、forecast、duplicate numeric の reject が未実装。

4. Boundary:
PASS
理由: Fact Layer に限定。Analysis / Ranking / Decision へ接続しない。

5. Frozen Impact:
PASS
理由: Batch 0–3 / V002 / Event SoT / Gemini は read-only。加法のみ。

6. Risk:
有
内容: 構造一意性を数値一意性と誤認する Extraction、Scope artifact/hash
      なしの Freeze 表現、scope creep、Analysis/Decision への誤接続。

7. Final Recommendation:

Fact Scope Freeze:
APPROVE (authorization)

Extraction:
HOLD

Conditions:
1. Materialize a Batch 4 scope manifest that locks the three Event IDs,
   doc-* IDs, TDnet URLs, SHA-256 values, selector IDs, actual-revenue
   boundaries, and explicit exclusions; record its SHA-256 before calling
   Scope Freeze executed.
2. Do not add numeric values to the Freeze artifact.
3. Implement Batch 4-only numeric-binding fail-closed design and local tests.
4. Obtain separate numeric-binding GO / Extraction Authorization after those
   tests PASS.
5. No Observation, Fact, Acceptance, or Commit while Extraction is HOLD.
6. Keep Batch 0–3 / V002 / Event SoT / Gemini read-only, official-only,
   additive-only, and non-merge.
```

## Stop state

```text
Fact Scope Freeze authorization: APPROVE (not yet materialized)
        ↓
numeric-binding design + local fail-closed tests required
        ↓
numeric-binding GO review
        ↓
separate Extraction Authorization
        ↓
(only then) Fact Extraction
```

No Scope Freeze artifact, Fact Extraction, Observation, Fact generation,
Acceptance, or Commit is authorized by the extraction portion of this record.
