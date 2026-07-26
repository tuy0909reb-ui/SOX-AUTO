import { ExecutionGraph, ExecutionGraphNode } from "./ExecutionGraph";
import { RuntimePlan } from "./types";

/**
 * Pure function: RuntimePlan → ExecutionGraph (deterministic, not necessarily injective).
 */
export class GraphBuilder {
    static build(plan: RuntimePlan): ExecutionGraph {
        const nodes: ExecutionGraphNode[] = plan.nodes.map((n) => ({
            id: n.id,
            dependencies: [...n.dependencies],
            input: {
                type: n.input?.type ?? "default",
                payload: n.input?.payload ?? null,
                metadata: { ...(n.input?.metadata ?? {}) },
            },
        }));
        // Deterministic order: sort by id for stable construction.
        nodes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
        return new ExecutionGraph(nodes);
    }
}
