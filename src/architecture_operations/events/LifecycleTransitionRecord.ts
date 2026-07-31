/**
 * ASA-ARCH-44.0 — LifecycleTransitionRecord
 * Immutable historical transition record.
 */

import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { RecordIdentity } from "../identity/RecordIdentity";
import type { TransitionIdentity } from "../identity/TransitionIdentity";
import type { ArchitectureLifecycleState } from "../lifecycle/LifecycleState";
import type { ApprovalReference } from "../references/ApprovalReference";
import type { ValidationReference } from "../references/ValidationReference";

export interface LifecycleTransitionRecord {
    readonly recordId: RecordIdentity;
    readonly transitionId: TransitionIdentity;
    readonly architecture: ArchitectureIdentity;
    readonly from: ArchitectureLifecycleState;
    readonly to: ArchitectureLifecycleState;
    readonly transitionEvaluationEvidenceReference: string;
    readonly authorityVerificationEvidenceReference: string;
    readonly validationReference: ValidationReference | null;
    readonly approvalReference: ApprovalReference | null;
    readonly timestamp: string;
    readonly immutable: true;
}

export function freezeLifecycleTransitionRecord(
    record: Omit<LifecycleTransitionRecord, "immutable">
): LifecycleTransitionRecord {
    return Object.freeze({
        ...record,
        immutable: true,
    });
}
