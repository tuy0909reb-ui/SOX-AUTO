import {
    freezeRecommendationAuthorityBoundaryContract,
} from "../contracts";
import { freezeInspectionResult, type RecommendationInspectionResult } from "./inspectionResult";

export function inspectAuthorityPreservation(): RecommendationInspectionResult {
    const contract = freezeRecommendationAuthorityBoundaryContract();
    const findings: string[] = [];
    if (contract.decisionAuthority !== "NONE") {
        findings.push("decisionAuthority must be NONE");
    }
    if (contract.approvalAuthority !== "NONE") {
        findings.push("approvalAuthority must be NONE");
    }
    if (contract.freezeAuthority !== "NONE") {
        findings.push("freezeAuthority must be NONE");
    }
    if (contract.runtimeAuthority !== "NONE") {
        findings.push("runtimeAuthority must be NONE");
    }
    if (contract.implementationAuthorizationAuthority !== "NONE") {
        findings.push("implementationAuthorizationAuthority must be NONE");
    }
    if (!contract.providesRecommendationOnly) {
        findings.push("must provide recommendation only");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
