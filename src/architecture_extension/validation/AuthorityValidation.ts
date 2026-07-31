/**
 * ASA-ARCH-45.0 — AuthorityValidation
 * Read-only inspection that Extension never owns ASA authority.
 */

import type {
    ExtensionAuthorityBoundaryContract,
    ExtensionResponsibilityDeclaration,
} from "../contracts";
import type { ExtensionValidationInspectionResult } from "../interfaces";
import type {
    ExtensionAuthorityBoundaryModel,
    ExtensionResponsibilityDeclarationModel,
} from "../models";
import type { ExtensionApprovalReference } from "../references";
import { freezeInspectionResult } from "./inspectionResult";

export function validateAuthorityBoundaryContract(
    contract: ExtensionAuthorityBoundaryContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (contract.authorityAcquisitionCapability !== false) {
        findings.push("Authority acquisition capability must be false");
    }
    if (contract.authorityOverrideCapability !== false) {
        findings.push("Authority override capability must be false");
    }
    if (contract.authorityDelegationCapability !== false) {
        findings.push("Authority delegation capability must be false");
    }
    if (!contract.forbidsAuthorityOwnership) {
        findings.push("Authority ownership must be forbidden");
    }
    if (!contract.forbidsAuthorityInheritance) {
        findings.push("Authority inheritance must be forbidden");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateAuthorityBoundaryModel(
    model: ExtensionAuthorityBoundaryModel
): ExtensionValidationInspectionResult {
    return validateAuthorityBoundaryContract({
        contractId: "ExtensionAuthorityBoundaryContract",
        authorityAcquisitionCapability: model.authorityAcquisitionCapability,
        authorityOverrideCapability: model.authorityOverrideCapability,
        authorityDelegationCapability: model.authorityDelegationCapability,
        forbidsAuthorityOwnership: model.forbidsAuthorityOwnership,
        forbidsAuthorityInheritance: model.forbidsAuthorityInheritance,
        forbidsCoreAuthorityOverride: model.forbidsCoreAuthorityOverride,
        capabilityDoesNotEqualAuthorityOwnership:
            model.capabilityDoesNotEqualAuthorityOwnership,
    });
}

export function validateResponsibilityExclusions(
    declaration:
        | ExtensionResponsibilityDeclaration
        | ExtensionResponsibilityDeclarationModel
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!declaration.excludesCoreAuthority) {
        findings.push("Must exclude Core Authority");
    }
    if (!declaration.excludesFreezeAuthority) {
        findings.push("Must exclude Freeze Authority");
    }
    if (!declaration.excludesValidationAuthority) {
        findings.push("Must exclude Validation Authority");
    }
    if (!declaration.excludesEvolutionAuthority) {
        findings.push("Must exclude Evolution Authority");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateApprovalReferenceAuthority(
    reference: ExtensionApprovalReference
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (reference.approvalAuthority !== "HUMAN_ARCHITECT") {
        findings.push("Approval authority must be HUMAN_ARCHITECT");
    }
    if (!reference.doesNotOwnAuthority || !reference.doesNotGrantAuthority) {
        findings.push("Approval reference must not own or grant authority");
    }
    if (!reference.forbidsSelfApproval) {
        findings.push("Self-approval must be forbidden");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
