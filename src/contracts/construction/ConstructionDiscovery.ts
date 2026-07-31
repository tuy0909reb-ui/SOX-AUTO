/**
 * ASA-ARCH-22.0 / ASA-ARCH-21.3 Chapter 22 — Construction Discovery (Draft 0.7)
 *
 * Declarative Construction Discovery type model and CDD registry only.
 *
 * Note: CDD-* principle IDs here are Construction Discovery contracts.
 * They are distinct from Chapter 19 Construction Definition CDD-* IDs
 * (separate TypeScript unions / registries — same pattern as Ch11/Ch17 CBC-*).
 *
 * SHALL NOT contain:
 * - registration / registry management / catalog organization
 * - lookup / resolution / discovery implementation / loading
 * - scheduling / dependency analysis / construction planning / construction execution
 * - runtime behavior / lifecycle / state
 * - executable discovery services
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–21 frozen contracts (extension only).
 *
 * Ownership:
 * - Construction Catalog owned by Chapter 21 (ASA-ARCH-21.0)
 * - Construction Discovery owns only identity, metadata, and declarative discovery responsibility
 *
 * Note: getConstructionDiscoveryPrinciple is a principle-catalog accessor only.
 * It is not a discovery / lookup / resolution / loading service.
 */

/** Stable construction discovery identity (CDD-1). */
export type DiscoveryIdentity = string;

/**
 * Declarative Construction Catalog reference (CDD-3).
 * Identifies Construction Catalog only — no duplication of catalog contents.
 */
export interface DiscoveryCatalogReference {
    readonly catalogId: string;
}

/**
 * Declarative discovery element (CDD-2).
 * Catalog reference only — no executable information.
 */
export interface DiscoveryElement {
    readonly catalogReference: DiscoveryCatalogReference;
}

/**
 * Declarative discovery metadata (CDD-4).
 * Identifier / name / version / ownership / compatibility — no runtime info.
 */
export interface DiscoveryMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly ownership: string;
    readonly compatibilityInformation: string;
}

/** Discovery compatibility metadata (CDD-5). */
export interface DiscoveryCompatibility {
    readonly version: string;
    readonly contract: string;
    readonly preservesFrozenContractCompatibility: true;
    readonly preservesPriorDiscoveryCompatibility: true;
    readonly preservesCatalogReferenceValidity: true;
}

/** Discovery scope (CDD-6). */
export interface DiscoveryScope {
    readonly scope: string;
}

/**
 * Declarative discovery integrity metadata (CDD-7).
 * Declares integrity requirements only — no verification algorithm.
 */
export interface DiscoveryIntegrity {
    readonly requiresValidDiscoveryIdentity: true;
    readonly requiresValidCatalogReferences: true;
    readonly requiresDiscoveryConsistency: true;
}

/**
 * Declarative Construction Discovery structure.
 * Describes the architectural discovery responsibility over Construction Catalog —
 * not how discovery, lookup, or resolution is performed.
 */
export interface ConstructionDiscovery {
    readonly discoveryId: DiscoveryIdentity;
    readonly elements: readonly DiscoveryElement[];
    readonly metadata: DiscoveryMetadata;
    readonly compatibility: DiscoveryCompatibility;
    readonly discoveryScope: DiscoveryScope;
    readonly integrity: DiscoveryIntegrity;
}

/**
 * Construction Discovery principle IDs (Chapter 22).
 * Distinct from Chapter 19 ConstructionDefinitionPrincipleId despite shared CDD-* labels.
 */
export type ConstructionDiscoveryPrincipleId =
    | "CDD-1"
    | "CDD-2"
    | "CDD-3"
    | "CDD-4"
    | "CDD-5"
    | "CDD-6"
    | "CDD-7"
    | "CDD-8"
    | "CDD-9"
    | "CDD-10"
    | "CDD-11"
    | "CDD-12";

export interface ConstructionDiscoveryPrinciple {
    readonly id: ConstructionDiscoveryPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Discovery Verification — excluded concerns (documentation only). */
export const CONSTRUCTION_DISCOVERY_VERIFICATION = Object.freeze([
    "Registration",
    "Registry management",
    "Catalog organization",
    "Lookup",
    "Resolution",
    "Discovery implementation",
    "Loading",
    "Scheduling",
    "Dependency analysis",
    "Construction planning",
    "Construction execution",
    "Runtime behavior",
    "Runtime lifecycle",
    "Runtime state",
    "Executable discovery services",
] as const);

/** Construction Discovery Outcome — declarative architectural artifact only. */
export const CONSTRUCTION_DISCOVERY_OUTCOME = Object.freeze({
    statement:
        "Construction Discovery defines the declarative architectural responsibility for the declarative discovery of Construction Catalog contents.",
    scope: "It establishes only discovery identity, metadata, integrity requirements, and declarative architectural responsibility.",
    exclusion:
        "No executable discovery behavior, runtime semantics, lookup behavior, resolution behavior, loading behavior, or construction behavior is introduced.",
    ownership:
        "Construction Catalog remains owned by Chapter 21. Construction Discovery owns no runtime responsibility.",
    soleInput:
        "Construction Catalog is the sole declarative architectural input defined by this chapter.",
} as const);

const PRINCIPLES: readonly ConstructionDiscoveryPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CDD-1",
        title: "Discovery Identity",
        statement:
            "Every Construction Discovery shall possess a unique identity. Discovery identity shall remain immutable. Discovery identity shall not depend upon runtime state.",
    }),
    Object.freeze({
        id: "CDD-2",
        title: "Discovery Elements",
        statement:
            "Construction Discovery consists only of declarative references to Construction Catalog. Construction Discovery shall reference Construction Catalog. Construction Discovery shall not duplicate Catalog contents. Construction Discovery shall not introduce executable information.",
    }),
    Object.freeze({
        id: "CDD-3",
        title: "Construction Catalog References",
        statement:
            "Construction Discovery shall reference Construction Catalog. Construction Catalog is the sole declarative architectural input defined by this chapter. Construction Discovery shall not modify Construction Catalog.",
    }),
    Object.freeze({
        id: "CDD-4",
        title: "Discovery Metadata",
        statement:
            "Discovery metadata may include identifier, name, version, ownership, and compatibility information. Discovery metadata shall remain declarative. Discovery metadata shall not contain runtime information.",
    }),
    Object.freeze({
        id: "CDD-5",
        title: "Discovery Compatibility",
        statement:
            "Discovery revisions shall preserve compatibility with all existing frozen architectural contracts. Discovery revisions shall preserve compatibility with previous Discovery revisions. Construction Discovery shall preserve the validity of Construction Catalog references.",
    }),
    Object.freeze({
        id: "CDD-6",
        title: "Discovery Scope",
        statement:
            "Construction Discovery defines only the declarative architectural responsibility of Construction Discovery. Construction Discovery shall not define runtime behavior, behavioral semantics, lookup behavior, resolution behavior, loading behavior, construction behavior, or discovery implementation.",
    }),
    Object.freeze({
        id: "CDD-7",
        title: "Discovery Integrity",
        statement:
            "Discovery identity shall remain valid. Construction Catalog references shall remain valid. Discovery consistency shall be preserved. No verification algorithm is defined by this chapter.",
    }),
    Object.freeze({
        id: "CDD-8",
        title: "Declarative Restriction",
        statement:
            "Construction Discovery is purely declarative. No executable logic shall be introduced. No behavioral semantics shall be introduced. No runtime semantics shall be introduced.",
    }),
    Object.freeze({
        id: "CDD-9",
        title: "Runtime Isolation",
        statement:
            "Construction Discovery shall not expose runtime objects, runtime instances, runtime context, runtime scheduling, runtime lifecycle, or runtime state. Construction Discovery shall remain independent of every runtime component.",
    }),
    Object.freeze({
        id: "CDD-10",
        title: "Boundary Preservation",
        statement:
            "Construction Discovery shall preserve the responsibilities of Construction Contract, Construction Definition, Construction Registry, and Construction Catalog. No responsibility defined by frozen chapters shall migrate into Construction Discovery. Construction Discovery shall not redefine any frozen contract. Construction Discovery shall not absorb Registry or Catalog responsibilities.",
    }),
    Object.freeze({
        id: "CDD-11",
        title: "Future Compatibility",
        statement:
            "Construction Discovery shall support future architectural extensions without defining their responsibilities. Future architectural layers may reference Construction Discovery without modifying its responsibility. Future architectural responsibilities requiring declarative discovery beyond Construction Catalog shall be defined by separate frozen architectural contracts. No future architectural responsibility shall violate this contract.",
    }),
    Object.freeze({
        id: "CDD-12",
        title: "Discovery Ownership",
        statement:
            "Construction Discovery owns only discovery identity, discovery metadata, and declarative architectural responsibility. Construction Catalog remains owned by Chapter 21. Construction Discovery owns no runtime responsibility.",
    }),
]);

/** Frozen registry of all Chapter 22 Construction Discovery principles (CDD-1…CDD-12). */
export const CONSTRUCTION_DISCOVERY_PRINCIPLES: readonly ConstructionDiscoveryPrinciple[] =
    PRINCIPLES;

export const CONSTRUCTION_DISCOVERY_PRINCIPLE_IDS: readonly ConstructionDiscoveryPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

/**
 * Principle-catalog accessor only (immutable CDD entries for Construction Discovery).
 * MUST NOT discover, lookup, resolve, load, or construct Catalog / Definition contents.
 */
export function getConstructionDiscoveryPrinciple(
    id: ConstructionDiscoveryPrincipleId
): ConstructionDiscoveryPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ConstructionDiscoveryPrincipleId: ${id}`);
    }
    return found;
}
