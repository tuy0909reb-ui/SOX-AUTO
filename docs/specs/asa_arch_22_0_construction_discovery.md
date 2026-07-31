# ASA-ARCH-22.0 — Construction Discovery

**Draft 0.7**  
**Architecture ID:** ASA-ARCH-22.0（Construction Discovery）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 22  
**Parent:** ASA-ARCH-21.0 — Construction Catalog（FROZEN） / ASA-ARCH-21.3 Chapter 21  
**Status:** DRAFT 0.7 / FROZEN（ASA-FREEZE-ARCH-22.0-001）

---

# 1. Purpose

Construction Discovery defines the declarative architectural responsibility for
the declarative discovery of Construction Catalog contents.

Its responsibility is limited to defining the immutable architectural discovery
contract.

Construction Catalog is the sole declarative architectural input defined by
this chapter.

Construction Discovery is a declarative architectural artifact.

Construction Discovery introduces no runtime semantics.

Construction Discovery introduces no behavioral semantics.

Construction Discovery introduces no construction behavior.

Construction Discovery introduces no registration behavior.

---

# 2. Responsibility

Construction Discovery is responsible only for:

- Defining the architectural responsibility of Construction Discovery
- Defining Discovery identity
- Defining Discovery metadata
- Preserving Discovery integrity
- Preserving Discovery boundaries

Construction Discovery is NOT responsible for:

- Registration
- Registry management
- Catalog organization
- Lookup
- Resolution
- Discovery implementation
- Loading
- Scheduling
- Dependency analysis
- Construction planning
- Construction execution
- Runtime behavior
- Runtime lifecycle
- Runtime state

---

# 3. Position

Composition → … → Construction Registry → Construction Catalog →
**Construction Discovery** → Future Declarative Architecture

---

# 4. Construction Discovery Contract

Construction Discovery SHALL be immutable.

Construction Discovery SHALL define only the declarative architectural
responsibility of Construction Discovery.

Construction Discovery SHALL reference Construction Catalog.

Construction Discovery SHALL NOT modify Construction Catalog.

Construction Discovery SHALL NOT expose runtime information.

Construction Discovery SHALL NOT define executable behavior.

Construction Discovery SHALL define no discovery implementation.

---

# 5. Architectural Boundary

Construction Registry defines the existence of Construction Definitions.

Construction Catalog defines the declarative architectural organization of
Construction Definition references.

Construction Discovery defines only the declarative architectural
responsibility for the discovery of Construction Catalog contents.

Construction Catalog is the sole declarative architectural input defined by
this chapter.

Construction Discovery SHALL NOT absorb Registry responsibilities.

Construction Discovery SHALL NOT absorb Catalog responsibilities.

Construction Discovery SHALL NOT redefine any frozen contract.

---

# 6. Discovery Principles

## CDD-1 — Discovery Identity

Every Construction Discovery SHALL possess a unique identity.

Discovery identity SHALL remain immutable.

Discovery identity SHALL NOT depend upon runtime state.

## CDD-2 — Discovery Elements

Construction Discovery consists only of declarative references to Construction Catalog.

Construction Discovery SHALL reference Construction Catalog.

Construction Discovery SHALL NOT duplicate Catalog contents.

Construction Discovery SHALL NOT introduce executable information.

## CDD-3 — Construction Catalog References

Construction Discovery SHALL reference Construction Catalog.

Construction Catalog is the sole declarative architectural input defined by
this chapter.

Construction Discovery SHALL NOT modify Construction Catalog.

## CDD-4 — Discovery Metadata

Discovery metadata MAY include identifier, name, version, ownership, and
compatibility information.

Discovery metadata SHALL remain declarative.

Discovery metadata SHALL NOT contain runtime information.

## CDD-5 — Discovery Compatibility

Discovery revisions SHALL preserve compatibility with all existing frozen
architectural contracts.

Discovery revisions SHALL preserve compatibility with previous Discovery revisions.

Construction Discovery SHALL preserve the validity of Construction Catalog references.

## CDD-6 — Discovery Scope

Construction Discovery defines only the declarative architectural responsibility
of Construction Discovery.

Construction Discovery SHALL NOT define:

- Runtime behavior
- Behavioral semantics
- Lookup behavior
- Resolution behavior
- Loading behavior
- Construction behavior
- Discovery implementation

## CDD-7 — Discovery Integrity

Discovery identity SHALL remain valid.

Construction Catalog references SHALL remain valid.

Discovery consistency SHALL be preserved.

No verification algorithm is defined by this chapter.

## CDD-8 — Declarative Restriction

Construction Discovery is purely declarative.

No executable logic SHALL be introduced.

No behavioral semantics SHALL be introduced.

No runtime semantics SHALL be introduced.

## CDD-9 — Runtime Isolation

Construction Discovery SHALL NOT expose runtime objects, runtime instances,
runtime context, runtime scheduling, runtime lifecycle, or runtime state.

Construction Discovery SHALL remain independent of every runtime component.

## CDD-10 — Boundary Preservation

Construction Discovery SHALL preserve the responsibilities of Construction Contract,
Construction Definition, Construction Registry, and Construction Catalog.

No responsibility defined by frozen chapters SHALL migrate into Construction Discovery.

Construction Discovery SHALL NOT redefine any frozen contract.

## CDD-11 — Future Compatibility

Construction Discovery SHALL support future architectural extensions without
defining their responsibilities.

Future architectural layers MAY reference Construction Discovery without modifying
its responsibility.

Future architectural responsibilities requiring declarative discovery beyond
Construction Catalog SHALL be defined by separate frozen architectural contracts.

## CDD-12 — Discovery Ownership

Construction Discovery owns only discovery identity, discovery metadata, and
declarative architectural responsibility.

Construction Catalog remains owned by Chapter 21.

Construction Discovery owns no runtime responsibility.

---

# 7. Structural Discovery Shape

```text
ConstructionDiscovery {
  discoveryId,
  elements,
  metadata,
  compatibility,
  discoveryScope,
  integrity
}

DiscoveryElement {
  catalogReference { catalogId }
}
```

---

# 8. Naming Note

Chapter 22 Construction Discovery principle IDs use the `CDD-*` label set.

These are distinct from Chapter 19 Construction Definition `CDD-*` IDs
（separate TypeScript unions and registries）.

---

# Architecture Status

Status: Draft 0.7 / FROZEN  
Freeze Status: COMPLETE（ASA-FREEZE-ARCH-22.0-001）
