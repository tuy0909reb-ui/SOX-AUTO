# Financial Fact Fan-out Batch 2 — Scope Freeze Preflight (285A)

**Record ID:** `SWING-REVIEW-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-FREEZE-PREFLIGHT-285A-001`  
**Date:** 2026-08-16  
**Stage:** Freeze preflight only  
**Prerequisite proposal:** `SWING-DESIGN-FINANCIAL-FACT-FANOUT-BATCH2-SCOPE-PROPOSAL-285A-001`  
**Verdict:** **FAIL — stop; scope not frozen**

## 1. Requested Freeze posture

Human Architect Freeze Preflight asked to freeze 285A **only if** existing
canonical schema fully matches, using:

```text
Scope key: financial-document-*
```

and otherwise stop with no scope change, no SHA, no PDF work, no selector,
no Fact, and no commit.

## 2. Schema check result

```text
Schema check: FAIL
Scope: NOT FROZEN
SHA-256: NOT GENERATED
Execution: NOT AUTHORIZED
```

## 3. Reason (concrete mismatch)

### 3.1 Fan-out Batch 1 (Accepted / Frozen) uses `doc-*`, not `financial-document-*`

Accepted Batch 1 scope file:

`data/stock/stock_swing/facts_phase_a/facts/financial_fact_fanout_batch1_scope.json`

Every `candidate_document_id` is a `doc-*` Event-index Document ID, for example:

```text
doc-baaa8c108f185a8d884f783523b64519
doc-a77612b025395cda840c61b3fe2e2c02
…
doc-520d79d15d665c72ad87fd20f69b611e
```

Batch 1 snapshot manifest repeats the same `doc-*` keys. Batch 1 execution
writes those same `doc-*` values into additive Inventory / Observation /
source-link `document_id` fields under
`facts/financial_fact_fanout_batch1_001/`.

Batch 2 design requires horizontal reuse of the Batch 1 pipeline. Therefore
the fan-out scope key already defined by Accepted Batch 1 is:

```text
candidate_document_id = doc-*
```

Requested Freeze key:

```text
financial-document-*
```

This is **not** the Accepted Batch 1 fan-out Document ID schema.

### 3.2 `doc-*` and `financial-document-*` are distinct identifier namespaces

For the proposed 285A Event
`official-event-4bda3f4c595f5ba8b34646aada3f7681`:

| Namespace | ID | Role in current SoT |
|---|---|---|
| Event document index | `doc-f770b766ffff525fb1d4ac3879967278` | `earnings_event_document.jsonl` TDnet primary Document |
| Fact inventory / Observation | `financial-document-5093eae6342a5d06b7a39bd8961dad3f` | `financial_document_inventory.jsonl` + V002 / 64-Fact `source_document_id` |

They share the same official URL and the same existing local snapshot hash
`f78ce549…`, but they are **not the same Document ID**. No existing schema
equates them, merges them, or defines `financial-document-*` as the fan-out
`candidate_document_id`.

Inferring that equivalence in order to Freeze would be an unauthorized
identifier conversion. Preflight rules forbid that.

### 3.3 Existing V002 Facts confirm the second namespace, not the Batch 1 fan-out key

Canonical Observations for this Document already use:

```text
source_document_id = financial-document-5093eae6342a5d06b7a39bd8961dad3f
```

Pilot / Batch 0 additive outputs also use `financial-document-*`.

So:

- **V002 / Pilot Fact provenance** → `financial-document-*`
- **Accepted Batch 1 fan-out scope + outputs** → `doc-*`

These two systems coexist today. Freeze Preflight asked to use
`financial-document-*` as the Batch 2 **fan-out scope key**. That choice
matches V002 Observation IDs, but **contradicts** Accepted Batch 1 fan-out
scope representation. That is a schema conflict under the stated rule:

> Batch 0 / Batch 1の既存仕様と矛盾する → その場で停止

### 3.4 Checks against the six required preflight questions

| # | Question | Result |
|---|---|---|
| 1 | Is `financial-document-*` the Financial Fact **fan-out** canonical Document ID? | **No.** Fan-out Batch 1 uses `doc-*`. |
| 2 | Does `doc-*` ↔ `financial-document-*` match the proposal as one interchangeable scope key? | **No.** They are co-referent by URL/hash, not by ID equality. |
| 3 | Consistent with Batch 0 / Batch 1 scope expression? | **No for Batch 1 fan-out.** Batch 0/Pilot used `financial-document-*`; Batch 1 fan-out switched to `doc-*`. Freeze cannot silently pick one. |
| 4 | Consistent with V002 Fact identifiers? | V002 uses `financial-document-*`, but that does not make it the Batch 1-compatible fan-out scope key. |
| 5 | Event → Document → Observation → Fact provenance? | Dual Document IDs exist for the same official PDF; Freeze must not invent a merge. |
| 6 | Can `financial-document-*` be used as scope key without breaking existing fan-out schema? | **Not without a Human Architect Authorization that changes or dual-defines fan-out scope keys.** Auto-Freeze is therefore forbidden. |

## 4. What was not done

Per FAIL stop rules:

- scope file was **not** created or changed;
- scope was **not** frozen;
- SHA-256 was **not** generated;
- PDF was not acquired or replaced;
- selector was not implemented or validated;
- Fact / reconciliation / execution was not run;
- commit was not created;
- no identifier was rewritten or auto-converted;
- Batch 0 / Batch 1 / V002 / 345 Events / Gemini ledger were not modified.

## 5. Human Architect Review return

Freeze is blocked until Human Architect chooses an explicit Document ID policy
for Batch 2 fan-out membership. Options that may be reviewed later (not
executed now):

1. **Align with Accepted Batch 1 fan-out:** scope key =
   `doc-f770b766ffff525fb1d4ac3879967278`, cite
   `financial-document-5093eae6…` only as related inventory / V002 reference.
2. **Align with V002 / Pilot Fact IDs:** authorize a deliberate Batch 2 scope
   schema change to `financial-document-*`, with an explicit statement that
   this diverges from Accepted Batch 1 `doc-*` keys.
3. **Dual-cite without merge:** freeze both IDs as related fields, with one
   nominated `candidate_document_id` and one non-key citation field — only
   after schema Authorization.

Until one of those is authorized, 285A Batch 2 scope remains:

```text
Proposal: exists
Freeze:   blocked
SHA:      not generated
Execution: not authorized
```

## 6. Stop state

```text
Schema check: FAIL
Scope: NOT FROZEN
Scope key requested: financial-document-*
Scope key Accepted Batch 1 fan-out: doc-*
SHA-256: NOT GENERATED
Execution: NOT AUTHORIZED
Reason: Requested financial-document-* fan-out scope key conflicts with
        Accepted Batch 1 candidate_document_id = doc-* schema; doc-* and
        financial-document-* are distinct namespaces joined only by
        URL/hash co-reference, not ID equality.
```
