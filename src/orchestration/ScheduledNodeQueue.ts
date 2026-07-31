import { NodeID } from "./types";

/**
 * Immutable, ordered, read-only, deterministic queue of NodeIDs.
 * Each NodeID SHALL appear at most once.
 */
export class ScheduledNodeQueue {
    private readonly nodes: readonly NodeID[];

    private constructor(nodes: readonly NodeID[]) {
        this.nodes = Object.freeze([...nodes]);
        Object.freeze(this);
    }

    /**
     * Build a queue. Rejects duplicate NodeIDs.
     */
    static from(ordered: readonly NodeID[]): ScheduledNodeQueue {
        const seen = new Set<NodeID>();
        for (const id of ordered) {
            if (seen.has(id)) {
                throw new Error(`Duplicate NodeID in ScheduledNodeQueue: ${id}`);
            }
            seen.add(id);
        }
        return new ScheduledNodeQueue(ordered);
    }

    get size(): number {
        return this.nodes.length;
    }

    /** Read-only ordered view. */
    toArray(): readonly NodeID[] {
        return this.nodes;
    }

    [Symbol.iterator](): Iterator<NodeID> {
        return this.nodes[Symbol.iterator]();
    }
}
