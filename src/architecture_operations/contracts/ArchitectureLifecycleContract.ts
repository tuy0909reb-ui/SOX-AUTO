/**
 * ASA-ARCH-44.0 — ArchitectureLifecycleContract
 * Declares lifecycle state model and transition topology.
 * Does not define approval, freeze authorization, or architecture modification.
 */

import {
    ArchitectureLifecycleState,
    LIFECYCLE_STATES,
} from "../lifecycle/LifecycleState";

export type TransitionAuthorityRole =
    | "OPERATIONS_COORDINATOR"
    | "HUMAN_ARCHITECT";

export interface LifecycleTransitionRule {
    readonly from: ArchitectureLifecycleState;
    readonly to: ArchitectureLifecycleState;
    readonly authority: TransitionAuthorityRole;
    readonly conditional?: Readonly<{
        freezeVerification: "FAIL";
        humanApprovalRequired: true;
        frozenIssued: false;
    }>;
}

export interface ArchitectureLifecycleContract {
    readonly contractId: "ArchitectureLifecycleContract";
    readonly states: readonly ArchitectureLifecycleState[];
    readonly allowedTransitions: readonly LifecycleTransitionRule[];
    readonly forbidsFrozenToDesigning: true;
    readonly forbidsFrozenToImplemented: true;
    readonly forbidsSupersededToPrevious: true;
    readonly forbidsUnauthorizedTransition: true;
    readonly doesNotDefineApprovalDecision: true;
    readonly doesNotDefineFreezeAuthorization: true;
    readonly doesNotDefineArchitectureModification: true;
}

const ALLOWED: readonly LifecycleTransitionRule[] = Object.freeze([
    Object.freeze({
        from: ArchitectureLifecycleState.REGISTERED,
        to: ArchitectureLifecycleState.DESIGNING,
        authority: "OPERATIONS_COORDINATOR" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.DESIGNING,
        to: ArchitectureLifecycleState.IMPLEMENTED,
        authority: "OPERATIONS_COORDINATOR" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.IMPLEMENTED,
        to: ArchitectureLifecycleState.VERIFIED,
        authority: "OPERATIONS_COORDINATOR" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.VERIFIED,
        to: ArchitectureLifecycleState.FREEZE_CANDIDATE,
        authority: "OPERATIONS_COORDINATOR" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
        to: ArchitectureLifecycleState.FROZEN,
        authority: "HUMAN_ARCHITECT" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.FROZEN,
        to: ArchitectureLifecycleState.SUPERSEDED,
        authority: "HUMAN_ARCHITECT" as const,
    }),
    Object.freeze({
        from: ArchitectureLifecycleState.FREEZE_CANDIDATE,
        to: ArchitectureLifecycleState.DESIGNING,
        authority: "HUMAN_ARCHITECT" as const,
        conditional: Object.freeze({
            freezeVerification: "FAIL" as const,
            humanApprovalRequired: true as const,
            frozenIssued: false as const,
        }),
    }),
]);

export function freezeArchitectureLifecycleContract(): ArchitectureLifecycleContract {
    return Object.freeze({
        contractId: "ArchitectureLifecycleContract",
        states: LIFECYCLE_STATES,
        allowedTransitions: ALLOWED,
        forbidsFrozenToDesigning: true,
        forbidsFrozenToImplemented: true,
        forbidsSupersededToPrevious: true,
        forbidsUnauthorizedTransition: true,
        doesNotDefineApprovalDecision: true,
        doesNotDefineFreezeAuthorization: true,
        doesNotDefineArchitectureModification: true,
    });
}
