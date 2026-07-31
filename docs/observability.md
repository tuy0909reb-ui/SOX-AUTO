# Observability Enhancement 設計（Phase6-3-B）

仕様: `docs/specs/observability_enhancement_phase6_3_b.md`  
運用ハブ: `docs/operations.md`（Phase6-2）  
障害対応: `docs/incident_response.md`（Phase6-3-A）  
Deploy / Rollback 実行: `docs/deployment.md`（Phase6-1）  
Reliability（SLI/SLO 利用側）: `docs/reliability.md` / `docs/slo.md`（Phase7-1）  
Security（ログ・通知の Secret 非露出）: `docs/secrets_policy.md`（Phase7-2）

本ドキュメントは**観測設計のみ**を定義する。  
Metrics 収集基盤・Dashboard 製品・Alert 通知システムの導入は行わない。  
`tools/secretary/` および既存 Workflow の処理内容は変更しない。  
定義した Metrics / Health Check は Reliability Management の SLI データ源として参照される。

---

## 1. 責務境界

```text
Observability（本フェーズ）
    ↓ Failure Detection / 観測情報提供
Incident Response（Phase6-3-A）
    ↓ Recovery Decision
Deployment Automation（Phase6-1）
    → Rollback 実行（判断は 6-3-A）
```

| 層 | 担当 | 担当外 |
|---|---|---|
| Observability | Health Check / Metrics / Alert条件 / Dashboard要求の定義 | 収集基盤・通知実装・自動修復 |
| Operational Automation（Phase6-3-C） | 定型収集・レポート・Runbook 補助（`docs/automation.md`） | 自動復旧・判断確定・Deploy 実行 |
| Reliability（Phase7-1） | SLI/SLO/Review/Trend/改善サイクル管理（`docs/reliability.md`） | 収集基盤・自動SRE・目標値の勝手な固定 |
| Security（Phase7-2） | Secrets/Dependency/Review/Audit/Security Incident 境界（`docs/security.md`） | 自動 Patch、Secret 自動更新、技術実装判断 |
| Incident Response | Severity・初動・Rollback判断・記録 | Rollback 操作・観測設計 |
| Deployment | Deploy / Rollback 実行 | 障害判断・Alert設計 |

---

## 2. Health Check定義

| 対象 | 正常状態 | 異常状態 | 確認方法 |
|---|---|---|---|
| CI Workflow（Test） | 最新対象 commit の run が Success | Failure / 未実行で production 前提を満たせない | GitHub Actions → Test |
| Release Workflow | 対象 tag の Release 作成 Success、成果物あり | Failure / Release または asset 欠落 | GitHub Actions → Release / Releases |
| Deploy Workflow | 意図した env・tag・action で Success | Failure / 入力と結果の不一致 | GitHub Actions → Deploy |
| Application 状態 | 定義された起動確認が可能（取得可能な範囲） | 起動不可・応答なし（取得可能な範囲） | 環境ごとの起動確認手順（未定義時は「未取得」と記録） |
| Environment / Secrets 設定 | 必須キーが Environment に存在（値は見ない） | 必須キー欠落による Deploy / 起動失敗 | Settings → Environments（キー名のみ確認） |

### Health Check 実行手順（Runbook）

1. Actions で Test / Release / Deploy の最新状態を確認する（詳細: `docs/operations.md` §1）
2. Deploy の場合、`environment` / `action` / `release_tag` を確認する
3. 異常時はログ確認（`docs/operations.md` §2）のあと、Alert 条件（§4）に照らす
4. Alert 対象なら Incident Response 初動フローへ渡す（Secret 値は渡さない）

定期の自動スナップショットは Maintenance Workflow（`docs/automation.md`）が Observability 定義に沿って収集する。  
Metrics 収集基盤の導入は引き続き行わない（履歴参照・レポート artifact のみ）。

正常の定義: 対象範囲で Success かつ意図した tag / env と一致。  
異常の定義: Failure、必須成果物欠落、起動不可、または設定欠落による実行不能。  
補正して Success 扱いにしない。

---

## 3. Metrics定義

測定対象のみ定義する。収集・保存基盤は導入せず、保存方式も固定しない（手動集計・Actions 履歴参照可）。

| Metric | 目的 | 利用用途 | 取得の考え方（設計） |
|---|---|---|---|
| CI Success Rate | CI 安定性確認 | 品質確認 | 期間内の Test Success / 全完了 run |
| Deploy Success Rate | デプロイ安定性確認 | 運用確認 | 期間内の Deploy Success / 全完了 run |
| Workflow Failure Count | 障害傾向確認 | Incident 調査 | Test / Release / Deploy の Failure 件数 |
| Execution Duration | 実行性能確認 | 異常検知 | 各 Workflow の所要時間（Actions 表示） |

取得失敗時は Error として記録し、値を推定・補正しない。

---

## 4. Alert条件定義

Alert **条件の設計のみ**。通知チャネル追加・自動修復・自動 Rollback は行わない。  
一次把握は既存の GitHub Actions 失敗表示／通知（Phase6-2）を利用する。

| 条件 | 推奨 Severity 目安 | False Positive 考慮 | 対応参照 |
|---|---|---|---|
| Deploy Failure（特に production） | 高（SEV1〜SEV2 を Incident 側で確定） | 手動キャンセル・入力ミスはログで除外してから確定 | `docs/incident_response.md` |
| Deploy Failure（staging のみ） | 中（SEV3 目安） | 検証意図の失敗と本番影響を区別 | Incident Response / operations |
| CI Failure が同一 commit または短期間に連続 | 中 | 一時的フレークは再実行結果を見てから引き上げ | Runbook 確認 → 必要なら Incident |
| Release Failure / 成果物欠落 | 中〜高（Deploy 直前なら高） | tag 打ち直し前の一時失敗を区別 | operations / deployment |
| Health Check 失敗（起動不可・必須設定欠落） | 高（本番影響時） | 「未取得」は異常確定に使わず追加確認 | Incident Response |
| Configuration Error（Secrets / Environment 不整合） | 中〜高 | キー名のみ記録。値は扱わない | configuration_secrets / Incident |

Alert 発火後の流れ:

```text
Alert条件該当（検知）
        ↓
Observability: 観測事実を渡す（Workflow名・結果・tag・env・時刻）
        ↓
Incident Response: Severity / 初動 / Rollback判断
        ↓
必要時のみ Phase6-1 で Rollback実行
```

---

## 5. Dashboard要求項目

将来可視化する対象の要求のみ。製品選定・構築は対象外。

| 表示項目 | 目的 | 想定ソース（設計） |
|---|---|---|
| Deployment Status | 直近 Deploy 成否・env・tag | Deploy Workflow / Releases |
| Workflow Status | Test / Release / Deploy の最新状態 | GitHub Actions |
| Failure History | Failure 傾向・連続失敗 | Actions 履歴 / Metrics |
| Incident Link | 障害対応への導線 | Incident 記録 / Issue |

Dashboard 取得不可時は障害として記録し、表示を捏造しない。

---

## 6. Incident Response への引き渡し情報

Observability が渡す情報（最小）:

* 検知日時
* 対象 Workflow（Test / Release / Deploy）
* 結果（Failure 等）
* environment / release_tag / commit SHA（わかる範囲）
* ログ要約（Secrets なし）
* 該当 Alert 条件名

渡さないもの: Secret 値、自動 Severity 確定、自動 Rollback 指示。

---

## 7. 禁止事項（再掲）

* Metrics 収集基盤（Prometheus/Grafana 等）の導入
* Dashboard 実装・製品導入
* Alert 通知システム追加
* 自動復旧・自動 Rollback
* Workflow 処理変更・本番コード変更
* Secrets / Infrastructure / Database 変更
