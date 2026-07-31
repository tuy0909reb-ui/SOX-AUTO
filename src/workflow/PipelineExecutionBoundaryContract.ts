/**
 * ASA-ARCH-21.3 Chapter 13 — Pipeline Execution Boundary Contract (Draft 0.2)
 *
 * Declarative structural Pipeline execution boundary contract registry only.
 *
 * SHALL NOT contain:
 * - runtime execution / execution state / lifecycle / binding
 * - ExecutionGraph construction / scheduling / dispatch
 * - engine allocation / optimization / resource management
 * - failure handling / performance control
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–12 frozen contracts (extension only).
 */

export type PipelineExecutionBoundaryContractId =
    | "PEB-1"
    | "PEB-2"
    | "PEB-3"
    | "PEB-4"
    | "PEB-5"
    | "PEB-6"
    | "PEB-7"
    | "PEB-8"
    | "PEB-9"
    | "PEB-10";

export interface PipelineExecutionBoundaryContractPrinciple {
    readonly id: PipelineExecutionBoundaryContractId;
    readonly title: string;
    readonly statement: string;
}

/** Boundary Verification — excluded concerns (documentation only). */
export const PIPELINE_EXECUTION_BOUNDARY_CONTRACT_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Execution state management",
    "Execution lifecycle management",
    "Runtime binding",
    "ExecutionGraph construction",
    "Scheduling algorithms",
    "Dispatch algorithms",
    "Engine allocation",
    "Optimization algorithms",
    "Resource management",
    "Failure handling",
    "Performance characteristics",
] as const);

/** Boundary Outcome — architectural boundary foundation (declarative only). */
export const PIPELINE_EXECUTION_BOUNDARY_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Pipeline Execution Boundary Contract establishes the architectural boundary foundation between Pipeline Composition contracts and subsequent Execution architectural contracts.",
    scope: "This chapter defines structural execution boundary semantics only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const CONTRACTS: readonly PipelineExecutionBoundaryContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "PEB-1",
        title: "Execution Boundary Scope",
        statement:
            "Pipeline execution boundary SHALL define structural boundaries between Pipeline Composition contracts and Execution contracts. Execution boundary scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "PEB-2",
        title: "Composition Ownership Preservation",
        statement:
            "Pipeline execution boundary SHALL preserve ownership of Pipeline Composition structures. Execution contracts SHALL consume composition contracts only. Ownership SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "PEB-3",
        title: "Responsibility Separation",
        statement:
            "Pipeline execution boundary SHALL preserve separation between composition responsibilities and execution responsibilities. Responsibilities SHALL remain explicitly isolated.",
    }),
    Object.freeze({
        id: "PEB-4",
        title: "Execution Contract Exposure",
        statement:
            "Pipeline execution boundary SHALL define structural exposure of Pipeline Composition contracts to Execution contracts. Exposed Pipeline Composition information SHALL remain structural and declarative.",
    }),
    Object.freeze({
        id: "PEB-5",
        title: "Structural Isolation",
        statement:
            "Pipeline execution boundary SHALL preserve structural isolation between Pipeline Composition structures and Execution structures. Internal execution structures SHALL NOT alter composition boundary semantics.",
    }),
    Object.freeze({
        id: "PEB-6",
        title: "Boundary Determinism",
        statement:
            "Equivalent Pipeline execution boundaries SHALL preserve identical structural boundary semantics. Boundary semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "PEB-7",
        title: "Frozen Contract Preservation",
        statement:
            "Pipeline execution boundary SHALL preserve compatibility with frozen Pipeline Composition contracts. Execution boundaries SHALL NOT invalidate frozen structural contracts.",
    }),
    Object.freeze({
        id: "PEB-8",
        title: "Execution Responsibility Boundary",
        statement:
            "Execution contracts SHALL NOT redefine Pipeline Composition responsibilities. Pipeline Composition responsibilities SHALL remain limited to structural composition semantics.",
    }),
    Object.freeze({
        id: "PEB-9",
        title: "Downstream Runtime Boundary",
        statement:
            "Pipeline execution boundary SHALL preserve separation from downstream Runtime contracts. Runtime contracts SHALL consume Execution contracts through defined execution boundaries only.",
    }),
    Object.freeze({
        id: "PEB-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of Pipeline execution boundary contracts. Pipeline execution boundary contracts SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 13 Pipeline Execution Boundary Contracts (PEB-1…PEB-10). */
export const PIPELINE_EXECUTION_BOUNDARY_CONTRACTS: readonly PipelineExecutionBoundaryContractPrinciple[] =
    CONTRACTS;

export const PIPELINE_EXECUTION_BOUNDARY_CONTRACT_IDS: readonly PipelineExecutionBoundaryContractId[] =
    Object.freeze(CONTRACTS.map((c) => c.id));

export function getPipelineExecutionBoundaryContract(
    id: PipelineExecutionBoundaryContractId
): PipelineExecutionBoundaryContractPrinciple {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown PipelineExecutionBoundaryContractId: ${id}`);
    }
    return found;
}
