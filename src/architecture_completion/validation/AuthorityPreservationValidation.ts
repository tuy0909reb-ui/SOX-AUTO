import { freezeCompletionAuthorityBoundaryContract } from "../contracts";
import {
    freezeInspectionResult,
    type CompletionInspectionResult,
} from "./inspectionResult";

export function inspectAuthorityPreservation(): CompletionInspectionResult {
    const contract = freezeCompletionAuthorityBoundaryContract();
    const findings: string[] = [];
    if (contract.decisionAuthority !== "NONE") {
        findings.push("decisionAuthority must be NONE");
    }
    if (contract.completionApprovalAuthority !== "NONE") {
        findings.push("completionApprovalAuthority must be NONE");
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
    if (contract.futureArchitectureAuthorization !== "NONE") {
        findings.push("futureArchitectureAuthorization must be NONE");
    }
    if (!contract.providesCompletionEvidenceOnly) {
        findings.push("must provide completion evidence only");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
