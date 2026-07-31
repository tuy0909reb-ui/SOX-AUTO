# Incident Response（Phase11-3 Framework + Phase6-3-A Runbook）

Ownership: `docs/document_ownership_policy.md`  
Primary SoT: Phase6-3-A Runbook / Additive Section: Phase11-3 Framework（Primary 定義を上書きしない）

## Phase11-3 Incident Response Framework（Additive Section）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Escalation: `docs/escalation_policy.md`  
Recovery: `docs/recovery_management.md`  
Boundary: `docs/incident_boundary.md`

### 担当

* Initial Response
* Containment
* Escalation
* Recovery Planning

### 原則

Incident Response は対応・封じ込め・エスカレーション・復旧計画を統制する。  
Recovery Approval / Escalation は Human 必須。Production 自動変更・自動復旧は禁止。  
運用初動の Severity・固定初動順・Rollback 判断基準は以下 Phase6-3-A Runbook に従う。

---

# Incident Response Runbook（Phase6-3-A）（Primary SoT）

仕様: `docs/specs/incident_response_runbook_phase6_3_a.md`  
運用ハブ: `docs/operations.md`  
観測設計: `docs/observability.md`（Phase6-3-B：検知・Alert条件）  
運用 Automation: `docs/automation.md`（Phase6-3-C：状態収集・補助）  
Reliability Review 材料: `docs/reliability.md` / `docs/review_process.md`（Phase7-1）  
Security / Security Incident 境界: `docs/security.md`（Phase7-2）  
Knowledge / Runbook Integration: `docs/runbook_integration.md` / `docs/knowledge_management.md`（Phase8-2）  
Phase11-3 Incident & Recovery: `docs/operational_incident_recovery.md`  
記録テンプレート: `docs/incident_template.md`  
Deploy / Rollback 実行: `docs/deployment.md`（Phase6-1）

本 Runbook は判断基準と対応手順の標準化のみを担う。  
Rollback 操作・Workflow 変更・自動復旧は行わない。  
Failure Detection の観測定義は Observability（Phase6-3-B）を参照する。  
Security Incident の定義・エスカレーションは Security Operations（Phase7-2）を参照する。  
過去 Incident / Lesson Learned の Knowledge 再利用は Phase8-2（`runbook_integration.md`）に従う。  
Phase11-3 は Incident Lifecycle / Recovery Decision Gate / Lessons → Lifecycle の統制を担い、本 Runbook の初動手順を代替しない。

---

## 1. Severity 分類

| Severity | 名称 | 判断基準 | 優先度 |
|---|---|---|---|
| SEV1 | 重大障害 | サービス利用不可。production 全体停止、または全利用者に影響する Deploy / 設定障害 | 最優先・即時対応 |
| SEV2 | 主要機能障害 | 主要機能が利用不可または深刻劣化。回避策なし／限定的 | 高・速やかに対応 |
| SEV3 | 限定的影響 | 一部機能・一部環境（例: staging のみ）・一部利用者に影響。回避策あり | 中・計画的に対応 |
| SEV4 | 軽微な問題 | 影響が小さい、または文書・利便性の問題。サービス継続可能 | 低・通常優先度 |

判断時の固定ルール:

* 迷ったら一時的に高い Severity を採用し、影響範囲確認後に下げる
* 開発環境のみ → 原則 SEV3 以下（本番影響がなければ SEV4 可）
* 一時的な CI 失敗のみで本番影響なし → SEV4（Rollback 対象外）

---

## 2. 初動対応フロー（固定）

個人判断で順序を変更しない。必ずこの順で実施する。

```text
通知受信
 ↓
Workflow / Deploy状態確認
 ↓
ログ確認
 ↓
影響範囲確認
 ↓
復旧判断
 ↓
対応記録
```

### 2-1 通知受信

* 通知チャネル（GitHub Actions 失敗等）を確認する
* 受信日時・検知方法をメモする（Secret 値は書かない）

### 2-2 Workflow / Deploy 状態確認

確認先: GitHub → Actions

| 確認対象 | 見る項目 |
|---|---|
| Test | 最新 Failure / 対象 commit |
| Release | 対象 tag・成果物有無 |
| Deploy | `environment` / `action` / `release_tag` / Success・Failure |
| Maintenance / Operations | 定期確認・補助 run の Failure（あれば） |

補助: Actions → Operations → `mode=runbook_assist` で状態スナップショットとチェックリストを取得できる。  
取得結果は判断材料であり、Severity / Rollback は人間が決める。

### 2-3 ログ確認

* 失敗 Step のログを開く
* エラー要約を記録する（Secrets・トークン・パスワードを貼らない）
* 詳細手順: `docs/operations.md` 「ログ確認方法」

### 2-4 影響範囲確認

固定チェックリスト:

* [ ] 影響環境（staging / production / local）
* [ ] 影響機能（編集秘書パイプライン / Deploy のみ / CI のみ 等）
* [ ] 利用者への影響有無
* [ ] 開始時刻（わかる範囲）
* [ ] 進行中か収束済みか

### 2-5 復旧判断

1. Severity を確定する（§1）
2. Rollback 要否を判定する（§3）— **判断のみ**
3. Rollback が必要な場合は Phase6-1 手順で実行を依頼／実施する（§3 補足）
4. Rollback 対象外なら、設定確認・再実行・経過観察など次アクションを決める

### 2-6 対応記録

`docs/incident_template.md` に記入し、保管する。  
記録不足の Incident は未完了として扱う。

---

## 3. Rollback 判断基準

Phase6-1 Rollback 方針（tag 単位復帰）を継承する。

### 責務分離

```text
Phase6-3-A（本ドキュメント）
  → Rollback 判断基準を定義する（実行しない）

Phase6-1（docs/deployment.md / deploy.yml）
  → Rollback 操作を実行する
```

### Rollback 対象（実施を検討）

* Deploy 後の重大障害（SEV1、または production の SEV2）
* Configuration 不整合により環境が正しく動作しない
* 起動不能・サービス利用不可

### Rollback 対象外

* 一時的 CI 失敗（本番デプロイ未実施または影響なし）
* 開発環境のみの問題
* 原因未特定のままの無条件 Rollback（禁止）

### 判断後の実行（Phase6-1）

Rollback 可と判断した場合のみ:

1. 復帰先 Release tag を明示する（例: `v1.1.0`）
2. Actions → Deploy
   - `action`: `rollback`
   - `release_tag`: 復帰先 tag
   - `environment`: 対象環境
3. 結果を Incident 記録へ反映する

---

## 4. エスカレーション

* 障害情報不足 → 追加確認（Workflow / ログ / 影響範囲の再確認）
* 判断不能（Severity または Rollback 可否が決まらない） → 上位判断へエスカレーション
* 補正判断（根拠なく Success 扱い・記録改ざん）は禁止

---

## 5. Incident 記録項目

必須項目:

```text
Incident ID
発生日時
検知方法
Severity
影響範囲
原因
対応内容
復旧日時
再発防止事項
```

記入用テンプレート: `docs/incident_template.md`

---

## 5. Incident Knowledge（Phase8-2）

過去障害の再利用対象:

```text
Incident
Cause
Resolution
Decision
Lesson Learned
```

* 記録は根拠付きで保持する（`incident_template.md`）
* Knowledge としての Trust / Version は `knowledge_management.md` / `knowledge_trust_level.md` に従う
* 検索・Runbook 接続: `docs/runbook_integration.md`
* AI による Incident / 原因の確定は禁止。再利用は Human Review 前提

---

## 6. Security Incident との接続（Phase7-2）

Security Incident 候補（Secrets 露出、不正アクセス疑い、重大脆弱性悪用疑い等）の定義・エスカレーションは `docs/security.md` §4 を参照する。

* Security Operations: 事象の定義と Review 記録
* 本 Runbook: 初動・Severity・Rollback 判断・Incident 記録（§2 固定順）
* 両方の記録を残す（Secret 値は含めない）

---

## 7. 禁止事項

* 本番コード（`tools/secretary/`）変更を本 Runbook の代替にすること
* 自動復旧 / 自動 Rollback
* AI による障害判断の正式決定
* Infrastructure / Database / Secrets / デプロイ方式の無断変更
* Failure の隠蔽・強制 Success 化
