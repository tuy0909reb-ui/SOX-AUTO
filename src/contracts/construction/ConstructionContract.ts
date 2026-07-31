/**
 * ASA-ARCH-21.3 Chapter 18 — Construction Contract (Draft 0.3)
 *
 * Declarative Construction Contract type model and CCC registry only.
 *
 * SHALL NOT contain:
 * - graph construction / generation / transformation
 * - builders / factories / compilers / generators / transformers
 * - scheduling / dispatch / runtime binding / lifecycle / execution
 * - validation / optimization algorithms / construction procedures
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–17 frozen contracts (extension only).
 */

/** Stable construction contract identity — not a runtime identity (CCC-1). */
export type ConstructionContractIdentity = string;

/** Declarative input contract reference only (CCC-2). */
export interface ConstructionContractInput {
    readonly contractType: string;
}

/** Declarative output contract reference only (CCC-3). */
export interface ConstructionContractOutput {
    readonly contractType: string;
}

/**
 * Declarative structural metadata (CCC-4).
 * MUST NOT include configuration, options, executable, or behavioral metadata.
 */
export interface ConstructionMetadata {
    readonly description: string;
}

/**
 * Declarative responsibility metadata associated with Ch17 responsibility transition (CCC-5).
 * MUST NOT redefine Responsibility Boundary or introduce implementation responsibility.
 */
export interface ConstructionResponsibilityMetadata {
    readonly associatedBoundary: string;
    readonly responsibilityMetadata: string;
}

/** Declarative compatibility metadata (CCC-6). */
export interface ConstructionCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Declarative construction scope (CCC-7 / CCC-12). */
export interface ConstructionScope {
    readonly scope: string;
}

/**
 * Declarative Construction Contract structure.
 * Describes what construction contract exists — not how construction is performed.
 */
export interface ConstructionContract {
    readonly contractId: ConstructionContractIdentity;
    readonly inputContract: ConstructionContractInput;
    readonly outputContract: ConstructionContractOutput;
    readonly constructionMetadata: ConstructionMetadata;
    readonly constructionResponsibilityMetadata: ConstructionResponsibilityMetadata;
    readonly compatibility: ConstructionCompatibility;
    readonly constructionScope: ConstructionScope;
}

export type ConstructionContractPrincipleId =
    | "CCC-1"
    | "CCC-2"
    | "CCC-3"
    | "CCC-4"
    | "CCC-5"
    | "CCC-6"
    | "CCC-7"
    | "CCC-8"
    | "CCC-9"
    | "CCC-10"
    | "CCC-11"
    | "CCC-12";

export interface ConstructionContractPrinciple {
    readonly id: ConstructionContractPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Contract Verification — excluded concerns (documentation only). */
export const CONSTRUCTION_CONTRACT_VERIFICATION = Object.freeze([
    "Graph construction",
    "Graph generation",
    "Graph transformation",
    "Runtime graph construction",
    "Construction procedures",
    "Construction pipeline",
    "Builder implementations",
    "Factory implementations",
    "Compiler implementations",
    "Generator implementations",
    "Scheduling",
    "Dispatch",
    "Engine selection",
    "Runtime binding",
    "Runtime lifecycle",
    "Runtime execution",
    "Validation algorithms",
    "Optimization algorithms",
] as const);

/** Construction Contract Outcome — declarative foundation (declarative only). */
export const CONSTRUCTION_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Construction Contract establishes the architectural declarative foundation for subsequent Construction Definition architecture.",
    scope: "This chapter defines structural construction contracts only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const PRINCIPLES: readonly ConstructionContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CCC-1",
        title: "Contract Identity",
        statement:
            "Construction Contract SHALL have a stable identity. Identity represents structural contract identity. Identity SHALL NOT represent runtime identity.",
    }),
    Object.freeze({
        id: "CCC-2",
        title: "Input Contract",
        statement:
            "Construction Contract SHALL declare a declarative input contract. Input Contract SHALL be a contract reference only. Input Contract SHALL NOT define processing behavior.",
    }),
    Object.freeze({
        id: "CCC-3",
        title: "Output Contract",
        statement:
            "Construction Contract SHALL declare a declarative output contract. Output Contract SHALL NOT define runtime representations.",
    }),
    Object.freeze({
        id: "CCC-4",
        title: "Construction Metadata",
        statement:
            "Construction Metadata SHALL describe declarative structural metadata associated with the Construction Contract. Metadata SHALL NOT include construction configuration, runtime configuration, executable information, construction options, or behavioral metadata.",
    }),
    Object.freeze({
        id: "CCC-5",
        title: "Construction Responsibility Metadata",
        statement:
            "Construction Responsibility Metadata SHALL describe declarative responsibility metadata associated with the responsibility transition defined by Chapter 17. It SHALL NOT redefine the Responsibility Boundary, modify boundary semantics, or introduce implementation responsibilities.",
    }),
    Object.freeze({
        id: "CCC-6",
        title: "Compatibility",
        statement:
            "Construction Contract SHALL declare declarative compatibility metadata.",
    }),
    Object.freeze({
        id: "CCC-7",
        title: "Construction Scope",
        statement:
            "Construction Contract SHALL declare structural construction scope. Construction Scope SHALL NOT contain algorithms, scheduling, dispatch, runtime behavior, or executable information.",
    }),
    Object.freeze({
        id: "CCC-8",
        title: "Declarative Restriction",
        statement:
            "Construction Contract SHALL remain declarative. Executable members, construction procedures, and runtime instructions SHALL remain outside this chapter.",
    }),
    Object.freeze({
        id: "CCC-9",
        title: "Runtime Isolation",
        statement:
            "Construction Contract SHALL remain runtime independent. Construction Contract MUST NOT contain runtime objects, runtime instances, scheduler references, dispatcher references, engine references, or runtime graph references.",
    }),
    Object.freeze({
        id: "CCC-10",
        title: "Boundary Preservation",
        statement:
            "Construction Contract SHALL preserve boundaries established by Chapter 11 through Chapter 17. Previous frozen contracts SHALL NOT be modified.",
    }),
    Object.freeze({
        id: "CCC-11",
        title: "Future Construction Compatibility",
        statement:
            "Construction Contract SHALL provide stable declarative input for future Construction Definition architecture. Future Construction Definition SHALL NOT require modification of this contract.",
    }),
    Object.freeze({
        id: "CCC-12",
        title: "Contract Scope",
        statement:
            "Construction Contract SHALL remain within declarative contract scope only.",
    }),
]);

/** Frozen registry of all Chapter 18 Construction Contract principles (CCC-1…CCC-12). */
export const CONSTRUCTION_CONTRACT_PRINCIPLES: readonly ConstructionContractPrinciple[] =
    PRINCIPLES;

export const CONSTRUCTION_CONTRACT_PRINCIPLE_IDS: readonly ConstructionContractPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getConstructionContractPrinciple(
    id: ConstructionContractPrincipleId
): ConstructionContractPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ConstructionContractPrincipleId: ${id}`);
    }
    return found;
}
