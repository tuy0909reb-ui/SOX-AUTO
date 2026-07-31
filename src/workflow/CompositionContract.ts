/**
 * ASA-ARCH-21.3 Chapter 4 — Composition Contract (Draft 0.7)
 *
 * Declarative structural composition contract registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–3 frozen contracts (extension only).
 */

export type CompositionContractId =
    | "CC-1"
    | "CC-2"
    | "CC-3"
    | "CC-4"
    | "CC-5"
    | "CC-6"
    | "CC-7"
    | "CC-8"
    | "CC-9"
    | "CC-10";

export interface CompositionContractPrinciple {
    readonly id: CompositionContractId;
    readonly title: string;
    readonly statement: string;
}

/** Contract Verification — excluded concerns (documentation only). */
export const COMPOSITION_CONTRACT_VERIFICATION = Object.freeze([
    "Runtime execution",
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

/** Contract Outcome — architectural composition contract foundation (declarative only). */
export const COMPOSITION_CONTRACT_OUTCOME = Object.freeze({
    statement:
        "The Composition Contract establishes the architectural foundation for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines the structural composition contract only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const CONTRACTS: readonly CompositionContractPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CC-1",
        title: "Composition Unit Contract",
        statement:
            "Composition unit contracts SHALL conform to the structural composition model. Composition unit contracts SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CC-2",
        title: "Parent-Child Contract",
        statement:
            "Parent-child relationship contracts SHALL conform to the structural composition model. Parent-child relationship contracts SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CC-3",
        title: "Nested Composition Contract",
        statement:
            "Nested composition contracts SHALL conform to the structural composition model. Nested composition contracts SHALL preserve structural hierarchy and structural consistency.",
    }),
    Object.freeze({
        id: "CC-4",
        title: "Structural Layering Contract",
        statement:
            "Structural layering contracts SHALL preserve structural responsibility boundaries. Structural layering contracts SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CC-5",
        title: "Structural Visibility Contract",
        statement:
            "Structural visibility contracts SHALL govern structural visibility within the structural composition model. Structural visibility contracts SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CC-6",
        title: "Encapsulation Contract",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
    }),
    Object.freeze({
        id: "CC-7",
        title: "Structural Cohesion Contract",
        statement:
            "Structural cohesion contracts SHALL preserve structural cohesion. Structural cohesion SHALL remain implementation-independent.",
    }),
    Object.freeze({
        id: "CC-8",
        title: "Structural Coupling Contract",
        statement:
            "Structural coupling contracts SHALL define explicit structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
    }),
    Object.freeze({
        id: "CC-9",
        title: "Recursive Composition Contract",
        statement:
            "Recursive composition contracts SHALL conform to the structural composition model. Recursive composition contracts SHALL preserve deterministic composition semantics.",
    }),
    Object.freeze({
        id: "CC-10",
        title: "Downstream Contract",
        statement:
            "Composition contracts SHALL preserve compatibility with downstream architectural contracts.",
    }),
]);

/** Frozen registry of all Chapter 4 Composition Contract principles (CC-1…CC-10). */
export const COMPOSITION_CONTRACTS: readonly CompositionContractPrinciple[] =
    CONTRACTS;

export const COMPOSITION_CONTRACT_IDS: readonly CompositionContractId[] =
    Object.freeze(CONTRACTS.map((c) => c.id));

export function getCompositionContract(
    id: CompositionContractId
): CompositionContractPrinciple {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionContractId: ${id}`);
    }
    return found;
}
