/**
 * ASA-ARCH-44.0 — TransitionValidationResult
 * Structural evaluation output from LifecycleTransitionValidator.
 */

import type { StructuralValidationStatus } from "../contracts/LifecycleValidationResultContract";
import type { TransitionIdentity } from "../identity/TransitionIdentity";

export interface TransitionValidationResult {
    readonly transitionId: TransitionIdentity;
    readonly status: StructuralValidationStatus;
    readonly reasons: readonly string[];
    readonly isStructuralEvaluationOnly: true;
    readonly isNotAuthorityGrant: true;
    readonly isNotStateMutation: true;
    readonly isNotDecision: true;
}

export function freezeTransitionValidationResult(
    result: Omit<
        TransitionValidationResult,
        | "isStructuralEvaluationOnly"
        | "isNotAuthorityGrant"
        | "isNotStateMutation"
        | "isNotDecision"
    >
): TransitionValidationResult {
    return Object.freeze({
        ...result,
        reasons: Object.freeze([...result.reasons]),
        isStructuralEvaluationOnly: true,
        isNotAuthorityGrant: true,
        isNotStateMutation: true,
        isNotDecision: true,
    });
}
