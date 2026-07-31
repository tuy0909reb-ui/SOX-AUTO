/**
 * ASA-ARCH-21.3 Chapter 3 — Composition Model (Draft 0.4)
 *
 * Declarative structural composition model registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–2 frozen contracts (extension only).
 */

export type CompositionModelId =
    | "CM-1"
    | "CM-2"
    | "CM-3"
    | "CM-4"
    | "CM-5"
    | "CM-6"
    | "CM-7"
    | "CM-8"
    | "CM-9"
    | "CM-10";

export interface CompositionModelPrinciple {
    readonly id: CompositionModelId;
    readonly title: string;
    readonly statement: string;
}

/** Model Verification — excluded concerns (documentation only). */
export const COMPOSITION_MODEL_VERIFICATION = Object.freeze([
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

/** Model Outcome — architectural composition model foundation (declarative only). */
export const COMPOSITION_MODEL_OUTCOME = Object.freeze({
    statement:
        "This chapter establishes the architectural composition model for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines the structural composition model only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const MODELS: readonly CompositionModelPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CM-1",
        title: "Composition Unit",
        statement:
            "A composition unit SHALL represent a declarative structural composition element of Pipeline composition. Composition units SHALL be uniquely structurally identifiable.",
    }),
    Object.freeze({
        id: "CM-2",
        title: "Structural Hierarchy",
        statement:
            "Composition SHALL support hierarchical structural organization. The composition hierarchy SHALL remain declarative and deterministic.",
    }),
    Object.freeze({
        id: "CM-3",
        title: "Parent-Child Relationship",
        statement:
            "Composition SHALL define parent-child structural relationships between composition units. Parent-child relationships SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CM-4",
        title: "Nested Composition",
        statement:
            "Composition SHALL support nested composition units. Nested Pipeline composition SHALL preserve structural hierarchy and structural consistency.",
    }),
    Object.freeze({
        id: "CM-5",
        title: "Structural Layering",
        statement:
            "Composition SHALL support structural layering. Structural layering SHALL preserve structural responsibility boundaries.",
    }),
    Object.freeze({
        id: "CM-6",
        title: "Structural Visibility",
        statement:
            "Composition SHALL define structural visibility relationships between composition units. Structural visibility SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CM-7",
        title: "Encapsulation",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal composition details SHALL NOT affect external composition semantics.",
    }),
    Object.freeze({
        id: "CM-8",
        title: "Structural Cohesion",
        statement:
            "Composition units SHALL exhibit structural cohesion. Structural cohesion SHALL remain independent of implementation.",
    }),
    Object.freeze({
        id: "CM-9",
        title: "Structural Coupling",
        statement:
            "Composition SHALL permit only explicitly defined structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
    }),
    Object.freeze({
        id: "CM-10",
        title: "Recursive Composition",
        statement:
            "Composition SHALL support recursive structural composition. Recursive composition SHALL preserve deterministic structural composition semantics.",
    }),
]);

/** Frozen registry of all Chapter 3 Composition Model principles (CM-1…CM-10). */
export const COMPOSITION_MODELS: readonly CompositionModelPrinciple[] = MODELS;

export const COMPOSITION_MODEL_IDS: readonly CompositionModelId[] = Object.freeze(
    MODELS.map((m) => m.id)
);

export function getCompositionModel(
    id: CompositionModelId
): CompositionModelPrinciple {
    const found = MODELS.find((m) => m.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionModelId: ${id}`);
    }
    return found;
}
