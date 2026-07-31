/**
 * ASA-ARCH-21.3 Chapter 20 — Construction Registry (Draft 1.0)
 *
 * Declarative Construction Registry type model and CRG registry only.
 *
 * SHALL NOT contain:
 * - registration / lookup / resolution / loading procedures
 * - construction / execution / runtime / validation / algorithmic logic
 * - builders / factories / compilers / generators / registry services
 * - dependency resolution / object instantiation
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–19 frozen contracts (extension only).
 *
 * Note: getConstructionRegistryPrinciple is a principle-catalog accessor only.
 * It is not a Construction Registry registration / resolution / loading service.
 */

/** Stable construction registry identity (CRG-1). */
export type ConstructionRegistryIdentity = string;

/**
 * Declarative Construction Definition reference (CRG-3).
 * Identifies the associated Construction Definition only — no resolution.
 */
export interface ConstructionDefinitionReference {
    readonly definitionId: string;
}

/**
 * Declarative registry entry (CRG-2).
 * Registration relationship structure only — no registration procedures.
 */
export interface RegistryEntry {
    readonly entryId: string;
    readonly definitionReferences: readonly ConstructionDefinitionReference[];
}

/**
 * Declarative construction registry metadata (CRG-4).
 * Descriptive only — no responsibility / behavior change.
 */
export interface ConstructionRegistryMetadata {
    readonly description: string;
}

/** Registry compatibility metadata (CRG-5). */
export interface RegistryCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Registry scope (CRG-6). */
export interface RegistryScope {
    readonly scope: string;
}

/**
 * Declarative registry integrity metadata (CRG-7).
 * Declares integrity requirements only — no verification algorithm.
 */
export interface RegistryIntegrity {
    readonly requiresInternalConsistency: true;
    readonly requiresNoContradictoryEntries: true;
}

/**
 * Declarative Construction Registry structure.
 * Describes registration relationships — not how registration is performed.
 */
export interface ConstructionRegistry {
    readonly registryId: ConstructionRegistryIdentity;
    readonly entries: readonly RegistryEntry[];
    readonly metadata: ConstructionRegistryMetadata;
    readonly compatibility: RegistryCompatibility;
    readonly registryScope: RegistryScope;
    readonly integrity: RegistryIntegrity;
}

export type ConstructionRegistryPrincipleId =
    | "CRG-1"
    | "CRG-2"
    | "CRG-3"
    | "CRG-4"
    | "CRG-5"
    | "CRG-6"
    | "CRG-7"
    | "CRG-8"
    | "CRG-9"
    | "CRG-10"
    | "CRG-11"
    | "CRG-12";

export interface ConstructionRegistryPrinciple {
    readonly id: ConstructionRegistryPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Registry Verification — excluded concerns (documentation only). */
export const CONSTRUCTION_REGISTRY_VERIFICATION = Object.freeze([
    "Registration Behavior",
    "Registration Algorithms",
    "Registry Services",
    "Builder Architecture",
    "Factory Architecture",
    "Compiler Architecture",
    "Generator Architecture",
    "Construction Runtime",
    "Execution Runtime",
    "Dependency Resolution",
    "Object Instantiation",
    "Implementation Rules",
    "Lookup Logic",
    "Resolution Logic",
    "Loading Logic",
] as const);

/** Construction Registry Outcome — declarative architectural artifact only. */
export const CONSTRUCTION_REGISTRY_OUTCOME = Object.freeze({
    statement:
        "This chapter defines the declarative architectural representation of a Construction Registry.",
    scope: "It establishes only the identity, registry entries, construction definition references, metadata, compatibility, scope, integrity, and ownership of Construction Registries.",
    exclusion:
        "No registration behavior, construction behavior, runtime behavior, implementation detail, or algorithm is introduced.",
} as const);

const PRINCIPLES: readonly ConstructionRegistryPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CRG-1",
        title: "Construction Registry Identity",
        statement:
            "A Construction Registry shall possess its own architectural identity. The identity uniquely distinguishes one Construction Registry from another. The identity represents only the registry itself. It shall not imply registration behavior.",
    }),
    Object.freeze({
        id: "CRG-2",
        title: "Registry Entries",
        statement:
            "A Construction Registry shall consist of declarative registry entries. Each registry entry represents a declarative registration relationship. A registry entry may include one or more Construction Definition references. Registry entries shall remain declarative. Registry entries shall not define registration procedures. Registry entries shall not define behavior. Registry entries shall remain implementation-independent.",
    }),
    Object.freeze({
        id: "CRG-3",
        title: "Construction Definition References",
        statement:
            "Construction Definition references represent declarative relationships to Construction Definitions. A Construction Definition reference identifies only the associated Construction Definition. Construction Definition references shall remain declarative. Construction Definition references shall not introduce dependency resolution. Construction Definition references shall not introduce construction behavior. Construction Definition references shall remain implementation-independent.",
    }),
    Object.freeze({
        id: "CRG-4",
        title: "Construction Registry Metadata",
        statement:
            "A Construction Registry may include descriptive metadata. Metadata exists solely for declarative description. Metadata shall not alter architectural responsibility. Metadata shall not introduce behavior. Metadata shall remain implementation-neutral.",
    }),
    Object.freeze({
        id: "CRG-5",
        title: "Registry Compatibility",
        statement:
            "Construction Registries shall preserve compatibility across future architectural evolution. Compatibility shall exist at the architectural contract level. Compatibility shall not depend on implementation. Future construction layers shall preserve this compatibility.",
    }),
    Object.freeze({
        id: "CRG-6",
        title: "Registry Scope",
        statement:
            "A Construction Registry defines only declarative registration structure. It shall not define Registration Procedures, Behavioral Concepts, Runtime Concepts, or Implementation Concepts.",
    }),
    Object.freeze({
        id: "CRG-7",
        title: "Registry Integrity",
        statement:
            "A Construction Registry shall remain internally consistent. Its declarative structure shall not contain contradictory registry entries. No verification algorithm is defined by this chapter.",
    }),
    Object.freeze({
        id: "CRG-8",
        title: "Declarative Restriction",
        statement:
            "Construction Registries are purely declarative. They define architecture only. They shall not introduce registration logic, lookup logic, resolution logic, loading logic, construction logic, execution logic, runtime logic, or algorithmic logic.",
    }),
    Object.freeze({
        id: "CRG-9",
        title: "Runtime Isolation",
        statement:
            "Construction Registries remain completely isolated from runtime architecture. Runtime concepts shall not appear in this chapter. Future architectural layers may consume this registry without modifying its architectural responsibility.",
    }),
    Object.freeze({
        id: "CRG-10",
        title: "Boundary Preservation",
        statement:
            "This chapter preserves every architectural boundary established by Chapter 11 through Chapter 19. No responsibility defined by those chapters may be redefined here.",
    }),
    Object.freeze({
        id: "CRG-11",
        title: "Future Registry Compatibility",
        statement:
            "Future architectural layers may consume Construction Registries. Future chapters may introduce responsibilities such as Registry Services, Builder, Factory, Compiler, or Generator. Those future responsibilities shall preserve the declarative registry defined by this chapter. This chapter introduces none of them.",
    }),
    Object.freeze({
        id: "CRG-12",
        title: "Registry Ownership",
        statement:
            "Construction Registries own only declarative registration responsibilities. Behavioral responsibilities are outside the ownership of Construction Registries. Ownership remains limited to declarative registration responsibilities.",
    }),
]);

/** Frozen registry of all Chapter 20 Construction Registry principles (CRG-1…CRG-12). */
export const CONSTRUCTION_REGISTRY_PRINCIPLES: readonly ConstructionRegistryPrinciple[] =
    PRINCIPLES;

export const CONSTRUCTION_REGISTRY_PRINCIPLE_IDS: readonly ConstructionRegistryPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

/**
 * Principle-catalog accessor only (immutable CRG entries).
 * MUST NOT register, resolve, load, or construct Construction Definitions.
 */
export function getConstructionRegistryPrinciple(
    id: ConstructionRegistryPrincipleId
): ConstructionRegistryPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ConstructionRegistryPrincipleId: ${id}`);
    }
    return found;
}
