/**
 * ASA-ARCH-21.2 Chapter 1 — Pipeline Invariants (Draft 0.2)
 *
 * Architectural constraints only.
 *
 * SHALL NOT contain:
 * - runtime / scheduling / engine / execution semantics
 * - expansion algorithm
 * - validation algorithm
 * - failure classification beyond the invariant itself
 *
 * Downstream chapters (Public Contract, Expansion, Validation, Failure Contract)
 * SHALL subordinate to these invariants.
 */

export type PipelineInvariantId =
    | "PI-1"
    | "PI-2"
    | "PI-3"
    | "PI-4"
    | "PI-5"
    | "PI-6"
    | "PI-7"
    | "PI-8"
    | "PI-9"
    | "PI-10"
    | "PI-11"
    | "PI-12"
    | "PI-13";

export type PipelineInvariantCategory = "core" | "structural" | "failure";

export interface PipelineInvariant {
    readonly id: PipelineInvariantId;
    readonly title: string;
    readonly statement: string;
    readonly category: PipelineInvariantCategory;
}

/** Runtime / execution-policy concerns forbidden by PI-4 (documentation of boundary only). */
export const PI4_FORBIDDEN_RUNTIME_CONCERNS = Object.freeze([
    "Retry",
    "Timeout",
    "Engine assignment",
    "Scheduler behavior",
    "Priority",
    "Load balancing",
    "Dispatch preference",
    "Compensation",
    "Execution Policy",
] as const);

/**
 * Initial recognized structural element names for PI-11.
 * Normative element set is defined by a future Public Contract chapter;
 * this list is architectural intent only (not a parser / validator).
 */
export const PI11_INITIAL_STRUCTURAL_ELEMENTS = Object.freeze([
    "Sequence",
    "Parallel",
    "Branch",
    "Merge",
    "Nested",
] as const);

const INVARIANTS: readonly PipelineInvariant[] = Object.freeze([
    Object.freeze({
        id: "PI-1",
        title: "Immutable Lifecycle",
        statement:
            "Pipeline SHALL become immutable immediately after successful validation.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-2",
        title: "Read-only Exposure",
        statement:
            "Pipeline SHALL be exposed as read-only to all external components.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-3",
        title: "Determinism",
        statement: "Pipeline SHALL be deterministic.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-4",
        title: "Structure Only",
        statement:
            "Pipeline SHALL represent workflow structure only. Pipeline SHALL NOT define runtime behavior or execution policy.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-5",
        title: "Single Expansion",
        statement:
            "Pipeline SHALL be expandable into exactly one valid Workflow.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-6",
        title: "Acyclic Expansion",
        statement: "Expanded Workflow SHALL be acyclic.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-7",
        title: "Compatibility with WorkflowBuilder",
        statement: "Pipeline SHALL be compatible with WorkflowBuilder (21.1).",
        category: "core",
    }),
    Object.freeze({
        id: "PI-8",
        title: "Implementation Independence",
        statement: "Pipeline SHALL be implementation independent.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-9",
        title: "Semantic Independence",
        statement:
            "Pipeline semantics SHALL be independent from representation.",
        category: "core",
    }),
    Object.freeze({
        id: "PI-10",
        title: "Complete Structural Definition",
        statement: "Pipeline SHALL represent a complete structural definition.",
        category: "structural",
    }),
    Object.freeze({
        id: "PI-11",
        title: "Recognized Structural Elements",
        statement:
            "Pipeline SHALL consist only of recognized structural elements.",
        category: "structural",
    }),
    Object.freeze({
        id: "PI-12",
        title: "No Runtime-dependent Branching",
        statement: "Pipeline SHALL NOT contain runtime-dependent branching.",
        category: "structural",
    }),
    Object.freeze({
        id: "PI-13",
        title: "Immediate Failure on Violation",
        statement:
            "Any violation of Pipeline Invariants SHALL cause immediate failure.",
        category: "failure",
    }),
]);

/** Frozen registry of all Chapter 1 Pipeline Invariants (PI-1…PI-13). */
export const PIPELINE_INVARIANTS: readonly PipelineInvariant[] = INVARIANTS;

export const PIPELINE_INVARIANT_IDS: readonly PipelineInvariantId[] = Object.freeze(
    INVARIANTS.map((i) => i.id)
);

export function getPipelineInvariant(id: PipelineInvariantId): PipelineInvariant {
    const found = INVARIANTS.find((i) => i.id === id);
    if (!found) {
        // Registry completeness is a compile-time concern; this is defensive only.
        throw new Error(`Unknown PipelineInvariantId: ${id}`);
    }
    return found;
}
