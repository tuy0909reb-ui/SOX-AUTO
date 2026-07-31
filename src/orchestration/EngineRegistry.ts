import { ExecutionEngine } from "../runtime_execution/ExecutionEngine";
import { EngineDefinition } from "./EngineDefinition";
import { NodeID } from "./types";

/**
 * Owns engine definitions and metadata only (20.9.2).
 * SHALL NOT own runtime engine instances.
 */
export class EngineRegistry {
    private readonly definitions = new Map<NodeID, EngineDefinition>();

    registerDefinition(definition: EngineDefinition): void {
        if (this.definitions.has(definition.nodeId)) {
            throw new Error(`Definition already registered for NodeID: ${definition.nodeId}`);
        }
        this.definitions.set(definition.nodeId, {
            nodeId: definition.nodeId,
            metadata: Object.freeze({ ...definition.metadata }),
            create: definition.create,
        });
    }

    resolveDefinition(nodeId: NodeID): EngineDefinition {
        const def = this.definitions.get(nodeId);
        if (!def) {
            throw new Error(`No EngineDefinition registered for NodeID: ${nodeId}`);
        }
        return def;
    }

    has(nodeId: NodeID): boolean {
        return this.definitions.has(nodeId);
    }

    /**
     * Compatibility helper (20.9.1 call sites): register a definition whose factory
     * produces engines. Does not store the runtime instance in the registry.
     */
    bind(nodeId: NodeID, engineOrFactory: ExecutionEngine | (() => ExecutionEngine)): void {
        const create =
            typeof engineOrFactory === "function"
                ? (engineOrFactory as () => ExecutionEngine)
                : () => engineOrFactory;
        this.registerDefinition({
            nodeId,
            metadata: {},
            create,
        });
    }

    /**
     * @deprecated 20.9.2 — runtime instances are owned by EnginePool.
     * Retained only for definition existence checks in legacy tests; does not return a pooled instance.
     */
    resolveEngine(nodeId: NodeID): ExecutionEngine {
        // Create a throwaway instance for legacy callers that still invoke resolveEngine.
        // Orchestration dispatch path MUST use EnginePool.acquire instead.
        return this.resolveDefinition(nodeId).create();
    }
}
