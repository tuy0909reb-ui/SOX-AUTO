/**
 * ASA-ARCH-21.3 Chapter 6 — Composition Constraints (Draft 0.4)
 *
 * Declarative structural composition constraint registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–5 frozen contracts (extension only).
 */

export type CompositionConstraintId =
    | "CT-1"
    | "CT-2"
    | "CT-3"
    | "CT-4"
    | "CT-5"
    | "CT-6"
    | "CT-7"
    | "CT-8"
    | "CT-9"
    | "CT-10";

export interface CompositionConstraintPrinciple {
    readonly id: CompositionConstraintId;
    readonly title: string;
    readonly statement: string;
}

/** Purpose — declarative architectural constraints (documentation only). */
export const COMPOSITION_CONSTRAINT_PURPOSE = Object.freeze({
    statement:
        "Composition Constraints define the declarative architectural constraints governing Pipeline composition.",
    scope: "This chapter establishes structural composition constraints only.",
} as const);

/** Constraint Verification — excluded concerns (documentation only). */
export const COMPOSITION_CONSTRAINT_VERIFICATION = Object.freeze([
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

/** Constraint Outcome — architectural structural constraint foundation (declarative only). */
export const COMPOSITION_CONSTRAINT_OUTCOME = Object.freeze({
    statement:
        "The Composition Constraints establish the architectural structural constraints for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural composition constraints only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const CONSTRAINTS: readonly CompositionConstraintPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CT-1",
        title: "Structural Constraint",
        statement:
            "Composition SHALL satisfy all structural constraints defined by the structural composition model. Structural constraints SHALL remain invariant within the structural composition model.",
    }),
    Object.freeze({
        id: "CT-2",
        title: "Identity Constraint",
        statement:
            "Composition SHALL preserve the structural identity of every composition unit. Structural identity SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CT-3",
        title: "Hierarchy Constraint",
        statement:
            "Composition SHALL preserve structural hierarchy. The structural hierarchy SHALL remain structurally consistent.",
    }),
    Object.freeze({
        id: "CT-4",
        title: "Encapsulation Constraint",
        statement:
            "Composition SHALL preserve encapsulation boundaries. Encapsulation constraints SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CT-5",
        title: "Dependency Constraint",
        statement:
            "Composition SHALL preserve explicit structural dependency direction. Structural dependencies SHALL remain explicitly defined.",
    }),
    Object.freeze({
        id: "CT-6",
        title: "Responsibility Constraint",
        statement:
            "Composition SHALL preserve structural responsibility boundaries. Structural responsibilities SHALL remain clearly isolated.",
    }),
    Object.freeze({
        id: "CT-7",
        title: "Coupling Constraint",
        statement:
            "Composition SHALL permit only explicitly defined structural coupling. Structural coupling SHALL preserve dependency direction and structural isolation.",
    }),
    Object.freeze({
        id: "CT-8",
        title: "Recursive Constraint",
        statement:
            "Recursive composition SHALL preserve deterministic structural composition semantics.",
    }),
    Object.freeze({
        id: "CT-9",
        title: "Downstream Constraint",
        statement:
            "Composition constraints SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter composition constraints.",
    }),
    Object.freeze({
        id: "CT-10",
        title: "Behavioral Exclusion Constraint",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition constraints. Composition constraints SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 6 Composition Constraints (CT-1…CT-10). */
export const COMPOSITION_CONSTRAINTS: readonly CompositionConstraintPrinciple[] =
    CONSTRAINTS;

export const COMPOSITION_CONSTRAINT_IDS: readonly CompositionConstraintId[] =
    Object.freeze(CONSTRAINTS.map((c) => c.id));

export function getCompositionConstraint(
    id: CompositionConstraintId
): CompositionConstraintPrinciple {
    const found = CONSTRAINTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionConstraintId: ${id}`);
    }
    return found;
}
