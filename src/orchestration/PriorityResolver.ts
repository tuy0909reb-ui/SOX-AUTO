import { NodeID } from "./types";

export type PriorityMap = ReadonlyMap<NodeID, number>;

/**
 * Applies stable priority ordering.
 * SHALL NOT modify priority values.
 * SHALL preserve topological order for nodes with equal priority.
 */
export class PriorityResolver {
    /**
     * @param topoOrder topological order among candidates (equal-priority stability basis)
     * @param priorities read-only priority map (higher schedules earlier)
     */
    orderByPriority(topoOrder: readonly NodeID[], priorities: PriorityMap): NodeID[] {
        const topoIndex = new Map<NodeID, number>();
        topoOrder.forEach((id, i) => topoIndex.set(id, i));

        return [...topoOrder].sort((a, b) => {
            const pa = priorities.get(a) ?? 0;
            const pb = priorities.get(b) ?? 0;
            if (pa !== pb) {
                // Higher priority first
                return pb - pa;
            }
            // Equal priority: preserve topological order
            return (topoIndex.get(a) ?? 0) - (topoIndex.get(b) ?? 0);
        });
    }
}
