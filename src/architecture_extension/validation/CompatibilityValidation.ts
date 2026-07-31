/**
 * ASA-ARCH-45.0 — CompatibilityValidation
 * Read-only compatibility reference integrity inspection.
 */

import type { ExtensionContractCompatibilityReference as CompatibilityContract } from "../contracts";
import type { ExtensionValidationInspectionResult } from "../interfaces";
import type {
    ExtensionCompatibilityReference,
    ExtensionContractCompatibilityReference,
} from "../references";
import { isCompatibilityStatus } from "../types";
import { freezeInspectionResult } from "./inspectionResult";

export function validateCompatibilityReference(
    reference: ExtensionCompatibilityReference
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!reference.immutable || !reference.readOnly) {
        findings.push("Compatibility reference must be immutable read-only");
    }
    if (!reference.compatibilityDoesNotGrantAuthority) {
        findings.push("Compatibility must not grant authority");
    }
    if (!isCompatibilityStatus(reference.compatibilityStatusReference)) {
        findings.push("Invalid CompatibilityStatus");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateContractCompatibilityReference(
    reference: ExtensionContractCompatibilityReference
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!reference.immutable || !reference.readOnly) {
        findings.push(
            "Contract compatibility reference must be immutable read-only"
        );
    }
    if (!reference.compatibilityDoesNotGrantAuthority) {
        findings.push("Contract compatibility must not grant authority");
    }
    const nested = validateCompatibilityReference(
        reference.compatibilityReference
    );
    findings.push(...nested.findings);
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}

export function validateCompatibilityContract(
    contract: CompatibilityContract
): ExtensionValidationInspectionResult {
    const findings: string[] = [];
    if (!contract.compatibilityDoesNotGrantAuthority) {
        findings.push("Compatibility contract must not grant authority");
    }
    if (!isCompatibilityStatus(contract.compatibilityStatusReference)) {
        findings.push("Invalid CompatibilityStatus on contract");
    }
    return freezeInspectionResult({
        passed: findings.length === 0,
        findings,
    });
}
