/**
 * ASA-ARCH-43.0 - Architecture Health Report (Draft 0.7)
 */

import type {
    HealthRecommendation,
    ValidationStatus,
} from "./ArchitectureValidationTypes";

export interface ArchitectureHealthReport {
    readonly id: string;
    readonly architecture_version: string;
    readonly timestamp: string;
    readonly contract_status: ValidationStatus;
    readonly boundary_status: ValidationStatus;
    readonly freeze_status: ValidationStatus;
    readonly integrity_status: ValidationStatus;
    readonly drift_detected: boolean;
    readonly validation_result: ValidationStatus;
    readonly evidence_hash: string;
    readonly recommendation: HealthRecommendation;
    readonly recommendationIsNotDecision: true;
}

export const HEALTH_RECOMMENDATIONS: ReadonlyArray<HealthRecommendation> =
    Object.freeze([
        "NONE",
        "REVIEW_REQUIRED",
        "INVESTIGATION_REQUIRED",
        "MANUAL_VALIDATION_REQUIRED",
    ]);

export function freezeArchitectureHealthReport(
    input: Omit<ArchitectureHealthReport, "recommendationIsNotDecision">
): ArchitectureHealthReport {
    if (!HEALTH_RECOMMENDATIONS.includes(input.recommendation)) {
        throw new Error(`Invalid recommendation: ${input.recommendation}`);
    }
    return Object.freeze({
        ...input,
        recommendationIsNotDecision: true as const,
    });
}
