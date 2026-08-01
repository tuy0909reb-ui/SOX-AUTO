import type { RecommendationSet } from "../models";
import { freezeInspectionResult, type RecommendationInspectionResult } from "./inspectionResult";

export function inspectEvidenceLinkIntegrity(
    recommendationSet: RecommendationSet
): RecommendationInspectionResult {
    const findings: string[] = [];
    if (!recommendationSet.architectureStateHash) {
        findings.push("missing architectureStateHash");
    }
    if (!recommendationSet.traceabilityReference) {
        findings.push("missing traceabilityReference");
    }
    if (!recommendationSet.evidenceReference) {
        findings.push("missing evidenceReference");
    }
    for (const rec of recommendationSet.recommendations) {
        if (!rec.evidenceReference) {
            findings.push(`${rec.recommendationId}: missing evidenceReference`);
        }
        if (!rec.traceabilityReference) {
            findings.push(
                `${rec.recommendationId}: missing traceabilityReference`
            );
        }
        if (
            rec.architectureState.architectureStateHash !==
            recommendationSet.architectureStateHash
        ) {
            findings.push(
                `${rec.recommendationId}: architectureStateHash mismatch`
            );
        }
        if (!rec.candidate.evidenceReference) {
            findings.push(
                `${rec.recommendationId}: candidate missing evidenceReference`
            );
        }
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
