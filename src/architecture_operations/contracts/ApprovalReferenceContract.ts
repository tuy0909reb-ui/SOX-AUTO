/**
 * ASA-ARCH-44.0 — ApprovalReferenceContract
 * Immutable references to HUMAN_ARCHITECT approval artifacts only.
 */

export type ApprovalReferenceKind =
    | "FreezeAuthorizationReference"
    | "DecisionApprovalReference"
    | "SupersessionApprovalReference";

export interface ApprovalReferenceContract {
    readonly contractId: "ApprovalReferenceContract";
    readonly allowedKinds: readonly ApprovalReferenceKind[];
    readonly readOnly: true;
    readonly sourceAuthority: "HUMAN_ARCHITECT";
    readonly freezeCandidateToFrozenRequiresFreezeAuthorization: true;
    readonly supersessionRequiresSupersessionApproval: true;
    readonly doesNotReferenceValidationArtifacts: true;
}

export function freezeApprovalReferenceContract(): ApprovalReferenceContract {
    return Object.freeze({
        contractId: "ApprovalReferenceContract",
        allowedKinds: Object.freeze([
            "FreezeAuthorizationReference",
            "DecisionApprovalReference",
            "SupersessionApprovalReference",
        ] as const),
        readOnly: true,
        sourceAuthority: "HUMAN_ARCHITECT",
        freezeCandidateToFrozenRequiresFreezeAuthorization: true,
        supersessionRequiresSupersessionApproval: true,
        doesNotReferenceValidationArtifacts: true,
    });
}
