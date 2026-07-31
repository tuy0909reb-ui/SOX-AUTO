# AI編集秘書 Coverage / Quality Gate仕様（Phase5-3）

**Version:** 1.0  
**Status:** Approved（Phase5-3）  
**Target:** `pytest-cov` / CI設定  
**Type:** 品質判定基盤整備（既存機能変更なし）

---

# 1. 目的

Phase5-3 Coverage / Quality Gate は、Phase5-2 CI/CD Integrationで構築した自動テスト実行環境へ、コードカバレッジ測定および品質判定基盤を追加するフェーズである。

本フェーズは以下のみを担当する。

- テストカバレッジ測定
- Coverageレポート生成
- 品質ゲート判定
- CI結果への反映

本番コード（`tools/secretary/`）には一切変更を加えない。

---

# 2. 責務

Coverage / Quality Gate の責務：

```

pytest
│
▼
Coverage Measurement
│
▼
Quality Gate
│
├── Pass
└── Fail

```

具体的には：

1. pytest-cov等によるCoverage取得
2. Coverageレポート生成
3. Quality Gate判定
4. CI Success / Failedへの反映

以上のみ。

---

# 3. 対象範囲

対象：

```

pytest設定
CI Workflow
Coverage設定

```

例：

```

.pytest.ini
pyproject.toml
.github/workflows/test.yml
.coveragerc

```

---

# 4. 実装内容

## 4-1 Coverage測定

pytest実行時にCoverageを取得する。

例：

```bash
pytest --cov=tools/secretary
```

要件：

* 対象範囲を明示する
* ローカルとCIで同一結果になる
* Coverage測定のみ行う

---

## 4-2 Coverageレポート生成

生成形式：

例：

```
term
html
xml
```

用途：

* CI確認
* 将来の品質分析
* Coverage推移管理

要件：

* Coverage結果を確認可能な形式で出力する
* レポート生成失敗はCI Failureとして扱う

---

## 4-3 Quality Gate判定

Quality GateはCoverage結果を基準値と比較し、CI結果へ反映する。

判定方式：

```
Coverage >= 設定基準値
        ↓
Pass

Coverage < 設定基準値
        ↓
Fail
```

要件：

* 基準値はプロジェクト運用方針に基づき設定する
* 基準未達はCI Failureとして扱う
* 基準値未達を隠蔽しない
* 自動補正しない

※ Phase5-3では品質ゲート機構を定義し、具体的なCoverage基準値は運用状況に応じて決定可能とする。

---

# 5. 公開インターフェース変更

なし。

対象：

```
tools/secretary/
```

は変更しない。

---

# 6. Coverage / Quality Gate が行わないこと（禁止）

以下は禁止する。

* 本番コード変更
* テスト内容変更
* Coverage不足箇所の自動修正
* AIによる品質評価
* テスト結果改ざん
* 自動リファクタリング
* 外部サービス通知
* デプロイ処理

Coverage / Quality Gateは **品質判定基盤のみを担当する**。

---

# 7. エラー方針

* pytest失敗 → CI Failure
* Coverage基準未達 → CI Failure
* Coverage生成失敗 → CI Failure
* 補正処理は禁止

---

# 8. 完了条件

以下を満たすこと。

* [ ] Coverage測定が可能
* [ ] Coverageレポート生成が可能
* [ ] Quality Gate判定方式が定義されている
* [ ] Coverage基準値を設定可能な状態になっている
* [ ] 基準未達時にCI Failureとなる
* [ ] Phase5-2 CI/CD Integrationと整合する
* [ ] 本番コード変更がない

---

# 9. 将来拡張方針

```
Phase5-2
CI/CD Integration
        ↓
Phase5-3
Coverage / Quality Gate
        ↓
Phase5-4
Release Automation
```

将来的には：

* Coverage推移管理
* Branch Coverage
* 静的解析
* Lint
* 型チェック
* 品質メトリクス管理

などを追加可能。

---

# Version 1.0（Approved）

* Phase5-3 Coverage / Quality Gateを正式定義
* CI環境へ品質判定基盤を追加
* Coverage測定とQuality Gate判定を分離
* Coverage基準値を固定せず運用設定可能とした
* 本番コード変更禁止を明文化
* Phase5-4 Release Automationへの基盤を確立
