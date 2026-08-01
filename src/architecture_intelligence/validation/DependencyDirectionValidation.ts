import {
    freezeIntelligenceDependencyBoundaryContract,
    type IntelligenceDependencyBoundaryContract,
} from "../contracts";
import {
    freezeInspectionResult,
    type IntelligenceInspectionResult,
} from "./inspectionResult";

export function inspectDependencyDirection(
    contract: IntelligenceDependencyBoundaryContract = freezeIntelligenceDependencyBoundaryContract()
): IntelligenceInspectionResult {
    const findings: string[] = [];
    if (
        contract.allowedDependencyDirection !==
        "Frozen→Knowledge→Analysis→Evidence"
    ) {
        findings.push("allowedDependencyDirection mismatch");
    }
    if (!contract.forbidsFoundationModification) {
        findings.push("forbidsFoundationModification must be true");
    }
    if (!contract.architectureDoesNotDependOnIntelligence) {
        findings.push(
            "architectureDoesNotDependOnIntelligence must be true"
        );
    }
    if (contract.dependsOnEvolutionLayer !== "ASA-ARCH-46.0") {
        findings.push("dependsOnEvolutionLayer must be ASA-ARCH-46.0");
    }
    if (contract.dependsOnFoundation !== "ASA-FOUNDATION-1.0") {
        findings.push("dependsOnFoundation must be ASA-FOUNDATION-1.0");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
