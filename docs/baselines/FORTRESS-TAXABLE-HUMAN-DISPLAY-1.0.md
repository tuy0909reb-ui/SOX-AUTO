# FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0

**Document ID:** `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0`  
**Title:** 特定口座プロトコル — Human Display Layer Freeze Record  
**Status:** **FROZEN**  
**Date:** 2026-08-08  
**Path:** `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0.md`  
**Classification:** Human Interface Layer Freeze（Display + Discord Input Surface）  

---

## Freeze

```text
FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0

Freeze:

COMPLETE

Freeze Record:

docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0.md

Verification:

PASS

Baseline:

FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0

Changes after Freeze:

WORDING REVISION 2026-08-08（命令: 購入/売却、売却理由: 運用局面変更、CASH→予備戦力（現金）、VERIFY/Confirm 非露出）
```

---

## Parent Authority

- `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`
- `docs/principles/FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0.md`
- `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md`（表示写像 SoT）

**Downstream（従属・主表示を変更しない）:**

- `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-EVIDENCE-1.0.md`  
  （Evidence Layer・Design + Implementation FROZEN / 本 Display Freeze は REOPEN しない）

---

## Frozen Scope

本凍結は **Human Interface Layer** のみを対象とする。

| 含む | 含まない |
|---|---|
| 平時 Discord 4項目表示 | Sensor / Decision / Protocol Logic |
| Trade Result / Reject / Error / Cancel 表示 | Runtime / Execution |
| Discord Input（Choice・JP名称・preview） | Trade Fact / State / Journal schema |
| Mapping → Adapter → Message 経路 | Registry 構造 / Routing Policy |

Protocol Rule Change: **NO**

---

## Frozen Display Skeleton（変更禁止）

```text
【大要塞｜特定口座】

命令:
司令判断:
作戦理由:
戦力状況:
```

表示順固定。平時に本骨格以外の主フィールドを追加してはならない。

---

## Implementation Anchors（凍結時点）

| 役割 | パス |
|---|---|
| Mapping / HI text | `taxable_account/view/human_display.py` |
| Discord projection | `taxable_account/view/discord_adapter.py` |
| Discord input bot | `taxable_account/ops/discord_trade_bot.py` |
| Input adapter | `taxable_account/trade/discord_input.py` |

表示写像の詳細表は Mapping Baseline を唯一の SoT とする。  
本ファイルは **凍結宣言と範囲固定** であり、Mapping 表の複製正本ではない。

---

## Verification Summary

| 項目 | 結果 |
|---|---|
| Architecture（HI / Logic 分離） | PASS |
| Mapping 8ケース適用 | PASS |
| Human 5秒判断（Output） | PASS |
| Discord Input HI 整合 | PASS |
| Discord Visual Verification | PASS |

---

## Change Control

- 凍結後の表示・入力 Human 面の変更は、新バージョン発行（例: `…-1.1` / `…-2.0`）とする。  
- 本ファイルを上書きして意味を変えてはならない。  
- 変更には明示的な Human Architect 承認を要する。  
- Logic / Schema 変更を本凍結の改訂理由にしてはならない（別ゲート）。

```text
Status: FROZEN
FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0
Changes after Freeze: WORDING REVISION 2026-08-08
```
