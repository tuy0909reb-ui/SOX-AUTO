# 決算データ収集 — 実装前ゲート確定レビュー

**Record ID:** `SWING-DESIGN-KESSAN-COLLECTION-GATES-001`  
**Status:** Design review — no collection / analysis / trading rule implemented  
**Date:** 2026-08-15  
**Raw source (immutable):** `data/stock/stock_swing/research/kessan_ledger.csv`  
**Universe authority:** `docs/reports/SWING-MONITOR-CATALYST-CALENDAR-14-V0.1.md`  
**Layer:** Fact only（Review / Ranking / Decision / Position は対象外）

---

## Verdict

```text
MODIFY
```

### Why

実装前ゲートの骨格は定義できる。しかし、以下が未確定のまま大量収集へ進むと、
「14銘柄・2020年以降・同一基準で比較可能なFact集合」にならない。

1. Gemini原本は8銘柄のみ。6銘柄はイベント台帳が未存在。
2. 発表日時の一次ソース取得経路（TDnet / 会社IR / EDINET）が本プロジェクトで未選定。
3. 発表前コンセンサスのas-of取得は、無料経路では概ね期待できない。必須化すると計画が破綻する。
4. 日次OHLCVは取得可能性が高いが、企業行動監査付きの調整係数をyfinance任せにすると、後工程の反応比較が歪む。

したがって、**設計を追加確定してから段階実装**する。  
分析・勝率・売買条件は依然として開始しない。

---

## 1. 14銘柄ユニバース確認結果

### 1.1 確定ユニバース

監視対象14銘柄を、本収集の唯一の銘柄集合とする。

| Code | Name | Market | Fiscal year-end (working assumption) | Price coverage from 2020-01-01 |
|---|---|---|---|---|
| 5803 | フジクラ | TSE | Mar | listed throughout window |
| 285A | キオクシアHD | TSE Prime | Mar | **listed 2024-12-18**; earlier = `not_listed` |
| 6857 | アドバンテスト | TSE | Mar | listed throughout window |
| 6146 | ディスコ | TSE | Mar | listed throughout window |
| 6920 | レーザーテック | TSE | Jun | listed throughout window |
| 4062 | イビデン | TSE | Mar | listed throughout window |
| 6525 | KOKUSAI ELECTRIC | TSE Prime | Mar | **listed 2023-10-25**; earlier = `not_listed` |
| 5801 | 古河電工 | TSE | Mar | listed throughout window |
| 8035 | 東京エレクトロン | TSE | Mar | listed throughout window |
| 7735 | SCREENホールディングス | TSE | Mar | listed throughout window |
| 3436 | SUMCO | TSE | Dec | listed throughout window |
| 7011 | 三菱重工業 | TSE | Mar | listed throughout window |
| 7012 | 川崎重工業 | TSE | Mar | listed throughout window |
| 8306 | 三菱UFJ FG | TSE | Mar | listed throughout window |

Listing start for 285A / 6525 is based on JPX / company IPO disclosures and must be stored in security master with source URL.  
Fiscal year-end remains a working assumption until confirmed from each issuer’s latest IR note.

### 1.2 Gemini原本との差分

原本行数: **103**  
原本に存在するコード: `285A, 3436, 4062, 6857, 7011, 7735, 8035, 8306`（8銘柄）  
原本に無いコード: **`5803, 6146, 6920, 6525, 5801, 7012`（6銘柄）**

結論:

- 原本は「全14銘柄の6年台帳」ではない。
- 原本は raw_external として保持し、不足銘柄は Cursor 側で別収集する。
- 原本欠損を推測で埋めない。

### 1.3 期間ルール

```text
analysis_window_start = 2020-01-01
analysis_window_end   = as-of collection date (explicitly recorded)
```

- 上場日前の価格イベント結合は禁止。状態は `not_listed`。
- 上場日前でも、有報等の財務観測そのものは保持してよい。ただし株価反応Factには結合しない。
- 上場廃止・整理銘柄は現ユニバースに無いが、将来発生時は `delisted_after` を残し、削除しない。

---

## 2. 発表日時ソース優先順位

### 2.1 Priority order

1. **Issuer IR timely disclosure / TDnet filing timestamp**（最優先）
2. **Company IR calendar / earnings release notice PDF**
3. **EDINET / 有価証券報告書等**（提出時刻。決算短信発表時刻の代替にはしない）
4. **Secondary aggregator**（株探、IRBANK、銘柄スカウター等）— 補助のみ
5. **Gemini raw ledger date** — 突合用の原値。正規化日時の正本にはしない

### 2.2 Timestamp quality statuses

| Status | Meaning | Usable for session classification? |
|---|---|---|
| `datetime_confirmed` | date + time + timezone confirmed from priority 1–2 | Yes |
| `date_only` | calendar date confirmed, time unknown | No |
| `planned_date` | future / planned date | No |
| `unknown_time` | date present but time unresolved | No |
| `yuho_filing_only` | only filing/submission timing known | No for earnings-reaction session |
| `unresolved` | cannot establish a usable announcement date | No |

Hard rules:

- Never infer pre-open / midday / after-close from a date-only row.
- Never invent HH:MM.
- Store timezone explicitly (`Asia/Tokyo`).
- Keep original raw date string from Gemini ledger unchanged.

---

## 3. 比較可能性ルール

### 3.1 Observation axes (must be explicit fields)

Every numeric observation carries:

```text
security_id
event_id
metric_name
value_numeric
currency
unit_code          # JPY_million / JPY_oku / JPY_trillion / JPY_per_share / percent / share_count
measure_kind       # actual | company_forecast | consensus | prior_forecast | revised_forecast
period_basis       # Q1_standalone | Q2_standalone | Q3_standalone | Q1_cumulative | Q2_cumulative | Q3_cumulative | full_year | other
consolidation      # consolidated | non_consolidated | unknown
accounting_standard# JGAAP | IFRS | USGAAP | unknown
fiscal_year_label
period_end_date
as_of_timestamp
source_id
quality_status
```

### 3.2 Comparable only when all match

Two observations may be compared only if all of the following match:

- same security
- same `period_basis`
- same `measure_kind` pair allowed by analysis rule
- same consolidation
- same accounting standard
- convertible units under an explicit conversion table
- same currency

Otherwise: `not_comparable`.

### 3.3 Explicit non-comparisons

| Left | Right | Default |
|---|---|---|
| Q2 cumulative | Q2 standalone | `not_comparable` |
| company forecast | consensus | comparable only as surprise, never as identity |
| actual | forecast | comparable only with matched period/basis |
| JGAAP | IFRS across a switch without restatement map | `not_comparable` |
| 億円 string | 百万円 string without verified conversion | `unit_unverified` then convert or reject |
| 通期予想 | 四半期実績 | `not_comparable` |

### 3.4 Fiscal-year / accounting change

When fiscal year-end or accounting standard changes:

- create a break marker on security master
- do not silently splice pre/post periods into one continuous panel
- require restatement evidence before cross-break comparison

---

## 4. 株価・市場データの取得可能性

### 4.1 Required market Facts for later reaction analysis

- daily OHLCV
- unadjusted close (raw)
- adjusted close / adjustment factors
- volume
- corporate actions (split, consolidation, allotment, etc.)
- TSE trading calendar
- listed / not_listed intervals

### 4.2 Feasibility in this repository

Existing path:

- `scripts/lcs01_free_core/` already uses **yfinance** with `auto_adjust=False` and keeps Open/High/Low/Close/Volume/Adj Close for JP codes (`####.T` / alphanumeric codes).

Assessment:

| Item | Feasibility | Notes |
|---|---|---|
| Daily OHLCV 2020→ | High for long-listed names | Verify continuity per ticker before analysis |
| Raw vs Adj Close | Medium | Keep both; do not trust Adj Close alone |
| Corporate actions | Medium / needs audit | Prefer issuer/JPX notices; yfinance actions as candidate only |
| Trading calendar | High | JPX calendar or derived from observed sessions |
| Pre-listing prices | N/A | `not_listed` for 285A before 2024-12-18, 6525 before 2023-10-25 |
| Intraday | Out of scope for Phase A | Required only if session-level reaction is demanded |

### 4.3 License / usage constraints

- Yahoo Finance / yfinance: practical for research prototyping; redistributability and bulk commercial use are constrained. Store provider, retrieval time, and local raw snapshot.
- Kabutan / IRBANK / Monex Scouter pages in Gemini ledger: treat as **citation provenance**, not as license to scrape at scale.
- Official IR / TDnet / EDINET PDFs: preferred primary documents; respect site terms and rate limits.
- Paid consensus terminals (Bloomberg / Refinitiv / FactSet): not assumed available.

**Do not bulk-download in this gate phase.** Only confirm feasibility.

---

## 5. コンセンサス取得可能性

### Gate decision

```text
Consensus is OPTIONAL, not a hard requirement for Phase A Fact collection.
```

### Feasibility

| Need | Likely availability without paid terminal |
|---|---|
| Pre-release consensus as-of each historical announcement | Low |
| Current consensus for upcoming events | Sometimes available from free pages, but not historically as-of |
| EPS-only snippets (e.g. Trading Economics rows in ledger) | Partial, incomplete, unit/basis fragile |

Rules:

- If historical as-of consensus cannot be evidenced: `source_unavailable` or `not_investigated`.
- Never backfill today’s consensus onto past events.
- Never invent a consensus from later actuals.
- Surprise analysis is deferred until as-of consensus exists with timestamp.

---

## 6. Gemini原本との突合規則

### 6.1 Immutable raw layer

```text
raw_gemini_kessan_ledger
  - file_path
  - content_sha256
  - imported_at
  - raw_row_id (1-based data row)
  - all original columns as text
```

Never rewrite the CSV. Never overwrite a Gemini cell with a Cursor value.

### 6.2 Match keys (ordered)

Primary candidate key:

```text
security_id
+ announcement_date_or_datetime
+ fiscal_period_end_or_label
+ report_basis (standalone/cumulative/full_year/forecast)
```

Secondary disambiguators:

```text
measure_kind (actual/forecast/revision)
source_url
document_id
```

**Date-only join is forbidden.**

### 6.3 Match status

| Status | Meaning |
|---|---|
| `exact` | all primary keys match and typed values agree within unit conversion |
| `candidate` | keys partially match; human or later resolver needed |
| `conflict` | same event identity but values disagree |
| `unmatched` | Gemini row has no Cursor event, or Cursor event has no Gemini row |

Conflict rule:

- keep both values
- store `gemini_value`, `cursor_value`, `difference_note`
- choose neither automatically as “truth” for analysis until resolution record exists

---

## 7. 欠損ステータス

```text
not_investigated      # not yet looked up
source_unavailable    # investigated; no usable source
not_listed            # before listing / outside listing interval
not_applicable        # concept does not apply (e.g. consensus for non-covered name)
not_comparable        # exists but cannot be compared under rules
unit_unverified       # numeric text present; unit/currency not confirmed
parse_error           # source exists but could not be parsed
unknown_time          # date known, time unknown
date_only             # intentionally date-granularity only
planned_date          # planned / future date
yuho_filing_only      # only filing timestamp available
unresolved            # identity itself not established
```

Hard rules:

- no zero-fill
- no forward-fill of forecasts/actuals
- no mean-imputation
- blank in Gemini ledger remains blank in raw; normalized status must be explicit

---

## 8. 正規化後 Fact 構造案

All below are Fact / provenance.  
No win-rate, ranking, recommendation, decision, or position fields.

### 8.1 Entities

1. **security_master**  
   code, name, exchange, listing_start, listing_end, fiscal_year_end, accounting_standard_history, sources

2. **earnings_event**  
   event_id, security_id, announcement_date, announcement_time, timezone, timestamp_quality, fiscal_period_end, period_basis, consolidation, accounting_standard, document_urls, source_priority_used

3. **financial_observation**  
   observation_id, event_id, metric_name, value_numeric, currency, unit_code, measure_kind, as_of_timestamp, quality_status, source_id

4. **guidance_revision_observation**  
   revision_id, event_id, prior_forecast_ref, new_forecast_ref, direction_label_raw, direction_normalized (`up`/`down`/`unchanged`/`mixed`/`unknown`), quality_status

5. **market_observation**  
   security_id, session_date, open/high/low/close, volume, adj_close, adjustment_factor_ref, source_id

6. **corporate_action**  
   security_id, ex_date, action_type, ratio/factor, source_id, quality_status

7. **source_provenance**  
   source_id, provider, url, retrieved_at, content_hash, license_note

8. **reconciliation**  
   raw_row_id, event_id / observation_id, match_status, gemini_value, cursor_value, notes

### 8.2 Separation from analysis

Future derived tables (not Fact SoT):

- event-window returns
- hit-rate / expectancy
- rankings
- monitoring alerts

These must be regenerable and must cite Fact IDs.

---

## 9. 過学習防止（後で固定すべき項目）

Do **not** implement now. Freeze before any performance study:

| Topic | Must freeze later |
|---|---|
| Event window | e.g. [-5,-1], [0], [+1,+5] sessions; define session 0 using timestamp quality |
| Return definition | close-to-close vs open-to-close; adjusted vs raw |
| Hit / expectancy | sign threshold, cost assumptions, holding horizon |
| Features | surprise, revision direction, sector, prior run-up — list before fitting |
| Split | chronological train / validation / final holdout; no random shuffle by event |
| Dependence | repeated events on same name; same-day multi-name events; sector correlation |
| Coverage bias | exclude `not_listed` / `date_only` from session studies or mark separately |
| Survivorship | keep delisted/unavailable history if universe changes later |
| Consensus leakage | only pre-release as-of values |

---

## 10. 実装前の未解決事項

Must resolve before bulk collection:

1. **Official timestamp acquisition path** for this repo: TDnet vs issuer IR PDF workflow vs hybrid.
2. **Fiscal year-end confirmation** for all 14 names from issuer IR (especially 6920 Jun-year and 3436 Dec-year).
3. **Corporate-action audit source** if adjusted returns will be used.
4. **Consensus policy confirmation**: accept optional/`source_unavailable` for Phase A.
5. **Missing-six inventory strategy**: build event skeletons from issuer IR calendars first, not from Gemini ledger.
6. **Redistribution / storage policy** for Yahoo and IR page snapshots.

---

## 11. 推奨する次工程

### Phase A（実装開始候補・収集のみ）

1. Freeze security master for 14 names + listing intervals + sources.
2. Archive Gemini ledger with hash as immutable raw.
3. Build empty normalized schemas above.
4. Resolve earnings_event identity for long-listed names from official IR/TDnet, with timestamp quality.
5. Attach market_observation daily OHLCV (raw + adj candidate) only after listing_start.

### Phase B（まだ開始しない）

- typed financial/guidance extraction at scale
- consensus as-of backfill
- reaction metrics / win-rate / expectancy
- ranking or trading rules

### Exit criteria to flip this review from MODIFY → GO

- timestamp source path selected
- fiscal year-ends confirmed
- consensus remains explicitly optional
- Phase A schemas and raw archive policy accepted by Human Architect

---

## Summary judgment

```text
MODIFY
```

The collection architecture is clear enough to plan Phase A, but not yet clear enough to claim a finished comparable six-year Fact foundation for all 14 names.  
Preserve Gemini’s CSV untouched. Collect outside it. Do not analyze yet.

Commit was not created.
