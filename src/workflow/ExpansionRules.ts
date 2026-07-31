/**
 * ASA-ARCH-21.2 Chapter 3 — Expansion Rules (Draft 0.2)
 *
 * Declarative architectural expansion rule registry only.
 *
 * SHALL NOT contain:
 * - expansion engine / algorithm / component
 * - validation algorithm / cycle detection
 * - graph / node / edge construction
 * - runtime / scheduling / dispatch / engine semantics
 * - failure handling implementation
 *
 * SHALL preserve:
 * - ASA-ARCH-21.2 Chapter 1 Pipeline Invariants (PI-1…PI-13)
 * - ASA-ARCH-21.2 Chapter 2 PipelineDefinition Public Contract (PD-1…PD-13)
 */

export type ExpansionRuleId =
    | "ER-1"
    | "ER-2"
    | "ER-3"
    | "ER-4"
    | "ER-5"
    | "ER-6"
    | "ER-7"
    | "ER-8"
    | "ER-9"
    | "ER-10"
    | "ER-11"
    | "ER-12"
    | "ER-13"
    | "ER-14"
    | "ER-15";

export type ExpansionRuleCategory =
    | "principle"
    | "boundary"
    | "structural"
    | "composition"
    | "validity";

export interface ExpansionRule {
    readonly id: ExpansionRuleId;
    readonly title: string;
    readonly statement: string;
    readonly category: ExpansionRuleCategory;
}

/** ER-4 forbidden concerns (boundary documentation only). */
export const ER4_FORBIDDEN_EXPANSION_CONCERNS = Object.freeze([
    "Runtime semantics",
    "Retry",
    "Timeout",
    "Engine assignment",
    "Scheduler behavior",
    "Execution policy",
    "Runtime-dependent branching generation",
] as const);

/**
 * ER-13 composition rule names per recognized structural element.
 * Declarative mapping only — not an expander.
 */
export const ER13_COMPOSITION_RULES = Object.freeze({
    Sequence: "Linear composition",
    Parallel: "Independent composition",
    Branch: "Conditional composition",
    Merge: "Convergence composition",
    NestedPipeline: "Recursive composition",
} as const);

/** ER-15 invalid expansion categories (no failure handling implementation). */
export const ER15_INVALID_EXPANSION_CATEGORIES = Object.freeze([
    "Cycle generation",
    "Ambiguous expansion",
    "Incomplete structure",
    "Infinite recursion",
    "Structural rule violation",
] as const);

const RULES: readonly ExpansionRule[] = Object.freeze([
    Object.freeze({
        id: "ER-1",
        title: "Deterministic Expansion",
        statement: "PipelineDefinition SHALL expand deterministically.",
        category: "principle",
    }),
    Object.freeze({
        id: "ER-2",
        title: "Single Expansion",
        statement:
            "PipelineDefinition SHALL expand into exactly one valid WorkflowDefinition.",
        category: "principle",
    }),
    Object.freeze({
        id: "ER-3",
        title: "Acyclic Expansion",
        statement: "Expanded WorkflowDefinition SHALL be acyclic.",
        category: "principle",
    }),
    Object.freeze({
        id: "ER-4",
        title: "Structure Only",
        statement: "Expansion SHALL preserve structural semantics only.",
        category: "principle",
    }),
    Object.freeze({
        id: "ER-5",
        title: "Expansion Operation",
        statement:
            "Expansion SHALL operate on PipelineDefinition and produce one WorkflowDefinition.",
        category: "boundary",
    }),
    Object.freeze({
        id: "ER-6",
        title: "WorkflowBuilder Boundary",
        statement:
            "Expansion result SHALL satisfy WorkflowBuilder requirements.",
        category: "boundary",
    }),
    Object.freeze({
        id: "ER-7",
        title: "Sequence Expansion",
        statement: "Sequence SHALL expand into a linear Workflow segment.",
        category: "structural",
    }),
    Object.freeze({
        id: "ER-8",
        title: "Parallel Expansion",
        statement:
            "Parallel SHALL expand into multiple independent Workflow segments.",
        category: "structural",
    }),
    Object.freeze({
        id: "ER-9",
        title: "Branch Expansion",
        statement:
            "Branch SHALL expand into conditional Workflow segments identified by a Structural Condition Reference.",
        category: "structural",
    }),
    Object.freeze({
        id: "ER-10",
        title: "Merge Expansion",
        statement: "Merge SHALL expand into a structural convergence point.",
        category: "structural",
    }),
    Object.freeze({
        id: "ER-11",
        title: "NestedPipeline Expansion",
        statement: "NestedPipeline SHALL expand into a Workflow subgraph.",
        category: "structural",
    }),
    Object.freeze({
        id: "ER-12",
        title: "StepDefinition Expansion",
        statement:
            "StepDefinition SHALL be preserved as exactly one Workflow step during expansion.",
        category: "composition",
    }),
    Object.freeze({
        id: "ER-13",
        title: "Structural Composition",
        statement:
            "Each recognized structural element SHALL define its own composition rule.",
        category: "composition",
    }),
    Object.freeze({
        id: "ER-14",
        title: "Valid Expansion",
        statement:
            "Valid WorkflowDefinition SHALL satisfy Deterministic, Acyclic, and Structural completeness.",
        category: "validity",
    }),
    Object.freeze({
        id: "ER-15",
        title: "Invalid Expansion",
        statement:
            "Expansion result not satisfying ER-1 through ER-14 SHALL be considered invalid.",
        category: "validity",
    }),
]);

/** Frozen registry of all Chapter 3 Expansion Rules (ER-1…ER-15). */
export const EXPANSION_RULES: readonly ExpansionRule[] = RULES;

export const EXPANSION_RULE_IDS: readonly ExpansionRuleId[] = Object.freeze(
    RULES.map((r) => r.id)
);

export function getExpansionRule(id: ExpansionRuleId): ExpansionRule {
    const found = RULES.find((r) => r.id === id);
    if (!found) {
        throw new Error(`Unknown ExpansionRuleId: ${id}`);
    }
    return found;
}
