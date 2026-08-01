/**
 * ASA-ARCH-49.0 — RecommendationConfidence（representation only）
 */

export enum RecommendationConfidence {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE",
}

export const RECOMMENDATION_CONFIDENCES: readonly RecommendationConfidence[] =
    Object.freeze([
        RecommendationConfidence.HIGH,
        RecommendationConfidence.MEDIUM,
        RecommendationConfidence.LOW,
        RecommendationConfidence.INSUFFICIENT_EVIDENCE,
    ]);

export function isRecommendationConfidence(
    value: string
): value is RecommendationConfidence {
    return (RECOMMENDATION_CONFIDENCES as readonly string[]).includes(value);
}
