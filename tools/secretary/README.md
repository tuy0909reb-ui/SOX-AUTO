# AI編集秘書（AI Secretary）

本ディレクトリは **AIを利用するソフトウェア** としての編集秘書の土台である。  
特定の AI 製品（ChatGPT / Gemini / Claude / Copilot 等）には依存しない。

---

# 【人間管理領域】

## 概要

AI編集秘書は、入力から意思決定・アイデア・バックログ等を整理し、  
ドキュメント更新を支援するためのローカル基盤である。

## 目的

- 編集・整理プロセスの責務をモジュール単位で分離する
- 将来の AI / 入出力先の差し替えを、アーキテクチャ変更なしで可能にする
- 既存の投資プロトコル・Discord・Scheduler 等とは独立させる

## Phase

| Phase | 内容 | 状態 |
|---|---|---|
| Phase1 | ディレクトリ構成・責務定義・Skeleton | 今回 |
| Phase2 | 共通形式・抽出・要約テンプレートの具体化（ロジック最小） | 未着手 |
| Phase3以降 | 入出力接続・AI差し替え口・自動更新 | 未着手 |

## 設計思想

- 単一責務・疎結合
- 「AI」そのものではなく「AIを利用するソフトウェア」
- 既存システム（NDX / SOX / Discord / Watch List / Protocol）へ影響しない
- Phase1 ではロジック・外部API・ライブラリ追加を行わない

---

# 【AI管理領域】

<!-- AUTO:DIR_START -->

## ディレクトリ構成

```text
tools/secretary/
    __init__.py
    README.md
    secretary.py
    orchestrator.py
    parser.py
    extractor.py
    summarizer.py
    updater.py
    writer.py
```

<!-- AUTO:DIR_END -->

<!-- AUTO:MODULE_START -->

## モジュール責務

| モジュール | 責務 |
|---|---|
| `__init__.py` | パッケージ初期化（空） |
| `secretary.py` | CLIエントリポイントのみ |
| `orchestrator.py` | 処理全体の制御・各モジュール呼び出し |
| `parser.py` | 入力 → 共通形式への変換 |
| `extractor.py` | Decision / Idea / Backlog / Change 候補の抽出 |
| `summarizer.py` | Daily Summary 等の生成 |
| `updater.py` | 更新対象データの生成 |
| `writer.py` | 生成済みデータの出力（書込み口） |

<!-- AUTO:MODULE_END -->

<!-- AUTO:CHANGELOG_START -->

## 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-07-19 | Phase1: Skeleton（ディレクトリ・責務・空実装）を作成 |

<!-- AUTO:CHANGELOG_END -->
