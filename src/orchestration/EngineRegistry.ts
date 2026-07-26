import { ExecutionEngine } from "../runtime_execution/ExecutionEngine";
import { NodeID } from "./types";

/**
 * Lookup service only: NodeID → ExecutionEngine.
 * SHALL NOT create engines, manage lifecycle, or participate in flow control.
 */
export class EngineRegistry {
    private readonly engines = new Map<NodeID, ExecutionEngine>();

    /**
     * Bind mapping during Orchestrator initialize.
     * Not orchestration flow control — registration of lookup entries only.
     */
    bind(nodeId: NodeID, engine: ExecutionEngine): void {
        if (this.engines.has(nodeId)) {
            throw new Error(`NodeID already bound: ${nodeId}`);
        }
        this.engines.set(nodeId, engine);
    }

    resolveEngine(nodeId: NodeID): ExecutionEngine {
        const engine = this.engines.get(nodeId);
        if (!engine) {
            throw new Error(`No ExecutionEngine registered for NodeID: ${nodeId}`);
        }
        return engine;
    }

    has(nodeId: NodeID): boolean {
        return this.engines.has(nodeId);
    }
}
