/**
 * ASA-ARCH-49.0 — RecommendationBuilder
 * Deterministic: identical ArchitectureStateInput + candidates ⇒ identical RecommendationSet.
 */

import {
    freezeArchitectureRecommendation,
    freezeRecommendationSet,
    type ArchitectureRecommendation,
    type ArchitectureRecommendationCandidate,
    type ArchitectureStateInput,
    type RecommendationSet,
} from "../models";
import {
    asRecommendationId,
    asRecommendationSetId,
    type RecommendationConfidence,
    type ConstraintStatus,
} from "../types";

export interface CandidateGenerationInput {
    readonly candidate: ArchitectureRecommendationCandidate;
    readonly recommendationConfidence: RecommendationConfidence;
    readonly constraintStatus: ConstraintStatus;
    readonly dependencyImpact: readonly string[];
}

export class RecommendationBuilder {
    readonly isDeterministic = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotApprove = true as const;
    readonly doesNotAuthorizeImplementation = true as const;

    build(input: {
        architectureState: ArchitectureStateInput;
        candidates: readonly CandidateGenerationInput[];
        recommendationSetId?: string;
    }): RecommendationSet {
        const state = input.architectureState;
        const ordered = [...input.candidates].sort((a, b) =>
            a.candidate.candidateId.localeCompare(b.candidate.candidateId)
        );

        const recommendations: ArchitectureRecommendation[] = ordered.map(
            (item, index) =>
                freezeArchitectureRecommendation({
                    recommendationId: asRecommendationId(
                        `REC-${state.architectureStateHash}-${item.candidate.candidateId}-${String(index).padStart(3, "0")}`
                    ),
                    architectureState: state,
                    candidate: item.candidate,
                    evidenceReference: item.candidate.evidenceReference,
                    traceabilityReference: state.traceabilityReference,
                    constraintStatus: item.constraintStatus,
                    dependencyImpact: item.dependencyImpact,
                    recommendationConfidence: item.recommendationConfidence,
                })
        );

        const setId =
            input.recommendationSetId?.trim() ||
            `RSET-${state.architectureStateHash}`;

        return freezeRecommendationSet({
            recommendationSetId: asRecommendationSetId(setId),
            architectureStateHash: state.architectureStateHash,
            traceabilityReference: state.traceabilityReference,
            evidenceReference: state.evidenceReference,
            recommendations,
        });
    }
}
