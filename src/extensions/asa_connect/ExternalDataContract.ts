/**
 * ASA-ARCH-37.0 - External Data Contract (Draft 0.3)
 *
 * External Data = Untrusted Input.
 * Validation Before Trust — declarative pipeline only.
 */

/** Required validation kinds. */
export type ExternalDataValidationKind =
    | "SCHEMA"
    | "VERSION"
    | "INTEGRITY"
    | "COMPATIBILITY";

/**
 * External Data Trust Boundary Contract.
 */
export interface ExternalDataContract {
    readonly contractId: string;
    readonly treatsExternalDataAsUntrusted: true;
    readonly validationBeforeTrust: true;
    readonly pipeline: ReadonlyArray<
        | "EXTERNAL_DATA"
        | "SCHEMA_VALIDATION"
        | "INTEGRITY_VALIDATION"
        | "NORMALIZATION"
        | "BOUNDARY_CONTRACT"
    >;
    readonly requiredValidations: ReadonlyArray<ExternalDataValidationKind>;
}

export function freezeExternalDataContract(
    contract: ExternalDataContract
): ExternalDataContract {
    return Object.freeze({
        ...contract,
        pipeline: Object.freeze([...contract.pipeline]),
        requiredValidations: Object.freeze([...contract.requiredValidations]),
    });
}
