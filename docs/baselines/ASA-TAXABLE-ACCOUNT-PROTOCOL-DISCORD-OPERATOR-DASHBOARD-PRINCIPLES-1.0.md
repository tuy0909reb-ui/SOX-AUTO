# ASA-TAXABLE-ACCOUNT-PROTOCOL — Discord Operator Dashboard Principles 1.0

**Status:** DESIGN PRINCIPLES FIXED  
**Date:** 2026-08-07  
**Classification:** Display Design Authority（運用 Discord）  
**Protocol Rule Change:** NO  
**Parent Authority:** `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`  
**Display Mapping SoT:** `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-MAPPING-1.0.md`  

本ファイルは大要塞プロトコル Human Interface 上位原則に従属する。  
衝突時は Parent Authority が優先する。  
特定口座 Discord の具体写像は Display Mapping SoT を唯一の表示基準とする。

---

## 1. Fixed design principles

1. Discord はログビューアではなく、**Human Operator の運用ダッシュボード**である。  
2. 設計は「何を表示するか」ではなく、**「Human は今何を判断する必要があるか」**から始める。  
3. 表示する情報は、その判断に**必要最小限**とする。  
4. 判断に不要な情報は**表示しない**。  
5. 通常運用では、Human が **5秒以内**に現在の状況と次の行動を理解できることを完成条件とする。

---

## 2. Evaluation rule

```text
Human Architect / Operator が「全く分からない」と評価した時点で FAIL
```

- 内部情報を正しく写像していても、5秒で運用判断できなければ設計 FAIL  
- 項目追加・日本語化・内部状態の説明だけでは改善とみなさない  
- 「表示できる情報を並べる」発想は禁止  

---

## 3. Design sequence (mandatory)

1. この画面を見る人は誰か  
2. その人は何を判断したいのか  
3. 判断に最低限必要な情報は何か  
4. 不要な情報は何か  

その後に、表示フォーマットを設計する。

---

## 4. Non-goals

- デバッグ画面  
- ログビューア  
- Protocol / Sensor / State の説明書  
- 証券口座の代替（評価額・損益の管理画面化）  

---

## 5. Approved Human reading order（主画面）

Human Architect Review（2026-08-07）により、通常運用の主画面は
**Human の判断フロー順**に並べる（情報分類順ではない）。

1. **あなた** — 今、自分は何か行動する必要があるか（または何もしなくてよいか）  
2. **判断** — システムが現在どの結論を採用しているか  
3. **理由** — なぜその結論か  
4. **保有** — 現在何を保有しているか  

名称:

- 「状況」は使わない（市場状況・運用状況・内部状態に誤読されうる）  
- システムの結論は **「判断」** とする  

「主画面に載せないもの」リストは同レビューで承認済み。  
レイアウト実装は、本読み順の承認後に行う。

---

## 6. Authority

本ファイルは Taxable Account 運用 Discord の**設計原則の正本**とする。  
レイアウト詳細は本原則に従う別提案・承認の後に固定する。  
`ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-VIEW-DISCORD-3.0-DRAFT` の項目列挙は、本原則と衝突する場合 **本原則が優先**する。
