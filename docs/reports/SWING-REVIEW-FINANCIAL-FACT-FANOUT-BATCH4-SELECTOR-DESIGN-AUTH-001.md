# Financial Fact Fan-out Batch 4 — Selector Design & Fail-Closed Validation Authorization Review 001

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-DESIGN-AUTH-001`  
**Date:** 2026-08-16  
**Stage:** Authorization review only — selector fixtures and local fail-closed tests are not implemented by this record  
**Prior record:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH4-SELECTOR-PATTERN-001`  
**Verdict:** **APPROVE (with Conditions)**

## Interpretation of requested validation

The request correctly authorizes **selector-local fail-closed validation**: tests that prove a proposed selector does not bind the wrong document, period, row, page, or forecast table.

The request's prohibition on a “Validation Gate” remains in force for:

```text
Acceptance validation
Fact Scope validation
Fact / Observation validation
Commit readiness validation
```

This distinction is mandatory. Without it, “fail-closed validation” and “Validation Gate prohibited” would contradict each other.

## 1. Selector Design — PASS

Document-bound adjustment is required and appropriate for all three members. The Batch 1 `fujikura` fixture is immutable and remains limited to its frozen FY2027 Q1 Document.

| Event | Document | Required selector identity |
|---|---|---|
| Q1 `official-event-51acad93687c5010b1dd6baef0d4faff` | `doc-8cc5ba087bc65cad9b57aadbb7802607` | `2026年3月期第1四半期` |
| Q2 `official-event-d07fea2491fa5707a32e077f34c83e0d` | `doc-c13419293b865b8eb1f83311dd0b2660` | `2026年3月期中間期` |
| Q3 `official-event-d01b67f7bdd85249ac0800fac0ed3bb5` | `doc-1467205d56d15181a56a163e278528e2` | `2026年3月期第3四半期` |

Each proposed selector must bind all of:

```text
document_id + official URL + snapshot SHA-256
+ title basis: 〔日本基準〕(連結)
+ page 1
+ section: 連結経営成績
+ metric/table: 売上高
+ unit: 百万円
+ exact current-year actual row (above)
+ period_basis (Q1_cumulative / Q2_cumulative / Q3_cumulative)
```

## 2. Fail-Closed Validation — PASS

The requested conjunction is necessary but needs two additions to prevent the already-observed ambiguity:

```text
period match
+ exact current-year actual row match
+ document_id / official URL / SHA-256 match
+ expected page = 1
+ exactly one structural location
+ exactly one row-level actual-value candidate
+ actual-table boundary (not forecast table)
```

The `売上高` label appears in both actual and forecast areas on page 1. A page-level marker match alone is therefore insufficient. The selector must prove that its row is within `連結経営成績` and before the `連結業績予想` boundary; otherwise it must fail.

Required negative cases:

```text
wrong document ID, URL, or SHA-256
wrong fiscal-year row
Q2: 第1四半期 substituted for 中間期
Q3: 第1四半期 or 中間期 substituted for 第3四半期
wrong page
missing section/table/unit
multiple structural locations or multiple row-value candidates
forecast-row / forecast-table substitution
wrong period_basis
```

## 3. False Positive Prevention — PASS

The design specifically addresses the reported risks:

| Risk | Required control |
|---|---|
| Q1 fixture misbinding | Exact Q1 `document_id` + FY2026 row + SHA-256 |
| Q2/Q3 period confusion | Q2 requires `中間期`; Q3 requires `第3四半期`; reject Q1 marker substitutions |
| Page-1 false positive | Exact row plus structural boundary and unique candidate, not page presence alone |
| Forecast confusion | Require actual section boundary; reject `連結業績予想` candidates |

## 4. Fact Scope Boundary — PASS

Selector design and selector-local tests do not authorize:

```text
Fact Scope Proposal or Freeze
Fact Extraction
Observation or Fact generation
Acceptance / Commit validation
Commit
Analysis / Ranking / Trading / PFOS / Decision
```

After implementation, a separate review must establish selector GO. Only then may an Architect consider a separate Fact Scope Proposal for members that satisfy `A ∧ classified ∧ snapshot + selector GO`.

## 5. Architecture Risk — 有（bounded）

1. A selector can appear structurally unique yet bind the wrong number unless row-level actual-value uniqueness is tested.
2. Existing Batch 1 fixture reuse would silently reintroduce Q2/Q3 false positives.
3. Treating selector-local test PASS as Fact Scope approval would breach the required gate separation.

## Change proposal

| Item | Detail |
|---|---|
| Change reason | Existing selector is document-bound and fails safe reuse for this cohort. |
| Impact | Add Batch 4-only selector fixtures, a local validator, and synthetic negative cases under a new additive namespace. |
| Batch 0–3 impact | None. Frozen selectors, PDFs, outputs, V002, and Event SoT remain unchanged. |

## Final recommendation

```text
Batch 4 Selector Design Review Result:

1. Selector Design:
PASS
理由: 3件とも document-bound adjustment が必要であり、
      Batch1 fixture の drop-in reuse を禁止する設計が妥当。

2. Fail-Closed Validation:
PASS
理由: period + exact row + document/SHA + single candidate に、
      actual-table boundary を追加して page1 の予想欄混同を防ぐ。

3. False Positive Prevention:
PASS
理由: Q2 中間期、Q3 第3四半期、wrong-document、forecast substitution を
      負例として明示的に reject する。

4. Boundary:
PASS
理由: selector-local validation のみ。Fact Scope Proposal / Extraction は別ゲート。

5. Risk:
有
内容: row-level value ambiguity、Batch1 fixture reuse、selector PASS の
      Fact Scope approval への誤読。Conditions で抑制する。

6. Final Recommendation:

Selector Design:
APPROVE

Conditions:
1. Authorization is limited to Batch 4-only selector design and selector-local
   fail-closed tests for the three locked documents.
2. Do not modify or invoke Batch 1–3 selectors as cohort selectors.
3. Require document ID + official URL + SHA-256 + exact actual-row binding.
4. Require actual-table boundary and unique row-level candidate; page match alone fails.
5. Q2 must bind 中間期 / 2026年3月期中間期; Q1 fixture substitution fails.
6. Implement every listed negative case before selector GO can be reviewed.
7. No Fact Scope Proposal, Fact Scope Freeze, Fact Extraction, Observation,
   Fact generation, Acceptance, or Commit.
8. Preserve Batch 0–3 read-only, no V002 merge, no Event SoT change,
   Gemini-not-input, official-only, additive-only.
```

## Stop state

```text
Selector Design Authorization: APPROVE (this record)
        ↓
Architect authorizes implementation under Conditions
        ↓
Batch 4-only selector design + local fail-closed tests
        ↓
separate selector-GO review
        ↓
(only then) separate Fact Scope Proposal
```

This record does not implement selectors or execute any validation.
