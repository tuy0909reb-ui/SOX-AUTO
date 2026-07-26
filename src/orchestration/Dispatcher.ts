import { ExecutionGraph } from "./ExecutionGraph";
import { NodeID } from "./types";

/**
 * Selects executable nodes. SHALL NOT modify ExecutionGraph.
 */
export class Dispatcher {
    selectExecutableNodes(
        completedNodeSet: ReadonlySet<NodeID>,
        graph: ExecutionGraph
    ): ReadonlySet<NodeID> {
        const executable = new Set<NodeID>();
        for (const id of graph.nodeIds) {
            if (completedNodeSet.has(id)) {
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
