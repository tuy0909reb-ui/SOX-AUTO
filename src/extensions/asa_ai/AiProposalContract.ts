/**
 * ASA-ARCH-38.0 - AI Proposal / Evidence / Confidence / Uncertainty (Draft 0.5)
 *
 * Declarative proposal and supporting contracts.
 * Proposal ≠ Execution.
 */

/** Evidence type kinds. */
export type AiEvidenceType = "Fact" | "Observation" | "External" | "Derived";

/**
 * Evidence Contract.
 */
export interface AiEvidenceContract {
    readonly evidenceContractId: string;
    readonly allowedTypes: ReadonlyArray<AiEvidenceType>;
    readonly requiresSource: true;
    readonly requiresTimestamp: true;
    readonly requiresReference: true;
    readonly requiresConfidence: true;
}

/**
 * Assumption Contract.
 */
export interface AiAssumptionContract {
    readonly assumptionContractId: string;
    readonly requiresDescription: true;
    readonly requiresProbability: true;
    readonly requiresImpact: true;
    readonly requiresConfidence: true;
    readonly requiresExpiry: true;
}

/**
 * Confidence Contract — Confidence ≠ Correctness.
 */
export interface AiConfidenceContract {
    readonly confidenceContractId: string;
    readonly valueRange: "0.0_TO_1.0";
    readonly requiresReason: true;
    readonly requiresEstimationMethod: true;
    readonly confidenceIsNotCorrectness: true;
}

/**
 * Uncertainty Contract.
 */
export interface AiUncertaintyContract {
    readonly uncertaintyContractId: string;
    readonly requiredFlags: ReadonlyArray<
        | "unknown"
        | "insufficientEvidence"
        | "modelLimitation"
        | "dataGap"
        | "conflict"
        | "hallucinationRisk"
    >;
}

/**
 * Required AIProposal field names (structural completeness).
 */
export type AiProposalField =
    | "id"
    | "title"
    | "summary"
    | "goal"
    | "context"
    | "constraints"
    | "recommendation"
    | "alternatives"
    | "expectedBenefit"
    | "expectedRisk"
    | "decisionImpact"
    | "dependencies"
    | "proposedAction"
    | "confidence"
    | "evidence"
    | "assumptions"
    | "limitations"
    | "uncertainties"
    | "hallucinationRisk"
    | "riskLevel"
    | "timestamp"
    | "provider"
    | "providerVersion"
    | "model"
    | "modelVersion"
    | "knowledgeVersion"
    | "sessionId";

/**
 * AI Proposal Contract — output shape declaration.
 */
export interface AiProposalContract {
    readonly proposalContractId: string;
    readonly requiredFields: ReadonlyArray<AiProposalField>;
    readonly proposalIsNotExecution: true;
    readonly forbidsExecutionCommand: true;
    readonly forbidsPolicyMutation: true;
    readonly forbidsRuntimeMutation: true;
    readonly humanMayRejectWithoutExplanation: true;
    readonly aiCannotRequireAcceptance: true;
}

export function freezeAiEvidenceContract(
    contract: AiEvidenceContract
): AiEvidenceContract {
    return Object.freeze({
        ...contract,
        allowedTypes: Object.freeze([...contract.allowedTypes]),
    });
}

export function freezeAiAssumptionContract(
    contract: AiAssumptionContract
): AiAssumptionContract {
    return Object.freeze({ ...contract });
}

export function freezeAiConfidenceContract(
    contract: AiConfidenceContract
): AiConfidenceContract {
    return Object.freeze({ ...contract });
}

export function freezeAiUncertaintyContract(
    contract: AiUncertaintyContract
): AiUncertaintyContract {
    return Object.freeze({
        ...contract,
        requiredFlags: Object.freeze([...contract.requiredFlags]),
    });
}

export function freezeAiProposalContract(
    contract: AiProposalContract
): AiProposalContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
