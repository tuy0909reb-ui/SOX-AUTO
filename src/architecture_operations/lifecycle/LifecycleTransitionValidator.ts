/**
 * ASA-ARCH-44.0 — LifecycleTransitionValidator
 * Structural transition validation only.
 * Does not authorize, execute, grant authority, mutate state, or open registry.
 */

import {
    freezeTransitionValidationResult,
    type TransitionValidationResult,
} from "../compliance/TransitionValidationResult";
import {
    evaluateTransitionExistence,
    freezeLifecyclePolicy,
    type LifecyclePolicy,
} from "./LifecyclePolicy";
import type { LifecycleTransition } from "./LifecycleTransition";

export function validateLifecycleTransition(
    transition: LifecycleTransition,
    policy: LifecyclePolicy = freezeLifecyclePolicy()
): TransitionValidationResult {
    const evaluation = evaluateTransitionExistence(policy, transition);
    if (!evaluation.exists) {
        return freezeTransitionValidationResult({
            transitionId: transition.transitionId,
            status: "FAIL",
            reasons: evaluation.reasons,
        });
    }
    return freezeTransitionValidationResult({
        transitionId: transition.transitionId,
        status: "PASS",
        reasons: [],
    });
}

/** Explicit absence of decision / authority APIs on this module surface. */
export const LIFECYCLE_TRANSITION_VALIDATOR_CAPABILITIES = Object.freeze({
    structuralValidationOnly: true,
    canAuthorizeTransition: false,
    canExecuteTransition: false,
    canGenerateAuthority: false,
    canGenerateDecision: false,
    canInitiateRegistryOperations: false,
    canCreateLifecycleTransitions: false,
});
