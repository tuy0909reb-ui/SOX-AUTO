/**
 * ASA-ARCH-44.0 — LifecycleOperation
 * Transforms validated transition packages into immutable registry append requests.
 * Does not decide, authorize, validate rules, mutate state, or create approvals.
 */

import type { TransitionValidationResult } from "../compliance/TransitionValidationResult";
import type { AuthorityValidationResult } from "../compliance/AuthorityValidationResult";
import type { ArchitectureIdentity } from "../identity/ArchitectureIdentity";
import type { TransitionIdentity } from "../identity/TransitionIdentity";
import type { ApprovalReference } from "../references/ApprovalReference";
import type { ValidationReference } from "../references/ValidationReference";
import type { ArchitectureLifecycleState } from "./LifecycleState";
import type { LifecycleTransition } from "./LifecycleTransition";

export interface ValidatedTransitionPackage {
    readonly transition: LifecycleTransition;
    readonly transitionEvaluationEvidenceReference: string;
    readonly authorityVerificationEvidenceReference: string;
    readonly validationReference: ValidationReference | null;
    readonly approvalReference: ApprovalReference | null;
    readonly transitionValidation: TransitionValidationResult;
    readonly authorityValidation: AuthorityValidationResult;
}

export interface ImmutableRegistryAppendRequest {
    readonly architecture: ArchitectureIdentity;
    readonly transitionId: TransitionIdentity;
    readonly from: ArchitectureLifecycleState;
    readonly to: ArchitectureLifecycleState;
    readonly transitionEvaluationEvidenceReference: string;
    readonly authorityVerificationEvidenceReference: string;
    readonly validationReference: ValidationReference | null;
    readonly approvalReference: ApprovalReference | null;
    readonly integrityMetadata: Readonly<{
        noRawValidatorResults: true;
        noDecisionData: true;
        noAuthorityGenerationData: true;
    }>;
    readonly containsNoRawValidatorResults: true;
    readonly containsNoDecisionData: true;
    readonly containsNoAuthorityGenerationData: true;
}

export function buildRegistryAppendRequest(
    package_: ValidatedTransitionPackage
): ImmutableRegistryAppendRequest {
    if (package_.transitionValidation.status !== "PASS") {
        throw new Error(
            "LifecycleOperation requires PASS TransitionValidationResult"
        );
    }
    if (package_.authorityValidation.status !== "PASS") {
        throw new Error(
            "LifecycleOperation requires PASS AuthorityValidationResult"
        );
    }
    if (
        package_.transitionValidation.transitionId !==
            package_.transition.transitionId ||
        package_.authorityValidation.transitionId !==
            package_.transition.transitionId
    ) {
        throw new Error("Evidence references must match transition identity");
    }

    return Object.freeze({
        architecture: package_.transition.architecture,
        transitionId: package_.transition.transitionId,
        from: package_.transition.from,
        to: package_.transition.to,
        transitionEvaluationEvidenceReference:
            package_.transitionEvaluationEvidenceReference,
        authorityVerificationEvidenceReference:
            package_.authorityVerificationEvidenceReference,
        validationReference: package_.validationReference,
        approvalReference: package_.approvalReference,
        integrityMetadata: Object.freeze({
            noRawValidatorResults: true as const,
            noDecisionData: true as const,
            noAuthorityGenerationData: true as const,
        }),
        containsNoRawValidatorResults: true,
        containsNoDecisionData: true,
        containsNoAuthorityGenerationData: true,
    });
}

export const LIFECYCLE_OPERATION_CAPABILITIES = Object.freeze({
    validatedPackageTransformationOnly: true,
    canBypassValidator: false,
    canInvokeCh42: false,
    canInvokeCh43: false,
    canCreateApproval: false,
    canGenerateDecisions: false,
    canMutateLifecycleState: false,
    canModifyLifecyclePolicy: false,
});
