/**
 * ASA-ARCH-49.0 — RecommendationLifecycleStage
 *
 * Owned stages terminate at RECOMMENDATION_OUTPUT / HUMAN_REVIEW presentation.
 * HUMAN_DECISION is an external terminal marker — not exercised by this layer.
 */

export enum RecommendationLifecycleStage {
    ARCHITECTURE_STATE_INPUT = "ARCHITECTURE_STATE_INPUT",
    CANDIDATE_GENERATION = "CANDIDATE_GENERATION",
    EVIDENCE_ASSOCIATION = "EVIDENCE_ASSOCIATION",
    RECOMMENDATION_OUTPUT = "RECOMMENDATION_OUTPUT",
    HUMAN_REVIEW = "HUMAN_REVIEW",
    HUMAN_DECISION = "HUMAN_DECISION",
}

/** Stages owned / represented by ASA-ARCH-49.0（before decision authority）. */
export const OWNED_LIFECYCLE_STAGES: readonly RecommendationLifecycleStage[] =
    Object.freeze([
        RecommendationLifecycleStage.ARCHITECTURE_STATE_INPUT,
        RecommendationLifecycleStage.CANDIDATE_GENERATION,
        RecommendationLifecycleStage.EVIDENCE_ASSOCIATION,
        RecommendationLifecycleStage.RECOMMENDATION_OUTPUT,
        RecommendationLifecycleStage.HUMAN_REVIEW,
    ]);

export const EXTERNAL_DECISION_STAGE =
    RecommendationLifecycleStage.HUMAN_DECISION;

export function isOwnedLifecycleStage(
    stage: RecommendationLifecycleStage
): boolean {
    return (OWNED_LIFECYCLE_STAGES as readonly RecommendationLifecycleStage[]).includes(
        stage
    );
}
