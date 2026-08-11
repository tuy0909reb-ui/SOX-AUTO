# FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0

**Document ID:** `FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0`  
**Title:** 大要塞プロトコル群 — Operation Domains 設計原則  
**Status:** **ACTIVE / DESIGN AUTHORITY**  
**Date:** 2026-08-07  
**Path:** `docs/principles/FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0.md`  
**Related:** `docs/principles/FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0.md`  

---

## 1. Position

本ドキュメントは、大要塞プロトコル群における **Operation Domain** 設計原則を定義する。

大要塞プロトコルは単一の親プロトコルではない。  
特定口座プロトコルを全体の親階層に置かない。

正しい整理は次のとおりである。

- **Human Interface Layer** — 全プロトコル共通の認知・表示原則  
- **Operation Domains** — 独立した作戦領域（並列）  

### 対象

- プロトコル体系  
- 責務分離  
- 独立性原則  
- Human Interface との関係  

### 対象外

- 個別 Protocol Logic  
- Runtime 実装  
- Execution Logic  
- Data Schema 変更  

本原則は上記対象外を変更しない。

---

## 2. System Structure

基本構造:

```text
FORTRESS PROTOCOL SYSTEM

├── Human Interface Layer
│
│   FORTRESS-HUMAN-INTERFACE-PRINCIPLES
│   └─ 全作戦共通の認知・表示原則
│
└── Operation Domains
    （並列・独立・非親子）

    ├── 特定口座プロトコル
    │   └─ 戦術運用ドメイン
    │      日常司令の主戦場
    │
    ├── SOX関連プロトコル
    │   └─ 市場偵察・判断支援ドメイン
    │
    ├── NISA長期防衛プロトコル
    │   └─ 長期資産形成ドメイン
    │
    └── その他作戦ドメイン
```

| Layer | 役割 |
|---|---|
| Human Interface Layer | 内部状態 → 作戦情報への変換。司令画面の認知モデルを共通化 |
| Operation Domains | 口座・目的ごとに独立した作戦ロジックと責務 |

「Main / Supporting」による親子階層は用いない。  
特定口座が日常司令の主戦場であることと、アーキテクチャ上の親であることは区別する。

---

## 3. 特定口座プロトコルの位置付け

### 3.1 でないもの

特定口座プロトコルは、

- **親プロトコルではない**  
- **他プロトコルを制御しない**  
- **Schema 上の Primary ではない**  

### 3.2 であるもの

特定口座プロトコルは、次を担当する。

- 局面判断  
- 資産配備  
- 投入判断  
- 待機判断  
- 移管判断  
- 売買実行管理（Human Trade Fact 等の運用境界を含む）  

そのため、次のように位置付ける。

| 位置付け | 意味 |
|---|---|
| **戦術運用ドメイン** | 局面に応じたエクスポージャー調整・配備・投入/待機/移管を担う |
| **日常司令の主戦場** | Human Operator が日々開く戦術司令画面の主対象（運用焦点） |

これは運用上の焦点であり、他ドメインへの支配関係を意味しない。

既存の役割分離（例: NISA＝長期、特定口座＝局面・機動）と整合する。

---

## 4. Operation Domain 独立性原則

各ドメインは **並列** である。

### 禁止

- 親子関係化  
- 不要な依存  
- 他ドメインへの吸収  
- 特定ドメインによる全体制御  

### 許可

- 必要情報の共有（明示された契約・境界の範囲）  
- Human Interface Layer による統一表示  
- 明確な契約による連携  

新ドメインの追加は、既存ドメインを親にせず **並列追加** を原則とする。

Portfolio / Fact 層における peer 平等（特定資産の schema 上 primary 化禁止）と矛盾させない。

---

## 5. Human Interface Layer との関係

Human Interface Layer は、各 Operation Domain 共通の認知層である。

目的:

内部状態を Human Operator が理解可能な作戦情報へ変換すること。

共通表示骨格（表示原則。Protocol Logic は変更しない）:

```text
【大要塞｜対象ドメイン】

命令:
〇〇

司令判断:
〇〇

作戦理由:
〇〇

戦力状況:
〇〇
```

| 注意 | 内容 |
|---|---|
| 表示原則である | Sensor / Decision / Runtime / Fact / Schema を変更しない |
| ドメイン明示 | 見出しに対象ドメインを含め、作戦の取り違えを防ぐ |
| 平時 / 異常 | 平時は簡潔。異常時のみ詳細展開（HI 原則に従う） |

詳細な HI 原則は `FORTRESS-HUMAN-INTERFACE-PRINCIPLES-1.0` を正本とする。  
本ドキュメントは Domain 体系と HI の接続を定義し、表示詳細は HI 原則に従う。

---

## 6. Naming

| 用語 | 採用理由 |
|---|---|
| Operation Domains | 並列・独立の作戦領域を表す。Hierarchy / Main-Supporting より親子誤読が少ない |
| 戦術運用ドメイン | 特定口座の局面・機動責務を表す |
| 日常司令の主戦場 | 運用焦点（HI の主対象）であり、アーキ上の親ではない |

廃語（本原則では用いない）:

- Main Operation / Supporting Operations（従属階層に読まれる）  
- Taxable-as-Parent  

---

## 7. Version

```text
FORTRESS-PROTOCOL-OPERATION-DOMAINS-1.0
```

改訂時は本ファイルを上書きせず、新バージョンを発行する。  
変更には明示的な Human Architect 承認を要する。
