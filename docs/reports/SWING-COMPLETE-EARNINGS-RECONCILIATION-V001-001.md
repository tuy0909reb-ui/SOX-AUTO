# Earnings Event Identity & Reconciliation Quality Review

**Record ID:** `SWING-COMPLETE-EARNINGS-RECONCILIATION-V001-001`  
**Date:** 2026-08-15  
**Layer:** Fact only  
**Verdict:** **MODIFY**

## Scope

This pass improves the correspondence between the fixed 345 official
`earnings_event` population and all 103 immutable Gemini raw rows. It does not
calculate returns, win rates, rankings, signals, recommendations, or trading
rules.

## Design adjustment

The existing `event_reconciliation` contract represented only
`exact / candidate / conflict / unmatched`. It could not distinguish a normal
official event absent from the partial Gemini ledger from an unresolvable Gemini
row. The relation is extended, without a new layer, with:

- directional states: `official_only`, `gemini_only`, `unresolved`
- `resolution_reason`
- separately retained normalized/raw period-basis evidence
- an `event_identity_resolution` sidecar for date corrections while preserving
  `event_id`

This is necessary because an undifferentiated `unmatched` falsely mixes
coverage gaps with identity-resolution failure.

## Immutable / regression checks

- Gemini raw CSV unchanged.
- SHA-256 unchanged:
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`
- Security Master remains exactly 14 names.
- Official event count: **345 → 345**.
- Event IDs: preserved; no merge or deletion.
- Market observations: preserved.
- Legacy Phase A Gemini candidate relation and legacy empty reconciliation file:
  preserved.

`facts/event_identity_resolution.jsonl` records 288 corrected announcement
dates. These are field corrections only; each row has
`event_id_preserved=true`. No old-to-new ID mapping is needed because no ID
changed.

## Identity resolution result

The prior collector used a TDnet document identifier as a preliminary date
source. For 288 events, the document-detail metadata supplied a different
displayed calendar date. Those dates were corrected while keeping the original
event ID and setting:

- `announcement_time = null`
- `timestamp_quality = date_only`
- `announcement_date_source_priority = 4`
- `announcement_date_provenance_status = secondary_metadata`

The displayed secondary time was not used. The remaining 57 dates carry
`identifier_date_unverified`; they were not promoted to primary-clock evidence.

## Period-basis rules

The normalized vocabulary is restricted to:

```text
Q1_standalone / Q2_standalone / Q3_standalone
Q1_cumulative / Q2_cumulative / Q3_cumulative
full_year / forecast_only / revision_only / other / unknown
```

Gemini rows are normalized only where their original fiscal-period text
explicitly contains `累計`, `単体`, forecast, revision, or full-year evidence.
Ambiguous Q1/Q2/Q3 labels remain `unknown`; no reporting basis is guessed.
The raw label, raw fiscal-period text, and normalization reason are retained in
`facts/gemini_earnings_identity.jsonl`.

## Reconciliation outcome

Before this pass:

```text
exact 3 / candidate 5 / unmatched 431
```

After directional identity resolution:

```text
exact        31
candidate    18
conflict      0
official_only 299
gemini_only   54
unresolved     0
```

The result is no longer a one-to-one relabeling of the old 431 `unmatched`
rows. The old relation was built from 102 in-scope candidate rows with an
incorrect document-ID-derived date for many official events. The new relation
models **all 103 Gemini rows** and **all 345 official identities**:

```text
Gemini side: 31 exact + 18 candidate + 54 gemini_only = 103
Official side: 31/18 linked identities + 299 official_only = 345
```

`official_only` is expected and valid: Gemini covers only 8 names and does not
contain a complete six-year ledger. `gemini_only` means no safe document/full
composite identity was found. It is not silently discarded.

`candidate` denotes a shared source document whose Gemini row is explicitly a
forecast or revision component rather than the actual earnings-release identity.
It is not upgraded to `exact`.

## Per-security quality inventory

| Code | Official | Gemini | Exact | Candidate | Conflict | Official only | Gemini only | Unresolved | Basis unknown | Period end unknown |
|-|-:|-:|-:|-:|-:|-:|-:|-:|-:|-:|
| 5803 | 26 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 |
| 285A | 7 | 21 | 1 | 0 | 0 | 6 | 20 | 0 | 5 | 0 |
| 6857 | 26 | 28 | 19 | 8 | 0 | 0 | 1 | 0 | 7 | 0 |
| 6146 | 26 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 |
| 6920 | 25 | 0 | 0 | 0 | 0 | 25 | 0 | 0 | 0 | 0 |
| 4062 | 28 | 5 | 3 | 2 | 0 | 23 | 0 | 0 | 2 | 0 |
| 6525 | 11 | 0 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | 0 |
| 5801 | 27 | 0 | 0 | 0 | 0 | 27 | 0 | 0 | 0 | 0 |
| 8035 | 27 | 1 | 0 | 0 | 0 | 27 | 1 | 0 | 0 | 0 |
| 7735 | 32 | 17 | 5 | 8 | 0 | 21 | 4 | 0 | 2 | 0 |
| 3436 | 27 | 5 | 0 | 0 | 0 | 27 | 5 | 0 | 4 | 5 |
| 7011 | 26 | 13 | 1 | 0 | 0 | 25 | 12 | 0 | 0 | 1 |
| 7012 | 26 | 0 | 0 | 0 | 0 | 26 | 0 | 0 | 0 | 0 |
| 8306 | 31 | 13 | 2 | 0 | 0 | 29 | 11 | 0 | 0 | 0 |

All 345 official events remain `date_only`. No event was classified as
`datetime_confirmed`.

## Changed files

- `scripts/stock_swing/improve_earnings_reconciliation.py`
- `tests/test_stock_swing_reconciliation_quality.py`
- `data/stock/stock_swing/facts_phase_a/facts/official_earnings_event.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/gemini_earnings_identity.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/event_identity_resolution.jsonl`
- `data/stock/stock_swing/facts_phase_a/facts/event_reconciliation.jsonl`
- `data/stock/stock_swing/facts_phase_a/schemas/official_earnings_event.schema.json`
- `data/stock/stock_swing/facts_phase_a/schemas/event_reconciliation.schema.json`
- `data/stock/stock_swing/facts_phase_a/schemas/event_identity_resolution.schema.json`
- `data/stock/stock_swing/facts_phase_a/earnings_reconciliation_quality.json`

## Tests

```text
python -m unittest tests/test_stock_swing_reconciliation_quality.py \
  tests/test_stock_swing_official_earnings.py \
  tests/test_stock_swing_phase_a.py -v

14/14 OK
```

New coverage verifies:

- explicit-only Gemini period-basis normalization
- no date-only join
- multi-document provenance is one event, not a duplicate match
- forecast/revision component stays `candidate`
- event ID survives a corrected announcement date

## Cursor self-review

| Review point | Result |
|-|-|
| Official population | PASS — 345 IDs unchanged |
| Gemini immutability | PASS |
| 14-security Universe | PASS |
| Date-only protection | PASS — no time inference or `datetime_confirmed` promotion |
| Composite identity | PASS — document ID or security/date/period/basis required |
| Directional unmatched semantics | PASS |
| Duplicate event handling | PASS — provenance documents deduplicated by event ID |
| Conflict preservation | PASS — none found because numerical observations are out of scope |
| Fact boundary | PASS |

## Why MODIFY rather than GO

The Fact graph is now materially clearer, but GO would overstate the evidence:

1. 57 official dates remain identifier-derived and unverified.
2. 299 official-only events correctly expose the Gemini coverage gap rather
   than resolving it.
3. 54 Gemini-only rows need source-level investigation before they can be
   linked safely.
4. Full `datetime_confirmed` requires first-party disclosure timestamp
   acquisition, which is intentionally not inferred here.

The appropriate next work remains Fact-only: primary-source timestamp
verification and review of the remaining Gemini-only identities. Analysis must
remain blocked until that evidence is available.
