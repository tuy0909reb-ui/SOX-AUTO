import {
    DefaultExecutionEngine,
    ExecutionEngine,
} from "../runtime_execution/ExecutionEngine";
import { Dispatcher } from "./Dispatcher";
import { EngineRegistry } from "./EngineRegistry";
import { ErrorPolicy } from "./ErrorPolicy";
import { ExecutionCoordinator } from "./ExecutionCoordinator";
import { ExecutionGraph } from "./ExecutionGraph";
import { GraphBuilder } from "./GraphBuilder";
import { GraphValidator } from "./GraphValidator";
import { LifecycleController } from "./LifecycleController";
import { OrchestrationContext } from "./OrchestrationContext";
import { ResultCollector } from "./ResultCollector";
import { NodeID, OrchestrationResult, RuntimePlan } from "./types";

export type EngineFactory = (nodeId: NodeID) => ExecutionEngine;

/**
 * Orchestrator — public façade over 20.9.1 internal responsibilities.
 * Preserves 20.9.0 lifecycle contracts without modifying Runtime Execution Layer.
 */
export class Orchestrator {
    private readonly lifecycle = new LifecycleController();
    private readonly registry = new EngineRegistry();
    private readonly dispatcher = new Dispatcher();
    private readonly engineFactory: EngineFactory;

    private context: OrchestrationContext | null = null;
    private graph: ExecutionGraph | null = null;
    private errorPolicy: ErrorPolicy | null = null;
    private resultCollector: ResultCollector | null = null;
    private coordinator: ExecutionCoordinator | null = null;
    private executed = false;

    constructor(engineFactory?: EngineFactory) {
        this.engineFactory = engineFactory ?? ((_nodeId) => new DefaultExecutionEngine());
    }

    get state() {
        return this.lifecycle.state;
    }

    get orchestrationContext(): OrchestrationContext | null {
        return this.context;
    }

    get executionGraph(): ExecutionGraph | null {
        return this.graph;
    }

    initialize(plan: RuntimePlan): void {
        if (!this.lifecycle.canInitialize()) {
            throw new Error(`initialize() allowed only from Created; current=${this.lifecycle.state}`);
        }

        try {
            const graph = GraphBuilder.build(plan);
            GraphValidator.validate(graph);

            const context = new OrchestrationContext();
            const errorPolicy = new ErrorPolicy(plan.errorPolicy ?? "STOP_ON_ERROR");

            // Create engines (Orchestrator responsibility) and bind lookup entries.
            for (const nodeId of graph.nodeIds) {
                this.registry.bind(nodeId, this.engineFactory(nodeId));
            }

            this.graph = graph;
            this.context = context;
            this.errorPolicy = errorPolicy;
            this.resultCollector = new ResultCollector(context, errorPolicy, this.lifecycle);
            this.coordinator = new ExecutionCoordinator(
                this.dispatcher,
                this.resultCollector,
                graph
            );

            // Created → Initialized → Ready
            this.lifecycle.transition("INITIALIZE_SUCCESS"); // → Initialized
            this.lifecycle.transition("MARK_READY"); // → Ready
            context.setState(this.lifecycle.state);
        } catch (err) {
            this.lifecycle.transition("INITIALIZE_FAILURE");
            if (this.context) {
                this.context.setState(this.lifecycle.state);
                this.context.appendError({
                    nodeId: "__initialize__",
                    message: err instanceof Error ? err.message : String(err),
                    timestamp: Date.now(),
                });
            }
            throw err;
        }
    }

    async execute(): Promise<OrchestrationResult> {
        if (!this.lifecycle.canExecute()) {
            throw new Error(`execute() allowed only from Ready; current=${this.lifecycle.state}`);
        }
        if (this.executed) {
            throw new Error("execute() may be invoked at most once per lifecycle");
        }
        if (!this.graph || !this.context || !this.coordinator || !this.resultCollector) {
            throw new Error("Orchestrator is not initialized");
        }

        this.executed = true;
        this.lifecycle.transition("START_EXECUTE");
        this.context.setState(this.lifecycle.state);

        const completed = new Set<NodeID>();

        while (this.lifecycle.state === "Running") {
            const executable = this.coordinator.selectExecutable(completed);

            if (executable.size === 0) {
                // Termination: all nodes completed, or no remaining work.
                if (completed.size === this.graph.size) {
                    this.lifecycle.transition("COMPLETE");
                    this.context.setState(this.lifecycle.state);
                } else if (this.context.errors.length > 0) {
                    // Remaining nodes blocked after errors under CONTINUE/COLLECT — complete with errors recorded.
                    this.lifecycle.transition("COMPLETE");
                    this.context.setState(this.lifecycle.state);
                } else {
                    this.lifecycle.transition("FAIL");
                    this.context.setState(this.lifecycle.state);
                }
                break;
            }

            this.coordinator.dispatch(executable, this.registry);

            // Sync completed set from context (ResultCollector updates context first).
            for (const id of this.context.completedNodes) {
                completed.add(id);
            }

            const decision = this.resultCollector.getLastDecision();
            if (decision === "TERMINATE") {
                // Context already updated; LifecycleController already transitioned to Failed.
                break;
            }

            if (completed.size === this.graph.size) {
                this.lifecycle.transition("COMPLETE");
                this.context.setState(this.lifecycle.state);
                break;
            }
        }

        return {
            state: this.lifecycle.state,
            completedNodes: [...this.context.completedNodes],
            errors: [...this.context.errors],
            events: [...this.context.events],
        };
    }

    shutdown(): void {
        this.lifecycle.shutdown();
        if (this.context) {
            this.context.setState(this.lifecycle.state);
        }
    }
}
