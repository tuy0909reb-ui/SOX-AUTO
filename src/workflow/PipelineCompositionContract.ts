/**
 * ASA-ARCH-21.3 Chapter 12 — Pipeline Composition Contract (Draft 0.2)
 *
 * Declarative structural Pipeline composition contract registry only.
 *
 * SHALL NOT contain:
 * - runtime / composition binding / execution lifecycle
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch / resource allocation
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–11 frozen contracts (extension only).
 */

export type PipelineCompositionContractId =
    | "PCC-1"
    | "PCC-2"
    | "PCC-3"
    | "PCC-4"
    | "PCC-5"
    | "PCC-6"
    | "PCC-7"
    | "PCC-8"
    | "PCC-9"
    | "PCC-10";

export interface PipelineCompositionContractPrinciple {
    readonly id: PipelineCompositionContractId;
    readonly title: string;
    readonly statement: string;
}

/** Pipeline Composition Verification — excluded concerns (documentation only). */
export const PIPELINE_COMPOSITION_CONTRACT_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Runtime composition binding",
    "Execution lifecycle management",
    "Composition execution algorithms",
    "Expansion algorithms",
    "Validation algorithms",
    "Failure handling",
    "ExecutionGraph construction",
    "Scheduling",
    "Optimization",
    "Performance characteristics",
    "Engine allocation",
    "Dispatch behavior",
] as const);

/** Pipeline Composition Outcome — architectural structural foundation (declarative only). */
export const PIPELINE_COMPOSITION_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Pipeline Composition Contract establishes the architectural structural foundation for subsequent Pipeline execution contracts.",
    scope: "This chapter defines Pipeline structural composition contracts only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const CONTRACTS: readonly PipelineCompositionContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "PCC-1",
        title: "Pipeline Composition Scope",
        statement:
            "Pipeline composition contract SHALL define structural composition relationships between Pipeline structures and referenced Composition structures. Pipeline composition scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "PCC-2",
        title: "Composition Reference Integrity",
        statement:
            "Pipeline composition contract SHALL preserve references between Pipeline structures and integrated Composition structures. Reference integrity SHALL remain structural only.",
    }),
    Object.freeze({
        id: "PCC-3",
        title: "Pipeline Structure Identity",
        statement:
            "Every Pipeline composition structure SHALL preserve structural identity. Pipeline structure identity SHALL remain structurally identifiable.",
    }),
    Object.freeze({
        id: "PCC-4",
        title: "Structural Assembly Contract",
        statement:
            "Pipeline composition SHALL preserve structural consistency during Pipeline composition assembly. Structural assembly SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "PCC-5",
        title: "Responsibility Boundary",
        statement:
            "Pipeline composition contract SHALL preserve responsibility boundaries between Pipeline structures and Composition structures. Responsibilities SHALL remain explicitly isolated.",
    }),
    Object.freeze({
        id: "PCC-6",
        title: "Contract Determinism",
        statement:
            "Equivalent Pipeline composition structures SHALL preserve identical structural composition semantics. Pipeline composition semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "PCC-7",
        title: "Compatibility Preservation",
        statement:
            "Pipeline composition contract SHALL preserve compatibility with existing and frozen architectural contracts. Pipeline composition SHALL NOT invalidate existing and frozen structural contracts.",
    }),
    Object.freeze({
        id: "PCC-8",
        title: "Downstream Execution Boundary",
        statement:
            "Pipeline composition contract SHALL preserve structural boundaries with downstream execution contracts. Execution contracts SHALL NOT redefine Pipeline composition responsibilities. Execution contracts SHALL consume Pipeline composition contracts only.",
    }),
    Object.freeze({
        id: "PCC-9",
        title: "Evolution Compatibility",
        statement:
            "Pipeline composition contract SHALL preserve compatibility with structural evolution contracts. Evolution SHALL NOT bypass frozen Pipeline composition contracts.",
    }),
    Object.freeze({
        id: "PCC-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of Pipeline composition contracts. Pipeline composition contracts SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 12 Pipeline Composition Contracts (PCC-1…PCC-10). */
export const PIPELINE_COMPOSITION_CONTRACTS: readonly PipelineCompositionContractPrinciple[] =
    CONTRACTS;

export const PIPELINE_COMPOSITION_CONTRACT_IDS: readonly PipelineCompositionContractId[] =
    Object.freeze(CONTRACTS.map((c) => c.id));

export function getPipelineCompositionContract(
    id: PipelineCompositionContractId
): PipelineCompositionContractPrinciple {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown PipelineCompositionContractId: ${id}`);
    }
    return found;
}
