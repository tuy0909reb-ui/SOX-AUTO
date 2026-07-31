# AI編集秘書 CI/CD Integration仕様（Phase5-2）

**Version:** 1.0  
**Status:** Approved（Phase5-2）  
**Target:** `.github/workflows/` 配下  
**Type:** CI/CD環境整備（既存機能変更なし）

---

# 1. 目的

Phase5-2 CI/CD Integration は、Phase5-0（E2E契約確認）および Phase5-1（テスト基盤整備）で構築したテスト環境を  
**CI上で自動実行可能な品質確認環境として接続するフェーズ**である。

本フェーズは以下のみを担当する。

- テスト自動実行
- 実行環境の固定化
- 成否判定
- CI実行結果の状態反映（Success / Failed）

本番コード（`tools/secretary/`）には一切触れない。

---

# 2. 責務

CI/CD Integration の責務は以下に限定する。

```

Git Push / Pull Request
│
▼
CI Runner
│
├── Environment Setup
├── Dependency Install
├── pytest Execution
└── Result Status

```

具体的には：

1. CI起動条件（push / pull_request）を定義する
2. Python実行環境を固定する
3. 開発依存（requirements-dev.txt）をインストールする
4. pytest を自動実行する
5. 成否をCI結果として反映する

以上のみ。

---

# 3. 対象範囲

対象ディレクトリ：

```

.github/workflows/

```

例：

```

.github/
└── workflows/
└── test.yml

```

---

# 4. 実装内容

## 4-1 CI Workflow定義

例（GitHub Actions）：

```yaml
name: Test

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
```

要件：

* push と pull_request の両方で実行可能
* Linux環境で再現可能
* Workflow名は `Test` または同等の意味を持つ名称でよい

---

## 4-2 Python環境構築

要件：

* Python version を固定する
* 使用バージョンはプロジェクト既存環境と一致させる
* `requirements-dev.txt` を利用して依存をインストールする
* pytest 実行可能状態を作成する

例：

```
Python setup
        ↓
pip install -r requirements-dev.txt
        ↓
pytest
```

---

## 4-3 pytest自動実行

実行対象：

```bash
pytest
```

または：

```bash
pytest tests/
```

要件：

* Phase5-0 E2E が自動実行される
* Phase5-1 の pytest.ini 設定が利用される
* ローカル実行との差異を最小化する

---

## 4-4 CI結果判定

成功：

```
pytest passed
        ↓
CI Success
```

失敗：

```
pytest failed
        ↓
CI Failed
```

要件：

* 失敗を隠蔽しない
* 自動補正しない
* 無条件成功にしない

---

# 5. 公開インターフェース変更

```
なし
```

対象：

```
tools/secretary/
```

は **絶対に変更しない**。

---

# 6. CI/CD Integration が行わないこと（禁止）

以下は禁止する。

* 本番コード変更
* テスト内容変更
* テスト失敗の無視
* CI結果の改ざん
* 自動修正処理
* AIによる品質判定
* Coverage判定（Phase5-3の責務）
* デプロイ処理
* 外部サービス通知実装

CI/CD Integration は **テスト自動実行環境のみを担当する**。

---

# 7. エラー方針

* pytest失敗はCI失敗として扱う
* dependency install失敗はCI失敗として扱う
* 独自例外追加は禁止
* エラー補正は禁止

---

# 8. 完了条件

以下を満たすこと。

* [ ] CI Workflowが存在する
* [ ] Pull Requestで自動実行される
* [ ] Python環境が固定されている
* [ ] 開発依存をインストールできる
* [ ] pytestが自動実行される
* [ ] Phase5-0 E2EがCI上で通過する
* [ ] 本番コード変更がない

---

# 9. 将来拡張方針

Phase5-2以降の品質保証レイヤー：

```
Phase5-1
Test Infrastructure
        ↓
Phase5-2
CI/CD Integration
        ↓
Phase5-3
Coverage / Quality Gate
        ↓
Phase5-4
Release Automation
```

---

# Version 1.0（Approved）

* Phase5-2 CI/CD Integration を正式定義
* Phase5-1 テスト基盤を CI 環境へ接続
* pytest 自動実行環境を構築
* CI実行結果を品質確認状態として反映する設計を確立
* 本番コード変更禁止を明文化
* Phase5-3 Quality Gate への基礎を確立
