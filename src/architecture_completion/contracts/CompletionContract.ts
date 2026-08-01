/**
 * ASA-ARCH-50.0 — CompletionContract
 */

export interface CompletionContract {
    readonly contractId: "CompletionContract";
    readonly inputKind: "ArchitectureState";
    readonly outputKind: "CompletionReport";
    readonly containsCompletionStatus: true;
    readonly containsArchitectureCoverage: true;
    readonly containsEvidenceReference: true;
    readonly containsVerificationReference: true;
    readonly containsFreezeReference: true;
    readonly containsBaselineDigest: true;
    readonly forbidsEvolutionDecision: true;
    readonly forbidsApprovalResult: true;
    readonly forbidsExecutionInstruction: true;
}

export function freezeCompletionContract(): CompletionContract {
    return Object.freeze({
        contractId: "CompletionContract",
        inputKind: "ArchitectureState",
        outputKind: "CompletionReport",
        containsCompletionStatus: true,
        containsArchitectureCoverage: true,
        containsEvidenceReference: true,
        containsVerificationReference: true,
        containsFreezeReference: true,
        containsBaselineDigest: true,
        forbidsEvolutionDecision: true,
        forbidsApprovalResult: true,
        forbidsExecutionInstruction: true,
    });
}
