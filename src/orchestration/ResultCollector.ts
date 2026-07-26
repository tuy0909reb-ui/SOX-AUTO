import { ErrorPolicy } from "./ErrorPolicy";
import { LifecycleController } from "./LifecycleController";
import { OrchestrationContext } from "./OrchestrationContext";
import { EngineOutcome, ErrorPolicyDecision } from "./types";

/**
 * Centralized collection of Result / Error / Event.
 * Updates OrchestrationContext, evaluates ErrorPolicy, notifies LifecycleController.
 * ExecutionEngine SHALL NOT update OrchestrationContext directly.
 */
export class ResultCollector {
    private lastDecision: ErrorPolicyDecision = "CONTINUE";

    constructor(
        private readonly context: OrchestrationContext,
        private readonly errorPolicy: ErrorPolicy,
        private readonly lifecycle: LifecycleController
    ) {}

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

        // Provide outcomes to ErrorPolicy AFTER context update (auditability).
        this.lastDecision = this.errorPolicy.evaluate([engineResult]);

        if (this.lastDecision === "TERMINATE") {
            // State change MUST go through LifecycleController.
            if (this.lifecycle.state === "Running") {
                this.lifecycle.transition("FAIL");
                this.context.setState(this.lifecycle.state);
            }
        }
    }

    collectBatch(outcomes: readonly EngineOutcome[]): ErrorPolicyDecision {
        for (const outcome of outcomes) {
            // Update context for each outcome first.
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
        if (this.lastDecision === "TERMINATE" && this.lifecycle.state === "Running") {
            this.lifecycle.transition("FAIL");
            this.context.setState(this.lifecycle.state);
        }
        return this.lastDecision;
    }
}
