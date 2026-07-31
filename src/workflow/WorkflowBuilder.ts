import { ExecutionGraph } from "../orchestration/ExecutionGraph";
import { GraphValidator } from "../orchestration/GraphValidator";
import { ExecutionPolicy } from "./ExecutionPolicy";
import { EdgeFactory } from "./EdgeFactory";
import { NodeFactory } from "./NodeFactory";
import { PipelineDefinition } from "./PipelineDefinition";
import { StepDefinition } from "./StepDefinition";
import { WorkflowMetadata } from "./WorkflowMetadata";
import {
    WorkflowDefinition,
    WorkflowPipelineStep,
    WorkflowValue,
} from "./WorkflowDefinition";
import { Workflow } from "./Workflow";
import { WorkflowBuildError } from "./WorkflowBuildError";

/**
 * ASA-ARCH-21.1 WorkflowBuilder
 *
 * - Definition builder (21.0 compatible fluent API)
 * - Workflow → ExecutionGraph pure conversion (21.1)
 *
 * SHALL NOT execute, schedule, assign engines, or modify Workflow / PipelineDefinition.
 */
export class WorkflowBuilder {
    private workflow_id = "";
    private workflow_name = "";
    private workflow_version = "";
    private metadata: WorkflowMetadata = {};
    private inputs: Record<string, WorkflowValue> = {};
    private outputs: Record<string, WorkflowValue> = {};
    private variables: Record<string, WorkflowValue> = {};
    private pipeline: WorkflowPipelineStep[] = [];
    private execution_policy: ExecutionPolicy = {};

    id(workflow_id: string): this {
        this.workflow_id = workflow_id;
        return this;
    }

    name(workflow_name: string): this {
        this.workflow_name = workflow_name;
        return this;
    }

    version(workflow_version: string): this {
        this.workflow_version = workflow_version;
        return this;
    }

    withMetadata(metadata: WorkflowMetadata): this {
        this.metadata = metadata;
        return this;
    }

    withInputs(inputs: Record<string, WorkflowValue>): this {
        this.inputs = { ...inputs };
        return this;
    }

    withOutputs(outputs: Record<string, WorkflowValue>): this {
        this.outputs = { ...outputs };
        return this;
    }

    withVariables(variables: Record<string, WorkflowValue>): this {
        this.variables = { ...variables };
        return this;
    }

    withExecutionPolicy(policy: ExecutionPolicy): this {
        this.execution_policy = { ...policy };
        return this;
    }

    addStep(step: WorkflowPipelineStep): this {
        this.pipeline.push({
            id: step.id,
            dependencies: [...step.dependencies],
            priority: step.priority,
            input: step.input
                ? {
                      type: step.input.type,
                      payload: step.input.payload,
                      metadata: step.input.metadata
                          ? { ...step.input.metadata }
                          : undefined,
                  }
                : undefined,
        });
        return this;
    }

    /** Apply Sequence pipeline semantics into flat steps with consecutive dependencies. */
    addSequence(steps: Array<Omit<WorkflowPipelineStep, "dependencies"> & { dependencies?: string[] }>): this {
        const ids = steps.map((s) => s.id);
        steps.forEach((s, i) => {
            const deps = i === 0 ? [...(s.dependencies ?? [])] : [ids[i - 1]];
            this.addStep({
                id: s.id,
                dependencies: deps,
                priority: s.priority,
                input: s.input,
            });
        });
        return this;
    }

    /** Apply Parallel pipeline semantics — no inter-step edges. */
    addParallel(steps: Array<Omit<WorkflowPipelineStep, "dependencies"> & { dependencies?: string[] }>): this {
        for (const s of steps) {
            this.addStep({
                id: s.id,
                dependencies: [...(s.dependencies ?? [])],
                priority: s.priority,
                input: s.input,
            });
        }
        return this;
    }

    /** Apply Branch semantics: condition → each branch (DAG only). */
    addBranch(
        condition: Omit<WorkflowPipelineStep, "dependencies"> & { dependencies?: string[] },
        branches: Array<Omit<WorkflowPipelineStep, "dependencies"> & { dependencies?: string[] }>
    ): this {
        this.addStep({
            id: condition.id,
            dependencies: [...(condition.dependencies ?? [])],
            priority: condition.priority,
            input: condition.input,
        });
        for (const b of branches) {
            this.addStep({
                id: b.id,
                dependencies: [condition.id],
                priority: b.priority,
                input: b.input,
            });
        }
        return this;
    }

    buildDefinition(): WorkflowDefinition {
        return {
            workflow_id: this.workflow_id,
            workflow_name: this.workflow_name,
            workflow_version: this.workflow_version,
            metadata: { ...this.metadata },
            inputs: { ...this.inputs },
            outputs: { ...this.outputs },
            variables: { ...this.variables },
            pipeline: this.pipeline.map((s) => ({
                id: s.id,
                dependencies: [...s.dependencies],
                priority: s.priority,
                input: s.input
                    ? {
                          type: s.input.type,
                          payload: s.input.payload,
                          metadata: s.input.metadata
                              ? { ...s.input.metadata }
                              : undefined,
                      }
                    : undefined,
            })),
            execution_policy: { ...this.execution_policy },
        };
    }

    /** Validate and return immutable Workflow. */
    build(): Workflow {
        return Workflow.validate(this.buildDefinition());
    }

    /**
     * 21.1 public conversion contract:
     * Input: Workflow (read-only)
     * Output: ExecutionGraph
     *
     * On failure: no partial graph; Workflow unchanged.
     */
    static buildExecutionGraph(workflow: Workflow): ExecutionGraph {
        const stateBefore = workflow.workflow_state;
        if (stateBefore !== "Immutable" && stateBefore !== "GraphBuilt" && stateBefore !== "Ready") {
            throw new WorkflowBuildError(
                `Workflow must be Immutable before WorkflowBuilder; state=${stateBefore}`
            );
        }

        try {
            // Treat Workflow / derived PipelineDefinition as read-only.
            const pipeline = PipelineDefinition.fromWorkflowSteps(workflow.pipeline);
            const steps = pipeline.steps;

            // Globally unique NodeIDs within one ExecutionGraph
            const ids = steps.map((s) => s.id);
            if (new Set(ids).size !== ids.length) {
                throw new WorkflowBuildError("Duplicate NodeIDs in ExecutionGraph");
            }

            // Exactly-once Step → Node
            const edges = EdgeFactory.fromPipeline(pipeline);
            const depMap = EdgeFactory.toDependencyMap(ids, edges);

            // Deterministic node order: sort by id for stable ExecutionGraph construction
            const orderedSteps = [...steps].sort((a, b) =>
                a.id < b.id ? -1 : a.id > b.id ? 1 : 0
            );

            const nodes = orderedSteps.map((step) =>
                NodeFactory.create(step, depMap.get(step.id) ?? [])
            );

            // Completeness: every step represented exactly once
            if (nodes.length !== steps.length) {
                throw new WorkflowBuildError("Incomplete StepDefinition conversion");
            }

            const graph = new ExecutionGraph(nodes);
            GraphValidator.validate(graph);

            Workflow.markGraphBuiltReady(workflow);
            return graph;
        } catch (err) {
            // SHALL NOT produce a partial ExecutionGraph; Workflow remains unchanged.
            if (workflow.workflow_state !== stateBefore) {
                // Should not happen — restore if somehow mutated.
                Workflow.restoreState(workflow, stateBefore);
            }
            if (err instanceof WorkflowBuildError) {
                throw err;
            }
            throw new WorkflowBuildError(err instanceof Error ? err.message : String(err));
        }
    }

    /** Build graph from an explicit PipelineDefinition (read-only). */
    static buildExecutionGraphFromPipeline(pipeline: PipelineDefinition): ExecutionGraph {
        // Read-only: do not mutate pipeline
        const steps = pipeline.steps;
        const ids = steps.map((s) => s.id);
        if (new Set(ids).size !== ids.length) {
            throw new WorkflowBuildError("Duplicate NodeIDs in ExecutionGraph");
        }
        const edges = EdgeFactory.fromPipeline(pipeline);
        const depMap = EdgeFactory.toDependencyMap(ids, edges);
        const orderedSteps = [...steps].sort((a, b) =>
            a.id < b.id ? -1 : a.id > b.id ? 1 : 0
        );
        const nodes = orderedSteps.map((step) =>
            NodeFactory.create(step, depMap.get(step.id) ?? [])
        );
        const graph = new ExecutionGraph(nodes);
        GraphValidator.validate(graph);
        return graph;
    }
}

// Re-export helpers used by fluent pipeline APIs
export { StepDefinition, PipelineDefinition };
