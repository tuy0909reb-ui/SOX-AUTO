/**
 * ASA-ARCH-21.3 Chapter 7 — Composition Validation (Draft 0.4)
 *
 * Declarative structural composition validation contract registry only.
 *
 * SHALL NOT contain:
 * - runtime / expansion / validation / failure algorithms or behavior
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–6 frozen contracts (extension only).
 */

export type CompositionValidationId =
    | "CV-1"
    | "CV-2"
    | "CV-3"
    | "CV-4"
    | "CV-5"
    | "CV-6"
    | "CV-7"
    | "CV-8"
    | "CV-9"
    | "CV-10";

export interface CompositionValidationPrinciple {
    readonly id: CompositionValidationId;
    readonly title: string;
    readonly statement: string;
}

/** Validation Verification — excluded concerns (documentation only). */
export const COMPOSITION_VALIDATION_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Validation algorithms",
    "Expansion algorithms",
    "Failure handling",
    "ExecutionGraph construction",
    "Scheduling",
    "Optimization",
    "Performance characteristics",
    "Engine allocation",
    "Dispatch behavior",
] as const);

/** Validation Outcome — architectural structural validation foundation (declarative only). */
export const COMPOSITION_VALIDATION_OUTCOME = Object.freeze({
    statement:
        "The Composition Validation establishes the architectural structural validation model for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural composition validation only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const VALIDATIONS: readonly CompositionValidationPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CV-1",
        title: "Validation Scope",
        statement:
            "Composition validation SHALL apply only to structural composition defined by the structural composition model. Validation scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CV-2",
        title: "Validation Target",
        statement:
            "Every composition unit defined by the structural composition model SHALL be a validation target. Validation targets SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CV-3",
        title: "Structural Validation",
        statement:
            "Composition validation SHALL verify conformance to the structural composition model. Structural validation SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CV-4",
        title: "Hierarchy Validation",
        statement:
            "Composition validation SHALL verify structural hierarchy consistency. Hierarchy validation SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CV-5",
        title: "Dependency Validation",
        statement:
            "Composition validation SHALL verify explicitly defined structural dependencies. Dependency validation SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CV-6",
        title: "Responsibility Validation",
        statement:
            "Composition validation SHALL verify structural responsibility boundaries. Responsibility validation SHALL remain implementation-independent.",
    }),
    Object.freeze({
        id: "CV-7",
        title: "Encapsulation Validation",
        statement:
            "Composition validation SHALL verify encapsulation boundaries. Internal composition details SHALL NOT affect external validation semantics.",
    }),
    Object.freeze({
        id: "CV-8",
        title: "Deterministic Validation",
        statement:
            "Equivalent structural composition SHALL preserve identical structural validation semantics. Structural validation semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "CV-9",
        title: "Downstream Validation",
        statement:
            "Composition validation SHALL preserve compatibility with downstream architectural contracts. Compatibility SHALL NOT alter structural validation semantics.",
    }),
    Object.freeze({
        id: "CV-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition validation. Composition validation SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 7 Composition Validation contracts (CV-1…CV-10). */
export const COMPOSITION_VALIDATIONS: readonly CompositionValidationPrinciple[] =
    VALIDATIONS;

export const COMPOSITION_VALIDATION_IDS: readonly CompositionValidationId[] =
    Object.freeze(VALIDATIONS.map((v) => v.id));

export function getCompositionValidation(
    id: CompositionValidationId
): CompositionValidationPrinciple {
    const found = VALIDATIONS.find((v) => v.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionValidationId: ${id}`);
    }
    return found;
}
