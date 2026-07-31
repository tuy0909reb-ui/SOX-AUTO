import { ErrorPolicy } from "./ErrorPolicy";
import { OrchestrationContext } from "./OrchestrationContext";
import { EngineOutcome, ErrorPolicyDecision } from "./types";

/**
 * Collects Success / Failure / Event; updates OrchestrationContext;
 * provides outcomes to ErrorPolicy.
 *
 * ResultCollector SHALL NOT dispatch Engine.
 * ResultCollector SHALL NOT modify the execution graph structure.
 * ResultCollector SHALL NOT initiate orchestration state transitions.
 * (ErrorPolicy notifies LifecycleController.)
 */
export class ResultCollector {
    private lastDecision: ErrorPolicyDecision = "CONTINUE";

    constructor(
        private readonly context: OrchestrationContext,
        private readonly errorPolicy: ErrorPolicy,
        /** @deprecated 20.9.2 — retained for call-site compatibility; unused for transitions. */
        _lifecycle?: unknown
    ) {
        void _lifecycle;
    }

    getLastDecision(): ErrorPolicyDecision {
        return this.lastDecision;
    }

    collect(engineResult: EngineOutcome): void {
        const now = Date.now();

        if (engineResult.events) {
            for (const event of engineResult.events) {
                this.context.appendEvent(event);
            }
        }

        if (engineResult.error) {
            this.context.appendError({
                nodeId: engineResult.nodeId,
                message: engineResult.error.message,
                timestamp: now,
            });
        } else {
            this.context.markCompleted(engineResult.nodeId);
            this.context.appendEvent({
                nodeId: engineResult.nodeId,
                type: "node.completed",
                payload: engineResult.result ?? null,
                timestamp: now,
            });
        }

        // Context updated first, then ErrorPolicy evaluation (auditability).
        this.lastDecision = this.errorPolicy.evaluate([engineResult]);
    }

    collectBatch(outcomes: readonly EngineOutcome[]): ErrorPolicyDecision {
        for (const outcome of outcomes) {
            const now = Date.now();
            if (outcome.events) {
                for (const event of outcome.events) {
                    this.context.appendEvent(event);
                }
            }
            if (outcome.error) {
                this.context.appendError({
                    nodeId: outcome.nodeId,
                    message: outcome.error.message,
                    timestamp: now,
                });
            } else {
                this.context.markCompleted(outcome.nodeId);
                this.context.appendEvent({
                    nodeId: outcome.nodeId,
                    type: "node.completed",
                    payload: outcome.result ?? null,
                    timestamp: now,
                });
            }
        }

        this.lastDecision = this.errorPolicy.evaluate(outcomes);
        return this.lastDecision;
    }
}
