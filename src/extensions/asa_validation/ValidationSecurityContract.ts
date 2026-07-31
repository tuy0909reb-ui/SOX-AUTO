/**
 * ASA-ARCH-39.0 - Validation Security / Audit Compatibility / Determinism (Draft 0.4)
 *
 * Declarative security and accountability surfaces.
 */

/** Forbidden security behaviors. */
export type ValidationSecurityForbidKind =
    | "ModifySecurityPolicy"
    | "GrantPrivileges"
    | "BypassAuthentication"
    | "SuppressFindings"
    | "HideFailures"
    | "ManipulateValidationResult"
    | "ForgeEvidence"
    | "AlterAuditRecord";

/**
 * Validation Security Contract.
 */
export interface ValidationSecurityContract {
    readonly securityContractId: string;
    readonly forbiddenBehaviors: ReadonlyArray<ValidationSecurityForbidKind>;
    readonly forbidsModifySecurityPolicy: true;
    readonly forbidsGrantPrivileges: true;
    readonly forbidsBypassAuthentication: true;
    readonly forbidsSuppressFindings: true;
    readonly forbidsHideFailures: true;
    readonly forbidsManipulateValidationResult: true;
    readonly forbidsForgeEvidence: true;
    readonly forbidsAlterAuditRecord: true;
}

/**
 * Read-only audit compatibility with sibling Extensions.
 */
export interface ValidationAuditCompatibilityContract {
    readonly auditCompatibilityId: string;
    readonly compatibleWithOpsReadOnly: true;
    readonly compatibleWithConnectReadOnly: true;
    readonly compatibleWithAiReadOnly: true;
    readonly integrationIsReadOnly: true;
    readonly forbidsOpsDependencyOwnership: true;
    readonly forbidsConnectDependencyOwnership: true;
    readonly forbidsAiDependencyOwnership: true;
}

/**
 * Determinism metadata requirements for validation execution records.
 */
export interface ValidationDeterminismPolicy {
    readonly policyId: string;
    readonly requiredMetadata: ReadonlyArray<
        | "validatorVersion"
        | "ruleVersion"
        | "environmentVersion"
        | "configurationVersion"
        | "evidenceVersion"
        | "timestamp"
    >;
}

export function freezeValidationSecurityContract(
    contract: ValidationSecurityContract
): ValidationSecurityContract {
    return Object.freeze({
        ...contract,
        forbiddenBehaviors: Object.freeze([...contract.forbiddenBehaviors]),
    });
}

export function freezeValidationAuditCompatibilityContract(
    contract: ValidationAuditCompatibilityContract
): ValidationAuditCompatibilityContract {
    return Object.freeze({ ...contract });
}

export function freezeValidationDeterminismPolicy(
    policy: ValidationDeterminismPolicy
): ValidationDeterminismPolicy {
    return Object.freeze({
        ...policy,
        requiredMetadata: Object.freeze([...policy.requiredMetadata]),
    });
}
