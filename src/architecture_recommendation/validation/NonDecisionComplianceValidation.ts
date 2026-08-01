import type { RecommendationSet } from "../models";
import {
    freezeNonDecisionComplianceContract,
} from "../contracts";
import { freezeInspectionResult, type RecommendationInspectionResult } from "./inspectionResult";

export function inspectNonDecisionCompliance(
    recommendationSet?: RecommendationSet
): RecommendationInspectionResult {
    const contract = freezeNonDecisionComplianceContract();
    const findings: string[] = [];

    if (!contract.recommendationIsNotDecision) {
        findings.push("recommendationIsNotDecision violated");
    }
    if (!contract.lifecycleTerminatesBeforeDecisionAuthority) {
        findings.push("lifecycle must terminate before decision authority");
    }

    if (recommendationSet) {
        if (recommendationSet.decisionResult !== null) {
            findings.push("RecommendationSet.decisionResult must be null");
        }
        if (recommendationSet.approvalResult !== null) {
            findings.push("RecommendationSet.approvalResult must be null");
        }
        if (recommendationSet.executionInstruction !== null) {
            findings.push(
                "RecommendationSet.executionInstruction must be null"
            );
        }
        if (!recommendationSet.doesNotDecide) {
            findings.push("RecommendationSet.doesNotDecide must be true");
        }
        for (const rec of recommendationSet.recommendations) {
            if (rec.decisionResult !== null) {
                findings.push(
                    `${rec.recommendationId}: decisionResult must be null`
                );
            }
            if (rec.approvalResult !== null) {
                findings.push(
                    `${rec.recommendationId}: approvalResult must be null`
                );
            }
            if (rec.executionInstruction !== null) {
                findings.push(
                    `${rec.recommendationId}: executionInstruction must be null`
                );
            }
            if (!rec.candidate.humanReviewRequired) {
                findings.push(
                    `${rec.recommendationId}: humanReviewRequired must be true`
                );
            }
        }
    }

    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
