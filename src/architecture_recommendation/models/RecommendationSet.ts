/**
 * ASA-ARCH-49.0 — RecommendationSet（possible evolution options only）
 */

import type {
    ArchitectureStateHash,
    EvidenceReference,
    RecommendationSetId,
    TraceabilityReference,
} from "../types";
import type { ArchitectureRecommendation } from "./ArchitectureRecommendation";

export interface RecommendationSet {
    readonly kind: "RecommendationSet";
    readonly recommendationSetId: RecommendationSetId;
    readonly architectureStateHash: ArchitectureStateHash;
    readonly traceabilityReference: TraceabilityReference;
    readonly evidenceReference: EvidenceReference;
    readonly recommendations: readonly ArchitectureRecommendation[];
    readonly decisionResult: null;
    readonly approvalResult: null;
    readonly executionInstruction: null;
    readonly humanReviewRequired: true;
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeRecommendationSet(input: {
    recommendationSetId: RecommendationSetId;
    architectureStateHash: ArchitectureStateHash;
    traceabilityReference: TraceabilityReference;
    evidenceReference: EvidenceReference;
    recommendations: readonly ArchitectureRecommendation[];
}): RecommendationSet {
    return Object.freeze({
        kind: "RecommendationSet",
        recommendationSetId: input.recommendationSetId,
        architectureStateHash: input.architectureStateHash,
        traceabilityReference: input.traceabilityReference,
        evidenceReference: input.evidenceReference,
        recommendations: Object.freeze([...input.recommendations]),
        decisionResult: null,
        approvalResult: null,
        executionInstruction: null,
        humanReviewRequired: true,
        immutable: true,
        doesNotDecide: true,
    });
}
