import {
    freezeTraceabilityAuthorityBoundaryContract,
    type TraceabilityAuthorityBoundaryContract,
} from "../contracts";
import {
    freezeInspectionResult,
    type TraceabilityInspectionResult,
} from "./inspectionResult";

export function inspectAuthorityPreservation(
    contract: TraceabilityAuthorityBoundaryContract = freezeTraceabilityAuthorityBoundaryContract()
): TraceabilityInspectionResult {
    const findings: string[] = [];
    if (contract.traceabilityAuthority !== "NONE") {
        findings.push("traceabilityAuthority must be NONE");
    }
    if (contract.runtimeAuthority !== "NONE") {
        findings.push("runtimeAuthority must be NONE");
    }
    if (contract.decisionAuthority !== "NONE") {
        findings.push("decisionAuthority must be NONE");
    }
    if (!contract.providesTraceVisibilityOnly) {
        findings.push("providesTraceVisibilityOnly must be true");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
