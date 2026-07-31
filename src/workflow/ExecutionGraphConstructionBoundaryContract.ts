/**
 * ASA-ARCH-21.3 Chapter 17 — Execution Graph Construction Boundary Contract (Draft 0.5)
 *
 * Declarative structural Execution Graph Construction Boundary contract registry and type model only.
 *
 * SHALL NOT contain:
 * - builder / factory / compiler / generator / construction pipeline
 * - graph construction / generation / transformation
 * - runtime representation construction / binding / lifecycle
 * - scheduling / dispatch / engine assignment / algorithms
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–16 frozen contracts (extension only).
 *
 * Note: CBC-* IDs here are Construction Boundary Contract elements.
 * They are distinct from Chapter 11 Composition Boundary Contract CBC-* IDs
 * (separate TypeScript id unions and registries).
 */

/** Stable construction boundary identity — not a runtime instance identity (CBC-1). */
export type ConstructionBoundaryIdentity = string;

/** Declarative input contract identification — contract types only (CBC-3). */
export interface ConstructionInputContract {
    readonly acceptedContractTypes: readonly string[];
}

/** Structural ownership boundary for accepted input (CBC-3). */
export interface ConstructionInputBoundary {
    readonly ownershipBoundary: string;
}

/** Structural output boundary for downstream construction architecture (CBC-4). */
export interface ConstructionOutputBoundary {
    readonly exposedContractType: string;
}

/** Architectural responsibility transition metadata (CBC-5). */
export interface ConstructionResponsibilityBoundary {
    readonly from: string;
    readonly to: string;
}

/** Compatibility metadata declaration (CBC-6). */
export interface ConstructionCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Structural construction scope (CBC-7). */
export interface ConstructionScope {
    readonly scope: string;
}

/**
 * Declarative Construction Boundary structure.
 * Describes where construction responsibility begins — not how construction is performed.
 */
export interface ConstructionBoundary {
    readonly boundaryId: ConstructionBoundaryIdentity;
    readonly inputContract: ConstructionInputContract;
    readonly inputBoundary: ConstructionInputBoundary;
    readonly outputBoundary: ConstructionOutputBoundary;
    readonly responsibilityBoundary: ConstructionResponsibilityBoundary;
    readonly compatibility: ConstructionCompatibility;
    readonly constructionScope: ConstructionScope;
}

export type ExecutionGraphConstructionBoundaryContractId =
    | "CBC-1"
    | "CBC-2"
    | "CBC-3"
    | "CBC-4"
    | "CBC-5"
    | "CBC-6"
    | "CBC-7"
    | "CBC-8"
    | "CBC-9"
    | "CBC-10"
    | "CBC-11"
    | "CBC-12";

export interface ExecutionGraphConstructionBoundaryContractPrinciple {
    readonly id: ExecutionGraphConstructionBoundaryContractId;
    readonly title: string;
    readonly statement: string;
}

/** Construction Boundary Verification — excluded concerns (documentation only). */
export const EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_VERIFICATION =
    Object.freeze([
        "Builder",
        "Factory",
        "Compiler",
        "Generator",
        "Construction Pipeline",
        "Construction Procedure",
        "Graph Construction",
        "Graph Generation",
        "Graph Transformation",
        "Runtime Representation Construction",
        "Scheduling",
        "Dispatch",
        "Engine Assignment",
        "Runtime Binding",
        "Runtime Lifecycle",
        "Validation Algorithms",
        "Optimization Algorithms",
    ] as const);

/** Construction Boundary Outcome — architectural boundary foundation (declarative only). */
export const EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_OUTCOME =
    Object.freeze({
        statement:
            "The Execution Graph Construction Boundary Contract establishes the architectural boundary foundation for subsequent Construction Contract architecture.",
        scope: "This chapter defines structural construction boundary contracts only.",
        exclusion:
            "Behavioral semantics are intentionally excluded from this chapter.",
    } as const);

const PRINCIPLES: readonly ExecutionGraphConstructionBoundaryContractPrinciple[] =
    Object.freeze([
        Object.freeze({
            id: "CBC-1",
            title: "Boundary Identity",
            statement:
                "Construction Boundary SHALL have a stable identity. Identity represents structural boundary identity. Identity SHALL NOT represent runtime instances.",
        }),
        Object.freeze({
            id: "CBC-2",
            title: "Construction Ownership",
            statement:
                "Construction Boundary SHALL declare ownership of construction responsibilities. Ownership SHALL NOT include implementation responsibilities.",
        }),
        Object.freeze({
            id: "CBC-3",
            title: "Construction Input Boundary",
            statement:
                "Construction Boundary SHALL define the structural input accepted by future construction architecture. Construction Input Boundary SHALL identify accepted contract types only. Construction Input Boundary SHALL NOT define transformation behavior.",
        }),
        Object.freeze({
            id: "CBC-4",
            title: "Output Boundary",
            statement:
                "Construction Boundary SHALL define the structural boundary through which downstream construction architecture receives declarative contracts. Output Boundary SHALL NOT define runtime representations.",
        }),
        Object.freeze({
            id: "CBC-5",
            title: "Responsibility Boundary",
            statement:
                "Construction Boundary SHALL define the responsibility transition between declarative graph architecture and construction architecture. No execution responsibility SHALL be introduced.",
        }),
        Object.freeze({
            id: "CBC-6",
            title: "Compatibility",
            statement:
                "Construction Boundary SHALL declare compatibility metadata. Compatibility supports contract verification, boundary verification, and future compatibility.",
        }),
        Object.freeze({
            id: "CBC-7",
            title: "Construction Scope",
            statement:
                "Construction Boundary SHALL define structural construction scope. Construction Scope SHALL NOT define construction algorithms, runtime behavior, scheduling, or dispatch.",
        }),
        Object.freeze({
            id: "CBC-8",
            title: "Declarative Restriction",
            statement:
                "Construction Boundary SHALL remain declarative. Executable functions, build procedures, construction procedures, and runtime instructions SHALL remain outside this chapter.",
        }),
        Object.freeze({
            id: "CBC-9",
            title: "Runtime Isolation",
            statement:
                "Construction Boundary SHALL remain runtime independent. Construction Boundary MUST NOT contain runtime objects, runtime instances, scheduler references, dispatcher references, engine references, or runtime graph references.",
        }),
        Object.freeze({
            id: "CBC-10",
            title: "Boundary Preservation",
            statement:
                "Construction Boundary SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, Chapter 14 Pipeline Execution Contract, Chapter 15 Execution Definition Contract, and Chapter 16 Execution Graph Contract. Previous frozen contracts SHALL NOT be modified.",
        }),
        Object.freeze({
            id: "CBC-11",
            title: "Future Construction Compatibility",
            statement:
                "Construction Boundary SHALL provide stable architectural input for future construction architecture. Future construction architecture MAY consume this Construction Boundary. Future construction architecture SHALL NOT require modification of this contract.",
        }),
        Object.freeze({
            id: "CBC-12",
            title: "Construction Transition",
            statement:
                "Construction Boundary SHALL define only the architectural transition into construction architecture. Transition SHALL NOT define construction sequence, construction timing, construction implementation, or runtime execution.",
        }),
    ]);

/** Frozen registry of all Chapter 17 Construction Boundary Contracts (CBC-1…CBC-12). */
export const EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACTS: readonly ExecutionGraphConstructionBoundaryContractPrinciple[] =
    PRINCIPLES;

export const EXECUTION_GRAPH_CONSTRUCTION_BOUNDARY_CONTRACT_IDS: readonly ExecutionGraphConstructionBoundaryContractId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getExecutionGraphConstructionBoundaryContract(
    id: ExecutionGraphConstructionBoundaryContractId
): ExecutionGraphConstructionBoundaryContractPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(
            `Unknown ExecutionGraphConstructionBoundaryContractId: ${id}`
        );
    }
    return found;
}
