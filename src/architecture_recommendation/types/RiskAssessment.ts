/**
 * ASA-ARCH-49.0 — RiskAssessment（representation only; not authority）
 */

export enum RiskAssessment {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    UNKNOWN = "UNKNOWN",
}

export const RISK_ASSESSMENTS: readonly RiskAssessment[] = Object.freeze([
    RiskAssessment.LOW,
    RiskAssessment.MEDIUM,
    RiskAssessment.HIGH,
    RiskAssessment.UNKNOWN,
]);

export function isRiskAssessment(value: string): value is RiskAssessment {
    return (RISK_ASSESSMENTS as readonly string[]).includes(value);
}
