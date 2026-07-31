/**
 * ASA-ARCH-44.0 — AuthorityValidationResult
 * Authority verification output only. Not Ch43 validation output.
 */

import type { StructuralValidationStatus } from "../contracts/LifecycleValidationResultContract";
import type { TransitionIdentity } from "../identity/TransitionIdentity";

export interface AuthorityValidationResult {
    readonly transitionId: TransitionIdentity;
    readonly status: StructuralValidationStatus;
    readonly reasons: readonly string[];
    readonly isAuthorityVerificationOnly: true;
    readonly isNotCh43Validation: true;
    readonly isNotApprovalCreation: true;
}

export function freezeAuthorityValidationResult(
    result: Omit<
        AuthorityValidationResult,
        | "isAuthorityVerificationOnly"
        | "isNotCh43Validation"
        | "isNotApprovalCreation"
    >
): AuthorityValidationResult {
    return Object.freeze({
        ...result,
        reasons: Object.freeze([...result.reasons]),
        isAuthorityVerificationOnly: true,
        isNotCh43Validation: true,
        isNotApprovalCreation: true,
    });
}
