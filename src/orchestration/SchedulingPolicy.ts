import { DependencyResolver } from "./DependencyResolver";
import { ExecutionGraph } from "./ExecutionGraph";
import { PriorityMap, PriorityResolver } from "./PriorityResolver";
import { NodeID } from "./types";

/**
 * Ordering rules applied by Scheduler.
 * SHALL NOT modify node priority values.
 * SHALL NOT inspect EnginePool state.
 * Deterministic; tie-break deterministic.
 */
export interface SchedulingPolicy {
    readonly kind: "fifo" | "priority";
    order(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        dependencyResolver: DependencyResolver,
        priorities: PriorityMap
    ): NodeID[];
}

/**
 * FIFO: topological order among executable, NodeID ascending within ready set (via DependencyResolver).
 */
export class FifoSchedulingPolicy implements SchedulingPolicy {
    readonly kind = "fifo" as const;

    order(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        dependencyResolver: DependencyResolver,
        _priorities: PriorityMap
    ): NodeID[] {
        void _priorities;
        return dependencyResolver.topologicalOrder(executable, graph);
    }
}

/**
 * Priority: PriorityResolver over topological base order.
 */
export class PrioritySchedulingPolicy implements SchedulingPolicy {
    readonly kind = "priority" as const;
    private readonly priorityResolver = new PriorityResolver();

    order(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        dependencyResolver: DependencyResolver,
        priorities: PriorityMap
    ): NodeID[] {
        const topo = dependencyResolver.topologicalOrder(executable, graph);
        return this.priorityResolver.orderByPriority(topo, priorities);
    }
}
