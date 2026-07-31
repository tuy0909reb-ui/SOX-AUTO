/**
 * ASA-ARCH-21.3 Chapter 19 — Construction Definition (Draft 1.1)
 *
 * Declarative Construction Definition type model and CDD registry only.
 *
 * SHALL NOT contain:
 * - construction / execution / runtime / validation / generation logic
 * - builders / factories / compilers / generators / algorithms
 * - scheduling / dispatch / dependency resolution / object instantiation
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–18 frozen contracts (extension only).
 *
 * Note: ConstructionResponsibilityMetadata here is Construction Definition element
 * descriptive metadata (CDD-4). It is distinct from Chapter 18's
 * ConstructionResponsibilityMetadata in ConstructionContract.ts.
 */

/** Stable construction definition identity (CDD-1). */
export type ConstructionDefinitionIdentity = string;

/**
 * Declarative definition element (CDD-2).
 * Structure only — no procedures or behavior.
 */
export interface ConstructionDefinitionElement {
    readonly elementId: string;
    readonly elementType?: string;
}

/**
 * Declarative definition metadata (CDD-3).
 * Descriptive only — no responsibility / behavior change.
 */
export interface ConstructionDefinitionMetadata {
    readonly description: string;
}

/**
 * Declarative construction responsibility metadata for definition elements (CDD-4).
 * Descriptive only — no behavioral semantics.
 */
export interface ConstructionResponsibilityMetadata {
    readonly description: string;
}

/** Definition compatibility metadata (CDD-5). */
export interface ConstructionDefinitionCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Definition scope (CDD-6). */
export interface ConstructionDefinitionScope {
    readonly scope: string;
}

/**
 * Declarative definition integrity metadata (CDD-7).
 * Declares integrity requirements only — no verification algorithm.
 */
export interface ConstructionDefinitionIntegrity {
    readonly requiresInternalConsistency: true;
    readonly requiresNoContradictoryElements: true;
}

/**
 * Declarative Construction Definition structure.
 * Describes what construction definition exists — not how construction is performed.
 */
export interface ConstructionDefinition {
    readonly definitionId: ConstructionDefinitionIdentity;
    readonly elements: readonly ConstructionDefinitionElement[];
    readonly metadata: ConstructionDefinitionMetadata;
    readonly responsibilityMetadata: ConstructionResponsibilityMetadata;
    readonly compatibility: ConstructionDefinitionCompatibility;
    readonly definitionScope: ConstructionDefinitionScope;
    readonly integrity: ConstructionDefinitionIntegrity;
}

export type ConstructionDefinitionPrincipleId =
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

export interface ConstructionDefinitionPrinciple {
    readonly id: ConstructionDefinitionPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Definition Verification — excluded concerns (documentation only). */
export const CONSTRUCTION_DEFINITION_VERIFICATION = Object.freeze([
    "Construction Behavior",
    "Construction Algorithms",
    "Builder Architecture",
    "Factory Architecture",
    "Compiler Architecture",
    "Generator Architecture",
    "Construction Runtime",
    "Execution Runtime",
    "Dependency Resolution",
    "Object Instantiation",
    "Implementation Rules",
    "Validation Algorithms",
    "Scheduling",
    "Dispatch",
] as const);

/** Construction Definition Outcome — declarative architectural artifact only. */
export const CONSTRUCTION_DEFINITION_OUTCOME = Object.freeze({
    statement:
        "This chapter defines the declarative architectural representation of a Construction Definition.",
    scope: "It establishes only the identity, structure, metadata, ownership, compatibility, scope, and integrity of Construction Definitions.",
    exclusion:
        "No construction behavior, runtime behavior, implementation detail, or algorithm is introduced.",
} as const);

const PRINCIPLES: readonly ConstructionDefinitionPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CDD-1",
        title: "Construction Definition Identity",
        statement:
            "A Construction Definition shall possess its own architectural identity. The identity uniquely distinguishes one Construction Definition from another. The identity represents only the definition itself. It shall not imply construction behavior.",
    }),
    Object.freeze({
        id: "CDD-2",
        title: "Construction Definition Elements",
        statement:
            "A Construction Definition shall consist of declarative definition elements. Definition elements describe construction structure only. Definition elements shall not define construction procedures. Definition elements shall not define behavior. Definition elements shall remain implementation-independent.",
    }),
    Object.freeze({
        id: "CDD-3",
        title: "Construction Definition Metadata",
        statement:
            "A Construction Definition may include descriptive metadata. Metadata exists solely for declarative description. Metadata shall not alter architectural responsibility. Metadata shall not introduce behavior. Metadata shall remain implementation-neutral.",
    }),
    Object.freeze({
        id: "CDD-4",
        title: "Construction Responsibility Metadata",
        statement:
            "A Construction Definition may associate construction responsibility metadata with its declarative elements. Construction responsibility metadata describes declarative responsibility only. Construction responsibility metadata shall not introduce behavioral semantics. Construction responsibility metadata shall remain descriptive. Construction responsibility metadata shall remain declarative.",
    }),
    Object.freeze({
        id: "CDD-5",
        title: "Definition Compatibility",
        statement:
            "Construction Definitions shall preserve compatibility across future architectural evolution. Compatibility shall exist at the architectural contract level. Compatibility shall not depend on implementation. Future construction layers shall preserve this compatibility.",
    }),
    Object.freeze({
        id: "CDD-6",
        title: "Definition Scope",
        statement:
            "A Construction Definition defines only declarative construction structure. It shall not define Construction Procedures, Behavioral Concepts, Runtime Concepts, or Implementation Concepts.",
    }),
    Object.freeze({
        id: "CDD-7",
        title: "Definition Integrity",
        statement:
            "A Construction Definition shall remain internally consistent. Its declarative structure shall not contain contradictory declarative elements. No verification algorithm is defined by this chapter.",
    }),
    Object.freeze({
        id: "CDD-8",
        title: "Declarative Restriction",
        statement:
            "Construction Definitions are purely declarative. They define architecture only. They shall not introduce construction logic, execution logic, runtime logic, validation logic, generation logic, builder logic, factory logic, compiler logic, or algorithmic logic.",
    }),
    Object.freeze({
        id: "CDD-9",
        title: "Runtime Isolation",
        statement:
            "Construction Definitions remain completely isolated from runtime architecture. Runtime concepts shall not appear in this chapter. Future architectural layers may consume this definition without modifying its architectural responsibility.",
    }),
    Object.freeze({
        id: "CDD-10",
        title: "Boundary Preservation",
        statement:
            "This chapter preserves every architectural boundary established by Chapter 11 through Chapter 18. No responsibility defined by those chapters may be redefined here.",
    }),
    Object.freeze({
        id: "CDD-11",
        title: "Future Construction Compatibility",
        statement:
            "Future construction architecture may consume Construction Definitions. Future chapters may introduce responsibilities such as Builder, Factory, Compiler, or Generator. Those future responsibilities shall preserve the declarative definition established by this chapter. This chapter introduces none of them.",
    }),
    Object.freeze({
        id: "CDD-12",
        title: "Definition Ownership",
        statement:
            "Construction Definitions own only declarative definition responsibilities. Behavioral responsibilities are outside the ownership of Construction Definitions. Ownership remains limited to declarative definition responsibilities.",
    }),
]);

/** Frozen registry of all Chapter 19 Construction Definition principles (CDD-1…CDD-12). */
export const CONSTRUCTION_DEFINITION_PRINCIPLES: readonly ConstructionDefinitionPrinciple[] =
    PRINCIPLES;

export const CONSTRUCTION_DEFINITION_PRINCIPLE_IDS: readonly ConstructionDefinitionPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getConstructionDefinitionPrinciple(
    id: ConstructionDefinitionPrincipleId
): ConstructionDefinitionPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ConstructionDefinitionPrincipleId: ${id}`);
    }
    return found;
}
