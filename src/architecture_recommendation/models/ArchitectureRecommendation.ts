/**
 * ASA-ARCH-49.0 — ArchitectureRecommendation
 */

import type {
    ConstraintStatus,
    EvidenceReference,
    RecommendationConfidence,
    RecommendationId,
    TraceabilityReference,
} from "../types";
import type { ArchitectureRecommendationCandidate } from "./ArchitectureRecommendationCandidate";
import type { ArchitectureStateInput } from "./ArchitectureStateInput";

export interface ArchitectureRecommendation {
    readonly kind: "ArchitectureRecommendation";
    readonly recommendationId: RecommendationId;
    readonly architectureState: ArchitectureStateInput;
    readonly candidate: ArchitectureRecommendationCandidate;
    readonly evidenceReference: EvidenceReference;
    readonly traceabilityReference: TraceabilityReference;
    readonly constraintStatus: ConstraintStatus;
    readonly dependencyImpact: readonly string[];
    readonly recommendationConfidence: RecommendationConfidence;
    readonly humanReviewRequired: true;
    readonly decisionResult: null;
    readonly approvalResult: null;
    readonly executionInstruction: null;
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureRecommendation(input: {
    recommendationId: RecommendationId;
    architectureState: ArchitectureStateInput;
    candidate: ArchitectureRecommendationCandidate;
    evidenceReference: EvidenceReference;
    traceabilityReference: TraceabilityReference;
    constraintStatus: ConstraintStatus;
    dependencyImpact: readonly string[];
    recommendationConfidence: RecommendationConfidence;
}): ArchitectureRecommendation {
    return Object.freeze({
        kind: "ArchitectureRecommendation",
        recommendationId: input.recommendationId,
        architectureState: input.architectureState,
        candidate: input.candidate,
        evidenceReference: input.evidenceReference,
        traceabilityReference: input.traceabilityReference,
        constraintStatus: input.constraintStatus,
        dependencyImpact: Object.freeze([...input.dependencyImpact]),
        recommendationConfidence: input.recommendationConfidence,
        humanReviewRequired: true,
        decisionResult: null,
        approvalResult: null,
        executionInstruction: null,
        immutable: true,
        doesNotDecide: true,
    });
}
