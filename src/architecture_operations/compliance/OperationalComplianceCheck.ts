/**
 * ASA-ARCH-44.0 — OperationalComplianceCheck
 * Declared operational completeness only. Not compliance quality evaluation.
 */

import type { StructuralValidationStatus } from "../contracts/LifecycleValidationResultContract";
import type { ApprovalReference } from "../references/ApprovalReference";
import type { ValidationReference } from "../references/ValidationReference";

export interface OperationalComplianceResult {
    readonly status: StructuralValidationStatus;
    readonly reasons: readonly string[];
    readonly verifiesDeclaredCompletenessOnly: true;
    readonly doesNotEvaluateComplianceQuality: true;
}

export function checkOperationalCompliance(input: {
    contractsPresent: boolean;
    dependencyDeclarationConsistent: boolean;
    validationReference: ValidationReference | null;
    approvalReference: ApprovalReference | null;
    requireValidationReference: boolean;
    requireApprovalReference: boolean;
}): OperationalComplianceResult {
    const reasons: string[] = [];
    if (!input.contractsPresent) {
        reasons.push("Required contracts missing");
    }
    if (!input.dependencyDeclarationConsistent) {
        reasons.push("Dependency declaration inconsistent");
    }
    if (input.requireValidationReference && !input.validationReference) {
        reasons.push("ValidationReference missing");
    }
    if (input.requireApprovalReference && !input.approvalReference) {
        reasons.push("ApprovalReference missing");
    }
    return Object.freeze({
        status: reasons.length === 0 ? ("PASS" as const) : ("FAIL" as const),
        reasons: Object.freeze(reasons),
        verifiesDeclaredCompletenessOnly: true,
        doesNotEvaluateComplianceQuality: true,
    });
}
