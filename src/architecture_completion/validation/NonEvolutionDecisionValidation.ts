import type { CompletionReport } from "../models";
import { freezeNonEvolutionDecisionContract } from "../contracts";
import {
    freezeInspectionResult,
    type CompletionInspectionResult,
} from "./inspectionResult";

export function inspectNonEvolutionDecision(
    report?: CompletionReport
): CompletionInspectionResult {
    const contract = freezeNonEvolutionDecisionContract();
    const findings: string[] = [];
    if (!contract.completionEvaluationIsNotDecision) {
        findings.push("completionEvaluationIsNotDecision violated");
    }
    if (!contract.completionEvaluationIsNotFutureAuthorization) {
        findings.push(
            "completionEvaluationIsNotFutureAuthorization violated"
        );
    }
    if (report) {
        if (report.evolutionDecision !== null) {
            findings.push("evolutionDecision must be null");
        }
        if (report.approvalResult !== null) {
            findings.push("approvalResult must be null");
        }
        if (report.executionInstruction !== null) {
            findings.push("executionInstruction must be null");
        }
        if (report.futureArchitectureAuthorization !== null) {
            findings.push("futureArchitectureAuthorization must be null");
        }
        if (!report.doesNotDecide) {
            findings.push("doesNotDecide must be true");
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
