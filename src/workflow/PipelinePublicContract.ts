/**
 * ASA-ARCH-21.2 Chapter 2 — PipelineDefinition Public Contract (Draft 0.2)
 *
 * Public architectural contracts only.
 *
 * SHALL NOT contain:
 * - runtime / scheduling / engine / dispatch / execution semantics
 * - expansion algorithm
 * - validation algorithm
 * - failure handling implementation
 *
 * SHALL preserve ASA-ARCH-21.2 Chapter 1 Pipeline Invariants (PI-1…PI-13).
 * PipelineDefinition remains a Definition Object only.
 */

export type PipelinePublicContractId =
    | "PD-1"
    | "PD-2"
    | "PD-3"
    | "PD-4"
    | "PD-5"
    | "PD-6"
    | "PD-7"
    | "PD-8"
    | "PD-9"
    | "PD-10"
    | "PD-11"
    | "PD-12"
    | "PD-13";

export type PipelinePublicContractCategory =
    | "definition"
    | "structural"
    | "composition"
    | "expansion_boundary"
    | "read_only"
    | "compatibility"
    | "validity";

export interface PipelinePublicContract {
    readonly id: PipelinePublicContractId;
    readonly title: string;
    readonly statement: string;
    readonly category: PipelinePublicContractCategory;
}

const CONTRACTS: readonly PipelinePublicContract[] = Object.freeze([
    Object.freeze({
        id: "PD-1",
        title: "Definition Object",
        statement: "PipelineDefinition SHALL be a definition object.",
        category: "definition",
    }),
    Object.freeze({
        id: "PD-2",
        title: "Recognized Structural Elements",
        statement:
            "PipelineDefinition SHALL consist only of recognized structural elements.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-3",
        title: "Sequence Contract",
        statement:
            "Sequence SHALL define a deterministic ordered list of structural elements.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-4",
        title: "Parallel Contract",
        statement:
            "Parallel SHALL define a deterministic set of concurrently eligible branches.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-5",
        title: "Branch Contract",
        statement:
            "Branch SHALL define a structural conditional path identified by a Condition Identifier.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-6",
        title: "Merge Contract",
        statement: "Merge SHALL define a structural convergence point.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-7",
        title: "NestedPipeline Contract",
        statement:
            "NestedPipeline SHALL embed another PipelineDefinition as a structural element.",
        category: "structural",
    }),
    Object.freeze({
        id: "PD-8",
        title: "Composition Contract",
        statement:
            "PipelineDefinition SHALL consist only of Recognized Structural Elements, StepDefinitions (21.0), NestedPipeline, and PipelineDefinition (recursive structure).",
        category: "composition",
    }),
    Object.freeze({
        id: "PD-9",
        title: "Expansion Capability",
        statement:
            "PipelineDefinition SHALL be expandable into exactly one valid Workflow.",
        category: "expansion_boundary",
    }),
    Object.freeze({
        id: "PD-10",
        title: "Expansion Boundary",
        statement:
            "PipelineDefinition SHALL define the boundary for expansion by an expansion component.",
        category: "expansion_boundary",
    }),
    Object.freeze({
        id: "PD-11",
        title: "Read-only Exposure",
        statement: "PipelineDefinition SHALL be publicly exposed as read-only.",
        category: "read_only",
    }),
    Object.freeze({
        id: "PD-12",
        title: "WorkflowBuilder Compatibility",
        statement:
            "Expansion result SHALL satisfy WorkflowBuilder requirements.",
        category: "compatibility",
    }),
    Object.freeze({
        id: "PD-13",
        title: "Structural Validity",
        statement:
            "PipelineDefinition containing an invalid structure SHALL be considered invalid.",
        category: "validity",
    }),
]);

/** Frozen registry of all Chapter 2 Public Contracts (PD-1…PD-13). */
export const PIPELINE_PUBLIC_CONTRACTS: readonly PipelinePublicContract[] = CONTRACTS;

export const PIPELINE_PUBLIC_CONTRACT_IDS: readonly PipelinePublicContractId[] =
    Object.freeze(CONTRACTS.map((c) => c.id));

export function getPipelinePublicContract(
    id: PipelinePublicContractId
): PipelinePublicContract {
    const found = CONTRACTS.find((c) => c.id === id);
    if (!found) {
        throw new Error(`Unknown PipelinePublicContractId: ${id}`);
    }
    return found;
}
