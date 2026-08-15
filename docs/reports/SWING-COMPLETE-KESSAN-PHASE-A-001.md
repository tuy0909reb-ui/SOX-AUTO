# Swing Earnings Fact Collection — Phase A Implementation Review

- Implemented: 2026-08-15
- Scope: 14-security Universe, 2020-01-01 onward
- Decision: **MODIFY — Fact foundation is implemented; the event-identity inventory is not yet complete.**

## Scope and boundary confirmation

This implementation belongs solely to the **Fact** layer.  It creates source-preserving raw data, normalized Fact relations, and candidate daily market observations.  It does not calculate returns, win rates, expectancy, rankings, recommendations, positions, or trading rules.

No ASA source or investment-decision logic was changed.

## Created artifacts

- `scripts/stock_swing/build_kessan_phase_a.py`
  - Reads, hashes, and preserves the Gemini ledger without writing to it.
  - Emits the 14-member `security_master` and JSONL schemas for the requested Fact relations.
  - Produces 2020+ raw-derived earnings-event candidates without inventing times.
  - Optionally obtains daily OHLCV candidates through yfinance, explicitly marked `candidate_unverified`.
- `data/stock/stock_swing/facts_phase_a/raw_external/`
  - Original-row representation and manifest of the Gemini ledger.
- `data/stock/stock_swing/facts_phase_a/facts/`
  - `security_master`, `earnings_event`, `financial_observation`,
    `guidance_revision_observation`, `market_observation`, `corporate_action`,
    `source_provenance`, and `reconciliation`.
- `data/stock/stock_swing/facts_phase_a/schemas/`
  - Empty normalized-relation schemas.  No financial observations or corporate
    actions were inferred.
- `data/stock/stock_swing/facts_phase_a/phase_a_summary.json`
  - Machine-readable inventory, quality, coverage, and unresolved-state summary.
- `tests/test_stock_swing_phase_a.py`
  - Guardrail tests for raw immutability, Universe lock, missing-state separation,
    no inferred times/date-only reconciliation, and Fact boundary.

## Verification results

- Gemini source ledger: 103 rows; SHA-256
  `0653e78f753dcfd47c09c21f878bcfcacefc9a2abd2a178b9cb9da7185185507`.
  The SHA-256 was checked before and after generation and is recorded in every
  raw-external row and in the manifest.
- Universe: exactly 14 securities.  No non-Universe code is emitted to
  `security_master`.
- Listing boundaries: 285A starts on 2024-12-18 and 6525 starts on 2023-10-25.
  Market data does not fabricate pre-listing sessions.
- Gemini source coverage: 8 securities appear in the raw ledger; only 7 have
  in-scope 2020+ event candidates.  8035's sole raw event is dated 2019 and is
  preserved in raw external data but excluded from the normalized 2020+ event
  relation.
- Event candidates: 102.  The security-level counts are stored in
  `phase_a_summary.json`; they are raw-derived candidates, not confirmed
  official event identities.
- Timestamp quality: 82 `date_only`, 15 `yuho_filing_only`, 1
  `planned_date`, and 4 `unresolved`.  All candidate event times remain null;
  the collector never labels an event as pre-open, intraday, or post-close.
- Market observations: 20,466 candidate daily rows (Open, High, Low, Close,
  Volume, Adj Close), retrieved 2026-08-15 through yfinance.  285A has 402
  rows and 6525 has 684; the remaining 12 securities have 1,615 each.  These
  are not a corporate-action-audited price series.
- Reconciliation: schema and safeguards exist, but result counts are all zero.
  Raw rows are not silently matched by date, and no Cursor-side official
  earnings source has yet been collected to reconcile against them.
- Test result: 5/5 passed via
  `python -m unittest tests/test_stock_swing_phase_a.py -v`.

## Inventory gaps retained as explicit states

The Gemini raw ledger contains no rows for 5803, 6146, 6920, 6525, 5801, and
7012.  They are recorded as `not_investigated`, not represented with synthetic
quarter dates.  8035 is likewise `not_investigated` for the 2020+ scope despite
having one preserved 2019 raw row.

Fiscal-year-end values remain `not_investigated` until an issuer primary source
is captured.  Historical as-of consensus remains uncollected by design.

## Cursor self-review

The following implementation boundaries passed review:

1. Raw Gemini data is append-only external evidence; no output path writes to
   the original CSV.
2. Event time is never inferred from a date, and reconciliation has no
   date-only key.
3. The six absent raw-source securities are visible as missing work, rather
   than becoming false zero-event histories.
4. Market observations are marked as unaudited candidates; no adjustment
   coefficient or corporate action is asserted.
5. The Fact schemas contain no analysis, recommendation, or trade-decision
   fields.

The implementation does **not** pass the requested Phase A completion gate
yet, because official event identity, official timestamps, the six missing
event skeletons, and reconciliation are unresolved.  Marking it GO would
misrepresent those gaps.

## Required next step

Implement a source-specific official-IR/TDnet event-inventory collector and
review its output before collecting numerical financial observations.  It must
write source provenance, use the defined timestamp-quality statuses, produce
explicit unresolved records where evidence is absent, and only then populate
reconciliation statuses (`exact`, `candidate`, `conflict`, `unmatched`).
