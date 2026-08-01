/**
 * ASA-ARCH-49.0 — NonDecisionComplianceContract
 */

export interface NonDecisionComplianceContract {
    readonly contractId: "NonDecisionComplianceContract";
    readonly recommendationIsNotDecision: true;
    readonly outputContainsRecommendationInformationOnly: true;
    readonly forbidsApproval: true;
    readonly forbidsCommand: true;
    readonly forbidsExecutionInstruction: true;
    readonly lifecycleTerminatesBeforeDecisionAuthority: true;
    readonly humanReviewRequiredDefault: true;
}

export function freezeNonDecisionComplianceContract(): NonDecisionComplianceContract {
    return Object.freeze({
        contractId: "NonDecisionComplianceContract",
        recommendationIsNotDecision: true,
        outputContainsRecommendationInformationOnly: true,
        forbidsApproval: true,
        forbidsCommand: true,
        forbidsExecutionInstruction: true,
        lifecycleTerminatesBeforeDecisionAuthority: true,
        humanReviewRequiredDefault: true,
    });
}
