/**
 * ASA-ARCH-49.0 — RecommendationContract
 */

export interface RecommendationContract {
    readonly contractId: "RecommendationContract";
    readonly inputKind: "ArchitectureState";
    readonly outputKind: "RecommendationSet";
    readonly containsCandidateInformation: true;
    readonly containsEvidenceReference: true;
    readonly containsConstraintStatus: true;
    readonly containsDependencyImpact: true;
    readonly containsRecommendationConfidence: true;
    readonly forbidsDecisionResult: true;
    readonly forbidsApprovalResult: true;
    readonly forbidsExecutionInstruction: true;
}

export function freezeRecommendationContract(): RecommendationContract {
    return Object.freeze({
        contractId: "RecommendationContract",
        inputKind: "ArchitectureState",
        outputKind: "RecommendationSet",
        containsCandidateInformation: true,
        containsEvidenceReference: true,
        containsConstraintStatus: true,
        containsDependencyImpact: true,
        containsRecommendationConfidence: true,
        forbidsDecisionResult: true,
        forbidsApprovalResult: true,
        forbidsExecutionInstruction: true,
    });
}
