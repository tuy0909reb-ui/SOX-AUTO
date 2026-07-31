/**
 * ASA-ARCH-21.3 Chapter 5 — Composition Invariants (Draft 0.4)
 *
 * Declarative structural composition invariant registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–4 frozen contracts (extension only).
 */

export type CompositionInvariantId =
    | "CI-1"
    | "CI-2"
    | "CI-3"
    | "CI-4"
    | "CI-5"
    | "CI-6"
    | "CI-7"
    | "CI-8"
    | "CI-9"
    | "CI-10";

export interface CompositionInvariantPrinciple {
    readonly id: CompositionInvariantId;
    readonly title: string;
    readonly statement: string;
}

/** Invariant Verification — excluded concerns (documentation only). */
export const COMPOSITION_INVARIANT_VERIFICATION = Object.freeze([
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

/** Invariant Outcome — architectural structural invariant foundation (declarative only). */
export const COMPOSITION_INVARIANT_OUTCOME = Object.freeze({
    statement:
        "The Composition Invariants establish the architectural structural invariants for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural invariants only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const INVARIANTS: readonly CompositionInvariantPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CI-1",
        title: "Structural Identity",
        statement:
            "Every composition unit SHALL preserve its structural identity. Structural identity SHALL remain invariant within the structural composition model.",
    }),
    Object.freeze({
        id: "CI-2",
        title: "Structural Determinism",
        statement:
            "Equivalent Pipeline composition structures SHALL preserve identical structural composition semantics. Structural determinism SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CI-3",
        title: "Hierarchical Integrity",
        statement:
            "Composition SHALL preserve hierarchical integrity. The structural hierarchy SHALL remain structurally consistent.",
    }),
    Object.freeze({
        id: "CI-4",
        title: "Encapsulation Integrity",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
    }),
    Object.freeze({
        id: "CI-5",
        title: "Responsibility Integrity",
        statement:
            "Composition SHALL preserve structural responsibility boundaries. Structural responsibilities SHALL remain clearly isolated.",
    }),
    Object.freeze({
        id: "CI-6",
        title: "Structural Consistency",
        statement:
            "Composition SHALL preserve structural consistency across all composition units. Structural consistency SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CI-7",
        title: "Dependency Integrity",
        statement:
            "Composition SHALL preserve structural dependency direction. Structural dependencies SHALL remain explicitly defined.",
    }),
    Object.freeze({
        id: "CI-8",
        title: "Recursive Integrity",
        statement:
            "Recursive composition SHALL preserve deterministic structural composition semantics.",
    }),
    Object.freeze({
        id: "CI-9",
        title: "Downstream Integrity",
        statement:
            "Composition SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter composition invariants.",
    }),
    Object.freeze({
        id: "CI-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition invariants. Composition invariants SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 5 Composition Invariants (CI-1…CI-10). */
export const COMPOSITION_INVARIANTS: readonly CompositionInvariantPrinciple[] =
    INVARIANTS;

export const COMPOSITION_INVARIANT_IDS: readonly CompositionInvariantId[] =
    Object.freeze(INVARIANTS.map((i) => i.id));

export function getCompositionInvariant(
    id: CompositionInvariantId
): CompositionInvariantPrinciple {
    const found = INVARIANTS.find((i) => i.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionInvariantId: ${id}`);
    }
    return found;
}
