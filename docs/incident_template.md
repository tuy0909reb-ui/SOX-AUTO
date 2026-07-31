# Incident 記録テンプレート（Phase6-3-A）

仕様: `docs/specs/incident_response_runbook_phase6_3_a.md`  
手順: `docs/incident_response.md`

コピーして 1 Incident につき 1 ファイル／1 Issue として保管する。  
Secret 値・トークン・パスワードは記載しない。

---

## Incident ID

`INC-YYYYMMDD-NNN`（例: `INC-20260720-001`）

---

## 発生日時

* 検知日時（UTC または JST を明記）:
* 影響開始日時（わかる場合）:

---

## 検知方法

* [ ] GitHub Actions 通知
* [ ] Deploy Failure
* [ ] 手動確認
* [ ] その他:

---

## Severity

* [ ] SEV1 重大障害（サービス利用不可）
* [ ] SEV2 主要機能障害
* [ ] SEV3 限定的影響
* [ ] SEV4 軽微な問題

判定根拠:

---

## 影響範囲

* 環境: staging / production / local / その他
* 機能:
* 利用者影響:
* 進行状況: 継続中 / 収束済み

---

## 原因

（調査時点の事実。推測は推測と明記）

---

## 対応内容

* 実施した確認（Workflow / ログ）:
* 復旧判断:
* Rollback 判断: 対象 / 対象外
* Rollback 実行（Phase6-1）: 実施した / していない
  - 復帰 tag（実施時）:
  - Deploy run URL:

---

## 復旧日時

* 復旧確認日時:
* 確認方法:

---

## 再発防止事項

* 短期:
* 中長期（Postmortem 候補）:

---

## 記録状態

* [ ] 必須項目記入済み → 完了可
* [ ] 不足あり → **未完了**
