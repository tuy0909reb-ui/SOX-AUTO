export type NodeID = string;

export type OrchestratorState =
    | "Created"
    | "Initialized"
    | "Ready"
    | "Running"
    | "Completed"
    | "Failed"
    | "Shutdown";

export type LifecycleEvent =
    | "INITIALIZE_SUCCESS"
    | "MARK_READY"
    | "INITIALIZE_FAILURE"
    | "START_EXECUTE"
    | "COMPLETE"
    | "FAIL"
    | "SHUTDOWN";

export type ErrorPolicyKind = "STOP_ON_ERROR" | "CONTINUE" | "COLLECT_ERRORS";

export type ErrorPolicyDecision = "CONTINUE" | "TERMINATE";

export interface RuntimePlanNode {
    id: NodeID;
    /** Predecessor node IDs that must complete before this node is executable. */
    dependencies: NodeID[];
    input?: {
        type: string;
        payload: unknown;
        metadata?: Record<string, unknown>;
    };
}

export interface RuntimePlan {
    nodes: RuntimePlanNode[];
    errorPolicy?: ErrorPolicyKind;
}

export interface EventRecord {
    nodeId: NodeID;
    type: string;
    payload: unknown;
    timestamp: number;
}

export interface ErrorRecord {
    nodeId: NodeID;
    message: string;
    timestamp: number;
}

export interface OrchestrationSnapshot {
    state: OrchestratorState;
    events: readonly EventRecord[];
    errors: readonly ErrorRecord[];
    startTime: number;
    endTime?: number;
    completedNodes: readonly NodeID[];
}

export interface EngineOutcome {
    nodeId: NodeID;
    result?: unknown;
    error?: Error | null;
    events?: EventRecord[];
}

export interface OrchestrationResult {
    state: OrchestratorState;
    completedNodes: NodeID[];
    errors: ErrorRecord[];
    events: EventRecord[];
}
