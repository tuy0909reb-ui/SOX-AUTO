import {
    ConstraintStatus,
    RecommendationConfidence,
    RiskAssessment,
    asArchitectureStateHash,
    asCandidateId,
    asEvidenceReference,
    asIntelligenceOutputReference,
    asTraceabilityReference,
    freezeArchitectureRecommendationCandidate,
    freezeArchitectureStateInput,
    type ArchitectureRecommendationCandidate,
    type ArchitectureStateInput,
    type CandidateGenerationInput,
} from "../../src/architecture_recommendation";

export function sampleArchitectureState(
    overrides?: Partial<{
        architectureStateHash: string;
        traceabilityReference: string;
        evidenceReference: string;
        intelligenceOutputReference: string;
    }>
): ArchitectureStateInput {
    return freezeArchitectureStateInput({
        architectureStateHash: asArchitectureStateHash(
            overrides?.architectureStateHash ?? "STATE-HASH-49-001"
        ),
        traceabilityReference: asTraceabilityReference(
            overrides?.traceabilityReference ?? "TRACE-REF-48-001"
        ),
        evidenceReference: asEvidenceReference(
            overrides?.evidenceReference ?? "EVID-REF-47-001"
        ),
        intelligenceOutputReference: asIntelligenceOutputReference(
            overrides?.intelligenceOutputReference ?? "INTEL-OUT-47-001"
        ),
        frozenArchitectureMetadata: ["ASA-ARCH-48.0-FROZEN"],
        constraintDefinitions: ["NO_RUNTIME_AUTHORITY"],
    });
}

export function sampleCandidate(
    overrides?: Partial<{
        candidateId: string;
        purpose: string;
        evidenceReference: string;
    }>
): ArchitectureRecommendationCandidate {
    return freezeArchitectureRecommendationCandidate({
        candidateId: asCandidateId(overrides?.candidateId ?? "CAND-49-001"),
        purpose: overrides?.purpose ?? "Extend recommendation boundary support",
        motivation: "Evidence indicates structured recommendation gap",
        expectedBenefit: "Controlled evolution candidate presentation",
        architectureImpact: "Adds support layer without decision authority",
        dependencyRequirement: ["ASA-ARCH-47.0", "ASA-ARCH-48.0"],
        riskAssessment: RiskAssessment.LOW,
        constraintStatus: ConstraintStatus.SATISFIED,
        evidenceReference: asEvidenceReference(
            overrides?.evidenceReference ?? "EVID-CAND-49-001"
        ),
    });
}

export function sampleCandidateInput(
    candidate?: ArchitectureRecommendationCandidate
): CandidateGenerationInput {
    return {
        candidate: candidate ?? sampleCandidate(),
        recommendationConfidence: RecommendationConfidence.MEDIUM,
        constraintStatus: ConstraintStatus.SATISFIED,
        dependencyImpact: ["ASA-ARCH-47.0", "ASA-ARCH-48.0"],
    };
}
