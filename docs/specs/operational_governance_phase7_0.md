# AI編集秘書 Operational Governance仕様（Phase7-0）

**Version:** 1.0
**Status:** Approved（Phase7-0）
**Target:** 運用ルール / 変更管理 / 責務定義 / リスク管理
**Type:** 運用成熟化（既存機能変更なし）

---

# 1. 目的

Phase7-0 Operational Governance は、
Phase5（品質保証基盤）および Phase6（運用基盤）で構築された運用体系を、安全かつ継続的に維持するための運用ルール・責務・変更管理を定義するフェーズである。

本フェーズは以下のみを担当する。

* 運用責務の明確化
* 変更管理プロセスの定義
* 運用ルールの標準化
* リスク管理方針の定義
* Phase5/6との境界定義

本番コード（`tools/secretary/`）の変更は行わない。

---

# 2. 責務

Operational Governance の責務：

```text
Operational Rules
        │
        ▼
Governance Layer
        │
        ├── Responsibility Definition
        ├── Change Management
        ├── Risk Management
        ├── Operational Policy
        └── Boundary Control
```

具体的には：

1. 運用に関わる責務を明確化する
2. 変更管理プロセスを標準化する
3. 運用ルールを体系化する
4. リスク管理基準を定義する
5. Phase5/6との境界を維持する

以上のみ。

---

# 3. 対象範囲

対象：

```text
docs/
運用ルール
変更管理手順
責務定義
リスク管理方針
```

例：

```text
docs/
 ├── operations.md
 ├── governance.md
 └── change_management.md
```

対象外：

* CI/CDの実装変更
* Deployment方式変更
* Monitoring実装変更
* 自動化処理の追加
* 本番コード変更
* 技術実装方式の決定
* アーキテクチャ変更判断

---

# 4. 実装内容

## 4-1 Responsibility Definition（責務定義）

運用に関わる責務を定義する。

例：

```text
Monitoring責務
Incident Response責務
Observability責務
Automation責務
Change管理責務
```

要件：

* 各フェーズの責務を明文化する
* 責務の重複を避ける
* 本番コード変更責務を含めない

---

## 4-2 Change Management（変更管理）

運用に関わる変更の管理方法を定義する。

対象例：

```text
運用ルール変更
Workflow変更
Monitoring設定変更
Automation設定変更
```

変更フロー：

```text
変更起案
    ↓
影響確認
    ↓
承認
    ↓
適用
    ↓
結果確認
```

要件：

* 変更申請から適用までの流れを定義する
* 承認工程を必須とする
* 実装担当と承認担当を分離可能とする
* 緊急変更時の扱いを定義する
* Phase5/6の責務境界を維持する

---

## 4-3 Operational Policy（運用ルール）

運用ルールを標準化する。

例：

```text
障害対応ルール
通知ルール
ログ管理ルール
変更管理ルール
```

要件：

* ルールを文書化する
* 例外条件を定義する
* Secrets露出禁止を維持する

---

## 4-4 Risk Management（リスク管理）

運用リスクを管理するための基準を定義する。

対象例：

```text
変更リスク
運用リスク
自動化リスク
通知リスク
```

要件：

* リスク分類を定義する
* リスク評価基準を定義する
* リスク軽減策を定義する
* リスク受容基準を定義する

リスク判定例：

```text
Low
  → 通常承認で適用可能

Medium
  → 追加確認後に適用判断

High
  → 適用延期または上位判断
```

---

## 4-5 Boundary Control（境界管理）

Phase5/6との境界を維持する。

対象：

```text
品質保証（Phase5）との境界
運用基盤（Phase6）との境界
自動化（Phase6-3-C）との境界
```

要件：

* 境界を文書化する
* 責務逸脱を防止する
* 本番コード変更を禁止する
* Governance層が技術実装判断を行わない

---

# 5. 公開インターフェース変更

なし。

対象：

```text
tools/secretary/
```

は既存動作を維持する。

---

# 6. Operational Governance が行わないこと（禁止）

禁止：

* 本番コード変更
* CI/CD実装変更
* 自動復旧
* AIによる障害判断
* 自動Rollback
* Infrastructure変更
* Secrets変更
* Security設定変更
* 運用ルールの自動変更
* 変更管理の自動化
* 技術実装方式の決定
* アーキテクチャ変更判断

Operational Governance は、

**運用ルール・責務・変更管理・リスク管理の定義のみ担当する。**

---

# 7. エラー方針

* ルール不整合 → 修正
* 境界逸脱 → 差し戻し
* 変更管理不備 → 未承認扱い
* リスク評価不足 → 再評価

補正処理は禁止。

---

# 8. 完了条件

以下を満たすこと。

* [ ] 運用責務が定義されている
* [ ] 変更管理プロセスが定義されている
* [ ] 承認フローが定義されている
* [ ] 運用ルールが文書化されている
* [ ] リスク管理方針が定義されている
* [ ] リスク受容基準が定義されている
* [ ] Phase5/6との境界が明確化されている
* [ ] 自動化と人間判断の境界が維持されている
* [ ] `tools/secretary/` 未変更

---

# 9. 将来拡張方針

```text
Phase7-0
Operational Governance
        ↓
Phase7-1
Reliability Management
        ↓
Phase7-2
Security Operations
        ↓
Phase7-3
Advanced Automation
```

将来的には：

* SLO/SLA管理
* 信頼性指標の導入
* セキュリティ監査
* 条件付き自動化
* 高度な運用補助

などを追加可能。

---

# Version 1.0（Approved）

* Phase7-0 Operational Governanceを正式定義
* 運用責務・変更管理・リスク管理を標準化
* 承認フローとリスク受容基準を追加
* Phase5/6との境界を明確化
* 技術実装判断とGovernance責務を分離
* Phase7成熟化ラインの基盤として位置付け
