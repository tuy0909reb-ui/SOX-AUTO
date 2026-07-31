import { DefaultExecutionContext } from "../runtime_execution/ExecutionContext";
import { ExecutionEngine } from "../runtime_execution/ExecutionEngine";
import { ExecutionLayerInput } from "../runtime_execution/ExecutionLayerInput";
import { DefaultDispatchStrategy, DispatchStrategy } from "./DispatchStrategy";
import { Dispatcher } from "./Dispatcher";
import { EngineHandle, EnginePool } from "./EnginePool";
import { EngineRegistry } from "./EngineRegistry";
import { ExecutionGraph } from "./ExecutionGraph";
import { ResultCollector } from "./ResultCollector";
import { ScheduledNodeQueue } from "./ScheduledNodeQueue";
import { EngineOutcome, NodeID } from "./types";

export interface NodeEngineAssignment {
    readonly nodeId: NodeID;
    readonly handle: EngineHandle;
}

/**
 * ExecutionCoordinator (20.9.2 / 20.9.3):
 * - acquires / releases via EnginePool
 * - owns assignment state and logical execution queue
 * - consumes ScheduledNodeQueue via DispatchStrategy (20.9.3)
 * - SHALL NOT create Engine instances
 */
export class ExecutionCoordinator {
    private readonly dispatched = new Set<NodeID>();
    private readonly assignments = new Map<NodeID, EngineHandle>();
    private readonly executionQueue: NodeID[] = [];
    private acquireStopped = false;

    constructor(
        private readonly dispatcher: Dispatcher,
        private readonly resultCollector: ResultCollector,
        private readonly graph: ExecutionGraph,
        private readonly pool?: EnginePool,
        private readonly strategy: DispatchStrategy = new DefaultDispatchStrategy()
    ) {}

    getDispatchedNodes(): ReadonlySet<NodeID> {
        return this.dispatched;
    }

    getAssignments(): ReadonlyMap<NodeID, EngineHandle> {
        return this.assignments;
    }

    getLogicalQueue(): readonly NodeID[] {
        return this.executionQueue;
    }

    stopAcquire(): void {
        this.acquireStopped = true;
    }

    isAcquireStopped(): boolean {
        return this.acquireStopped;
    }

    selectExecutable(completed: ReadonlySet<NodeID>): ReadonlySet<NodeID> {
        return this.dispatcher.selectExecutableNodes(
            completed,
            this.graph,
            this.dispatched
        );
    }

    /**
     * 20.9.3: dispatch from ScheduledNodeQueue (consumed read-only by strategy).
     */
    dispatchQueue(queue: ScheduledNodeQueue, registry: EngineRegistry): EngineOutcome[] {
        if (!this.pool) {
            return this.dispatch(new Set(queue.toArray()), registry);
        }

        const outcomes: EngineOutcome[] = [];
        const pool = this.pool;

        this.executionQueue.length = 0;
        for (const id of queue.toArray()) {
            if (!this.dispatched.has(id)) {
                this.executionQueue.push(id);
            }
        }

        const plan =
            this.strategy.planFromQueue?.(queue, pool) ??
            this.strategy.plan(new Set(queue.toArray()), pool);

        return this.executePlan(plan, outcomes);
    }

    /**
     * 20.9.2 dispatch loop step (compat): strategy → acquire → dispatch → release.
     */
    dispatch(nodes: ReadonlySet<NodeID>, registry: EngineRegistry): EngineOutcome[] {
        if (this.pool) {
            return this.dispatchWithPool(nodes);
        }
        return this.dispatchLegacy(nodes, registry);
    }

    private dispatchWithPool(nodes: ReadonlySet<NodeID>): EngineOutcome[] {
        const outcomes: EngineOutcome[] = [];
        const pool = this.pool!;

        this.executionQueue.length = 0;
        const ordered = [...nodes].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        for (const id of ordered) {
            if (!this.dispatched.has(id)) {
                this.executionQueue.push(id);
            }
        }

        const executable = new Set(this.executionQueue);
        const plan = this.strategy.plan(executable, pool);
        return this.executePlan(plan, outcomes);
    }

    private executePlan(
        plan: readonly { nodeId: NodeID }[],
        outcomes: EngineOutcome[]
    ): EngineOutcome[] {
        const pool = this.pool!;
        for (const assignment of plan) {
            if (this.acquireStopped) {
                break;
            }
            if (this.dispatched.has(assignment.nodeId)) {
                continue;
            }

            const acquired = pool.acquire(assignment.nodeId);
            if (!acquired.ok) {
                if (
                    acquired.reason === "NONE_AVAILABLE" ||
                    acquired.reason === "ALREADY_BUSY" ||
                    acquired.reason === "EXHAUSTED"
                ) {
                    continue;
                }
                const outcome: EngineOutcome = {
                    nodeId: assignment.nodeId,
                    error: new Error(`AcquireFailure: ${acquired.reason} — ${acquired.message}`),
                };
                this.resultCollector.collect(outcome);
                outcomes.push(outcome);
                if (this.resultCollector.getLastDecision() === "TERMINATE") {
                    this.stopAcquire();
                    break;
                }
                continue;
            }

            const handle = acquired.handle;
            this.assignments.set(assignment.nodeId, handle);
            this.dispatched.add(assignment.nodeId);

            const outcome = this.dispatchNode(assignment.nodeId, handle.engine);
            outcomes.push(outcome);
            this.resultCollector.collect(outcome);

            const releaseFailure = outcome.error != null;
            pool.release(handle, { failure: releaseFailure });
            this.assignments.delete(assignment.nodeId);

            if (this.resultCollector.getLastDecision() === "TERMINATE") {
                this.stopAcquire();
                break;
            }
        }
        return outcomes;
    }

    /**
     * Dispatch a single node.
     * Runtime Execution Layer (20.8) owns execution semantics.
     */
    dispatchNode(nodeId: NodeID, engine: ExecutionEngine): EngineOutcome {
        const node = this.graph.getNode(nodeId);
        if (!node) {
            return { nodeId, error: new Error(`Unknown node in graph: ${nodeId}`) };
        }
        try {
            const input: ExecutionLayerInput = {
                type: node.input.type,
                payload: node.input.payload,
                metadata: { ...node.input.metadata },
            };
            const execContext = new DefaultExecutionContext({}, {});
            const result = engine.execute(execContext, input);
            return { nodeId, result, error: null };
        } catch (err) {
            return {
                nodeId,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    private dispatchLegacy(nodes: ReadonlySet<NodeID>, registry: EngineRegistry): EngineOutcome[] {
        const outcomes: EngineOutcome[] = [];
        for (const nodeId of nodes) {
            if (this.dispatched.has(nodeId)) continue;
            this.dispatched.add(nodeId);
            try {
                const engine = registry.resolveEngine(nodeId);
                const outcome = this.dispatchNode(nodeId, engine);
                this.resultCollector.collect(outcome);
                outcomes.push(outcome);
            } catch (err) {
                const outcome: EngineOutcome = {
                    nodeId,
                    error: err instanceof Error ? err : new Error(String(err)),
                };
                this.resultCollector.collect(outcome);
                outcomes.push(outcome);
            }
            if (this.resultCollector.getLastDecision() === "TERMINATE") break;
        }
        return outcomes;
    }
}
