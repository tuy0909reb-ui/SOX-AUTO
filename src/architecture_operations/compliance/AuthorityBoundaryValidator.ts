/**
 * ASA-ARCH-44.0 — AuthorityBoundaryValidator
 * Verifies declared authority requirements. Does not create approvals.
 */

import {
    freezeArchitectureLifecycleContract,
    type TransitionAuthorityRole,
} from "../contracts/ArchitectureLifecycleContract";
import type { OperationsAuthorityRole } from "../contracts/AuthorityContract";
import { findTransitionRule, freezeLifecyclePolicy } from "../lifecycle/LifecyclePolicy";
import type { LifecycleTransition } from "../lifecycle/LifecycleTransition";
import { ArchitectureLifecycleState } from "../lifecycle/LifecycleState";
import type { ApprovalReference } from "../references/ApprovalReference";
import {
    freezeAuthorityValidationResult,
    type AuthorityValidationResult,
} from "./AuthorityValidationResult";

function roleMayAct(
    required: TransitionAuthorityRole,
    requestedBy: OperationsAuthorityRole
): boolean {
    if (requestedBy === "AI_AGENT") {
        return false;
    }
    if (required === "HUMAN_ARCHITECT") {
        return requestedBy === "HUMAN_ARCHITECT";
    }
    // OPERATIONS_COORDINATOR transitions may be performed by coordinator or human
    return (
        requestedBy === "OPERATIONS_COORDINATOR" ||
        requestedBy === "HUMAN_ARCHITECT"
    );
}

export function validateAuthorityBoundary(input: {
    transition: LifecycleTransition;
    approvalReference: ApprovalReference | null;
}): AuthorityValidationResult {
    const { transition, approvalReference } = input;
    const reasons: string[] = [];
    const policy = freezeLifecyclePolicy(freezeArchitectureLifecycleContract());
    const rule = findTransitionRule(policy, transition.from, transition.to);

    if (!rule) {
        reasons.push("No transition rule for authority verification");
        return freezeAuthorityValidationResult({
            transitionId: transition.transitionId,
            status: "FAIL",
            reasons,
        });
    }

    if (transition.requestedBy === "AI_AGENT") {
        reasons.push("AI_AGENT cannot authorize lifecycle transitions");
    }

    if (!roleMayAct(rule.authority, transition.requestedBy)) {
        reasons.push(
            `${transition.requestedBy} cannot authorize ${transition.from} → ${transition.to} (requires ${rule.authority})`
        );
    }

    const needsHumanApproval =
        rule.authority === "HUMAN_ARCHITECT" ||
        transition.to === ArchitectureLifecycleState.FROZEN ||
        transition.to === ArchitectureLifecycleState.SUPERSEDED ||
        (transition.from === ArchitectureLifecycleState.FREEZE_CANDIDATE &&
            transition.to === ArchitectureLifecycleState.DESIGNING);

    if (needsHumanApproval) {
        if (!approvalReference) {
            reasons.push("Missing HUMAN_ARCHITECT approval reference");
        } else if (approvalReference.sourceAuthority !== "HUMAN_ARCHITECT") {
            reasons.push("Invalid approver — must be HUMAN_ARCHITECT");
        } else if (
            transition.to === ArchitectureLifecycleState.FROZEN &&
            approvalReference.kind !== "FreezeAuthorizationReference"
        ) {
            reasons.push(
                "FREEZE_CANDIDATE → FROZEN requires FreezeAuthorizationReference"
            );
        } else if (
            transition.to === ArchitectureLifecycleState.SUPERSEDED &&
            approvalReference.kind !== "SupersessionApprovalReference"
        ) {
            reasons.push(
                "FROZEN → SUPERSEDED requires SupersessionApprovalReference"
            );
        }
    }

    return freezeAuthorityValidationResult({
        transitionId: transition.transitionId,
        status: reasons.length === 0 ? "PASS" : "FAIL",
        reasons,
    });
}

export const AUTHORITY_BOUNDARY_VALIDATOR_CAPABILITIES = Object.freeze({
    canCreateApproval: false,
    canModifyAuthorityPolicy: false,
    canBypassMissingApproval: false,
});
