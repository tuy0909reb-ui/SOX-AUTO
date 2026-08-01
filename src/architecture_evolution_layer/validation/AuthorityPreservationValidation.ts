/**
 * ASA-ARCH-46.0 — AuthorityPreservationValidation
 */

import {
    freezeEvolutionAuthorityBoundaryContract,
    type EvolutionAuthorityBoundaryContract,
} from "../contracts";
import type { EvolutionValidationInspectionResult } from "../interfaces";
import { freezeInspectionResult } from "./inspectionResult";

export function inspectAuthorityPreservation(
    contract: EvolutionAuthorityBoundaryContract = freezeEvolutionAuthorityBoundaryContract()
): EvolutionValidationInspectionResult {
    const findings: string[] = [];
    if (contract.authorityAcquisitionCapability !== false) {
        findings.push("authorityAcquisitionCapability must be false");
    }
    if (contract.authorityOverrideCapability !== false) {
        findings.push("authorityOverrideCapability must be false");
    }
    if (contract.authorityDelegationCapability !== false) {
        findings.push("authorityDelegationCapability must be false");
    }
    if (contract.evolutionAuthority !== "NONE") {
        findings.push("evolutionAuthority must be NONE");
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
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
