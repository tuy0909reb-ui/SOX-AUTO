# ASA-ARCH-35.1 — Extension Development Framework

**Draft 0.2**  
**Architecture ID:** ASA-ARCH-35.1（Extension Development Framework）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 35.1（after Frozen Extension Governance Layer）  
**Parent:** ASA-ARCH-35.0 — Extension Governance Layer（FROZEN） / ASA-ARCH-34.0 Core（FROZEN）  
**Status:** DRAFT 0.2 / **FROZEN**（ASA-FREEZE-ARCH-35.1-001）

Status: Draft 0.2 / FROZEN  
Registration: ASA-REGISTER-ARCH-35.1-001  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-35.1-001）

---

# 1. Scope

Chapter 35.1 defines the Extension Development Framework — the shared
development standard that Extension Domains use under frozen ASA-ARCH-35.0
Governance Contract.

Purpose: define common Extension Template / Contract / Authority / Lifecycle /
Dependency / Compatibility / Validation standards.

Not: new Extension Domain addition; not Governance Contract replacement;
not Core mutation.

---

# 2. Position

```text
ASA Core (ARCH-34.0 Frozen)
        |
Extension Governance Layer (ARCH-35.0 Frozen)
        |
Extension Development Framework (ARCH-35.1)
        |
 ┌──────┼──────┐
 ↓      ↓      ↓
ASA-OPS ASA-AI ASA-CONNECT
```

---

# 3. Core / Governance Preservation

Frozen Core（ASA-ARCH-34.0） and frozen Governance（ASA-ARCH-35.0） contracts
remain immutable. The Framework consumes Governance Layer by reference and
must not mutate Core or Governance.

Forbidden:

```text
Extension → Core Mutation
Extension → Governance Mutation
```

---

# 4. Implementation Baseline

| Artifact | Path |
|---|---|
| Types | `src/extension_development_framework/ExtensionDevelopmentFrameworkTypes.ts` |
| Model | `src/extension_development_framework/ExtensionDevelopmentFramework.ts` |
| Builder | `src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder.ts` |

Builder operation: `define()`.

Preserves: Extension Template Contract, Metadata（incl. governance_owner）,
Boundary Contract Template（Input / Processing / Output / Error）,
Capability Binding, Authority Declaration（Declared ≤ Approved; no runtime
escalation）, Lifecycle Template, Dependency Model, Compatibility Declaration,
Communication Contract, Validation Pipeline, Security Validation,
Regression Standard（incl. Isolation）.
