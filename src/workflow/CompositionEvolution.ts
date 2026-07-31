/**
 * ASA-ARCH-21.3 Chapter 9 — Composition Evolution (Draft 0.3)
 *
 * Declarative structural composition evolution registry only.
 *
 * SHALL NOT contain:
 * - runtime / evolution execution / migration algorithms
 * - expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–8 frozen contracts (extension only).
 */

export type CompositionEvolutionId =
    | "CE-1"
    | "CE-2"
    | "CE-3"
    | "CE-4"
    | "CE-5"
    | "CE-6"
    | "CE-7"
    | "CE-8"
    | "CE-9"
    | "CE-10";

export interface CompositionEvolutionPrinciple {
    readonly id: CompositionEvolutionId;
    readonly title: string;
    readonly statement: string;
}

/** Evolution Verification — excluded concerns (documentation only). */
export const COMPOSITION_EVOLUTION_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Evolution execution algorithms",
    "Migration algorithms",
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

/** Evolution Outcome — architectural evolution foundation (declarative only). */
export const COMPOSITION_EVOLUTION_OUTCOME = Object.freeze({
    statement:
        "The Composition Evolution establishes the architectural evolution foundation for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural composition evolution only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const EVOLUTIONS: readonly CompositionEvolutionPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CE-1",
        title: "Evolution Scope",
        statement:
            "Composition evolution SHALL define structural evolution of composition entities within the composition model. Evolution scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CE-2",
        title: "Evolution Identity",
        statement:
            "Every evolved composition structure SHALL preserve structural identity. Evolution identity SHALL remain structurally identifiable.",
    }),
    Object.freeze({
        id: "CE-3",
        title: "Structural Preservation",
        statement:
            "Composition evolution SHALL preserve existing structural composition integrity. Structural preservation SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CE-4",
        title: "Evolution Determinism",
        statement:
            "Equivalent structural evolution definitions SHALL preserve identical structural evolution semantics. Evolution semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "CE-5",
        title: "Evolution Boundary",
        statement:
            "Composition evolution SHALL preserve boundaries between existing and evolved structural composition states. Evolution boundaries SHALL remain structurally isolated.",
    }),
    Object.freeze({
        id: "CE-6",
        title: "Compatibility Preservation",
        statement:
            "Composition evolution SHALL preserve compatibility with existing composition contracts. Evolution SHALL NOT invalidate frozen structural contracts.",
    }),
    Object.freeze({
        id: "CE-7",
        title: "Incremental Evolution",
        statement:
            "Composition evolution SHALL permit incremental structural changes. Incremental evolution SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CE-8",
        title: "Structural Consistency",
        statement:
            "Composition evolution SHALL preserve structural consistency across evolved composition structures. Structural consistency SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CE-9",
        title: "Downstream Preservation",
        statement:
            "Composition evolution SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter evolution semantics.",
    }),
    Object.freeze({
        id: "CE-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition evolution. Composition evolution SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 9 Composition Evolution contracts (CE-1…CE-10). */
export const COMPOSITION_EVOLUTIONS: readonly CompositionEvolutionPrinciple[] =
    EVOLUTIONS;

export const COMPOSITION_EVOLUTION_IDS: readonly CompositionEvolutionId[] =
    Object.freeze(EVOLUTIONS.map((e) => e.id));

export function getCompositionEvolution(
    id: CompositionEvolutionId
): CompositionEvolutionPrinciple {
    const found = EVOLUTIONS.find((e) => e.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionEvolutionId: ${id}`);
    }
    return found;
}
