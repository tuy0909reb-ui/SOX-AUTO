/**
 * ASA-ARCH-39.0 - Finding / Severity / Risk Assessment Boundary (Draft 0.4)
 *
 * Declarative finding model. Risk assessment is information only.
 */

/** Finding severity. */
export type FindingSeverity =
    | "INFO"
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

/** Finding lifecycle status. */
export type FindingStatus =
    | "OPEN"
    | "ACKNOWLEDGED"
    | "RESOLVED"
    | "IGNORED";

/** Required Finding fields. */
export type FindingField =
    | "id"
    | "category"
    | "description"
    | "severity"
    | "evidence"
    | "recommendation"
    | "status"
    | "timestamp";

/**
 * Finding Contract — schema surface only.
 */
export interface FindingContract {
    readonly findingContractId: string;
    readonly requiredFields: ReadonlyArray<FindingField>;
    readonly allowedSeverities: ReadonlyArray<FindingSeverity>;
    readonly allowedStatuses: ReadonlyArray<FindingStatus>;
    readonly recommendationIsNotCorrection: true;
}

/**
 * Risk Assessment Boundary.
 * Finding Severity → Risk Assessment → ValidationResult RiskLevel.
 */
export interface RiskAssessmentBoundary {
    readonly boundaryId: string;
    readonly findingSeverityContributesToRisk: true;
    readonly riskLevelIsAggregateAssessment: true;
    readonly riskLevelDoesNotAuthorizeAction: true;
    readonly riskLevelIsAssessmentInformationOnly: true;
}

export function freezeFindingContract(
    contract: FindingContract
): FindingContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
        allowedSeverities: Object.freeze([...contract.allowedSeverities]),
        allowedStatuses: Object.freeze([...contract.allowedStatuses]),
    });
}

export function freezeRiskAssessmentBoundary(
    boundary: RiskAssessmentBoundary
): RiskAssessmentBoundary {
    return Object.freeze({ ...boundary });
}
