import {
    freezeIntelligenceAuthorityBoundaryContract,
    type IntelligenceAuthorityBoundaryContract,
} from "../contracts";
import {
    freezeInspectionResult,
    type IntelligenceInspectionResult,
} from "./inspectionResult";

export function inspectAuthorityPreservation(
    contract: IntelligenceAuthorityBoundaryContract = freezeIntelligenceAuthorityBoundaryContract()
): IntelligenceInspectionResult {
    const findings: string[] = [];
    if (contract.intelligenceAuthority !== "NONE") {
        findings.push("intelligenceAuthority must be NONE");
    }
    if (contract.runtimeAuthority !== "NONE") {
        findings.push("runtimeAuthority must be NONE");
    }
    if (contract.decisionAuthority !== "NONE") {
        findings.push("decisionAuthority must be NONE");
    }
    if (contract.finalAuthority !== "HUMAN_ARCHITECT") {
        findings.push("finalAuthority must be HUMAN_ARCHITECT");
    }
    if (!contract.providesEvidenceOnly) {
        findings.push("providesEvidenceOnly must be true");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
