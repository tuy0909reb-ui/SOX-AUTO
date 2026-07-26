import { NodeID } from "./types";

export interface ExecutionGraphNode {
    readonly id: NodeID;
    readonly dependencies: readonly NodeID[];
    readonly input: Readonly<{
        type: string;
        payload: unknown;
        metadata: Readonly<Record<string, unknown>>;
    }>;
}

/**
 * Immutable Directed Acyclic Graph (20.9.0 FC-GRAPH-IMM).
 * Construction freezes the graph and all contained nodes/edges.
 */
export class ExecutionGraph {
    readonly nodes: ReadonlyMap<NodeID, ExecutionGraphNode>;
    readonly nodeIds: readonly NodeID[];

    constructor(nodes: Iterable<ExecutionGraphNode>) {
        const map = new Map<NodeID, ExecutionGraphNode>();
        for (const node of nodes) {
            const frozen: ExecutionGraphNode = Object.freeze({
                id: node.id,
                dependencies: Object.freeze([...node.dependencies]),
                input: Object.freeze({
                    type: node.input.type,
                    payload: node.input.payload,
                    metadata: Object.freeze({ ...node.input.metadata }),
                }),
            });
            map.set(frozen.id, frozen);
        }
        this.nodes = Object.freeze(map) as ReadonlyMap<NodeID, ExecutionGraphNode>;
        this.nodeIds = Object.freeze([...map.keys()]);
        Object.freeze(this);
    }

    get size(): number {
        return this.nodeIds.length;
    }

    getNode(id: NodeID): ExecutionGraphNode | undefined {
        return this.nodes.get(id);
    }
}
