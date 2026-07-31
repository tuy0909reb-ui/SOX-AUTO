/**
 * ASA-ARCH-21.3 Chapter 14 — Pipeline Execution Contract (Draft 0.2)
 *
 * Declarative structural Pipeline execution contract registry and type model only.
 *
 * SHALL NOT contain:
 * - ExecutionGraph / scheduler / dispatcher / engine selection
 * - runtime binding / resource management / execution algorithms
 * - runtime lifecycle / failure recovery / optimization
 * - executable workflow commands / mutable execution state
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–13 frozen contracts (extension only).
 */

/** Stable contract identity — not a runtime object identity (PEC-1). */
export type ExecutionContractIdentity = string;

/** Descriptive execution type metadata only (PEC-2). */
export type ExecutionTypeMetadata = string;

/** Structural input requirement declaration (PEC-3). */
export interface ExecutionInputContract {
    readonly name: string;
    readonly source?: string;
}

/** Structural output definition declaration (PEC-4). */
export interface ExecutionOutputContract {
    readonly name: string;
}

/** Structural responsibility boundary declaration (PEC-5). */
export interface ExecutionResponsibilityBoundary {
    readonly scope: string;
}

/** Compatibility metadata declaration (PEC-6). */
export interface ExecutionCompatibilityDeclaration {
    readonly version: string;
    readonly contract: string;
}

/** Structural execution scope boundary declaration (PEC-11). */
export interface ExecutionScopeBoundary {
    readonly scope: string;
}

/**
 * Declarative Pipeline Execution Contract structure.
 * Describes what execution structure exists — not how execution is performed.
 */
export interface ExecutionContract {
    readonly executionId: ExecutionContractIdentity;
    readonly executionType: ExecutionTypeMetadata;
    readonly inputContract: readonly ExecutionInputContract[];
    readonly outputContract: readonly ExecutionOutputContract[];
    readonly responsibilityBoundary: ExecutionResponsibilityBoundary;
    readonly compatibility: ExecutionCompatibilityDeclaration;
    readonly executionScopeBoundary: ExecutionScopeBoundary;
}

export type PipelineExecutionContractId =
    | "PEC-1"
    | "PEC-2"
    | "PEC-3"
    | "PEC-4"
    | "PEC-5"
    | "PEC-6"
    | "PEC-7"
    | "PEC-8"
    | "PEC-9"
    | "PEC-10"
    | "PEC-11";

export interface PipelineExecutionContractPrinciple {
    readonly id: PipelineExecutionContractId;
    readonly title: string;
    readonly statement: string;
}

/** Execution Contract Verification — excluded concerns (documentation only). */
export const PIPELINE_EXECUTION_CONTRACT_VERIFICATION = Object.freeze([
    "ExecutionGraph creation",
    "Scheduling strategy",
    "Dispatch algorithm",
    "Engine selection",
    "Runtime binding",
    "Resource allocation",
    "Execution algorithms",
    "Runtime lifecycle management",
    "Failure recovery",
    "Performance optimization",
] as const);

/** Execution Contract Outcome — architectural structural foundation (declarative only). */
export const PIPELINE_EXECUTION_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Pipeline Execution Contract establishes the architectural structural foundation for subsequent Runtime architectural contracts.",
    scope: "This chapter defines Pipeline structural execution contracts only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const PRINCIPLES: readonly PipelineExecutionContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "PEC-1",
        title: "Execution Identity",
        statement:
            "Execution structure SHALL have a stable identity. Identity represents contract identity. Identity SHALL NOT represent runtime object identity.",
    }),
    Object.freeze({
        id: "PEC-2",
        title: "Execution Type",
        statement:
            "Execution structure SHALL declare descriptive type metadata. Execution Type SHALL NOT select execution engines. Execution Type SHALL NOT determine runtime behavior. Execution Type SHALL NOT control scheduling.",
    }),
    Object.freeze({
        id: "PEC-3",
        title: "Input Contract",
        statement:
            "Execution structure SHALL declare required inputs. Input Contract defines structural input expectations. Input Contract SHALL NOT define data acquisition, validation logic, transformation logic, or runtime retrieval process.",
    }),
    Object.freeze({
        id: "PEC-4",
        title: "Output Contract",
        statement:
            "Execution structure SHALL declare produced outputs. Output Contract defines structural output representation. Output Contract SHALL NOT define output generation process, storage mechanism, delivery mechanism, or runtime publishing logic.",
    }),
    Object.freeze({
        id: "PEC-5",
        title: "Responsibility Boundary",
        statement:
            "Execution structure SHALL declare responsibility boundaries. Responsibility Boundary defines contract responsibility range and structural ownership boundary. Responsibility Boundary SHALL NOT assign runtime ownership, select execution authority, or define operational responsibility.",
    }),
    Object.freeze({
        id: "PEC-6",
        title: "Compatibility Declaration",
        statement:
            "Execution structures SHALL provide compatibility information. Compatibility Declaration supports contract validation, future tooling compatibility, and version boundary control.",
    }),
    Object.freeze({
        id: "PEC-7",
        title: "Declarative Restriction",
        statement:
            "Pipeline Execution Contract SHALL remain declarative. The contract describes structure only. Executable functions, algorithms, runtime instructions, and workflow commands SHALL remain outside this chapter.",
    }),
    Object.freeze({
        id: "PEC-8",
        title: "Runtime Isolation",
        statement:
            "Execution Contract SHALL remain isolated from runtime implementation. Execution Contract MUST NOT contain runtime objects, executable functions, scheduler references, dispatcher references, engine references, or resource references.",
    }),
    Object.freeze({
        id: "PEC-9",
        title: "Boundary Preservation",
        statement:
            "Pipeline Execution Contract SHALL preserve boundaries defined by Chapter 11 Composition Boundary Contract, Chapter 12 Pipeline Composition Contract, and Chapter 13 Pipeline Execution Boundary Contract. Chapter 14 extensions SHALL NOT replace previous frozen contracts.",
    }),
    Object.freeze({
        id: "PEC-10",
        title: "Future Runtime Compatibility",
        statement:
            "Execution Contract SHALL provide a stable structural foundation for future runtime layers. Future runtime systems MAY consume Execution Identity, Input Contract, Output Contract, and Compatibility Information. Future runtime systems SHALL NOT require modification of Chapter 14 contract semantics.",
    }),
    Object.freeze({
        id: "PEC-11",
        title: "Execution Scope Boundary",
        statement:
            "Execution Contract SHALL declare structural execution scope. Execution Scope Boundary defines scope of represented execution structure and structural containment boundary. Execution Scope Boundary SHALL NOT define execution order, execution sequence, runtime workflow, scheduler behavior, or nested runtime ownership.",
    }),
]);

/** Frozen registry of all Chapter 14 Pipeline Execution Contracts (PEC-1…PEC-11). */
export const PIPELINE_EXECUTION_CONTRACTS: readonly PipelineExecutionContractPrinciple[] =
    PRINCIPLES;

export const PIPELINE_EXECUTION_CONTRACT_IDS: readonly PipelineExecutionContractId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getPipelineExecutionContract(
    id: PipelineExecutionContractId
): PipelineExecutionContractPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown PipelineExecutionContractId: ${id}`);
    }
    return found;
}
