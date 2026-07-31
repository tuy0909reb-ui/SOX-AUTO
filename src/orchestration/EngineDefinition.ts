import { ExecutionEngine } from "../runtime_execution/ExecutionEngine";
import { NodeID } from "./types";

/**
 * Engine definition / metadata owned by EngineRegistry (20.9.2).
 * Runtime instances are owned exclusively by EnginePool.
 */
export interface EngineDefinition {
    readonly nodeId: NodeID;
    readonly metadata: Readonly<Record<string, unknown>>;
    /** Factory consulted by EnginePool when creating a runtime instance. */
    create(): ExecutionEngine;
}
