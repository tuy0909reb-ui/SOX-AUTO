import { ExecutionGraph } from "./ExecutionGraph";
import { NodeID } from "./types";

export class DependencyValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DependencyValidationError";
    }
}

/**
 * Validates dependency constraints within ExecutableNodeSet.
 * SHALL NOT generate ExecutableNodeSet.
 * SHALL NOT modify ExecutionGraph.
 */
export class DependencyResolver {
    /**
     * Validate that every node in executable has all graph dependencies satisfied
     * by the immutable CompletedNodeSet view. Assists ordering via topological order.
     */
    validate(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        completed: ReadonlySet<NodeID>
    ): void {
        for (const id of executable) {
            const node = graph.getNode(id);
            if (!node) {
                throw new DependencyValidationError(`Unknown node in ExecutableNodeSet: ${id}`);
            }
            for (const dep of node.dependencies) {
                if (!completed.has(dep)) {
                    throw new DependencyValidationError(
                        `Dependency not satisfied for ${id}: missing ${dep}`
                    );
                }
            }
        }
    }

    /**
     * Assist Scheduler ordering: topological order among executable nodes.
     * Nodes with no relative edges keep NodeID ascending among equals.
     * Does not generate ExecutableNodeSet — only orders the given set.
     */
    topologicalOrder(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph
    ): NodeID[] {
        const ids = [...executable];
        // Kahn among subgraph induced by executable (edges only between executable members).
        const indeg = new Map<NodeID, number>();
        const adj = new Map<NodeID, NodeID[]>();
        for (const id of ids) {
            indeg.set(id, 0);
            adj.set(id, []);
        }
        for (const id of ids) {
            const node = graph.getNode(id)!;
            for (const dep of node.dependencies) {
                if (executable.has(dep)) {
                    // edge dep → id
                    adj.get(dep)!.push(id);
                    indeg.set(id, (indeg.get(id) ?? 0) + 1);
                }
            }
        }

        const ready = ids.filter((id) => indeg.get(id) === 0).sort(compareNodeId);
        const ordered: NodeID[] = [];
        while (ready.length > 0) {
            const cur = ready.shift()!;
            ordered.push(cur);
            for (const next of (adj.get(cur) ?? []).slice().sort(compareNodeId)) {
                const d = (indeg.get(next) ?? 0) - 1;
                indeg.set(next, d);
                if (d === 0) {
                    ready.push(next);
                    ready.sort(compareNodeId);
                }
            }
        }

        if (ordered.length !== ids.length) {
            throw new DependencyValidationError(
                "Cycle detected among ExecutableNodeSet (invalid for scheduling)"
            );
        }
        return ordered;
    }
}

function compareNodeId(a: NodeID, b: NodeID): number {
    return a < b ? -1 : a > b ? 1 : 0;
}
