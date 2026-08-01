/**
 * ASA-ARCH-49.0 — RecommendationLifecycle
 * Representation only; terminates before decision authority.
 */

import {
    EXTERNAL_DECISION_STAGE,
    OWNED_LIFECYCLE_STAGES,
    RecommendationLifecycleStage,
    isOwnedLifecycleStage,
} from "../types";

export interface RecommendationLifecycleView {
    readonly kind: "RecommendationLifecycleView";
    readonly stages: readonly RecommendationLifecycleStage[];
    readonly ownedStages: readonly RecommendationLifecycleStage[];
    readonly currentStage: RecommendationLifecycleStage;
    readonly terminatesBeforeDecisionAuthority: true;
    readonly externalDecisionStage: RecommendationLifecycleStage;
    readonly doesNotExecuteDecision: true;
    readonly immutable: true;
}

export function freezeRecommendationLifecycleView(input: {
    currentStage: RecommendationLifecycleStage;
}): RecommendationLifecycleView {
    if (
        input.currentStage === EXTERNAL_DECISION_STAGE ||
        !isOwnedLifecycleStage(input.currentStage)
    ) {
        throw new Error(
            "ASA-ARCH-49.0 lifecycle view cannot occupy HUMAN_DECISION; decision authority is external"
        );
    }
    return Object.freeze({
        kind: "RecommendationLifecycleView",
        stages: Object.freeze([
            ...OWNED_LIFECYCLE_STAGES,
            EXTERNAL_DECISION_STAGE,
        ]),
        ownedStages: OWNED_LIFECYCLE_STAGES,
        currentStage: input.currentStage,
        terminatesBeforeDecisionAuthority: true,
        externalDecisionStage: EXTERNAL_DECISION_STAGE,
        doesNotExecuteDecision: true,
        immutable: true,
    });
}

export function advanceOwnedLifecycleStage(
    current: RecommendationLifecycleStage
): RecommendationLifecycleStage {
    const idx = OWNED_LIFECYCLE_STAGES.indexOf(current);
    if (idx < 0) {
        throw new Error("current stage is not owned by ASA-ARCH-49.0");
    }
    if (idx >= OWNED_LIFECYCLE_STAGES.length - 1) {
        return RecommendationLifecycleStage.HUMAN_REVIEW;
    }
    return OWNED_LIFECYCLE_STAGES[idx + 1]!;
}
