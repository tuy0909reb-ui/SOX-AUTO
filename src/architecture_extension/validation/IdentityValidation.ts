/**
 * ASA-ARCH-45.0 — IdentityValidation
 * Read-only structural inspection of Extension identity.
 */

import type { ExtensionIdentityContract } from "../contracts";
import type { ExtensionValidationInspectionResult } from "../interfaces";
import type { ExtensionIdentity } from "../models";
import { freezeInspectionResult } from "./inspectionResult";

export function validateIdentityModel(
    identity: ExtensionIdentity
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!identity.immutable) {
        findings.push("Identity model must be immutable");
    }
    if (identity.representsContract !== "ExtensionIdentityContract") {
        findings.push("Identity model must represent ExtensionIdentityContract");
    }
    if (!identity.extensionId) {
        findings.push("extensionId is required");
    }
    if (!identity.identityHashReference) {
        findings.push("identityHashReference is required");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateIdentityContract(
    contract: ExtensionIdentityContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!contract.identityImmutable || !contract.forbidsIdentityMutation) {
        findings.push("Identity contract must forbid identity mutation");
    }
    if (contract.contractId !== "ExtensionIdentityContract") {
        findings.push("Invalid identity contractId");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateIdentityConformity(
    identity: ExtensionIdentity,
    contract: ExtensionIdentityContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (identity.extensionId !== contract.extensionId) {
        findings.push("Identity extensionId does not match contract");
    }
    if (identity.identityHashReference !== contract.identityHashReference) {
        findings.push("Identity hash reference does not match contract");
    }
    if (
        identity.extensionVersionReference !==
        contract.extensionVersionReference
    ) {
        findings.push("Identity version reference does not match contract");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
