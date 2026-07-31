/**
 * ASA-ARCH-39.0 - Validation Result / Confidence / Risk Level (Draft 0.4)
 *
 * Declarative result model surface.
 * Confidence ≠ Approval; RiskLevel ≠ Authorization.
 */

/** Validation target kinds. */
export type ValidationTargetType =
    | "Architecture"
    | "Extension"
    | "Contract"
    | "Provider"
    | "Configuration"
    | "ExecutionRecord";

/** Validation result status. */
export type ValidationResultStatus = "PASS" | "WARN" | "FAIL" | "UNKNOWN";

/** Aggregate risk level on ValidationResult (assessment only). */
export type ValidationRiskLevel =
    | "NONE"
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

/** Required ValidationResult fields. */
export type ValidationResultField =
    | "id"
    | "target"
    | "targetType"
    | "scope"
    | "status"
    | "checks"
    | "findings"
    | "evidence"
    | "riskLevel"
    | "confidence"
    | "validatorVersion"
    | "ruleVersion"
    | "timestamp";

/**
 * Validation Result Contract — schema surface only.
 */
export interface ValidationResultContract {
    readonly resultContractId: string;
    readonly requiredFields: ReadonlyArray<ValidationResultField>;
    readonly allowedTargetTypes: ReadonlyArray<ValidationTargetType>;
    readonly allowedStatuses: ReadonlyArray<ValidationResultStatus>;
    readonly allowedRiskLevels: ReadonlyArray<ValidationRiskLevel>;
    readonly riskLevelIsAssessmentOnly: true;
    readonly riskLevelDoesNotAuthorizeAction: true;
}

/**
 * Validation Confidence Contract.
 * Represents validation reliability only — not approval or execution permission.
 */
export interface ValidationConfidenceContract {
    readonly confidenceContractId: string;
    readonly valueRange: "0.0_TO_1.0";
    readonly requiredFields: ReadonlyArray<"value" | "reason" | "calculationMethod">;
    readonly confidenceIsNotApproval: true;
    readonly confidenceIsNotExecutionPermission: true;
}

export function freezeValidationResultContract(
    contract: ValidationResultContract
): ValidationResultContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
        allowedTargetTypes: Object.freeze([...contract.allowedTargetTypes]),
        allowedStatuses: Object.freeze([...contract.allowedStatuses]),
        allowedRiskLevels: Object.freeze([...contract.allowedRiskLevels]),
    });
}

export function freezeValidationConfidenceContract(
    contract: ValidationConfidenceContract
): ValidationConfidenceContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
