import {
    DefaultExecutionEngine,
    ExecutionEngine,
} from "../runtime_execution/ExecutionEngine";
import { DefaultDispatchStrategy, DispatchStrategy } from "./DispatchStrategy";
import { Dispatcher } from "./Dispatcher";
import { EnginePool } from "./EnginePool";
import { EngineRegistry } from "./EngineRegistry";
import { ErrorPolicy } from "./ErrorPolicy";
import { ExecutionCoordinator } from "./ExecutionCoordinator";
import { ExecutionGraph } from "./ExecutionGraph";
import { GraphBuilder } from "./GraphBuilder";
import { GraphValidator } from "./GraphValidator";
import { LifecycleController } from "./LifecycleController";
import { OrchestrationContext } from "./OrchestrationContext";
import { ResultCollector } from "./ResultCollector";
import { Scheduler } from "./Scheduler";
import {
    FifoSchedulingPolicy,
    PrioritySchedulingPolicy,
    SchedulingPolicy,
} from "./SchedulingPolicy";
import { NodeID, OrchestrationResult, RuntimePlan } from "./types";

export type EngineFactory = (nodeId: NodeID) => ExecutionEngine;

export interface OrchestratorOptions {
    engineFactory?: EngineFactory;
    strategy?: DispatchStrategy;
    schedulingPolicy?: SchedulingPolicy;
}

/**
 * Orchestrator — public façade (20.9.0 contract preserved).
 * 20.9.3: Scheduling Cycle → ScheduledNodeQueue → DispatchStrategy → Coordinator.
 */
export class Orchestrator {
    private readonly lifecycle = new LifecycleController();
    private readonly registry = new EngineRegistry();
    private readonly dispatcher = new Dispatcher();
    private readonly engineFactory: EngineFactory;
    private readonly strategy: DispatchStrategy;
    private readonly schedulingPolicyOverride?: SchedulingPolicy;

    private context: OrchestrationContext | null = null;
    private graph: ExecutionGraph | null = null;
    private errorPolicy: ErrorPolicy | null = null;
    private resultCollector: ResultCollector | null = null;
    private coordinator: ExecutionCoordinator | null = null;
    private pool: EnginePool | null = null;
    private scheduler: Scheduler | null = null;
    private executed = false;

    constructor(
        engineFactoryOrOptions?: EngineFactory | OrchestratorOptions,
        strategy?: DispatchStrategy
    ) {
        if (typeof engineFactoryOrOptions === "function" || engineFactoryOrOptions === undefined) {
            this.engineFactory =
                (engineFactoryOrOptions as EngineFactory | undefined) ??
                ((_nodeId) => new DefaultExecutionEngine());
            this.strategy = strategy ?? new DefaultDispatchStrategy();
        } else {
            this.engineFactory =
                engineFactoryOrOptions.engineFactory ??
                ((_nodeId) => new DefaultExecutionEngine());
            this.strategy = engineFactoryOrOptions.strategy ?? new DefaultDispatchStrategy();
            this.schedulingPolicyOverride = engineFactoryOrOptions.schedulingPolicy;
        }
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

    get enginePool(): EnginePool | null {
        return this.pool;
    }

    initialize(plan: RuntimePlan): void {
        if (!this.lifecycle.canInitialize()) {
            throw new Error(`initialize() allowed only from Created; current=${this.lifecycle.state}`);
        }

        try {
            const graph = GraphBuilder.build(plan);
            GraphValidator.validate(graph);

            const context = new OrchestrationContext();
            const errorPolicy = new ErrorPolicy(
                plan.errorPolicy ?? "STOP_ON_ERROR",
                this.lifecycle,
                context
            );

            for (const nodeId of graph.nodeIds) {
                const id = nodeId;
                this.registry.registerDefinition({
                    nodeId: id,
                    metadata: {},
                    create: () => this.engineFactory(id),
                });
            }

            const priorities = new Map<NodeID, number>();
            for (const n of plan.nodes) {
                priorities.set(n.id, n.priority ?? 0);
            }

            const policy =
                this.schedulingPolicyOverride ??
                (plan.schedulingPolicy === "priority"
                    ? new PrioritySchedulingPolicy()
                    : new FifoSchedulingPolicy());

            const scheduler = new Scheduler({
                policy,
                concurrencyLimit: plan.maxConcurrency ?? Number.POSITIVE_INFINITY,
                priorities,
            });

            const pool = new EnginePool(this.registry);
            const resultCollector = new ResultCollector(context, errorPolicy);
            const coordinator = new ExecutionCoordinator(
                this.dispatcher,
                resultCollector,
                graph,
                pool,
                this.strategy
            );

            this.graph = graph;
            this.context = context;
            this.errorPolicy = errorPolicy;
            this.resultCollector = resultCollector;
            this.coordinator = coordinator;
            this.pool = pool;
            this.scheduler = scheduler;

            this.lifecycle.transition("INITIALIZE_SUCCESS");
            this.lifecycle.transition("MARK_READY");
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
        if (
            !this.graph ||
            !this.context ||
            !this.coordinator ||
            !this.resultCollector ||
            !this.scheduler
        ) {
            throw new Error("Orchestrator is not initialized");
        }

        this.executed = true;
        this.lifecycle.transition("START_EXECUTE");
        this.context.setState(this.lifecycle.state);

        const completed = new Set<NodeID>();

        while (this.lifecycle.state === "Running") {
            // Sync context completed → local completed for Dispatcher retrieve path.
            for (const id of this.context.completedNodes) {
                completed.add(id);
            }

            // Scheduling Cycle: Dispatcher → ExecutableNodeSet
            const executable = this.dispatcher.retrieveExecutableNodeSet(
                this.context,
                this.graph,
                this.coordinator.getDispatchedNodes()
            );

            if (executable.size === 0) {
                if (completed.size === this.graph.size) {
                    this.lifecycle.transition("COMPLETE");
                    this.context.setState(this.lifecycle.state);
                } else if (this.context.errors.length > 0) {
                    this.lifecycle.transition("COMPLETE");
                    this.context.setState(this.lifecycle.state);
                } else {
                    this.lifecycle.transition("FAIL");
                    this.context.setState(this.lifecycle.state);
                }
                break;
            }

            // Immutable CompletedNodeSet view for this scheduling cycle.
            const completedView: ReadonlySet<NodeID> = new Set(completed);

            const scheduled = this.scheduler.schedule(
                executable,
                this.graph,
                completedView
            );

            if (!scheduled.ok) {
                // No partial queue; report to ErrorPolicy via ResultCollector.
                this.resultCollector.collect({
                    nodeId: "__schedule__",
                    error: scheduled.error,
                });
                if (this.resultCollector.getLastDecision() === "TERMINATE") {
                    break;
                }
                // Non-terminating policies: fail the cycle without spinning forever.
                this.lifecycle.transition("FAIL");
                this.context.setState(this.lifecycle.state);
                break;
            }

            const dispatchedBefore = this.coordinator.getDispatchedNodes().size;
            const completedBefore = completed.size;

            // ScheduledNodeQueue → DispatchStrategy → Coordinator → EnginePool
            this.coordinator.dispatchQueue(scheduled.queue, this.registry);

            for (const id of this.context.completedNodes) {
                completed.add(id);
            }

            const decision = this.resultCollector.getLastDecision();
            if (decision === "TERMINATE") {
                break;
            }

            if (completed.size === this.graph.size) {
                this.lifecycle.transition("COMPLETE");
                this.context.setState(this.lifecycle.state);
                break;
            }

            if (
                this.coordinator.getDispatchedNodes().size === dispatchedBefore &&
                completed.size === completedBefore
            ) {
                if (this.context.errors.length > 0) {
                    this.lifecycle.transition("COMPLETE");
                } else {
                    this.lifecycle.transition("FAIL");
                }
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
