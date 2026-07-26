import { ExecutionGraph } from "./ExecutionGraph";
import { NodeID } from "./types";

export class GraphValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GraphValidationError";
    }
}

/**
 * Non-mutating validator. SHALL NOT mutate ExecutionGraph.
 */
export class GraphValidator {
    static validate(graph: ExecutionGraph): void {
        const ids = new Set<NodeID>();
        for (const id of graph.nodeIds) {
            if (ids.has(id)) {
                throw new GraphValidationError(`Duplicate node id: ${id}`);
            }
            ids.add(id);
        }

        if (graph.size === 0) {
            throw new GraphValidationError("ExecutionGraph has no entrypoint (empty graph)");
        }

        for (const id of graph.nodeIds) {
            const node = graph.getNode(id)!;
            for (const dep of node.dependencies) {
                if (!ids.has(dep)) {
                    throw new GraphValidationError(`Unknown dependency ${dep} on node ${id}`);
                }
            }
        }

        // Cycle detection via DFS (white/gray/black).
        const WHITE = 0;
        const GRAY = 1;
        const BLACK = 2;
        const color = new Map<NodeID, number>();
        for (const id of graph.nodeIds) {
            color.set(id, WHITE);
        }

        const visit = (id: NodeID): void => {
            color.set(id, GRAY);
            const node = graph.getNode(id)!;
            for (const dep of node.dependencies) {
                const c = color.get(dep)!;
                if (c === GRAY) {
                    throw new GraphValidationError(`Cycle detected involving ${id} → ${dep}`);
                }
                if (c === WHITE) {
                    visit(dep);
                }
            }
            color.set(id, BLACK);
        };

        for (const id of graph.nodeIds) {
            if (color.get(id) === WHITE) {
                visit(id);
            }
        }

        // Entry points: nodes with zero dependencies.
        const entrypoints = graph.nodeIds.filter(
            (id) => graph.getNode(id)!.dependencies.length === 0
        );
        if (entrypoints.length === 0) {
            throw new GraphValidationError("No entrypoint node (all nodes have dependencies)");
        }

        // Reachability from entrypoints along reverse-deps (downstream).
        // Build adjacency: dep → dependents
        const dependents = new Map<NodeID, NodeID[]>();
        for (const id of graph.nodeIds) {
            dependents.set(id, []);
        }
        for (const id of graph.nodeIds) {
            for (const dep of graph.getNode(id)!.dependencies) {
                dependents.get(dep)!.push(id);
            }
        }
        const reachable = new Set<NodeID>();
        const queue = [...entrypoints];
        while (queue.length > 0) {
            const cur = queue.shift()!;
            if (reachable.has(cur)) continue;
            reachable.add(cur);
            for (const next of dependents.get(cur) ?? []) {
                queue.push(next);
            }
        }
        for (const id of graph.nodeIds) {
            if (!reachable.has(id)) {
                throw new GraphValidationError(`Disconnected or unreachable node: ${id}`);
            }
        }
    }
}
