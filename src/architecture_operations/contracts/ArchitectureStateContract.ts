/**
 * ASA-ARCH-44.0 — ArchitectureStateContract
 * External declarative state schema.
 * Not a runtime decision source. Lifecycle state is represented only by `status`.
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { ArchitectureLifecycleState } from "../lifecycle/LifecycleState";

export interface ArchitectureStateContract {
    readonly architecture: ArchitectureIdentity;
    readonly version: string;
    readonly status: ArchitectureLifecycleState;
    readonly integrityReference: string | null;
    readonly validationEvidenceReference: string | null;
    readonly approvalReference: string | null;
    readonly isNotRuntimeDecisionSource: true;
    readonly statusIsSoleLifecycleField: true;
}

export function freezeArchitectureStateContract(
    state: Omit<
        ArchitectureStateContract,
        "isNotRuntimeDecisionSource" | "statusIsSoleLifecycleField"
    >
): ArchitectureStateContract {
    return Object.freeze({
        ...state,
        isNotRuntimeDecisionSource: true,
        statusIsSoleLifecycleField: true,
    });
}
