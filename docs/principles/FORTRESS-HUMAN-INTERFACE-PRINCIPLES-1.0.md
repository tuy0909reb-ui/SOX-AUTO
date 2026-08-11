# FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0

**Document ID:** `FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0`  
**Title:** 大要塞プロトコル群 — Human Interface 共通設計原則  
**Status:** **ACTIVE / DESIGN AUTHORITY**  
**Date:** 2026-08-07  
**Path:** `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`  

---

## Position

本ドキュメントは、大要塞プロトコル群における Human Interface Layer の共通設計原則である。

本原則は以下を変更するものではない。

- Protocol Logic  
- Execution Logic  
- Data Model  
- Storage Structure  
- Internal Runtime Architecture  

対象は、内部状態を Human Operator が理解可能な作戦情報へ変換する
**Presentation / Interaction Layer** である。

目的は、内部システムの厳密性を維持しながら、Human Operator の認知負荷を低減し、
継続的な運用判断を可能にすることである。

適用対象の例:

- 特定口座プロトコル  
- SOX 関連プロトコル  
- 長期投資プロトコル  
- 今後追加される大要塞プロトコル系システム  

個別プロトコルの表示仕様は本原則に従属し、衝突する場合は本原則が優先する。

---

## 1. Purpose

本原則の目的は、

「内部情報を正しく表示すること」

ではなく、

「Human Operator が迷わず次の行動を判断できること」

である。

完成条件:

- Discord 等の運用画面を開いて短時間で判断可能  
- 現在の作戦状態を理解可能  
- 次の行動または待機判断が明確  

「全く分からない」と評価された時点で、その画面は **FAIL** とする。  
内部状態の写像が正しくても、運用判断ができなければ設計として不合格である。

---

## 2. Internal State と Human Display の分離

内部システムでは以下を厳密に管理する。

- Sensor  
- Decision  
- Runtime  
- Fact  
- Registry  
- Routing  
- Protocol State  

これらはシステム正確性のために保持する。

ただし Human Display では内部名称をそのまま露出しない。

内部状態は Human Operator が理解可能な作戦概念へ変換する。

```text
Internal State（厳密・非露出）
        ↓ 変換（Presentation / Interaction Layer のみ）
Human Display（作戦概念）
```

---

## 3. Human判断順による表示

表示設計は開発者の情報分類順ではなく、Human Operator の判断順に従う。

最初の問い:

「今、自分は何をする必要があるか」

そのため、表示順は原則として以下とする。

1. **命令**  
   - 次に行う操作  
   - または待機  

2. **司令判断**  
   - システムが採用している現在の結論  

3. **作戦理由**  
   - 判断を支える短い根拠  

4. **戦力状況**  
   - 現在保有している資産状態  

---

## 4. 大要塞プロトコル世界観の利用

軍事メタファーは装飾ではない。

Human Interface の認知モデルとして利用する。

目的:

- 状態理解の高速化  
- 判断迷いの低減  
- 長期運用時の認識統一  

ただし、世界観を優先して判断を困難にしてはならない。

作戦用語は、Human Operator が意味を直感的に理解できる場合に使用する。

---

## 5. 平時表示と異常表示の分離

通常運用表示:

- 短い  
- 判断中心  
- 行動中心  
- 不要な詳細を表示しない  

異常時表示:

- 原因確認可能  
- 必要な詳細を展開  
- 対応判断可能  

常時詳細表示は禁止する。

---

## 6. 開発者向け情報を Human 画面へ流用しない

以下は通常表示対象外とする。

- 内部イベント名  
- センサー名称  
- 状態コード  
- 技術的メタ情報  
- 候補一覧  
- 不要な数値詳細  
- 実装都合の説明  

必要な場合のみ解析画面・ログ画面で提供する。

---

## 7. 適用ルール

今後、大要塞プロトコル系の Human Interface を設計する場合、本原則を先に確認する。

UI 設計は、

「何を表示できるか」

から開始しない。

必ず、

「Human Operator が何を判断する必要があるか」

から開始する。

---

## 8. Downstream（従属・関連文書）

Operation Domain 体系（並列・非親子）:

- `docs/principles/FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0.md`

特定口座 Discord 運用表示は、本原則を Parent Authority として参照し再設計できる。

例:

- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DISCORD-OPERATOR-DASHBOARD-PRINCIPLES-1.0.md`

---

## 9. Version

```text
FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0
```

改訂時は本ファイルを上書きせず、新バージョン（例: 1.1）を発行する。  
変更には明示的な Human Architect 承認を要する。
