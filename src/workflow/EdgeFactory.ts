import { PipelineDefinition, PipelineEdge } from "./PipelineDefinition";

/**
 * Generates edges solely from PipelineDefinition semantics.
 * SHALL NOT inspect EnginePool / Scheduler / runtime state.
 */
export class EdgeFactory {
    /**
     * Expand PipelineDefinition into edge list (deterministic order already on PipelineDefinition).
     */
    static fromPipeline(pipeline: PipelineDefinition): readonly PipelineEdge[] {
        // Read-only consumption — return frozen copy of semantic edges.
        return pipeline.edges;
    }

    /**
     * Build dependency lists per node from edges (edge from→to means to depends on from).
     */
    static toDependencyMap(
        nodeIds: readonly string[],
        edges: readonly PipelineEdge[]
    ): ReadonlyMap<string, readonly string[]> {
        const map = new Map<string, string[]>();
        for (const id of nodeIds) {
            map.set(id, []);
        }
        for (const e of edges) {
            const deps = map.get(e.to);
            if (!deps) {
                continue;
            }
            if (!deps.includes(e.from)) {
                deps.push(e.from);
            }
        }
        // Deterministic dependency order per node
        for (const id of nodeIds) {
            const deps = map.get(id)!;
            deps.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            map.set(id, deps);
        }
        return map;
    }
}
