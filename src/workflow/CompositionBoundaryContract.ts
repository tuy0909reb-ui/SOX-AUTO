/**
 * ASA-ARCH-21.3 Chapter 11 — Composition Boundary Contract (Draft 0.2)
 *
 * Declarative structural composition boundary contract registry only.
 *
 * SHALL NOT contain:
 * - runtime / ownership transfer / boundary enforcement algorithms
 * - dynamic boundary modification / validation / expansion
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch / resource allocation
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–10 frozen contracts (extension only).
 */

export type CompositionBoundaryContractId =
    | "CBC-1"
    | "CBC-2"
    | "CBC-3"
    | "CBC-4"
    | "CBC-5"
    | "CBC-6"
    | "CBC-7"
    | "CBC-8"
    | "CBC-9"
    | "CBC-10";

export interface CompositionBoundaryContractPrinciple {
    readonly id: CompositionBoundaryContractId;
    readonly title: string;
    readonly statement: string;
}

/** Boundary Verification — excluded concerns (documentation only). */
export const COMPOSITION_BOUNDARY_CONTRACT_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Runtime ownership transfer",
    "Boundary enforcement algorithms",
    "Dynamic boundary modification",
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

/** Boundary Outcome — architectural boundary foundation (declarative only). */
export const COMPOSITION_BOUNDARY_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Composition Boundary Contract establishes the architectural boundary foundation between integrated Composition structures and subsequent Pipeline contracts.",
    scope: "This chapter defines structural boundary semantics only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const BOUNDARY_CONTRACTS: readonly CompositionBoundaryContractPrinciple[] =
    Object.freeze([
        Object.freeze({
            id: "CBC-1",
            title: "Boundary Scope",
            statement:
                "Composition boundary SHALL define structural boundaries between integrated Composition structures and subsequent Pipeline contracts. Boundary scope SHALL remain declarative.",
        }),
        Object.freeze({
            id: "CBC-2",
            title: "Ownership Boundary",
            statement:
                "Composition boundary SHALL preserve structural ownership of composition entities. Ownership SHALL remain independent of runtime semantics.",
        }),
        Object.freeze({
            id: "CBC-3",
            title: "Responsibility Separation",
            statement:
                "Composition boundary SHALL preserve separation of structural responsibilities between Composition structures and downstream Pipeline contracts. Responsibilities SHALL remain explicitly isolated.",
        }),
        Object.freeze({
            id: "CBC-4",
            title: "Contract Exposure",
            statement:
                "Composition boundary SHALL define structural contract exposure to downstream architectural contracts. Structural exposure SHALL remain declarative. Exposed contracts SHALL remain declarative.",
        }),
        Object.freeze({
            id: "CBC-5",
            title: "Structural Isolation",
            statement:
                "Composition boundary SHALL preserve structural isolation between Composition structures and downstream contracts. Internal composition structures SHALL NOT alter external boundary semantics.",
        }),
        Object.freeze({
            id: "CBC-6",
            title: "Boundary Determinism",
            statement:
                "Equivalent structural composition boundaries SHALL preserve identical boundary semantics. Boundary semantics SHALL remain deterministic.",
        }),
        Object.freeze({
            id: "CBC-7",
            title: "Compatibility Preservation",
            statement:
                "Composition boundary SHALL preserve compatibility with existing and frozen architectural contracts. Boundary definition SHALL NOT invalidate existing and frozen composition contracts.",
        }),
        Object.freeze({
            id: "CBC-8",
            title: "Downstream Boundary",
            statement:
                "Composition boundary SHALL preserve structural separation from downstream Pipeline contracts. Downstream contracts SHALL NOT redefine composition responsibilities.",
        }),
        Object.freeze({
            id: "CBC-9",
            title: "Evolution Boundary",
            statement:
                "Composition boundary SHALL preserve compatibility with structural evolution contracts. Evolution SHALL NOT bypass frozen boundary contracts.",
        }),
        Object.freeze({
            id: "CBC-10",
            title: "Behavioral Exclusion",
            statement:
                "Behavioral semantics SHALL remain outside the scope of composition boundary contracts. Composition boundary contracts SHALL remain purely declarative.",
        }),
    ]);

/** Frozen registry of all Chapter 11 Composition Boundary Contracts (CBC-1…CBC-10). */
export const COMPOSITION_BOUNDARY_CONTRACTS: readonly CompositionBoundaryContractPrinciple[] =
    BOUNDARY_CONTRACTS;

export const COMPOSITION_BOUNDARY_CONTRACT_IDS: readonly CompositionBoundaryContractId[] =
    Object.freeze(BOUNDARY_CONTRACTS.map((c) => c.id));

export function getCompositionBoundaryContract(
    id: CompositionBoundaryContractId
): CompositionBoundaryContractPrinciple {
    const found = BOUNDARY_CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionBoundaryContractId: ${id}`);
    }
    return found;
}
