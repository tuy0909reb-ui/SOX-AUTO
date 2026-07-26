import { EngineOutcome, ErrorPolicyDecision, ErrorPolicyKind } from "./types";

/**
 * ErrorPolicy SHALL NOT modify ExecutionGraph.
 * Decides continuation vs termination only.
 */
export class ErrorPolicy {
    constructor(private readonly kind: ErrorPolicyKind = "STOP_ON_ERROR") {}

    get policyKind(): ErrorPolicyKind {
        return this.kind;
    }

    evaluate(outcomes: readonly EngineOutcome[]): ErrorPolicyDecision {
        const hasError = outcomes.some((o) => o.error != null);
        if (!hasError) {
            return "CONTINUE";
        }
        switch (this.kind) {
            case "STOP_ON_ERROR":
                return "TERMINATE";
            case "CONTINUE":
            case "COLLECT_ERRORS":
                return "CONTINUE";
            default:
                return "TERMINATE";
        }
    }
}
