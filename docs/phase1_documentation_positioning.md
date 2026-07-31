# Phase1 Documentation Positioning

**Version:** 1.1  
**Status:** Approved  
**Scope:** Foundation / Conceptual Origin / Documentation Architecture

---

## 1. Purpose

本書は、AI編集秘書 Framework における **Phase1（Foundation / Conceptual Origin）** の  
文書位置付けを明確化する。

Architecture Review の残項目である

```text
「なぜPhase1専用specが存在しないのか」
```

を正式に説明し、Phase2以降の Spec 管理体系との境界を定義する。

---

## 2. Phase1 の役割（Foundation / Conceptual Origin）

Phase1 は Framework 全体の **起点（Origin）** であり、  
以下の性質を持つ。

### 2.1 Conceptual Foundation（概念的基盤）

Phase1 は「Frameworkを成立させるための前提・思想・原理」を定義するフェーズであり、  
具体的な要件・設計・仕様はまだ存在しない。

### 2.2 Pre-Spec Domain（Spec以前の領域）

Phase1 は **Specを生成するフェーズではなく、Specの前提を生成するフェーズ**である。

そのため、Phase1は以下のような性質を持つ：

```text
Specを作らない
設計を作らない
要件を確定しない
Productionに影響しない
```

Phase1は「Frameworkの思想・目的・原理」を形成する段階であり、  
実装可能な構造を持つのは Phase2 以降である。

---

## 3. なぜ Phase1 専用 Spec が存在しないのか（核心）

### 3.1 Spec の定義に合致しないため

Spec（Specification）は以下を満たす必要がある：

- 要件の確定
- 境界の定義
- 実装可能な構造
- Phase間インターフェース
- Evidence / Approval の対象

しかし Phase1 は **要件も境界も存在しない前段階**であり、  
Specとして成立するための条件を満たさない。

### 3.2 Phase1 は「思想」や「原理」を扱うため

Phase1で扱うのは以下のような内容：

- Frameworkの存在理由
- 目的・価値基準
- 原理・哲学
- 運用思想
- AI編集秘書の基本概念

これらは **仕様ではなく、理念・思想・コンセプト**である。

理念は Spec ではなく **Foundation Document** として扱う。

### 3.3 Spec管理体系（Phase2〜11）と整合しないため

Specは Phase2 Requirements から始まる。

```text
Phase1 → Foundation（Specなし）
Phase2 → Requirements（Spec開始）
Phase3 → Design（Spec拡張）
Phase4〜11 → Operational Spec / Governance Spec
```

Phase1にSpecを置くと、  
Spec体系の整合性が崩れるため、意図的に Spec 管理対象外としている。

---

## 4. Phase2 以降との境界

Phase1とPhase2の境界は明確である。

### 4.1 Phase1 → Phase2 の移行条件

Phase1の成果物：

- Frameworkの目的
- 原理・思想
- 運用価値基準
- AI編集秘書の基本概念
- Documentation Architectureの前提

Phase2で初めて以下が生成される：

- 要件
- 機能境界
- 実装可能な構造
- Spec（正式管理対象）

### 4.2 境界の明文化

```text
Phase1 は「なぜ作るか」を定義する。
Phase2 は「何を作るか」を定義する。
Phase3 は「どう作るか」を定義する。
Phase4〜11 は「どう運用するか」を定義する。
```

---

## 5. 実装・設計資料との関係

Phase1は実装資料や設計資料と直接結びつかない。

### 5.1 Phase1は実装に影響しない

Phase1は Production Boundary の外側にあり、  
実装・CI/CD・Infrastructure に影響を与えない。

### 5.2 Phase3以降が実装に接続する

```text
Phase1 → Concept
Phase2 → Requirements
Phase3 → Design（実装境界に接続）
Phase4 → Implementation（実装）
```

Phase1は「実装の前提」ではあるが、  
「実装の仕様」ではない。

---

## 6. Documentation Architecture における位置付け  
（レビュー反映済）

Phase1は以下の文書カテゴリに属する：

| 種類 | Phase1の扱い |
|---|---|
| Spec | 対象外 |
| Governance | **直接対象外（後続Governanceの前提）** |
| Operational Docs | 対象外 |
| Foundation Docs | **対象（唯一）** |

Phase1は **Foundation Docs のみを持つフェーズ**であり、  
Spec体系の外側に位置する。

---

## 7. Status

```text
Approved

Phase1 Documentation Positioning defines the
formal role of Phase1 as a conceptual origin
and clarifies why Phase1 does not produce
specifications within the AI編集秘書 Framework.
```
