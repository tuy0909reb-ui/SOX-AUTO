/**
 * ASA-ARCH-21.3 Chapter 15 — Execution Definition Contract (Draft 0.3)
 *
 * Declarative structural Execution Definition contract registry and type model only.
 *
 * SHALL NOT contain:
 * - ExecutionGraph generation / transformation / runtime representation
 * - graph construction / traversal / scheduling / dispatch
 * - engine selection / runtime binding / resource management
 * - runtime lifecycle / execution algorithms / runtime execution
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–14 frozen contracts (extension only).
 */

/** Stable definition identity — not a runtime instance identity (EDC-1). */
export type ExecutionDefinitionIdentity = string;

/** Descriptive definition type metadata only (EDC-2). */
export type ExecutionDefinitionTypeMetadata = string;

/** Structural execution node definition (EDC-3). */
export interface ExecutionNodeDefinition {
    readonly nodeId: string;
    readonly nodeType?: string;
}

/** Structural endpoint definition (EDC-4). */
export interface ExecutionEndpointDefinition {
    readonly endpointId: string;
    readonly kind: "input" | "output";
    readonly interfaceMetadata?: string;
}

/** Structural dependency metadata (EDC-5) — not graph edges or scheduling. */
export interface StructuralDependencyMetadata {
    readonly from: string;
    readonly to: string;
    readonly relationship?: string;
}

/** Compatibility metadata declaration (EDC-6). */
export interface ExecutionDefinitionCompatibility {
    readonly version: string;
    readonly contract: string;
}

/** Structural definition scope (EDC-11). */
export interface ExecutionDefinitionScope {
    readonly scope: string;
}

/** Structural definition boundary (EDC-12). */
export interface ExecutionDefinitionBoundary {
    readonly ownershipLimit: string;
    readonly containmentBoundary: string;
}

/**
 * Declarative Execution Definition structure.
 * Describes what execution definition exists — not how execution is performed.
 */
export interface ExecutionDefinition {
    readonly definitionId: ExecutionDefinitionIdentity;
    readonly definitionType: ExecutionDefinitionTypeMetadata;
    readonly nodes: readonly ExecutionNodeDefinition[];
    readonly endpoints: readonly ExecutionEndpointDefinition[];
    readonly structuralDependencies: readonly StructuralDependencyMetadata[];
    readonly compatibility: ExecutionDefinitionCompatibility;
    readonly definitionScope: ExecutionDefinitionScope;
    readonly definitionBoundary: ExecutionDefinitionBoundary;
}

export type ExecutionDefinitionContractId =
    | "EDC-1"
    | "EDC-2"
    | "EDC-3"
    | "EDC-4"
    | "EDC-5"
    | "EDC-6"
    | "EDC-7"
    | "EDC-8"
    | "EDC-9"
    | "EDC-10"
    | "EDC-11"
    | "EDC-12";

export interface ExecutionDefinitionContractPrinciple {
    readonly id: ExecutionDefinitionContractId;
    readonly title: string;
    readonly statement: string;
}

/** Execution Definition Verification — excluded concerns (documentation only). */
export const EXECUTION_DEFINITION_CONTRACT_VERIFICATION = Object.freeze([
    "ExecutionGraph generation",
    "Execution Definition transformation",
    "Runtime representation construction",
    "Graph construction",
    "Graph traversal",
    "Scheduling strategy",
    "Dispatch algorithm",
    "Engine selection",
    "Runtime binding",
    "Resource allocation",
    "Runtime lifecycle",
    "Execution algorithms",
    "Runtime execution",
] as const);

/** Execution Definition Outcome — static declarative foundation (declarative only). */
export const EXECUTION_DEFINITION_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Execution Definition Contract establishes the architectural static declarative foundation for subsequent Runtime Construction contracts.",
    scope: "This chapter defines structural execution definition contracts only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const PRINCIPLES: readonly ExecutionDefinitionContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "EDC-1",
        title: "Definition Identity",
        statement:
            "Execution Definition SHALL have a stable identity. Identity represents structural definition identity. Identity SHALL NOT represent runtime instance identity.",
    }),
    Object.freeze({
        id: "EDC-2",
        title: "Definition Type",
        statement:
            "Execution Definition SHALL declare descriptive metadata. Definition Type SHALL NOT control runtime behavior. Definition Type SHALL NOT select execution engines. Definition Type SHALL NOT control scheduling.",
    }),
    Object.freeze({
        id: "EDC-3",
        title: "Node Definition",
        statement:
            "Execution Definition SHALL describe execution nodes. Node Definition SHALL define only structural metadata. Node Definition SHALL NOT include executable code, runtime state, scheduling information, or engine assignment.",
    }),
    Object.freeze({
        id: "EDC-4",
        title: "Endpoint Definition",
        statement:
            "Execution Definition SHALL describe structural endpoints. Endpoint Definition SHALL define input endpoint, output endpoint, and interface metadata. Endpoint Definition SHALL NOT define communication protocol, runtime transport, or invocation behavior.",
    }),
    Object.freeze({
        id: "EDC-5",
        title: "Structural Dependency Metadata",
        statement:
            "Execution Definition SHALL declare structural dependencies. Structural Dependency Metadata SHALL define structural dependency and definition relationship. Structural Dependency Metadata SHALL NOT define runtime ordering, scheduling sequence, execution timing, or graph edges.",
    }),
    Object.freeze({
        id: "EDC-6",
        title: "Compatibility Declaration",
        statement:
            "Execution Definition SHALL declare compatibility metadata. Compatibility Declaration supports contract validation, version verification, and future runtime compatibility.",
    }),
    Object.freeze({
        id: "EDC-7",
        title: "Declarative Restriction",
        statement:
            "Execution Definition SHALL remain declarative. Executable functions, algorithms, runtime instructions, and workflow commands SHALL remain outside this chapter.",
    }),
    Object.freeze({
        id: "EDC-8",
        title: "Runtime Isolation",
        statement:
            "Execution Definition SHALL remain runtime independent. Execution Definition MUST NOT contain runtime objects, runtime instances, ExecutionGraph references, scheduler references, dispatcher references, engine references, or resource references.",
    }),
    Object.freeze({
        id: "EDC-9",
        title: "Boundary Preservation",
        statement:
            "Execution Definition SHALL preserve boundaries established by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, Chapter 13 Pipeline Execution Boundary Contract, and Chapter 14 Pipeline Execution Contract. Previous frozen contracts SHALL NOT be modified.",
    }),
    Object.freeze({
        id: "EDC-10",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Definition SHALL provide stable structural input for future runtime architecture. Future runtime MAY reference Execution Definition. Future runtime SHALL NOT require modification of this contract.",
    }),
    Object.freeze({
        id: "EDC-11",
        title: "Definition Scope",
        statement:
            "Execution Definition SHALL declare structural definition scope. Definition Scope SHALL NOT define runtime workflow, execution sequence, scheduling behavior, engine ownership, or runtime orchestration.",
    }),
    Object.freeze({
        id: "EDC-12",
        title: "Definition Boundary",
        statement:
            "Execution Definition SHALL declare its structural boundary. Definition Boundary SHALL define structural ownership limit and definition containment boundary. Definition Boundary SHALL NOT define runtime ownership, runtime lifecycle, or runtime execution responsibility.",
    }),
]);

/** Frozen registry of all Chapter 15 Execution Definition Contracts (EDC-1…EDC-12). */
export const EXECUTION_DEFINITION_CONTRACTS: readonly ExecutionDefinitionContractPrinciple[] =
    PRINCIPLES;

export const EXECUTION_DEFINITION_CONTRACT_IDS: readonly ExecutionDefinitionContractId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getExecutionDefinitionContract(
    id: ExecutionDefinitionContractId
): ExecutionDefinitionContractPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown ExecutionDefinitionContractId: ${id}`);
    }
    return found;
}
