/**
 * ASA-ARCH-21.2 Chapter 5 — Failure Contract (Draft 0.2)
 *
 * Declarative architectural failure contract registry only.
 *
 * SHALL NOT contain:
 * - failure handling / exception classes / error codes
 * - recovery / retry / logging
 * - runtime / validation / expansion algorithms
 * - WorkflowBuilder / ExecutionGraph logic
 *
 * SHALL preserve ASA-ARCH-21.2 Chapters 1–4 frozen contracts.
 */

export type FailureContractId =
    | "FL-1"
    | "FL-2"
    | "FL-3"
    | "FL-4"
    | "FL-5"
    | "FL-6"
    | "FL-7"
    | "FL-8"
    | "FL-9"
    | "FL-10"
    | "FL-11"
    | "FL-12"
    | "FL-13"
    | "FL-14"
    | "FL-15"
    | "FL-16"
    | "FL-17";

export type FailureContractCategory =
    | "principle"
    | "boundary"
    | "failure_category"
    | "semantics"
    | "determination"
    | "category_contract";

export interface FailureContract {
    readonly id: FailureContractId;
    readonly title: string;
    readonly statement: string;
    readonly category: FailureContractCategory;
}

/** FL-17 failure categories (classification only — no handling). */
export type FailureCategory =
    | "Invalid Structure"
    | "Invalid Expansion"
    | "Invariant Violation"
    | "Compatibility Violation";

export const FAILURE_CATEGORIES: readonly FailureCategory[] = Object.freeze([
    "Invalid Structure",
    "Invalid Expansion",
    "Invariant Violation",
    "Compatibility Violation",
]);

/** FL-2 / FL-5 forbidden concerns (boundary documentation only). */
export const FL_FORBIDDEN_BEHAVIORAL_CONCERNS = Object.freeze([
    "Runtime semantics",
    "Execution behavior",
    "Execution policy",
    "Scheduler",
    "EnginePool",
    "DispatchStrategy",
    "Runtime data",
    "Runtime condition evaluation",
    "Runtime exception classification",
    "Exception types",
    "Error codes",
    "Logging",
    "UI display",
    "Runtime stop behavior",
    "Orchestrator error handling",
    "Retry",
    "Timeout",
    "Backoff",
    "Automatic correction",
    "Fallback",
    "Partial execution",
] as const);

const CONTRACTS: readonly FailureContract[] = Object.freeze([
    Object.freeze({
        id: "FL-1",
        title: "Declarative Failure",
        statement:
            "Failure Contract SHALL define failure categories and semantics only.",
        category: "principle",
    }),
    Object.freeze({
        id: "FL-2",
        title: "Structural Failure Only",
        statement:
            "Failure SHALL be defined only in terms of structural semantics.",
        category: "principle",
    }),
    Object.freeze({
        id: "FL-3",
        title: "Pre-runtime Detectability",
        statement: "Failure SHALL be detectable before runtime execution.",
        category: "principle",
    }),
    Object.freeze({
        id: "FL-4",
        title: "Deterministic Failure",
        statement: "Failure SHALL be deterministic.",
        category: "principle",
    }),
    Object.freeze({
        id: "FL-5",
        title: "Failure Is Not Behavior",
        statement:
            "Failure Contract SHALL NOT define exception types, error codes, logging, UI display, runtime stop behavior, Orchestrator error handling, or Retry / Timeout / Backoff.",
        category: "boundary",
    }),
    Object.freeze({
        id: "FL-6",
        title: "Failure Is Not Recovery",
        statement: "Failure Contract SHALL NOT define recovery behavior.",
        category: "boundary",
    }),
    Object.freeze({
        id: "FL-7",
        title: "Structural Scope Only",
        statement: "Failure Contract applies only to structural processing.",
        category: "boundary",
    }),
    Object.freeze({
        id: "FL-8",
        title: "Invalid Structure",
        statement:
            "Invalid Structure SHALL be defined as: PipelineDefinition that does not conform to Chapter 2 structural contracts.",
        category: "failure_category",
    }),
    Object.freeze({
        id: "FL-9",
        title: "Invalid Expansion",
        statement:
            "Invalid Expansion SHALL be defined as: WorkflowDefinition that does not conform to Chapter 3 expansion contracts.",
        category: "failure_category",
    }),
    Object.freeze({
        id: "FL-10",
        title: "Invariant Violation",
        statement:
            "Invariant Violation SHALL be defined as: any violation of Pipeline Invariants (PI-1 through PI-13).",
        category: "failure_category",
    }),
    Object.freeze({
        id: "FL-11",
        title: "Compatibility Violation",
        statement:
            "Compatibility Violation SHALL be defined as: a state that does not conform to downstream structural contracts.",
        category: "failure_category",
    }),
    Object.freeze({
        id: "FL-12",
        title: "Structural Non-continuability",
        statement: "Failure indicates structural non-continuability.",
        category: "semantics",
    }),
    Object.freeze({
        id: "FL-13",
        title: "Structurally Terminal",
        statement: "Failure SHALL be structurally terminal.",
        category: "semantics",
    }),
    Object.freeze({
        id: "FL-14",
        title: "Semantically Non-recoverable",
        statement:
            "Failure SHALL be semantically non-recoverable at the structural level.",
        category: "semantics",
    }),
    Object.freeze({
        id: "FL-15",
        title: "Structural Validation Determines Failure",
        statement:
            "Failure categories are determined through structural validation.",
        category: "determination",
    }),
    Object.freeze({
        id: "FL-16",
        title: "Deterministic Determination",
        statement: "Failure determination SHALL be deterministic.",
        category: "determination",
    }),
    Object.freeze({
        id: "FL-17",
        title: "Failure Category",
        statement:
            "Failure Category SHALL be one of: Invalid Structure, Invalid Expansion, Invariant Violation, Compatibility Violation.",
        category: "category_contract",
    }),
]);

/** Frozen registry of all Chapter 5 Failure Contracts (FL-1…FL-17). */
export const FAILURE_CONTRACTS: readonly FailureContract[] = CONTRACTS;

export const FAILURE_CONTRACT_IDS: readonly FailureContractId[] = Object.freeze(
    CONTRACTS.map((c) => c.id)
);

export function getFailureContract(id: FailureContractId): FailureContract {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown FailureContractId: ${id}`);
    }
    return found;
}
