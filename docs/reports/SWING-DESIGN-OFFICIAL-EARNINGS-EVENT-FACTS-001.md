# Official Earnings Event Facts — Additive Design

**Record ID:** `SWING-DESIGN-OFFICIAL-EARNINGS-EVENT-FACTS-001`  
**Status:** Design approved for implementation by plan acceptance  
**Date:** 2026-08-15  
**Layer:** Fact only  
**Parents:**
- `docs/reports/SWING-DESIGN-KESSAN-COLLECTION-GATES-001.md`
- `docs/reports/SWING-COMPLETE-KESSAN-PHASE-A-001.md`
- Universe: `docs/reports/SWING-MONITOR-CATALYST-CALENDAR-14-V0.1.md`

---

## Why existing design is insufficient

Phase A created Gemini-derived `earnings_event` rows (`inventory_status=raw_candidate`).
That relation is a **candidate seed**, not an official event identity.

It cannot express, without changing stored meaning:

| Need | Phase A gap |
|---|---|
| Official claim vs raw candidate | Same table mixes Gemini seeds only |
| consolidation / accounting_standard | Not in schema |
| source_priority_used | Not in schema |
| Multiple documents per event | Single `official_document_url` only |
| Raw official datetime text | Not retained separately |
| One-sided unmatched reconciliation | Existing `reconciliation` requires both `raw_row_id` and `event_id` |
| Fiscal-year / accounting breaks | No regime / break marker entity |

Mutating Phase A `earnings_event` into “official truth” would silently rewrite candidate semantics.
Therefore this design is **additive**.

---

## Immutable boundaries

1. `data/stock/stock_swing/research/kessan_ledger.csv` is never modified.
2. SHA-256 `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507` must remain recorded and re-verified.
3. Phase A `earnings_event.jsonl`, `raw_external/*`, and OHLCV candidate files remain as-is.
4. Gemini values are never overwritten by Cursor values.
5. No win-rate / expectancy / ranking / recommendation / position / trading-rule fields.

---

## Additive Fact relations

All new relations live under `data/stock/stock_swing/facts_phase_a/` (same Fact layer, new files).

### 1. `official_earnings_event`

Canonical official-event claim for 2020-01-01 onward.

```text
event_id
security_id
announcement_date            # YYYY-MM-DD or null
announcement_time            # HH:MM:SS or null; never inferred
timezone                     # Asia/Tokyo
timestamp_quality            # datetime_confirmed | date_only | unknown_time |
                             # planned_date | yuho_filing_only | unresolved
announcement_datetime_raw    # original source text
fiscal_year_label            # e.g. FY2025 or null + status
fiscal_period_end            # YYYY-MM-DD or null
period_basis                 # Q1_standalone | Q1_cumulative | ... | full_year | unknown
consolidation                # consolidated | non_consolidated | unknown
accounting_standard          # JGAAP | IFRS | USGAAP | unknown
source_id                    # primary provenance used for identity
source_priority_used         # 1..5 per gate order
inventory_status             # confirmed | candidate | not_listed | source_unavailable |
                             # not_investigated | unresolved | parse_error
document_count
```

Identity key (dedupe):

```text
security_id + fiscal_period_end + period_basis + announcement_date
```

If period_end unknown, fall back to `security_id + announcement_date + document_title_normalized`
and mark `inventory_status=candidate` / `unresolved` as appropriate.
Never invent quarter dates.

### 2. `earnings_event_document`

Many documents → one event.

```text
document_id
event_id
source_id
provider                     # tdnet | issuer_ir | edinet | secondary | gemini_raw
source_priority              # 1..5
url
document_title_raw
document_type                # earnings_release | yuho | quarterly_report |
                             # semi_annual | ir_calendar | other
filed_at_raw
content_hash                 # optional local snapshot hash
retrieved_at
```

Rule: additional PDFs attach here; they do **not** create duplicate events.

### 3. `security_reporting_regime`

Verified reporting attributes and breaks.

```text
regime_id
security_id
effective_from
effective_to                 # null = open
fiscal_year_end_month        # 3 / 6 / 12 etc., only if evidenced
consolidation_default
accounting_standard
break_kind                   # none | fiscal_year_end_change |
                             # accounting_standard_change | other
evidence_source_id
quality_status               # confirmed | not_investigated | unresolved
notes
```

Do not splice pre/post-break series silently.

### 4. `event_reconciliation`

New relation. Existing empty Phase A `reconciliation.jsonl` remains untouched.

```text
reconciliation_id
raw_row_id                   # nullable for official-only unmatched
official_event_id            # nullable for gemini-only unmatched
match_status                 # exact | candidate | conflict | unmatched
match_keys_used              # list/string of keys that matched
gemini_value                 # structured excerpt
cursor_value                 # structured excerpt
difference_note
```

**Date-only join is forbidden.**  
Primary match requires:

```text
security_id
+ announcement date/datetime
+ fiscal period (end or evidenced label)
+ report/period_basis
```

Secondary: measure_kind, source_url, document_id.

### 5. Provenance

Reuse `source_provenance.jsonl` by **appending** official fetch rows.
Do not rewrite Gemini provenance rows.

---

## Source priority

1. TDnet / issuer timely disclosure timestamp  
2. Issuer IR earnings materials / IR calendar  
3. EDINET filing metadata  
4. Secondary aggregators (hint only)  
5. Gemini raw ledger (reconciliation candidate only; never SoT)

Mapping to `timestamp_quality`:

| Evidence | Status |
|---|---|
| date + time + timezone from priority 1–2 | `datetime_confirmed` |
| calendar date only | `date_only` or `unknown_time` |
| planned / future IR date | `planned_date` |
| only 有報/四半期報告提出時刻 | `yuho_filing_only` |
| cannot establish announcement date | `unresolved` |

Hard rules:

- Never invent HH:MM.
- Never infer 場前 / 場中 / 引け後 from a date.
- Do not treat 有報提出時刻 as 決算短信発表時刻.

---

## Collection strategy

Hybrid (selected):

1. **Issuer IR library / calendar pages** — inventory completeness for all 14, especially the missing six and 8035 2020+.
2. **EDINET API v2** — filing evidence, document URLs, submit metadata; classify as `yuho_filing_only` unless the document is an earnings-release type with usable disclosure time.
3. **Gemini / secondary URLs** — hints and reconciliation targets only.

Universe bounds:

- Window: `2020-01-01` → collection as-of date.
- 285A before `2024-12-18`: `not_listed` for market linkage; financial disclosures may still be retained if evidenced.
- 6525 before `2023-10-25`: same rule.
- Consensus: optional; default `not_investigated` / `source_unavailable`. No backfill from current consensus.

---

## Output / verification package

Collector writes under `facts_phase_a/`:

- `facts/official_earnings_event.jsonl`
- `facts/earnings_event_document.jsonl`
- `facts/security_reporting_regime.jsonl`
- `facts/event_reconciliation.jsonl`
- matching `schemas/*.schema.json`
- `official_event_summary.json`

Must report:

A. per-security 2020+ official event counts  
B. timestamp_quality breakdown  
C. exact / candidate / conflict / unmatched counts  
D. securities / intervals with no confirmed official event  
E. missing-reason tallies  
F. source URLs + source_ids  
G. Phase A schema compatibility (no mutation of Gemini candidates)

Tests must prove:

- Gemini SHA-256 unchanged
- no date-only → `datetime_confirmed`
- no duplicate official events for same identity key
- missing-six not treated as empty-because-Gemini-absent
- Phase A tests still pass

---

## Authorization

```text
Why existing design is insufficient:
Phase A earnings_event is Gemini raw_candidate only and cannot carry official identity,
multi-document provenance, regime breaks, or one-sided reconciliation without semantic mutation.
```

This design is the authorization basis for additive schema + collector implementation.
Analysis / win-rate / trading rules remain out of scope.
