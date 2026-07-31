# AI編集秘書 Test Infrastructure仕様（Phase5-1）

**Version:** 1.0
**Status:** Approved（Phase5-1）
**Target:** `tests/` 配下
**Type:** テスト基盤整備（既存機能変更なし）

---

# 1. 目的

Phase5-1 Test Infrastructure は、Phase5-0で構築したE2Eテストを継続運用可能にするため、テスト実行環境・共通設定・テスト補助構造を整備するフェーズである。

本フェーズでは、テスト対象である `tools/secretary/` のビジネスロジックを変更せず、以下のみを担当する。

* テスト実行環境の安定化
* 共通fixture整備
* テスト設定の標準化
* CI等で再現可能な実行基盤準備

---

# 2. 責務

Phase5-1の責務：

```
Test Runner
      │
      ▼
Test Configuration
      │
      ├── Fixture
      ├── Mock
      ├── Test Data
      └── E2E Tests
```

具体的には：

1. pytest実行環境を整理する
2. 共通fixtureを定義する
3. テストデータ生成方法を統一する
4. テスト実行方法を固定する

以上のみ。

---

# 3. 対象範囲

対象：

* `tests/conftest.py`
* `tests/e2e/conftest.py`
* `pytest.ini` または `pyproject.toml`
* 開発用依存管理ファイル

---

# 4. 実装内容

## 4-1 pytest設定

pytestの実行設定をプロジェクト標準として定義する。

例：

```ini
[pytest]
testpaths = tests
```

目的：

* 実行対象の固定
* ローカル環境との差異削減
* CI移行時の再利用性確保

---

## 4-2 共通fixture

テスト間で共有するデータ生成処理を管理する。

対象：

* AIMessage生成
* 一時保存Path
* テスト用OutputRequest
* Mock Connector

fixtureはテスト補助用途に限定し、本番コードへ影響を与えない。

---

## 4-3 テストデータ分離

E2Eテスト内に直接記述された固定データを必要に応じて分離する。

目的：

* 可読性向上
* 重複削減
* 将来テスト追加容易化

---

## 4-4 開発依存管理

pytest等のテスト依存を明示する。

対象例：

* `requirements-dev.txt`
* `pyproject.toml`

---

# 5. 公開IF変更

なし。

対象システム：

```
tools/secretary/
```

は変更しない。

---

# 6. Test Infrastructureが行わないこと（禁止）

以下は禁止する。

* Extractor変更
* Writer変更
* Output変更
* Router変更
* Connector変更
* 新規ビジネスロジック追加
* 本番コードへのfixture追加
* AI品質評価
* テスト結果の自動補正
* テスト失敗の隠蔽

Test Infrastructureは**テスト環境のみ担当する。**

---

# 7. 完了条件

以下を満たすこと。

* [ ] pytest実行方法が固定されている
* [ ] 共通fixtureが利用可能
* [ ] E2Eテストが既存結果と同等以上で実行できる
* [ ] 開発依存が明示されている
* [ ] 本体コード変更がない
* [ ] Phase5-0仕様と整合している

---

# 8. 将来拡張方針

Phase5-1以降：

```
Phase5-0
 E2E契約確認
        ↓
Phase5-1
 Test Infrastructure
        ↓
Phase5-2
 CI/CD Integration
        ↓
Phase5-3
 Coverage / Quality Gate
```

という流れで品質保証層を拡張する。

---

# Version 1.0（Approved）

* Phase5-1 Test Infrastructureを正式定義
* Phase5-0 E2Eを継続運用可能にする基盤整備を目的化
* 本体コード変更禁止を明文化
* pytest・fixture・依存管理を責務として定義
* 将来的なCI/CD連携への基礎を確立
