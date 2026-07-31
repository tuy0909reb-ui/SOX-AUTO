/**
 * ASA-ARCH-21.3 Chapter 2 — Composition Boundary (Draft 0.4)
 *
 * Declarative structural composition boundary registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1 frozen contracts (extension only).
 */

export type CompositionBoundaryId =
    | "CB-1"
    | "CB-2"
    | "CB-3"
    | "CB-4"
    | "CB-5"
    | "CB-6"
    | "CB-7"
    | "CB-8"
    | "CB-9"
    | "CB-10";

export interface CompositionBoundaryPrinciple {
    readonly id: CompositionBoundaryId;
    readonly title: string;
    readonly statement: string;
}

/** Boundary Verification — excluded concerns (documentation only). */
export const COMPOSITION_BOUNDARY_VERIFICATION = Object.freeze([
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

/** Boundary Outcome — architectural boundary foundation (declarative only). */
export const COMPOSITION_BOUNDARY_OUTCOME = Object.freeze({
    statement:
        "The Composition Boundary establishes the architectural boundaries for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural boundaries only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const BOUNDARIES: readonly CompositionBoundaryPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CB-1",
        title: "Structural Boundary",
        statement:
            "Composition SHALL define structural responsibility boundaries only.",
    }),
    Object.freeze({
        id: "CB-2",
        title: "Runtime Boundary",
        statement:
            "Composition SHALL remain independent of runtime execution. Runtime behavior SHALL NOT influence composition semantics.",
    }),
    Object.freeze({
        id: "CB-3",
        title: "Expansion Boundary",
        statement:
            "Composition SHALL NOT define expansion algorithms. Expansion semantics SHALL remain outside the composition contract.",
    }),
    Object.freeze({
        id: "CB-4",
        title: "Validation Boundary",
        statement:
            "Composition SHALL NOT define validation behavior. Validation semantics SHALL remain outside the composition contract.",
    }),
    Object.freeze({
        id: "CB-5",
        title: "Failure Boundary",
        statement:
            "Composition SHALL NOT define failure behavior. Failure semantics SHALL remain outside the composition contract.",
    }),
    Object.freeze({
        id: "CB-6",
        title: "WorkflowBuilder Boundary",
        statement:
            "Composition SHALL NOT define WorkflowBuilder responsibilities. WorkflowBuilder SHALL remain responsible for PipelineDefinition construction.",
    }),
    Object.freeze({
        id: "CB-7",
        title: "ExecutionGraph Boundary",
        statement:
            "Composition SHALL NOT define ExecutionGraph construction. ExecutionGraph construction SHALL remain outside the scope of this contract.",
    }),
    Object.freeze({
        id: "CB-8",
        title: "Scheduling Boundary",
        statement:
            "Composition SHALL remain independent of scheduling strategies. Scheduling SHALL NOT influence composition semantics.",
    }),
    Object.freeze({
        id: "CB-9",
        title: "Engine Boundary",
        statement:
            "Composition SHALL remain independent of engine allocation. Engine allocation SHALL remain outside the scope of this contract.",
    }),
    Object.freeze({
        id: "CB-10",
        title: "Downstream Boundary",
        statement:
            "Composition SHALL preserve clear responsibility boundaries for downstream architectural contracts.",
    }),
]);

/** Frozen registry of all Chapter 2 Composition Boundary principles (CB-1…CB-10). */
export const COMPOSITION_BOUNDARIES: readonly CompositionBoundaryPrinciple[] =
    BOUNDARIES;

export const COMPOSITION_BOUNDARY_IDS: readonly CompositionBoundaryId[] =
    Object.freeze(BOUNDARIES.map((b) => b.id));

export function getCompositionBoundary(
    id: CompositionBoundaryId
): CompositionBoundaryPrinciple {
    const found = BOUNDARIES.find((b) => b.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionBoundaryId: ${id}`);
    }
    return found;
}
