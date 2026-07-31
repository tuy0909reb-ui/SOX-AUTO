# ASA-ARCH-37.0 — ASA-CONNECT External Integration Boundary Layer

**Draft 0.3**  
**Architecture ID:** ASA-ARCH-37.0（ASA-CONNECT External Integration Boundary Layer）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 37（second Extension Domain after OPS）  
**Parent:** ASA-ARCH-35.1 — Extension Development Framework（FROZEN）  
**Status:** DRAFT 0.3 / **FROZEN**（ASA-FREEZE-ARCH-37.0-001）

Status: Draft 0.3 / FROZEN  
Registration: ASA-REGISTER-ARCH-37.0-001  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-37.0-001）

---

# 1. Scope

Chapter 37 defines ASA-CONNECT — the External Integration Boundary Layer
providing safe connection boundaries for External System / API / Database /
File / Notification without mutating ASA Core.

Purpose: Connect / Validate / Transform / Route / Protect.

Not: Execution subject; not Decision maker; not Capability Provider;
not Core / Governance / Framework / OPS mutation.

---

# 2. Position

```text
ASA Core (ARCH-34.0 Frozen)
        |
Extension Governance Layer (ARCH-35.0 Frozen)
        |
Extension Development Framework (ARCH-35.1 Frozen)
        |
ASA-OPS (ARCH-36.0 Frozen)     ASA-CONNECT (ARCH-37.0)
                                      |
                        API / Database / File / Notification
```

---

# 3. Preservation

Frozen ASA-ARCH-34.0 / 35.0 / 35.1 / 36.0 contracts remain immutable.

Authority fixed: **REQUESTER**（≠ Execution Authority）.

Connector is connection abstraction only — not Capability Ownership.

---

# 4. Implementation Baseline

| Artifact | Path |
|---|---|
| Package | `src/extensions/asa_connect/` |
| Contract | `ConnectExtensionContract.ts` |
| Connector Model | `ConnectorDefinition.ts` |
| External Data | `ExternalDataContract.ts` |
| Transformation | `DataTransformationContract.ts` |
| Routing | `ConnectorRouter.ts` |
| Authentication / Secret | `AuthenticationBoundary.ts` |
| Error | `ConnectorErrorContract.ts` |
| Request Guard | `ExternalRequestGuard.ts` |
| Outbound Boundary | `OutboundConnectorBoundary.ts` |
| Lifecycle | `ConnectorLifecycleValidator.ts` |
| Layer Model | `AsaConnectLayer.ts` |
| Validator | `ConnectValidator.ts`（`establish()`） |
| Barrel | `index.ts` |

Builder operation: `ConnectValidator.establish()`.
