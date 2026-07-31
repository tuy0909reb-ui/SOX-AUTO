/**
 * ASA-ARCH-44.0 — ValidationReferenceContract
 * Immutable references to Ch43 validation artifacts only.
 * No validation logic / evaluation / approval references.
 */

export type ValidationReferenceKind =
    | "ValidationEvidenceReference"
    | "ValidationResultReference"
    | "IntegrityReference";

export interface ValidationReferenceContract {
    readonly contractId: "ValidationReferenceContract";
    readonly allowedKinds: readonly ValidationReferenceKind[];
    readonly readOnly: true;
    readonly sourceChapter: "ASA-ARCH-43.0";
    readonly containsNoValidationLogic: true;
    readonly doesNotEvaluateValidationResults: true;
    readonly doesNotReferenceApprovalArtifacts: true;
    readonly forbidsRuntimeOrImplementationTargets: true;
}

export function freezeValidationReferenceContract(): ValidationReferenceContract {
    return Object.freeze({
        contractId: "ValidationReferenceContract",
        allowedKinds: Object.freeze([
            "ValidationEvidenceReference",
            "ValidationResultReference",
            "IntegrityReference",
        ] as const),
        readOnly: true,
        sourceChapter: "ASA-ARCH-43.0",
        containsNoValidationLogic: true,
        doesNotEvaluateValidationResults: true,
        doesNotReferenceApprovalArtifacts: true,
        forbidsRuntimeOrImplementationTargets: true,
    });
}
