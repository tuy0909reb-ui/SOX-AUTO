import { ScheduledNodeQueue } from "./ScheduledNodeQueue";
import { NodeID } from "./types";

/**
 * Limits simultaneous execution according to ConcurrencyLimit.
 * SHALL NOT reorder nodes.
 * SHALL NOT modify EnginePool state.
 */
export class ConcurrencyPolicy {
    /**
     * Apply concurrency limit to an already-ordered node list.
     * Returns a prefix of the ordered list (no reordering).
     */
    apply(ordered: readonly NodeID[], concurrencyLimit: number): NodeID[] {
        if (concurrencyLimit === Number.POSITIVE_INFINITY) {
            return [...ordered];
        }
        if (!Number.isFinite(concurrencyLimit) || concurrencyLimit < 0) {
            throw new Error(`Invalid ConcurrencyLimit: ${concurrencyLimit}`);
        }
        const limit = Math.floor(concurrencyLimit);
        return ordered.slice(0, limit);
    }

    /**
     * Apply limit to a ScheduledNodeQueue without modifying the queue.
     * Returns a new queue containing the limited prefix.
     */
    applyToQueue(queue: ScheduledNodeQueue, concurrencyLimit: number): ScheduledNodeQueue {
        const limited = this.apply(queue.toArray(), concurrencyLimit);
        return ScheduledNodeQueue.from(limited);
    }
}
