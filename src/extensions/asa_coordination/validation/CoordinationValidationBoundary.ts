/**
 * ASA-ARCH-40.0 - Coordination Validation Boundary (Draft 0.4)
 *
 * Read-only integration with ASA-VALIDATION (39.0).
 * Validation Result ≠ Coordination Control.
 */

/**
 * Coordination Validation Boundary.
 */
export interface CoordinationValidationBoundary {
    readonly boundaryId: string;
    readonly integratesWithAsaValidationReadOnly: true;
    readonly mayValidateCoordinationPlanStructure: true;
    readonly mayValidateCoordinationResultIntegrity: true;
    readonly integrationIsReadOnly: true;
    readonly validationResultIsNotCoordinationControl: true;
    readonly validationFailureDoesNotAutomaticallyStopOrMutateCoordination: true;
    readonly forbidsValidationControllingCoordinationAutomatically: true;
    readonly forbidsValidationDependencyOwnership: true;
}

export function freezeCoordinationValidationBoundary(
    boundary: CoordinationValidationBoundary
): CoordinationValidationBoundary {
    return Object.freeze({ ...boundary });
}
