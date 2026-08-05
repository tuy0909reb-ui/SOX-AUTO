# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0

# Registration — Human Trade Report Port / Fact Journal (BUY/SELL)

**Date:** 2026-08-05  
**Timestamp:** 2026-08-05T23:45:00+09:00  
**Title:** Human/Broker common Trade Fact Input Port（BUY + SELL）  
**Status:** **FROZEN IMPLEMENTATION / REGISTERED**  
**Freeze ID:** `ASA-TAXABLE-HTR-PORT-FJ-1.0`  
**Version Tag:** `ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0`  

**Human Decision:** APPROVE FREEZE  
**Final Design Review:** APPROVE（Architecture / Runtime Owner）  
**Full Trade Flow Extension:** AUTHORIZED（既存 Exit 経路利用；Protocol 非改訂）  
**Implementation Result Record:** `docs/reports/ASA-IMPLEMENT-RESULT-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`  
**Implementation Commit:** `1d6ee0ea7cfbbcfbdc4f4b3bfa4f6f1940e69638`（initial）  
**Correction Commit:** `1c876d7513b76c6b765d47feed132c38b3ffec19`（quantity）  
**BUY/SELL Completion Commit:** `PENDING_AFTER_COMMIT`  

---

## Classification

```text
Operational Interface Extension
+ Runtime Extension
+ Operational Data Layer
```

**Protocol Rule Change:** NO  

Unchanged:

- Entry conditions / Exit conditions / Risk / Time Exit  
- Asset Selection / Detection / PositionState enum  

---

## Freeze artifact (Design)

| Field | Value |
|---|---|
| Design Record | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md` |
| SHA-256 Digest (current) | `5b499d9b47ccc9b56adc8a4db21ca75b61c18db2ee529e6bb1574c70ce108e06` |
| Size (bytes) | `8094` |
| Prior Digest (quantity correction) | `9cf1d708280df88a0158065712795d47c99bb4fe9753b5dfeae61382754efafd` |
| Prior Digest (initial) | `c733dd740bdd4b0c1f54809e75e163b68b0ad71803f1b9eff92005ca4b921579` |

---

## Scope (completed)

1. BUY/SELL 共通 Trade Fact Schema（`quantity` 必須）  
2. Fact Journal append-only（accepted/rejected）  
3. BUY → 既存 Entry 経路  
4. SELL → 既存 Exit 経路（EXIT→EXIT_FILLED / ACTIVE→ABNORMAL_EXIT→EXIT_FILLED）  
5. Human は内部 Event 名を指定しない  

```text
Human Trade Report = Runtime 同期 + 取引 Fact 蓄積
```

Schema: `docs/schemas/taxable_account_trade_fact.schema.json`  
Tests: **42 passed**

---

## Out of freeze

Ledger / 平均単価 / 部分約定 / 残数量 / 実現損益 / 税務 / Broker Adapter / Discord UI / Protocol 自動改善  

---

## Completion

```text
ASA-TAXABLE-ACCOUNT-PROTOCOL
Human Trade Report Port / Fact Journal

Status: FROZEN IMPLEMENTATION (BUY/SELL common Port)
Freeze Record: ASA-TAXABLE-HTR-PORT-FJ-1.0
Digest: 5b499d9b47ccc9b56adc8a4db21ca75b61c18db2ee529e6bb1574c70ce108e06
BUY/SELL Completion Commit: PENDING_AFTER_COMMIT
Tests: 42 passed
```
