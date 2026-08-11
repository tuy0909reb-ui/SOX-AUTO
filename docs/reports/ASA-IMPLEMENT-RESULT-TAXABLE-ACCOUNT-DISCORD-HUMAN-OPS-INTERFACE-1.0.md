# ASA-IMPLEMENT-RESULT-TAXABLE-ACCOUNT-DISCORD-HUMAN-OPS-INTERFACE-1.0

## Summary

Implemented Discord Human Operation Interface (display layer only) for Taxable Account Protocol.
Operator-facing Discord / ops text now uses Draft 3.0 style Japanese labels without sensor names, raw regime enums, or internal event names.

## Constraints (unchanged)

- SOX Sensor
- Decision Logic
- Trading Protocol / Runtime Logic
- Trade Fact schema/semantics
- Asset Registry
- Routing Policy

## Files changed

| File | Change |
|---|---|
| `taxable_account/view/human_display.py` | New/rewritten JP human display maps and trade message formatters |
| `taxable_account/view/discord_adapter.py` | Embed rewritten to human fields; optional `state=` |
| `taxable_account/view/view_model.py` | Operator display strings only (`_next_action` → `next_operation`, reasons/flow/when/steps JP) |
| `taxable_account/trade/discord_input.py` | `preview_text` via `format_trade_draft_preview` (lazy import) |
| `taxable_account/ops/discord_trade_bot.py` | Confirm reply via `format_trade_result_message` (no raw `events=`) |
| `taxable_account/runtime/session.py` | `project_discord_payload(..., state=account)` |
| `taxable_account/validation/discord_test_send.py` | Expected field order / checks for human ops |
| `taxable_account/validation/live_dry_run.py` | ONE_SCREEN_FIELDS + title for human ops |
| `tests/test_taxable_account_human_discord_display.py` | New display-layer tests |
| `tests/test_taxable_account_phase5_ops_view.py` | Assertions updated |
| `tests/test_taxable_account_phase51_viewmodel.py` | Assertions updated |
| `tests/test_taxable_account_phase45_validation.py` | Discord content assertion updated |
| `tests/test_taxable_account_foundation.py` | Decision reason assertion updated |
| `tests/test_taxable_account_runtime_integration.py` | Embed title assertion updated |
| `tests/test_taxable_account_discord_trade_input.py` | Preview copy assertion updated |

## human_display APIs

- `phase_label`, `decision_sentence`, `decision_reason_sentence`, `next_operation`
- `market_environment`, `capital_flow_human`, `position_label`, `risk_status_jp`
- `format_trade_draft_preview`, `format_trade_result_message`, `outcome_from_events`, `reject_jp`
- `BANNED_OPERATOR_TOKENS`
- Fallback helpers when `state is None`: `phase_from_view_model`, `decision_from_view_model`, `position_from_view_model`

## Discord embed (Draft 3.0)

- **title:** `特定口座 運用判断`
- **content:** `【特定口座】{phase} | {decision} | {position}`
- **fields:** 運用フェイズ / 現在判断 / Entry状態 / 現在ポジション / 保有期間 / Exit監視 / 資金移動フロー / 次の操作 / 市場環境
- Risk ACTIVE → 監視中 (inside hold/exit field)
- Primary embed demotes P/L-heavy Reference Numbers

## Discord examples

### Growth (監視のみ)

```text
【特定口座】Growth Phase | 世界半導体株投資 維持 | 世界半導体株投資

運用フェイズ: Growth Phase
現在判断:
判断:
世界半導体株投資 維持
理由:
Growth Phase継続
次の操作: 不要（監視のみ）
```

### BUY result

```text
【取引報告 受理】
売買: BUY
資産: 1570
結果: BUYが反映され、保有を開始しました
フェイズ: Swing Phase
次の操作: 不要（監視のみ）
```

### Reject

```text
【取引報告 拒否】
理由: すでに保有中のためBUYできません
```

## Tests

Command:

```text
python -m pytest tests/ -k "taxable_account and (discord or view or phase5 or phase51 or phase8 or human or trade_report or discord_trade)" -q --tb=line
```

Result: **66 passed**, 70 deselected.

## Completion judgment

| Criterion | Status |
|---|---|
| Display-only (no Sensor/Decision/Protocol/Fact schema change) | PASS |
| JP operator surface without banned tokens | PASS |
| Embed fields / title match Draft 3.0 | PASS |
| Trade confirm uses human result message | PASS |
| Runtime passes `state=` when available | PASS |
| Tests updated + new human display tests | PASS |
| No Discord bot / live env started | PASS |

**Completion: PASS (display layer)**