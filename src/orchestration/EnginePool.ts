import { ExecutionEngine } from "../runtime_execution/ExecutionEngine";
import { EngineRegistry } from "./EngineRegistry";
import { NodeID } from "./types";

export type EngineAvailability = "Available" | "Busy" | "Offline" | "Disposed";

export interface EngineHandle {
    readonly instanceId: string;
    readonly nodeId: NodeID;
    readonly engine: ExecutionEngine;
}

export type AcquireFailureReason =
    | "NO_DEFINITION"
    | "NONE_AVAILABLE"
    | "ALREADY_BUSY"
    | "OFFLINE"
    | "DISPOSED"
    | "EXHAUSTED";

export interface AcquireFailure {
    readonly ok: false;
    readonly nodeId: NodeID;
    readonly reason: AcquireFailureReason;
    readonly message: string;
}

export interface AcquireSuccess {
    readonly ok: true;
    readonly handle: EngineHandle;
}

export type AcquireResult = AcquireSuccess | AcquireFailure;

export type ReleaseResult =
    | { ok: true; state: EngineAvailability }
    | { ok: false; state: EngineAvailability; message: string };

interface EngineSlot {
    instanceId: string;
    nodeId: NodeID;
    engine: ExecutionEngine;
    state: EngineAvailability;
}

/**
 * Owns runtime engine instances and availability only.
 * SHALL NOT participate in orchestration flow control or modify ExecutionGraph.
 * SHALL NOT own engine definitions (consults EngineRegistry on create).
 */
export class EnginePool {
    private readonly slots: EngineSlot[] = [];
    private seq = 0;
    /** Max runtime instances per NodeID definition (default 1). */
    private readonly maxPerNode: number;

    constructor(
        private readonly registry: EngineRegistry,
        options?: { maxPerNode?: number }
    ) {
        this.maxPerNode = options?.maxPerNode ?? 1;
    }

    /** Read-only snapshot for DispatchStrategy (DET-001 inputs). */
    snapshot(): ReadonlyArray<{
        instanceId: string;
        nodeId: NodeID;
        state: EngineAvailability;
    }> {
        return this.slots.map((s) => ({
            instanceId: s.instanceId,
            nodeId: s.nodeId,
            state: s.state,
        }));
    }

    canAcquire(nodeId: NodeID): boolean {
        if (!this.registry.has(nodeId)) return false;
        const forNode = this.slots.filter((s) => s.nodeId === nodeId);
        if (forNode.some((s) => s.state === "Available")) return true;
        if (forNode.some((s) => s.state === "Busy")) return false;
        if (forNode.some((s) => s.state === "Offline")) return false;
        if (forNode.every((s) => s.state === "Disposed") && forNode.length > 0) return false;
        return forNode.length < this.maxPerNode;
    }

    /**
     * Acquire — Available → Busy (Coordinator-requested).
     * Concurrent acquire of the same instance yields at most one success.
     */
    acquire(nodeId: NodeID): AcquireResult {
        if (!this.registry.has(nodeId)) {
            return {
                ok: false,
                nodeId,
                reason: "NO_DEFINITION",
                message: `No definition for ${nodeId}`,
            };
        }

        const forNode = this.slots.filter((s) => s.nodeId === nodeId);
        if (forNode.length > 0 && forNode.every((s) => s.state === "Disposed")) {
            return {
                ok: false,
                nodeId,
                reason: "DISPOSED",
                message: `All engines disposed for ${nodeId}`,
            };
        }

        let slot = this.slots.find((s) => s.nodeId === nodeId && s.state === "Available");
        if (!slot) {
            const busy = this.slots.find((s) => s.nodeId === nodeId && s.state === "Busy");
            if (busy) {
                return {
                    ok: false,
                    nodeId,
                    reason: "ALREADY_BUSY",
                    message: `Engine busy for ${nodeId}`,
                };
            }
            const offline = this.slots.find((s) => s.nodeId === nodeId && s.state === "Offline");
            if (offline) {
                return {
                    ok: false,
                    nodeId,
                    reason: "OFFLINE",
                    message: `Engine offline for ${nodeId}`,
                };
            }
            const activeCount = this.slots.filter(
                (s) => s.nodeId === nodeId && s.state !== "Disposed"
            ).length;
            if (activeCount >= this.maxPerNode) {
                return {
                    ok: false,
                    nodeId,
                    reason: "EXHAUSTED",
                    message: `Pool exhausted for ${nodeId}`,
                };
            }

            // Create via Registry definition — Pool does not own definitions.
            try {
                const def = this.registry.resolveDefinition(nodeId);
                const engine = def.create();
                slot = {
                    instanceId: `eng-${nodeId}-${this.seq++}`,
                    nodeId,
                    engine,
                    state: "Available",
                };
                this.slots.push(slot);
            } catch (err) {
                return {
                    ok: false,
                    nodeId,
                    reason: "NO_DEFINITION",
                    message:
                        err instanceof Error
                            ? `Engine create failed: ${err.message}`
                            : "Engine create failed",
                };
            }
        }

        if (slot.state !== "Available") {
            return {
                ok: false,
                nodeId,
                reason: "NONE_AVAILABLE",
                message: `No available engine for ${nodeId}`,
            };
        }

        // Available → Busy (requested by Coordinator)
        slot.state = "Busy";
        return {
            ok: true,
            handle: {
                instanceId: slot.instanceId,
                nodeId: slot.nodeId,
                engine: slot.engine,
            },
        };
    }

    /**
     * Release — Busy → Available on success.
     * On failure EnginePool may transition Busy → Offline (or Disposed via dispose).
     */
    release(handle: EngineHandle, options?: { failure?: boolean }): ReleaseResult {
        const slot = this.slots.find((s) => s.instanceId === handle.instanceId);
        if (!slot) {
            return { ok: false, state: "Disposed", message: "Unknown engine handle" };
        }
        if (slot.state === "Disposed") {
            return { ok: false, state: "Disposed", message: "Engine already disposed" };
        }
        if (slot.state !== "Busy") {
            return { ok: false, state: slot.state, message: `Release requires Busy; was ${slot.state}` };
        }

        if (options?.failure) {
            // Busy → Offline (EnginePool-owned)
            slot.state = "Offline";
            return { ok: false, state: "Offline", message: "Released with failure → Offline" };
        }

        slot.state = "Available";
        return { ok: true, state: "Available" };
    }

    /** Offline → Available (EnginePool-owned recovery). */
    recover(instanceId: string): boolean {
        const slot = this.slots.find((s) => s.instanceId === instanceId);
        if (!slot || slot.state !== "Offline") return false;
        slot.state = "Available";
        return true;
    }

    /** Any → Disposed (terminal, EnginePool-owned). */
    dispose(instanceId: string): void {
        const slot = this.slots.find((s) => s.instanceId === instanceId);
        if (!slot) return;
        slot.state = "Disposed";
    }

    getState(instanceId: string): EngineAvailability | undefined {
        return this.slots.find((s) => s.instanceId === instanceId)?.state;
    }
}
