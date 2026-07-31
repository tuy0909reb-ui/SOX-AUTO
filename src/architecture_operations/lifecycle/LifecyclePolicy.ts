/**
 * ASA-ARCH-44.0 — LifecyclePolicy
 * Answers: Can this transition exist?
 * Does not own approval, validation execution, authority verification, or state mutation.
 */

import {
    freezeArchitectureLifecycleContract,
    type ArchitectureLifecycleContract,
    type LifecycleTransitionRule,
} from "../contracts/ArchitectureLifecycleContract";
import { ArchitectureLifecycleState } from "./LifecycleState";
import type { LifecycleTransition } from "./LifecycleTransition";

export interface LifecyclePolicy {
    readonly contract: ArchitectureLifecycleContract;
    readonly doesNotOwnApprovalAuthority: true;
    readonly doesNotOwnValidationExecution: true;
    readonly doesNotOwnAuthorityVerification: true;
    readonly doesNotMutateState: true;
    readonly doesNotModifyPolicy: true;
}

export function freezeLifecyclePolicy(
    contract: ArchitectureLifecycleContract = freezeArchitectureLifecycleContract()
): LifecyclePolicy {
    return Object.freeze({
        contract,
        doesNotOwnApprovalAuthority: true,
        doesNotOwnValidationExecution: true,
        doesNotOwnAuthorityVerification: true,
        doesNotMutateState: true,
        doesNotModifyPolicy: true,
    });
}

export function findTransitionRule(
    policy: LifecyclePolicy,
    from: ArchitectureLifecycleState,
    to: ArchitectureLifecycleState
): LifecycleTransitionRule | undefined {
    return policy.contract.allowedTransitions.find(
        (r) => r.from === from && r.to === to
    );
}

export function evaluateTransitionExistence(
    policy: LifecyclePolicy,
    transition: LifecycleTransition
): { exists: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (transition.from === ArchitectureLifecycleState.SUPERSEDED) {
        reasons.push("SUPERSEDED cannot transition to any previous state");
        return { exists: false, reasons };
    }

    if (
        transition.from === ArchitectureLifecycleState.FROZEN &&
        transition.to !== ArchitectureLifecycleState.SUPERSEDED
    ) {
        reasons.push("FROZEN may only transition to SUPERSEDED");
        return { exists: false, reasons };
    }

    const rule = findTransitionRule(policy, transition.from, transition.to);
    if (!rule) {
        reasons.push(
            `Transition ${transition.from} → ${transition.to} is not defined`
        );
        return { exists: false, reasons };
    }

    if (rule.conditional) {
        if (transition.freezeVerificationFail !== true) {
            reasons.push(
                "FREEZE_CANDIDATE → DESIGNING requires freezeVerification FAIL"
            );
        }
        if (transition.frozenIssued === true) {
            reasons.push(
                "FREEZE_CANDIDATE → DESIGNING forbidden when frozenIssued"
            );
        }
        if (reasons.length > 0) {
            return { exists: false, reasons };
        }
    }

    return { exists: true, reasons: [] };
}
