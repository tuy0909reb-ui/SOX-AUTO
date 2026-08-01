/**
 * ASA-ARCH-46.0 — FoundationCompatibilityValidation
 */

import {
    freezeFoundationCompatibilityContract,
    type FoundationCompatibilityContract,
} from "../contracts";
import type { EvolutionValidationInspectionResult } from "../interfaces";
import { freezeInspectionResult } from "./inspectionResult";

export function inspectFoundationCompatibility(
    contract: FoundationCompatibilityContract = freezeFoundationCompatibilityContract()
): EvolutionValidationInspectionResult {
    const findings: string[] = [];
    if (contract.foundationId !== "ASA-FOUNDATION-1.0") {
        findings.push("foundationId must be ASA-FOUNDATION-1.0");
    }
    if (!contract.foundationMustRemainFrozen) {
        findings.push("foundationMustRemainFrozen must be true");
    }
    if (!contract.compatibilityRequired) {
        findings.push("compatibilityRequired must be true");
    }
    if (!contract.forbidsFoundationModification) {
        findings.push("forbidsFoundationModification must be true");
    }
    if (!contract.forbidsAuthorityOverride) {
        findings.push("forbidsAuthorityOverride must be true");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
