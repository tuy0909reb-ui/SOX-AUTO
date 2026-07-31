/**
 * ASA-ARCH-44.0 — LifecycleTransition
 * Declared transition request (topology only).
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { TransitionIdentity } from "../identity/TransitionIdentity";
import type { OperationsAuthorityRole } from "../contracts/AuthorityContract";
import type { ArchitectureLifecycleState } from "./LifecycleState";

export interface LifecycleTransition {
    readonly transitionId: TransitionIdentity;
    readonly architecture: ArchitectureIdentity;
    readonly from: ArchitectureLifecycleState;
    readonly to: ArchitectureLifecycleState;
    readonly requestedBy: OperationsAuthorityRole;
    readonly freezeVerificationFail?: boolean;
    readonly frozenIssued?: boolean;
}

export function freezeLifecycleTransition(
    transition: LifecycleTransition
): LifecycleTransition {
    return Object.freeze({ ...transition });
}
