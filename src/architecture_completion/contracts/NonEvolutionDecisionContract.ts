/**
 * ASA-ARCH-50.0 — NonEvolutionDecisionContract
 */

export interface NonEvolutionDecisionContract {
    readonly contractId: "NonEvolutionDecisionContract";
    readonly completionEvaluationIsNotDecision: true;
    readonly completionEvaluationIsNotFutureAuthorization: true;
    readonly outputContainsCompletionEvidenceOnly: true;
    readonly forbidsApproval: true;
    readonly forbidsCommand: true;
    readonly forbidsExecutionInstruction: true;
    readonly forbidsAutomaticEvolution: true;
}

export function freezeNonEvolutionDecisionContract(): NonEvolutionDecisionContract {
    return Object.freeze({
        contractId: "NonEvolutionDecisionContract",
        completionEvaluationIsNotDecision: true,
        completionEvaluationIsNotFutureAuthorization: true,
        outputContainsCompletionEvidenceOnly: true,
        forbidsApproval: true,
        forbidsCommand: true,
        forbidsExecutionInstruction: true,
        forbidsAutomaticEvolution: true,
    });
}
