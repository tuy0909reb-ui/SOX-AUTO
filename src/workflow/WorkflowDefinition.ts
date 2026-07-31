import { ExecutionPolicy } from "./ExecutionPolicy";
import { WorkflowMetadata } from "./WorkflowMetadata";

export type WorkflowValue = unknown;

/**
 * Declarative pipeline step — what to execute, not how/when engines run.
 */
export interface WorkflowPipelineStep {
    readonly id: string;
    readonly dependencies: readonly string[];
    readonly priority?: number;
    readonly input?: {
        readonly type: string;
        readonly payload: unknown;
        readonly metadata?: Readonly<Record<string, unknown>>;
    };
}

/**
 * Raw declarative Workflow definition (pre-validation).
 */
export interface WorkflowDefinition {
    readonly workflow_id: string;
    readonly workflow_name: string;
    readonly workflow_version: string;
    readonly metadata: WorkflowMetadata;
    readonly inputs: Readonly<Record<string, WorkflowValue>>;
    readonly outputs: Readonly<Record<string, WorkflowValue>>;
    readonly variables: Readonly<Record<string, WorkflowValue>>;
    readonly pipeline: readonly WorkflowPipelineStep[];
    readonly execution_policy: ExecutionPolicy;
}
