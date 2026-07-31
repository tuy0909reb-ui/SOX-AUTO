/**
 * ASA-ARCH-21.0 / ASA-ARCH-21.3 Chapter 21 — Construction Catalog (Draft 0.5)
 *
 * Declarative Construction Catalog type model and CCA registry only.
 *
 * SHALL NOT contain:
 * - registration / registry management / lookup / resolution / discovery / loading
 * - scheduling / dependency analysis / construction planning / construction execution
 * - runtime behavior / lifecycle / state
 * - validation algorithms / executable catalog services
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–20 frozen contracts (extension only).
 *
 * Ownership:
 * - Construction Definition owned by Chapter 19
 * - Construction Registry owned by Chapter 20
 * - Construction Catalog owns only identity, metadata, and declarative organization
 *
 * Note: getConstructionCatalogPrinciple is a principle-catalog accessor only.
 * It is not a catalog lookup / discovery / resolution / loading service.
 */

/** Stable construction catalog identity (CCA-1). */
export type ConstructionCatalogIdentity = string;

/**
 * Declarative Construction Definition reference within a Catalog (CCA-2 / CCA-3).
 * Identifies exactly one existing Construction Definition — no duplication of contents.
 */
export interface CatalogDefinitionReference {
    readonly definitionId: string;
}

/**
 * Declarative catalog element (CCA-2).
 * Reference-only — no executable information.
 */
export interface CatalogElement {
    readonly definitionReference: CatalogDefinitionReference;
}

/**
 * Declarative catalog organization (CCA-4).
 * Organization semantics are intentionally undefined — no order, dependency,
 * scheduling, loading, resolution priority, or structural hierarchy.
 */
export interface CatalogOrganization {
    readonly architecturalViewOnly: true;
    readonly semanticsUndefined: true;
}

/**
 * Declarative catalog metadata (CCA-5).
 * Identifier / name / version / ownership / compatibility — no runtime info.
 */
export interface ConstructionCatalogMetadata {
    readonly identifier: string;
    readonly name: string;
    readonly version: string;
    readonly ownership: string;
    readonly compatibilityInformation: string;
}

/** Catalog compatibility metadata (CCA-6). */
export interface CatalogCompatibility {
    readonly version: string;
    readonly contract: string;
    readonly preservesDefinitionCompatibility: true;
    readonly preservesRegistryCompatibility: true;
    readonly preservesPriorCatalogCompatibility: true;
}

/** Catalog scope (CCA-7). */
export interface CatalogScope {
    readonly scope: string;
}

/**
 * Declarative catalog integrity metadata (CCA-8).
 * Declares integrity requirements only — no verification / existence-check algorithm.
 */
export interface CatalogIntegrity {
    readonly requiresReferencedDefinitionsExist: true;
    readonly prohibitsDuplicateCatalogIdentities: true;
    readonly requiresCatalogConsistency: true;
}

/**
 * Declarative Construction Catalog structure.
 * Describes architectural organization of Construction Definition references —
 * not how cataloging, lookup, or construction is performed.
 */
export interface ConstructionCatalog {
    readonly catalogId: ConstructionCatalogIdentity;
    readonly elements: readonly CatalogElement[];
    readonly organization: CatalogOrganization;
    readonly metadata: ConstructionCatalogMetadata;
    readonly compatibility: CatalogCompatibility;
    readonly catalogScope: CatalogScope;
    readonly integrity: CatalogIntegrity;
}

export type ConstructionCatalogPrincipleId =
    | "CCA-1"
    | "CCA-2"
    | "CCA-3"
    | "CCA-4"
    | "CCA-5"
    | "CCA-6"
    | "CCA-7"
    | "CCA-8"
    | "CCA-9"
    | "CCA-10"
    | "CCA-11"
    | "CCA-12"
    | "CCA-13";

export interface ConstructionCatalogPrinciple {
    readonly id: ConstructionCatalogPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Catalog Verification — excluded concerns (documentation only). */
export const CONSTRUCTION_CATALOG_VERIFICATION = Object.freeze([
    "Registration",
    "Registry management",
    "Lookup",
    "Resolution",
    "Discovery",
    "Loading",
    "Scheduling",
    "Dependency analysis",
    "Construction planning",
    "Construction execution",
    "Runtime behavior",
    "Runtime lifecycle",
    "Runtime state",
    "Validation algorithms",
    "Executable catalog services",
] as const);

/** Construction Catalog Outcome — declarative architectural artifact only. */
export const CONSTRUCTION_CATALOG_OUTCOME = Object.freeze({
    statement:
        "Construction Catalog defines the declarative architectural organization of existing Construction Definition references.",
    scope: "It establishes only catalog identity, metadata, integrity requirements, and declarative architectural organization.",
    exclusion:
        "No registration behavior, lookup behavior, resolution behavior, loading behavior, construction behavior, or runtime behavior is introduced.",
    ownership:
        "Construction Definition remains owned by Chapter 19. Construction Registry remains owned by Chapter 20.",
} as const);

const PRINCIPLES: readonly ConstructionCatalogPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CCA-1",
        title: "Catalog Identity",
        statement:
            "Every Construction Catalog shall possess a unique identity. Catalog identity shall remain immutable. Catalog identity shall not depend upon runtime state.",
    }),
    Object.freeze({
        id: "CCA-2",
        title: "Catalog Elements",
        statement:
            "A Construction Catalog consists exclusively of declarative references to existing Construction Definitions. Each Catalog reference shall identify exactly one existing Construction Definition. Construction Catalog shall not duplicate Construction Definition contents. Construction Catalog shall not introduce executable information.",
    }),
    Object.freeze({
        id: "CCA-3",
        title: "Construction Definition References",
        statement:
            "Construction Catalog shall reference existing Construction Definitions only. Catalog references identify associated Construction Definitions. Catalog references shall not own, modify, or register Construction Definitions.",
    }),
    Object.freeze({
        id: "CCA-4",
        title: "Catalog Organization",
        statement:
            "Construction Catalog defines only the architectural organization of Construction Definition references. The organization semantics are intentionally undefined. Construction Catalog shall not define execution order, dependency relationships, scheduling priority, loading priority, resolution priority, or structural hierarchy. No runtime semantics shall be inferred from catalog organization.",
    }),
    Object.freeze({
        id: "CCA-5",
        title: "Catalog Metadata",
        statement:
            "Catalog metadata may include identifier, name, version, ownership, and compatibility information. Catalog metadata shall remain declarative. Catalog metadata shall not contain runtime information.",
    }),
    Object.freeze({
        id: "CCA-6",
        title: "Catalog Compatibility",
        statement:
            "Catalog revisions shall preserve compatibility with existing Construction Definitions. Catalog revisions shall preserve compatibility with existing Construction Registries. Catalog revisions shall preserve compatibility with previous Catalog revisions. Construction Definition references shall remain valid regardless of Catalog revisions.",
    }),
    Object.freeze({
        id: "CCA-7",
        title: "Catalog Scope",
        statement:
            "Construction Catalog defines only a declarative architectural view. Construction Catalog shall not define runtime services, registry behavior, registration behavior, lookup behavior, resolution behavior, discovery behavior, loading behavior, construction behavior, or execution behavior.",
    }),
    Object.freeze({
        id: "CCA-8",
        title: "Catalog Integrity",
        statement:
            "Every referenced Construction Definition shall exist. Duplicate Catalog identities are prohibited. Catalog consistency shall be preserved. No verification algorithm is defined by this chapter.",
    }),
    Object.freeze({
        id: "CCA-9",
        title: "Declarative Restriction",
        statement:
            "Construction Catalog is purely declarative. No executable logic shall be introduced. No behavioral semantics shall be introduced. No runtime semantics shall be introduced.",
    }),
    Object.freeze({
        id: "CCA-10",
        title: "Runtime Isolation",
        statement:
            "Construction Catalog shall not expose runtime objects, runtime instances, runtime context, runtime scheduling, runtime lifecycle, or runtime state. Construction Catalog shall remain independent of every runtime component.",
    }),
    Object.freeze({
        id: "CCA-11",
        title: "Boundary Preservation",
        statement:
            "Construction Catalog shall preserve the responsibilities of Construction Contract, Construction Definition, and Construction Registry. No responsibility defined by frozen chapters shall migrate into Construction Catalog. Construction Catalog shall not redefine any frozen contract. Construction Catalog is not a presentation or alternative representation of Construction Registry.",
    }),
    Object.freeze({
        id: "CCA-12",
        title: "Future Compatibility",
        statement:
            "Construction Catalog shall support future architectural extensions without defining their responsibilities. Future architectural layers shall consume Construction Catalog without altering its responsibility. No future architectural responsibility shall violate this contract.",
    }),
    Object.freeze({
        id: "CCA-13",
        title: "Catalog Ownership",
        statement:
            "Construction Catalog owns only catalog identity, catalog metadata, and declarative architectural organization. Construction Definition remains owned by Chapter 19. Construction Registry remains owned by Chapter 20. Construction Catalog owns no runtime responsibility.",
    }),
]);

/** Frozen registry of all Chapter 21 Construction Catalog principles (CCA-1…CCA-13). */
export const CONSTRUCTION_CATALOG_PRINCIPLES: readonly ConstructionCatalogPrinciple[] =
    PRINCIPLES;

export const CONSTRUCTION_CATALOG_PRINCIPLE_IDS: readonly ConstructionCatalogPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

/**
 * Principle-catalog accessor only (immutable CCA entries).
 * MUST NOT register, resolve, discover, load, or construct Construction Definitions.
 */
export function getConstructionCatalogPrinciple(
    id: ConstructionCatalogPrincipleId
): ConstructionCatalogPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ConstructionCatalogPrincipleId: ${id}`);
    }
    return found;
}
