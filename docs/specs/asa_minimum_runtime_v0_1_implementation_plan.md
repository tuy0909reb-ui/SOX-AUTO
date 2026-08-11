# ASA Minimum Runtime v0.1
# Implementation Plan

**Status:** **COMPLETE**（ASA-COMPLETE-MINIMUM-RUNTIME-V0.1-001）  
**Date:** 2026-08-01  
**Prerequisite:** ASA-ARCH-50.0-FROZEN  
**Authority:** HUMAN_ARCHITECT  
**Package:** `src/asa_minimum_runtime/`  
**Acceptance:** ASA-ACCEPT-MINIMUM-RUNTIME-V0.1-001 — PASS  

---

## Constraints（Fixed）

```text
Architecture変更禁止
Chapter追加禁止
既存FROZEN資産変更禁止
既存 architecture_* Package変更禁止
既存 runtime_execution変更禁止
Database禁止
Web UI禁止
AI機能禁止
自動売買禁止
不要Framework禁止
```

Dependency policy:

```text
Frozen Architecture（read-only reference only; optional）
        ↓
asa_minimum_runtime（new）
        ↓
JSON file storage / CLI / verify
```

No write path into frozen packages. No Architecture generation.

---

## 1. Architecture Boundary

| Boundary | Rule |
|---|---|
| ASA-ARCH-1.0〜50.0 | UNCHANGED / FROZEN |
| `src/architecture_*` | READ-ONLY（参照可・改変禁止） |
| `src/runtime_execution` | UNTOUCHED（Ch20 既存資産と分離） |
| Portfolio / Python ops | OUT OF SCOPE |
| ASA Minimum Runtime v0.1 | NEW additive package only |

Principle:

```text
Minimum Runtime ≠ Architecture Authority
Minimum Runtime ≠ Investment Decision
Minimum Runtime ≠ Trading System
```

Runtime provides record persistence, hash integrity, history, and verify only.

---

## 2. Package Design

### Package root

```text
src/asa_minimum_runtime/
```

### Responsibility

```text
Runtime起動
Record生成
永続化（JSON）
Hash生成
履歴管理
整合性検証
```

### Non-responsibility

```text
AI判断
投資判断
自動売買
Architecture生成 / Chapter追加
Web API
Database
```

### Proposed layout

```text
src/asa_minimum_runtime/
├── index.ts                 # public export + package marker
├── types/
│   └── Identifiers.ts
├── models/
│   └── RuntimeRecord.ts     # Record contract + freeze helpers
├── hash/
│   └── HashService.ts       # SHA-256
├── storage/
│   └── JsonFileStorage.ts   # load/save under data/
├── history/
│   └── HistoryService.ts    # append-oriented history
├── verify/
│   └── VerifyService.ts     # record + hash validation
└── cli/
    └── main.ts              # command entry
```

Tests:

```text
tests/asa_minimum_runtime/
```

Data:

```text
data/asa_minimum_runtime/
```

---

## 3. Module Design

### 3.1 CLI

| Item | Definition |
|---|---|
| Responsibility | Command受付、Runtime起動、結果表示 |
| Must not | ビジネス判断、Architecture変更、永続ロジックの重複実装 |
| Depends on | models / storage / hash / history / verify |

### 3.2 Record Model

| Item | Definition |
|---|---|
| Responsibility | Record Contract、version管理、不変オブジェクト化 |
| Must not | 永続化I/O、CLI解析 |
| Output | `RuntimeRecord`（immutable） |

### 3.3 Storage

| Item | Definition |
|---|---|
| Responsibility | JSON保存 / Load |
| Must not | Hash計算、検証判定の主導 |
| Backend | ファイルシステムのみ（DB禁止） |

### 3.4 Hash

| Item | Definition |
|---|---|
| Responsibility | SHA-256生成、Integrity確認用digest提供 |
| Algorithm | Node.js `crypto.createHash("sha256")` |
| Must not | 記録の意味解釈 |

### 3.5 History

| Item | Definition |
|---|---|
| Responsibility | Append管理、履歴一覧取得 |
| Must not | 履歴の silently overwrite / rewrite |
| Policy | append-oriented |

### 3.6 Verify

| Item | Definition |
|---|---|
| Responsibility | Record検証、Hash検証、PASS/FAIL結果 |
| Must not | 自動修復、自動改変、Decision Authority |
| Output | inspection-only result |

---

## 4. Data Contract

### 4.1 Initial Record schema

```json
{
  "id": "",
  "type": "",
  "createdAt": "",
  "title": "",
  "content": "",
  "evidence": [],
  "hash": "",
  "version": "1.0"
}
```

### 4.2 Field rules

| Field | Rule |
|---|---|
| `id` | UUID v4（Node `crypto.randomUUID()`） |
| `type` | 非空 string（例: `NOTE` / `EVIDENCE` / `RUNTIME_EVENT`） |
| `createdAt` | ISO-8601 UTC（例: `2026-08-01T07:20:00.000Z`） |
| `title` | 非空 string（trim） |
| `content` | string（空可だが推奨は非空） |
| `evidence` | `string[]`（参照ID / パス / digest文字列） |
| `hash` | SHA-256 hex（小文字） |
| `version` | 初期固定 `"1.0"`（破壊的変更時のみ昇格） |

### 4.3 Hash calculation target

Hash **includes** (canonical JSON, stable key order):

```text
id
type
createdAt
title
content
evidence（配列順を保持）
version
```

Hash **excludes**:

```text
hash
```

Canonicalization:

1. Build object without `hash`
2. `JSON.stringify` with sorted object keys（`evidence` array order preserved）
3. UTF-8 bytes → SHA-256 hex

Integrity check: recompute hash from stored fields（excluding `hash`）and compare.

### 4.4 Version management

| Version | Meaning |
|---|---|
| `"1.0"` | Initial Minimum Runtime record contract |
| Future | Only via explicit plan bump；旧recordは読取互換を優先 |

---

## 5. CLI Design

Entry（実装時）:

```text
node dist/src/asa_minimum_runtime/cli/main.js <command>
```

npm script（additive）:

```text
"asa": "node dist/src/asa_minimum_runtime/cli/main.js"
```

または typecheck後に `npx ts-node` は使わず、既存 `tsc` 出力を利用（追加FW禁止）。

### 5.1 `asa status`

| Aspect | Definition |
|---|---|
| Input | なし |
| Process | package marker / data dir存在 / record件数を読取 |
| Output | `OK` + runtime id + record count + data path |
| Error | data dir不可読 → non-zero exit + message |

### 5.2 `asa record`

| Aspect | Definition |
|---|---|
| Input | `--type` `--title` `--content` optional `--evidence`（CSV or repeatable） |
| Process | id/timestamp生成 → hash → append save → history append |
| Output | created `id` + `hash` |
| Error | missing required fields / write failure → non-zero |

### 5.3 `asa history`

| Aspect | Definition |
|---|---|
| Input | optional `--limit N`（default all or last 50） |
| Process | history index読取、新しい順 or 古い順を固定（決定論: 古い順） |
| Output | id / createdAt / title / hash 一覧 |
| Error | history missing/corrupt → FAIL message |

### 5.4 `asa verify`

| Aspect | Definition |
|---|---|
| Input | optional `--id <recordId>`（省略時は全件） |
| Process | load → schema check → recompute hash → compare |
| Output | `PASS` or `FAIL` + findings |
| Error | missing record → FAIL；改ざん検知 → FAIL |

Exit codes:

```text
0 = success / PASS
1 = validation FAIL or usage error
2 = I/O / unexpected runtime error
```

---

## 6. Storage Design

### Root

```text
data/asa_minimum_runtime/
```

### Directory structure

```text
data/asa_minimum_runtime/
├── records/
│   └── <id>.json
├── history/
│   └── history.jsonl
└── meta/
    └── runtime.json
```

### Filename / format

| Artifact | Format | Rule |
|---|---|---|
| Record | `<id>.json` | 1 record = 1 file；pretty-print可（読取後正規化してhash検証） |
| History | `history.jsonl` | 1行1イベント（append-only） |
| Meta | `runtime.json` | packageId / version / createdAt |

### Append方式

```text
Record create:
  1) write records/<id>.json（存在すれば失敗 — no silent replace）
  2) append history.jsonl line

History event example:
  {"event":"RECORD_CREATED","id":"...","hash":"...","at":"..."}
```

### Backup

```text
v0.1: backup不要
```

理由: 最小Runtime。必要なら将来別計画で。

### Git

`data/asa_minimum_runtime/` は原則 `.gitignore` 対象を検討（運用データ）。  
契約・コードは git 管理。v0.1 plan では **コード側のみ必須**；data の ignore は実装Phaseで決定。

---

## 7. Test Strategy

Location:

```text
tests/asa_minimum_runtime/
```

Naming: `*.test.ts`（既存慣例）

| Test | Intent |
|---|---|
| Record生成Test | required fields / version / immutable |
| Hash一致Test | same payload → same hash |
| 改ざん検知Test | content改変後 verify FAIL |
| Storage保存Test | save/load round-trip |
| History取得Test | append順序保持 |
| Verify PASS/FAIL Test | valid PASS / missing-or-tampered FAIL |

Rules:

- temp directory（`os.tmpdir` or test fixture dir）を使い本番 `data/` を汚さない
- 追加テストFW禁止（Jestのみ）
- Frozen architecture packages を変更しない

---

## 8. Build Integration

Additive only:

### `tsconfig.json`

Add include entries:

```text
src/asa_minimum_runtime/**/*.ts
tests/asa_minimum_runtime/**/*.ts
```

Do not remove existing includes.

### `jest.config.cjs`

Add root:

```text
"<rootDir>/tests/asa_minimum_runtime"
```

Do not remove existing roots.

### `package.json`

Add scripts only（example）:

```text
"asa": "node dist/src/asa_minimum_runtime/cli/main.js"
"test:asa_minimum_runtime": "jest --config jest.config.cjs tests/asa_minimum_runtime"
```

Do not change existing script semantics.

No new dependencies required for v0.1（Node built-in `crypto` / `fs` / `path`）。

---

## 9. Implementation Order

### Phase 0 — Boundary確認

- 本Plan承認
- 変更禁止領域再確認
- パッケージ名衝突なし確認（`asa_minimum_runtime` 未使用）

### Phase 1 — Models + Hash

- `RuntimeRecord` contract
- `HashService`（canonical SHA-256）
- unit tests: record + hash

### Phase 2 — Storage

- `JsonFileStorage`（records / meta）
- no-overwrite create
- storage tests

### Phase 3 — History + Verify

- `HistoryService`（jsonl append）
- `VerifyService`（PASS/FAIL）
- tamper detection tests

### Phase 4 — CLI

- `status` / `record` / `history` / `verify`
- argv parsing（手動最小実装、外部FWなし）

### Phase 5 — Test

- 統合テスト一式
- `tsc --noEmit` + Jest package suite

### Phase 6 — Acceptance Verification

Acceptance criteria:

```text
[ ] Frozen architecture packages UNCHANGED
[ ] runtime_execution UNCHANGED
[ ] asa status works
[ ] asa record creates hashed JSON
[ ] asa history lists append-only events
[ ] asa verify PASS on clean data
[ ] asa verify FAIL on tamper
[ ] tsc PASS
[ ] Jest asa_minimum_runtime PASS
```

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| `runtime_execution` との責務混同 | 別パッケージ名；相互import禁止（v0.1） |
| Frozen digest破壊 | architecture_* を編集しない；CI/手動で対象外確認 |
| Pretty-print JSONによるhash不安定 | hashはcanonical objectから計算；ファイル整形はhash対象外方針を徹底 |
| data directory混入コミット | `.gitignore` 検討；テストはtemp使用 |
| CLI引数パーサ肥大化 | 4コマンドのみ；外部FW禁止 |
| 「Architecture章」化圧力 | 本パッケージは Runtime support；ASA-ARCH-51+ は別プロセス |

---

## Approval Gate（before coding）

```text
[ ] HUMAN_ARCHITECT approves this Implementation Plan
[ ] Package boundary accepted: src/asa_minimum_runtime/
[ ] Storage root accepted: data/asa_minimum_runtime/
[ ] No Architecture / Chapter work authorized by this plan
```

After approval → begin Phase 1 implementation under a separate Implementation Authorization.

---

# End of ASA Minimum Runtime v0.1 Implementation Plan
