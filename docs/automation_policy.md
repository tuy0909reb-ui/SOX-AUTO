# Automation Policy（Phase7-3）

仕様: `docs/specs/advanced_automation_phase7_3.md`  
Framework: `docs/advanced_automation.md`  
Audit: `docs/automation_audit.md`  
Governance: `docs/governance.md` / `docs/change_management.md`（Phase7-0）

Governance / Reliability / Security / Deployment のルールを Automation 実行条件として扱う。  
未承認処理・Policy 逸脱時の実行は禁止する。

---

## 1. Policy Based Automation（対象 Policy）

| Policy | 参照文書 | Automation 実行前の確認内容 |
|---|---|---|
| Change Management | `change_management.md` | CHG 起案・影響確認・承認の有無。未承認は実行不可 |
| Security Policy | `security.md` / `secrets_policy.md` / `dependency_management.md` | Secret 露出リスク、Security 設定変更の有無、Dependency 更新の承認状態 |
| Reliability Policy | `reliability.md` / `slo.md` / `review_process.md` | SLO 未達時の無秩序改善でないこと、Improvement Item / CHG との接続 |
| Deployment Policy | `deployment.md` | Quality Gate、Environment、tag、production 承認ゲート |

### 1-1 Policy Check 必須化

```text
Automation Request
        ↓
Policy Check（上記すべて該当するもの）
        ↓
Pass → Risk Evaluation へ
Fail → 停止 + Audit Record（停止理由）
```

* 該当 Policy の確認を省略しない
* 「後で承認」での先実行は禁止
* Phase7-0 Governance の境界を侵さない（技術実装判断を Automation が行わない）

### 1-2 未承認・逸脱時

| 状態 | 扱い |
|---|---|
| Change 未承認 | 実行不可 |
| Security Policy 違反 | 実行不可 + Security Review / Incident 候補化を検討 |
| Reliability 無秩序改善 | 実行不可 + Review 差し戻し |
| Deployment 前提未充足 | 実行不可（例: production で Test 未成功） |

---

## 2. Human Approval Workflow

```text
Automation Request
        ↓
Policy Check
        ↓
Risk Evaluation
        ↓
Human Approval
        ↓
Execution
        ↓
Audit Record
```

### 2-1 承認要件（Risk 連動）

| Risk | Approval |
|---|---|
| Low | 事前定義範囲内は記録付き実行可。範囲外は人間承認 |
| Medium | Human Approval **必須** |
| High | Automation 実行禁止。手動対応＋上位判断 |

### 2-2 記録必須項目（承認時）

* 承認者（氏名またはアカウント）
* 承認日時
* 実行責任者（Execution を実施／起動する者）
* 承認対象（Automation ID / 範囲）
* Policy Result / Risk Result への参照

承認なし実行は禁止。実行責任者と承認者の分離を推奨（単独の無記録実行を避ける）。

### 2-3 緊急時

Phase7-0 Change Management の緊急フローに準拠する。

```text
緊急起案（最小差分・理由）
        ↓
可能な範囲での即時承認（事後必ず文書化）
        ↓
最小 Execution
        ↓
Audit Record 完成（未完成は未完了）
```

緊急を理由とした High Risk 自動実行・Secrets 自動変更・`tools/secretary/` 無審査変更は禁止。

---

## 3. Automation Request 記載項目（最低）

```text
Automation ID: AA-YYYYMMDD-NNN
起案者 / 日時:
Trigger:
対象:
意図する Execution:
関連 CHG / INC / SEC / REL（あれば）:
Policy Check 結果:
Risk 等級:
承認者 / 承認日時:（必要な場合）
実行責任者:
```

---

## 4. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7-0 | Change / Risk / 緊急フローの承認経路 |
| Phase7-1 | Reliability Improvement を Request 化する際の制約 |
| Phase7-2 | Security Policy / Secrets / Dependency 確認 |
| Phase6-1 | Deploy / Rollback 実行手段（承認後） |
| Phase6-3-C | 定型収集・補助（制約付き実行の代替にしない） |

---

## 5. 禁止事項

* 無承認 Automation
* Policy Check スキップ
* AI による承認代替・最終判断
* Audit 記録なしの実行
