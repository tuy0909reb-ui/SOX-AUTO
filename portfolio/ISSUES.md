# Portfolio operations — improvement candidates (Issues)

運用・実装・レビューで見つかった不便は、**すぐ設計変更せず**ここに Issue として残す。

設計変更は「一度困った」ではなく、**同じ課題が継続して発生した**ことを確認してから検討する。  
優先: 運用・実装での暫定対応 → 設計変更は最後の手段。

設計規範の正本は `.cursor/rules/portfolio-judgment-verification.mdc`（変更しない限り固定）。

---

## 運用版 v1.0（凍結・2026-07-18）

本プロトコルは **運用版 v1.0** として凍結し、実運用フェーズへ移行する。

以後の原則:

* 新規機能・設計変更・DBスキーマ変更・Rules変更・README設計内容の変更・CLI追加を**提案しない**
* 既存設計を前提に実装・運用・保守する
* 改善は**実運用で再現した問題**に限る（思いつき／一般論では設計変更しない）
* 課題はまず本ファイル（`ISSUES.md`）に記録する

設計変更の検討条件（すべて満たす場合のみ）:

1. 実運用で問題が再現した
2. 運用・実装では解決できない
3. 本ファイルに記録がある
4. 目安 1〜3か月の運用結果で必要性が確認された

優先順位: **運用 > 実装 > Issue記録 > レビュー > 設計変更（最後）**

---

## Template

```text
### ISSUE-XXX — short title
- Opened: YYYY-MM-DD
- Status: open | watching | mitigated | closed | design-change-candidate
- Where (運用): e.g. daily collect / monthly review / hypothesis entry / holdings
- What was inconvenient:
- Workaround (暫定対応):
- Why design change may be needed later (optional):
- Recurrence log: (dates when the same issue happened again)
```

---

## Open / watching

_(none yet)_

---

## Closed / mitigated

### ISSUE-001 — synthetic Fact rows blocked real collect (INSERT OR IGNORE)
- Opened: 2026-07-17
- Status: mitigated
- Where (運用): UAT / daily collect / monthly review
- What was inconvenient: Smoke-test `source=synthetic_smoke` rows for 2026-01..07 remained in `market_daily`/`fx_daily`. Re-running `collect_market_daily.py` skipped real Yahoo bars for those dates (`skipped_existing`), so July review showed absurd YTD (~+168%).
- Workaround (暫定対応): `DELETE` rows with `source='synthetic_smoke'`, then re-run collect. After cleanup, Jul 2026 returns looked market-plausible.
- Why design change may be needed later (optional): Not required yet — IGNORE is intentional for SoT safety. Ops rule: never write synthetic into the production DB path; watch for recurrence.
- Recurrence log: 2026-07-17 (UAT, once)
