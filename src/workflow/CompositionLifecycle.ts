/**
 * ASA-ARCH-21.3 Chapter 8 — Composition Lifecycle (Draft 0.2)
 *
 * Declarative structural composition lifecycle registry only.
 *
 * SHALL NOT contain:
 * - runtime / execution lifecycle / state management
 * - state transition algorithms / lifecycle automation
 * - expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–7 frozen contracts (extension only).
 */

export type CompositionLifecycleId =
    | "CL-1"
    | "CL-2"
    | "CL-3"
    | "CL-4"
    | "CL-5"
    | "CL-6"
    | "CL-7"
    | "CL-8"
    | "CL-9"
    | "CL-10";

export interface CompositionLifecyclePrinciple {
    readonly id: CompositionLifecycleId;
    readonly title: string;
    readonly statement: string;
}

/** Lifecycle Verification — excluded concerns (documentation only). */
export const COMPOSITION_LIFECYCLE_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Execution state management",
    "State transition algorithms",
    "Lifecycle automation",
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

/** Lifecycle Outcome — architectural lifecycle foundation (declarative only). */
export const COMPOSITION_LIFECYCLE_OUTCOME = Object.freeze({
    statement:
        "The Composition Lifecycle establishes the architectural lifecycle foundation for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural lifecycle semantics only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const LIFECYCLES: readonly CompositionLifecyclePrinciple[] = Object.freeze([
    Object.freeze({
        id: "CL-1",
        title: "Lifecycle Scope",
        statement:
            "Composition lifecycle SHALL define structural lifecycle states of composition entities. Lifecycle scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CL-2",
        title: "Lifecycle Identity",
        statement:
            "Every composition entity SHALL preserve its lifecycle identity within the structural composition lifecycle model. Lifecycle identity SHALL remain structurally identifiable.",
    }),
    Object.freeze({
        id: "CL-3",
        title: "Lifecycle State Model",
        statement:
            "Composition lifecycle SHALL support defined structural lifecycle states. Lifecycle states SHALL represent structural status only.",
    }),
    Object.freeze({
        id: "CL-4",
        title: "State Transition Definition",
        statement:
            "Composition lifecycle SHALL define permitted structural state transitions. State transition rules SHALL remain declarative. State transitions SHALL remain independent of runtime behavior.",
    }),
    Object.freeze({
        id: "CL-5",
        title: "Lifecycle Determinism",
        statement:
            "Equivalent structural composition states SHALL preserve identical lifecycle semantics. Lifecycle semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "CL-6",
        title: "Lifecycle Consistency",
        statement:
            "Composition lifecycle SHALL preserve consistency across lifecycle states. Lifecycle consistency SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CL-7",
        title: "Lifecycle Boundary",
        statement:
            "Composition lifecycle SHALL preserve boundaries between lifecycle states. Lifecycle boundaries SHALL remain structurally isolated.",
    }),
    Object.freeze({
        id: "CL-8",
        title: "Lifecycle Independence",
        statement:
            "Composition lifecycle SHALL remain independent of execution behavior. Lifecycle state SHALL NOT represent runtime execution state.",
    }),
    Object.freeze({
        id: "CL-9",
        title: "Downstream Compatibility",
        statement:
            "Composition lifecycle SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter lifecycle semantics.",
    }),
    Object.freeze({
        id: "CL-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition lifecycle. Composition lifecycle SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 8 Composition Lifecycle contracts (CL-1…CL-10). */
export const COMPOSITION_LIFECYCLES: readonly CompositionLifecyclePrinciple[] =
    LIFECYCLES;

export const COMPOSITION_LIFECYCLE_IDS: readonly CompositionLifecycleId[] =
    Object.freeze(LIFECYCLES.map((l) => l.id));

export function getCompositionLifecycle(
    id: CompositionLifecycleId
): CompositionLifecyclePrinciple {
    const found = LIFECYCLES.find((l) => l.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionLifecycleId: ${id}`);
    }
    return found;
}
