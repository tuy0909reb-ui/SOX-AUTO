# Official Earnings Event Collection — Implementation + Self-Review

**Record ID:** `SWING-COMPLETE-OFFICIAL-EARNINGS-EVENTS-001`  
**Date:** 2026-08-15  
**Design:** `docs/reports/SWING-DESIGN-OFFICIAL-EARNINGS-EVENT-FACTS-001.md`  
**Layer:** Fact only  
**Verdict:** **MODIFY**

---

## What was implemented

Additive Fact artifacts under `data/stock/stock_swing/facts_phase_a/`:

| Artifact | Role |
|---|---|
| `facts/official_earnings_event.jsonl` | Official 2020+ earnings-release identity |
| `facts/earnings_event_document.jsonl` | Multi-document attachments per event |
| `facts/security_reporting_regime.jsonl` | FY-end / accounting regime markers |
| `facts/event_reconciliation.jsonl` | Gemini raw ↔ official match statuses |
| `schemas/official_earnings_event.schema.json` (+3) | Additive schemas |
| `official_event_summary.json` | Coverage / quality / recon summary |
| `scripts/stock_swing/collect_official_earnings_events.py` | Collector |
| `tests/test_stock_swing_official_earnings.py` | Guardrail tests |
| `docs/reports/SWING-DESIGN-OFFICIAL-EARNINGS-EVENT-FACTS-001.md` | Design SoT |

Preserved unchanged:

- `data/stock/stock_swing/research/kessan_ledger.csv`
- SHA-256 `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`
- Phase A `earnings_event.jsonl` (Gemini candidates)
- Phase A empty `reconciliation.jsonl`
- OHLCV candidate file (20,466 rows)

---

## A. Official 2020+ event counts by security

| Code | Events | Notes |
|---|---:|---|
| 5803 | 26 | Missing-six closed |
| 285A | 7 | Post-listing window |
| 6857 | 26 | |
| 6146 | 26 | Missing-six closed |
| 6920 | 25 | Missing-six closed |
| 4062 | 28 | |
| 6525 | 11 | Missing-six closed; post-listing |
| 5801 | 27 | Missing-six closed |
| 8035 | 27 | 2020+ gap vs Gemini-2019 closed |
| 7735 | 32 | |
| 3436 | 27 | |
| 7011 | 26 | |
| 7012 | 26 | Missing-six closed |
| 8306 | 31 | |
| **Total** | **345** | `securities_without_official_events = []` |

---

## B. Timestamp quality

| Status | Count |
|---|---:|
| `date_only` | 345 |
| `datetime_confirmed` | 0 |
| `unknown_time` / `planned_date` / `yuho_filing_only` | 0 |

All `announcement_time` fields are **null**.  
Secondary aggregator times are retained only in `announcement_datetime_raw` and are **not** promoted to `datetime_confirmed`.

JPX PDF existence was verified (`source_priority_used=1`, `inventory_status=confirmed`) for the collected set, but JPX HEAD checks do not supply disclosure clock times.

---

## C. Reconciliation vs Gemini raw

| Status | Count |
|---|---:|
| exact | 3 |
| candidate | 5 |
| conflict | 0 |
| unmatched | 431 |

Interpretation:

- Official inventory is much denser than the Gemini ledger (8 names / mixed forecast rows).
- Date-only joins are forbidden; weak-key Gemini rows become `unmatched`.
- Low exact count is expected until Gemini fiscal labels are normalized to the same period_basis vocabulary.
- Conflict count is 0 because numeric Fact extraction was not in scope.

---

## D. Gaps / unresolved intervals

- No security remains with zero official events.
- 285A / 6525 coverage starts after listing; pre-listing market linkage remains `not_listed` in Phase A market data.
- Issuer-primary IR calendar scrape (priority 2 without aggregator) is not yet a separate path.
- EDINET API key workflow not used (API returned empty without subscription key).

---

## E. Missing-reason tallies

`missing_reason_counts`: empty for Universe members (all have ≥1 official event).  
Collection status for all 14: `ok`.

---

## F. Source URL / source_id

Primary document URLs are JPX disc PDFs when HEAD-verified, for example:

- `https://www2.jpx.co.jp/disc/58030/140120260806513575.pdf`
- Provider label: `IRBANK→tdnet`
- Full `source_id` list is in `source_provenance.jsonl` (appended; Gemini rows not rewritten)
- Sample listed in `official_event_summary.json`

---

## G. Phase A schema compatibility

- Gemini candidates not mutated.
- Additive relations only.
- Legacy `reconciliation.jsonl` left empty/untouched; new `event_reconciliation.jsonl` used instead.
- No Transition / Seed / Growth / Ranking / Recommendation / Position / win-rate fields.

---

## Tests

```text
python -m unittest tests/test_stock_swing_official_earnings.py tests/test_stock_swing_phase_a.py -v
→ 10/10 OK
```

Covered:

- ledger SHA immutability
- 決算短信-only parsing / duplicate collapse
- secondary time not marked `datetime_confirmed`
- date-only reconciliation rejected
- Phase A regression guardrails

---

## Cursor self-review

| Check | Result |
|---|---|
| 14-name coverage | PASS — all 14 have official events |
| Missing-six closure | PASS — 5803/6146/6920/6525/5801/7012 populated |
| 8035 2020+ | PASS — 27 events |
| Source priority honesty | PASS with caveat — JPX PDF verified, but clock time still secondary-raw only |
| timestamp quality | PASS — no false `datetime_confirmed` |
| fiscal period derivation | PARTIAL — title-derived; regime quality mixed confirmed/not_investigated |
| Reconciliation precision | MODIFY — exact matches sparse; unmatched dominated by Gemini sparsity + key vocabulary drift |
| Duplicates | PASS after excluding 補足/訂正 noise |
| Conflict handling | N/A for numerics (not collected) |
| Raw immutability | PASS |
| Phase A regression | PASS |

### Why not GO

1. No `datetime_confirmed` rows yet (issuer/TDnet primary clock still required).
2. Reconciliation exact rate is too low for “Gemini ledger fully aligned.”
3. Inventory path still depends on IRBANK as discovery mediator, even when JPX PDF is the stored primary URL.
4. Accounting/FY regime breaks need issuer-primary confirmation beyond title parsing.

### Required next step (still Fact-only)

1. Elevate announcement timestamps from issuer IR timely-disclosure pages or a licensed TDnet feed to produce real `datetime_confirmed`.
2. Improve reconciliation vocabulary mapping for Gemini `四半期区分` ↔ official `period_basis`.
3. Optionally add EDINET-keyed filing evidence as `yuho_filing_only` documents linked to the same events.

Do **not** start win-rate / reaction / ranking work.

---

## Completion judgment

```text
MODIFY
```

The missing-six / 8035 inventory hole is closed with additive official Facts, Gemini raw remains immutable, and analysis boundaries are intact.  
Timestamp confirmation and reconciliation precision are not yet complete enough for GO.
