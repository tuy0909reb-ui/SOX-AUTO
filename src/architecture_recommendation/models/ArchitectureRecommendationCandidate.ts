/**
 * ASA-ARCH-49.0 — ArchitectureRecommendationCandidate
 * Comparison / presentation structure — not architecture creation.
 */

import type {
    CandidateId,
    ConstraintStatus,
    EvidenceReference,
    RiskAssessment,
} from "../types";

export interface ArchitectureRecommendationCandidate {
    readonly kind: "ArchitectureRecommendationCandidate";
    readonly candidateId: CandidateId;
    readonly purpose: string;
    readonly motivation: string;
    readonly expectedBenefit: string;
    readonly architectureImpact: string;
    readonly dependencyRequirement: readonly string[];
    readonly riskAssessment: RiskAssessment;
    readonly constraintStatus: ConstraintStatus;
    readonly evidenceReference: EvidenceReference;
    readonly humanReviewRequired: true;
    readonly immutable: true;
    readonly doesNotCreateArchitecture: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureRecommendationCandidate(input: {
    candidateId: CandidateId;
    purpose: string;
    motivation: string;
    expectedBenefit: string;
    architectureImpact: string;
    dependencyRequirement: readonly string[];
    riskAssessment: RiskAssessment;
    constraintStatus: ConstraintStatus;
    evidenceReference: EvidenceReference;
}): ArchitectureRecommendationCandidate {
    const require = (label: string, value: string) => {
        if (!value.trim()) throw new Error(`${label} must be non-empty`);
        return value.trim();
    };
    return Object.freeze({
        kind: "ArchitectureRecommendationCandidate",
        candidateId: input.candidateId,
        purpose: require("purpose", input.purpose),
        motivation: require("motivation", input.motivation),
        expectedBenefit: require("expectedBenefit", input.expectedBenefit),
        architectureImpact: require(
            "architectureImpact",
            input.architectureImpact
        ),
        dependencyRequirement: Object.freeze(
            input.dependencyRequirement.map((d) => d.trim()).filter(Boolean)
        ),
        riskAssessment: input.riskAssessment,
        constraintStatus: input.constraintStatus,
        evidenceReference: input.evidenceReference,
        humanReviewRequired: true,
        immutable: true,
        doesNotCreateArchitecture: true,
        doesNotDecide: true,
    });
}
