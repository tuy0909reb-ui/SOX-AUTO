/**
 * Workflow definition lifecycle states (ASA-ARCH-21.0).
 * Responsibility ends at Ready. Runtime states belong to Orchestrator.
 */
export type WorkflowState =
    | "Created"
    | "Validated"
    | "Immutable"
    | "GraphBuilt"
    | "Ready";

/** Orchestrator-owned runtime states (not managed by Workflow). */
export type OrchestratorRuntimeState =
    | "Running"
    | "Completed"
    | "Failed"
    | "Suspended"
    | "Resumed";
