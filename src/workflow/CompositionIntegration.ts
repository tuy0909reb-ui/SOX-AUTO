/**
 * ASA-ARCH-21.3 Chapter 10 — Composition Integration (Draft 0.2)
 *
 * Declarative structural composition integration registry only.
 *
 * SHALL NOT contain:
 * - runtime / composition mutation / dynamic modification
 * - integration execution / expansion / validation / failure algorithms
 * - ExecutionGraph construction / scheduling / optimization
 * - engine assignment / dispatch strategy
 * - algorithms / mutable state / composition logic
 *
 * SHALL preserve ASA-ARCH-20.8〜21.3 Chapter 1–9 frozen contracts (extension only).
 */

export type CompositionIntegrationId =
    | "CIG-1"
    | "CIG-2"
    | "CIG-3"
    | "CIG-4"
    | "CIG-5"
    | "CIG-6"
    | "CIG-7"
    | "CIG-8"
    | "CIG-9"
    | "CIG-10";

export interface CompositionIntegrationPrinciple {
    readonly id: CompositionIntegrationId;
    readonly title: string;
    readonly statement: string;
}

/** Integration Verification — excluded concerns (documentation only). */
export const COMPOSITION_INTEGRATION_VERIFICATION = Object.freeze([
    "Runtime execution",
    "Runtime composition mutation",
    "Dynamic composition modification",
    "Integration execution algorithms",
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

/** Integration Outcome — architectural structural integration foundation (declarative only). */
export const COMPOSITION_INTEGRATION_OUTCOME = Object.freeze({
    statement:
        "The Composition Integration establishes the architectural structural integration foundation for subsequent Pipeline Composition contracts.",
    scope: "This chapter defines structural composition integration only.",
    exclusion: "Behavioral semantics are intentionally excluded from this chapter.",
} as const);

const INTEGRATIONS: readonly CompositionIntegrationPrinciple[] = Object.freeze([
    Object.freeze({
        id: "CIG-1",
        title: "Integration Scope",
        statement:
            "Composition integration SHALL define structural integration of composition entities within the Pipeline composition model. Integration scope SHALL remain declarative.",
    }),
    Object.freeze({
        id: "CIG-2",
        title: "Composition Reference Integrity",
        statement:
            "Composition integration SHALL preserve references between integrated composition entities. Reference integrity SHALL remain structural only.",
    }),
    Object.freeze({
        id: "CIG-3",
        title: "Structural Assembly Integrity",
        statement:
            "Composition integration SHALL preserve structural consistency during structural composition assembly. Structural assembly SHALL remain independent of runtime semantics.",
    }),
    Object.freeze({
        id: "CIG-4",
        title: "Contract Preservation",
        statement:
            "Composition integration SHALL preserve existing and frozen composition contracts. Integration SHALL NOT invalidate frozen architectural contracts.",
    }),
    Object.freeze({
        id: "CIG-5",
        title: "Integration Determinism",
        statement:
            "Equivalent structural composition integrations SHALL preserve identical integration semantics. Integration semantics SHALL remain deterministic.",
    }),
    Object.freeze({
        id: "CIG-6",
        title: "Boundary Preservation",
        statement:
            "Composition integration SHALL preserve boundaries between integrated composition structures. Integration boundaries SHALL remain structurally isolated.",
    }),
    Object.freeze({
        id: "CIG-7",
        title: "Compatibility Preservation",
        statement:
            "Composition integration SHALL preserve compatibility with existing and frozen composition contracts. Compatibility SHALL remain independent of behavioral semantics.",
    }),
    Object.freeze({
        id: "CIG-8",
        title: "Structural Consistency",
        statement:
            "Composition integration SHALL preserve structural consistency across integrated composition structures. Structural consistency SHALL remain invariant.",
    }),
    Object.freeze({
        id: "CIG-9",
        title: "Downstream Compatibility",
        statement:
            "Composition integration SHALL preserve compatibility with downstream architectural contracts. Downstream contracts SHALL NOT alter integration semantics.",
    }),
    Object.freeze({
        id: "CIG-10",
        title: "Behavioral Exclusion",
        statement:
            "Behavioral semantics SHALL remain outside the scope of composition integration. Composition integration SHALL remain purely declarative.",
    }),
]);

/** Frozen registry of all Chapter 10 Composition Integration contracts (CIG-1…CIG-10). */
export const COMPOSITION_INTEGRATIONS: readonly CompositionIntegrationPrinciple[] =
    INTEGRATIONS;

export const COMPOSITION_INTEGRATION_IDS: readonly CompositionIntegrationId[] =
    Object.freeze(INTEGRATIONS.map((i) => i.id));

export function getCompositionIntegration(
    id: CompositionIntegrationId
): CompositionIntegrationPrinciple {
    const found = INTEGRATIONS.find((i) => i.id === id);
    if (!found) {
        throw new Error(`Unknown CompositionIntegrationId: ${id}`);
    }
    return found;
}
