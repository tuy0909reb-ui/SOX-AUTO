/**
 * ASA-ARCH-44.0 — LifecycleValidationResultContract
 * Structural transition evaluation output shape.
 * Not Ch43 assurance validation output. Not a decision.
 */

export type StructuralValidationStatus = "PASS" | "FAIL";

export interface LifecycleValidationResultContract {
    readonly contractId: "LifecycleValidationResultContract";
    readonly status: StructuralValidationStatus;
    readonly reasons: readonly string[];
    readonly isStructuralEvaluationOnly: true;
    readonly isNotAssuranceValidation: true;
    readonly isNotDecision: true;
    readonly isNotAuthorityGrant: true;
}

export function freezeLifecycleValidationResultContract(
    result: Omit<
        LifecycleValidationResultContract,
        | "contractId"
        | "isStructuralEvaluationOnly"
        | "isNotAssuranceValidation"
        | "isNotDecision"
        | "isNotAuthorityGrant"
    >
): LifecycleValidationResultContract {
    return Object.freeze({
        contractId: "LifecycleValidationResultContract",
        status: result.status,
        reasons: Object.freeze([...result.reasons]),
        isStructuralEvaluationOnly: true,
        isNotAssuranceValidation: true,
        isNotDecision: true,
        isNotAuthorityGrant: true,
    });
}
