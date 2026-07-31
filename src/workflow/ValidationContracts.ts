/**
 * ASA-ARCH-21.2 Chapter 4 — Validation (Draft 0.2)
 *
 * Declarative architectural validation contract registry only.
 *
 * SHALL NOT contain:
 * - validation engine / algorithm / executor
 * - expansion / graph / workflow construction
 * - cycle detection implementation
 * - runtime / scheduling / dispatch / engine semantics
 * - failure handling implementation
 *
 * SHALL preserve:
 * - ASA-ARCH-21.2 Chapter 1 Pipeline Invariants (PI-1…PI-13)
 * - ASA-ARCH-21.2 Chapter 2 PipelineDefinition Public Contract (PD-1…PD-13)
 * - ASA-ARCH-21.2 Chapter 3 Expansion Rules (ER-1…ER-15)
 */

export type ValidationContractId =
    | "VL-1"
    | "VL-2"
    | "VL-3"
    | "VL-4"
    | "VL-5"
    | "VL-6"
    | "VL-7"
    | "VL-8"
    | "VL-9"
    | "VL-10"
    | "VL-11"
    | "VL-12"
    | "VL-13"
    | "VL-14"
    | "VL-15"
    | "VL-16"
    | "VL-17"
    | "VL-18"
    | "VL-19"
    | "VL-20";

export type ValidationContractCategory =
    | "principle"
    | "boundary"
    | "pipeline_validation"
    | "workflow_validation"
    | "classification"
    | "outcome";

export interface ValidationContract {
    readonly id: ValidationContractId;
    readonly title: string;
    readonly statement: string;
    readonly category: ValidationContractCategory;
}

/** VL-20 outcome classifications (classification only — no failure handling). */
export type ValidationOutcomeClassification =
    | "Valid"
    | "Invalid Structure"
    | "Invalid Expansion"
    | "Invariant Violation"
    | "Compatibility Violation";

export const VALIDATION_OUTCOME_CLASSIFICATIONS: readonly ValidationOutcomeClassification[] =
    Object.freeze([
        "Valid",
        "Invalid Structure",
        "Invalid Expansion",
        "Invariant Violation",
        "Compatibility Violation",
    ]);

/** VL-2 forbidden concerns (boundary documentation only). */
export const VL2_FORBIDDEN_VALIDATION_CONCERNS = Object.freeze([
    "Runtime semantics",
    "Execution behavior",
    "Execution policy",
    "Scheduler",
    "EnginePool",
    "DispatchStrategy",
    "Runtime data",
    "Runtime condition evaluation",
] as const);

/** VL-4 validation phases (declarative labels only). */
export const VL4_VALIDATION_PHASES = Object.freeze([
    "Pipeline Validation (pre-expansion)",
    "Workflow Validation (post-expansion)",
] as const);

const CONTRACTS: readonly ValidationContract[] = Object.freeze([
    Object.freeze({
        id: "VL-1",
        title: "Declarative Validation",
        statement: "Validation SHALL be declarative.",
        category: "principle",
    }),
    Object.freeze({
        id: "VL-2",
        title: "Structure Only",
        statement: "Validation SHALL operate on structural semantics only.",
        category: "principle",
    }),
    Object.freeze({
        id: "VL-3",
        title: "Deterministic Validation",
        statement: "Validation SHALL be deterministic.",
        category: "principle",
    }),
    Object.freeze({
        id: "VL-4",
        title: "Pipeline Validation / Workflow Validation",
        statement:
            "Validation SHALL apply to Pipeline Validation (pre-expansion) and Workflow Validation (post-expansion).",
        category: "principle",
    }),
    Object.freeze({
        id: "VL-5",
        title: "No Execution",
        statement: "Validation SHALL NOT execute any part of the workflow.",
        category: "principle",
    }),
    Object.freeze({
        id: "VL-6",
        title: "Validation Is Not Expansion",
        statement:
            "Validation SHALL NOT perform explicit or implicit expansion.",
        category: "boundary",
    }),
    Object.freeze({
        id: "VL-7",
        title: "Validation Is Not WorkflowBuilder",
        statement: "Validation SHALL NOT construct ExecutionGraph.",
        category: "boundary",
    }),
    Object.freeze({
        id: "VL-8",
        title: "Validation Is Not Runtime",
        statement:
            "Validation SHALL NOT reference or evaluate any runtime behavior or execution policy.",
        category: "boundary",
    }),
    Object.freeze({
        id: "VL-9",
        title: "Recognized Elements Compliance",
        statement:
            "Validation SHALL verify compliance with the structural contracts defined in Chapter 2.",
        category: "pipeline_validation",
    }),
    Object.freeze({
        id: "VL-10",
        title: "Structural Completeness Compliance",
        statement:
            "Validation SHALL verify that PipelineDefinition satisfies structural completeness as defined in Chapter 2.",
        category: "pipeline_validation",
    }),
    Object.freeze({
        id: "VL-11",
        title: "Branch / Parallel / NestedPipeline Consistency",
        statement:
            "Validation SHALL verify structural consistency of Branch, Parallel, and NestedPipeline according to Chapter 2 and Chapter 3.",
        category: "pipeline_validation",
    }),
    Object.freeze({
        id: "VL-12",
        title: "Deterministic Workflow",
        statement: "Expanded WorkflowDefinition SHALL be deterministic.",
        category: "workflow_validation",
    }),
    Object.freeze({
        id: "VL-13",
        title: "Acyclic Workflow",
        statement: "Expanded WorkflowDefinition SHALL be acyclic.",
        category: "workflow_validation",
    }),
    Object.freeze({
        id: "VL-14",
        title: "Structural Completeness After Expansion",
        statement:
            "Expanded WorkflowDefinition SHALL be structurally complete.",
        category: "workflow_validation",
    }),
    Object.freeze({
        id: "VL-15",
        title: "Downstream Contract Compatibility",
        statement:
            "Validation SHALL verify compatibility with downstream structural contracts.",
        category: "workflow_validation",
    }),
    Object.freeze({
        id: "VL-16",
        title: "Invalid Structure",
        statement:
            "PipelineDefinition that does not conform to Chapter 2 contracts SHALL be classified as invalid structure.",
        category: "classification",
    }),
    Object.freeze({
        id: "VL-17",
        title: "Invalid Expansion",
        statement:
            "WorkflowDefinition that does not conform to Chapter 3 contracts SHALL be classified as invalid expansion.",
        category: "classification",
    }),
    Object.freeze({
        id: "VL-18",
        title: "Invariant Violation",
        statement:
            "Invariant Violation includes any violation of PI-1 through PI-13.",
        category: "classification",
    }),
    Object.freeze({
        id: "VL-19",
        title: "Compatibility Violation",
        statement:
            "Violation of Downstream Contract Compatibility SHALL be classified as compatibility violation.",
        category: "classification",
    }),
    Object.freeze({
        id: "VL-20",
        title: "Validation Outcome Classification",
        statement:
            "Validation outcome SHALL be classified as one of: Valid, Invalid Structure, Invalid Expansion, Invariant Violation, Compatibility Violation.",
        category: "outcome",
    }),
]);

/** Frozen registry of all Chapter 4 Validation Contracts (VL-1…VL-20). */
export const VALIDATION_CONTRACTS: readonly ValidationContract[] = CONTRACTS;

export const VALIDATION_CONTRACT_IDS: readonly ValidationContractId[] =
    Object.freeze(CONTRACTS.map((c) => c.id));

export function getValidationContract(id: ValidationContractId): ValidationContract {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown ValidationContractId: ${id}`);
    }
    return found;
}
