import { EnginePool } from "./EnginePool";
import { ScheduledNodeQueue } from "./ScheduledNodeQueue";
import { NodeID } from "./types";

export interface DispatchAssignment {
    readonly nodeId: NodeID;
}

export interface DispatchStrategyConfig {
    /** Tie-break: ascending NodeID (default). */
    readonly tieBreak?: "nodeIdAsc";
    /** Max assignments per planning call. */
    readonly maxAssignments?: number;
}

/**
 * Determines engine assignment decisions only.
 * DispatchStrategy SHALL NOT modify ExecutionGraph.
 * DispatchStrategy SHALL NOT modify node priority.
 * SHALL NOT retain assignment state after planning.
 * DispatchStrategy SHALL consume ScheduledNodeQueue without modifying it.
 */
export interface DispatchStrategy {
    plan(
        executable: ReadonlySet<NodeID>,
        pool: EnginePool,
        config?: DispatchStrategyConfig
    ): readonly DispatchAssignment[];

    /** 20.9.3: consume ScheduledNodeQueue order without mutating the queue. */
    planFromQueue?(
        queue: ScheduledNodeQueue,
        pool: EnginePool,
        config?: DispatchStrategyConfig
    ): readonly DispatchAssignment[];
}

/**
 * Deterministic default strategy (DET-001).
 */
export class DefaultDispatchStrategy implements DispatchStrategy {
    plan(
        executable: ReadonlySet<NodeID>,
        pool: EnginePool,
        config?: DispatchStrategyConfig
    ): readonly DispatchAssignment[] {
        const tieBreak = config?.tieBreak ?? "nodeIdAsc";
        const max = config?.maxAssignments ?? Number.POSITIVE_INFINITY;

        let ordered = [...executable];
        if (tieBreak === "nodeIdAsc") {
            ordered.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        }

        return this.assign(ordered, pool, max);
    }

    /**
     * Consume ScheduledNodeQueue without modifying it.
     * Preserves queue order; filters by pool availability.
     */
    planFromQueue(
        queue: ScheduledNodeQueue,
        pool: EnginePool,
        config?: DispatchStrategyConfig
    ): readonly DispatchAssignment[] {
        const max = config?.maxAssignments ?? Number.POSITIVE_INFINITY;
        // Read-only consumption of queue order.
        return this.assign(queue.toArray(), pool, max);
    }

    private assign(
        ordered: readonly NodeID[],
        pool: EnginePool,
        max: number
    ): readonly DispatchAssignment[] {
        const assignments: DispatchAssignment[] = [];
        for (const nodeId of ordered) {
            if (assignments.length >= max) break;
            if (pool.canAcquire(nodeId)) {
                assignments.push({ nodeId });
            }
        }
        return assignments;
    }
}
