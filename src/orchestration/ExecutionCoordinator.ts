import { DefaultExecutionContext } from "../runtime_execution/ExecutionContext";
import { ExecutionLayerInput } from "../runtime_execution/ExecutionLayerInput";
import { Dispatcher } from "./Dispatcher";
import { EngineRegistry } from "./EngineRegistry";
import { ExecutionGraph } from "./ExecutionGraph";
import { ResultCollector } from "./ResultCollector";
import { EngineOutcome, NodeID } from "./types";

/**
 * Orchestrates execution: resolve engines, dispatch, monitor completion, notify ResultCollector.
 * Each executable node SHALL be dispatched at most once.
 * ExecutionGraph remains unchanged.
 */
export class ExecutionCoordinator {
    private readonly dispatched = new Set<NodeID>();

    constructor(
        private readonly dispatcher: Dispatcher,
        private readonly resultCollector: ResultCollector,
        private readonly graph: ExecutionGraph
    ) {}

    getDispatchedNodes(): ReadonlySet<NodeID> {
        return this.dispatched;
    }

    /**
     * Dispatch nodes via registry. Nodes already dispatched are skipped (single-dispatch invariant).
     */
    dispatch(nodes: ReadonlySet<NodeID>, registry: EngineRegistry): EngineOutcome[] {
        const outcomes: EngineOutcome[] = [];

        for (const nodeId of nodes) {
            if (this.dispatched.has(nodeId)) {
                continue;
            }
            this.dispatched.add(nodeId);

            const node = this.graph.getNode(nodeId);
            if (!node) {
                const outcome: EngineOutcome = {
                    nodeId,
                    error: new Error(`Unknown node in graph: ${nodeId}`),
                };
                this.resultCollector.collect(outcome);
                outcomes.push(outcome);
                continue;
            }

            try {
                const engine = registry.resolveEngine(nodeId);
                const input: ExecutionLayerInput = {
                    type: node.input.type,
                    payload: node.input.payload,
                    metadata: { ...node.input.metadata },
                };
                const execContext = new DefaultExecutionContext({}, {});
                const result = engine.execute(execContext, input);
                const outcome: EngineOutcome = { nodeId, result, error: null };
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

            if (this.resultCollector.getLastDecision() === "TERMINATE") {
                break;
            }
        }

        return outcomes;
    }

    selectExecutable(completed: ReadonlySet<NodeID>): ReadonlySet<NodeID> {
        const selected = this.dispatcher.selectExecutableNodes(completed, this.graph);
        const pending = new Set<NodeID>();
        for (const id of selected) {
            if (!this.dispatched.has(id)) {
                pending.add(id);
            }
        }
        return pending;
    }
}
