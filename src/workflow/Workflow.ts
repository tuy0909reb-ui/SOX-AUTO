import { ExecutionGraph } from "../orchestration/ExecutionGraph";
import { RuntimePlan } from "../orchestration/types";
import { ExecutionPolicy, freezeExecutionPolicy } from "./ExecutionPolicy";
import { freezeMetadata, WorkflowMetadata } from "./WorkflowMetadata";
import { WorkflowDefinition, WorkflowPipelineStep, WorkflowValue } from "./WorkflowDefinition";
import { WorkflowBuildError } from "./WorkflowBuildError";
import { WorkflowState } from "./WorkflowState";

export class WorkflowValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkflowValidationError";
    }
}

/** @deprecated Prefer WorkflowBuildError (21.1); retained for 21.0 compatibility. */
export class WorkflowGraphBuildError extends WorkflowBuildError {
    constructor(message: string) {
        super(message);
        this.name = "WorkflowGraphBuildError";
    }
}

/** Lifecycle state stored outside frozen instance (definition data remains immutable). */
const workflowStates = new WeakMap<Workflow, WorkflowState>();

/**
 * Immutable Workflow definition after successful validation.
 * Contains no runtime execution / scheduling / dispatch / engine logic.
 * Responsibility ends at Ready.
 */
export class Workflow {
    readonly workflow_id: string;
    readonly workflow_name: string;
    readonly workflow_version: string;
    readonly metadata: Readonly<WorkflowMetadata>;
    readonly inputs: Readonly<Record<string, WorkflowValue>>;
    readonly outputs: Readonly<Record<string, WorkflowValue>>;
    readonly variables: Readonly<Record<string, WorkflowValue>>;
    readonly pipeline: readonly WorkflowPipelineStep[];
    readonly execution_policy: Readonly<ExecutionPolicy>;

    private constructor(def: WorkflowDefinition, state: WorkflowState) {
        this.workflow_id = def.workflow_id;
        this.workflow_name = def.workflow_name;
        this.workflow_version = def.workflow_version;
        this.metadata = freezeMetadata(def.metadata);
        this.inputs = Object.freeze({ ...def.inputs });
        this.outputs = Object.freeze({ ...def.outputs });
        this.variables = Object.freeze({ ...def.variables });
        this.pipeline = Object.freeze(
            def.pipeline.map((s) =>
                Object.freeze({
                    id: s.id,
                    dependencies: Object.freeze([...s.dependencies]),
                    priority: s.priority,
                    input: s.input
                        ? Object.freeze({
                              type: s.input.type,
                              payload: s.input.payload,
                              metadata: s.input.metadata
                                  ? Object.freeze({ ...s.input.metadata })
                                  : undefined,
                          })
                        : undefined,
                })
            )
        );
        this.execution_policy = freezeExecutionPolicy(def.execution_policy);
        workflowStates.set(this, state);
        Object.freeze(this);
    }

    get workflow_state(): WorkflowState {
        return workflowStates.get(this) ?? "Created";
    }

    /**
     * Validate definition and produce an immutable Workflow (Validated → Immutable).
     */
    static validate(definition: WorkflowDefinition): Workflow {
        if (!definition.workflow_id || definition.workflow_id.trim() === "") {
            throw new WorkflowValidationError("workflow_id is required");
        }
        if (!definition.workflow_name || definition.workflow_name.trim() === "") {
            throw new WorkflowValidationError("workflow_name is required");
        }
        if (!definition.workflow_version || definition.workflow_version.trim() === "") {
            throw new WorkflowValidationError("workflow_version is required");
        }
        if (!definition.pipeline || definition.pipeline.length === 0) {
            throw new WorkflowValidationError("pipeline must contain at least one step");
        }

        const ids = new Set<string>();
        for (const step of definition.pipeline) {
            if (!step.id || step.id.trim() === "") {
                throw new WorkflowValidationError("pipeline step id is required");
            }
            if (ids.has(step.id)) {
                throw new WorkflowValidationError(`duplicate pipeline step id: ${step.id}`);
            }
            ids.add(step.id);
        }
        for (const step of definition.pipeline) {
            for (const dep of step.dependencies) {
                if (!ids.has(dep)) {
                    throw new WorkflowValidationError(
                        `unknown dependency ${dep} on step ${step.id}`
                    );
                }
            }
        }

        // Created → Validated → Immutable (frozen definition instance).
        return new Workflow(definition, "Immutable");
    }

    /**
     * Declarative projection to RuntimePlan for GraphBuilder.
     * Read-only view of Workflow — does not mutate Workflow.
     */
    toRuntimePlan(): RuntimePlan {
        this.assertGraphEligible();
        return {
            nodes: this.pipeline.map((s) => ({
                id: s.id,
                dependencies: [...s.dependencies],
                priority: s.priority,
                input: s.input
                    ? {
                          type: s.input.type,
                          payload: s.input.payload,
                          metadata: { ...(s.input.metadata ?? {}) },
                      }
                    : undefined,
            })),
            errorPolicy: this.execution_policy.errorPolicy,
            schedulingPolicy: this.execution_policy.schedulingPolicy,
            maxConcurrency: this.execution_policy.maxConcurrency,
        };
    }

    /**
     * Workflow → ExecutionGraph (21.0 façade).
     * Delegates to ASA-ARCH-21.1 WorkflowBuilder (pure conversion).
     */
    static buildExecutionGraph(workflow: Workflow): ExecutionGraph {
        // Lazy require avoids circular init with WorkflowBuilder.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { WorkflowBuilder } = require("./WorkflowBuilder") as typeof import("./WorkflowBuilder");
        try {
            return WorkflowBuilder.buildExecutionGraph(workflow);
        } catch (err) {
            if (err instanceof WorkflowBuildError) {
                throw new WorkflowGraphBuildError(err.message);
            }
            throw new WorkflowGraphBuildError(
                err instanceof Error ? err.message : String(err)
            );
        }
    }

    /** Package-internal: advance lifecycle after successful graph build. */
    static markGraphBuiltReady(workflow: Workflow): void {
        workflowStates.set(workflow, "GraphBuilt");
        workflowStates.set(workflow, "Ready");
    }

    /** Package-internal: restore state after failed build (failure contract). */
    static restoreState(workflow: Workflow, state: WorkflowState): void {
        workflowStates.set(workflow, state);
    }

    private assertGraphEligible(): void {
        const state = this.workflow_state;
        if (state !== "Immutable" && state !== "GraphBuilt" && state !== "Ready") {
            throw new WorkflowBuildError(
                `Workflow must be Immutable before GraphBuilder; state=${state}`
            );
        }
    }
}
