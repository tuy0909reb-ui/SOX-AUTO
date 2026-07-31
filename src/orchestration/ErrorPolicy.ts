import { LifecycleController } from "./LifecycleController";
import { OrchestrationContext } from "./OrchestrationContext";
import { EngineOutcome, ErrorPolicyDecision, ErrorPolicyKind } from "./types";

/**
 * ErrorPolicy SHALL NOT modify ExecutionGraph.
 * ErrorPolicy SHALL NOT directly manipulate EnginePool state.
 * Decides continuation/termination and notifies LifecycleController.
 */
export class ErrorPolicy {
    constructor(
        private readonly kind: ErrorPolicyKind = "STOP_ON_ERROR",
        private readonly lifecycle?: LifecycleController,
        private readonly context?: OrchestrationContext
    ) {}

    get policyKind(): ErrorPolicyKind {
        return this.kind;
    }

    evaluate(outcomes: readonly EngineOutcome[]): ErrorPolicyDecision {
        const hasError = outcomes.some((o) => o.error != null);
        let decision: ErrorPolicyDecision = "CONTINUE";
        if (hasError) {
            switch (this.kind) {
                case "STOP_ON_ERROR":
                    decision = "TERMINATE";
                    break;
                case "CONTINUE":
                case "COLLECT_ERRORS":
                    decision = "CONTINUE";
                    break;
                default:
                    decision = "TERMINATE";
            }
        }

        if (decision === "TERMINATE") {
            this.notifyLifecycleController();
        }
        return decision;
    }

    private notifyLifecycleController(): void {
        if (!this.lifecycle) return;
        if (this.lifecycle.state === "Running") {
            this.lifecycle.transition("FAIL");
            this.context?.setState(this.lifecycle.state);
        }
    }
}
