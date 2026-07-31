/**
 * ASA-ARCH-21.3 Chapter 1 — Composition Principles (Draft 0.4)
 *
 * Declarative structural composition principle registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.2 frozen contracts (extension only).
 */

export type CompositionPrincipleId =
    | "CP-1"
    | "CP-2"
    | "CP-3"
    | "CP-4"
    | "CP-5"
    | "CP-6"
    | "CP-7"
    | "CP-8"
    | "CP-9"
    | "CP-10";

export interface CompositionPrinciple {
    readonly id: CompositionPrincipleId;
    readonly title: string;
    readonly statement: string;
}

/** Principle Boundary — excluded concerns (documentation only). */
export const COMPOSITION_PRINCIPLE_BOUNDARY = Object.freeze([
    "Runtime execution",
    "Expansion algorithms",
    "Validation algorithms",
    "Failure handling",
    "ExecutionGraph construction",
    "Scheduling",
    "Optimization",
    "Performance",
    "Engine allocation",
    "Dispatch behavior",
] as const);

/** Principle Outcome — architectural foundation statement (declarative only). */
export const COMPOSITION_PRINCIPLE_OUTCOME = Object.freeze({
    statement:
        "Composition Principles establish the architectural foundation for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural principles only.",
    exclusion: "Behavioral semantics are intentionally excluded.",
} as const);

const PRINCIPLES: readonly CompositionPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CP-1",
        title: "Declarative Composition",
        statement:
            "Pipeline composition SHALL be declaratively defined. Composition contracts SHALL define structural semantics only.",
    }),
    Object.freeze({
        id: "CP-2",
        title: "Structural Composition",
        statement:
            "Composition SHALL be expressed solely through structural relationships.",
    }),
    Object.freeze({
        id: "CP-3",
        title: "Deterministic Composition",
        statement:
            "Equivalent PipelineDefinition structures SHALL produce identical composition semantics. Composition SHALL be deterministic.",
    }),
    Object.freeze({
        id: "CP-4",
        title: "Read-only Composition",
        statement:
            "Composition SHALL NOT modify PipelineDefinition. Composition SHALL describe structural relationships only.",
    }),
    Object.freeze({
        id: "CP-5",
        title: "Structural Responsibility",
        statement:
            "Every composition unit SHALL have clearly defined structural responsibility. Composition SHALL preserve structural responsibility isolation.",
    }),
    Object.freeze({
        id: "CP-6",
        title: "Structural Consistency",
        statement:
            "Composition SHALL preserve structural consistency across composed PipelineDefinition structures.",
    }),
    Object.freeze({
        id: "CP-7",
        title: "Encapsulation",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Internal structural details SHALL NOT affect external composition semantics.",
    }),
    Object.freeze({
        id: "CP-8",
        title: "Hierarchical Composition",
        statement:
            "Composition SHALL support hierarchical structural organization. The composition hierarchy SHALL remain declarative and deterministic.",
    }),
    Object.freeze({
        id: "CP-9",
        title: "NestedPipeline Composition",
        statement:
            "NestedPipeline SHALL follow the same composition principles as any other composition unit.",
    }),
    Object.freeze({
        id: "CP-10",
        title: "Downstream Compatibility",
        statement:
            "Composition SHALL preserve compatibility with downstream structural contracts. Composition SHALL define structural semantics only.",
    }),
]);

/** Frozen registry of all Chapter 1 Composition Principles (CP-1…CP-10). */
export const COMPOSITION_PRINCIPLES: readonly CompositionPrinciple[] = PRINCIPLES;

export const COMPOSITION_PRINCIPLE_IDS: readonly CompositionPrincipleId[] =
    Object.freeze(PRINCIPLES.map((p) => p.id));

export function getCompositionPrinciple(
    id: CompositionPrincipleId
): CompositionPrinciple {
    const found = PRINCIPLES.find((p) => p.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionPrincipleId: ${id}`);
    }
    return found;
}
