import { ExecutionGraph } from "./ExecutionGraph";
import { OrchestrationContext } from "./OrchestrationContext";
import { NodeID } from "./types";

/**
 * Retrieves ExecutableNodeSet.
 * SHALL NOT perform dependency resolution.
 * SHALL NOT determine execution order.
 */
export class Dispatcher {
    /**
     * 20.9.3: retrieve ExecutableNodeSet using OrchestrationContext completed nodes.
     */
    retrieveExecutableNodeSet(
        context: OrchestrationContext,
        graph: ExecutionGraph,
        alreadyDispatched?: ReadonlySet<NodeID>
    ): ReadonlySet<NodeID> {
        const completed = new Set<NodeID>(context.completedNodes);
        return this.selectExecutableNodes(completed, graph, alreadyDispatched);
    }

    /**
     * Select executable nodes from completed set + graph.
     * Dependency resolution / ordering are out of scope (Scheduler owns those).
     */
    selectExecutableNodes(
        completedNodeSet: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        alreadyDispatched?: ReadonlySet<NodeID>
    ): ReadonlySet<NodeID> {
        const executable = new Set<NodeID>();
        for (const id of graph.nodeIds) {
            if (completedNodeSet.has(id)) {
                continue;
            }
            if (alreadyDispatched?.has(id)) {
                continue;
            }
            const node = graph.getNode(id)!;
            const depsSatisfied = node.dependencies.every((dep) => completedNodeSet.has(dep));
            if (depsSatisfied) {
                executable.add(id);
            }
        }
        return executable;
    }
}
