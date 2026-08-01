/**
 * ASA-ARCH-47.0 — RiskLevel（candidate representation only）
 */

export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    UNKNOWN = "UNKNOWN",
}

export const RISK_LEVELS: readonly RiskLevel[] = Object.freeze([
    RiskLevel.LOW,
    RiskLevel.MEDIUM,
    RiskLevel.HIGH,
    RiskLevel.UNKNOWN,
]);

export function isRiskLevel(value: string): value is RiskLevel {
    return (RISK_LEVELS as readonly string[]).includes(value);
}
