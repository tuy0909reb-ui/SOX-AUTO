import { StepDefinition } from "./StepDefinition";
import { WorkflowPipelineStep } from "./WorkflowDefinition";
import { WorkflowBuildError } from "./WorkflowBuildError";

export type PipelineKind = "sequence" | "parallel" | "branch" | "dependency_graph";

export interface PipelineEdge {
    readonly from: string;
    readonly to: string;
}

/**
 * Read-only pipeline structure. Expanded deterministically into steps + edges.
 * Edges are generated solely from PipelineDefinition semantics.
 */
export class PipelineDefinition {
    readonly kind: PipelineKind;
    readonly steps: readonly StepDefinition[];
    /** Precomputed semantic edges (immutable). */
    readonly edges: readonly PipelineEdge[];

    private constructor(
        kind: PipelineKind,
        steps: readonly StepDefinition[],
        edges: readonly PipelineEdge[]
    ) {
        this.kind = kind;
        this.steps = Object.freeze([...steps]);
        this.edges = Object.freeze(edges.map((e) => Object.freeze({ ...e })));
        Object.freeze(this);
    }

    /** Sequence: A→B→C */
    static sequence(steps: StepDefinition[]): PipelineDefinition {
        PipelineDefinition.assertUniqueSteps(steps);
        const edges: PipelineEdge[] = [];
        for (let i = 0; i < steps.length - 1; i++) {
            edges.push({ from: steps[i].id, to: steps[i + 1].id });
        }
        return new PipelineDefinition("sequence", steps, edges);
    }

    /** Parallel: no dependency edges */
    static parallel(steps: StepDefinition[]): PipelineDefinition {
        PipelineDefinition.assertUniqueSteps(steps);
        return new PipelineDefinition("parallel", steps, []);
    }

    /** Branch: Cond→A, Cond→B (execution meaning not implemented) */
    static branch(condition: StepDefinition, branches: StepDefinition[]): PipelineDefinition {
        if (branches.length === 0) {
            throw new WorkflowBuildError("Branch requires at least one branch step");
        }
        const steps = [condition, ...branches];
        PipelineDefinition.assertUniqueSteps(steps);
        const edges = branches.map((b) => ({ from: condition.id, to: b.id }));
        return new PipelineDefinition("branch", steps, edges);
    }

    /**
     * Derive PipelineDefinition from 21.0 flat Workflow pipeline steps.
     * Edges come solely from step.dependencies semantics (dep → step).
     */
    static fromWorkflowSteps(steps: readonly WorkflowPipelineStep[]): PipelineDefinition {
        if (steps.length === 0) {
            throw new WorkflowBuildError("PipelineDefinition requires at least one step");
        }
        const defs = steps.map((s) =>
            StepDefinition.create({
                id: s.id,
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
            })
        );
        PipelineDefinition.assertUniqueSteps(defs);

        const idSet = new Set(defs.map((d) => d.id));
        const edges: PipelineEdge[] = [];
        // Deterministic: sort steps by id when emitting edges for stability across equal structures.
        const ordered = [...steps].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        for (const s of ordered) {
            const deps = [...s.dependencies].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            for (const dep of deps) {
                if (!idSet.has(dep)) {
                    throw new WorkflowBuildError(
                        `Pipeline edge references unknown dependency ${dep} for step ${s.id}`
                    );
                }
                edges.push({ from: dep, to: s.id });
            }
        }
        // Stable edge order
        edges.sort((a, b) => {
            if (a.from !== b.from) return a.from < b.from ? -1 : 1;
            return a.to < b.to ? -1 : a.to > b.to ? 1 : 0;
        });

        return new PipelineDefinition("dependency_graph", defs, edges);
    }

    private static assertUniqueSteps(steps: StepDefinition[]): void {
        const seen = new Set<string>();
        for (const s of steps) {
            if (seen.has(s.id)) {
                throw new WorkflowBuildError(`Duplicate StepDefinition id in pipeline: ${s.id}`);
            }
            seen.add(s.id);
        }
    }
}
