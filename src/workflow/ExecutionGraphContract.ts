/**
 * ASA-ARCH-21.3 Chapter 16 — Execution Graph Contract (Draft 0.3)
 *
 * Declarative structural Execution Graph contract registry and type model only.
 *
 * SHALL NOT contain:
 * - graph construction / generation / transformation / validation
 * - graph traversal / optimization / topological sorting / cycle detection
 * - scheduler / dispatcher / engine selection / runtime binding
 * - runtime lifecycle / runtime execution / algorithms
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–15 frozen contracts (extension only).
 */

/** Stable graph identity — not a runtime instance identity (EGC-1). */
export type ExecutionGraphIdentity = string;

/** Structural graph node definition (EGC-2). */
export interface GraphNode {
    readonly nodeId: string;
    readonly nodeType?: string;
}

/** Structural graph edge definition (EGC-3) — not execution order. */
export interface GraphEdge {
    readonly edgeId: string;
    readonly sourceNodeId: string;
    readonly targetNodeId: string;
    readonly relationship?: string;
}

/** Compatibility metadata declaration (EGC-6). */
export interface GraphCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Structural graph scope (EGC-7). */
export interface GraphScope {
    readonly scope: string;
}

/** Structural graph boundary (EGC-8). */
export interface GraphBoundary {
    readonly ownershipLimit: string;
    readonly containmentBoundary: string;
}

/**
 * Declarative graph integrity metadata (EGC-12).
 * Declares integrity requirements only — no validation / repair algorithms.
 */
export interface GraphIntegrity {
    readonly requiresUniqueGraphIdentity: true;
    readonly requiresValidNodeReferences: true;
    readonly requiresValidEdgeReferences: true;
    readonly requiresValidEntryNodeReferences: true;
    readonly requiresValidExitNodeReferences: true;
    readonly requiresNoOrphanEdgeReferences: true;
}

/**
 * Declarative Execution Graph structure.
 * Describes what graph exists — not how the graph is created or executed.
 */
export interface ExecutionGraph {
    readonly graphId: ExecutionGraphIdentity;
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
    readonly entryNodes: readonly string[];
    readonly exitNodes: readonly string[];
    readonly compatibility: GraphCompatibility;
    readonly graphScope: GraphScope;
    readonly graphBoundary: GraphBoundary;
    readonly integrity: GraphIntegrity;
}

export type ExecutionGraphContractId =
    | "EGC-1"
    | "EGC-2"
    | "EGC-3"
    | "EGC-4"
    | "EGC-5"
    | "EGC-6"
    | "EGC-7"
    | "EGC-8"
    | "EGC-9"
    | "EGC-10"
    | "EGC-11"
    | "EGC-12";

export interface ExecutionGraphContractPrinciple {
    readonly id: ExecutionGraphContractId;
    readonly title: string;
    readonly statement: string;
}

/** Execution Graph Verification — excluded concerns (documentation only). */
export const EXECUTION_GRAPH_CONTRACT_VERIFICATION = Object.freeze([
    "Graph construction",
    "Execution Definition transformation",
    "Graph generation",
    "Graph validation",
    "Graph traversal",
    "Graph optimization",
    "Topological sorting",
    "Cycle detection",
    "Runtime representation construction",
    "Scheduling",
    "Dispatch",
    "Engine selection",
    "Runtime binding",
    "Runtime lifecycle",
    "Runtime execution",
] as const);

/** Execution Graph Outcome — static declarative graph foundation (declarative only). */
export const EXECUTION_GRAPH_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Execution Graph Contract establishes the architectural static declarative graph foundation for subsequent Runtime Construction contracts.",
    scope: "This chapter defines structural execution graph contracts only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const PRINCIPLES: readonly ExecutionGraphContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "EGC-1",
        title: "Graph Identity",
        statement:
            "Execution Graph SHALL have a stable identity. Identity represents structural graph identity. Identity SHALL NOT represent runtime instance identity.",
    }),
    Object.freeze({
        id: "EGC-2",
        title: "Graph Node",
        statement:
            "Execution Graph SHALL declare graph nodes. Graph Node SHALL define only structural metadata. Graph Node SHALL NOT include runtime state, executable behavior, scheduling information, or engine assignment.",
    }),
    Object.freeze({
        id: "EGC-3",
        title: "Graph Edge",
        statement:
            "Execution Graph SHALL declare structural graph edges. Graph Edge SHALL define edge identity, source node, target node, and structural relationship. Graph Edge SHALL NOT define execution order, runtime sequencing, scheduling behavior, or runtime communication.",
    }),
    Object.freeze({
        id: "EGC-4",
        title: "Entry Node",
        statement:
            "Execution Graph SHALL declare entry nodes. Entry Node SHALL identify graph entry points only. Entry Node SHALL NOT define runtime invocation behavior.",
    }),
    Object.freeze({
        id: "EGC-5",
        title: "Exit Node",
        statement:
            "Execution Graph SHALL declare exit nodes. Exit Node SHALL identify graph termination points only. Exit Node SHALL NOT define runtime completion behavior.",
    }),
    Object.freeze({
        id: "EGC-6",
        title: "Graph Compatibility",
        statement:
            "Execution Graph SHALL declare compatibility metadata. Graph Compatibility supports contract validation, version verification, and future runtime compatibility.",
    }),
    Object.freeze({
        id: "EGC-7",
        title: "Graph Scope",
        statement:
            "Execution Graph SHALL declare structural graph scope. Graph Scope SHALL NOT define runtime orchestration, scheduling behavior, or execution workflow.",
    }),
    Object.freeze({
        id: "EGC-8",
        title: "Graph Boundary",
        statement:
            "Execution Graph SHALL declare graph boundary. Graph Boundary SHALL define graph ownership limit and graph containment boundary. Graph Boundary SHALL NOT define runtime ownership, runtime responsibility, or runtime lifecycle.",
    }),
    Object.freeze({
        id: "EGC-9",
        title: "Runtime Isolation",
        statement:
            "Execution Graph SHALL remain runtime independent. Execution Graph MUST NOT contain runtime objects, runtime instances, scheduler references, dispatcher references, engine references, or resource references.",
    }),
    Object.freeze({
        id: "EGC-10",
        title: "Boundary Preservation",
        statement:
            "Execution Graph SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, Chapter 14 Pipeline Execution Contract, and Chapter 15 Execution Definition Contract. Previous frozen contracts SHALL NOT be modified.",
    }),
    Object.freeze({
        id: "EGC-11",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Graph SHALL provide stable structural input for future runtime construction architecture. Future runtime construction SHALL NOT require modification of this contract.",
    }),
    Object.freeze({
        id: "EGC-12",
        title: "Graph Integrity",
        statement:
            "Execution Graph SHALL satisfy structural integrity. Graph Integrity SHALL require unique graph identity, valid node references, valid edge references, valid entry node references, valid exit node references, and no orphan edge references. Graph Integrity SHALL NOT define validation algorithms, optimization algorithms, or repair procedures.",
    }),
]);

/** Frozen registry of all Chapter 16 Execution Graph Contracts (EGC-1…EGC-12). */
export const EXECUTION_GRAPH_CONTRACTS: readonly ExecutionGraphContractPrinciple[] =
    PRINCIPLES;

export const EXECUTION_GRAPH_CONTRACT_IDS: readonly ExecutionGraphContractId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getExecutionGraphContract(
    id: ExecutionGraphContractId
): ExecutionGraphContractPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ExecutionGraphContractId: ${id}`);
    }
    return found;
}
