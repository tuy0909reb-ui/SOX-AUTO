/**
 * ASA-ARCH-39.0 - Validation Contract / Provider Role (Draft 0.4)
 *
 * Technology-independent validation operations surface.
 * Structural declarations only — not a validation engine.
 */

/** Declared Validation Contract operations. */
export type ValidationOperation =
    | "validate"
    | "verify"
    | "compare"
    | "assess"
    | "report"
    | "generateCertificationResult";

/**
 * Validation Contract — method surface only.
 */
export interface ValidationContract {
    readonly contractId: string;
    readonly operations: ReadonlyArray<ValidationOperation>;
    readonly technologyIndependent: true;
    readonly forbidsVendorCoupling: true;
    readonly forbidsAutonomousExecution: true;
    readonly forbidsPolicyMutation: true;
}

/**
 * Validation Provider role declaration.
 * Validation Provider ≠ Execution Provider.
 */
export interface ValidationProviderRole {
    readonly roleId: string;
    readonly validatesContracts: true;
    readonly evaluatesCompliance: true;
    readonly detectsViolations: true;
    readonly collectsEvidenceReference: true;
    readonly producesAssuranceResults: true;
    readonly isNotExecutionProvider: true;
}

export function freezeValidationContract(
    contract: ValidationContract
): ValidationContract {
    return Object.freeze({
        ...contract,
        operations: Object.freeze([...contract.operations]),
    });
}

export function freezeValidationProviderRole(
    role: ValidationProviderRole
): ValidationProviderRole {
    return Object.freeze({ ...role });
}
