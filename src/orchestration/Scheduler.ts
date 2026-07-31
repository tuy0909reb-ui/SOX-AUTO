import { ConcurrencyPolicy } from "./ConcurrencyPolicy";
import { DependencyResolver, DependencyValidationError } from "./DependencyResolver";
import { ExecutionGraph } from "./ExecutionGraph";
import { PriorityMap } from "./PriorityResolver";
import { ScheduledNodeQueue } from "./ScheduledNodeQueue";
import { FifoSchedulingPolicy, SchedulingPolicy } from "./SchedulingPolicy";
import { NodeID } from "./types";

export type ScheduleSuccess = {
    ok: true;
    queue: ScheduledNodeQueue;
};

export type ScheduleFailure = {
    ok: false;
    error: Error;
};

export type ScheduleResult = ScheduleSuccess | ScheduleFailure;

export interface SchedulerConfig {
    policy?: SchedulingPolicy;
    concurrencyPolicy?: ConcurrencyPolicy;
    concurrencyLimit?: number;
    priorities?: PriorityMap;
}

/**
 * Integrates DependencyResolver / SchedulingPolicy / ConcurrencyPolicy
 * to produce a ScheduledNodeQueue.
 *
 * SHALL NOT assign engines, modify ExecutionGraph / OrchestrationContext,
 * or retain execution results. Deterministic; terminates for valid DAGs.
 */
export class Scheduler {
    private readonly dependencyResolver: DependencyResolver;
    private readonly policy: SchedulingPolicy;
    private readonly concurrencyPolicy: ConcurrencyPolicy;
    private readonly concurrencyLimit: number;
    private readonly priorities: PriorityMap;

    constructor(config?: SchedulerConfig) {
        this.dependencyResolver = new DependencyResolver();
        this.policy = config?.policy ?? new FifoSchedulingPolicy();
        this.concurrencyPolicy = config?.concurrencyPolicy ?? new ConcurrencyPolicy();
        this.concurrencyLimit =
            config?.concurrencyLimit ?? Number.POSITIVE_INFINITY;
        this.priorities = config?.priorities ?? new Map();
    }

    /**
     * One Scheduling Cycle evaluation.
     * `completed` MUST be treated as an immutable view for this cycle.
     */
    schedule(
        executable: ReadonlySet<NodeID>,
        graph: ExecutionGraph,
        completed: ReadonlySet<NodeID>
    ): ScheduleResult {
        // Immutable view for this cycle (do not mutate caller's set).
        const completedView: ReadonlySet<NodeID> = new Set(completed);

        try {
            this.dependencyResolver.validate(executable, graph, completedView);
            const ordered = this.policy.order(
                executable,
                graph,
                this.dependencyResolver,
                this.priorities
            );
            const limited = this.concurrencyPolicy.apply(ordered, this.concurrencyLimit);
            const queue = ScheduledNodeQueue.from(limited);
            return { ok: true, queue };
        } catch (err) {
            // SHALL NOT produce a partial ScheduledNodeQueue upon failure.
            const error =
                err instanceof Error
                    ? err
                    : new DependencyValidationError(String(err));
            return { ok: false, error };
        }
    }
}
